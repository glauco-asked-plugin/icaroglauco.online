const ALLOWED_TONES = new Set(["emerald", "amber", "violet", "cyan", "neutral"]);
const ALLOWED_LAYOUTS = new Set(["profile", "architecture", "comparison", "split", "timeline"]);
const ALLOWED_KINDS = new Set(["person-profile", "project-profile", "practice-profile", "portfolio-comparison"]);
const ALLOWED_SECTION_TYPES = new Set([
  "narrative",
  "list",
  "metrics",
  "flow",
  "quote",
  "comparison",
  "layers",
  "evidence",
  "roadmap"
]);

function asText(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asTextList(value, limit = 12) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => asText(item)).filter(Boolean).slice(0, limit);
}

function normalizeItems(value, limit = 14) {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, limit)
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return {
        label: asText(item?.label),
        value: asText(item?.value),
        detail: asText(item?.detail),
        status: asText(item?.status)
      };
    })
    .filter((item) =>
      typeof item === "string"
        ? Boolean(item)
        : Boolean(item.label || item.value || item.detail || item.status)
    );
}

function normalizeSection(section) {
  return {
    type: ALLOWED_SECTION_TYPES.has(section?.type) ? section.type : "narrative",
    heading: asText(section?.heading),
    body: asText(section?.body),
    items: normalizeItems(section?.items)
  };
}

function normalizeFacts(value) {
  return normalizeItems(value, 8).map((item) => {
    if (typeof item === "string") return { label: "", value: item, detail: "", status: "" };
    return item;
  });
}

function safeHref(value) {
  const href = asText(value);
  return /^https:\/\//i.test(href) ? href : "";
}

