const fs = require("node:fs");
const path = require("node:path");

const logger = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const workstyleProfile = fs.readFileSync(path.join(__dirname, "prompts", "icaro-workstyle.md"), "utf8");

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-8)
    .map((entry) => {
      const role = entry?.role === "assistant" ? "model" : "user";
      const text = String(entry?.text || "").trim();

      if (!text) return null;

      return {
        role,
        parts: [{ text }]
      };
    })
    .filter(Boolean);
}

function extractReply(payload) {
  return (
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("\n")
      .trim() || ""
  );
}

exports.agentChat = onRequest(
  {
    secrets: [geminiApiKey],
    timeoutSeconds: 60,
    memory: "256MiB"
  },
  async (req, res) => {
    res.set("Cache-Control", "no-store");

    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Headers", "Content-Type");
      res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Metodo nao permitido." });
      return;
    }

    const message = String(req.body?.message || "").trim();
    const history = normalizeHistory(req.body?.history);

    if (!message) {
      res.status(400).json({ error: "A mensagem nao pode estar vazia." });
      return;
    }

    const systemInstruction = [
      "Voce e um agente que conversa com visitantes sobre a forma de trabalhar de Icaro Glauco.",
      "Baseie suas respostas somente no perfil abaixo e na conversa atual.",
      "Fale em portugues do Brasil, de forma direta, clara e densa.",
      "Priorize metodo, criterio, processo, estilo de colaboracao e uso de chats como ferramenta de planejamento.",
      "Nao invente fatos biograficos, cargos, clientes ou historicos nao sustentados no perfil.",
      "Quando algo depender de inferencia, seja prudente e nao trate inferencias como fato.",
      "",
      workstyleProfile
    ].join("\n");

    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey.value()
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            ...history,
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: {
            temperature: 0.72,
            topP: 0.9,
            maxOutputTokens: 700
          }
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        logger.error("Gemini request failed", payload);
        res.status(502).json({
          error: payload?.error?.message || "Falha ao consultar o Gemini."
        });
        return;
      }

      const reply = extractReply(payload);

      if (!reply) {
        logger.error("Gemini reply was empty", payload);
        res.status(502).json({ error: "O Gemini nao retornou uma resposta valida." });
        return;
      }

      res.json({
        reply,
        model: "gemini-2.5-flash"
      });
    } catch (error) {
      logger.error("Unhandled agentChat error", error);
      res.status(500).json({ error: "Erro interno ao consultar o agente." });
    }
  }
);
