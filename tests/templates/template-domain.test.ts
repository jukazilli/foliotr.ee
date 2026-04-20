import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRouteError } from "@/lib/server/api";
import {
  addOwnedPageBlock,
  reorderOwnedPageBlocks,
  removeOwnedPageBlock,
  seedPageBlocksFromTemplate,
  updateOwnedPageBlock,
} from "@/lib/server/domain/templates";

function createTx() {
  return {
    asset: {
      findMany: vi.fn(),
    },
    template: {
      findUnique: vi.fn(),
    },
    page: {
      findFirst: vi.fn(),
    },
    pageBlock: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    templateBlockDef: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  };
}

function createDb(tx: ReturnType<typeof createTx>) {
  return {
    $transaction: vi.fn(async (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx)
    ),
  };
}

describe("template domain", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates initial page blocks from template definitions in order", async () => {
    const tx = createTx();

    tx.pageBlock.count.mockResolvedValue(0);
    tx.template.findUnique.mockResolvedValue({
      id: "template_1",
      slug: "portfolio-community",
    });
    tx.templateBlockDef.findMany.mockResolvedValue([
      {
        id: "def_hero",
        key: "portfolio-hero",
        blockType: "portfolio.hero",
        defaultOrder: 0,
        defaultConfig: {
          headline: "Designer de Produto",
          portrait: {
            src: "/templates/portfolio-community/profile-photo.png",
            alt: "Retrato",
          },
        },
        defaultProps: {},
      },
      {
        id: "def_about",
        key: "portfolio-about",
        blockType: "portfolio.about",
        defaultOrder: 1,
        defaultConfig: {
          title: "sobre.",
          body: "Resumo curto",
        },
        defaultProps: {},
      },
    ]);

    await seedPageBlocksFromTemplate(tx as never, "page_1", "template_1");

    expect(tx.pageBlock.create).toHaveBeenCalledTimes(2);
    expect(tx.pageBlock.create).toHaveBeenNthCalledWith(1, {
      data: {
        pageId: "page_1",
        templateBlockDefId: "def_hero",
        key: "portfolio-hero",
        blockType: "portfolio.hero",
        order: 0,
        visible: true,
        config: expect.objectContaining({ headline: "Designer de Produto" }),
        props: {},
        assets: {},
      },
    });
  });

  it("adds only blocks allowed by the page template", async () => {
    const tx = createTx();
    const db = createDb(tx);

    tx.page.findFirst.mockResolvedValue({
      id: "page_1",
      templateId: "template_1",
      template: { slug: "portfolio-community" },
    });
    tx.templateBlockDef.findFirst.mockResolvedValue({
      id: "def_work",
      key: "portfolio-work",
      blockType: "portfolio.work",
      defaultConfig: {
        title: "projetos.",
        maxItems: 2,
        fallbackProjects: [],
      },
    });
    tx.pageBlock.findFirst.mockResolvedValue({ order: 4 });
    tx.pageBlock.create.mockResolvedValue({ id: "block_1" });

    const block = await addOwnedPageBlock(db as never, "user_1", "page_1", {
      templateBlockKey: "portfolio-work",
      config: {
        title: "projetos.",
        maxItems: 2,
        fallbackProjects: [],
      },
    });

    expect(block).toEqual({ id: "block_1" });
    expect(tx.pageBlock.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pageId: "page_1",
        templateBlockDefId: "def_work",
        blockType: "portfolio.work",
        order: 5,
        visible: true,
      }),
      include: { templateBlockDef: true },
    });
  });

  it("blocks removal of required page blocks", async () => {
    const tx = createTx();
    const db = createDb(tx);

    tx.page.findFirst.mockResolvedValue({
      id: "page_1",
      templateId: "template_1",
      template: { slug: "portfolio-community" },
    });
    tx.pageBlock.findFirst.mockResolvedValue({
      id: "block_hero",
      templateBlockDef: {
        required: true,
      },
    });

    await expect(
      removeOwnedPageBlock(db as never, "user_1", "page_1", "block_hero")
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      status: 400,
    } satisfies Partial<ApiRouteError>);

    expect(tx.pageBlock.delete).not.toHaveBeenCalled();
  });

  it("reorders top level blocks only when the payload matches the page state", async () => {
    const tx = createTx();
    const db = createDb(tx);

    tx.page.findFirst.mockResolvedValue({
      id: "page_1",
      templateId: "template_1",
      template: { slug: "portfolio-community" },
    });
    tx.pageBlock.findMany
      .mockResolvedValueOnce([
        { id: "block_1", order: 0, templateBlockDef: null, children: [] },
        { id: "block_2", order: 1, templateBlockDef: null, children: [] },
      ])
      .mockResolvedValueOnce([
        { id: "block_2", order: 0, templateBlockDef: null, children: [] },
        { id: "block_1", order: 1, templateBlockDef: null, children: [] },
      ]);

    const blocks = await reorderOwnedPageBlocks(db as never, "user_1", "page_1", {
      blockIds: ["block_2", "block_1"],
    });

    expect(tx.pageBlock.update).toHaveBeenCalledTimes(2);
    expect(blocks.map((block) => block.id)).toEqual(["block_2", "block_1"]);
  });

  it("rejects asset references that do not belong to the page owner", async () => {
    const tx = createTx();
    const db = createDb(tx);

    tx.page.findFirst.mockResolvedValue({
      id: "page_1",
      templateId: "template_1",
      template: { slug: "portfolio-community" },
    });
    tx.pageBlock.findFirst.mockResolvedValue({
      id: "block_hero",
      pageId: "page_1",
      parentId: null,
      order: 0,
      visible: true,
      blockType: "portfolio.hero",
      config: {},
      props: { semantic: { resolvedFrom: "profile.displayName" } },
      assets: {},
      templateBlockDef: {
        id: "def_hero",
        key: "portfolio-hero",
        required: true,
      },
    });
    tx.asset.findMany.mockResolvedValue([]);

    await expect(
      updateOwnedPageBlock(db as never, "user_1", "page_1", "block_hero", {
        assets: {
          portrait: {
            assetId: "ck1234567890123456789012",
          },
        },
      })
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    } satisfies Partial<ApiRouteError>);
  });
});
