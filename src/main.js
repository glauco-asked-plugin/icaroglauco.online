import "./styles.css";
import { initializeApp } from "firebase/app";
import { screens } from "./screens";

const generatedPortfolioApplication = globalThis.__PORTFOLIO_APPLICATION__ || null;
const generatedLayouts = generatedPortfolioApplication?.layouts?.() || {};
const generatedAssistant = generatedPortfolioApplication?.assistant?.() || {};
const generatedComponents = globalThis.__PORTFOLIO_COMPONENTS__ || {};
const runtimeAgentEndpoint = import.meta.env.VITE_AGENT_ENDPOINT || "/api/agent-chat";

const appRoot = document.querySelector("#app");
const siteAvatar = screens[0]?.portraitImage || screens[0]?.image || "/assets/foto-02.jpg";
const identityScreen = screens.find((screen) => screen.kind === "identity") || screens[0];

function resolveSectionLayout(screen) {
  return (
    generatedLayouts[screen.id] ||
    (screen.kind === "identity" ? "identity-editorial" : screen.kind === "agent" ? "contact-intake" : "technical-pager")
  );
}

function buildStageClasses(screen, index, kind = "") {
  const sideClass = index % 2 === 0 ? "is-card-left" : "is-card-right";
  const layoutClass = `layout-${resolveSectionLayout(screen)}`;
  return [sideClass, kind ? `kind-${kind}` : "", layoutClass].filter(Boolean).join(" ");
}

