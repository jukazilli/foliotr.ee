import { describe, expect, it } from "vitest";
import { mapTemplateInitialBlocks } from "@/lib/templates/template-content-mapper";
import { derivePortfolioCommunitySemantics } from "@/lib/templates/portfolio-community-semantics";

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
            eyebrow: "Ola, eu sou",
            ctaLabel: "Curriculo",
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
          label: "Sobre",
          category: "section",
          version: 1,
          defaultOrder: 1,
          required: false,
          repeatable: false,
          defaultConfig: {
            title: "sobre.",
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
          label: "Projetos",
          category: "section",
          version: 1,
          defaultOrder: 3,
          required: false,
          repeatable: false,
          defaultConfig: {
            title: "projetos.",
            maxItems: 2,
            fallbackProjects: [],
          },
          defaultProps: {},
          editableFields: [],
          assetFields: [],
          allowedChildren: [],
        },
        {
          id: "def_contact",
          templateId: "template_1",
          key: "portfolio-contact",
          blockType: "portfolio.contact",
          label: "Contato",
          category: "section",
          version: 1,
          defaultOrder: 4,
          required: false,
          repeatable: false,
          defaultConfig: {
            title: "contato.",
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

    expect(blocks).toHaveLength(4);
    expect(blocks[0]).toMatchObject({
      blockType: "portfolio.hero",
      config: expect.objectContaining({
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
    expect(blocks[0].config).not.toHaveProperty("name");
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
    expect(blocks[3]).toMatchObject({
      blockType: "portfolio.contact",
      visible: true,
      config: expect.objectContaining({
        links: [
          expect.objectContaining({
            label: "juliano@example.com",
            href: "mailto:juliano@example.com",
          }),
        ],
      }),
    });
  });

  it("resolves visible project cards with base cover framing", () => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: {
        displayName: "Juliano Pedroso",
        headline: "Designer",
        bio: "Bio",
        avatarUrl: null,
        location: null,
        publicEmail: null,
        phone: null,
        user: null,
        experiences: [],
        educations: [],
        skills: [],
        achievements: [],
        highlights: [],
        links: [],
        proofs: [],
        projects: [
          {
            id: "project_1",
            title: "Projeto visivel",
            description: "Descricao",
            imageUrl: "/uploads/project-1.png",
            url: "https://example.com/project-1",
            repoUrl: null,
            tags: [],
            featured: true,
            coverAssetId: null,
            coverFitMode: "crop",
            coverPositionX: 30,
            coverPositionY: 70,
            order: 0,
            startDate: null,
            endDate: null,
          },
          {
            id: "project_2",
            title: "Projeto oculto",
            description: "Nao deve aparecer",
            imageUrl: "/uploads/project-2.png",
            url: null,
            repoUrl: null,
            tags: [],
            featured: false,
            coverAssetId: null,
            coverFitMode: "fill",
            coverPositionX: 50,
            coverPositionY: 50,
            order: 1,
            startDate: null,
            endDate: null,
          },
        ],
      } as never,
      version: {
        selectedProjectIds: ["project_1", "project_2"],
      } as never,
      blockConfigs: {
        "portfolio.work": {
          maxItems: 3,
          hiddenProjectIds: ["project_2"],
        },
      },
    });

    expect(semantics.work.items).toHaveLength(1);
    expect(semantics.work.items[0]).toMatchObject({
      key: "project_1",
      projectId: "project_1",
      source: "project",
      image: "/uploads/project-1.png",
      imageValue: {
        fitMode: "crop",
        positionX: 30,
        positionY: 70,
      },
    });
  });

  it("uses page-level project cover overrides before profile base images", () => {
    const semantics = derivePortfolioCommunitySemantics({
      profile: {
        displayName: "Juliano Pedroso",
        headline: "Designer",
        bio: "Bio",
        avatarUrl: null,
        location: null,
        publicEmail: null,
        phone: null,
        user: null,
        experiences: [],
        educations: [],
        skills: [],
        achievements: [],
        highlights: [],
        links: [],
        proofs: [],
        projects: [
          {
            id: "project_1",
            title: "Projeto com override",
            description: "Descricao",
            imageUrl: "/uploads/base-project.png",
            url: null,
            repoUrl: null,
            tags: [],
            featured: true,
            coverAssetId: null,
            coverFitMode: "crop",
            coverPositionX: 25,
            coverPositionY: 75,
            order: 0,
            startDate: null,
            endDate: null,
          },
        ],
      } as never,
      version: {
        selectedProjectIds: ["project_1"],
      } as never,
      blockConfigs: {
        "portfolio.work": {
          projectCovers: {
            project_1: {
              image: {
                src: "/uploads/page-override.png",
                alt: "Override da pagina",
                fitMode: "fit",
                positionX: 60,
                positionY: 40,
              },
            },
          },
        },
      },
    });

    expect(semantics.work.items[0]).toMatchObject({
      image: "/uploads/page-override.png",
      imageValue: {
        src: "/uploads/page-override.png",
        alt: "Override da pagina",
        fitMode: "fit",
        positionX: 60,
        positionY: 40,
      },
    });
    expect(semantics.work.fallbackProjects[0].image).toMatchObject({
      src: "/uploads/page-override.png",
      alt: "Override da pagina",
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
