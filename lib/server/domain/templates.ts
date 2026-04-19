import { Prisma, PrismaClient } from "@/generated/prisma-client";
import { ApiRouteError } from "@/lib/server/api";
import {
  versionAggregateInclude,
  type ProfileAggregate,
  type VersionAggregate,
} from "@/lib/server/domain/includes";
import { validateBlockConfig } from "@/lib/templates/contracts";
import { mapTemplateInitialBlocks } from "@/lib/templates/template-content-mapper";
import type {
  PageBlockCreateInput,
  PageBlockReorderInput,
  PageBlockUpdateInput,
} from "@/lib/validations";

type DbClient = PrismaClient;
type TxClient = Prisma.TransactionClient;

export const templateListInclude = Prisma.validator<Prisma.TemplateInclude>()({
  blockDefs: {
    orderBy: { defaultOrder: "asc" },
  },
});

export type TemplateListItem = Prisma.TemplateGetPayload<{
  include: typeof templateListInclude;
}>;

export const pageEditorInclude = Prisma.validator<Prisma.PageInclude>()({
  template: {
    include: {
      blockDefs: {
        orderBy: { defaultOrder: "asc" },
      },
    },
  },
  blocks: {
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      templateBlockDef: true,
      children: {
        orderBy: { order: "asc" },
        include: {
          templateBlockDef: true,
        },
      },
    },
  },
  version: {
    include: versionAggregateInclude,
  },
});

export type OwnedPageEditorData = Prisma.PageGetPayload<{
  include: typeof pageEditorInclude;
}>;

function asJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function mergeBlockPayload(input: {
  config?: unknown;
  props?: unknown;
  assets?: unknown;
}) {
  return {
    ...(typeof input.config === "object" && input.config ? input.config : {}),
    ...(typeof input.props === "object" && input.props ? input.props : {}),
    ...(typeof input.assets === "object" && input.assets ? input.assets : {}),
  };
}

function validateAllowedBlockConfig(blockType: string, input: unknown) {
  const config = validateBlockConfig(blockType, input);

  if (!config) {
    throw new ApiRouteError("BAD_REQUEST", 400, {
      message: "Tipo de bloco nao permitido",
    });
  }

  return config;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function collectAssetIdsFromPayload(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectAssetIdsFromPayload(item));
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  const record = value as Record<string, unknown>;
  const assetIds = typeof record.assetId === "string" ? [record.assetId] : [];

  return [...assetIds, ...Object.values(record).flatMap((item) => collectAssetIdsFromPayload(item))];
}

async function assertOwnedAssetIds(tx: TxClient, userId: string, assetIds: string[]) {
  const ids = Array.from(new Set(assetIds.filter(Boolean)));

  if (ids.length === 0) return;

  const ownedAssets = await tx.asset.findMany({
    where: {
      id: { in: ids },
      profile: { userId },
    },
    select: { id: true },
  });

  if (ownedAssets.length !== ids.length) {
    throw new ApiRouteError("FORBIDDEN", 403, {
      message: "Asset informado nao pertence a este usuario",
    });
  }
}

function sanitizeBlockAssets(
  assetFields: unknown,
  assets: unknown
) {
  const editableAssetFields = Array.isArray(assetFields) ? assetFields : [];

  if (editableAssetFields.length === 0) {
    return {};
  }

  const allowedRoots = new Set(
    editableAssetFields
      .map((field) => asRecord(field).key)
      .filter((key): key is string => typeof key === "string" && key.length > 0)
      .map((key) => key.split(".")[0])
      .filter(Boolean)
  );
  const source = asRecord(assets);

  return Object.fromEntries(
    Object.entries(source).filter(([key]) => allowedRoots.has(key))
  );
}

export async function listActiveTemplates(
  db: DbClient
): Promise<TemplateListItem[]> {
  return db.template.findMany({
    where: { isActive: true },
    orderBy: [{ slug: "asc" }],
    include: templateListInclude,
  });
}

