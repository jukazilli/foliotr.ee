"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { JsonValue } from "@prisma/client/runtime/library";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import type { RenderablePageBlock, TemplateProfile } from "@/components/templates/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

type JsonRecord = Record<string, unknown>;
type CanvasDimensionKey = "width" | "height";

const FALLBACK_PREVIEW_CANVAS_WIDTH = 1440;
const FALLBACK_PREVIEW_CANVAS_HEIGHT = 4037;
const MIN_PREVIEW_SCALE = 0.24;
const MAX_PREVIEW_SCALE = 1;

interface TemplateBlockDefLike {
  id: string;
  key: string;
  label: string;
  blockType: string;
  required: boolean;
  editableFields: unknown[];
}

interface ManifestBlockLike {
  key: string;
  blockType: string;
  repeatable: boolean;
}

interface VersionSelectionLike {
  customHeadline?: string | null;
  customBio?: string | null;
  selectedExperienceIds: string[];
  selectedProjectIds: string[];
  selectedSkillIds: string[];
  selectedAchievementIds: string[];
  selectedProofIds?: string[];
  selectedHighlightIds?: string[];
  selectedLinkIds?: string[];
}

interface CanonicalPageEditorProps {
  pageId: string;
  templateSlug: string;
  templateName: string;
  pageTitle: string;
  initialBlocks: RenderablePageBlock[];
  templateBlockDefs: TemplateBlockDefLike[];
  manifestBlocks: ManifestBlockLike[];
  initialProfile: TemplateProfile;
  initialVersion: VersionSelectionLike;
  initialTemplateSourcePackage?: unknown;
}

interface UploadedAsset {
  id: string;
  url: string;
  name?: string | null;
  mimeType?: string | null;
  size?: number | null;
}

interface EditableFieldLike {
  key: string;
  label: string;
  kind: "text" | "longText" | "url" | "image" | "boolean" | "list";
  element: string;
}