function renderContentBackdrop() {
  const initialImage = identityScreen?.backgroundImage || identityScreen?.image || identityScreen?.portraitImage || "/assets/foto-06.jpg";

  return `
    <div class="content-backdrop" data-content-backdrop data-backdrop-mode="gallery" aria-hidden="true">
      <div class="content-backdrop-single">
        <img
          class="content-backdrop-image"
          data-content-backdrop-image
          src="${initialImage}"
          alt=""
          style="object-position:center center"
        >
      </div>

      <div class="content-backdrop-gallery" data-content-backdrop-gallery>
        ${(identityScreen?.identityDeck || [])
          .map(
            (item, itemIndex) => `
              <img
                class="content-backdrop-gallery-image"
                src="${item.src}"
                alt=""
                style="--gallery-index:${itemIndex}"
              >
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderMenuButton(screen, index) {
  if (typeof generatedComponents.renderMenuButton === "function") {
    return generatedComponents.renderMenuButton(screen, index);
  }

  return `
    <button class="menu-button" data-screen-index="${index}" type="button">
      <span class="menu-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="menu-copy">
        <strong>${screen.label}</strong>
        <small>${screen.kicker}</small>
      </span>
      <span class="menu-arrow"></span>
    </button>
  `;
}

function renderHorizontalPager(screen, slides) {
  return `
    <div class="horizontal-pager-shell">
      <header class="horizontal-pager-header">
        <p class="content-code">${screen.code}</p>
        <p class="section-page-kicker">${screen.kicker}</p>
        <h2 class="section-page-title">${screen.headline}</h2>
      </header>

      <div class="horizontal-pager">
        <div class="horizontal-pager-body">
          <p class="horizontal-pager-intro">
            Leitura em sequência horizontal, organizada em blocos editoriais de título e desenvolvimento.
          </p>

          <div class="horizontal-pager-track">
            ${slides
              .map(
                (slide) => `
                  <article class="horizontal-page" data-page-label="${slide.label ? slide.label.replaceAll('"', "&quot;") : ""}">
                    <div class="horizontal-page-inner">
                      <div class="horizontal-content-pair">
                        <div class="horizontal-content-head">
                          <p class="horizontal-content-kicker">${slide.label || "Bloco"}</p>
                          <h3 class="horizontal-content-title">${slide.title || slide.intro || slide.label || "Leitura"}</h3>
                        </div>

                        <div class="horizontal-content-text">
                          ${
                            slide.intro && slide.title
                              ? `<div class="horizontal-content-copy is-lead"><p class="section-page-intro">${slide.intro}</p></div>`
                              : ""
                          }
                          ${slide.body ? `<div class="horizontal-content-copy"><p class="section-page-body">${slide.body}</p></div>` : ""}
                          ${slide.support ? `<div class="horizontal-content-copy is-support"><p class="section-page-support">${slide.support}</p></div>` : ""}
                          ${
                            slide.chips?.length
                              ? `
                                <section class="horizontal-content-copy">
                                  <p class="section-attribute-label">Atributos</p>
                                  <div class="section-chip-list">${slide.chips.map((item) => `<span>${item}</span>`).join("")}</div>
                                </section>
                              `
                              : ""
                          }
                          ${
                            slide.list?.length
                              ? `
                                <section class="horizontal-content-copy">
                                  <p class="section-attribute-label">Leituras complementares</p>
                                  <ul class="section-page-list">${slide.list.map((item) => `<li>${item}</li>`).join("")}</ul>
                                </section>
                              `
                              : ""
                          }
                        </div>
                      </div>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </div>

      </div>
    </div>
  `;
}

function buildIdentitySlides(screen) {
  return [
    {
      label: "Abertura",
      title: "Base editorial",
      intro: screen.blurb,
      body: screen.details,
      support: screen.identityLead,
      chips: screen.bullets
    },
    {
      label: screen.contentTitle,
      title: screen.contentTitle,
      body: screen.contentBody,
      list: screen.contentNotes
    },
    ...(screen.deepDives || []).map((item) => ({
      label: item.kicker,
      title: item.title,
      body: item.body,
      list: item.list
    })),
    ...screen.identityMilestones.map((milestone) => ({
      label: milestone.year,
      title: milestone.title,
      body: milestone.body
    })),
    {
      label: screen.identityPagerTitle,
      title: "Projetos que entram no pano de fundo",
      body: screen.identityPagerIntro
    },
    ...screen.identityPagerSlides.map((slide) => ({
      label: screen.identityPagerTitle,
      title: slide.title,
      body: slide.body
    })),
    {
      label: "Resumo",
      title: "Marcos do percurso",
      list: screen.identityHighlights
    }
  ];
}

function buildStandardSlides(screen) {
  return [
    {
      label: "Abertura",
      title: "Leitura inicial",
      intro: screen.blurb,
      body: screen.details,
      chips: screen.bullets
    },
    {
      label: screen.contentTitle,
      title: screen.contentTitle,
      body: screen.contentBody,
      list: screen.contentNotes
    },
    ...(screen.deepDives || []).map((item) => ({
      label: item.kicker,
      title: item.title,
      body: item.body,
      list: item.list
    })),
    {
      label: "Sintese",
      title: "O valor pratico desta frente",
      body: "Aqui eu transformo leitura em decisão acionável, para que o projeto avance com menos ruído, menos retrabalho e mais precisão.",
      chips: screen.bullets,
      list: screen.contentNotes
    }
  ];
}

function buildAgentSlides(screen) {
  return [
    {
      label: "Abertura",
      title: "Triagem inicial",
      intro: screen.blurb,
      body: screen.details,
      support: screen.contentBody,
      chips: screen.bullets
    },
    {
      label: screen.contentTitle,
      title: screen.contentTitle,
      body: screen.contentBody,
      support: screen.profileSummary,
      list: screen.contentNotes
    },
    ...(screen.deepDives || []).map((item) => ({
      label: item.kicker,
      title: item.title,
      body: item.body,
      list: item.list
    })),
    {
      label: screen.reportTitle,
      title: screen.reportHeading,
      body: screen.reportNotice,
      list: screen.profileHighlights
    }
  ];
}

function renderIdentitySection(screen, index) {
  const slides = buildIdentitySlides(screen);
  return `
    <section class="content-stage identity-stage ${buildStageClasses(screen, index, screen.kind)}" id="section-${screen.id}" data-screen-index="${index}" data-content-panel>
      <div class="section-frame section-frame-identity">
        <div class="section-text-rail">
          ${renderHorizontalPager(screen, slides)}
        </div>
      </div>
    </section>
  `;
}

function renderStandardSection(screen, index) {
  const slides = buildStandardSlides(screen);
  return `
    <section class="content-stage standard-stage ${buildStageClasses(screen, index, screen.kind)}" id="section-${screen.id}" data-screen-index="${index}" data-content-panel>
      <div class="section-frame section-frame-standard">
        <div class="section-text-rail">
          ${renderHorizontalPager(screen, slides)}
        </div>
      </div>
    </section>
  `;
}

function renderAgentSection(screen, index) {
  return `
    <section class="content-stage agent-stage ${buildStageClasses(screen, index, screen.kind)}" id="section-${screen.id}" data-screen-index="${index}" data-content-panel>
      <div class="section-frame section-frame-agent section-frame-agent-intake">
        <header class="agent-stage-heading">
          <p class="content-code">${screen.code}</p>
          <p class="section-page-kicker">${screen.kicker}</p>
          <h2 class="agent-stage-title">${screen.headline}</h2>
          <p class="agent-stage-intro">${screen.blurb}</p>
        </header>

        <div class="agent-stage-main">
          <div class="agent-stage-chat-head">
            <p class="agent-card-kicker">${screen.contentTitle}</p>
            <p class="agent-stage-chat-copy">${screen.agentPanelCopy}</p>
          </div>

          <section class="agent-panel" aria-label="Conversa guiada para proposta e aplicabilidade">
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
          </section>
        </div>

        <aside class="agent-stage-aside">
          <div class="agent-rail-meta">
            <a class="agent-profile-link" href="${screen.profilePath}" target="_blank" rel="noreferrer">
              ${screen.profileLinkLabel || "Abrir markdown completo"}
            </a>
            <div class="agent-highlight-list">
              ${screen.profileHighlights.map((item) => `<span>${item}</span>`).join("")}
            </div>
          </div>

          ${
            screen.deepDives?.[0]
              ? `
                <article class="agent-aside-card">
                  <p class="agent-card-kicker">${screen.deepDives[0].kicker}</p>
                  <h3>${screen.deepDives[0].title}</h3>
                  <p>${screen.deepDives[0].body}</p>
                  <ul class="agent-aside-list">${screen.deepDives[0].list.map((item) => `<li>${item}</li>`).join("")}</ul>
                </article>
              `
              : ""
          }

          <section class="agent-report-card">
            <div class="agent-report-head">
              <div>
                <p class="agent-card-kicker">${screen.reportTitle}</p>
                <h3>${screen.reportHeading}</h3>
              </div>
              <button class="agent-export-button" type="button" data-agent-export>Exportação bloqueada</button>
            </div>
            <p class="agent-report-lead">${screen.details}</p>
            <div class="agent-report" data-agent-report></div>
            <p class="agent-report-note">${screen.reportNotice}</p>
          </section>
        </aside>
      </div>
    </section>
  `;
}

function renderSiteFooter() {
  const currentYear = new Date().getFullYear();
  const navigationMarkup = screens
    .map(
      (screen) => `
        <a href="#section-${screen.id}">${screen.label}</a>
      `
    )
    .join("");

  if (typeof generatedComponents.renderSiteFooter === "function") {
    return generatedComponents.renderSiteFooter(currentYear, navigationMarkup);
  }

  return `
    <section class="footer-stage snap-panel" id="footer-stage">
      <footer class="site-footer" id="site-footer">
        <div class="site-footer-grid">
          <section class="site-footer-card">
            <p class="site-footer-kicker">Responsabilidade</p>
            <h2>Porta de entrada para conversas sérias de projeto</h2>
            <p>
              Este site apresenta modo de trabalho, critério e áreas de atuação. Qualquer prévia exportada pela conversa de contato é preliminar: depende de contexto suficiente, validação mútua, recorte real de escopo e alinhamento posterior.
            </p>
          </section>

          <section class="site-footer-card">
            <p class="site-footer-kicker">Navegação</p>
            <nav class="site-footer-nav" aria-label="Navegação do rodapé">
              ${navigationMarkup}
            </nav>
          </section>

          <section class="site-footer-card">
            <p class="site-footer-kicker">Contato e referência</p>
            <div class="site-footer-contact-list">
              <a href="#section-agent">Abrir conversa guiada</a>
              <a href="mailto:icaroglaucooliveira@gmail.com">icaroglaucooliveira@gmail.com</a>
              <a href="https://github.com/glauco-asked-plugin/icaroglauco.online" target="_blank" rel="noreferrer">Repositório desta versão</a>
            </div>
          </section>
        </div>

        <p class="site-footer-copy">Copyright ${currentYear} Icaro Glauco. Todos os direitos reservados.</p>
      </footer>
    </section>
  `;
}

function renderCompanionPanel() {
  const assistantName = generatedAssistant.name || "icaroIA";
  const assistantKicker = generatedAssistant.kicker || "agente de orientação comercial";
  const assistantTooltip =
    generatedAssistant.tooltip ||
    "Carrego a intenção profissional, a leitura estrutural e o repertório comercial do meu autor para orientar conversas, esclarecer contexto e preparar relatórios ou pré-propostas iniciais.";

  if (typeof generatedComponents.renderCompanionPanel === "function") {
    return generatedComponents.renderCompanionPanel(assistantName, assistantKicker, assistantTooltip);
  }

	const companionControls = /*html*/`
		<div class="companion-controls">
            <button class="companion-control" data-companion-minimize type="button" aria-label="Minimizar conversa">_</button>
            <button class="companion-control" data-companion-maximize type="button" aria-label="Maximizar conversa">[]</button>
            <button class="companion-control companion-control-exit" data-companion-exit type="button" aria-label="Sair da interface inicial">x</button>
          </div>
	`
	
  return /*html*/`
    <aside class="companion-shell" data-companion-shell data-phase="boot" data-mount="page" data-view="expanded" aria-label="Converse comigo">
      <section class="companion-panel">
        <header class="companion-head">
          <div class="companion-titlebox">
            <p class="companion-kicker">${assistantKicker}</p>
            <div class="companion-title-row">
              <h3>${assistantName}</h3>
              <div class="companion-tooltip">
                <button class="companion-tooltip-trigger" type="button" aria-label="Sobre o ${assistantName}">?</button>
				<span style="margin-left: 20px"> A página está em construção, você pode interagir com o assistente por enquanto </span>
                <div class="companion-tooltip-bubble" role="note">
                  ${assistantTooltip}
                </div>
              </div>
            </div>
          </div>
          
        </header>

        <section class="companion-screen companion-screen-output" aria-live="polite">
          <p class="companion-screen-label">IA</p>
          <div class="companion-output">
            <p class="companion-output-text" data-companion-output-text></p>
          </div>
        </section>

        <form class="companion-form" data-companion-form>
          <div class="companion-screen companion-screen-input">
            <p class="companion-screen-label">Entrada</p>
            <div class="companion-form-row">
              <textarea
                id="companion-input"
                class="companion-input"
                data-companion-input
                rows="2"
                placeholder="Ex.: preciso entender escopo, semantic layer, cronograma ou proposta."
              ></textarea>
              <button class="companion-submit" data-companion-submit type="submit">Enviar</button>
            </div>
          </div>
        </form>
      </section>
    </aside>
  `;
}

const appRendering = `
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
              <span class="logo-kicker">portfólio editorial / interface de apresentação</span>
              <strong>ICARO GLAUCO</strong>
              <small>design, UX, requisitos, IA aplicada e software autoral</small>
            </div>
          </div>
        </header>

        <div class="detail-title-block">
          <p class="detail-code" data-detail-code></p>
          <h2 data-title></h2>
        </div>

        <p class="detail-copy" data-details></p>

        <ul class="detail-list" data-bullets></ul>

        <aside class="menu-dock">
          <div class="menu-head">
            <p>Navegação</p>
            <span>passe o cursor para prever, clique para abrir</span>
          </div>
          <div class="menu-list">
            ${screens
              .map((screen, index) => renderMenuButton(screen, index))
              .join("")}
          </div>
        </aside>

      </div>

      <div class="loading-card" data-loading>
        <span>carregando ambiente</span>
        <strong>Montando cena, portfólio e navegação</strong>
      </div>
    </section>

    <section class="content-rail-stage snap-panel" id="content-stage">
      ${renderContentBackdrop()}
      <div class="content-rail-shell" data-content-shell>
        ${screens
          .map((screen, index) => {
            const layout = resolveSectionLayout(screen);
            if (layout === "contact-intake") return renderAgentSection(screen, index);
            if (layout === "identity-editorial") return renderIdentitySection(screen, index);
            return renderStandardSection(screen, index);
          })
          .join("")}
      </div>
    </section>

    ${renderSiteFooter()}

    ${renderCompanionPanel()}
  </div>
`;

appRoot.innerHTML = `
<div class="page-shell" data-shell>
		${ renderCompanionPanel() }
</div>`

const pageShell = document.querySelector("[data-shell]");
const menuStage = document.querySelector("#menu-stage");
const contentRailStage = document.querySelector("#content-stage");
const footerStage = document.querySelector("#footer-stage");
const contentBackdrop = document.querySelector("[data-content-backdrop]");
const contentBackdropImage = document.querySelector("[data-content-backdrop-image]");
const contentBackdropGallery = document.querySelector("[data-content-backdrop-gallery]");
const contentRailShell = document.querySelector("[data-content-shell]");
const sceneHost = document.querySelector("[data-scene-host]");
const loadingCard = document.querySelector("[data-loading]");
const menuButtons = [...document.querySelectorAll(".menu-button")];
const contentSections = [...document.querySelectorAll(".content-stage")];
const contentPanels = [...document.querySelectorAll("[data-content-panel]")];
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
const companionShell = document.querySelector("[data-companion-shell]");
const companionOutputText = document.querySelector("[data-companion-output-text]");
const companionForm = document.querySelector("[data-companion-form]");
const companionInput = document.querySelector("[data-companion-input]");
const companionSubmit = document.querySelector("[data-companion-submit]");
const companionExit = document.querySelector("[data-companion-exit]");
const companionMinimize = document.querySelector("[data-companion-minimize]");
const companionMaximize = document.querySelector("[data-companion-maximize]");

let lockedIndex = 0;
let previewIndex = 0;
let sceneController = null;
let pageScrollEndTimeout = null;
let contentScrollEndTimeout = null;
let pageProgrammaticTargetTop = null;
let contentProgrammaticTargetLeft = null;
let pageSnapIndex = 0;
let contentSnapIndex = 0;
let detailListRevealTimeout = null;

const SCROLL_END_FALLBACK_DELAY = 220;
const PAGE_SNAP_THRESHOLD = 0.2;
const CONTENT_SNAP_THRESHOLD = 0.2;
const SUPPORTS_SCROLL_END = "onscrollend" in window;
const PROGRAMMATIC_SCROLL_EPSILON = 3;

function getShellPanels() {
  return [menuStage, contentRailStage, footerStage].filter(Boolean);
}

const agentState = {
  busy: false,
  history: []
};

const companionState = {
  phase: "boot",
  introActive: true,
  introCompleted: false,
  busy: false,
  streamId: 0,
  viewMode: "expanded",
  history: []
};

const guidedIntakeTopics = [
  {
    id: "objective",
    label: "Objetivo e resultado esperado",
    keywords: ["quero", "preciso", "projeto", "produto", "site", "landing", "pagina", "app", "sistema", "plataforma", "portal", "dashboard"],
    capture:
      "Já existe um objetivo claro, o que ajuda a tirar a conversa do campo abstrato.",
    question:
      "O que você quer colocar de pé e que resultado esse trabalho precisa gerar?"
  },
  {
    id: "context",
    label: "Contexto, dor e oportunidade",
    keywords: ["problema", "dor", "contexto", "negocio", "cliente", "operacao", "processo", "venda", "fluxo", "oportunidade", "mercado"],
    capture:
      "Já há contexto suficiente para entender por que esse trabalho existe e onde ele toca a operação real.",
    question:
      "Qual problema, oportunidade ou situação concreta está puxando esse trabalho agora?"
  },
  {
    id: "scope",
    label: "Escopo e entregáveis",
    keywords: ["escopo", "entrega", "entregavel", "tela", "telas", "identidade", "ux", "ui", "chat", "automacao", "dashboard", "fluxo", "conteudo"],
    capture:
      "Já dá para perceber algumas partes do escopo e transformar desejo em recorte de entrega.",
    question:
      "Quais partes precisam entrar de verdade: páginas, fluxos, automações, texto, identidade, chat ou outra camada?"
  },
  {
    id: "constraints",
    label: "Prazo, fases e restrições",
    keywords: ["prazo", "urgencia", "semana", "mes", "orcamento", "limite", "restricao", "deadline", "fases", "faseado", "tempo"],
    capture:
      "Já apareceram limites ou ritmos iniciais, o que ajuda a manter a proposta em chave realista.",
    question:
      "Existe prazo, faseamento, limite de orçamento ou alguma restrição técnica/comercial que eu precise considerar?"
  },
  {
    id: "fit",
    label: "Por que meu perfil faz sentido",
    keywords: ["seu perfil", "com voce", "contigo", "design", "requisitos", "agente", "agentes", "linguagem", "editorial", "autoral", "ux", "frontend"],
    capture:
      "Já há algum sinal de por que meu perfil entrou na conversa, o que ajuda a medir aplicabilidade com honestidade.",
    question:
      "Por que meu perfil entrou nessa conversa: interface, requisitos, agentes, software autoral, linguagem ou outro ponto?"
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
  bulletsNode.classList.remove("is-visible");

  if (detailListRevealTimeout) {
    window.clearTimeout(detailListRevealTimeout);
  }

  detailListRevealTimeout = window.setTimeout(() => {
    bulletsNode.classList.add("is-visible");
  }, 620);

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

function finalizePageProgrammaticScroll() {
  if (!pageShell) return;
  pageProgrammaticTargetTop = null;
  pageShell.classList.remove("is-programmatic-scroll");
}

function finalizeContentProgrammaticScroll() {
  if (!contentRailShell) return;
  contentProgrammaticTargetLeft = null;
  contentRailShell.classList.remove("is-programmatic-scroll");
  updateContentStageBackdrop(contentSnapIndex);
}

function animateShellTo(targetTop, { instant = false } = {}) {
  if (!pageShell) return;

  const delta = targetTop - pageShell.scrollTop;
  pageProgrammaticTargetTop = targetTop;
  pageShell.classList.add("is-programmatic-scroll");

  if (Math.abs(delta) < 2) {
    pageShell.scrollTop = targetTop;
    finalizePageProgrammaticScroll();
    return;
  }

  pageShell.scrollTo({
    top: targetTop,
    behavior: instant ? "auto" : "smooth"
  });

  if (instant) {
    finalizePageProgrammaticScroll();
  }
}

function resolveShellPanelIndex(targetTop) {
  const shellPanels = getShellPanels();
  return shellPanels.findIndex((panel) => Math.abs(panel.offsetTop - targetTop) < 2);
}

function updateContentStageBackdrop(index = lockedIndex) {
  if (!contentRailStage) return;

  const boundedIndex = Math.max(0, Math.min(screens.length - 1, index));
  const screen = screens[boundedIndex];
  const backdropImage = screen?.backgroundImage || screen?.image || screen?.portraitImage;
  const useGallery = screen?.kind === "identity" && Boolean(screen?.identityDeck?.length);

  if (contentBackdrop) {
    contentBackdrop.dataset.backdropMode = useGallery ? "gallery" : "single";
  }

  if (contentBackdropImage && backdropImage) {
    contentBackdropImage.src = backdropImage;
    contentBackdropImage.style.objectPosition = "center center";
  }

}

function triggerPanelScroll(targetTop) {
  const nextIndex = resolveShellPanelIndex(targetTop);
  if (nextIndex >= 0) {
    pageSnapIndex = nextIndex;
  }
  animateShellTo(targetTop);
}

function canElementConsumeVerticalScroll(element, deltaY) {
  if (!(element instanceof HTMLElement)) return false;

  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  const canScrollY = /(auto|scroll|overlay)/.test(overflowY) && element.scrollHeight > element.clientHeight + 2;

  if (!canScrollY) return false;
  if (deltaY < 0) return element.scrollTop > 0;
  if (deltaY > 0) return element.scrollTop + element.clientHeight < element.scrollHeight - 1;

  return true;
}

function lockAndScroll(index) {
  lockedIndex = index;
  applyPreview(index);
  scrollToHashTarget(`#section-${screens[index].id}`, { updateHistory: true });
}

function shouldIgnoreWheelNavigation(target, deltaY = 0) {
  if (!(target instanceof Element)) return false;

  const scrollConsumer =
    target.closest(".agent-messages") ||
    target.closest(".companion-messages") ||
    target.closest("[data-horizontal-track]");

  return canElementConsumeVerticalScroll(scrollConsumer, deltaY);
}

function getContentPanelScrollLeft(panel) {
  if (!(panel instanceof HTMLElement) || !contentRailShell) return 0;

  const shellRect = contentRailShell.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  return panelRect.left - shellRect.left + contentRailShell.scrollLeft;
}

function getNearestContentPanelIndex() {
  if (!contentRailShell || !contentPanels.length) return 0;

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  contentPanels.forEach((panel, index) => {
    const distance = Math.abs(getContentPanelScrollLeft(panel) - contentRailShell.scrollLeft);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

function scrollContentRailTo(panel, { instant = false } = {}) {
  if (!(panel instanceof HTMLElement) || !contentRailShell) return false;

  const panelIndex = contentPanels.indexOf(panel);
  if (panelIndex >= 0) {
    contentSnapIndex = panelIndex;
  }

  const targetLeft = getContentPanelScrollLeft(panel);
  contentProgrammaticTargetLeft = targetLeft;
  contentRailShell.classList.add("is-programmatic-scroll");

  if (Math.abs(targetLeft - contentRailShell.scrollLeft) < 2) {
    contentRailShell.scrollLeft = targetLeft;
    finalizeContentProgrammaticScroll();
    return true;
  }

  contentRailShell.scrollTo({
    left: targetLeft,
    behavior: instant ? "auto" : "smooth"
  });

  if (instant) {
    finalizeContentProgrammaticScroll();
  }

  return true;
}

function navigateContentRailByDirection(direction) {
  if (!contentRailShell || !contentPanels.length) return false;

  const normalizedDirection = Math.sign(direction);
  if (!normalizedDirection) return false;

  const currentIndex = getNearestContentPanelIndex();
  const targetIndex = Math.max(0, Math.min(contentPanels.length - 1, currentIndex + normalizedDirection));

  if (targetIndex === currentIndex) return false;

  return scrollContentRailTo(contentPanels[targetIndex]);
}

function snapPageToThreshold() {
  if (!pageShell) return;

  const shellPanels = getShellPanels();
  const anchorPanel = shellPanels[pageSnapIndex];
  if (!anchorPanel) return;

  const delta = pageShell.scrollTop - anchorPanel.offsetTop;
  const thresholdPx = pageShell.clientHeight * PAGE_SNAP_THRESHOLD;
  let targetIndex = pageSnapIndex;

  if (Math.abs(delta) >= thresholdPx) {
    targetIndex = Math.max(0, Math.min(shellPanels.length - 1, pageSnapIndex + Math.sign(delta)));
  }

  const targetPanel = shellPanels[targetIndex];
  if (!targetPanel) return;

  pageSnapIndex = targetIndex;
  animateShellTo(targetPanel.offsetTop);
}

function snapContentRailToThreshold() {
  if (!contentRailShell) return;

  const anchorPanel = contentPanels[contentSnapIndex];
  if (!anchorPanel) return;

  const anchorLeft = getContentPanelScrollLeft(anchorPanel);
  const delta = contentRailShell.scrollLeft - anchorLeft;
  const thresholdPx = contentRailShell.clientWidth * CONTENT_SNAP_THRESHOLD;
  let targetIndex = contentSnapIndex;

  if (Math.abs(delta) >= thresholdPx) {
    targetIndex = Math.max(0, Math.min(contentPanels.length - 1, contentSnapIndex + Math.sign(delta)));
  }

  const targetPanel = contentPanels[targetIndex];
  if (!targetPanel) return;

  scrollContentRailTo(targetPanel);
}

function handlePageScrollSettled() {
  if (!pageShell) return;

  if (pageShell.classList.contains("is-programmatic-scroll")) {
    if (pageProgrammaticTargetTop !== null && Math.abs(pageShell.scrollTop - pageProgrammaticTargetTop) > PROGRAMMATIC_SCROLL_EPSILON) {
      return;
    }
    finalizePageProgrammaticScroll();
    return;
  }

  snapPageToThreshold();
}

function handleContentRailScrollSettled() {
  if (!contentRailShell) return;

  if (contentRailShell.classList.contains("is-programmatic-scroll")) {
    if (
      contentProgrammaticTargetLeft !== null &&
      Math.abs(contentRailShell.scrollLeft - contentProgrammaticTargetLeft) > PROGRAMMATIC_SCROLL_EPSILON
    ) {
      return;
    }
    finalizeContentProgrammaticScroll();
    return;
  }

  snapContentRailToThreshold();
}

function schedulePageScrollSettledFallback() {
  if (pageScrollEndTimeout) {
    window.clearTimeout(pageScrollEndTimeout);
  }

  pageScrollEndTimeout = window.setTimeout(() => {
    handlePageScrollSettled();
  }, SCROLL_END_FALLBACK_DELAY);
}

function scheduleContentRailScrollSettledFallback() {
  if (contentScrollEndTimeout) {
    window.clearTimeout(contentScrollEndTimeout);
  }

  contentScrollEndTimeout = window.setTimeout(() => {
    handleContentRailScrollSettled();
  }, SCROLL_END_FALLBACK_DELAY);
}

function scrollToHashTarget(hash, { updateHistory = false, instant = false } = {}) {
  if (!hash || hash === "#") return false;

  const target = document.querySelector(hash);
  if (!(target instanceof HTMLElement)) return false;

  if (updateHistory) {
    window.history.replaceState(null, "", hash);
  }

  const contentPanel = target.closest("[data-content-panel]");

  if (contentPanel instanceof HTMLElement) {
    if (contentRailStage) {
      if (instant) {
        pageShell.classList.add("is-programmatic-scroll");
        pageShell.scrollTop = contentRailStage.offsetTop;
        pageShell.classList.remove("is-programmatic-scroll");
        pageSnapIndex = 1;
      } else {
        triggerPanelScroll(contentRailStage.offsetTop);
      }
    }

    scrollContentRailTo(contentPanel, { instant });
    return true;
  }

  if (instant) {
    pageShell.classList.add("is-programmatic-scroll");
    pageShell.scrollTop = target.offsetTop;
    pageShell.classList.remove("is-programmatic-scroll");
    const nextIndex = resolveShellPanelIndex(target.offsetTop);
    if (nextIndex >= 0) {
      pageSnapIndex = nextIndex;
    }
    return true;
  }

  triggerPanelScroll(target.offsetTop);
  return true;
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
  kicker.textContent = role === "assistant" ? "Agente" : "Visitante";

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
  syncAgentExportButton();
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

function getCurrentScreen() {
  return screens[lockedIndex] || screens[0];
}

function buildCompanionExplainReply(screen) {
  return `${screen.label}: ${screen.details} Em termos de proposta de valor, esta sessão mostra ${screen.contentTitle.toLowerCase()} e como isso se conecta ao restante do portfólio.`;
}

function buildCompanionSummaryReply(screen) {
  const bullets = screen.bullets?.slice(0, 3).join("; ") || "Sem destaques adicionais.";
  return `Resumo de ${screen.label}: ${screen.contentBody} Destaques principais: ${bullets}.`;
}

function tokenizeText(text) {
  return normalizeText(text)
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length >= 3);
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function streamCompanionText(text, { reset = true, speed = 18 } = {}) {
  if (!companionOutputText) return false;

  const streamId = ++companionState.streamId;
  companionOutputText.dataset.streaming = "true";

  if (reset) {
    companionOutputText.textContent = "";
  }

  for (const character of text) {
    if (streamId !== companionState.streamId) {
      return false;
    }

    companionOutputText.textContent += character;
    await wait(character === " " || character === "\n" ? speed * 0.45 : speed);
  }

  if (streamId === companionState.streamId) {
    companionOutputText.dataset.streaming = "false";
    return true;
  }

  return false;
}

function setCompanionPhase(nextPhase) {
  companionState.phase = nextPhase;
  if (companionShell) {
    companionShell.dataset.phase = nextPhase;
  }
}

function setCompanionViewMode(nextView) {
  const resolvedView = nextView === "docked" ? "docked" : "expanded";
  companionState.viewMode = resolvedView;
  if (companionShell) {
    companionShell.dataset.view = resolvedView;
  }

  if (!pageShell) return;

  if (companionState.introActive) {
    pageShell.dataset.aiStage = "intro";
    return;
  }

  pageShell.dataset.aiStage = resolvedView === "expanded" ? "assistant-focus" : "ready";
}

function mountCompanion(location) {
  if (!companionShell) return;

  const nextMount = location === "content" ? "content" : "page";
  const targetParent = nextMount === "content" ? contentRailStage : pageShell;
  if (!(targetParent instanceof HTMLElement)) return;

  if (companionShell.parentElement !== targetParent) {
    targetParent.appendChild(companionShell);
  }

  companionShell.dataset.mount = nextMount;
  if (nextMount === "content") {
    setCompanionViewMode("docked");
  }
}

function buildCompanionLandingReply(screen) {
  return `Você encontra isso em ${screen.label}. ${screen.blurb}`;
}

function buildCompanionScheduleReply() {
  return "Quando a conversa entra em cronograma, eu costumo organizar em quatro blocos: descoberta e leitura do problema, definição de escopo e semantic layer, construção das camadas de interface e implementação, e por fim validação, ajuste e publicação. Se você quiser, eu posso te ajudar a transformar um objetivo solto em fases, entregáveis e ritmo de execução.";
}

function buildCompanionBusinessLogicReply() {
  return "Lógica de negócio, para mim, é o conjunto de regras, eventos, restrições e consequências que faz um sistema responder de forma correta ao contexto real. Ela vem antes da tela bonita porque determina o que pode acontecer, para quem, em que ordem e sob quais condições.";
}

function buildCompanionSemanticLayerReply() {
  return "Semantic layer é a camada de significado do sistema: nomes, entidades, estados, relacionamentos e critérios que deixam claro o que cada coisa é de verdade. Quando ela está bem definida, interface, automação, regra e relatório passam a falar a mesma língua.";
}

function buildCompanionApproachReply() {
  return "Minha abordagem costuma sair de leitura para estrutura e de estrutura para proposta. Primeiro eu entendo intenção, contexto e restrição; depois organizo entidades, fluxo, regras e linguagem; por fim transformo isso em interface, implementação e material comercial mais confiável.";
}

function buildCompanionApplicationReply() {
  return "Aplicação, aqui, não é só implementar. É decidir onde a leitura profissional vira movimento concreto: descoberta, critérios de negócio, semantic layer, interface, componentes, copy e, quando faz sentido, relatório ou pré-proposta para apoiar a conversa comercial.";
}

function buildCompanionCommercialReply() {
  return "Eu consigo ajudar na camada comercial prévia: organizar briefing, clarificar escopo, separar desejo de entregável, sugerir faseamento, apontar risco e estruturar uma pré-proposta mais sólida antes de qualquer fechamento formal.";
}

function buildCompanionProfessionalScopeReply() {
  return "Posso responder em chave profissional sobre organização do trabalho, cronogramas, lógica de negócio, semantic layer, abordagem de projeto, aplicação técnica e preparação comercial prévia. A ideia é reduzir ruído e deixar a conversa com mais critério desde cedo.";
}

function buildCompanionIdentityReply() {
  return [
    "Icaro Glauco aparece aqui como um perfil que cruza design, UX, engenharia, requisitos e pesquisa de linguagem.",
    "O site o apresenta menos como curriculo tradicional e mais como alguem que conecta leitura de problema, direcao visual, semantica, implementacao real e software autoral.",
    "Se quiser, eu tambem posso te levar para a secao de identidade, onde isso fica desenvolvido com mais contexto."
  ].join(" ");
}

function findBestScreenByMessage(message) {
  const normalizedMessage = normalizeText(message);

  const scoredScreens = screens
    .map((screen, index) => {
      const tokens = [
        screen.id,
        screen.label,
        screen.kicker,
        screen.headline,
        screen.blurb,
        screen.contentTitle,
        ...(screen.bullets || [])
      ].flatMap((item) => tokenizeText(item));

      const score = [...new Set(tokens)].reduce((total, token) => {
        if (!normalizedMessage.includes(token)) return total;
        return total + (token.length >= 7 ? 2 : 1);
      }, 0);

      return { index, screen, score };
    })
    .sort((left, right) => right.score - left.score);

  return scoredScreens[0]?.score >= 2 ? scoredScreens[0] : null;
}

function navigateCompanionToIndex(index) {
  const boundedIndex = Math.max(0, Math.min(screens.length - 1, index));
  const screen = screens[boundedIndex];
  scrollToHashTarget(`#section-${screen.id}`, { updateHistory: true });
  return `Levei você para ${screen.label}. ${screen.blurb}`;
}

function findScreenByMessage(normalizedMessage) {
  return screens.find((screen) => {
    const tokens = [screen.id, screen.label, screen.kicker, screen.headline];
    return tokens.some((token) => normalizedMessage.includes(normalizeText(token)));
  });
}

function buildCompanionReply(message) {
  const normalizedMessage = normalizeText(message);
  const referencedScreen = findScreenByMessage(normalizedMessage);
  const scoredScreen = findBestScreenByMessage(message);

  if (/sem mais perguntas|nao tenho mais perguntas|nao tenho mais duvidas|nao tenho mais questoes|isso e tudo|era isso|so isso|obrigado,? era isso|nao,? obrigado|encerrar|pode subir/.test(normalizedMessage)) {
    return "__COMPANION_OUTRO__";
  }

  if (/quem e voce|quem voce e|sobre voce|seu perfil|trajetoria|identidade/.test(normalizedMessage)) {
    return navigateCompanionToIndex(0);
  }

  if (/quem e icaro|quem e o icaro|sobre icaro|sobre o icaro/.test(normalizedMessage)) {
    return buildCompanionIdentityReply();
  }

  if (/contato|email|falar com voce|conversar com voce|orcamento|proposta/.test(normalizedMessage)) {
    const targetIndex = screens.findIndex((screen) => screen.id === "agent");
    if (targetIndex >= 0) {
      return `${navigateCompanionToIndex(targetIndex)} Se quiser avançar, essa é a sessão certa para transformar interesse em conversa objetiva.`;
    }
  }

  if (/o que tem aqui|o que eu encontro|o que encontro|como este site esta organizado|como esta organizado/.test(normalizedMessage)) {
    return "Você encontra uma leitura em camadas: identidade e base profissional, requisitos e leitura de problema, conversa guiada para contato e, nas demais sessões, recortes de linguagem, engenharia, experiência e sistema.";
  }

  if (/organizacao profissional|organizacao do trabalho|como voce organiza|metodo profissional|estrutura profissional/.test(normalizedMessage)) {
    return buildCompanionProfessionalScopeReply();
  }

  if (/cronograma|cronogramas|faseamento|fases|marcos|timeline|prazo/.test(normalizedMessage)) {
    return buildCompanionScheduleReply();
  }

  if (/logica de negocio|regra de negocio|business logic|regras de negocio/.test(normalizedMessage)) {
    return buildCompanionBusinessLogicReply();
  }

  if (/semantic layer|camada semantica|semantica do sistema|modelo semantico|entidades e estados/.test(normalizedMessage)) {
    return buildCompanionSemanticLayerReply();
  }

  if (/abordagem|metodologia|como voce aborda|como trabalha|processo/.test(normalizedMessage)) {
    return buildCompanionApproachReply();
  }

  if (/aplicacao|como aplica|como isso entra no projeto|implementacao orientada|traduz isso/.test(normalizedMessage)) {
    return buildCompanionApplicationReply();
  }

  if (/relatorio|pre proposta|pre-proposta|proposta inicial|comercial previa|briefing comercial/.test(normalizedMessage)) {
    return buildCompanionCommercialReply();
  }

  if (/nao encontro|nao achei|nao vi isso|tem isso aqui|existe isso aqui/.test(normalizedMessage) && !scoredScreen) {
    return "Não vi uma sessão dedicada exatamente a isso. O site hoje está organizado em torno de identidade, requisitos, IA aplicada, engenharia, experiência e contato. Se você me disser o tema, eu te digo se ele aparece de forma direta ou lateral.";
  }

  if (referencedScreen) {
    return navigateCompanionToIndex(screens.findIndex((screen) => screen.id === referencedScreen.id));
  }

  if (scoredScreen) {
    scrollToHashTarget(`#section-${scoredScreen.screen.id}`, { updateHistory: true });
    return buildCompanionLandingReply(scoredScreen.screen);
  }

  if (/explic|detalh|destrincha/.test(normalizedMessage)) {
    return buildCompanionExplainReply(getCurrentScreen());
  }

  if (/resum|ponto central|essencial/.test(normalizedMessage)) {
    return buildCompanionSummaryReply(getCurrentScreen());
  }

  if (/proxim|avanc/.test(normalizedMessage)) {
    return navigateCompanionToIndex(Math.min(screens.length - 1, lockedIndex + 1));
  }

  if (/anterior|volta|retorna/.test(normalizedMessage)) {
    return navigateCompanionToIndex(Math.max(0, lockedIndex - 1));
  }

  return "Posso te orientar por identidade, requisitos, experiência, engenharia, IA aplicada e contato. Se me disser o que procura, eu aponto onde isso aparece no site ou te digo com franqueza quando não aparece.";
}

function shouldUseLocalCompanionReply(message) {
  const normalizedMessage = normalizeText(message);

  if (
    /sem mais perguntas|nao tenho mais perguntas|nao tenho mais duvidas|nao tenho mais questoes|isso e tudo|era isso|so isso|obrigado,? era isso|nao,? obrigado|encerrar|pode subir/.test(
      normalizedMessage
    )
  ) {
    return true;
  }

  if (
    /contato|email|falar com voce|conversar com voce|orcamento|proposta|o que tem aqui|o que eu encontro|o que encontro|como este site esta organizado|como esta organizado|explic|detalh|destrincha|resum|ponto central|essencial|proxim|avanc|anterior|volta|retorna/.test(
      normalizedMessage
    )
  ) {
    return true;
  }

  if (findScreenByMessage(normalizedMessage)) {
    return true;
  }

  const scoredScreen = findBestScreenByMessage(message);
  return Boolean(scoredScreen && /ir|leva|levar|mostrar|abre|abrir|onde fica|em que secao|qual secao|qual sessao|qual pagina/.test(normalizedMessage));
}

async function fetchCompanionReply(message) {
  const response = await fetch(runtimeAgentEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mode: "site-guide",
      message,
      history: companionState.history.slice(-6)
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Falha ao consultar o guia inicial.");
  }

  const reply = String(payload.reply || "").trim();
  if (!reply) {
    throw new Error("O guia inicial nao retornou texto.");
  }

  return reply;
}

async function runCompanionIntroOutro() {
  if (companionState.introCompleted) return;

  companionState.streamId += 1;
  companionState.busy = true;
  await streamCompanionText("Perfeito. Vou sair da frente e deixar o site falar visualmente.", { speed: 9 });
  await wait(380);
  await streamCompanionText("Sigo pelas sessões para responder, explicar contexto e te levar ao ponto certo sempre que você quiser.", { speed: 9 });
  await wait(380);

  setCompanionPhase("outro");
  await wait(260);

  companionState.introActive = false;
  companionState.introCompleted = true;
  mountCompanion("content");
  setCompanionPhase("docked");
  companionState.busy = false;
  setCompanionViewMode("docked");
}

async function sendCompanionMessage(rawMessage) {
  if (!companionInput || !companionSubmit) return;

  const message = rawMessage.trim();
  if (!message || companionState.busy) return;
  companionState.streamId += 1;

  companionState.busy = true;
  companionInput.disabled = true;
  companionSubmit.disabled = true;

  try {
    const reply = await fetchCompanionReply(message);
    const completed = await streamCompanionText(reply);
    if (completed) {
      companionState.history.push({ role: "user", text: message });
      companionState.history.push({ role: "assistant", text: reply });
    }
  } catch (error) {
    const messageText =
      error instanceof Error ? error.message : "A IA inicial nao respondeu.";
    const completed = await streamCompanionText(
      `A IA inicial nao conseguiu responder agora. Motivo: ${messageText}`
    );
    if (completed) {
      companionState.history.push({ role: "user", text: message });
      companionState.history.push({ role: "assistant", text: `A IA inicial nao conseguiu responder agora. Motivo: ${messageText}` });
    }
  } finally {
    companionState.busy = false;
    companionInput.disabled = false;
    companionSubmit.disabled = false;
    companionInput.focus();
  }
}

async function playCompanionWelcomeSequence() {
  if (!companionShell || companionState.busy) return;

  companionState.busy = true;
  pageShell.dataset.aiStage = "intro";
  setCompanionPhase("intro");
  setCompanionViewMode("expanded");

  const openingMessage =
    "Antes de abrir o portfólio por completo, eu quis receber você aqui na frente. Posso te guiar pelo que existe no site, dizer o que vale a pena ver primeiro e ser franco sobre o que ainda não está aqui. O que você veio procurar?";

  const completed = await streamCompanionText(openingMessage);
  if (!completed) {
    companionState.busy = false;
    return;
  }

  companionState.busy = false;
  companionInput?.focus();
}

function setupCompanionPanel() {
  if (!companionShell || !companionForm || !companionInput) return;

  pageShell.dataset.styleMode = "base";
  mountCompanion("page");
  setCompanionViewMode("expanded");
  if (companionOutputText) {
    companionOutputText.textContent = "";
    companionOutputText.dataset.streaming = "false";
  }
  playCompanionWelcomeSequence();

  companionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = companionInput.value;
    companionInput.value = "";
    void sendCompanionMessage(message);
  });

  companionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      companionForm.requestSubmit();
    }
  });

  companionExit?.addEventListener("click", () => {
    void runCompanionIntroOutro();
  });

  companionMinimize?.addEventListener("click", () => {
    if (companionState.introActive) {
      void runCompanionIntroOutro();
      return;
    }
    mountCompanion("content");
    setCompanionPhase("docked");
    setCompanionViewMode("docked");
  });

  companionMaximize?.addEventListener("click", () => {
    setCompanionPhase("docked");
    setCompanionViewMode("expanded");
  });
}

