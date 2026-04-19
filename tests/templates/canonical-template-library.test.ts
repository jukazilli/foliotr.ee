import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  evaluateTemplateEligibility,
  listCanonicalTemplates,
  syncCanonicalTemplates,
} from "@/lib/server/domain/canonical-templates";
import { getCanonicalTemplateManifest } from "@/lib/templates/registry";

function createDb() {
  return {
    template: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    templateBlockDef: {
      deleteMany: vi.fn(),
      upsert: vi.fn(),
    },
  };
}

describe("canonical template library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("evaluates missing profile requirements for portfolio-community", () => {
    const manifest = getCanonicalTemplateManifest("portfolio-community");

    if (!manifest) {
      throw new Error("Missing canonical manifest");
    }

    const eligibility = evaluateTemplateEligibility(manifest, {
      displayName: "",
      headline: "",
      bio: "",
      avatarUrl: null,
      user: { name: null },
      experiences: [],
      projects: [],
      links: [],
      proofs: [],
    });

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

  it("passes the gate when the profile satisfies the manifest", () => {
    const manifest = getCanonicalTemplateManifest("portfolio-community");

    if (!manifest) {
      throw new Error("Missing canonical manifest");
    }

    const eligibility = evaluateTemplateEligibility(manifest, {
      displayName: "Juliano Pedroso",
      headline: "Product designer",
      bio: "Designer focado em portfolio, produto e experiencia.",
      avatarUrl: "/uploads/juliano/avatar.png",
      user: { name: "Juliano Pedroso" },
      experiences: [{ id: "exp_1" }],
      projects: [],
      links: [{ id: "link_1" }],
      proofs: [],
    });

    expect(eligibility.eligible).toBe(true);
    expect(eligibility.issues).toEqual([]);
  });

  it("syncs the canonical template and its block definitions", async () => {
    const db = createDb();

    db.template.upsert.mockResolvedValue({ id: "template_1" });
    db.templateBlockDef.deleteMany.mockResolvedValue({ count: 0 });
    db.templateBlockDef.upsert.mockResolvedValue({});

    await syncCanonicalTemplates(db as never);

    expect(db.template.upsert).toHaveBeenCalledTimes(1);
    expect(db.template.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "portfolio-community" },
      })
    );
    expect(db.templateBlockDef.upsert).toHaveBeenCalledTimes(5);
  });

  it("lists only canonical templates with merged library metadata", async () => {
    const db = createDb();

    db.template.upsert.mockResolvedValue({ id: "template_1" });
    db.templateBlockDef.deleteMany.mockResolvedValue({ count: 0 });
    db.templateBlockDef.upsert.mockResolvedValue({});
    db.template.findMany.mockResolvedValue([
      {
        id: "template_1",
        slug: "portfolio-community",
        name: "Portfolio Community",
        description: "Template canonico",
        thumbnail: "/api/template-assets/portfolio-community/cover",
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
