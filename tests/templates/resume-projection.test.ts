import { describe, expect, it } from "vitest";
import { resolveTemplateResumeProjection } from "@/lib/templates/resume/resolver";

const profile = {
  displayName: "Juliano Pedroso",
  headline: "Product Designer",
  bio: "Designer focado em produto e narrativa visual.",
  avatarUrl: "/uploads/user/avatar.png",
  location: "Sao Paulo, BR",
  publicEmail: "juliano@example.com",
  phone: "+55 11 99999-9999",
  user: {
    name: "Juliano Pedroso",
    email: "juliano@example.com",
    username: "juliano",
  },
  experiences: [
    {
      id: "exp_1",
      company: "FolioTree",
      role: "Lead Designer",
      description: "Liderou produto, design system e narrativa do template.",
      startDate: new Date("2023-01-01"),
      endDate: null,
      current: true,
      location: "Remote",
      order: 0,
    },
  ],
  educations: [],
  skills: [
    { id: "skill_1", name: "Design Systems", category: "Core", order: 0 },
    { id: "skill_2", name: "UX Writing", category: "Core", order: 1 },
  ],
  projects: [
    {
      id: "project_1",
      title: "Portfolio Community",
      description: "Template canonico com fidelidade ao layout original.",
      url: "https://example.com/project",
      repoUrl: null,
      tags: ["portfolio", "template"],
      featured: true,
      order: 0,
    },
  ],
  achievements: [
    {
      id: "achievement_1",
      title: "Melhoria de conversao",
      metric: "+28%",
      description: "Otimizou clareza e velocidade de leitura.",
      order: 0,
    },
  ],
  links: [
    {
      id: "link_1",
      platform: "linkedin",
      url: "juliano-linkedin",
      label: "LinkedIn",
      order: 0,
    },
  ],
  proofs: [
    {
      id: "proof_1",
      title: "Case completo",
      metric: "Publicacao",
      url: "https://example.com/proof",
      order: 0,
    },
  ],
} as never;

const blocks = [
  { id: "hero", blockType: "portfolio.hero", visible: true, order: 0, config: {}, parentId: null },
  { id: "about", blockType: "portfolio.about", visible: true, order: 1, config: { title: "about." }, parentId: null },
  { id: "experience", blockType: "portfolio.experience", visible: true, order: 2, config: { title: "experience" }, parentId: null },
  { id: "work", blockType: "portfolio.work", visible: true, order: 3, config: { title: "work." }, parentId: null },
  { id: "contact", blockType: "portfolio.contact", visible: true, order: 4, config: { title: "contact." }, parentId: null },
] as never;

describe("resume projection", () => {
  it("derives recruiter-friendly sections from the same template blocks and version selection", () => {
    const projection = resolveTemplateResumeProjection({
      templateSlug: "portfolio-community",
      blocks,
      profile,
      version: {
        customHeadline: "Senior Product Designer",
        customBio: "Resumo adaptado para leitura rapida.",
        selectedExperienceIds: ["exp_1"],
        selectedProjectIds: ["project_1"],
        selectedSkillIds: ["skill_1", "skill_2"],
        selectedAchievementIds: ["achievement_1"],
        selectedProofIds: ["proof_1"],
        selectedHighlightIds: [],
        selectedLinkIds: ["link_1"],
      },
      config: {
        sections: ["summary", "experience", "projects", "highlights", "skills", "links"],
        layout: "classic",
        accentColor: "#474306",
        showPhoto: false,
        showLinks: true,
      } as never,
    });

    expect(projection.header.displayName).toBe("");
    expect(projection.header.headline).toBe("Senior Product Designer");
    expect(projection.sections.map((section) => section.key)).toEqual([
      "summary",
      "experience",
      "projects",
      "highlights",
      "skills",
      "links",
    ]);
    expect(projection.rules.collapses).toContain("work cards -> lista textual curta");
  });

  it("converts contact into recruiter-friendly links and proofs without decorative images", () => {
    const projection = resolveTemplateResumeProjection({
      templateSlug: "portfolio-community",
      blocks,
      profile,
      version: {
        selectedExperienceIds: ["exp_1"],
        selectedProjectIds: ["project_1"],
        selectedSkillIds: [],
        selectedAchievementIds: [],
        selectedProofIds: ["proof_1"],
        selectedHighlightIds: [],
        selectedLinkIds: ["link_1"],
      },
      config: {
        sections: ["links"],
        layout: "classic",
        accentColor: "",
        showPhoto: false,
        showLinks: true,
      } as never,
    });

    const linksSection = projection.sections[0];
    expect(linksSection.key).toBe("links");
    if (linksSection.key !== "links") throw new Error("invalid section type");
    expect(linksSection.items.some((item) => item.kind === "proof")).toBe(true);
    expect(projection.showPhoto).toBe(false);
    expect(projection.rules.hides).toContain("imagens decorativas do contato");
  });

  it("fails clearly when a template slug has no registered resume implementation", () => {
    expect(() =>
      resolveTemplateResumeProjection({
        templateSlug: "unknown-template",
        blocks,
        profile,
        version: null,
        config: null,
      })
    ).toThrow(/Missing template implementation for slug "unknown-template"/);
  });
});
