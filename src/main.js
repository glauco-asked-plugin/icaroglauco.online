import "./styles.css";
import { renderAnswerCard } from "./lib/answer-card.js";
import { findQuestion, loadPublicKnowledge } from "./lib/okf.js";
import { createStaticAnswer } from "./lib/static-answer.js";

const app = document.querySelector("#app");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null && text !== "") node.textContent = text;
  return node;
}

function externalLink(className, text, href) {
  const node = el("a", className, text);
  node.href = href;
  node.target = "_blank";
  node.rel = "noreferrer";
  return node;
}

function portrait(className = "profile-portrait") {
  const frame = el("div", className);
  const image = document.createElement("img");
  image.src = "/assets/foto-02.jpg";
  image.alt = "Icaro Glauco";
  image.addEventListener("error", () => {
    image.remove();
    frame.textContent = "IG";
  });
  frame.append(image);
  return frame;
}

function buildProfileCard(knowledge) {
  const { profile, projects } = knowledge;
  const card = el("section", "profile-card");
  card.dataset.profileCard = "true";
  card.setAttribute("aria-label", "Icaro Glauco professional profile");

  const identity = el("div", "profile-card-identity");
  const copy = el("div", "profile-card-copy");
  copy.append(
    el("span", "profile-card-kicker", profile.displayTitle),
    el("h1", "", profile.name),
    el("p", "profile-card-role", profile.professionalTitle),
    el("p", "profile-card-headline", profile.headline)
  );
  identity.append(portrait("profile-card-portrait"), copy);

  const projectStrip = el("div", "profile-card-projects");
  for (const project of projects) {
    const item = el("article", "profile-card-project");
    item.append(
      el("span", "profile-card-monogram", project.monogram),
      el("div", "profile-card-project-copy")
    );
    item.lastElementChild.append(
      el("strong", "", project.name),
      el("small", "", project.status)
    );
    projectStrip.append(item);
  }

  const footer = el("div", "profile-card-footer");
  const autoState = el("div", "profile-card-auto");
  autoState.append(el("span", "profile-card-pulse"), el("span", "", "Opening the knowledge studio"));

  const openButton = el("button", "profile-card-open", "Open profile");
  openButton.type = "button";
  openButton.dataset.openProfile = "true";
  openButton.setAttribute("aria-haspopup", "dialog");
  footer.append(autoState, openButton);

  card.append(identity, projectStrip, footer);
  return card;
}

function addTagList(target, items, className = "modal-tags") {
  const list = el("div", className);
  for (const item of items) list.append(el("span", "", item));
  target.append(list);
}