function buildContactAssessment() {
  const userMessages = agentState.history.filter((entry) => entry.role === "user").map((entry) => entry.text.trim()).filter(Boolean);
  const assistantMessages = agentState.history
    .filter((entry) => entry.role === "assistant")
    .map((entry) => entry.text.trim())
    .filter(Boolean);
  const combinedUserText = normalizeText(userMessages.join(" "));
  const totalChars = userMessages.join(" ").length;

  const signals = guidedIntakeTopics.map((topic) => ({
    ...topic,
    matched: topic.keywords.some((keyword) => combinedUserText.includes(keyword))
  }));

  const matchedSignals = signals.filter((topic) => topic.matched);
  const missingSignals = signals.filter((topic) => !topic.matched);
  const latestUserMessage = userMessages[userMessages.length - 1] || "Interesse ainda não declarado.";
  const latestAssistantMessage =
    assistantMessages[assistantMessages.length - 1] ||
    "A conversa ainda não reuniu material suficiente para uma leitura inicial de aplicabilidade.";
  const captureList = userMessages.length
    ? userMessages.slice(-4)
    : ["A conversa ainda não trouxe objetivo, contexto, escopo ou motivo suficiente para uma prévia exportável."];

  const clauses = [
    signals.find((topic) => topic.id === "objective")?.matched
      ? "Já existe uma intenção inicial clara, o que permite tratar a conversa como possibilidade concreta de trabalho."
      : "Ainda falta um objetivo claro para transformar interesse em proposta inicial.",
    signals.find((topic) => topic.id === "context")?.matched || signals.find((topic) => topic.id === "scope")?.matched
      ? "Já há matéria suficiente para traduzir contexto em escopo e recorte de entrega."
      : "Contexto e recorte de escopo ainda precisam ficar mais nítidos para sair do campo genérico.",
    signals.find((topic) => topic.id === "fit")?.matched
      ? "Já apareceu um motivo de encaixe entre meu perfil e o caso, o que ajuda a medir aplicabilidade com mais honestidade."
      : "Ainda preciso entender por que meu perfil entrou na conversa e onde ele realmente faz sentido neste caso.",
    signals.find((topic) => topic.id === "constraints")?.matched
      ? "Limites ou ritmos iniciais já apareceram, o que ajuda a manter a proposta numa chave realista."
      : "Prazo, faseamento ou restrições ainda precisam aparecer para a prévia ficar materialmente mais confiável."
  ];

  const isReady = matchedSignals.length >= 4 && totalChars >= 240 && (userMessages.length >= 2 || totalChars >= 420);
  const readinessLine = isReady
    ? "Já existe material suficiente para liberar uma prévia exportável de proposta e aplicabilidade."
    : "A prévia continua bloqueada até a conversa trazer objetivo, contexto, escopo e sinais de encaixe com clareza.";
  const nextQuestion =
    missingSignals[0]?.question ||
    "Se quiser, eu já consigo consolidar a prévia exportável e apontar o que ainda precisa ser validado antes de um acordo.";

  const nextSteps = isReady
    ? [
        "Revisar a prévia exportada e corrigir qualquer pressuposto impreciso.",
        "Converter a conversa em recorte inicial de proposta, entregáveis e próximos passos.",
        "Validar prazo, limites e condições antes de tratar qualquer compromisso como fechado."
      ]
    : [
        `Responder sobre ${missingSignals.map((topic) => topic.label.toLowerCase()).slice(0, 2).join(" e ") || "objetivo e escopo"}.`,
        "Tornar o interesse mais tangível com contexto, entrega e limite inicial.",
        "Liberar a exportação apenas quando houver base suficiente para isso."
      ];

  return {
    latestUserMessage,
    latestAssistantMessage,
    captureList,
    signals,
    matchedSignals,
    missingSignals,
    clauses,
    nextSteps,
    nextQuestion,
    readinessLine,
    isReady
  };
}

