import "./styles.css";
import { initializeApp } from "firebase/app";
import { screens } from "./screens";

const appRoot = document.querySelector("#app");
const siteAvatar = screens[0]?.portraitImage || screens[0]?.image || "/assets/foto-02.jpg";

function buildStageStyle(screen) {
  const styles = [];

  if (screen.backgroundImage) {
    styles.push(`--stage-image:url('${screen.backgroundImage}')`);
  }

  if (screen.backgroundPosition) {
    styles.push(`--stage-image-position:${screen.backgroundPosition}`);
  }

  return styles.length ? ` style="${styles.join(";")}"` : "";
}

function renderHorizontalPager(slides) {
  return `
    <div class="horizontal-pager" data-horizontal-pager>
      <div class="horizontal-pager-track" data-horizontal-track>
        ${slides
          .map(
            (slide, slideIndex) => `
              <article class="horizontal-page">
                <div class="horizontal-page-inner">
                  <p class="section-page-step">${String(slideIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}</p>
                  ${slide.code ? `<p class="content-code">${slide.code}</p>` : ""}
                  ${slide.kicker ? `<p class="section-page-kicker">${slide.kicker}</p>` : ""}
                  ${slide.title ? `<h2 class="section-page-title">${slide.title}</h2>` : ""}
                  ${slide.intro ? `<p class="section-page-intro">${slide.intro}</p>` : ""}
                  ${slide.body ? `<p class="section-page-body">${slide.body}</p>` : ""}
                  ${slide.support ? `<p class="section-page-support">${slide.support}</p>` : ""}
                  ${slide.chips?.length ? `<div class="section-chip-list">${slide.chips.map((item) => `<span>${item}</span>`).join("")}</div>` : ""}
                  ${slide.list?.length ? `<ul class="section-page-list">${slide.list.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
                </div>
              </article>
            `
          )
          .join("")}
      </div>

      <div class="horizontal-pager-controls">
        <button class="horizontal-pager-button" type="button" data-horizontal-prev>Voltar</button>
        <div class="horizontal-pager-dots">
          ${slides
            .map(
              (_, slideIndex) =>
                `<button class="horizontal-pager-dot" type="button" aria-label="Ir para pagina ${slideIndex + 1}" data-horizontal-dot="${slideIndex}"></button>`
            )
            .join("")}
        </div>
        <button class="horizontal-pager-button" type="button" data-horizontal-next>Avancar</button>
      </div>
    </div>
  `;
}

function buildIdentitySlides(screen) {
  return [
    {
      code: screen.code,
      title: screen.headline,
      intro: screen.blurb,
      body: screen.contentBody,
      chips: screen.bullets
    },
    {
      kicker: screen.contentTitle,
      title: "Porta de entrada",
      body: screen.identityLead,
      support: screen.details,
      list: screen.contentNotes
    },
    ...screen.identityMilestones.map((milestone) => ({
      kicker: milestone.year,
      title: milestone.title,
      body: milestone.body
    })),
    ...screen.identityPagerSlides.map((slide) => ({
      kicker: screen.identityPagerTitle,
      title: slide.title,
      body: slide.body
    })),
    {
      kicker: "Resumo",
      title: "Marcos do percurso",
      list: screen.identityHighlights
    }
  ];
}

function buildStandardSlides(screen) {
  return [
    {
      code: screen.code,
      title: screen.headline,
      intro: screen.blurb,
      chips: screen.bullets
    },
    {
      kicker: screen.contentTitle,
      title: screen.label,
      body: screen.contentBody,
      support: screen.details
    },
    {
      kicker: "Pontos de apoio",
      title: screen.kicker,
      body: screen.details,
      list: screen.contentNotes
    }
  ];
}

function buildAgentSlides(screen) {
  return [
    {
      code: screen.code,
      title: screen.headline,
      intro: screen.blurb,
      chips: screen.bullets
    },
    {
      kicker: screen.contentTitle,
      title: "Entrevista, retrieval e consolidacao",
      body: screen.contentBody,
      support: screen.profileSummary
    },
    {
      kicker: screen.reportTitle,
      title: screen.reportHeading,
      body: screen.reportNotice,
      list: screen.profileHighlights
    }
  ];
}

function renderIdentitySection(screen, index) {
  const stageStyle = buildStageStyle(screen);
  const slides = buildIdentitySlides(screen);
  return `
    <section class="content-stage identity-stage snap-panel" id="section-${screen.id}" data-screen-index="${index}"${stageStyle}>
      <div class="section-frame section-frame-identity">
        <div class="section-text-rail">
          ${renderHorizontalPager(slides)}
        </div>

        <aside class="identity-visual-rail">
          <figure class="identity-portrait-shell">
            <img src="${screen.portraitImage || screen.image}" alt="${screen.label}">
            <figcaption>${screen.portraitCaption || screen.label}</figcaption>
          </figure>

          <div class="identity-deck-shell" aria-label="Galeria de projetos historicos">
            <div class="identity-deck-intro">
              <p class="section-page-kicker">${screen.identityPagerTitle}</p>
              <p>${screen.identityPagerIntro}</p>
            </div>
            <div class="identity-deck">
              ${screen.identityDeck
                .map(
                  (item, itemIndex) => `
                    <figure class="identity-deck-card" style="--deck-index:${itemIndex}">
                      <img src="${item.src}" alt="${item.alt}">
                      <figcaption>${item.caption}</figcaption>
                    </figure>
                  `
                )
                .join("")}
            </div>
          </div>
        </aside>
      </div>
    </section>
  `;
}

function renderStandardSection(screen, index) {
  const stageStyle = buildStageStyle(screen);
  const slides = buildStandardSlides(screen);
  return `
    <section class="content-stage standard-stage snap-panel" id="section-${screen.id}" data-screen-index="${index}"${stageStyle}>
      <div class="section-frame section-frame-standard">
        <div class="section-text-rail">
          ${renderHorizontalPager(slides)}
        </div>

        <aside class="section-visual-rail">
          <figure class="section-visual-frame">
            <img src="${screen.image}" alt="${screen.label}">
            <figcaption>
              <span>${screen.label}</span>
              <small>${screen.kicker}</small>
            </figcaption>
          </figure>
        </aside>
      </div>
    </section>
  `;
}

function renderAgentSection(screen, index) {
  const stageStyle = buildStageStyle(screen);
  const slides = buildAgentSlides(screen);
  return `
    <section class="content-stage agent-stage snap-panel" id="section-${screen.id}" data-screen-index="${index}"${stageStyle}>
      <div class="section-frame section-frame-agent">
        <div class="section-text-rail section-text-rail-agent">
          ${renderHorizontalPager(slides)}
        </div>

        <aside class="agent-rail">
          <div class="agent-rail-meta">
            <a class="agent-profile-link" href="${screen.profilePath}" target="_blank" rel="noreferrer">
              Abrir markdown completo
            </a>
            <div class="agent-highlight-list">
              ${screen.profileHighlights.map((item) => `<span>${item}</span>`).join("")}
            </div>
          </div>

          <section class="agent-panel" aria-label="Agente Gemini sobre forma de trabalhar">
            <header class="agent-panel-head">
              <div>
                <p class="agent-card-kicker">${screen.kicker}</p>
                <h3>${screen.contentTitle}</h3>
              </div>
              <p class="agent-panel-copy">
                ${screen.agentPanelCopy}
              </p>
            </header>

            <div class="agent-messages" data-agent-messages aria-live="polite"></div>

            <div class="agent-quick-list">
              ${screen.quickPrompts
                .map(
                  (prompt) => `
                    <button class="agent-quick-button" type="button" data-agent-prompt="${prompt}">
                      ${prompt}
                    </button>
                  `
                )
                .join("")}
            </div>

            <form class="agent-form" data-agent-form>
              <label class="agent-label" for="agent-input">${screen.agentFormLabel}</label>
              <div class="agent-form-row">
                <textarea
                  id="agent-input"
                  class="agent-input"
                  data-agent-input
                  rows="4"
                  placeholder="${screen.agentPlaceholder}"
                ></textarea>
                <button class="agent-submit" data-agent-submit type="submit">Enviar</button>
              </div>
            </form>

            <p class="agent-status" data-agent-status></p>

            <section class="agent-report-card">
              <div class="agent-report-head">
                <div>
                  <p class="agent-card-kicker">${screen.reportTitle}</p>
                  <h3>${screen.reportHeading}</h3>
                </div>
                <button class="agent-export-button" type="button" data-agent-export>Exportar .md</button>
              </div>
              <div class="agent-report" data-agent-report></div>
              <p class="agent-report-note">${screen.reportNotice}</p>
            </section>
          </section>
        </aside>
      </div>
    </section>
  `;
}

appRoot.innerHTML = `
  <div class="page-shell" data-shell>
    <section class="menu-stage snap-panel" id="menu-stage">
      <div class="scene-host" data-scene-host></div>
      <div class="screen-noise"></div>
      <div class="screen-vignette"></div>

      <div class="menu-hud">
        <header class="logo-mark">
          <div class="logo-identity">
            <img class="logo-avatar" src="${siteAvatar}" alt="Avatar de Icaro Glauco">
            <div class="logo-copy-block">
              <span class="logo-kicker">white-paper / garage screen</span>
              <strong>ICARO GLAUCO</strong>
              <small>design, UX, requisitos, agentes e software autoral</small>
            </div>
          </div>
        </header>

        <section class="detail-dock">
          <div class="detail-head">
            <p class="detail-kicker">Current face</p>
            <p class="detail-code" data-detail-code></p>
            <h2 data-title></h2>
          </div>
          <p class="detail-copy" data-details></p>
          <ul class="detail-list" data-bullets></ul>
        </section>

        <aside class="menu-dock">
          <div class="menu-head">
            <p>main menu</p>
            <span>hover preview / click abre sessao</span>
          </div>
          <div class="menu-list">
            ${screens
              .map(
                (screen, index) => `
                  <button class="menu-button" data-screen-index="${index}" type="button">
                    <span class="menu-index">${String(index + 1).padStart(2, "0")}</span>
                    <span class="menu-copy">
                      <strong>${screen.label}</strong>
                      <small>${screen.kicker}</small>
                    </span>
                    <span class="menu-arrow"></span>
                  </button>
                `
              )
              .join("")}
          </div>
        </aside>

        <div class="scroll-callout">
          <span>scroll</span>
          <strong>snap vertical para as sessoes</strong>
        </div>
      </div>

      <div class="loading-card" data-loading>
        <span>loading safehouse</span>
        <strong>Montando garagem e hub 3D</strong>
      </div>
    </section>

    ${screens
      .map((screen, index) => {
        if (screen.kind === "agent") return renderAgentSection(screen, index);
        if (screen.kind === "identity") return renderIdentitySection(screen, index);
        return renderStandardSection(screen, index);
      })
      .join("")}
  </div>
`;

const pageShell = document.querySelector("[data-shell]");
const sceneHost = document.querySelector("[data-scene-host]");
const loadingCard = document.querySelector("[data-loading]");
const menuButtons = [...document.querySelectorAll(".menu-button")];
const contentSections = [...document.querySelectorAll(".content-stage")];
const snapPanels = [...document.querySelectorAll(".snap-panel")];
const detailCodeNode = document.querySelector("[data-detail-code]");
const titleNode = document.querySelector("[data-title]");
const detailsNode = document.querySelector("[data-details]");
const bulletsNode = document.querySelector("[data-bullets]");

const agentScreen = screens.find((screen) => screen.kind === "agent");
const agentMessagesNode = document.querySelector("[data-agent-messages]");
const agentForm = document.querySelector("[data-agent-form]");
const agentInput = document.querySelector("[data-agent-input]");
const agentSubmit = document.querySelector("[data-agent-submit]");
const agentStatus = document.querySelector("[data-agent-status]");
const agentReportNode = document.querySelector("[data-agent-report]");
const agentExportButton = document.querySelector("[data-agent-export]");
const agentQuickButtons = [...document.querySelectorAll("[data-agent-prompt]")];

let lockedIndex = 0;
let previewIndex = 0;
let sceneController = null;
let activePanelIndex = 0;
let wheelNavigationLocked = false;
let wheelDeltaBuffer = 0;
let panelUnlockTimeout = null;
let scrollAnimationFrame = null;

const PANEL_SCROLL_DURATION = 520;
const WHEEL_TRIGGER_DISTANCE = 20;

const agentState = {
  busy: false,
  history: []
};

const localInterviewTopics = [
  {
    id: "origem",
    keywords: ["origem", "infancia", "tecnico", "uesb", "led", "css3", "ensino medio", "webdesign"],
    summary:
      "Sua base aparece como uma combinacao antiga de estudo tecnico, curiosidade de pesquisador, webdesign, computacao grafica e prazer em linguagem de interface. Isso faz sua porta de entrada soar menos como curriculo e mais como formacao acumulada.",
    capture:
      "A origem do seu perfil esta na continuidade entre estudo, experimentacao e artefato visual, nao numa mudanca brusca de carreira.",
    question:
      "Qual episodio mais claramente transformou essa curiosidade tecnica inicial em direcao profissional de verdade?"
  },
  {
    id: "requisitos",
    keywords: ["requisito", "requisitos", "entrevista", "dados", "negocio", "semantic", "semantica", "oportunidade"],
    summary:
      "No seu caso, engenharia de requisitos aparece como leitura de negocio e de linguagem ao mesmo tempo. O valor nao esta so em listar funcionalidades, mas em separar ruido, entidades, contradicoes e oportunidade real.",
    capture:
      "Voce opera requisitos como recurso de projeto: nomeia o sistema antes de implementa-lo e usa IA para acelerar sintese sem abrir mao de criterio.",
    question:
      "Como voce costuma perceber que um pedido do cliente ainda esta mal formulado e precisa virar requisito de verdade?"
  },
  {
    id: "agentes",
    keywords: ["ia", "agente", "agentes", "chatgpt", "polimento", "responsabilidade", "llm"],
    summary:
      "Sua posicao sobre IA e madura: agentes escrevem, leem e sintetizam, mas a responsabilidade continua quantitativa em percepcao. Polimento, insistencia e criterio seguem sendo o centro da entrega.",
    capture:
      "Voce trata agentes como multiplicadores de capacidade, nao como substitutos de autoria, responsabilizacao ou refinamento.",
    question:
      "Qual habito seu mais diferencia um uso superficial de agentes de um uso realmente forte no seu processo?"
  },
  {
    id: "linguagens",
    keywords: ["ruby", "dsljs", "macro", "macros", "linguagem", "runtime", "electron", "glauco"],
    summary:
      "A pesquisa de linguagens no seu perfil nao e lateral. Ela se conecta diretamente com autoria, ergonomia, runtime local e desejo de reduzir atrito entre backend, frontend e produto solo.",
    capture:
      "Glauco Ruby e dsljs funcionam como laboratorio proprio de semantica, composicao e entrega, e mostram um perfil que pensa ferramenta junto com produto.",
    question:
      "O que o Glauco Ruby e o dsljs tentam resolver que voce sente faltar nas stacks mais comuns?"
  },
  {
    id: "engenharia",
    keywords: ["engenharia", "three", "threejs", "vite", "firebase", "arquitetura", "frontend"],
    summary:
      "Sua engenharia tende a juntar direcao visual forte com estrutura legivel. A stack entra como meio de comportamento e cena, nao apenas como checklist de tecnologia.",
    capture:
      "Existe uma tentativa constante de unir experiencia, arquitetura e continuidade de interface numa mesma decisao tecnica.",
    question:
      "Como voce equilibra ousadia visual com implementacao sustentavel quando esta tocando tudo sozinho?"
  },
  {
    id: "filosofia",
    keywords: ["filosofia", "melhor", "empreendedor", "solo", "mercado", "ux", "design"],
    summary:
      "No fechamento, seu perfil fica muito claro: fundamentos como apoio, ambicao como motor e vontade de construir algo util, bonito e economicamente interessante. Isso amarra design, UX, engenharia e negocio no mesmo corpo.",
    capture:
      "Seu posicionamento e de empreendedor solo autoral, com ambicao de excelencia e leitura ampla do mercado.",
    question:
      "Que tipo de projeto ou mercado mais combina com a assinatura que voce quer consolidar a partir daqui?"
  }
];

function renderBullets(items) {
  bulletsNode.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderHUD(index) {
  const screen = screens[index];
  detailCodeNode.textContent = screen.code;
  titleNode.textContent = screen.label;
  detailsNode.textContent = screen.details;
  renderBullets(screen.bullets);

  menuButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-preview", buttonIndex === previewIndex);
    button.classList.toggle("is-locked", buttonIndex === lockedIndex);
  });
}

function applyPreview(index) {
  previewIndex = index;
  renderHUD(index);
  sceneController?.focusScreen(index);
}

function easeInOutCubic(progress) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - ((-2 * progress + 2) ** 3) / 2;
}

function animateShellTo(targetTop) {
  if (scrollAnimationFrame) {
    window.cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = null;
  }

  const startTop = pageShell.scrollTop;
  const delta = targetTop - startTop;
  pageShell.classList.add("is-programmatic-scroll");

  if (Math.abs(delta) < 2) {
    pageShell.scrollTop = targetTop;
    pageShell.classList.remove("is-programmatic-scroll");
    return;
  }

  const startTime = window.performance.now();

  const step = (now) => {
    const progress = Math.min(1, (now - startTime) / PANEL_SCROLL_DURATION);
    const eased = easeInOutCubic(progress);
    pageShell.scrollTop = startTop + delta * eased;

    if (progress < 1) {
      scrollAnimationFrame = window.requestAnimationFrame(step);
      return;
    }

    pageShell.scrollTop = targetTop;
    scrollAnimationFrame = null;
    pageShell.classList.remove("is-programmatic-scroll");
  };

  scrollAnimationFrame = window.requestAnimationFrame(step);
}

function triggerPanelScroll(targetTop) {
  wheelNavigationLocked = true;
  animateShellTo(targetTop);

  if (panelUnlockTimeout) {
    window.clearTimeout(panelUnlockTimeout);
  }

  panelUnlockTimeout = window.setTimeout(() => {
    wheelNavigationLocked = false;
  }, PANEL_SCROLL_DURATION + 80);
}

function lockAndScroll(index) {
  lockedIndex = index;
  applyPreview(index);
  const target = pageShell.querySelector(`#section-${screens[index].id}`);
  if (!target) return;

  triggerPanelScroll(target.offsetTop);
}

