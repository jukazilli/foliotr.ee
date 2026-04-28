import {
  derivePortfolioCommunitySemantics,
  buildPortfolioCommunityBlockStateFromBlocks,
} from "@/lib/templates/portfolio-community-semantics";
import type {
  ResumeProjection,
  ResumeProjectionInput,
  ResumeProjectionSection,
} from "@/lib/templates/resume/types";

export function projectPortfolioCommunityResume(
  input: ResumeProjectionInput
): ResumeProjection {
  const blockState = buildPortfolioCommunityBlockStateFromBlocks(input.blocks);
  const semantics = derivePortfolioCommunitySemantics({
    profile: input.profile,
    version: input.version,
    blockConfigs: blockState.configs,
    visibility: blockState.visibility,
  });
  const showPhoto = input.config?.showPhoto ?? false;
  const showLinks = input.config?.showLinks ?? true;
  const accent = input.config?.accentColor || "#474306";
  const visibleSectionOrder = (
    input.config?.sections?.length
      ? input.config.sections
      : [
          "summary",
          "behavioral-analysis",
          "education",
          "experience",
          "projects",
          "highlights",
          "skills",
          "links",
        ]
  ) as string[];
  if (
    input.behavioralAnalysis &&
    !visibleSectionOrder.includes("behavioral-analysis")
  ) {
    const summaryIndex = visibleSectionOrder.indexOf("summary");
    visibleSectionOrder.splice(
      summaryIndex >= 0 ? summaryIndex + 1 : 0,
      0,
      "behavioral-analysis"
    );
  }

  const sectionMap = new Map<string, ResumeProjectionSection>();

  if (semantics.about.visible && semantics.about.body) {
    sectionMap.set("summary", {
      key: "summary",
      title: semantics.about.title || "Resumo",
      body: semantics.about.body,
    });
  }

  if (semantics.experience.visible && semantics.experience.items.length > 0) {
    sectionMap.set("experience", {
      key: "experience",
      title: semantics.experience.title || "Experiencia",
      items: semantics.experience.items.map((experience) => ({
        id: experience.id,
        company: experience.company,
        role: experience.role,
        period: experience.period,
        location: experience.location,
        description: experience.description,
        current: experience.current,
      })),
    });
  }

  if (semantics.education.visible && semantics.education.items.length > 0) {
    sectionMap.set("education", {
      key: "education",
      title: semantics.education.title || "Formacao",
      items: semantics.education.items.map((education) => ({
        id: education.id,
        institution: education.institution,
        degree: education.degree,
        field: education.field,
        period: education.period,
        description: education.description,
        current: education.current,
      })),
    });
  }

  if (semantics.work.visible && semantics.work.items.length > 0) {
    const resumeProjects = semantics.work.items
      .slice(0, semantics.work.maxItems)
      .filter((item) => item.source === "project" && item.title.trim().length > 0)
      .map((item) => ({
        id: item.projectId ?? item.key,
        title: item.title,
        description: item.description,
        href: item.href,
        tags: [],
      }));

    if (resumeProjects.length > 0) {
      sectionMap.set("projects", {
        key: "projects",
        title: semantics.work.title || "Projetos",
        items: resumeProjects,
      });
    }
  }

  if (semantics.selections.achievements.length > 0) {
    sectionMap.set("highlights", {
      key: "highlights",
      title: "Destaques",
      items: semantics.selections.achievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        metric: achievement.metric ?? "",
        description: achievement.description ?? "",
      })),
    });
  }

  if (semantics.selections.skills.length > 0) {
    const groups = semantics.selections.skills.reduce<Record<string, string[]>>(
      (acc, skill) => {
        const category = skill.category || "Principal";
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill.name);
        return acc;
      },
      {}
    );

    sectionMap.set("skills", {
      key: "skills",
      title: "Competencias",
      groups: Object.entries(groups).map(([category, items]) => ({ category, items })),
    });
  }

  if (semantics.contact.visible && semantics.contact.links.length > 0) {
    sectionMap.set("links", {
      key: "links",
      title: semantics.contact.title || "Contato",
      items: semantics.contact.links.map((item) => ({
        label: item.label,
        href: item.href,
        kind:
          item.type === "contact"
            ? "contact"
            : item.type === "proof"
              ? "proof"
              : "link",
      })),
    });
  }

  if (input.behavioralAnalysis) {
    sectionMap.set("behavioral-analysis", {
      key: "behavioral-analysis",
      title: "Analise comportamental",
      analysis: input.behavioralAnalysis,
    });
  }

  const sections = visibleSectionOrder
    .map((key) => sectionMap.get(key))
    .filter((section): section is ResumeProjectionSection => Boolean(section));

  return {
    templateSlug: input.templateSlug,
    theme: {
      background: "#FFFBE6",
      surface: "#FFFFFF",
      ink: "#03045E",
      muted: "#5C6784",
      accent,
      accentSoft: "#F5EE84",
      border: "rgba(3,4,94,0.12)",
      fontFamily:
        "var(--font-template-portfolio), Poppins, ui-sans-serif, system-ui, sans-serif",
    },
    header: {
      displayName: semantics.header.displayName,
      headline: semantics.header.headline,
      summary: semantics.about.body,
      location: semantics.header.location,
      publicEmail: semantics.header.publicEmail,
      phone: semantics.header.phone,
      avatarUrl: showPhoto ? semantics.header.avatarUrl : "",
      links: showLinks
        ? semantics.contact.links.map((item) => ({
            label: item.label,
            href: item.href,
            kind:
              item.type === "contact"
                ? "contact"
                : item.type === "proof"
                  ? "proof"
                  : "link",
          }))
        : [],
    },
    sections,
    showPhoto,
    showLinks,
    rules: {
      enters: [
        "hero -> cabecalho objetivo",
        "about -> resumo textual",
        "education -> formacao objetiva",
        "experience -> experiencia objetiva",
        "work -> projetos concisos",
        "contact -> links e reviews",
      ],
      collapses: [
        "hero image -> avatar opcional",
        "work cards -> lista textual curta",
        "contact image -> removida",
      ],
      hides: [
        "ornamentos do hero",
        "imagens decorativas do contato",
        "imagens de projetos no modo impressao",
      ],
      textOnly: [
        "about",
        "descricoes de experiencia",
        "descricoes de formacao",
        "descricoes de projetos",
        "rotulos de reviews",
      ],
    },
  };
}