function buildLocalInterviewReply(message) {
  const normalizedMessage = normalizeText(message);
  const asksNextQuestion = /proxim|seguinte|continue|avanca|avancar|aprofund/.test(normalizedMessage);
  const assessment = buildContactAssessment();
  const emphasizedSignal =
    assessment.matchedSignals.find((topic) => topic.keywords.some((keyword) => normalizedMessage.includes(keyword))) ||
    assessment.matchedSignals[assessment.matchedSignals.length - 1];
  const leadLine = emphasizedSignal
    ? emphasizedSignal.capture
    : "Ainda não vou fingir clareza: por enquanto a conversa só indica interesse inicial, mas ainda não sustenta uma prévia exportável.";

  if (asksNextQuestion) {
    return [
      leadLine,
      "",
      `Aplicabilidade preliminar: ${assessment.clauses.join(" ")}`,
      "",
      assessment.readinessLine,
      "",
      `Próxima pergunta guiada: ${assessment.nextQuestion}`
    ].join("\n");
  }

  return [
    leadLine,
    "",
    `Leitura preliminar: ${assessment.clauses.join(" ")}`,
    "",
    assessment.readinessLine,
    "",
    `Próxima pergunta guiada: ${assessment.nextQuestion}`
  ].join("\n");
}

function buildAgentReportData() {
  const assessment = buildContactAssessment();

  return {
    objective: assessment.latestUserMessage,
    scopeItems: assessment.captureList,
    matchedSignals: assessment.matchedSignals,
    missingSignals: assessment.missingSignals,
    agentSynthesis: assessment.latestAssistantMessage,
    clauses: assessment.clauses,
    nextSteps: assessment.nextSteps,
    readinessLine: assessment.readinessLine,
    isReady: assessment.isReady,
    nextQuestion: assessment.nextQuestion
  };
}