export function normalizeAnswer(payload) {
  const card = payload?.card || {};

  return {
    answer: asText(payload?.answer, "The answer was returned without a summary."),
    card: {
      kind: ALLOWED_KINDS.has(card.kind) ? card.kind : "project-profile",
      subjectId: asText(card.subjectId),
      monogram: asText(card.monogram).slice(0, 3).toUpperCase(),
      eyebrow: asText(card.eyebrow, "Knowledge profile"),
      title: asText(card.title, "Structured profile"),
      subtitle: asText(card.subtitle),
      status: asText(card.status),
      domain: asText(card.domain),
      phase: asText(card.phase),
      summary: asText(card.summary),
      tone: ALLOWED_TONES.has(card.tone) ? card.tone : "emerald",
      layout: ALLOWED_LAYOUTS.has(card.layout) ? card.layout : "profile",
      badges: asTextList(card.badges, 10),
      facts: normalizeFacts(card.facts),
      sections: Array.isArray(card.sections)
        ? card.sections.slice(0, 10).map(normalizeSection)
        : [],
      actions: Array.isArray(card.actions)
        ? card.actions
            .slice(0, 4)
            .map((action) => ({
              label: asText(action?.label),
              href: safeHref(action?.href),
              kind: asText(action?.kind, "primary")
            }))
            .filter((action) => action.label && action.href)
        : []
    },
    sources: asTextList(payload?.sources, 10)
  };
}

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function initials(title) {
  return String(title || "OK")
    .split(/\s+|\//)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function itemText(item) {
  if (typeof item === "string") return item;
  return [item.label, item.value, item.detail].filter(Boolean).join(" — ");
}

function renderList(section, className = "profile-list") {
  const list = node("ul", className);
  for (const item of section.items) list.append(node("li", "", itemText(item)));
  return list;
}

function renderFlow(section) {
  const flow = node("ol", "profile-flow");
  for (const item of section.items) {
    const li = node("li");
    const marker = node("span", "flow-marker");
    const copy = node("div", "flow-copy");
    if (typeof item === "string") {
      copy.append(node("strong", "", item));
    } else {
      copy.append(
        node("strong", "", item.label || item.value),
        item.detail ? node("p", "", item.detail) : document.createTextNode("")
      );
    }
    li.append(marker, copy);
    flow.append(li);
  }
  return flow;
}

function renderTiles(section, variant) {
  const grid = node("div", `profile-tiles profile-tiles--${variant}`);
  for (const item of section.items) {
    const tile = node("article", "profile-tile");
    if (typeof item === "string") {
      tile.append(node("strong", "", item));
    } else {
      if (item.status) tile.append(node("span", "tile-status", item.status));
      tile.append(
        item.label ? node("strong", "", item.label) : document.createTextNode(""),
        item.value ? node("p", "", item.value) : document.createTextNode(""),
        item.detail ? node("small", "", item.detail) : document.createTextNode("")
      );
    }
    grid.append(tile);
  }
  return grid;
}

function renderMetrics(section) {
  const grid = node("div", "profile-facts profile-facts--section");
  for (const item of section.items) {
    const fact = node("article", "profile-fact");
    if (typeof item === "string") {
      fact.append(node("strong", "", item));
    } else {
      fact.append(
        node("span", "", item.label),
        node("strong", "", item.value),
        item.detail ? node("small", "", item.detail) : document.createTextNode("")
      );
    }
    grid.append(fact);
  }
  return grid;
}

function renderSection(section) {
  const wrapper = node("section", `profile-section profile-section--${section.type}`);

  if (section.heading) wrapper.append(node("h3", "", section.heading));

  if (section.type === "quote") {
    wrapper.append(node("blockquote", "", section.body));
    return wrapper;
  }

  if (section.body) wrapper.append(node("p", "profile-section-copy", section.body));

  if (!section.items.length) return wrapper;

  if (section.type === "flow") wrapper.append(renderFlow(section));
  else if (section.type === "metrics") wrapper.append(renderMetrics(section));
  else if (["comparison", "layers", "roadmap"].includes(section.type)) {
    wrapper.append(renderTiles(section, section.type));
  } else if (section.type === "evidence") {
    wrapper.append(renderList(section, "profile-list profile-list--evidence"));
  } else {
    wrapper.append(renderList(section));
  }

  return wrapper;
}

function renderPlaceholder(target) {
  target.replaceChildren();
  target.classList.add("knowledge-profile--placeholder");

  const visual = node("div", "placeholder-orbit", "OKF");
  const copy = node("div", "placeholder-copy");
  copy.append(
    node("span", "profile-eyebrow", "Knowledge profile"),
    node("h2", "", "A subject profile will materialise here"),
    node(
      "p",
      "",
      "Ask about Icaro, a project, the transformation method or collaboration fit. The response is grounded in the public OKF base and composed as a complete profile."
    )
  );
  const hints = node("div", "placeholder-hints");
  for (const hint of ["Identity", "Architecture", "Evidence", "Boundaries", "Roadmap"]) {
    hints.append(node("span", "", hint));
  }
  copy.append(hints);
  target.append(visual, copy);
  target.removeAttribute("data-open");
}

export function renderAnswerCard(target, rawPayload) {
  if (!rawPayload) {
    renderPlaceholder(target);
    return null;
  }

  const payload = normalizeAnswer(rawPayload);
  target.replaceChildren();
  target.classList.remove("knowledge-profile--placeholder");
  target.dataset.tone = payload.card.tone;
  target.dataset.layout = payload.card.layout;
  target.dataset.kind = payload.card.kind;

  const close = node("button", "profile-close", "Close profile");
  close.type = "button";
  close.addEventListener("click", () => {
    target.removeAttribute("data-open");
  });

  const masthead = node("header", "profile-masthead");
  const identity = node("div", "profile-identity-mark", payload.card.monogram || initials(payload.card.title));
  const heading = node("div", "profile-heading");
  heading.append(
    node("span", "profile-eyebrow", payload.card.eyebrow),
    node("h2", "", payload.card.title),
    payload.card.subtitle ? node("p", "profile-subtitle", payload.card.subtitle) : document.createTextNode("")
  );
  masthead.append(identity, heading);

  const meta = node("div", "profile-meta");
  for (const [label, value] of [
    ["Status", payload.card.status],
    ["Domain", payload.card.domain],
    ["Current phase", payload.card.phase]
  ]) {
    if (!value) continue;
    const item = node("div", "profile-meta-item");
    item.append(node("span", "", label), node("strong", "", value));
    meta.append(item);
  }

  const summary = node("div", "profile-summary");
  summary.append(node("p", "", payload.card.summary));

  if (payload.card.badges.length) {
    const badges = node("div", "profile-badges");
    for (const badge of payload.card.badges) badges.append(node("span", "", badge));
    summary.append(badges);
  }

  const facts = node("div", "profile-facts");
  for (const fact of payload.card.facts) {
    const article = node("article", "profile-fact");
    article.append(
      node("span", "", fact.label),
      node("strong", "", fact.value),
      fact.detail ? node("small", "", fact.detail) : document.createTextNode("")
    );
    facts.append(article);
  }

  const body = node("div", "profile-body");
  for (const section of payload.card.sections) body.append(renderSection(section));

  const footer = node("footer", "profile-footer");
  const actions = node("div", "profile-actions");
  for (const action of payload.card.actions) {
    const link = node("a", `profile-action profile-action--${action.kind}`, action.label);
    link.href = action.href;
    link.target = "_blank";
    link.rel = "noreferrer";
    actions.append(link);
  }
  footer.append(actions);

  if (payload.sources.length) {
    footer.append(node("small", "profile-sources", payload.sources.join(" · ")));
  }

  target.append(close, masthead, meta, summary);
  if (payload.card.facts.length) target.append(facts);
  target.append(body, footer);
  target.setAttribute("data-open", "true");

  return payload;
}
