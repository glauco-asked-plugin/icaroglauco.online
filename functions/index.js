const fs = require("node:fs");
const path = require("node:path");

const logger = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const nvidiaApiKey = defineSecret("NVIDIA_API_KEY");
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const MAX_MESSAGE_LENGTH = 1200;
const requestWindows = new Map();

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "okf", relativePath), "utf8")
  );
}

const designSystem = fs.readFileSync(
  path.join(__dirname, "prompts", "modal-design-system.txt"),
  "utf8"
);

const manifest = readJson("manifest.json");
const profile = readJson(manifest.profile);
const questionsDocument = readJson(manifest.questions);
const projects = manifest.projects.map(readJson);

function cleanText(value, maxLength = MAX_MESSAGE_LENGTH) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(-8)
    .map((entry) => {
      const role = entry?.role === "assistant" ? "assistant" : "user";
      const content = cleanText(entry?.content, 900);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

function findQuestion(questionId) {
  return questionsDocument.items.find((question) => question.id === questionId) || null;
}

function selectKnowledge(question, message) {
  if (question?.project && question.project !== "all") {
    if (question.project.startsWith("profile/")) {
      return { profile, projects: [] };
    }

    const project = projects.find((entry) => entry.id === question.project);
    return { profile, projects: project ? [project] : projects };
  }

  const lower = message.toLowerCase();
  const selected = projects.filter((project) => {
    const haystack = [
      project.id,
      project.name,
      project.domain
    ].join(" ").toLowerCase();

    return haystack
      .split(/\s+/)
      .some((token) => token.length > 4 && lower.includes(token));
  });

  return {
    profile,
    projects: selected.length ? selected : projects
  };
}

function buildGrounding(question, message) {
  const selected = selectKnowledge(question, message);

  return JSON.stringify(
    {
      manifest: {
        okf: manifest.okf,
        id: manifest.id,
        title: manifest.title,
        rules: manifest.rules
      },
      profile: selected.profile,
      projects: selected.projects,
      selectedQuestion: question
        ? {
            id: question.id,
            label: question.label,
            prompt: question.prompt
          }
        : null
    },
    null,
    2
  );
}

function parseJsonObject(raw) {
  const text = cleanText(raw, 30000)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first < 0 || last <= first) {
    throw new Error("Model output did not contain a JSON object.");
  }

  return JSON.parse(text.slice(first, last + 1));
}

function safeArray(value, limit = 8) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, limit);
}

function normalizeModelPayload(payload, rawText) {
  const card = payload?.card || {};
  const allowedTones = new Set(["emerald", "amber", "violet", "cyan", "neutral"]);
  const allowedLayouts = new Set(["editorial", "split", "timeline", "architecture", "comparison"]);
  const allowedTypes = new Set(["paragraph", "list", "metrics", "flow", "quote", "comparison"]);

  return {
    answer: cleanText(payload?.answer || rawText, 5000),
    card: {
      eyebrow: cleanText(card.eyebrow || "Project knowledge", 120),
      title: cleanText(card.title || "Structured answer", 180),
      summary: cleanText(card.summary || "", 700),
      tone: allowedTones.has(card.tone) ? card.tone : "emerald",
      layout: allowedLayouts.has(card.layout) ? card.layout : "editorial",
      badges: safeArray(card.badges, 8).map((item) => cleanText(item, 60)).filter(Boolean),
      sections: safeArray(card.sections, 8).map((section) => ({
        type: allowedTypes.has(section?.type) ? section.type : "paragraph",
        heading: cleanText(section?.heading, 120),
        body: cleanText(section?.body, 1800),
        items: safeArray(section?.items, 12).map((item) => {
          if (typeof item === "string") return cleanText(item, 400);

          return {
            label: cleanText(item?.label, 100),
            value: cleanText(item?.value, 500),
            detail: cleanText(item?.detail, 500)
          };
        })
      })),
      actions: safeArray(card.actions, 3)
        .map((action) => ({
          label: cleanText(action?.label, 80),
          href: /^https:\/\//i.test(cleanText(action?.href, 500))
            ? cleanText(action.href, 500)
            : ""
        }))
        .filter((action) => action.label && action.href)
    },
    sources: safeArray(payload?.sources, 8)
      .map((source) => cleanText(source, 180))
      .filter((source) => source.startsWith("okf://"))
  };
}

function rateLimitKey(req) {
  return cleanText(
    req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.ip ||
      "anonymous",
    120
  );
}

function consumeRateLimit(req) {
  const key = rateLimitKey(req);
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 24;
  const current = requestWindows.get(key);

  if (!current || now - current.startedAt > windowMs) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return true;
  }

  current.count += 1;
  return current.count <= maxRequests;
}

exports.wizardChat = onRequest(
  {
    secrets: [nvidiaApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
    cors: true
  },
  async (req, res) => {
    res.set("Cache-Control", "no-store");

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    if (!consumeRateLimit(req)) {
      res.status(429).json({ error: "Too many requests. Try again later." });
      return;
    }

    const message = cleanText(req.body?.message);
    const questionId = cleanText(req.body?.questionId, 80);
    const question = questionId ? findQuestion(questionId) : null;
    const history = normalizeHistory(req.body?.history);

    if (!message) {
      res.status(400).json({ error: "A question is required." });
      return;
    }

    const key = nvidiaApiKey.value() || process.env.NVIDIA_API_KEY;

    if (!key) {
      res.status(503).json({
        error: "NVIDIA_API_KEY is not configured on the server."
      });
      return;
    }

    const model =
      process.env.NVIDIA_MODEL ||
      process.env.WIZARD_MODEL ||
      DEFAULT_MODEL;

    const grounding = buildGrounding(question, message);

    const messages = [
      {
        role: "system",
        content: `${designSystem}\n\nPUBLIC OKF GROUNDING:\n${grounding}`
      },
      ...history,
      {
        role: "user",
        content: question?.prompt
          ? `${question.prompt}\n\nVisitor wording: ${message}`
          : message
      }
    ];

    try {
      const response = await fetch(NVIDIA_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: model === "openai/gpt-oss-20b" ? 0.35 : 0.2,
          top_p: 0.8,
          max_tokens: 1800,
          stream: false
        })
      });

      const apiPayload = await response.json().catch(() => null);

      if (!response.ok) {
        logger.error("NVIDIA request failed", {
          status: response.status,
          payload: apiPayload
        });

        res.status(502).json({
          error:
            apiPayload?.detail ||
            apiPayload?.error?.message ||
            "The NVIDIA model request failed."
        });
        return;
      }

      const messagePayload = apiPayload?.choices?.[0]?.message;
      const rawText =
        messagePayload?.content ||
        messagePayload?.reasoning_content ||
        "";

      const parsed = parseJsonObject(rawText);
      const output = normalizeModelPayload(parsed, rawText);

      res.json({
        ...output,
        model,
        okfVersion: manifest.okf
      });
    } catch (error) {
      logger.error("wizardChat failed", error);
      res.status(500).json({
        error: "Unable to compose the designed answer."
      });
    }
  }
);
