import { formatDate, getPlatformLabel, getPlatformUrl } from "@/lib/utils";
import type { RenderablePageBlock } from "@/components/templates/types";
import type {
  ResumeProjection,
  ResumeProjectionInput,
  ResumeProjectionLink,
  ResumeProjectionSection,
} from "@/lib/templates/resume/types";

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatPeriod(
  startDate: string | Date,
  endDate: string | Date | null,
  current: boolean
) {
  const start = formatDate(startDate, "year-month");
  if (current) return `${start} - Atual`;
  if (!endDate) return start;
  return `${start} - ${formatDate(endDate, "year-month")}`;
}

function sortBlocks(blocks: RenderablePageBlock[]) {
  return [...blocks].sort((left, right) => left.order - right.order);
}

function getVisibleBlock(blocks: RenderablePageBlock[], blockType: string) {
  return sortBlocks(blocks).find((block) => block.visible && block.blockType === blockType) ?? null;
}

function getSelectedByIds<T extends { id: string; order?: number }>(items: T[], ids?: string[]) {
  if (!ids?.length) {
    return [...items].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
  }

  const idSet = new Set(ids);
  return [...items]
    .filter((item) => idSet.has(item.id))
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0));
}

function dedupeLinks(links: ResumeProjectionLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.kind}:${link.label}:${link.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function projectPortfolioCommunityResume(
  input: ResumeProjectionInput
): ResumeProjection {
  const { profile, version, config } = input;
  const heroBlock = getVisibleBlock(input.blocks, "portfolio.hero");
  const aboutBlock = getVisibleBlock(input.blocks, "portfolio.about");
  const experienceBlock = getVisibleBlock(input.blocks, "portfolio.experience");
  const workBlock = getVisibleBlock(input.blocks, "portfolio.work");
  const contactBlock = getVisibleBlock(input.blocks, "portfolio.contact");

  const heroConfig = asRecord(heroBlock?.config);
  const aboutConfig = asRecord(aboutBlock?.config);
  const experienceConfig = asRecord(experienceBlock?.config);
  const workConfig = asRecord(workBlock?.config);
  const contactConfig = asRecord(contactBlock?.config);

  const showPhoto = config?.showPhoto ?? false;
  const showLinks = config?.showLinks ?? true;
  const accent = config?.accentColor || "#474306";
  const selectedExperiences = getSelectedByIds(
    profile.experiences,
    version?.selectedExperienceIds
  );
  const selectedProjects = getSelectedByIds(profile.projects, version?.selectedProjectIds);
  const selectedSkills = getSelectedByIds(profile.skills, version?.selectedSkillIds);
  const selectedAchievements = getSelectedByIds(
    profile.achievements,
    version?.selectedAchievementIds
  );
  const selectedProofs = getSelectedByIds(profile.proofs ?? [], version?.selectedProofIds);
  const selectedLinks = getSelectedByIds(profile.links, version?.selectedLinkIds);

  const summary = readString(version?.customBio) || profile.bio || readString(aboutConfig.body);
  const visibleSectionOrder = (config?.sections?.length ? config.sections : [
    "summary",
    "experience",
    "projects",
    "highlights",
    "skills",
    "links",
  ]) as string[];

  const sectionMap = new Map<string, ResumeProjectionSection>();

  if ((aboutBlock?.visible ?? true) && summary) {
    sectionMap.set("summary", {
      key: "summary",
      title: readString(aboutConfig.title) || "Resumo",
      body: summary,
    });
  }

  if ((experienceBlock?.visible ?? true) && selectedExperiences.length > 0) {
    sectionMap.set("experience", {
      key: "experience",
      title: readString(experienceConfig.title) || "Experience",
      items: selectedExperiences.map((experience) => ({
        id: experience.id,
        company: experience.company,
        role: experience.role,
        period: formatPeriod(experience.startDate, experience.endDate, experience.current),
        location: experience.location ?? "",
        description: experience.description ?? "",
        current: experience.current,
      })),
    });
  }

  if ((workBlock?.visible ?? true) && selectedProjects.length > 0) {
    sectionMap.set("projects", {
      key: "projects",
      title: readString(workConfig.title) || "Work",
      items: selectedProjects.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description ?? "",
        href: project.url ?? project.repoUrl ?? "",
        tags: project.tags ?? [],
      })),
    });
  }

  if (selectedAchievements.length > 0) {
    sectionMap.set("highlights", {
      key: "highlights",
      title: "Destaques",
      items: selectedAchievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        metric: achievement.metric ?? "",
        description: achievement.description ?? "",
      })),
    });
  }

  if (selectedSkills.length > 0) {
    const groups = selectedSkills.reduce<Record<string, string[]>>((acc, skill) => {
      const category = skill.category || "Core";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill.name);
      return acc;
    }, {});

    sectionMap.set("skills", {
      key: "skills",
      title: "Competencias",
      groups: Object.entries(groups).map(([category, items]) => ({ category, items })),
    });
  }

  const contactLinks: ResumeProjectionLink[] = [
    ...(profile.publicEmail
      ? [{ label: profile.publicEmail, href: `mailto:${profile.publicEmail}`, kind: "contact" as const }]
      : []),
    ...selectedLinks.map((link) => ({
      label: link.label ?? getPlatformLabel(link.platform),
      href: getPlatformUrl(link.platform, link.url),
      kind: "link" as const,
    })),
    ...selectedProofs
      .filter((proof) => proof.url)
      .map((proof) => ({
        label: proof.metric ? `${proof.title} - ${proof.metric}` : proof.title,
        href: proof.url as string,
        kind: "proof" as const,
      })),
  ];

  if ((contactBlock?.visible ?? true) && contactLinks.length > 0) {
    sectionMap.set("links", {
      key: "links",
      title: readString(contactConfig.title) || "Contact",
      items: dedupeLinks(contactLinks),
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
      fontFamily: "var(--font-template-portfolio), Poppins, ui-sans-serif, system-ui, sans-serif",
    },
    header: {
      displayName:
        profile.displayName ||
        profile.user?.name ||
        readString(heroConfig.name) ||
        "",
      headline:
        readString(version?.customHeadline) ||
        profile.headline ||
        readString(heroConfig.headline),
      summary,
      location: profile.location ?? "",
      publicEmail: profile.publicEmail ?? profile.user?.email ?? "",
      phone: profile.phone ?? "",
      avatarUrl: showPhoto ? profile.avatarUrl ?? "" : "",
      links: showLinks ? dedupeLinks(contactLinks) : [],
    },
    sections,
    showPhoto,
    showLinks,
    rules: {
      enters: [
        "hero -> cabecalho recruiter-friendly",
        "about -> resumo textual",
        "experience -> experiencia objetiva",
        "work -> projetos concisos",
        "contact -> links e provas",
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
        "experience descriptions",
        "project descriptions",
        "proof labels",
      ],
    },
  };
}
