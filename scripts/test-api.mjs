import assert from "node:assert/strict";

process.env.NVIDIA_API_KEY = "nvapi-test";
process.env.NVIDIA_MODEL = "meta/llama-3.3-70b-instruct";
process.env.ALLOWED_ORIGINS = "http://localhost:3000";

const originalFetch = globalThis.fetch;
globalThis.fetch = async (url, options) => {
  assert.equal(String(url), "https://integrate.api.nvidia.com/v1/chat/completions");
  assert.equal(options.method, "POST");
  assert.match(options.headers.Authorization, /^Bearer /);

  const requestBody = JSON.parse(options.body);
  assert.match(requestBody.messages[0].content, /complete subject profile/i);
  assert.match(requestBody.messages[0].content, /Isocon Licitações Inteligentes/);

  return Response.json({
    choices: [
      {
        message: {
          content: JSON.stringify({
            answer: "Live grounded profile answer.",
            card: {
              kind: "person-profile",
              subjectId: "profile/icaro-glauco",
              monogram: "IG",
              eyebrow: "Professional profile",
              title: "Icaro Glauco",
              subtitle: "Wizard of Transformation",
              status: "Selected projects",
              domain: "Product architecture",
              phase: "One flagship and two active systems",
              summary: "Validated structured profile.",
              tone: "emerald",
              layout: "profile",
              badges: ["OKF"],
              facts: [{ label: "Projects", value: "3", detail: "active portfolio" }],
              sections: [
                { type: "quote", heading: "Thesis", body: "Transformation is a method.", items: [] },
                { type: "evidence", heading: "Evidence", body: "", items: ["Grounded"] }
              ],
              actions: [{ label: "GitHub", href: "https://github.com/glaucodeveloper", kind: "primary" }]
            },
            sources: ["okf://profile/icaro-glauco"]
          })
        }
      }
    ]
  });
};

try {
  const { POST } = await import("../api/wizard-chat.js");
  const response = await POST(
    new Request("http://localhost:3000/api/wizard-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000"
      },
      body: JSON.stringify({ message: "Who is Icaro?", questionId: "profile", history: [] })
    })
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.mode, "live-nvidia");
  assert.equal(payload.card.kind, "person-profile");
  assert.equal(payload.card.title, "Icaro Glauco");
  assert.deepEqual(payload.sources, ["okf://profile/icaro-glauco"]);
  console.log("Vercel API profile contract test passed.");
} finally {
  globalThis.fetch = originalFetch;
}