function buildAgentReportMarkdown() {
  const data = buildAgentReportData();

  if (!data.isReady) return null;

  return [
    `# ${agentScreen?.reportHeading || "Prévia de proposta e aplicabilidade"}`,
    "",
    "## Objetivo declarado",
    data.objective,
    "",
    "## Pontos capturados na conversa",
    ...data.scopeItems.map((item) => `- ${item}`),
    "",
    "## Sinais presentes",
    ...data.matchedSignals.map((topic) => `- ${topic.label}`),
    "",
    "## Cláusulas provisórias de aplicabilidade",
    ...data.clauses.map((item) => `- ${item}`),
    "",
    "## Pontos a validar antes de fechar proposta",
    ...(data.missingSignals.length ? data.missingSignals.map((topic) => `- ${topic.label}`) : ["- Nada estruturalmente pendente nesta etapa inicial."]),
    "",
    "## Próximos passos sugeridos",
    ...data.nextSteps.map((item) => `- ${item}`),
    ""
  ].join("\n");
}

function syncAgentExportButton() {
  if (!agentExportButton) return;

  const data = buildAgentReportData();
  const disabled = agentState.busy || !data.isReady;
  agentExportButton.disabled = disabled;
  agentExportButton.textContent = data.isReady ? "Exportar prévia .md" : "Exportação bloqueada";
  agentExportButton.title = data.isReady
    ? "Exportar a prévia de proposta e aplicabilidade em markdown."
    : "A exportação só libera quando a conversa trouxer material suficiente.";
}

