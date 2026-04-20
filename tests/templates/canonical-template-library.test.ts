import { describe, expect, it, vi } from "vitest";
import { portfolioCommunityManifest } from "@/assets/template/portfolio-community/manifest";
import {
  evaluateTemplateEligibility,
  listCanonicalTemplates,
} from "@/lib/server/domain/canonical-templates";

function createDb() {
  return {
    template: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };
}

describe("canonical template library", () => {
  it("evaluates missing profile requirements from persisted eligibility", () => {
    const eligibility = evaluateTemplateEligibility(
      {
        requiredProfileFields: ["displayName", "headline", "bio"],
        requiresAvatar: true,
        minExperienceItems: 0,
        minProjectItems: 0,
        minExperienceOrProjectItems: 1,
        minLinkItems: 1,
        minProofItems: 0,
        minLinkOrProofItems: 0,
      },
      {
        displayName: "",
        headline: "",
        bio: "",
        avatarUrl: null,
        user: { name: null },
        experiences: [],
        projects: [],
        links: [],
        proofs: [],
      }
    );

    expect(eligibility.eligible).toBe(false);
    expect(eligibility.issues.map((issue) => issue.key)).toEqual(
      expect.arrayContaining([
        "displayName",
        "headline",
        "bio",
        "avatarUrl",
        "experienceOrProject",
        "links",
      ])
    );
  });

  it("passes the gate when the profile satisfies persisted eligibility", () => {
    const eligibility = evaluateTemplateEligibility(
      {
        requiredProfileFields: ["displayName", "headline", "bio"],
        requiresAvatar: true,
        minExperienceItems: 0,
        minProjectItems: 0,
        minExperienceOrProjectItems: 1,
        minLinkItems: 1,
        minProofItems: 0,
        minLinkOrProofItems: 0,
      },
      {
        displayName: "Juliano Pedroso",
        headline: "Product designer",
        bio: "Designer focado em portfolio, produto e experiencia.",
        avatarUrl: "/uploads/juliano/avatar.png",
        user: { name: "Juliano Pedroso" },
        experiences: [{ id: "exp_1" }],
        projects: [],
        links: [{ id: "link_1" }],
        proofs: [],
      }
    );

    expect(eligibility.eligible).toBe(true);
    expect(eligibility.issues).toEqual([]);
  });

  it("allows portfolio-community with only the completed base profile", () => {
    const eligibility = evaluateTemplateEligibility(portfolioCommunityManifest.eligibility, {
      displayName: "Juliano Zilli",
      headline: "Template e curriculo",
      bio: "Analista de sistemas com foco em portfolio e curriculo.",
      avatarUrl: "/api/assets/proxy?key=uploads/avatar.png",
      user: { name: "Juliano Zilli" },
      experiences: [],
      projects: [],
      links: [],
      proofs: [],
    });

    expect(eligibility.eligible).toBe(true);
    expect(eligibility.issues).toEqual([]);
  });

  it("lists persisted canonical templates without source-package merge", async () => {
    const db = createDb();

    db.template.findMany.mockResolvedValue([
      {
        id: "template_1",
        slug: "portfolio-community",
        name: "Portfolio Community",
        description: "Template canonico",
        thumbnail: "/template-assets/portfolio-community/cover.png",
        coverUrl: "/template-assets/portfolio-community/cover.png",
        referenceUrl: null,
        category: "Portfolio",
        tags: ["canonico", "editor-ready"],
        libraryStatus: "available",
        origin: "Local bundle",
        summary: "Resumo",
        detail: "Detalhe",
        sortOrder: 0,
        eligibility: {
          requiredProfileFields: ["displayName"],
          requiresAvatar: true,
          minExperienceItems: 0,
          minProjectItems: 0,
          minExperienceOrProjectItems: 1,
          minLinkItems: 1,
          minProofItems: 0,
          minLinkOrProofItems: 0,
        },
        resumeDefaults: {
          sections: ["summary"],
          layout: "classic",
          accentColor: "#474306",
          showPhoto: false,
          showLinks: true,
        },
        restrictions: {
          themeLocked: true,
          fontsLocked: true,
          colorsLocked: true,
          identityLocked: true,
          layoutLocked: true,
        },
        isActive: true,
        version: 1,
        source: "local-bundle",
        sourceNodeId: null,
        theme: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        blockDefs: [{ id: "def_hero" }],
      },
    ]);

    const templates = await listCanonicalTemplates(db as never);

    expect(templates).toHaveLength(1);
    expect(templates[0]).toMatchObject({
      slug: "portfolio-community",
      coverUrl: "/template-assets/portfolio-community/cover.png",
      detailHref: "/templates/portfolio-community",
      libraryStatus: "available",
      isCanonical: true,
    });
  });
});