function buildProfileModal(knowledge) {
  const { profile, projects, practice } = knowledge;
  const dialog = document.createElement("dialog");
  dialog.className = "profile-modal";
  dialog.dataset.profileModal = "true";

  const shell = el("article", "profile-modal-shell");
  const close = el("button", "profile-modal-close", "Close");
  close.type = "button";
  close.dataset.closeProfile = "true";

  const masthead = el("header", "profile-modal-masthead");
  const identity = el("div", "profile-modal-identity");
  const identityCopy = el("div");
  identityCopy.append(
    el("span", "modal-eyebrow", profile.displayTitle),
    el("h2", "", profile.name),
    el("p", "profile-modal-role", profile.professionalTitle),
    el("p", "profile-modal-location", `${profile.location} · ${profile.availability}`)
  );
  identity.append(portrait("profile-modal-portrait"), identityCopy);
  masthead.append(close, identity, el("p", "profile-modal-thesis", profile.thesis));

  const content = el("div", "profile-modal-content");

  const meaning = el("section", "profile-modal-section profile-modal-section--wide");
  meaning.append(
    el("span", "modal-section-index", "01 / PRACTICE"),
    el("h3", "", "Why Wizard of Transformation"),
    el("p", "", profile.wizardMeaning)
  );

  const capabilities = el("section", "profile-modal-section");
  capabilities.append(
    el("span", "modal-section-index", "02 / CAPABILITIES"),
    el("h3", "", "Fields of construction")
  );
  const capabilityGrid = el("div", "modal-capability-grid");
  for (const capability of profile.capabilityDomains) {
    const item = el("article", "modal-capability");
    item.append(el("strong", "", capability.name), el("p", "", capability.description));
    capabilityGrid.append(item);
  }
  capabilities.append(capabilityGrid);

  const activeProjects = el("section", "profile-modal-section");
  activeProjects.append(
    el("span", "modal-section-index", "03 / ACTIVE PRODUCTS"),
    el("h3", "", "One flagship and two vertical systems")
  );
  const projectGrid = el("div", "modal-project-grid");
  for (const project of projects) {
    const item = el("article", "modal-project");
    item.append(
      el("span", "modal-project-monogram", project.monogram),
      el("div", "modal-project-copy")
    );
    item.lastElementChild.append(
      el("small", "", project.domain),
      el("strong", "", project.name),
      el("p", "", project.headline),
      el("span", "modal-project-phase", project.currentPhase)
    );
    projectGrid.append(item);
  }
  activeProjects.append(projectGrid);

  const method = el("section", "profile-modal-section profile-modal-section--wide");
  method.append(
    el("span", "modal-section-index", "04 / TRANSFORMATION METHOD"),
    el("h3", "", practice.summary)
  );
  const methodFlow = el("ol", "modal-method-flow");
  for (const stage of practice.stages) {
    const item = el("li", "modal-method-stage");
    item.append(
      el("span", "modal-method-number", String(stage.order).padStart(2, "0")),
      el("div", "modal-method-copy")
    );
    item.lastElementChild.append(
      el("strong", "", stage.name),
      el("p", "", stage.question)
    );
    addTagList(item.lastElementChild, stage.outputs, "modal-stage-outputs");
    methodFlow.append(item);
  }
  method.append(methodFlow);

  const principles = el("section", "profile-modal-section");
  principles.append(
    el("span", "modal-section-index", "05 / PRINCIPLES"),
    el("h3", "", "How the work remains coherent")
  );
  const principleList = el("ul", "modal-principles");
  for (const principle of profile.workingPrinciples) principleList.append(el("li", "", principle));
  principles.append(principleList);

  const fit = el("section", "profile-modal-section");
  fit.append(
    el("span", "modal-section-index", "06 / PROJECT FIT"),
    el("h3", "", "Situations suited to this practice")
  );
  addTagList(fit, profile.projectFit);
  const actions = el("div", "profile-modal-actions");
  actions.append(
    externalLink("modal-action modal-action--primary", "GitHub", profile.links.github),
    externalLink("modal-action", "icaroglauco.online", profile.links.site)
  );
  fit.append(actions);

  content.append(meaning, capabilities, activeProjects, method, principles, fit);
  shell.append(masthead, content);
  dialog.append(shell);
  return dialog;
}

function buildQuestionRail(questions) {
  const rail = el("div", "question-rail");
  rail.setAttribute("aria-label", "Suggested questions");
  for (const question of questions) {
    const button = el("button", "question-chip", question.label);
    button.type = "button";
    button.dataset.questionId = question.id;
    rail.append(button);
  }
  return rail;
}

function buildConversation(knowledge) {
  const panel = el("section", "chat-panel");
  panel.setAttribute("aria-label", "Fixed OKF chat interface");

  const header = el("header", "chat-header");
  const heading = el("div", "chat-heading");
  heading.append(
    el("span", "chat-eyebrow", "OKF-grounded live inference"),
    el("h2", "", "Ask the work directly"),
    el("p", "", "Questions become structured profiles with architecture, evidence, limits and next directions.")
  );
  const live = el("div", "chat-live");
  live.append(el("span", "chat-live-dot"), el("span", "", "NVIDIA NIM"));
  header.append(heading, live);

  const messages = el("div", "chat-messages");
  messages.dataset.messages = "true";
  messages.setAttribute("aria-live", "polite");
  const greeting = el("article", "chat-message chat-message--assistant");
  greeting.append(
    el("span", "chat-message-author", "Icaro OKF"),
    el("p", "", "Ask about the professional profile, Cognoscere/Lumira, Isocon, MacroObras, OKF or the transformation method.")
  );
  messages.append(greeting);

  const quickQuestions = buildQuestionRail(knowledge.questions);

  const form = document.createElement("form");
  form.className = "chat-composer";
  form.dataset.composer = "true";
  const input = document.createElement("textarea");
  input.name = "message";
  input.rows = 3;
  input.maxLength = 1200;
  input.placeholder = "Ask a project question or describe a specialised system…";
  input.required = true;
  const submit = el("button", "chat-submit", "Summon response");
  submit.type = "submit";
  form.append(input, submit);

  const status = el("p", "chat-status");
  status.dataset.status = "true";
  status.setAttribute("aria-live", "polite");

  panel.append(header, messages, quickQuestions, form, status);
  return panel;
}