function renderAgentReport() {
  if (!agentReportNode) return;

  const data = buildAgentReportData();
  agentReportNode.innerHTML = `
    <article class="agent-report-section">
      <p class="agent-report-label">Estado da análise</p>
      <p>${escapeHtml(data.readinessLine)}</p>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Objetivo declarado</p>
      <p>${escapeHtml(data.objective)}</p>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Pontos capturados</p>
      <ul class="agent-report-list">
        ${data.scopeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Sinais presentes</p>
      <ul class="agent-report-list">
        ${
          data.matchedSignals.length
            ? data.matchedSignals.map((topic) => `<li>${escapeHtml(topic.label)}</li>`).join("")
            : "<li>A conversa ainda não reuniu sinais suficientes.</li>"
        }
      </ul>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Ainda preciso entender</p>
      <ul class="agent-report-list">
        ${
          data.missingSignals.length
            ? data.missingSignals.map((topic) => `<li>${escapeHtml(topic.label)}</li>`).join("")
            : "<li>Nenhum bloco estrutural ficou faltando nesta etapa inicial.</li>"
        }
      </ul>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Cláusulas provisórias</p>
      <ul class="agent-report-list">
        ${data.clauses.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Próximo passo guiado</p>
      <p>${escapeHtml(data.nextQuestion)}</p>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Leitura atual do agente</p>
      <p>${escapeHtml(data.agentSynthesis)}</p>
    </article>
    <article class="agent-report-section">
      <p class="agent-report-label">Próximos passos sugeridos</p>
      <ul class="agent-report-list">
        ${data.nextSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </article>
  `;
  syncAgentExportButton();
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
  setAgentStatus("Lendo contexto e organizando a resposta...");
  setAgentBusy(true);

  try {
    if (agentScreen.agentStrategy === "local-intake") {
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      const reply = buildLocalInterviewReply(message);
      agentState.history.push({ role: "assistant", text: reply });
      appendAgentMessage("assistant", reply);
      renderAgentReport();
      setAgentStatus("Diagnóstico atualizado. Pode responder ou pedir a próxima camada de aprofundamento.");
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
      throw new Error("O agente não retornou texto.");
    }

    agentState.history.push({ role: "assistant", text: reply });
    appendAgentMessage("assistant", reply);
    renderAgentReport();
    setAgentStatus("Diagnóstico atualizado. Pode seguir com a próxima informação.");
  } catch (error) {
    if (agentState.history[agentState.history.length - 1] === userEntry) {
      agentState.history.pop();
    }
    renderAgentReport();
    const messageText = error instanceof Error ? error.message : "Falha ao consultar o agente.";
    appendAgentMessage("assistant", "Não consegui responder agora. Tente novamente em alguns segundos.");
    setAgentStatus(messageText, true);
  } finally {
    setAgentBusy(false);
    if (agentInput) {
      agentInput.focus();
    }
  }
}