function shouldIgnoreWheelNavigation(target) {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest(".agent-messages") ||
      target.closest(".agent-input") ||
      target.closest("textarea") ||
      target.closest("input") ||
      target.closest("select")
  );
}

function goToPanel(nextPanelIndex) {
  const boundedIndex = Math.max(0, Math.min(snapPanels.length - 1, nextPanelIndex));
  const targetPanel = snapPanels[boundedIndex];
  if (!targetPanel) return;

  triggerPanelScroll(targetPanel.offsetTop);
}

function setAgentStatus(message, isError = false) {
  if (!agentStatus) return;
  agentStatus.textContent = message;
  agentStatus.classList.toggle("is-error", isError);
}

function scrollAgentToBottom() {
  if (agentMessagesNode) {
    agentMessagesNode.scrollTop = agentMessagesNode.scrollHeight;
  }
}

function appendAgentMessage(role, text) {
  if (!agentMessagesNode) return;

  const message = document.createElement("article");
  message.className = `agent-message agent-message-${role}`;

  const kicker = document.createElement("span");
  kicker.className = "agent-message-kicker";
  kicker.textContent = role === "assistant" ? "Agent" : "Visitante";

  const bubble = document.createElement("div");
  bubble.className = "agent-message-bubble";
  bubble.textContent = text;

  message.append(kicker, bubble);
  agentMessagesNode.append(message);
  scrollAgentToBottom();
}