function renderShell(knowledge) {
  const shell = el("div", "app-shell");
  const atmosphere = el("div", "atmosphere");
  atmosphere.setAttribute("aria-hidden", "true");

  const landing = el("section", "landing-stage");
  landing.append(buildProfileCard(knowledge));

  const workspace = el("section", "fixed-workspace");
  workspace.setAttribute("aria-label", "Interactive portfolio workspace");
  const chat = buildConversation(knowledge);
  const response = el("aside", "response-panel knowledge-profile knowledge-profile--placeholder");
  response.dataset.answerCard = "true";
  response.setAttribute("aria-live", "polite");
  renderAnswerCard(response, null);
  workspace.append(chat, response);

  shell.append(atmosphere, landing, workspace, buildProfileModal(knowledge));
  return shell;
}

function appendMessage(messages, role, text) {
  const message = el("article", `chat-message chat-message--${role}`);
  message.append(
    el("span", "chat-message-author", role === "user" ? "Visitor" : "Icaro OKF"),
    el("p", "", text)
  );
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
}

async function requestAnswer({ message, questionId, history }) {
  const response = await fetch("/api/wizard-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, questionId, history })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Live inference is unavailable.");
  return payload;
}

async function start() {
  if (!app) return;
  const knowledge = await loadPublicKnowledge();
  const shell = renderShell(knowledge);
  app.replaceChildren(shell);

  const profileCard = shell.querySelector("[data-profile-card]");
  const profileModal = shell.querySelector("[data-profile-modal]");
  const openProfile = shell.querySelector("[data-open-profile]");
  const closeProfile = shell.querySelector("[data-close-profile]");
  const messages = shell.querySelector("[data-messages]");
  const composer = shell.querySelector("[data-composer]");
  const input = composer.querySelector("textarea");
  const submit = composer.querySelector("button");
  const status = shell.querySelector("[data-status]");
  const answerCard = shell.querySelector("[data-answer-card]");
  const history = [];

  let transitioned = false;
  function enterStudio() {
    if (transitioned) return;
    transitioned = true;
    document.body.dataset.stage = "transition";
    window.setTimeout(() => {
      document.body.dataset.stage = "ready";
      window.setTimeout(() => input.focus(), 450);
    }, 920);
  }

  function showProfile() {
    if (typeof profileModal.showModal === "function") profileModal.showModal();
    else profileModal.setAttribute("open", "");
  }

  function hideProfile() {
    if (typeof profileModal.close === "function") profileModal.close();
    else profileModal.removeAttribute("open");
  }

  async function ask(message, questionId = "") {
    enterStudio();
    const cleanMessage = String(message || "").trim();
    if (!cleanMessage) return;
    const question = questionId ? findQuestion(knowledge, questionId) : null;
    const requestHistory = history.slice(-8);

    appendMessage(messages, "user", cleanMessage);
    history.push({ role: "user", content: cleanMessage });
    input.value = "";
    input.disabled = true;
    submit.disabled = true;
    answerCard.dataset.loading = "true";
    status.textContent = "Composing a live structured response…";

    try {
      const payload = await requestAnswer({
        message: cleanMessage,
        questionId: question?.id || questionId,
        history: requestHistory
      });
      appendMessage(messages, "assistant", payload.answer);
      history.push({ role: "assistant", content: payload.answer });
      renderAnswerCard(answerCard, payload);
      status.textContent = `Live inference · ${payload.model || "NVIDIA NIM"}`;
    } catch (error) {
      const fallback = createStaticAnswer({
        message: cleanMessage,
        questionId: question?.id || questionId,
        knowledge
      });
      appendMessage(messages, "assistant", fallback.answer);
      history.push({ role: "assistant", content: fallback.answer });
      renderAnswerCard(answerCard, fallback);
      status.textContent = `${error instanceof Error ? error.message : "Live inference failed."} Public OKF fallback shown.`;
    } finally {
      delete answerCard.dataset.loading;
      input.disabled = false;
      submit.disabled = false;
      input.focus();
    }
  }

  openProfile?.addEventListener("click", showProfile);
  closeProfile?.addEventListener("click", hideProfile);
  profileModal?.addEventListener("click", (event) => {
    if (event.target === profileModal) hideProfile();
  });
  profileCard?.addEventListener("dblclick", showProfile);

  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      composer.requestSubmit();
    }
  });

  for (const button of shell.querySelectorAll("[data-question-id]")) {
    button.addEventListener("click", () => {
      const question = findQuestion(knowledge, button.dataset.questionId);
      if (question) ask(question.prompt, question.id);
    });
  }

  window.setTimeout(enterStudio, 2800);
}

start().catch((error) => {
  console.error(error);
  if (app) app.textContent = "The public OKF knowledge base could not be loaded.";
});