async function sendAgentMessageViaAI(rawMessage) {
  if (!agentScreen) return;

  const message = rawMessage.trim();
  if (!message || agentState.busy) return;

  const requestHistory = agentState.history.slice(-8);
  const userEntry = { role: "user", text: message };
  agentState.history.push(userEntry);
  appendAgentMessage("user", message);
  renderAgentReport();
  setAgentStatus("Lendo contexto e organizando a resposta...");
  setAgentBusy(true);

  try {
    const response = await fetch(runtimeAgentEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode: agentScreen.agentMode || "contact-intake",
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
    setAgentStatus("Diagnostico atualizado. Pode seguir com a proxima informacao.");
  } catch (error) {
    if (agentState.history[agentState.history.length - 1] === userEntry) {
      agentState.history.pop();
    }
    renderAgentReport();
    const messageText = error instanceof Error ? error.message : "Falha ao consultar o agente.";
    appendAgentMessage("assistant", `A IA de proposta nao respondeu. Motivo: ${messageText}`);
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
  setAgentStatus("A exportação fica bloqueada até haver material suficiente de objetivo, contexto, escopo e encaixe.");

  if (agentForm && agentInput) {
    agentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = agentInput.value;
      agentInput.value = "";
      sendAgentMessageViaAI(message);
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
      sendAgentMessageViaAI(prompt);
    });
  });

  agentExportButton?.addEventListener("click", () => {
    const report = buildAgentReportMarkdown();
    if (!report) {
      setAgentStatus("Ainda não exporto a prévia: falta base suficiente de contexto, escopo e aplicabilidade.", true);
      return;
    }
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = agentScreen.reportFilename || "previa-proposta-icaro-glauco.md";
    link.click();
    URL.revokeObjectURL(url);
  });
}