function setAgentBusy(nextBusy) {
  agentState.busy = nextBusy;

  if (agentInput) agentInput.disabled = nextBusy;
  if (agentSubmit) agentSubmit.disabled = nextBusy;
  agentQuickButtons.forEach((button) => {
    button.disabled = nextBusy;
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "");
}

function buildLocalInterviewReply(message) {
  const normalizedMessage = normalizeText(message);
  const userTurns = agentState.history.filter((entry) => entry.role === "user").length;
  const asksNextQuestion = /proxim|seguinte|continue|avanca|avancar|aprofund/.test(normalizedMessage);
  const matchedTopic =
    localInterviewTopics.find((topic) => topic.keywords.some((keyword) => normalizedMessage.includes(keyword))) ||
    localInterviewTopics[Math.min(Math.max(userTurns - 1, 0), localInterviewTopics.length - 1)] ||
    localInterviewTopics[0];
  const nextTopic =
    localInterviewTopics[Math.min(userTurns, localInterviewTopics.length - 1)] || localInterviewTopics[localInterviewTopics.length - 1];

  if (asksNextQuestion) {
    return [
      `Vamos aprofundar pelo eixo "${nextTopic.id}". ${nextTopic.summary}`,
      "",
      `Leitura provisoria: ${nextTopic.capture}`,
      "",
      `Proxima pergunta: ${nextTopic.question}`
    ].join("\n");
  }

  return [
    matchedTopic.summary,
    "",
    `Leitura que isso reforca no seu perfil: ${matchedTopic.capture}`,
    "",
    `Proxima pergunta: ${nextTopic.question}`
  ].join("\n");
}

function buildAgentReportData() {
  const userMessages = agentState.history.filter((entry) => entry.role === "user").map((entry) => entry.text.trim());
  const assistantMessages = agentState.history.filter((entry) => entry.role === "assistant").map((entry) => entry.text.trim());
  const latestUserMessage = userMessages[userMessages.length - 1] || "Conversa ainda nao iniciada.";
  const latestAssistantMessage =
    assistantMessages[assistantMessages.length - 1] || "Assim que a conversa comecar, esta area consolida eixo, leitura e proximo aprofundamento do perfil.";
  const scopeItems = userMessages.length
    ? userMessages.slice(-4)
    : [
        "Origem tecnica, estudo e formacao de linguagem.",
        "Requisitos, negocio, IA e responsabilidade.",
        "Tooling autoral, runtime e filosofia de trabalho."
      ];

  return {
    objective: latestUserMessage,
    scopeItems,
    agentSynthesis: latestAssistantMessage,
    nextSteps: [
      "Aprofundar o eixo mais promissor da trajetoria.",
      "Consolidar pontos recorrentes de metodo e posicionamento.",
      "Exportar o dossie em markdown para retrieval e apresentacao."
    ]
  };
}

function buildAgentReportMarkdown() {
  const data = buildAgentReportData();

  return [
    `# ${agentScreen?.reportHeading || "Dossie retriavel de perfil profissional"}`,
    "",
    "## Ultima entrada do visitante",
    data.objective,
    "",
    "## Pontos capturados na conversa",
    ...data.scopeItems.map((item) => `- ${item}`),
    "",
    "## Sintese do agente",
    data.agentSynthesis,
    "",
    "## Proximos passos sugeridos",
    ...data.nextSteps.map((item) => `- ${item}`),
    ""
  ].join("\n");
}

function renderAgentReport() {
  if (!agentReportNode) return;

  const data = buildAgentReportData();
  agentReportNode.innerHTML = `
    <article class="agent-report-section">
      <p class="agent-report-label">Ultima resposta</p>
      <p>${escapeHtml(data.objective)}</p>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Eixos capturados</p>
      <ul class="agent-report-list">
        ${data.scopeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Leitura do agente</p>
      <p>${escapeHtml(data.agentSynthesis)}</p>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Proximos aprofundamentos</p>
      <ul class="agent-report-list">
        ${data.nextSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `;
}

async function sendAgentMessage(rawMessage) {
  if (!agentScreen) return;

  const message = rawMessage.trim();
  if (!message || agentState.busy) return;

  const requestHistory = agentState.history.slice(-8);
  const userEntry = { role: "user", text: message };
  agentState.history.push(userEntry);
  appendAgentMessage("user", message);
  renderAgentReport();
  setAgentStatus("Consultando o agente...");
  setAgentBusy(true);

  try {
    if (agentScreen.agentStrategy === "local-interview") {
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      const reply = buildLocalInterviewReply(message);
      agentState.history.push({ role: "assistant", text: reply });
      appendAgentMessage("assistant", reply);
      renderAgentReport();
      setAgentStatus("Entrevista atualizada. Pode responder ou pedir o proximo aprofundamento.");
      return;
    }

    const response = await fetch(agentScreen.agentEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history: requestHistory
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Falha ao consultar o agente.");
    }

    const reply = String(payload.reply || "").trim();
    if (!reply) {
      throw new Error("O agente nao retornou texto.");
    }

    agentState.history.push({ role: "assistant", text: reply });
    appendAgentMessage("assistant", reply);
    renderAgentReport();
    setAgentStatus("Agente pronto para a proxima pergunta.");
  } catch (error) {
    if (agentState.history[agentState.history.length - 1] === userEntry) {
      agentState.history.pop();
    }
    renderAgentReport();
    const messageText = error instanceof Error ? error.message : "Falha ao consultar o agente.";
    appendAgentMessage("assistant", "Nao consegui responder agora. Tente novamente em alguns segundos.");
    setAgentStatus(messageText, true);
  } finally {
    setAgentBusy(false);
    if (agentInput) {
      agentInput.focus();
    }
  }
}

function setupAgentPanel() {
  if (!agentScreen || !agentMessagesNode) return;

  appendAgentMessage("assistant", agentScreen.agentGreeting);
  agentState.history.push({ role: "assistant", text: agentScreen.agentGreeting });
  renderAgentReport();
  setAgentStatus("A conversa ja alimenta um dossie retriavel abaixo.");

  if (agentForm && agentInput) {
    agentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = agentInput.value;
      agentInput.value = "";
      sendAgentMessage(message);
    });

    agentInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        agentForm.requestSubmit();
      }
    });
  }

  agentQuickButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = button.dataset.agentPrompt || "";
      sendAgentMessage(prompt);
    });
  });

  agentExportButton?.addEventListener("click", () => {
    const report = buildAgentReportMarkdown();
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = agentScreen.reportFilename || "icaro-glauco-dossie-retrieval.md";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function setupHorizontalPagers() {
  const pagers = [...document.querySelectorAll("[data-horizontal-pager]")];

  pagers.forEach((pager) => {
    const track = pager.querySelector("[data-horizontal-track]");
    const prevButton = pager.querySelector("[data-horizontal-prev]");
    const nextButton = pager.querySelector("[data-horizontal-next]");
    const dots = [...pager.querySelectorAll("[data-horizontal-dot]")];

    if (!track) return;

    const getPageWidth = () => track.clientWidth;

    const syncDots = () => {
      const width = getPageWidth() || 1;
      const activeIndex = Math.round(track.scrollLeft / width);
      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });
      if (prevButton) prevButton.disabled = activeIndex <= 0;
      if (nextButton) nextButton.disabled = activeIndex >= dots.length - 1;
    };

    const goTo = (index) => {
      track.scrollTo({
        left: getPageWidth() * index,
        behavior: "smooth"
      });
    };

    prevButton?.addEventListener("click", () => {
      const activeIndex = Math.round(track.scrollLeft / (getPageWidth() || 1));
      goTo(Math.max(0, activeIndex - 1));
    });

    nextButton?.addEventListener("click", () => {
      const activeIndex = Math.round(track.scrollLeft / (getPageWidth() || 1));
      goTo(Math.min(dots.length - 1, activeIndex + 1));
    });

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => goTo(index));
    });

    track.addEventListener("scroll", () => {
      window.requestAnimationFrame(syncDots);
    });

    window.addEventListener("resize", syncDots);
    syncDots();
  });
}

