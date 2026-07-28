function toneFor(project) {
  if (project?.kind === "flagship-platform") return "emerald";
  if (project?.id?.includes("isocon")) return "amber";
  if (project?.id?.includes("macroobras")) return "cyan";
  return "neutral";
}

function linksFor(subject) {
  const actions = [];
  if (subject?.links?.prototype) {
    actions.push({ label: "Open prototype", href: subject.links.prototype, kind: "primary" });
  }
  if (subject?.links?.repository) {
    actions.push({ label: "Open repository", href: subject.links.repository, kind: "secondary" });
  }
  if (subject?.links?.github) {
    actions.push({ label: "Open GitHub profile", href: subject.links.github, kind: "primary" });
  }
  return actions;
}

function projectProfile(project) {
  return {
    answer: `${project.name} is ${project.portfolioRole.toLowerCase()} ${project.productResponse}`,
    card: {
      kind: "project-profile",
      subjectId: project.id,
      monogram: project.monogram,
      eyebrow: project.portfolioRole,
      title: project.name,
      subtitle: project.headline,
      status: project.status,
      domain: project.domain,
      phase: project.currentPhase,
      summary: project.productResponse,
      tone: toneFor(project),
      layout: "architecture",
      badges: project.technologies?.slice(0, 6) || [],
      facts: [
        { label: "Actors", value: String(project.actors?.length || 0), detail: "explicit operating roles" },
        { label: "Product layers", value: String(project.productLayers?.length || 0), detail: "connected surfaces and responsibilities" },
        { label: "Implementation", value: String(project.implemented?.length || 0), detail: "documented capabilities" }
      ],
      sections: [
        {
          type: "narrative",
          heading: "The challenge",
          body: project.challenge,
          items: []
        },
        {
          type: "layers",
          heading: "Product composition",
          body: "The system is treated as a connected product profile rather than a list of pages.",
          items: (project.productLayers || []).map((layer) => ({
            label: layer.name,
            value: layer.description,
            detail: ""
          }))
        },
        {
          type: "flow",
          heading: "Operational or knowledge flow",
          body: "",
          items: project.architectureFlow || []
        },
        {
          type: "evidence",
          heading: "Implemented and validated evidence",
          body: "",
          items: project.evidence || project.implemented || []
        },
        ...(project.boundaries?.length
          ? [{
              type: "list",
              heading: "Current boundaries",
              body: "",
              items: project.boundaries
            }]
          : []),
        {
          type: "roadmap",
          heading: "Current direction",
          body: "Planned work is shown separately from implemented evidence.",
          items: (project.roadmap || []).map((item, index) => ({
            label: `Phase ${index + 1}`,
            value: item,
            detail: "Planned"
          }))
        }
      ],
      actions: linksFor(project)
    },
    sources: [`okf://${project.id}`]
  };
}

function profileAnswer(profile, projects) {
  return {
    answer: profile.wizardMeaning,
    card: {
      kind: "person-profile",
      subjectId: profile.id,
      monogram: "IG",
      eyebrow: "Professional profile",
      title: profile.name,
      subtitle: profile.displayTitle,
      status: profile.availability,
      domain: profile.professionalTitle,
      phase: "Building one flagship and two active vertical systems",
      summary: profile.headline,
      tone: "emerald",
      layout: "profile",
      badges: profile.portfolioShape?.domains || [],
      facts: [
        { label: "Flagship", value: String(profile.portfolioShape?.flagshipProjects || 1), detail: "Cognoscere / Lumira" },
        { label: "Active vertical systems", value: String(profile.portfolioShape?.activeVerticalSystems || 2), detail: "Isocon and MacroObras" },
        { label: "Practice stages", value: String(profile.transformationPractice?.length || 5), detail: "from perception to refinement" }
      ],
      sections: [
        {
          type: "quote",
          heading: "Transformation thesis",
          body: profile.thesis,
          items: []
        },
        {
          type: "flow",
          heading: "How the wizard works",
          body: "The metaphor is expressed as a repeatable product practice.",
          items: profile.transformationPractice.map((stage) => ({
            label: stage.stage,
            value: stage.description,
            detail: ""
          }))
        },
        {
          type: "layers",
          heading: "Capability domains",
          body: "",
          items: profile.capabilityDomains.map((capability) => ({
            label: capability.name,
            value: capability.description,
            detail: ""
          }))
        },
        {
          type: "comparison",
          heading: "Current product focus",
          body: "",
          items: projects.map((project) => ({
            label: project.name,
            value: project.domain,
            detail: project.currentPhase
          }))
        },
        {
          type: "evidence",
          heading: "Working principles",
          body: "",
          items: profile.workingPrinciples
        },
        {
          type: "list",
          heading: "Best project fit",
          body: "",
          items: profile.projectFit
        }
      ],
      actions: linksFor(profile)
    },
    sources: [`okf://${profile.id}`, ...projects.map((project) => `okf://${project.id}`)]
  };
}