function setupHorizontalPagers() {
  const pagers = [...document.querySelectorAll("[data-horizontal-pager]")];

  pagers.forEach((pager) => {
    const track = pager.querySelector("[data-horizontal-track]");
    const pages = [...pager.querySelectorAll(".horizontal-page")];
    const prevButton = pager.querySelector("[data-horizontal-prev]");
    const nextButton = pager.querySelector("[data-horizontal-next]");
    const counter = pager.querySelector("[data-horizontal-counter]");
    const label = pager.querySelector("[data-horizontal-label]");
    const progressDots = [...pager.querySelectorAll(".horizontal-pager-progress-dot")];

    if (!track) return;

    const getPageWidth = () => track.clientWidth;

    const syncPager = () => {
      const width = getPageWidth() || 1;
      const activeIndex = Math.round(track.scrollLeft / width);
      const totalPages = progressDots.length || 1;
      const activePage = pages[activeIndex];
      progressDots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeIndex);
      });
      if (counter) {
        counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`;
      }
      if (label) {
        label.textContent = activePage?.dataset.pageLabel || "Abertura";
      }
      if (prevButton) {
        prevButton.disabled = activeIndex <= 0;
      }
      if (nextButton) {
        nextButton.disabled = activeIndex >= totalPages - 1;
      }
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
      goTo(Math.min(progressDots.length - 1, activeIndex + 1));
    });

    track.addEventListener("scroll", () => {
      window.requestAnimationFrame(syncPager);
    });

    window.addEventListener("resize", syncPager);
    syncPager();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const link = target.closest('a[href^="#"]');
  if (!(link instanceof HTMLAnchorElement)) return;

  const hash = link.getAttribute("href") || "";
  if (!scrollToHashTarget(hash, { updateHistory: true })) return;

  event.preventDefault();
});

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
    root: contentRailShell,
    threshold: [0.55, 0.75]
  }
);

contentSections.forEach((section) => observer.observe(section));

pageShell?.addEventListener(
  "wheel",
  (event) => {
    if (!companionState.introActive) return;
    const target = event.target;
    if (target instanceof Element && companionShell?.contains(target)) return;
    event.preventDefault();
  },
  { passive: false }
);

contentRailShell?.addEventListener(
  "wheel",
  (event) => {
    if (event.ctrlKey) return;
    if (contentRailShell.classList.contains("is-programmatic-scroll")) {
      event.preventDefault();
      return;
    }

    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(dominantDelta) < 2) return;
    if (shouldIgnoreWheelNavigation(event.target, dominantDelta)) return;

    const maxScrollLeft = contentRailShell.scrollWidth - contentRailShell.clientWidth;
    const canScrollBackward = contentRailShell.scrollLeft > 2;
    const canScrollForward = contentRailShell.scrollLeft < maxScrollLeft - 2;

    if ((dominantDelta < 0 && !canScrollBackward) || (dominantDelta > 0 && !canScrollForward)) {
      return;
    }

    event.preventDefault();
    navigateContentRailByDirection(dominantDelta);
  },
  { passive: false }
);

pageShell?.addEventListener("scroll", () => {
  if (
    pageShell.classList.contains("is-programmatic-scroll") &&
    pageProgrammaticTargetTop !== null &&
    Math.abs(pageShell.scrollTop - pageProgrammaticTargetTop) <= PROGRAMMATIC_SCROLL_EPSILON
  ) {
    finalizePageProgrammaticScroll();
    return;
  }

  if (!SUPPORTS_SCROLL_END) {
    schedulePageScrollSettledFallback();
  }
});

contentRailShell?.addEventListener("scroll", () => {
  if (
    contentRailShell.classList.contains("is-programmatic-scroll") &&
    contentProgrammaticTargetLeft !== null &&
    Math.abs(contentRailShell.scrollLeft - contentProgrammaticTargetLeft) <= PROGRAMMATIC_SCROLL_EPSILON
  ) {
    finalizeContentProgrammaticScroll();
    return;
  }

  if (!SUPPORTS_SCROLL_END) {
    scheduleContentRailScrollSettledFallback();
  }
});

if (SUPPORTS_SCROLL_END) {
  pageShell?.addEventListener("scrollend", handlePageScrollSettled);
  contentRailShell?.addEventListener("scrollend", handleContentRailScrollSettled);
}

// renderHUD(0);
// updateContentStageBackdrop(0);
// setupAgentPanel();
setupCompanionPanel();
// setupHorizontalPagers();

// if (window.location.hash) {
//   window.requestAnimationFrame(() => {
//     scrollToHashTarget(window.location.hash, { instant: true });
//   });
// }

// window.addEventListener("hashchange", () => {
//   scrollToHashTarget(window.location.hash, { instant: true });
// });

// async function init() {
//   const { createScene } = await import("./scene");
//   sceneController = await createScene({ mount: sceneHost, screens });
//   sceneController.focusScreen(0);
//   loadingCard.classList.add("is-hidden");
// }

// init().catch(() => {
//   loadingCard.innerHTML = `
//     <span>falha na cena</span>
//     <strong>Não foi possível carregar a experiência 3D</strong>
//   `;
// });

// const firebaseConfig = {
// 	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
// 	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
// 	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
// 	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
// 	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
// 	appId: import.meta.env.VITE_FIREBASE_APP_ID,
// 	measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
// };

// const app = initializeApp(firebaseConfig);

// import("firebase/analytics")
//   .then(({ getAnalytics, isSupported }) => isSupported().then((supported) => ({ getAnalytics, supported })))
//   .then(({ getAnalytics, supported }) => {
//     if (supported) getAnalytics(app);
//   })
//   .catch(() => {
//     // Analytics is optional in this menu-screen build.
//   });