menuButtons.forEach((button) => {
  const index = Number(button.dataset.screenIndex);

  button.addEventListener("mouseenter", () => applyPreview(index));
  button.addEventListener("focus", () => applyPreview(index));
  button.addEventListener("mouseleave", () => applyPreview(lockedIndex));
  button.addEventListener("blur", () => applyPreview(lockedIndex));
  button.addEventListener("click", () => lockAndScroll(index));
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const nextIndex = Number(visible.target.dataset.screenIndex);
    if (!Number.isNaN(nextIndex) && nextIndex !== lockedIndex) {
      lockedIndex = nextIndex;
      applyPreview(nextIndex);
    }
  },
  {
    root: pageShell,
    threshold: [0.55, 0.75]
  }
);

contentSections.forEach((section) => observer.observe(section));

snapPanels.forEach((panel, index) => {
  panel.dataset.panelIndex = String(index);
});

const panelObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const nextPanelIndex = Number(visible.target.dataset.panelIndex);
    if (!Number.isNaN(nextPanelIndex)) {
      activePanelIndex = nextPanelIndex;
    }
  },
  {
    root: pageShell,
    threshold: [0.55, 0.72]
  }
);

snapPanels.forEach((panel) => panelObserver.observe(panel));

pageShell.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey || shouldIgnoreWheelNavigation(event.target)) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    wheelDeltaBuffer += event.deltaY;

    if (wheelNavigationLocked || Math.abs(wheelDeltaBuffer) < WHEEL_TRIGGER_DISTANCE) {
      event.preventDefault();
      return;
    }

    const direction = Math.sign(wheelDeltaBuffer);
    wheelDeltaBuffer = 0;
    event.preventDefault();
    goToPanel(activePanelIndex + direction);
  },
  { passive: false }
);

