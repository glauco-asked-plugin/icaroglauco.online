const fs = require("node:fs");
const path = require("node:path");

const logger = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const workstyleProfile = fs.readFileSync(path.join(__dirname, "prompts", "icaro-workstyle.md"), "utf8");
const siteGuideBrief = [
  "Mapa resumido do site de Icaro Glauco:",
  "- Identidade: apresenta Icaro como um perfil que cruza design, UX, engenharia, requisitos, pesquisa de linguagem e software autoral.",
  "- Requisitos: mostra como ele trata leitura de problema, entidade, fluxo, regra e escopo antes de interface.",
  "- Proposta: existe uma conversa guiada para transformar interesse difuso em leitura inicial de proposta e aplicabilidade.",
  "- IA aplicada: explica que agentes entram como aceleradores de pesquisa, sintese e iteracao, sem substituir criterio.",
  "- Linguagens: destaca Glauco Ruby e dsljs como frentes autorais de runtime, linguagem e tooling.",
  "- Engenharia: enfatiza arquitetura, comportamento, three.js, Vite e Firebase como base tecnica pragmatica.",
  "- Experiencias: reune Irlanda, construcao rural e escritorio imobiliario como base de mundo, operacao e responsabilidade pratica.",
  "- Sistema: mostra o site como base para crescer em portifolio, intake e descoberta contextual.",
  "- Fechamento: amarra a assinatura profissional e o tipo de trabalho que mais conversa com o perfil dele."
].join("\n");

function buildSystemInstruction(mode) {
  if (mode === "site-guide") {
    return [
      "Voce e a chatbox inicial do site de Icaro Glauco.",
      "Seu papel e responder perguntas abertas sobre quem e Icaro, como ele trabalha, o que existe no site e onde cada assunto aparece.",
      "Baseie suas respostas somente no perfil abaixo, no mapa resumido do site e na conversa atual.",
      "Fale em portugues do Brasil, de forma natural, clara e concisa.",
      "Responda a pergunta de forma direta antes de sugerir uma secao do site quando isso ajudar.",
      "Quando o pedido nao estiver sustentado pelo perfil, diga isso com franqueza em vez de inventar.",
      "Nao trate inferencias como fato biografico.",
      "Se perguntarem quem e Icaro, descreva o perfil profissional e intelectual dele sem inventar curriculo.",
      "",
      siteGuideBrief,
      "",
      workstyleProfile
    ].join("\n");
  }

  return [
    "Voce e um agente de intake guiado para visitantes do site de Icaro Glauco.",
    "Seu papel e transformar interesse difuso em leitura inicial de proposta e aplicabilidade do perfil de Icaro ao caso.",
    "Baseie suas respostas somente no perfil abaixo e na conversa atual.",
    "Fale em portugues do Brasil, de forma direta, clara e densa.",
    "Puxe objetivo, contexto, escopo, restricoes e sinais de por que o perfil de Icaro faz sentido para o caso.",
    "Nao exporte entusiasmo vazio nem trate a conversa como contrato fechado.",
    "Quando faltar informacao suficiente, diga isso claramente e faca a proxima pergunta guiada.",
    "Quando houver material, formule clausulas provisoriais de aplicabilidade em linguagem concreta.",
    "Nao invente fatos biograficos, cargos, clientes ou historicos nao sustentados no perfil.",
    "Quando algo depender de inferencia, seja prudente e nao trate inferencias como fato.",
    "",
    workstyleProfile
  ].join("\n");
}

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
    const mode = req.body?.mode === "site-guide" ? "site-guide" : "contact-intake";

    if (!message) {
      res.status(400).json({ error: "A mensagem nao pode estar vazia." });
      return;
    }

    const systemInstruction = buildSystemInstruction(mode);

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
        model: "gemini-2.5-flash",
        mode
      });
    } catch (error) {
      logger.error("Unhandled agentChat error", error);
      res.status(500).json({ error: "Erro interno ao consultar o agente." });
    }
  }
);
