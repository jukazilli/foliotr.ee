import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRouteError } from "@/lib/server/api";
import {
  createOwnedVersion,
  getOwnedVersion,
  upsertOwnedPageOutput,
  upsertOwnedResumeOutput,
} from "@/lib/server/domain/versions";

function createTx() {
  return {
    profile: {
      findUnique: vi.fn(),
    },
    experience: {
      findMany: vi.fn(),
    },
    education: {
      findMany: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
    skill: {
      findMany: vi.fn(),
    },
    achievement: {
      findMany: vi.fn(),
    },
    proof: {
      findMany: vi.fn(),
    },
    highlight: {
      findMany: vi.fn(),
    },
    profileLink: {
      findMany: vi.fn(),
    },
    version: {
      findFirst: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    template: {
      findUnique: vi.fn(),
    },
    page: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    pageBlock: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    resumeConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    versionExperience: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    versionEducation: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    versionProject: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    versionSkill: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    versionAchievement: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    versionProof: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    versionHighlight: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    versionLink: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  };
}

function createDb(tx: ReturnType<typeof createTx>) {
  return {
    $transaction: vi.fn(async (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx)
    ),
    version: {
      findFirst: vi.fn(),
    },
  } as const;
}

describe("versions domain", () => {
  const profileAggregate = {
    id: "profile_1",
    versions: [],
    experiences: [{ id: "exp_1" }],
    educations: [{ id: "education_1" }],
    projects: [{ id: "project_1" }],
    skills: [{ id: "skill_1" }],
    achievements: [{ id: "achievement_1" }],
    proofs: [{ id: "proof_1" }],
    highlights: [{ id: "highlight_1" }],
    links: [{ id: "link_1" }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a default version from the profile base and syncs all first-class selections", async () => {
    const tx = createTx();
    const db = createDb(tx);

    tx.profile.findUnique.mockResolvedValue(profileAggregate);
    tx.experience.findMany.mockResolvedValue([{ id: "exp_1" }]);
    tx.education.findMany.mockResolvedValue([{ id: "education_1" }]);
    tx.project.findMany.mockResolvedValue([{ id: "project_1" }]);
    tx.skill.findMany.mockResolvedValue([{ id: "skill_1" }]);
    tx.achievement.findMany.mockResolvedValue([{ id: "achievement_1" }]);
    tx.proof.findMany.mockResolvedValue([{ id: "proof_1" }]);
    tx.highlight.findMany.mockResolvedValue([{ id: "highlight_1" }]);
    tx.profileLink.findMany.mockResolvedValue([{ id: "link_1" }]);
    tx.version.create.mockResolvedValue({ id: "version_1" });
    tx.version.findUniqueOrThrow.mockResolvedValue({ id: "version_1" });

    const version = await createOwnedVersion(db as never, "user_1", {
      name: "Design Lead",
    });

    expect(version).toEqual({ id: "version_1" });
    expect(tx.version.updateMany).toHaveBeenCalledWith({
      where: { profileId: "profile_1", isDefault: true },
      data: { isDefault: false },
    });
    expect(tx.version.create).toHaveBeenCalledWith({
      data: {
        profileId: "profile_1",
        name: "Design Lead",
        description: undefined,
        context: undefined,
        emoji: undefined,
        customHeadline: undefined,
        customBio: undefined,
        isDefault: true,
      },
      include: expect.any(Object),
    });
    expect(tx.versionExperience.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", experienceId: "exp_1", order: 0 }],
    });
    expect(tx.versionEducation.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", educationId: "education_1", order: 0 }],
    });
    expect(tx.versionProject.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", projectId: "project_1", order: 0 }],
    });
    expect(tx.versionSkill.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", skillId: "skill_1", order: 0 }],
    });
    expect(tx.versionAchievement.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", achievementId: "achievement_1", order: 0 }],
    });
    expect(tx.versionProof.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", proofId: "proof_1", order: 0 }],
    });
    expect(tx.versionHighlight.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", highlightId: "highlight_1", order: 0 }],
    });
    expect(tx.versionLink.createMany).toHaveBeenCalledWith({
      data: [{ versionId: "version_1", linkId: "link_1", order: 0 }],
    });
  });

  it("binds a page output to the version and stamps publication safely", async () => {
    const tx = createTx();
    const db = createDb(tx);

    tx.profile.findUnique.mockResolvedValue(profileAggregate);
    tx.version.findFirst.mockResolvedValue({ id: "version_1", profileId: "profile_1" });
    tx.template.findUnique.mockResolvedValue({ id: "template_1", isActive: true });
    tx.page.findFirst.mockResolvedValue(null);
    tx.page.create.mockResolvedValue({ id: "page_1" });
    tx.page.update.mockResolvedValue({ id: "page_1" });
    tx.pageBlock.count.mockResolvedValue(1);
    tx.pageBlock.findMany.mockResolvedValue([]);
    tx.version.findUniqueOrThrow
      .mockResolvedValueOnce({
        id: "version_1",
        experiences: [],
        educations: [],
        projects: [],
        skills: [],
        achievements: [],
        proofs: [],
        highlights: [],
        links: [],
      })
      .mockResolvedValueOnce({ id: "version_1" });

    await upsertOwnedPageOutput(db as never, "user_1", "version_1", {
      title: "Design Lead",
      slug: "design-lead",
      templateId: "template_1",
      publishState: "PUBLISHED",
    });

    expect(tx.page.create).toHaveBeenCalledWith({
      data: {
        versionId: "version_1",
        title: "Design Lead",
        slug: "design-lead",
        templateId: "template_1",
        publishState: "PUBLISHED",
        publishedAt: expect.any(Date),
        editorSnapshot: expect.any(Object),
        snapshotUpdatedAt: expect.any(Date),
      },
    });
    expect(tx.page.update).toHaveBeenCalledWith({
      where: { id: "page_1" },
      data: {
        publishedSnapshot: expect.any(Object),
        publishedSnapshotAt: expect.any(Date),
      },
    });
  });

  it("publishes page snapshots with the current profile instead of stale editor snapshots", async () => {
    const tx = createTx();
    const db = createDb(tx);
    const freshProfile = {
      ...profileAggregate,
      userId: "user_1",
      avatarUrl: "/uploads/current-avatar.jpg",
    };
    const staleEditorSnapshot = {
      profile: {
        avatarUrl: "/uploads/old-avatar.png",
      },
      version: {},
    };

    tx.profile.findUnique.mockResolvedValue(freshProfile);
    tx.version.findFirst.mockResolvedValue({ id: "version_1", profileId: "profile_1" });
    tx.template.findUnique.mockResolvedValue({ id: "template_1", isActive: true });
    tx.page.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "page_1",
        publishedAt: new Date("2026-04-18T10:00:00.000Z"),
        templateId: "template_1",
        editorSnapshot: staleEditorSnapshot,
        publishedSnapshotAt: new Date("2026-04-18T10:00:00.000Z"),
      });
    tx.page.update.mockResolvedValue({ id: "page_1" });
    tx.pageBlock.count.mockResolvedValue(1);
    tx.pageBlock.findMany.mockResolvedValue([]);
    tx.version.findUniqueOrThrow
      .mockResolvedValueOnce({
        id: "version_1",
        experiences: [],
        educations: [],
        projects: [],
        skills: [],
        achievements: [],
        proofs: [],
        highlights: [],
        links: [],
      })
      .mockResolvedValueOnce({ id: "version_1" });

    await upsertOwnedPageOutput(db as never, "user_1", "version_1", {
      title: "Design Lead",
      slug: "design-lead",
      templateId: "template_1",
      publishState: "PUBLISHED",
    });

    const metadataUpdate = tx.page.update.mock.calls[0]?.[0];
    const publicationUpdate = tx.page.update.mock.calls[1]?.[0];

    expect(metadataUpdate.data.editorSnapshot.profile.avatarUrl).toBe(
      "/uploads/current-avatar.jpg"
    );
    expect(publicationUpdate.data.publishedSnapshot.profile.avatarUrl).toBe(
      "/uploads/current-avatar.jpg"
    );
  });

  it("publishes resume snapshots with the current profile instead of stale page snapshots", async () => {
    const tx = createTx();
    const db = createDb(tx);
    const freshProfile = {
      ...profileAggregate,
      userId: "user_1",
      avatarUrl: "/uploads/current-avatar.jpg",
    };

    tx.profile.findUnique.mockResolvedValue(freshProfile);
    tx.version.findFirst.mockResolvedValue({ id: "version_1", profileId: "profile_1" });
    tx.version.findUniqueOrThrow
      .mockResolvedValueOnce({
        id: "version_1",
        experiences: [],
        educations: [],
        projects: [],
        skills: [],
        achievements: [],
        proofs: [],
        highlights: [],
        links: [],
      })
      .mockResolvedValueOnce({ id: "version_1" });
    tx.resumeConfig.findUnique.mockResolvedValue({
      publishedAt: new Date("2026-04-18T10:00:00.000Z"),
      publishedSnapshotAt: new Date("2026-04-18T10:00:00.000Z"),
    });
    tx.resumeConfig.upsert.mockResolvedValue({
      sections: ["hero", "experience"],
      layout: "classic",
      accentColor: null,
      showPhoto: true,
      showLinks: true,
    });
    tx.page.findFirst.mockResolvedValue({
      id: "page_1",
      editorSnapshot: {
        profile: { avatarUrl: "/uploads/old-avatar.png" },
        version: {},
      },
    });
    tx.pageBlock.findMany.mockResolvedValue([]);
    tx.resumeConfig.update.mockResolvedValue({ id: "resume_1" });

    await upsertOwnedResumeOutput(db as never, "user_1", "version_1", {
      sections: ["hero", "experience"],
      layout: "classic",
      accentColor: "",
      showPhoto: true,
      showLinks: true,
      publishState: "PUBLISHED",
    });

    expect(tx.resumeConfig.update).toHaveBeenCalledWith({
      where: { versionId: "version_1" },
      data: {
        publishedSnapshot: expect.objectContaining({
          profile: expect.objectContaining({
            avatarUrl: "/uploads/current-avatar.jpg",
          }),
        }),
        publishedSnapshotAt: expect.any(Date),
      },
    });
  });

  it("clears resume publication timestamp when output returns to draft", async () => {
    const tx = createTx();
    const db = createDb(tx);

    tx.profile.findUnique.mockResolvedValue(profileAggregate);
    tx.version.findFirst.mockResolvedValue({ id: "version_1", profileId: "profile_1" });
    tx.version.findUniqueOrThrow
      .mockResolvedValueOnce({
        id: "version_1",
        experiences: [],
        educations: [],
        projects: [],
        skills: [],
        achievements: [],
        proofs: [],
        highlights: [],
        links: [],
      })
      .mockResolvedValueOnce({ id: "version_1" });
    tx.resumeConfig.findUnique.mockResolvedValue({
      publishedAt: new Date("2026-04-18T10:00:00.000Z"),
    });

    await upsertOwnedResumeOutput(db as never, "user_1", "version_1", {
      sections: ["hero", "experience"],
      layout: "classic",
      accentColor: "",
      showPhoto: true,
      showLinks: true,
      publishState: "DRAFT",
    });

    expect(tx.resumeConfig.upsert).toHaveBeenCalledWith({
      where: { versionId: "version_1" },
      update: {
        sections: ["hero", "experience"],
        layout: "classic",
        accentColor: null,
        showPhoto: true,
        showLinks: true,
        publishState: "DRAFT",
        publishedAt: null,
      },
      create: {
        versionId: "version_1",
        sections: ["hero", "experience"],
        layout: "classic",
        accentColor: null,
        showPhoto: true,
        showLinks: true,
        publishState: "DRAFT",
        publishedAt: null,
      },
    });
  });

  it("rejects reads for versions outside the owner's scope", async () => {
    const db = {
      version: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(getOwnedVersion(db as never, "user_1", "version_foreign")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    } satisfies Partial<ApiRouteError>);
  });
});