pageShell.addEventListener("scroll", () => {
  wheelDeltaBuffer = 0;
});

renderHUD(0);
setupAgentPanel();
setupHorizontalPagers();

async function init() {
  const { createScene } = await import("./scene");
  sceneController = await createScene({ mount: sceneHost, screens });
  sceneController.focusScreen(0);
  loadingCard.classList.add("is-hidden");
}

init().catch(() => {
  loadingCard.innerHTML = `
    <span>scene error</span>
    <strong>Nao foi possivel carregar a cena 3D</strong>
  `;
});

const firebaseConfig = {
  apiKey: "AIzaSyDDSnUqmxZDGFpY_KJ3eMX7vjrl8Vu-CCY",
  authDomain: "icaroglaucoonline-f1c88.firebaseapp.com",
  databaseURL: "https://icaroglaucoonline-f1c88-default-rtdb.firebaseio.com",
  projectId: "icaroglaucoonline-f1c88",
  storageBucket: "icaroglaucoonline-f1c88.firebasestorage.app",
  messagingSenderId: "918102798804",
  appId: "1:918102798804:web:b75d8bd4f7dc6d5dbe2641",
  measurementId: "G-2GHMV3HWM4"
};

const app = initializeApp(firebaseConfig);

import("firebase/analytics")
  .then(({ getAnalytics, isSupported }) => isSupported().then((supported) => ({ getAnalytics, supported })))
  .then(({ getAnalytics, supported }) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {
    // Analytics is optional in this menu-screen build.
  });