function asRecord(value: unknown): JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asJsonValue(value: unknown): JsonValue {
  return value as JsonValue;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function readPreviewCanvasDimension(
  sourcePackage: unknown,
  key: CanvasDimensionKey,
  fallback: number
) {
  const packageRecord = asRecord(sourcePackage);
  const canvas = asRecord(packageRecord.canvas);
  const value = canvas[key];

  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function sortBlocks(blocks: RenderablePageBlock[]) {
  return [...blocks].sort((left, right) => left.order - right.order);
}

function formatApiError(payload: unknown, status: number, fallback: string) {
  const response = payload && typeof payload === "object" ? asRecord(payload) : {};
  const error = asRecord(response.error);
  const details = asRecord(error.details);

  if (typeof details.message === "string" && details.message.trim()) {
    return details.message;
  }

  if (typeof details.reason === "string" && details.reason.trim()) {
    return details.reason;
  }

  const issues = asArray(details.issues);
  if (issues.length > 0) {
    const firstIssue = asRecord(issues[0]);
    if (typeof firstIssue.message === "string" && firstIssue.message.trim()) {
      return firstIssue.message;
    }
  }

  const fieldErrors = asRecord(details.fieldErrors);
  const firstFieldError = Object.values(fieldErrors).find(
    (value) => Array.isArray(value) && value.length > 0 && typeof value[0] === "string"
  ) as string[] | undefined;
  if (firstFieldError?.[0]) {
    return firstFieldError[0];
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message;
  }

  return `${fallback} (${status})`;
}

function createDefaultListItem(fieldKey: string) {
  if (fieldKey === "links") {
    return { label: "", href: "https://" };
  }

  if (fieldKey === "fallbackProjects") {
    return {
      title: "",
      description: "",
      date: "",
      href: "https://",
    };
  }

  return {};
}

function textareaClassName() {
  return "min-h-[7.5rem] w-full rounded-xl border border-white/80 bg-white/76 px-3 py-2 text-sm font-medium text-neutral-900 shadow-sm backdrop-blur placeholder:text-neutral-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-lime-500";
}

function getEditableFields(blockDef: TemplateBlockDefLike | null): EditableFieldLike[] {
  if (!blockDef) return [];

  return asArray(blockDef.editableFields).flatMap((field) => {
    const record = asRecord(field);

    if (
      typeof record.key !== "string" ||
      typeof record.label !== "string" ||
      typeof record.kind !== "string" ||
      typeof record.element !== "string"
    ) {
      return [];
    }

    return [
      {
        key: record.key,
        label: record.label,
        kind: record.kind as EditableFieldLike["kind"],
        element: record.element,
      },
    ];
  });
}

export default function CanonicalPageEditor({
  pageId,
  templateSlug,
  templateName,
  pageTitle,
  initialBlocks,
  templateBlockDefs,
  manifestBlocks,
  initialProfile,
  initialVersion,
  initialTemplateSourcePackage,
}: CanonicalPageEditorProps) {
  const [blocks, setBlocks] = useState(() => sortBlocks(initialBlocks));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    initialBlocks[0]?.id ?? null
  );
  const [draftConfig, setDraftConfig] = useState<JsonRecord>({});
  const [draftAssets, setDraftAssets] = useState<JsonRecord>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  const previewCanvasWidth = useMemo(
    () =>
      readPreviewCanvasDimension(
        initialTemplateSourcePackage,
        "width",
        FALLBACK_PREVIEW_CANVAS_WIDTH
      ),
    [initialTemplateSourcePackage]
  );
  const previewCanvasHeight = useMemo(
    () =>
      readPreviewCanvasDimension(
        initialTemplateSourcePackage,
        "height",
        FALLBACK_PREVIEW_CANVAS_HEIGHT
      ),
    [initialTemplateSourcePackage]
  );

  useEffect(() => {
    const frame = previewFrameRef.current;
    if (!frame) return;

    function updateScale(width: number) {
      const nextScale = Math.min(
        MAX_PREVIEW_SCALE,
        Math.max(MIN_PREVIEW_SCALE, width / previewCanvasWidth)
      );

      setPreviewScale((current) =>
        Math.abs(current - nextScale) > 0.005 ? nextScale : current
      );
    }

    updateScale(frame.clientWidth);

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) updateScale(width);
    });

    observer.observe(frame);

    return () => observer.disconnect();
  }, [previewCanvasWidth]);

  const manifestByKey = useMemo(
    () => new Map(manifestBlocks.map((block) => [block.key, block])),
    [manifestBlocks]
  );

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const selectedBlockDef = selectedBlock?.templateBlockDefId
    ? templateBlockDefs.find((blockDef) => blockDef.id === selectedBlock.templateBlockDefId) ?? null
    : null;

  useEffect(() => {
    if (!blocks.some((block) => block.id === selectedBlockId)) {
      setSelectedBlockId(blocks[0]?.id ?? null);
    }
  }, [blocks, selectedBlockId]);

  useEffect(() => {
    if (!selectedBlock) {
      setDraftConfig({});
      setDraftAssets({});
      return;
    }

    setDraftConfig(asRecord(selectedBlock.config));
    setDraftAssets(asRecord(selectedBlock.assets));
  }, [selectedBlock]);

  const previewBlocks = useMemo(() => {
    if (!selectedBlock) return blocks;

    return blocks.map((block) =>
      block.id === selectedBlock.id
        ? {
            ...block,
            config: asJsonValue(draftConfig),
            assets: asJsonValue(draftAssets),
          }
        : block
    ) as RenderablePageBlock[];
  }, [blocks, draftAssets, draftConfig, selectedBlock]);

  const availableBlockDefs = useMemo(() => {
    return templateBlockDefs.filter((blockDef) => {
      const manifestBlock = manifestByKey.get(blockDef.key);
      if (!manifestBlock) return false;

      if (manifestBlock.repeatable) return true;

      return !blocks.some((block) => block.templateBlockDefId === blockDef.id);
    });
  }, [blocks, manifestByKey, templateBlockDefs]);

  async function parseJsonResponse(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  function replaceBlock(nextBlock: RenderablePageBlock) {
    setBlocks((current) =>
      sortBlocks(current.map((block) => (block.id === nextBlock.id ? nextBlock : block)))
    );
  }

  async function saveSelectedBlock(nextConfig = draftConfig, nextAssets = draftAssets) {
    if (!selectedBlock) return;

    setBusyKey(`save:${selectedBlock.id}`);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/pages/${pageId}/blocks/${selectedBlock.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: nextConfig,
        assets: nextAssets,
      }),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      setBusyKey(null);
      setErrorMessage(
        formatApiError(payload, response.status, "Nao foi possivel salvar este bloco")
      );
      return;
    }

    const nextBlock = asRecord(payload).block as RenderablePageBlock;
    replaceBlock(nextBlock);
    setDraftConfig(asRecord(nextBlock.config));
    setDraftAssets(asRecord(nextBlock.assets));
    setBusyKey(null);
    setSuccessMessage("Bloco salvo.");
  }

  async function toggleVisibility(block: RenderablePageBlock) {
    setBusyKey(`visibility:${block.id}`);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/pages/${pageId}/blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visible: !block.visible }),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      setBusyKey(null);
      setErrorMessage(
        formatApiError(payload, response.status, "Nao foi possivel alterar a visibilidade")
      );
      return;
    }

    replaceBlock(asRecord(payload).block as RenderablePageBlock);
    setBusyKey(null);
    setSuccessMessage(block.visible ? "Bloco ocultado." : "Bloco exibido.");
  }

  async function moveBlock(blockId: string, direction: -1 | 1) {
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    const nextIndex = currentIndex + direction;

    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= blocks.length) {
      return;
    }

    const nextOrder = [...blocks];
    const [moved] = nextOrder.splice(currentIndex, 1);
    nextOrder.splice(nextIndex, 0, moved);

    setBusyKey(`reorder:${blockId}`);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/pages/${pageId}/blocks/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blockIds: nextOrder.map((block) => block.id),
      }),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      setBusyKey(null);
      setErrorMessage(
        formatApiError(payload, response.status, "Nao foi possivel reordenar os blocos")
      );
      return;
    }

    setBlocks(sortBlocks((asRecord(payload).blocks as RenderablePageBlock[]) ?? []));
    setBusyKey(null);
    setSuccessMessage("Ordem atualizada.");
  }

  async function addBlock(templateBlockKey: string) {
    setBusyKey(`add:${templateBlockKey}`);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/pages/${pageId}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateBlockKey,
      }),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      setBusyKey(null);
      setErrorMessage(
        formatApiError(payload, response.status, "Nao foi possivel adicionar este bloco")
      );
      return;
    }

    const nextBlock = asRecord(payload).block as RenderablePageBlock;
    setBlocks((current) => sortBlocks([...current, nextBlock]));
    setSelectedBlockId(nextBlock.id);
    setBusyKey(null);
    setSuccessMessage("Bloco adicionado.");
  }

  async function removeSelectedBlock() {
    if (!selectedBlock) return;

    setBusyKey(`remove:${selectedBlock.id}`);
    setErrorMessage("");
    setSuccessMessage("");

    const response = await fetch(`/api/pages/${pageId}/blocks/${selectedBlock.id}`, {
      method: "DELETE",
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      setBusyKey(null);
      setErrorMessage(
        formatApiError(payload, response.status, "Nao foi possivel remover este bloco")
      );
      return;
    }

    setBlocks((current) => current.filter((block) => block.id !== selectedBlock.id));
    setBusyKey(null);
    setSuccessMessage("Bloco removido.");
  }

  function updateDraftField(fieldKey: string, value: unknown) {
    setDraftConfig((current) => ({
      ...current,
      [fieldKey]: value,
    }));
  }

  function removeDraftField(fieldKey: string) {
    setDraftConfig((current) => {
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  }

  function updateListField(fieldKey: string, index: number, prop: string, value: unknown) {
    const currentList = asArray(draftConfig[fieldKey]).map((item) => asRecord(item));
    const nextList = currentList.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [prop]: value,
          }
        : item
    );

    updateDraftField(fieldKey, nextList);
  }

  function addListItem(fieldKey: string) {
    updateDraftField(fieldKey, [...asArray(draftConfig[fieldKey]), createDefaultListItem(fieldKey)]);
  }

  function removeListItem(fieldKey: string, index: number) {
    updateDraftField(
      fieldKey,
      asArray(draftConfig[fieldKey]).filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function setTopLevelAssetMeta(fieldKey: string, asset: UploadedAsset, altText: string) {
    setDraftAssets((current) => ({
      ...current,
      [fieldKey]: {
        assetId: asset.id,
        url: asset.url,
        src: asset.url,
        alt: altText,
      },
    }));
  }

  function removeTopLevelAssetMeta(fieldKey: string) {
    setDraftAssets((current) => {
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  }

  function setListAssetMeta(fieldKey: string, index: number, asset: UploadedAsset, altText: string) {
    const nextAssets = [...asArray(draftAssets[fieldKey])];
    nextAssets[index] = {
      assetId: asset.id,
      url: asset.url,
      src: asset.url,
      alt: altText,
    };

    setDraftAssets((current) => ({
      ...current,
      [fieldKey]: nextAssets,
    }));
  }

  function removeListAssetMeta(fieldKey: string, index: number) {
    const nextAssets = [...asArray(draftAssets[fieldKey])];
    nextAssets[index] = null;

    setDraftAssets((current) => ({
      ...current,
      [fieldKey]: nextAssets,
    }));
  }

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/assets/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(
        formatApiError(payload, response.status, "Nao foi possivel enviar a imagem")
      );
    }

    return asRecord(payload).asset as UploadedAsset;
  }

  async function uploadTopLevelImage(fieldKey: string, file: File) {
    if (!selectedBlock) return;

    setBusyKey(`image:${fieldKey}`);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const uploadedAsset = await uploadImage(file);
      const currentImage = asRecord(draftConfig[fieldKey]);
      const nextConfig = {
        ...draftConfig,
        [fieldKey]: {
          src: uploadedAsset.url,
          alt: typeof currentImage.alt === "string" ? currentImage.alt : selectedBlockDef?.label ?? "",
        },
      };
      const nextAssets = {
        ...draftAssets,
        [fieldKey]: {
          assetId: uploadedAsset.id,
          url: uploadedAsset.url,
          src: uploadedAsset.url,
          alt:
            typeof currentImage.alt === "string" ? currentImage.alt : selectedBlockDef?.label ?? "",
        },
      };

      setDraftConfig(nextConfig);
      setDraftAssets(nextAssets);
      await saveSelectedBlock(nextConfig, nextAssets);
    } catch (error) {
      setBusyKey(null);
      setErrorMessage(error instanceof Error ? error.message : "Falha no upload da imagem");
    }
  }

  async function uploadListImage(fieldKey: string, index: number, file: File) {
    setBusyKey(`image:${fieldKey}:${index}`);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const uploadedAsset = await uploadImage(file);
      const list = asArray(draftConfig[fieldKey]).map((item) => asRecord(item));
      const currentItem = list[index] ?? {};
      const nextList = list.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              image: {
                src: uploadedAsset.url,
                alt:
                  typeof asRecord(item.image).alt === "string"
                    ? asRecord(item.image).alt
                    : typeof item.title === "string"
                      ? item.title
                      : "",
              },
            }
          : item
      );
      const nextAssets = {
        ...draftAssets,
        [fieldKey]: [
          ...asArray(draftAssets[fieldKey]).slice(0, index),
          {
            assetId: uploadedAsset.id,
            url: uploadedAsset.url,
            src: uploadedAsset.url,
            alt:
              typeof asRecord(currentItem.image).alt === "string"
                ? asRecord(currentItem.image).alt
                : typeof currentItem.title === "string"
                  ? currentItem.title
                  : "",
          },
          ...asArray(draftAssets[fieldKey]).slice(index + 1),
        ],
      };

      const nextConfig = {
        ...draftConfig,
        [fieldKey]: nextList,
      };

      setDraftConfig(nextConfig);
      setDraftAssets(nextAssets);
      await saveSelectedBlock(nextConfig, nextAssets);
    } catch (error) {
      setBusyKey(null);
      setErrorMessage(error instanceof Error ? error.message : "Falha no upload da imagem");
    }
  }

  function renderImageField(fieldKey: string, label: string) {
    const image = asRecord(draftConfig[fieldKey]);
    const src = typeof image.src === "string" ? normalizeStoragePublicUrl(image.src) : "";
    const alt = typeof image.alt === "string" ? image.alt : "";

    return (
      <div className="space-y-3 rounded-[1.25rem] border border-neutral-200 bg-neutral-50/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{label}</p>
            <p className="text-xs text-neutral-500">Envie uma imagem.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/80 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm">
            <Upload className="h-4 w-4" aria-hidden="true" />
            Trocar imagem
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadTopLevelImage(fieldKey, file);
                }
                event.currentTarget.value = "";
              }}
            />
          </label>
        </div>
        {src ? (
          <img src={src} alt={alt} className="h-44 w-full rounded-2xl object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-white text-sm text-neutral-500">
            Nenhuma imagem definida
          </div>
        )}
        <Input
          value={alt}
          onChange={(event) =>
            updateDraftField(fieldKey, {
              ...image,
              alt: event.target.value,
            })
          }
          placeholder="Texto alternativo"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeDraftField(fieldKey)}
          >
            Remover do preview
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              removeDraftField(fieldKey);
              removeTopLevelAssetMeta(fieldKey);
            }}
          >
            Remover imagem
          </Button>
        </div>
      </div>
    );
  }

  function renderRepeaterField(fieldKey: string, label: string) {
    const items = asArray(draftConfig[fieldKey]).map((item) => asRecord(item));

    return (
      <div className="space-y-3 rounded-[1.25rem] border border-neutral-200 bg-neutral-50/80 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-900">{label}</p>
            <p className="text-xs text-neutral-500">Adicione itens.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => addListItem(fieldKey)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Adicionar item
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-sm text-neutral-500">
            Nenhum item configurado.
          </div>
        ) : null}

        {items.map((item, index) => (
          <div key={`${fieldKey}-${index}`} className="space-y-3 rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-900">Item {index + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeListItem(fieldKey, index)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remover
              </Button>
            </div>

            {Object.entries(item).map(([propKey, propValue]) => {
              if (propKey === "image") {
                const image = asRecord(propValue);
                const imageSrc =
                  typeof image.src === "string" ? normalizeStoragePublicUrl(image.src) : "";
                const imageAlt = typeof image.alt === "string" ? image.alt : "";

                return (
                  <div key={`${fieldKey}-${index}-${propKey}`} className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-neutral-900">Imagem</p>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/80 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm">
                        <ImagePlus className="h-4 w-4" aria-hidden="true" />
                        Trocar
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void uploadListImage(fieldKey, index, file);
                            }
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    </div>
                    {imageSrc ? (
                      <img src={imageSrc} alt={imageAlt} className="h-40 w-full rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white text-sm text-neutral-500">
                        Nenhuma imagem vinculada
                      </div>
                    )}
                    <Input
                      value={imageAlt}
                      onChange={(event) =>
                        updateListField(fieldKey, index, "image", {
                          ...image,
                          alt: event.target.value,
                        })
                      }
                      placeholder="Texto alternativo"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateListField(fieldKey, index, "image", undefined);
                        removeListAssetMeta(fieldKey, index);
                      }}
                    >
                      Remover imagem
                    </Button>
                  </div>
                );
              }

              const isLongText =
                typeof propValue === "string" && propValue.length > 120 || propKey === "description";
              const inputType = propKey.includes("href") ? "url" : "text";

              return (
                <div key={`${fieldKey}-${index}-${propKey}`} className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    {propKey}
                  </label>
                  {isLongText ? (
                    <textarea
                      className={textareaClassName()}
                      value={typeof propValue === "string" ? propValue : ""}
                      onChange={(event) =>
                        updateListField(fieldKey, index, propKey, event.target.value)
                      }
                    />
                  ) : (
                    <Input
                      type={inputType}
                      value={typeof propValue === "string" ? propValue : ""}
                      onChange={(event) =>
                        updateListField(fieldKey, index, propKey, event.target.value)
                      }
                    />
                  )}
                </div>
              );
            })}

            {!Object.prototype.hasOwnProperty.call(item, "image") &&
            fieldKey === "fallbackProjects" ? (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/80 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 shadow-sm">
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  Adicionar imagem
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadListImage(fieldKey, index, file);
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  function renderEditableField(field: EditableFieldLike) {
    const value = draftConfig[field.key];

    if (field.kind === "image" || field.element === "image") {
      return (
        <div key={field.key}>
          {renderImageField(field.key, field.label)}
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={field.key}>
          {renderRepeaterField(field.key, field.label)}
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div key={field.key} className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {field.label}
          </label>
          <Input
            type="number"
            min={1}
            max={12}
            value={String(value)}
            onChange={(event) => updateDraftField(field.key, Number(event.target.value || 0))}
          />
        </div>
      );
    }

    if (field.kind === "longText") {
      return (
        <div key={field.key} className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {field.label}
          </label>
          <textarea
            className={textareaClassName()}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => updateDraftField(field.key, event.target.value)}
            placeholder={field.label}
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
          {field.label}
        </label>
        <Input
          type={field.kind === "url" ? "url" : "text"}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => updateDraftField(field.key, event.target.value)}
          placeholder={field.label}
        />
      </div>
    );
  }

  return (
    <section className="grid min-h-[45rem] min-w-0 gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100/80 p-2 shadow-sm sm:p-3 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <aside className="overflow-hidden rounded-lg border border-neutral-200 bg-white/95 xl:sticky xl:top-20 xl:self-start">
        <div className="border-b border-neutral-200 px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-950">Blocos</h2>
              <p className="mt-0.5 text-xs text-neutral-500">{blocks.length} secoes no template</p>
            </div>
            <span className="hidden shrink-0 text-xs font-medium text-neutral-500 sm:inline">Selecionar</span>
          </div>
        </div>

        <div className="max-h-[27.5rem] space-y-1 overflow-y-auto p-2">
          {blocks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
              Nenhum bloco criado.
            </div>
          ) : (
            blocks.map((block, index) => {
              const blockDef =
                templateBlockDefs.find((item) => item.id === block.templateBlockDefId) ?? null;
              const isSelected = block.id === selectedBlockId;

              return (
                <button
                  key={block.id}
                  type="button"
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => setSelectedBlockId(block.id)}
                  className={`group flex min-h-14 w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-lime-400 bg-lime-50 shadow-sm"
                      : "border-transparent bg-white hover:border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[0.6875rem] font-semibold ${
                      isSelected
                        ? "border-lime-300 bg-white text-lime-700"
                        : "border-neutral-200 bg-neutral-50 text-neutral-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-900">
                      {blockDef?.label ?? block.key}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.6875rem] text-neutral-500">
                      {blockDef?.blockType ?? block.blockType}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        block.visible ? "bg-lime-500" : "bg-neutral-300"
                      }`}
                      title={block.visible ? "Visivel" : "Oculto"}
                      aria-label={block.visible ? "Visivel" : "Oculto"}
                    />
                    {blockDef?.required ? (
                      <span className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-amber-700">
                        fixo
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-neutral-200 bg-neutral-50/80 p-2">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Adicionar
            </h3>
            <span className="shrink-0 text-xs text-neutral-500">{availableBlockDefs.length} disponiveis</span>
          </div>
          <div className="space-y-1">
            {availableBlockDefs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-500">
                Nao ha mais blocos para adicionar.
              </div>
            ) : (
              availableBlockDefs.map((blockDef) => (
                <div
                  key={blockDef.id}
                  className="flex min-h-12 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900">{blockDef.label}</p>
                    <p className="truncate text-[0.6875rem] text-neutral-500">{blockDef.blockType}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={busyKey === `add:${blockDef.key}`}
                    onClick={() => void addBlock(blockDef.key)}
                    aria-label={`Adicionar bloco ${blockDef.label}`}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="order-2 min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200/70 xl:order-1">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-300/80 bg-white/90 px-4 py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-950">Preview</h2>
              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {pageTitle} em {templateName}
              </p>
            </div>
            <span className="hidden shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[0.6875rem] font-semibold text-neutral-500 sm:inline-flex">
              Canvas
            </span>
          </div>
          <div className="max-h-[70vh] overflow-auto bg-neutral-100 px-2 py-4 sm:px-5 sm:py-5 lg:max-h-[48.75rem] lg:px-6">
            <div
              ref={previewFrameRef}
              className="mx-auto w-full max-w-[47.5rem] overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm"
            >
              <div
                className="relative mx-auto"
                style={{
                  width: `${previewCanvasWidth * previewScale}px`,
                  height: `${previewCanvasHeight * previewScale}px`,
                }}
              >
                <div
                  className="absolute left-0 top-0 max-w-none origin-top-left"
                  style={{
                    width: `${previewCanvasWidth}px`,
                    transform: `scale(${previewScale})`,
                  }}
                >
                  <TemplateRenderer
                    templateSlug={templateSlug}
                    blocks={previewBlocks}
                    profile={initialProfile}
                    version={initialVersion}
                    templateSourcePackage={initialTemplateSourcePackage}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="order-1 min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white/95 xl:sticky xl:top-20 xl:order-2 xl:self-start">
          <div className="border-b border-neutral-200 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-neutral-950">
                  {selectedBlockDef?.label ?? "Escolha um bloco"}
                </h2>
                <p className="mt-0.5 truncate text-xs text-neutral-500">
                  {selectedBlockDef?.blockType ?? "Painel do bloco"}
                </p>
              </div>
              {selectedBlockDef?.required ? <Badge variant="warning">fixo</Badge> : null}
            </div>
          </div>

          <div className="space-y-3 overflow-visible p-3 xl:max-h-[48.75rem] xl:overflow-y-auto">
            {errorMessage ? (
              <div className="rounded-lg border border-coral-200 bg-coral-50 px-3 py-2 text-sm font-medium text-coral-900">
                {errorMessage}
              </div>
            ) : null}
            {successMessage ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-900">
                {successMessage}
              </div>
            ) : null}

            {selectedBlock && selectedBlockDef ? (
              <>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={busyKey === `reorder:${selectedBlock.id}`}
                    onClick={() => void moveBlock(selectedBlock.id, -1)}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    Subir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={busyKey === `reorder:${selectedBlock.id}`}
                    onClick={() => void moveBlock(selectedBlock.id, 1)}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    Descer
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={busyKey === `visibility:${selectedBlock.id}`}
                    onClick={() => void toggleVisibility(selectedBlock)}
                  >
                    {selectedBlock.visible ? (
                      <>
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        Exibir
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    loading={busyKey === `save:${selectedBlock.id}`}
                    onClick={() => void saveSelectedBlock()}
                  >
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Salvar
                  </Button>
                  {!selectedBlockDef.required ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      loading={busyKey === `remove:${selectedBlock.id}`}
                      onClick={() => void removeSelectedBlock()}
                      className="sm:col-span-2"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remover
                    </Button>
                  ) : null}
                </div>

                <div className="space-y-4">
                  {getEditableFields(selectedBlockDef).map((field) => renderEditableField(field))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-8 text-sm leading-7 text-neutral-500">
                Escolha um bloco para editar.
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}


