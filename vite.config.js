import { defineConfig, loadEnv } from "vite";
import fs from "node:fs";
import path from "node:path";
import {
  stripMacrosBlock,
  parseMacrosFromBlock,
  expandMacros
} from "dsljs";

const PREFIX = "\0dsljs:";
const workstyleProfile = fs.readFileSync(path.resolve("functions", "prompts", "icaro-workstyle.md"), "utf8");
const siteGuideBrief = [
  "Mapa resumido do site de Icaro Glauco:",
  "- Identidade: apresenta Icaro como um perfil que cruza design, UX, engenharia, requisitos, pesquisa de linguagem e software autoral.",
  "- Requisitos: mostra como ele trata leitura de problema, entidade, fluxo, regra e escopo antes de interface.",
  "- Proposta: existe uma conversa guiada para transformar interesse difuso em leitura inicial de proposta e aplicabilidade.",
  "- IA aplicada: explica que agentes entram como aceleradores de pesquisa, sintese e iteracao, sem substituir criterio.",
  "- Linguagens: destaca Glauco Ruby e dsljs como frentes autorais de runtime, linguagem e tooling.",
  "- Engenharia: enfatiza arquitetura, comportamento, three.js, Vite e Firebase como base tecnica pragmatica.",
  "- Experiencias: reune Irlanda, construcao rural e escritorio imobiliario como base de mundo, operacao e responsabilidade pratica.",
  "- Sistema: mostra o site como base para crescer em portfolio, intake e descoberta contextual.",
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

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function writeJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.end(JSON.stringify(payload));
}

function createLocalAgentApiPlugin(geminiApiKey) {
  return {
    name: "local-agent-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/agent-chat")) {
          next();
          return;
        }

        if (req.method === "OPTIONS") {
          writeJson(res, 204, {});
          return;
        }

        if (req.method !== "POST") {
          writeJson(res, 405, { error: "Metodo nao permitido." });
          return;
        }

        if (!geminiApiKey) {
          writeJson(res, 500, {
            error: "GEMINI_API_KEY ausente no ambiente local do Vite. Defina a variavel e reinicie o servidor."
          });
          return;
        }

        try {
          const body = await readJsonBody(req);
          const message = String(body?.message || "").trim();
          const history = normalizeHistory(body?.history);
          const mode = body?.mode === "site-guide" ? "site-guide" : "contact-intake";

          if (!message) {
            writeJson(res, 400, { error: "A mensagem nao pode estar vazia." });
            return;
          }

          const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": geminiApiKey
            },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: buildSystemInstruction(mode) }]
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

          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            writeJson(res, 502, {
              error: payload?.error?.message || "Falha ao consultar o Gemini."
            });
            return;
          }

          const reply = extractReply(payload);
          if (!reply) {
            writeJson(res, 502, { error: "O Gemini nao retornou uma resposta valida." });
            return;
          }

          writeJson(res, 200, {
            reply,
            model: "gemini-2.5-flash",
            mode,
            source: "vite-local"
          });
        } catch (error) {
          writeJson(res, 500, {
            error: error instanceof Error ? error.message : "Erro interno no endpoint local."
          });
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const geminiApiKey =
    env.GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    "";

  return {
    plugins: [
      {
        name: "dsljs",
        enforce: "pre",

        resolveId(id, importer) {
          if (id.startsWith(PREFIX)) return id;
          if (!id.endsWith(".dsljs")) return null;

          const base = importer && importer.startsWith(PREFIX)
            ? importer.slice(PREFIX.length)
            : importer;

          const resolved = base
            ? path.resolve(path.dirname(base), id)
            : path.resolve(id);

          return PREFIX + resolved;
        },

        load(id) {
          if (!id.startsWith(PREFIX)) return null;

          const realPath = id.slice(PREFIX.length);
          if (realPath.includes("dsljs:") || realPath.includes("\0")) {
            throw new Error("[DSLJS] path corrompido: " + realPath);
          }

          const source = fs.readFileSync(realPath, "utf8");
          const { macrosBlock, output: code } = stripMacrosBlock(source);
          const macros = parseMacrosFromBlock(macrosBlock);
          const expanded = expandMacros(code, macros);

          return expanded;
        }
      },
      createLocalAgentApiPlugin(geminiApiKey)
    ]
  };
});
