const OKF_BASE = new URL("/okf/", document.baseURI);

async function getJson(path) {
  const response = await fetch(new URL(path, OKF_BASE), {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Unable to load OKF resource: ${path}`);
  }

  return response.json();
}

export async function loadPublicKnowledge() {
  const manifest = await getJson("manifest.json");

  const [profile, practice, questions, designSkill, ...projects] = await Promise.all([
    getJson(manifest.profile),
    getJson(manifest.practice),
    getJson(manifest.questions),
    getJson(manifest.designSkill),
    ...manifest.projects.map(getJson)
  ]);

  return {
    manifest,
    profile,
    practice,
    designSkill,
    questions: questions.items,
    projects
  };
}

export function findQuestion(knowledge, questionId) {
  return knowledge.questions.find((question) => question.id === questionId) || null;
}

export function findProject(knowledge, projectId) {
  return knowledge.projects.find((project) => project.id === projectId) || null;
}