function practiceAnswer(practice) {
  return {
    answer: practice.summary,
    card: {
      kind: "practice-profile",
      subjectId: practice.id,
      monogram: "TM",
      eyebrow: "Professional practice",
      title: practice.name,
      subtitle: "From ambiguous situation to executable and evidenced software",
      status: "Repeatable working model",
      domain: "Requirements, product architecture and implementation",
      phase: "Applied across education, procurement and construction",
      summary: practice.summary,
      tone: "violet",
      layout: "timeline",
      badges: ["Domain modelling", "Interface", "Governed AI", "Evidence"],
      facts: [
        { label: "Stages", value: String(practice.stages.length), detail: "continuous transformation path" },
        { label: "Engagement steps", value: String(practice.engagementModel.length), detail: "from interview to operational validation" },
        { label: "AI pattern", value: String(practice.aiPattern.length), detail: "controlled inference chain" }
      ],
      sections: [
        {
          type: "roadmap",
          heading: "Transformation stages",
          body: "Each stage creates explicit outputs for the next one.",
          items: practice.stages.map((stage) => ({
            label: `${stage.order}. ${stage.name}`,
            value: stage.question,
            detail: stage.outputs.join(" · ")
          }))
        },
        {
          type: "flow",
          heading: "Applied-AI responsibility",
          body: "The model is one participant in a larger operational chain.",
          items: practice.aiPattern
        },
        {
          type: "list",
          heading: "Engagement model",
          body: "",
          items: practice.engagementModel
        }
      ],
      actions: []
    },
    sources: [`okf://${practice.id}`]
  };
}

function comparisonAnswer(projects) {
  return {
    answer: "The three active products share a transformation method while preserving distinct domain semantics: Cognoscere/Lumira structures educational knowledge and community, Isocon turns edital documents into procurement readiness, and MacroObras connects office planning to physical field evidence.",
    card: {
      kind: "portfolio-comparison",
      subjectId: "portfolio/active-products",
      monogram: "03",
      eyebrow: "Active product portfolio",
      title: "Three domains, one transformation practice",
      subtitle: "Education, procurement and construction are modelled through their own actors, evidence and operational boundaries.",
      status: "One flagship · two active vertical systems",
      domain: "Specialised software",
      phase: "Active development",
      summary: "The shared foundation is domain modelling, OKF, interface architecture and governed intelligence; the product form changes with each real operation.",
      tone: "violet",
      layout: "comparison",
      badges: projects.map((project) => project.domain),
      facts: [
        { label: "Products", value: String(projects.length), detail: "active portfolio" },
        { label: "Domains", value: String(new Set(projects.map((p) => p.domain)).size), detail: "specialised operating contexts" },
        { label: "Shared base", value: "OKF", detail: "knowledge, relations and provenance" }
      ],
      sections: [
        {
          type: "comparison",
          heading: "Product profiles",
          body: "",
          items: projects.map((project) => ({
            label: project.name,
            value: project.headline,
            detail: `${project.status} · ${project.currentPhase}`
          }))
        },
        {
          type: "layers",
          heading: "What changes by domain",
          body: "",
          items: projects.map((project) => ({
            label: project.domain,
            value: project.challenge,
            detail: project.productResponse
          }))
        },
        {
          type: "flow",
          heading: "Shared transformation",
          body: "",
          items: [
            "Read the real situation and actors",
            "Name entities, rules, permissions and evidence",
            "Separate public, protected and human-controlled knowledge",
            "Compose the interface around the operational flow",
            "Add AI with constrained responsibility",
            "Validate through visible product states and evidence"
          ]
        }
      ],
      actions: []
    },
    sources: projects.map((project) => `okf://${project.id}`)
  };
}

