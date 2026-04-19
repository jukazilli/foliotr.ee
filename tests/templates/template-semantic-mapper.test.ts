import { describe, expect, it } from "vitest";
import { mapTemplateInitialBlocks } from "@/lib/templates/template-content-mapper";

describe("template semantic mapper", () => {
  it("maps profile and version data into portfolio-community semantic blocks", () => {
    const blocks = mapTemplateInitialBlocks({
      templateSlug: "portfolio-community",
      blockDefs: [
        {
          id: "def_hero",
          templateId: "template_1",
          key: "portfolio-hero",
          blockType: "portfolio.hero",
          label: "Hero",
          category: "section",
          version: 1,
          defaultOrder: 0,
          required: true,
          repeatable: false,
          defaultConfig: {
            eyebrow: "Hello, I'm",
            ctaLabel: "Resume",
            ctaHref: "/resume",
          },
          defaultProps: {},
          editableFields: [],
          assetFields: [],
          allowedChildren: [],
        },
        {
          id: "def_about",
          templateId: "template_1",
          key: "portfolio-about",
          blockType: "portfolio.about",
          label: "About",
          category: "section",
          version: 1,
          defaultOrder: 1,
          required: false,
          repeatable: false,
          defaultConfig: {
            title: "about.",
          },
          defaultProps: {},
          editableFields: [],
          assetFields: [],
          allowedChildren: [],
        },
        {
          id: "def_work",
          templateId: "template_1",
          key: "portfolio-work",
          blockType: "portfolio.work",
          label: "Work",
          category: "section",
          version: 1,
          defaultOrder: 3,
          required: false,
          repeatable: false,
          defaultConfig: {
            title: "work.",
            maxItems: 2,
            fallbackProjects: [],
          },
          defaultProps: {},
          editableFields: [],
          assetFields: [],
          allowedChildren: [],
        },
      ] as never,
      context: {
        profile: {
          id: "profile_1",
          displayName: "Juliano Pedroso",
          headline: "Senior Designer",
          bio: "Designer focado em produto e portfolio.",
          avatarUrl: "/uploads/juliano/avatar.png",
          location: "Sao Paulo",
          userId: "user_1",
          onboardingDone: true,
          experiences: [],
          educations: [],
          skills: [],
          achievements: [],
          highlights: [],
          links: [],
          proofs: [],
          assets: [],
          projects: [
            {
              id: "project_1",
              profileId: "profile_1",
              title: "Case Study A",
              description: "Projeto de redesign",
              imageUrl: "/uploads/juliano/project.png",
              url: "https://example.com/project-a",
              repoUrl: null,
              tags: [],
              featured: true,
              coverAssetId: null,
              order: 0,
              startDate: null,
              endDate: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          versions: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          bioRaw: undefined,
          avatarAssetId: undefined,
          bannerAssetId: undefined,
          bannerUrl: null,
          birthDate: null,
          locationRaw: undefined,
          phone: null,
          pronouns: null,
          publicEmail: "juliano@example.com",
          websiteUrl: null,
          user: {
            name: "Juliano Pedroso",
            email: "juliano@example.com",
            username: "juliano-zilli",
          },
        } as never,
        version: {
          id: "version_1",
          profileId: "profile_1",
          name: "Padrao",
          description: null,
          context: null,
          emoji: null,
          customHeadline: "Designing digital products",
          customBio: "Bio adaptada para a versao.",
          isDefault: true,
          page: null,
          resumeConfig: null,
          experiences: [],
          projects: [
            {
              versionId: "version_1",
              projectId: "project_1",
              order: 0,
              project: {
                id: "project_1",
                profileId: "profile_1",
                title: "Case Study A",
                description: "Projeto de redesign",
                imageUrl: "/uploads/juliano/project.png",
                url: "https://example.com/project-a",
                repoUrl: null,
                tags: [],
                featured: true,
                coverAssetId: null,
                order: 0,
                startDate: null,
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                coverAsset: null,
              },
            },
          ],
          skills: [],
          achievements: [],
          proofs: [],
          highlights: [],
          links: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as never,
      },
    });

    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toMatchObject({
      blockType: "portfolio.hero",
      config: expect.objectContaining({
        name: "Juliano Pedroso",
        headline: "Designing digital products",
        ctaHref: "/juliano-zilli/resume",
      }),
      props: {
        semantic: {
          blockMeaning: "portfolio.hero",
          resolvedFrom: expect.arrayContaining([
            expect.objectContaining({
              target: "headline",
              source: "version.customHeadline",
            }),
          ]),
        },
      },
    });
    expect(blocks[1]).toMatchObject({
      blockType: "portfolio.about",
      visible: true,
      config: expect.objectContaining({
        body: "Bio adaptada para a versao.",
      }),
    });
    expect(blocks[2]).toMatchObject({
      blockType: "portfolio.work",
      visible: true,
      config: expect.objectContaining({
        maxItems: 1,
        fallbackProjects: [
          expect.objectContaining({
            title: "Case Study A",
          }),
        ],
      }),
    });
  });

  it("fails clearly when a template slug has no registered semantic implementation", () => {
    expect(() =>
      mapTemplateInitialBlocks({
        templateSlug: "unknown-template",
        blockDefs: [],
        context: {
          profile: {} as never,
          version: {} as never,
        },
      })
    ).toThrow(/Missing template implementation for slug "unknown-template"/);
  });
});