export async function seedPageBlocksFromTemplate(
  tx: TxClient,
  pageId: string,
  templateId: string,
  options?: {
    profile?: ProfileAggregate;
    version?: VersionAggregate;
    replaceExisting?: boolean;
  }
) {
  const existingBlocks = await tx.pageBlock.count({ where: { pageId } });

  if (existingBlocks > 0 && !options?.replaceExisting) {
    return;
  }

  if (existingBlocks > 0 && options?.replaceExisting) {
    await tx.pageBlock.deleteMany({ where: { pageId } });
  }

  const template = await tx.template.findUnique({
    where: { id: templateId },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!template) {
    throw new ApiRouteError("BAD_REQUEST", 400, {
      message: "Template invalido para seed da pagina",
    });
  }

  const blockDefs = await tx.templateBlockDef.findMany({
    where: { templateId },
    orderBy: { defaultOrder: "asc" },
  });

  const seededBlocks =
    options?.profile && options?.version
      ? mapTemplateInitialBlocks({
          templateSlug: template.slug,
          blockDefs,
          context: {
            profile: options.profile,
            version: options.version,
          },
        })
      : blockDefs.map((blockDef) => ({
          key: blockDef.key,
          blockType: blockDef.blockType,
          order: blockDef.defaultOrder,
          visible: true,
          config:
            typeof blockDef.defaultConfig === "object" && blockDef.defaultConfig
              ? (blockDef.defaultConfig as Record<string, unknown>)
              : {},
          props:
            typeof blockDef.defaultProps === "object" && blockDef.defaultProps
              ? (blockDef.defaultProps as Record<string, unknown>)
              : {},
          assets: {},
        }));

  for (const blockDef of blockDefs) {
    const seededBlock =
      seededBlocks.find((item) => item.key === blockDef.key) ??
      seededBlocks.find((item) => item.blockType === blockDef.blockType);
    const config = validateAllowedBlockConfig(
      blockDef.blockType,
      seededBlock?.config ?? blockDef.defaultConfig
    );

    await tx.pageBlock.create({
      data: {
        pageId,
        templateBlockDefId: blockDef.id,
        key: seededBlock?.key ?? blockDef.key,
        blockType: blockDef.blockType,
        order: seededBlock?.order ?? blockDef.defaultOrder,
        visible: seededBlock?.visible ?? true,
        config: asJsonValue(config),
        props: asJsonValue(seededBlock?.props ?? blockDef.defaultProps ?? {}),
        assets: asJsonValue(seededBlock?.assets ?? {}),
      },
    });
  }
}

async function getOwnedPageOrThrow(tx: TxClient, userId: string, pageId: string) {
  const page = await tx.page.findFirst({
    where: {
      id: pageId,
      version: {
        profile: {
          userId,
        },
      },
    },
    select: {
      id: true,
      templateId: true,
      template: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!page) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return page;
}

async function getOwnedPageBlockOrThrow(
  tx: TxClient,
  userId: string,
  pageId: string,
  blockId: string
) {
  const page = await getOwnedPageOrThrow(tx, userId, pageId);
  const block = await tx.pageBlock.findFirst({
    where: {
      id: blockId,
      pageId: page.id,
    },
    include: {
      templateBlockDef: true,
    },
  });

  if (!block) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return { page, block };
}

async function assertParentBelongsToPage(
  tx: TxClient,
  pageId: string,
  parentId: string | null | undefined,
  currentBlockId?: string
) {
  if (!parentId) return;

  if (parentId === currentBlockId) {
    throw new ApiRouteError("BAD_REQUEST", 400, {
      message: "Bloco nao pode ser pai dele mesmo",
    });
  }

  const parent = await tx.pageBlock.findFirst({
    where: {
      id: parentId,
      pageId,
    },
    select: { id: true },
  });

  if (!parent) {
    throw new ApiRouteError("BAD_REQUEST", 400, {
      message: "Bloco pai invalido para esta pagina",
    });
  }
}

export async function addOwnedPageBlock(
  db: DbClient,
  userId: string,
  pageId: string,
  input: PageBlockCreateInput
) {
  return db.$transaction(async (tx) => {
    const page = await getOwnedPageOrThrow(tx, userId, pageId);
    await assertParentBelongsToPage(tx, page.id, input.parentId);
    await assertOwnedAssetIds(tx, userId, collectAssetIdsFromPayload(input.assets));

    const blockDef = await tx.templateBlockDef.findFirst({
      where: {
        templateId: page.templateId,
        key: input.templateBlockKey,
      },
    });

    if (!blockDef) {
      throw new ApiRouteError("BAD_REQUEST", 400, {
        message: "Bloco nao compativel com este template",
      });
    }

    const lastBlock = await tx.pageBlock.findFirst({
      where: { pageId: page.id, parentId: input.parentId ?? null },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const config = validateAllowedBlockConfig(
      blockDef.blockType,
      mergeBlockPayload({
        config: input.config ?? blockDef.defaultConfig,
        props: undefined,
        assets: undefined,
      })
    );
    const assets = sanitizeBlockAssets(blockDef.assetFields, input.assets);

    return tx.pageBlock.create({
      data: {
        pageId: page.id,
        templateBlockDefId: blockDef.id,
        parentId: input.parentId ?? null,
        key: `${blockDef.key}-${Date.now()}`,
        blockType: blockDef.blockType,
        order: input.order ?? (lastBlock?.order ?? -1) + 1,
        visible: input.visible ?? true,
        config: asJsonValue(config),
        props: asJsonValue({}),
        assets: asJsonValue(assets),
      },
      include: {
        templateBlockDef: true,
      },
    });
  });
}

export async function updateOwnedPageBlock(
  db: DbClient,
  userId: string,
  pageId: string,
  blockId: string,
  input: PageBlockUpdateInput
) {
  return db.$transaction(async (tx) => {
    const { page, block } = await getOwnedPageBlockOrThrow(tx, userId, pageId, blockId);
    await assertParentBelongsToPage(tx, pageId, input.parentId, block.id);
    await assertOwnedAssetIds(
      tx,
      userId,
      collectAssetIdsFromPayload(input.assets ?? block.assets)
    );

    const configInput =
      input.config === undefined && input.props === undefined && input.assets === undefined
        ? block.config
        : mergeBlockPayload({
            config: input.config ?? block.config,
            props: undefined,
            assets: undefined,
          });
    const config = validateAllowedBlockConfig(block.blockType, configInput);
    const currentProps = asRecord(block.props);
    const assets = sanitizeBlockAssets(
      block.templateBlockDef?.assetFields ?? [],
      input.assets ?? block.assets
    );

    return tx.pageBlock.update({
      where: { id: block.id },
      data: {
        order: input.order ?? block.order,
        visible: input.visible ?? block.visible,
        parentId: input.parentId === undefined ? block.parentId : input.parentId,
        config: asJsonValue(config),
        props: asJsonValue(currentProps.semantic ? { semantic: currentProps.semantic } : {}),
        assets: asJsonValue(assets),
      },
      include: {
        templateBlockDef: true,
      },
    });
  });
}

export async function removeOwnedPageBlock(
  db: DbClient,
  userId: string,
  pageId: string,
  blockId: string
) {
  return db.$transaction(async (tx) => {
    const { block } = await getOwnedPageBlockOrThrow(tx, userId, pageId, blockId);

    if (block.templateBlockDef?.required) {
      throw new ApiRouteError("BAD_REQUEST", 400, {
        message: "Bloco obrigatorio nao pode ser removido",
      });
    }

    await tx.pageBlock.delete({
      where: { id: block.id },
    });

    return { id: block.id };
  });
}

export async function reorderOwnedPageBlocks(
  db: DbClient,
  userId: string,
  pageId: string,
  input: PageBlockReorderInput
) {
  return db.$transaction(async (tx) => {
    const page = await getOwnedPageOrThrow(tx, userId, pageId);
    const blocks = await tx.pageBlock.findMany({
      where: {
        pageId: page.id,
        parentId: null,
      },
      orderBy: { order: "asc" },
      include: {
        templateBlockDef: true,
      },
    });

    const currentIds = blocks.map((block) => block.id).sort();
    const nextIds = [...new Set(input.blockIds)].sort();

    if (
      currentIds.length !== nextIds.length ||
      currentIds.some((id, index) => id !== nextIds[index])
    ) {
      throw new ApiRouteError("BAD_REQUEST", 400, {
        message: "A ordenacao enviada nao corresponde aos blocos desta pagina",
      });
    }

    for (const [order, blockId] of input.blockIds.entries()) {
      await tx.pageBlock.update({
        where: { id: blockId },
        data: { order },
      });
    }

    return tx.pageBlock.findMany({
      where: {
        pageId: page.id,
        parentId: null,
      },
      orderBy: { order: "asc" },
      include: {
        templateBlockDef: true,
        children: {
          orderBy: { order: "asc" },
          include: {
            templateBlockDef: true,
          },
        },
      },
    });
  });
}

export async function getOwnedPageEditorData(
  db: DbClient,
  userId: string,
  pageId: string
): Promise<OwnedPageEditorData> {
  const page = await db.page.findFirst({
    where: {
      id: pageId,
      version: {
        profile: {
          userId,
        },
      },
    },
    include: pageEditorInclude,
  });

  if (!page) {
    throw new ApiRouteError("NOT_FOUND", 404);
  }

  return page;
}