function hireAnswer(profile, practice, projects) {
  return {
    answer: "The strongest fit is specialised software whose domain is real but whose correct digital form is still unclear. Icaro can carry the work from situation reading and requirements through interface architecture, governed AI and staged implementation.",
    card: {
      kind: "practice-profile",
      subjectId: "practice/project-fit",
      monogram: "FIT",
      eyebrow: "Collaboration profile",
      title: "What Icaro can be hired to build",
      subtitle: "Specialised software that needs discovery, structure and implementation to remain one continuous work.",
      status: profile.availability,
      domain: "Product architecture and applied-AI engineering",
      phase: "Interview → model → interface → modules → validation",
      summary: "The work is most valuable when the request contains complex knowledge, operational rules, documents, multiple actors or an AI opportunity that needs explicit boundaries.",
      tone: "emerald",
      layout: "split",
      badges: ["Product discovery", "Operational systems", "Applied AI", "OKF"],
      facts: [
        { label: "Active references", value: String(projects.length), detail: "across three specialised domains" },
        { label: "Method stages", value: String(practice.stages.length), detail: "from situation to evidence" },
        { label: "Delivery model", value: "Staged", detail: "module-by-module implementation" }
      ],
      sections: [
        {
          type: "layers",
          heading: "Suitable project families",
          body: "",
          items: profile.projectFit.map((item) => ({ label: item, value: "", detail: "" }))
        },
        {
          type: "roadmap",
          heading: "How collaboration develops",
          body: "",
          items: practice.engagementModel.map((item, index) => ({
            label: `${index + 1}`,
            value: item,
            detail: ""
          }))
        },
        {
          type: "comparison",
          heading: "Demonstrated references",
          body: "",
          items: projects.map((project) => ({
            label: project.name,
            value: project.domain,
            detail: project.portfolioRole
          }))
        }
      ],
      actions: linksFor(profile)
    },
    sources: [`okf://${profile.id}`, `okf://${practice.id}`, ...projects.map((project) => `okf://${project.id}`)]
  };
}

function genericAnswer(message, knowledge) {
  const lower = message.toLowerCase();
  const project = knowledge.projects.find((entry) =>
    [entry.name, entry.domain, entry.id]
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9á-ú]+/)
      .filter((term) => term.length > 4)
      .some((term) => lower.includes(term))
  );

  if (project) return projectProfile(project);
  if (/wizard|profile|icaro|builder|who/.test(lower)) return profileAnswer(knowledge.profile, knowledge.projects);
  if (/method|transform|vague|requirements|process/.test(lower)) return practiceAnswer(knowledge.practice);
  if (/compare|portfolio|three|projects/.test(lower)) return comparisonAnswer(knowledge.projects);
  if (/hire|build|collaborat|service|fit/.test(lower)) return hireAnswer(knowledge.profile, knowledge.practice, knowledge.projects);

  return profileAnswer(knowledge.profile, knowledge.projects);
}

export function createStaticAnswer({ message, questionId, knowledge }) {
  const question = questionId
    ? knowledge.questions.find((entry) => entry.id === questionId)
    : null;

  if (question?.project === knowledge.profile.id) {
    return profileAnswer(knowledge.profile, knowledge.projects);
  }

  if (question?.project === knowledge.practice.id) {
    return practiceAnswer(knowledge.practice);
  }

  if (question?.project === "all") {
    return question.id === "hire"
      ? hireAnswer(knowledge.profile, knowledge.practice, knowledge.projects)
      : comparisonAnswer(knowledge.projects);
  }

  if (question?.project) {
    const project = knowledge.projects.find((entry) => entry.id === question.project);
    if (project) return projectProfile(project);
  }

  return genericAnswer(String(message || ""), knowledge);
}
