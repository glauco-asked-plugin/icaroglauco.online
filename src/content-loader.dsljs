const LIST_SECTION_KEYS = new Set([
  "bullets",
  "contentNotes",
  "identityHighlights",
  "profileHighlights",
  "quickPrompts"
]);

const BLOCK_SECTION_KEYS = new Set([
  "deepDives",
  "identityMilestones",
  "identityPagerSlides"
]);

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) {
    return { frontmatter: {}, body: markdown };
  }

  const frontmatter = match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex < 0) return acc;

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      acc[key] = parseScalar(rawValue);
      return acc;
    }, {});

  return {
    frontmatter,
    body: markdown.slice(match[0].length)
  };
}

function parseScalar(value) {
  if (!value) return "";
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  if (value === "true") return true;
  if (value === "false") return false;

  return value;
}

function splitSections(body) {
  const lines = body.split(/\r?\n/);
  const sections = new Map();
  let currentKey = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      currentKey = line.slice(3).trim();
      sections.set(currentKey, []);
      continue;
    }

    if (!currentKey) continue;
    sections.get(currentKey).push(line);
  }

  return sections;
}

function collapseText(lines) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");
}

function parseList(lines) {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function parseBlockHeading(sectionKey, heading) {
  const [left, ...rightParts] = heading.split("|").map((part) => part.trim());

  if (sectionKey === "deepDives") {
    return {
      kicker: left || "Camada",
      title: rightParts.join(" | ") || left || "Leitura"
    };
  }

  if (sectionKey === "identityMilestones") {
    return {
      year: left || "",
      title: rightParts.join(" | ") || left || "Marco"
    };
  }

  return {
    title: heading.trim() || "Leitura"
  };
}

function parseBlocks(lines, sectionKey) {
  const blocks = [];
  let currentBlock = null;

  function flushBlock() {
    if (!currentBlock) return;

    const body = collapseText(currentBlock.bodyLines);
    const list = currentBlock.listItems;
    const headingData = parseBlockHeading(sectionKey, currentBlock.heading);

    blocks.push({
      ...headingData,
      ...(body ? { body } : {}),
      ...(list.length ? { list } : {})
    });
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.startsWith("### ")) {
      flushBlock();
      currentBlock = {
        heading: line.slice(4).trim(),
        bodyLines: [],
        listItems: []
      };
      continue;
    }

    if (!currentBlock) continue;

    if (line.startsWith("- ")) {
      currentBlock.listItems.push(line.slice(2).trim());
      continue;
    }

    currentBlock.bodyLines.push(rawLine);
  }

  flushBlock();
  return blocks;
}

function parseStructuredMarkdown(markdown) {
  const { frontmatter, body } = parseFrontmatter(markdown);
  const sections = splitSections(body);
  const data = { ...frontmatter };

  for (const [sectionKey, lines] of sections.entries()) {
    if (LIST_SECTION_KEYS.has(sectionKey)) {
      const list = parseList(lines);
      if (list.length) data[sectionKey] = list;
      continue;
    }

    if (BLOCK_SECTION_KEYS.has(sectionKey)) {
      const blocks = parseBlocks(lines, sectionKey);
      if (blocks.length) data[sectionKey] = blocks;
      continue;
    }

    const text = collapseText(lines);
    if (text) data[sectionKey] = text;
  }

  return data;
}

async function loadSingleScreen(screen) {
  const markdownPath = screen.markdownPath || `/content/sections/${screen.id}.md`;

  try {
    const response = await fetch(markdownPath, {
      headers: {
        Accept: "text/markdown,text/plain;q=0.9,*/*;q=0.1"
      }
    });

    if (!response.ok) {
      return screen;
    }

    const markdown = await response.text();
    const parsed = parseStructuredMarkdown(markdown);

    return {
      ...screen,
      ...parsed,
      markdownPath,
      contentSource: "markdown"
    };
  } catch {
    return screen;
  }
}

export async function loadScreenMarkdownContent(baseScreens) {
  return Promise.all(baseScreens.map((screen) => loadSingleScreen(screen)));
}

export { parseStructuredMarkdown };
