"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { JsonValue } from "@prisma/client/runtime/library";
import type { ResumeConfig } from "@/generated/prisma-client";
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
  UploadCloud,
} from "lucide-react";
import TemplateRenderer from "@/components/templates/TemplateRenderer";
import type { RenderablePageBlock, TemplateProfile } from "@/components/templates/types";
import ResumeView from "@/components/resume/ResumeView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

type JsonRecord = Record<string, unknown>;
type CanvasDimensionKey = "width" | "height";
type PreviewMode = "portfolio" | "resume";

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
  defaultConfig?: unknown;
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
  selectedEducationIds?: string[];
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
  initialResumeConfig?: ResumeConfig | null;
  initialTemplateSourcePackage?: unknown;
  publishPageAction: () => Promise<void>;
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

interface CanvasSelectionFrame {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface InlineFieldFrame extends CanvasSelectionFrame {
  key: string;
  label: string;
  kind: "text" | "longText";
}

interface EditableSlotFrame extends CanvasSelectionFrame {
  key: string;
  label: string;
  kind: EditableFieldLike["kind"] | "unknown";
}

interface InlineImageFrame extends CanvasSelectionFrame {
  key: string;
  label: string;
}

interface InlineListImageTarget {
  fieldKey: string;
  index: number;
  label: string;
  path: string;
}

interface EditableImageValue {
  src: string;
  alt: string;
  fitMode: "fit" | "fill" | "crop";
  positionX: number;
  positionY: number;
}

function sameCanvasFrame(
  left: CanvasSelectionFrame | InlineFieldFrame | InlineImageFrame | EditableSlotFrame | null,
  right: CanvasSelectionFrame | InlineFieldFrame | InlineImageFrame | EditableSlotFrame | null
) {
  if (!left && !right) return true;
  if (!left || !right) return false;

  return (
    left.left === right.left &&
    left.top === right.top &&
    left.width === right.width &&
    left.height === right.height
  );
}

function sameSlotFrames(left: EditableSlotFrame[], right: EditableSlotFrame[]) {
  if (left.length !== right.length) return false;

  return left.every((frame, index) => {
    const next = right[index];
    return (
      frame.key === next?.key &&
      frame.label === next?.label &&
      frame.kind === next?.kind &&
      frame.left === next?.left &&
      frame.top === next?.top &&
      frame.width === next?.width &&
      frame.height === next?.height
    );
  });
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

function escapeCssAttribute(value: string) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/["\\]/g, "\\$&");
}

function inferFieldKindFromCanvas(value: string | undefined): EditableFieldLike["kind"] | "unknown" {
  if (value === "image") return "image";
  if (value === "icon") return "boolean";
  if (value === "text") return "text";
  return "unknown";
}

function parseRepeaterImagePath(path: string | undefined) {
  if (!path) return null;

  const match = /^([a-zA-Z0-9_]+)\.(\d+)\.image$/.exec(path);
  if (!match) return null;

  return {
    fieldKey: match[1],
    index: Number(match[2]),
    path,
  };
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

  if (fieldKey === "listItems") {
    return { text: "" };
  }

  return {};
}

function clampPercentage(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(100, value));
}

function readEditableImageValue(value: unknown): EditableImageValue {
  const image = asRecord(value);
  const fitMode =
    image.fitMode === "fit" || image.fitMode === "fill" || image.fitMode === "crop"
      ? image.fitMode
      : "fill";

  return {
    src: typeof image.src === "string" ? normalizeStoragePublicUrl(image.src) : "",
    alt: typeof image.alt === "string" ? image.alt : "",
    fitMode,
    positionX: clampPercentage(typeof image.positionX === "number" ? image.positionX : 50),
    positionY: clampPercentage(typeof image.positionY === "number" ? image.positionY : 50),
  };
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
  initialResumeConfig,
  initialTemplateSourcePackage,
  publishPageAction,
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("portfolio");
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(0.5);
  const [canvasSelectionFrame, setCanvasSelectionFrame] = useState<CanvasSelectionFrame | null>(
    null
  );
  const [editableSlotFrames, setEditableSlotFrames] = useState<EditableSlotFrame[]>([]);
  const [activeInlineFieldKey, setActiveInlineFieldKey] = useState<string | null>(null);
  const [activeInlineFieldValue, setActiveInlineFieldValue] = useState("");
  const [inlineFieldFrame, setInlineFieldFrame] = useState<InlineFieldFrame | null>(null);
  const [activeInlineImageFieldKey, setActiveInlineImageFieldKey] = useState<string | null>(null);
  const [inlineImageFrame, setInlineImageFrame] = useState<InlineImageFrame | null>(null);
  const [activeInlineListImage, setActiveInlineListImage] = useState<InlineListImageTarget | null>(null);
  const [inlineListImageFrame, setInlineListImageFrame] = useState<InlineImageFrame | null>(null);
  const [activeInlineBooleanFieldKey, setActiveInlineBooleanFieldKey] = useState<string | null>(null);
  const [inlineBooleanFrame, setInlineBooleanFrame] = useState<CanvasSelectionFrame | null>(null);
  const [imageDragActive, setImageDragActive] = useState(false);
  const saveSelectedBlockRef = useRef<((
    nextConfig?: JsonRecord,
    nextAssets?: JsonRecord
  ) => Promise<boolean>) | null>(null);
  const slotButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

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

  useEffect(() => {
    if (previewMode !== "portfolio" || !selectedBlockId) {
      setCanvasSelectionFrame(null);
      return;
    }

    const frame = previewFrameRef.current;
    const viewport = previewViewportRef.current;

    if (!frame || !viewport) {
      setCanvasSelectionFrame(null);
      return;
    }

    function updateSelectionFrame() {
      const currentFrame = previewFrameRef.current;
      if (!currentFrame) {
        setCanvasSelectionFrame(null);
        return;
      }

      const selectedElement = currentFrame.querySelector<HTMLElement>(
        `[data-ft-block-id="${selectedBlockId}"]`
      );

      if (!selectedElement) {
        setCanvasSelectionFrame(null);
        return;
      }

      const frameRect = currentFrame.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      const nextFrame = {
        left: selectedRect.left - frameRect.left,
        top: selectedRect.top - frameRect.top,
        width: selectedRect.width,
        height: selectedRect.height,
      };

      setCanvasSelectionFrame((current) => (sameCanvasFrame(current, nextFrame) ? current : nextFrame));
    }

    updateSelectionFrame();
    viewport.addEventListener("scroll", updateSelectionFrame, { passive: true });
    window.addEventListener("resize", updateSelectionFrame);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateSelectionFrame());
      observer.observe(frame);
      const selectedElement = frame.querySelector<HTMLElement>(
        `[data-ft-block-id="${selectedBlockId}"]`
      );
      if (selectedElement) {
        observer.observe(selectedElement);
      }
    }

    return () => {
      viewport.removeEventListener("scroll", updateSelectionFrame);
      window.removeEventListener("resize", updateSelectionFrame);
      observer?.disconnect();
    };
  }, [blocks, previewMode, previewScale, selectedBlockId]);

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
  const selectedEditableFields = useMemo(
    () => getEditableFields(selectedBlockDef),
    [selectedBlockDef]
  );
  const selectedInlineEditableFields = useMemo(
    () =>
      selectedEditableFields.filter(
        (field) => field.kind === "text" || field.kind === "longText"
      ) as Array<EditableFieldLike & { kind: "text" | "longText" }>,
    [selectedEditableFields]
  );
  const activeInlineField = useMemo(
    () =>
      activeInlineFieldKey
        ? selectedInlineEditableFields.find((field) => field.key === activeInlineFieldKey) ?? null
        : null,
    [activeInlineFieldKey, selectedInlineEditableFields]
  );
  const selectedImageFields = useMemo(
    () =>
      selectedEditableFields.filter((field) => field.kind === "image") as Array<
        EditableFieldLike & { kind: "image" }
      >,
    [selectedEditableFields]
  );
  const activeInlineImageField = useMemo(
    () =>
      activeInlineImageFieldKey
        ? selectedImageFields.find((field) => field.key === activeInlineImageFieldKey) ?? null
        : null,
    [activeInlineImageFieldKey, selectedImageFields]
  );
  const activeInlineImageValue = useMemo(
    () =>
      activeInlineImageField ? readEditableImageValue(draftConfig[activeInlineImageField.key]) : null,
    [activeInlineImageField, draftConfig]
  );
  const activeInlineListImageValue = useMemo(() => {
    if (!activeInlineListImage) return null;
    const list = asArray(draftConfig[activeInlineListImage.fieldKey]).map((item) => asRecord(item));
    return readEditableImageValue(list[activeInlineListImage.index]?.image);
  }, [activeInlineListImage, draftConfig]);
  const selectedBooleanFields = useMemo(
    () =>
      selectedEditableFields.filter((field) => field.kind === "boolean") as Array<
        EditableFieldLike & { kind: "boolean" }
      >,
    [selectedEditableFields]
  );
  const inlineEditableFields = useMemo(
    () =>
      selectedEditableFields.filter((field) =>
        ["text", "longText", "image", "boolean"].includes(field.kind)
      ),
    [selectedEditableFields]
  );
  const sidebarEditableFields = useMemo(
    () =>
      selectedEditableFields.filter(
        (field) => !["text", "longText", "image", "boolean"].includes(field.kind)
      ),
    [selectedEditableFields]
  );
  const activeInlineBooleanField = useMemo(
    () =>
      activeInlineBooleanFieldKey
        ? selectedBooleanFields.find((field) => field.key === activeInlineBooleanFieldKey) ?? null
        : null,
    [activeInlineBooleanFieldKey, selectedBooleanFields]
  );
  const liveMessage = errorMessage || successMessage;

  useEffect(() => {
    if (!blocks.some((block) => block.id === selectedBlockId)) {
      setSelectedBlockId(blocks[0]?.id ?? null);
    }
  }, [blocks, selectedBlockId]);

  useEffect(() => {
    function handleGlobalEditorKeys(event: KeyboardEvent) {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void saveSelectedBlockRef.current?.();
        return;
      }

      if (event.key === "Escape") {
        if (
          activeInlineFieldKey ||
          activeInlineImageFieldKey ||
          activeInlineListImage ||
          activeInlineBooleanFieldKey
        ) {
          event.preventDefault();
          clearInlineEditing();
          return;
        }

        if (!isTypingTarget && selectedBlockId) {
          event.preventDefault();
          setSelectedBlockId(null);
        }
      }
    }

    window.addEventListener("keydown", handleGlobalEditorKeys);
    return () => window.removeEventListener("keydown", handleGlobalEditorKeys);
  }, [
    activeInlineBooleanFieldKey,
    activeInlineFieldKey,
    activeInlineImageFieldKey,
    activeInlineListImage,
    selectedBlockId,
  ]);

  useEffect(() => {
    if (!selectedBlock) {
      setDraftConfig({});
      setDraftAssets({});
      return;
    }

    setDraftConfig(asRecord(selectedBlock.config));
    setDraftAssets(asRecord(selectedBlock.assets));
  }, [selectedBlock]);

  useEffect(() => {
    setActiveInlineFieldKey(null);
    setActiveInlineFieldValue("");
    setInlineFieldFrame(null);
    setActiveInlineImageFieldKey(null);
    setInlineImageFrame(null);
    setActiveInlineListImage(null);
    setInlineListImageFrame(null);
    setActiveInlineBooleanFieldKey(null);
    setInlineBooleanFrame(null);
    setEditableSlotFrames([]);
  }, [previewMode, selectedBlockId]);

  useEffect(() => {
    if (previewMode !== "portfolio" || !selectedBlockId) {
      setEditableSlotFrames([]);
      return;
    }

    const frame = previewFrameRef.current;
    const viewport = previewViewportRef.current;

    if (!frame || !viewport) {
      setEditableSlotFrames([]);
      return;
    }

    const escapedBlockId = escapeCssAttribute(selectedBlockId);
    const editableFieldMap = new Map(selectedEditableFields.map((field) => [field.key, field]));

    function updateEditableSlotFrames() {
      const currentFrame = previewFrameRef.current;
      if (!currentFrame) {
        setEditableSlotFrames([]);
        return;
      }

      const frameRect = currentFrame.getBoundingClientRect();
      const nodes = Array.from(
        currentFrame.querySelectorAll<HTMLElement>(
          `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path]`
        )
      );

      const nextFrames = nodes
        .map((node) => {
          const key = node.dataset.ftConfigPath;
          if (!key) return null;

          const rect = node.getBoundingClientRect();
          return {
            key,
            label: editableFieldMap.get(key)?.label ?? key,
            kind: editableFieldMap.get(key)?.kind ?? inferFieldKindFromCanvas(node.dataset.ftKind),
            left: rect.left - frameRect.left,
            top: rect.top - frameRect.top,
            width: rect.width,
            height: rect.height,
          } satisfies EditableSlotFrame;
        })
        .filter((item): item is EditableSlotFrame => Boolean(item));

      setEditableSlotFrames((current) => (sameSlotFrames(current, nextFrames) ? current : nextFrames));
    }

    updateEditableSlotFrames();
    viewport.addEventListener("scroll", updateEditableSlotFrames, { passive: true });
    window.addEventListener("resize", updateEditableSlotFrames);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateEditableSlotFrames());
      observer.observe(frame);
      const nodes = frame.querySelectorAll<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path]`
      );
      nodes.forEach((node) => observer?.observe(node));
    }

    return () => {
      viewport.removeEventListener("scroll", updateEditableSlotFrames);
      window.removeEventListener("resize", updateEditableSlotFrames);
      observer?.disconnect();
    };
  }, [previewMode, previewScale, selectedBlockId, selectedEditableFields]);

  useEffect(() => {
    if (!activeInlineFieldKey || previewMode !== "portfolio") {
      setInlineFieldFrame(null);
      return;
    }

    const currentInlineField = activeInlineField;

    if (!selectedBlockId || !currentInlineField) {
      setInlineFieldFrame(null);
      return;
    }

    const frame = previewFrameRef.current;
    const viewport = previewViewportRef.current;

    if (!frame || !viewport) {
      setInlineFieldFrame(null);
      return;
    }

    const escapedBlockId = escapeCssAttribute(selectedBlockId);
    const escapedFieldKey = escapeCssAttribute(activeInlineFieldKey);

    function updateInlineFieldFrame() {
      if (!currentInlineField) {
        setInlineFieldFrame(null);
        return;
      }

      const currentFrame = previewFrameRef.current;
      if (!currentFrame) {
        setInlineFieldFrame(null);
        return;
      }

      const selectedElement = currentFrame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );

      if (!selectedElement) {
        setInlineFieldFrame(null);
        return;
      }

      const frameRect = currentFrame.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      const nextFrame = {
        key: currentInlineField.key,
        label: currentInlineField.label,
        kind: currentInlineField.kind,
        left: selectedRect.left - frameRect.left,
        top: selectedRect.top - frameRect.top,
        width: selectedRect.width,
        height: selectedRect.height,
      };

      setInlineFieldFrame((current) => (sameCanvasFrame(current, nextFrame) ? current : nextFrame));
    }

    updateInlineFieldFrame();
    viewport.addEventListener("scroll", updateInlineFieldFrame, { passive: true });
    window.addEventListener("resize", updateInlineFieldFrame);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateInlineFieldFrame());
      observer.observe(frame);
      const selectedElement = frame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );
      if (selectedElement) {
        observer.observe(selectedElement);
      }
    }

    return () => {
      viewport.removeEventListener("scroll", updateInlineFieldFrame);
      window.removeEventListener("resize", updateInlineFieldFrame);
      observer?.disconnect();
    };
  }, [activeInlineField, activeInlineFieldKey, blocks, previewMode, previewScale, selectedBlockId]);

  useEffect(() => {
    if (!activeInlineImageFieldKey || previewMode !== "portfolio") {
      setInlineImageFrame(null);
      return;
    }

    const currentImageField = activeInlineImageField;

    if (!selectedBlockId || !currentImageField) {
      setInlineImageFrame(null);
      return;
    }

    const frame = previewFrameRef.current;
    const viewport = previewViewportRef.current;

    if (!frame || !viewport) {
      setInlineImageFrame(null);
      return;
    }

    const escapedBlockId = escapeCssAttribute(selectedBlockId);
    const escapedFieldKey = escapeCssAttribute(activeInlineImageFieldKey);

    function updateInlineImageFrame() {
      if (!currentImageField) {
        setInlineImageFrame(null);
        return;
      }

      const currentFrame = previewFrameRef.current;
      if (!currentFrame) {
        setInlineImageFrame(null);
        return;
      }

      const selectedElement = currentFrame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );

      if (!selectedElement) {
        setInlineImageFrame(null);
        return;
      }

      const frameRect = currentFrame.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      const nextFrame = {
        key: currentImageField.key,
        label: currentImageField.label,
        left: selectedRect.left - frameRect.left,
        top: selectedRect.top - frameRect.top,
        width: selectedRect.width,
        height: selectedRect.height,
      };

      setInlineImageFrame((current) => (sameCanvasFrame(current, nextFrame) ? current : nextFrame));
    }

    updateInlineImageFrame();
    viewport.addEventListener("scroll", updateInlineImageFrame, { passive: true });
    window.addEventListener("resize", updateInlineImageFrame);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateInlineImageFrame());
      observer.observe(frame);
      const selectedElement = frame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );
      if (selectedElement) {
        observer.observe(selectedElement);
      }
    }

    return () => {
      viewport.removeEventListener("scroll", updateInlineImageFrame);
      window.removeEventListener("resize", updateInlineImageFrame);
      observer?.disconnect();
    };
  }, [
    activeInlineImageField,
    activeInlineImageFieldKey,
    previewMode,
    previewScale,
    selectedBlockId,
  ]);

  useEffect(() => {
    if (!activeInlineListImage || previewMode !== "portfolio") {
      setInlineListImageFrame(null);
      return;
    }

    const currentListImage = activeInlineListImage;

    if (!selectedBlockId) {
      setInlineListImageFrame(null);
      return;
    }

    const frame = previewFrameRef.current;
    const viewport = previewViewportRef.current;

    if (!frame || !viewport) {
      setInlineListImageFrame(null);
      return;
    }

    const escapedBlockId = escapeCssAttribute(selectedBlockId);
    const escapedFieldKey = escapeCssAttribute(currentListImage.path);

    function updateInlineListImageFrame() {
      const currentFrame = previewFrameRef.current;
      if (!currentFrame) {
        setInlineListImageFrame(null);
        return;
      }

      const selectedElement = currentFrame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );

      if (!selectedElement) {
        setInlineListImageFrame(null);
        return;
      }

      const frameRect = currentFrame.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      const nextFrame = {
        key: currentListImage.path,
        label: currentListImage.label,
        left: selectedRect.left - frameRect.left,
        top: selectedRect.top - frameRect.top,
        width: selectedRect.width,
        height: selectedRect.height,
      };

      setInlineListImageFrame((current) => (sameCanvasFrame(current, nextFrame) ? current : nextFrame));
    }

    updateInlineListImageFrame();
    viewport.addEventListener("scroll", updateInlineListImageFrame, { passive: true });
    window.addEventListener("resize", updateInlineListImageFrame);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateInlineListImageFrame());
      observer.observe(frame);
      const selectedElement = frame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );
      if (selectedElement) {
        observer.observe(selectedElement);
      }
    }

    return () => {
      viewport.removeEventListener("scroll", updateInlineListImageFrame);
      window.removeEventListener("resize", updateInlineListImageFrame);
      observer?.disconnect();
    };
  }, [activeInlineListImage, previewMode, previewScale, selectedBlockId]);

  useEffect(() => {
    if (!activeInlineBooleanFieldKey || previewMode !== "portfolio") {
      setInlineBooleanFrame(null);
      return;
    }

    if (!selectedBlockId || !activeInlineBooleanField) {
      setInlineBooleanFrame(null);
      return;
    }

    const frame = previewFrameRef.current;
    const viewport = previewViewportRef.current;

    if (!frame || !viewport) {
      setInlineBooleanFrame(null);
      return;
    }

    const escapedBlockId = escapeCssAttribute(selectedBlockId);
    const escapedFieldKey = escapeCssAttribute(activeInlineBooleanFieldKey);

    function updateInlineBooleanFrame() {
      const currentFrame = previewFrameRef.current;
      if (!currentFrame) {
        setInlineBooleanFrame(null);
        return;
      }

      const selectedElement = currentFrame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );

      if (!selectedElement) {
        setInlineBooleanFrame(null);
        return;
      }

      const frameRect = currentFrame.getBoundingClientRect();
      const selectedRect = selectedElement.getBoundingClientRect();

      const nextFrame = {
        left: selectedRect.left - frameRect.left,
        top: selectedRect.top - frameRect.top,
        width: selectedRect.width,
        height: selectedRect.height,
      };

      setInlineBooleanFrame((current) => (sameCanvasFrame(current, nextFrame) ? current : nextFrame));
    }

    updateInlineBooleanFrame();
    viewport.addEventListener("scroll", updateInlineBooleanFrame, { passive: true });
    window.addEventListener("resize", updateInlineBooleanFrame);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => updateInlineBooleanFrame());
      observer.observe(frame);
      const selectedElement = frame.querySelector<HTMLElement>(
        `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"]`
      );
      if (selectedElement) {
        observer.observe(selectedElement);
      }
    }

    return () => {
      viewport.removeEventListener("scroll", updateInlineBooleanFrame);
      window.removeEventListener("resize", updateInlineBooleanFrame);
      observer?.disconnect();
    };
  }, [
    activeInlineBooleanField,
    activeInlineBooleanFieldKey,
    previewMode,
    previewScale,
    selectedBlockId,
  ]);

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

  function mergeSelectedDraftIntoBlocks(
    sourceBlocks: RenderablePageBlock[],
    nextConfig = draftConfig,
    nextAssets = draftAssets
  ) {
    if (!selectedBlock) {
      return sortBlocks(sourceBlocks);
    }

    const nextBlock = {
      ...selectedBlock,
      config: asJsonValue(nextConfig),
      assets: asJsonValue(nextAssets),
    } as RenderablePageBlock;

    return sortBlocks(
      sourceBlocks.map((block) => (block.id === nextBlock.id ? nextBlock : block))
    );
  }

  async function saveSelectedBlock(nextConfig = draftConfig, nextAssets = draftAssets) {
    const nextBlocks = mergeSelectedDraftIntoBlocks(blocks, nextConfig, nextAssets);
    const nextSelectedBlock = selectedBlock
      ? nextBlocks.find((block) => block.id === selectedBlock.id) ?? null
      : null;

    setBlocks(nextBlocks);
    setDraftConfig(nextSelectedBlock ? asRecord(nextSelectedBlock.config) : {});
    setDraftAssets(nextSelectedBlock ? asRecord(nextSelectedBlock.assets) : {});
    setHasUnsavedChanges(true);
    return nextBlocks;
  }

  async function persistPageDraft() {
    const nextBlocks = await saveSelectedBlock();

    setBusyKey("save-page");
    setErrorMessage("");
    setSuccessMessage("");

    const selectedBlockKey = selectedBlock?.key ?? null;
    const response = await fetch(`/api/pages/${pageId}/blocks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blocks: nextBlocks.map((block) => ({
          id: block.id,
          templateBlockDefId: block.templateBlockDefId ?? null,
          parentId: block.parentId ?? null,
          key: block.key,
          blockType: block.blockType,
          order: block.order,
          visible: block.visible,
          config: asRecord(block.config),
          props: asRecord(block.props),
          assets: asRecord(block.assets),
        })),
      }),
    });
    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      setBusyKey(null);
      setErrorMessage(
        formatApiError(payload, response.status, "Nao foi possivel salvar a pagina")
      );
      return false;
    }

    const persistedBlocks = sortBlocks((asRecord(payload).blocks as RenderablePageBlock[]) ?? []);
    setBlocks(persistedBlocks);
    setHasUnsavedChanges(false);
    if (selectedBlockKey) {
      const nextSelected =
        persistedBlocks.find((block) => block.key === selectedBlockKey) ??
        persistedBlocks[0] ??
        null;
      setSelectedBlockId(nextSelected?.id ?? null);
    }
    setBusyKey(null);
    setSuccessMessage("Rascunho salvo.");
    return true;
  }

  saveSelectedBlockRef.current = persistPageDraft;

  function clearInlineEditing() {
    setActiveInlineFieldKey(null);
    setActiveInlineFieldValue("");
    setInlineFieldFrame(null);
    setActiveInlineImageFieldKey(null);
    setInlineImageFrame(null);
    setActiveInlineListImage(null);
    setInlineListImageFrame(null);
    setActiveInlineBooleanFieldKey(null);
    setInlineBooleanFrame(null);
  }

  function openInlineImageEditor(
    block: RenderablePageBlock,
    blockDef: TemplateBlockDefLike | null,
    fieldKey: string
  ) {
    if (!blockDef) {
      setActiveInlineImageFieldKey(null);
      setInlineImageFrame(null);
      return;
    }

    const field = getEditableFields(blockDef).find(
      (item) => item.key === fieldKey && item.kind === "image"
    );

    if (!field) {
      setActiveInlineImageFieldKey(null);
      setInlineImageFrame(null);
      return;
    }

    if (block.id !== selectedBlock?.id) {
      setDraftConfig(asRecord(block.config));
      setDraftAssets(asRecord(block.assets));
    }

    setActiveInlineImageFieldKey(field.key);
    setActiveInlineFieldKey(null);
    setActiveInlineFieldValue("");
    setInlineFieldFrame(null);
    setActiveInlineListImage(null);
    setInlineListImageFrame(null);
    setActiveInlineBooleanFieldKey(null);
    setInlineBooleanFrame(null);
  }

  function openInlineListImageEditor(
    block: RenderablePageBlock,
    fieldKey: string,
    index: number,
    path: string
  ) {
    if (block.id !== selectedBlock?.id) {
      setDraftConfig(asRecord(block.config));
      setDraftAssets(asRecord(block.assets));
    }

    setActiveInlineListImage({
      fieldKey,
      index,
      label: `Imagem ${index + 1}`,
      path,
    });
    setActiveInlineFieldKey(null);
    setActiveInlineFieldValue("");
    setInlineFieldFrame(null);
    setActiveInlineImageFieldKey(null);
    setInlineImageFrame(null);
    setActiveInlineListImage(null);
    setInlineListImageFrame(null);
    setActiveInlineBooleanFieldKey(null);
    setInlineBooleanFrame(null);
  }

  function updateTopLevelImageField(fieldKey: string, updater: (image: EditableImageValue) => EditableImageValue) {
    const currentImage = readEditableImageValue(draftConfig[fieldKey]);
    const nextImage = updater(currentImage);

    setDraftConfig((current) => ({
      ...current,
      [fieldKey]: {
        ...asRecord(current[fieldKey]),
        src: nextImage.src,
        alt: nextImage.alt,
        fitMode: nextImage.fitMode,
        positionX: nextImage.positionX,
        positionY: nextImage.positionY,
      },
    }));

    return nextImage;
  }

  function updateListImageField(
    fieldKey: string,
    index: number,
    updater: (image: EditableImageValue) => EditableImageValue
  ) {
    const list = asArray(draftConfig[fieldKey]).map((item) => asRecord(item));
    const nextList = list.map((item, itemIndex) => {
      if (itemIndex !== index) return item;

      const currentImage = readEditableImageValue(item.image);
      const nextImage = updater(currentImage);

      return {
        ...item,
        image: {
          ...asRecord(item.image),
          src: nextImage.src,
          alt: nextImage.alt,
          fitMode: nextImage.fitMode,
          positionX: nextImage.positionX,
          positionY: nextImage.positionY,
        },
      };
    });

    setDraftConfig((current) => ({
      ...current,
      [fieldKey]: nextList,
    }));
  }

  async function commitTopLevelImageField(fieldKey: string, updater: (image: EditableImageValue) => EditableImageValue) {
    if (!selectedBlock) return;

    const currentImage = readEditableImageValue(draftConfig[fieldKey]);
    const nextImage = updater(currentImage);
    const nextConfig = {
      ...draftConfig,
      [fieldKey]: {
        ...asRecord(draftConfig[fieldKey]),
        src: nextImage.src,
        alt: nextImage.alt,
        fitMode: nextImage.fitMode,
        positionX: nextImage.positionX,
        positionY: nextImage.positionY,
      },
    };

    setDraftConfig(nextConfig);
    await saveSelectedBlock(nextConfig, draftAssets);
  }

  async function commitListImageField(
    fieldKey: string,
    index: number,
    updater: (image: EditableImageValue) => EditableImageValue
  ) {
    if (!selectedBlock) return;

    const list = asArray(draftConfig[fieldKey]).map((item) => asRecord(item));
    const nextList = list.map((item, itemIndex) => {
      if (itemIndex !== index) return item;

      const currentImage = readEditableImageValue(item.image);
      const nextImage = updater(currentImage);

      return {
        ...item,
        image: {
          ...asRecord(item.image),
          src: nextImage.src,
          alt: nextImage.alt,
          fitMode: nextImage.fitMode,
          positionX: nextImage.positionX,
          positionY: nextImage.positionY,
        },
      };
    });

    const nextConfig = {
      ...draftConfig,
      [fieldKey]: nextList,
    };

    setDraftConfig(nextConfig);
    await saveSelectedBlock(nextConfig, draftAssets);
  }

  function openInlineFieldEditor(
    block: RenderablePageBlock,
    blockDef: TemplateBlockDefLike | null,
    fieldKey: string
  ) {
    if (!blockDef) {
      setActiveInlineFieldKey(null);
      setActiveInlineFieldValue("");
      return;
    }

    const field = getEditableFields(blockDef).find(
      (item) => item.key === fieldKey && (item.kind === "text" || item.kind === "longText")
    );

    if (!field) {
      setActiveInlineFieldKey(null);
      setActiveInlineFieldValue("");
      return;
    }

    const sourceConfig = block.id === selectedBlock?.id ? draftConfig : asRecord(block.config);
    const nextValue = sourceConfig[field.key];

    setActiveInlineFieldKey(field.key);
    setActiveInlineFieldValue(typeof nextValue === "string" ? nextValue : "");
    setActiveInlineImageFieldKey(null);
    setInlineImageFrame(null);
    setActiveInlineListImage(null);
    setInlineListImageFrame(null);
    setActiveInlineBooleanFieldKey(null);
    setInlineBooleanFrame(null);
  }

  async function commitInlineFieldChange(nextValue: string) {
    if (!selectedBlock || !activeInlineField) return;

    const nextConfig = {
      ...draftConfig,
      [activeInlineField.key]: nextValue,
    };

    setDraftConfig(nextConfig);
    setActiveInlineFieldValue(nextValue);

    const didSave = await saveSelectedBlock(nextConfig, draftAssets);
    if (didSave) {
      clearInlineEditing();
    }
  }

  function cancelInlineFieldChange() {
    const fallbackValue =
      activeInlineField && typeof draftConfig[activeInlineField.key] === "string"
        ? String(draftConfig[activeInlineField.key])
        : "";

    setActiveInlineFieldValue(fallbackValue);
    clearInlineEditing();
  }

  function openInlineBooleanEditor(
    block: RenderablePageBlock,
    blockDef: TemplateBlockDefLike | null,
    fieldKey: string
  ) {
    const field = getEditableFields(blockDef).find(
      (item) => item.key === fieldKey && item.kind === "boolean"
    );

    if (!field && blockDef) {
      setActiveInlineBooleanFieldKey(null);
      setInlineBooleanFrame(null);
      return;
    }

    if (block.id !== selectedBlock?.id) {
      setDraftConfig(asRecord(block.config));
      setDraftAssets(asRecord(block.assets));
    }

    setActiveInlineBooleanFieldKey(field?.key ?? fieldKey);
    setActiveInlineFieldKey(null);
    setActiveInlineFieldValue("");
    setInlineFieldFrame(null);
    setActiveInlineImageFieldKey(null);
    setInlineImageFrame(null);
    setActiveInlineListImage(null);
    setInlineListImageFrame(null);
  }

  async function commitBooleanFieldChange(fieldKey: string, nextValue: boolean) {
    if (!selectedBlock) return;

    const nextConfig = {
      ...draftConfig,
      [fieldKey]: nextValue,
    };

    setDraftConfig(nextConfig);
    await saveSelectedBlock(nextConfig, draftAssets);
  }

  async function publishPage() {
    setErrorMessage("");
    setSuccessMessage("");

    const saved = await persistPageDraft();
    if (!saved) return;

    setBusyKey("publish");

    try {
      await publishPageAction();
      setSuccessMessage("Pagina publicada.");
    } catch {
      setErrorMessage("Nao foi possivel publicar a pagina.");
    } finally {
      setBusyKey(null);
    }
  }

  async function toggleVisibility(block: RenderablePageBlock) {
    setErrorMessage("");
    setSuccessMessage("");

    replaceBlock({
      ...block,
      visible: !block.visible,
    });
    setHasUnsavedChanges(true);
    setSuccessMessage(block.visible ? "Bloco marcado como oculto." : "Bloco marcado como visivel.");
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

    setErrorMessage("");
    setSuccessMessage("");
    setBlocks(sortBlocks(nextOrder.map((block, index) => ({ ...block, order: index }))));
    setHasUnsavedChanges(true);
    setSuccessMessage("Ordem atualizada no rascunho.");
  }

  async function addBlock(templateBlockKey: string) {
    setErrorMessage("");
    setSuccessMessage("");
    const blockDef = templateBlockDefs.find((item) => item.key === templateBlockKey) ?? null;

    if (!blockDef) {
      setErrorMessage("Bloco nao compativel com este template");
      return;
    }

    const nextBlock = {
      id: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pageId,
      templateBlockDefId: blockDef.id,
      parentId: null,
      key: `${blockDef.key}-${Date.now()}`,
      blockType: blockDef.blockType,
      order: blocks.length,
      visible: true,
      config: asJsonValue(asRecord(blockDef.defaultConfig)),
      props: asJsonValue({}),
      assets: asJsonValue({}),
      createdAt: new Date(),
      updatedAt: new Date(),
      templateBlockDef: blockDef as never,
      children: [],
    } as unknown as RenderablePageBlock;

    setBlocks((current) => sortBlocks([...current, nextBlock]));
    setSelectedBlockId(nextBlock.id);
    setDraftConfig(asRecord(nextBlock.config));
    setDraftAssets(asRecord(nextBlock.assets));
    setHasUnsavedChanges(true);
    setShowAddMenu(false);
    setSuccessMessage("Bloco adicionado ao rascunho.");
  }

  function handleCanvasBlockSelection(event: ReactMouseEvent<HTMLDivElement>) {
    if (previewMode !== "portfolio") return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const blockElement = target.closest<HTMLElement>("[data-ft-block-id]");
    const nextBlockId = blockElement?.dataset.ftBlockId;

    if (!nextBlockId) return;

    const nextBlock = blocks.find((block) => block.id === nextBlockId) ?? null;
    const nextBlockDef = nextBlock?.templateBlockDefId
      ? templateBlockDefs.find((blockDef) => blockDef.id === nextBlock.templateBlockDefId) ?? null
      : null;
    const fieldElement = target.closest<HTMLElement>("[data-ft-config-path]");
    const nextFieldKey = fieldElement?.dataset.ftConfigPath;
    const nextFieldKind =
      fieldElement && nextFieldKey
        ? getEditableFields(nextBlockDef).find((field) => field.key === nextFieldKey)?.kind ??
          inferFieldKindFromCanvas(fieldElement.dataset.ftKind)
        : "unknown";

    setSelectedBlockId(nextBlockId);
    setErrorMessage("");
    setSuccessMessage("");

    const repeaterImagePath =
      nextFieldKind === "image" ? parseRepeaterImagePath(nextFieldKey) : null;

    if (nextBlock && repeaterImagePath) {
      openInlineListImageEditor(
        nextBlock,
        repeaterImagePath.fieldKey,
        repeaterImagePath.index,
        repeaterImagePath.path
      );
      return;
    }

    if (nextBlock && nextFieldKey && nextFieldKind === "image") {
      openInlineImageEditor(nextBlock, nextBlockDef, nextFieldKey);
      return;
    }

    if (nextBlock && nextFieldKey && nextFieldKind === "boolean") {
      openInlineBooleanEditor(nextBlock, nextBlockDef, nextFieldKey);
      return;
    }

    if (nextBlock && nextFieldKey) {
      openInlineFieldEditor(nextBlock, nextBlockDef, nextFieldKey);
      return;
    }

    setActiveInlineFieldKey(null);
    setActiveInlineFieldValue("");
    setInlineFieldFrame(null);
    setActiveInlineImageFieldKey(null);
    setInlineImageFrame(null);
    setActiveInlineBooleanFieldKey(null);
    setInlineBooleanFrame(null);
  }

  function activateEditableSlot(slotFrame: EditableSlotFrame) {
    if (!selectedBlock) return;

    setSelectedBlockId(selectedBlock.id);
    setErrorMessage("");
    setSuccessMessage("");

    const repeaterImagePath =
      slotFrame.kind === "image" ? parseRepeaterImagePath(slotFrame.key) : null;

    if (repeaterImagePath) {
      openInlineListImageEditor(
        selectedBlock,
        repeaterImagePath.fieldKey,
        repeaterImagePath.index,
        repeaterImagePath.path
      );
      return;
    }

    if (slotFrame.kind === "image") {
      openInlineImageEditor(selectedBlock, selectedBlockDef, slotFrame.key);
      return;
    }

    if (slotFrame.kind === "boolean") {
      openInlineBooleanEditor(selectedBlock, selectedBlockDef, slotFrame.key);
      return;
    }

    openInlineFieldEditor(selectedBlock, selectedBlockDef, slotFrame.key);
  }

  function focusEditableSlot(currentKey: string, offset: -1 | 1) {
    const currentIndex = editableSlotFrames.findIndex((frame) => frame.key === currentKey);
    if (currentIndex < 0 || editableSlotFrames.length === 0) return;

    const nextIndex =
      (currentIndex + offset + editableSlotFrames.length) % editableSlotFrames.length;
    const nextFrame = editableSlotFrames[nextIndex];
    if (!nextFrame) return;

    slotButtonRefs.current.get(nextFrame.key)?.focus();
  }

  function handleEditableSlotKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    slotFrame: EditableSlotFrame
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateEditableSlot(slotFrame);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusEditableSlot(slotFrame.key, 1);
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusEditableSlot(slotFrame.key, -1);
    }
  }

  async function removeSelectedBlock() {
    if (!selectedBlock) return;
    setErrorMessage("");
    setSuccessMessage("");

    setBlocks((current) => current.filter((block) => block.id !== selectedBlock.id));
    setHasUnsavedChanges(true);
    setSuccessMessage("Bloco removido do rascunho.");
  }

  function updateDraftField(fieldKey: string, value: unknown) {
    setHasUnsavedChanges(true);
    setDraftConfig((current) => ({
      ...current,
      [fieldKey]: value,
    }));
  }

  function removeDraftField(fieldKey: string) {
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
    setDraftAssets((current) => {
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
  }

  function setListAssetMeta(fieldKey: string, index: number, asset: UploadedAsset, altText: string) {
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
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
      const currentImage = readEditableImageValue(draftConfig[fieldKey]);
      const nextConfig = {
        ...draftConfig,
        [fieldKey]: {
          src: uploadedAsset.url,
          alt: currentImage.alt || selectedBlockDef?.label || "",
          fitMode: currentImage.fitMode,
          positionX: currentImage.positionX,
          positionY: currentImage.positionY,
        },
      };
      const nextAssets = {
        ...draftAssets,
        [fieldKey]: {
          assetId: uploadedAsset.id,
          url: uploadedAsset.url,
          src: uploadedAsset.url,
          alt: currentImage.alt || selectedBlockDef?.label || "",
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
                fitMode:
                  asRecord(item.image).fitMode === "fit" ||
                  asRecord(item.image).fitMode === "fill" ||
                  asRecord(item.image).fitMode === "crop"
                    ? asRecord(item.image).fitMode
                    : "fill",
                positionX:
                  typeof asRecord(item.image).positionX === "number"
                    ? asRecord(item.image).positionX
                    : 50,
                positionY:
                  typeof asRecord(item.image).positionY === "number"
                    ? asRecord(item.image).positionY
                    : 50,
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

  async function removeTopLevelImage(fieldKey: string) {
    if (!selectedBlock) return;

    const nextConfig = { ...draftConfig };
    delete nextConfig[fieldKey];

    const nextAssets = { ...draftAssets };
    delete nextAssets[fieldKey];

    setDraftConfig(nextConfig);
    setDraftAssets(nextAssets);
    await saveSelectedBlock(nextConfig, nextAssets);
  }

  async function removeListImage(fieldKey: string, index: number) {
    if (!selectedBlock) return;

    const list = asArray(draftConfig[fieldKey]).map((item) => asRecord(item));
    const nextList = list.map((item, itemIndex) =>
      itemIndex === index
        ? (() => {
            const nextItem = { ...item };
            delete nextItem.image;
            return nextItem;
          })()
        : item
    );
    const nextAssets = {
      ...draftAssets,
      [fieldKey]: [
        ...asArray(draftAssets[fieldKey]).slice(0, index),
        null,
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
  }

  function handleInlineImagePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!activeInlineImageField || !inlineImageFrame || !activeInlineImageValue?.src) return;
    if (activeInlineImageValue.fitMode === "fit") return;

    const currentImageField = activeInlineImageField;

    const previewFrame = previewFrameRef.current;
    if (!previewFrame) return;

    const escapedBlockId = selectedBlockId ? escapeCssAttribute(selectedBlockId) : "";
    const escapedFieldKey = escapeCssAttribute(currentImageField.key);
    const targetImage = previewFrame.querySelector<HTMLImageElement>(
      `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"] img`
    );

    if (!targetImage) return;

    const naturalWidth = targetImage.naturalWidth || targetImage.width;
    const naturalHeight = targetImage.naturalHeight || targetImage.height;
    const containerWidth = inlineImageFrame.width;
    const containerHeight = inlineImageFrame.height;

    if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight) return;

    const fitMode = activeInlineImageValue.fitMode === "crop" ? "cover" : "cover";
    const scale =
      fitMode === "cover"
        ? Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight)
        : Math.min(containerWidth / naturalWidth, containerHeight / naturalHeight);
    const renderWidth = naturalWidth * scale;
    const renderHeight = naturalHeight * scale;
    const overflowX = Math.max(0, renderWidth - containerWidth);
    const overflowY = Math.max(0, renderHeight - containerHeight);

    if (overflowX <= 1 && overflowY <= 1) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startPositionX = activeInlineImageValue.positionX;
    const startPositionY = activeInlineImageValue.positionY;

    setImageDragActive(true);

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      updateTopLevelImageField(currentImageField.key, (image) => ({
        ...image,
        positionX:
          overflowX > 0
            ? clampPercentage(startPositionX - (deltaX / overflowX) * 100)
            : startPositionX,
        positionY:
          overflowY > 0
            ? clampPercentage(startPositionY - (deltaY / overflowY) * 100)
            : startPositionY,
      }));
    }

    function handlePointerUp(upEvent: PointerEvent) {
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      setImageDragActive(false);

      void commitTopLevelImageField(currentImageField.key, (image) => ({
        ...image,
        positionX:
          overflowX > 0
            ? clampPercentage(startPositionX - (deltaX / overflowX) * 100)
            : startPositionX,
        positionY:
          overflowY > 0
            ? clampPercentage(startPositionY - (deltaY / overflowY) * 100)
            : startPositionY,
      }));
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  function handleInlineListImagePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (!activeInlineListImage || !inlineListImageFrame || !activeInlineListImageValue?.src) return;
    if (activeInlineListImageValue.fitMode === "fit") return;

    const currentListImage = activeInlineListImage;
    const previewFrame = previewFrameRef.current;
    if (!previewFrame) return;

    const escapedBlockId = selectedBlockId ? escapeCssAttribute(selectedBlockId) : "";
    const escapedFieldKey = escapeCssAttribute(currentListImage.path);
    const targetImage = previewFrame.querySelector<HTMLImageElement>(
      `[data-ft-block-id="${escapedBlockId}"] [data-ft-config-path="${escapedFieldKey}"] img`
    );

    if (!targetImage) return;

    const naturalWidth = targetImage.naturalWidth || targetImage.width;
    const naturalHeight = targetImage.naturalHeight || targetImage.height;
    const containerWidth = inlineListImageFrame.width;
    const containerHeight = inlineListImageFrame.height;

    if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight) return;

    const scale = Math.max(containerWidth / naturalWidth, containerHeight / naturalHeight);
    const renderWidth = naturalWidth * scale;
    const renderHeight = naturalHeight * scale;
    const overflowX = Math.max(0, renderWidth - containerWidth);
    const overflowY = Math.max(0, renderHeight - containerHeight);

    if (overflowX <= 1 && overflowY <= 1) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startPositionX = activeInlineListImageValue.positionX;
    const startPositionY = activeInlineListImageValue.positionY;

    setImageDragActive(true);

    function handlePointerMove(moveEvent: PointerEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      updateListImageField(currentListImage.fieldKey, currentListImage.index, (image) => ({
        ...image,
        positionX:
          overflowX > 0
            ? clampPercentage(startPositionX - (deltaX / overflowX) * 100)
            : startPositionX,
        positionY:
          overflowY > 0
            ? clampPercentage(startPositionY - (deltaY / overflowY) * 100)
            : startPositionY,
      }));
    }

    function handlePointerUp(upEvent: PointerEvent) {
      const deltaX = upEvent.clientX - startX;
      const deltaY = upEvent.clientY - startY;

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      setImageDragActive(false);

      void commitListImageField(currentListImage.fieldKey, currentListImage.index, (image) => ({
        ...image,
        positionX:
          overflowX > 0
            ? clampPercentage(startPositionX - (deltaX / overflowX) * 100)
            : startPositionX,
        positionY:
          overflowY > 0
            ? clampPercentage(startPositionY - (deltaY / overflowY) * 100)
            : startPositionY,
      }));
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
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

    if (field.key === "imageAlign") {
      const currentValue =
        value === "left" || value === "center" || value === "right" ? value : "center";

      return (
        <div key={field.key} className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {field.label}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["left", "center", "right"] as const).map((align) => (
              <Button
                key={align}
                type="button"
                variant={currentValue === align ? "primary" : "outline"}
                size="sm"
                onClick={() => updateDraftField(field.key, align)}
              >
                {align === "left" ? "Esquerda" : align === "center" ? "Centro" : "Direita"}
              </Button>
            ))}
          </div>
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

    if (field.kind === "boolean") {
      const checked = typeof value === "boolean" ? value : false;

      return (
        <div
          key={field.key}
          className="flex items-center justify-between gap-3 rounded-[1.1rem] border border-neutral-200 bg-neutral-50/80 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-neutral-900">{field.label}</p>
            <p className="text-xs text-neutral-500">Mostra ou oculta este elemento no template.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => updateDraftField(field.key, !checked)}
            className={`inline-flex h-7 w-12 items-center rounded-full border transition ${
              checked
                ? "border-lime-500 bg-lime-400/90 justify-end"
                : "border-neutral-300 bg-white justify-start"
            }`}
          >
            <span className="mx-1 block h-5 w-5 rounded-full bg-white shadow-sm" />
          </button>
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
    <section className="grid min-h-[45rem] min-w-0 gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100/80 p-2 shadow-sm sm:p-3 xl:grid-cols-[18rem_minmax(0,1fr)] 2xl:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
      <aside className="overflow-hidden rounded-lg border border-neutral-200 bg-white/95 xl:sticky xl:top-20 xl:self-start">
        <div className="border-b border-neutral-200 bg-neutral-50/80 p-2">
          <div className="grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-100 p-1">
            {[
              { key: "portfolio", label: "Portfolio" },
              { key: "resume", label: "Curriculo" },
            ].map((item) => {
              const isActive = previewMode === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setPreviewMode(item.key as PreviewMode)}
                  className={`h-9 rounded-md px-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 ${
                    isActive
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "text-neutral-600 hover:bg-white/70 hover:text-neutral-950"
                  }`}
                  aria-pressed={isActive}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

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

      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_20rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="order-2 min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200/70 xl:order-1">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-300/80 bg-white/90 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-950">
                {previewMode === "portfolio" ? "Portfolio" : "Curriculo"}
              </h2>
              <p className="mt-0.5 truncate text-xs text-neutral-500">
                {pageTitle} em {templateName}
              </p>
            </div>
            <span className="hidden shrink-0 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-[0.6875rem] font-semibold text-neutral-500 sm:inline-flex">
              Canvas
            </span>
          </div>
          <div
            ref={previewViewportRef}
            role="region"
            aria-label="Canvas de edicao do portfolio"
            className="max-h-[70vh] overflow-auto bg-neutral-100 px-2 py-4 sm:px-4 sm:py-4 lg:max-h-[48.75rem] xl:px-3 2xl:px-5"
          >
            <div
              ref={previewFrameRef}
              className="relative mx-auto w-full max-w-[47.5rem] overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm"
            >
              {previewMode === "portfolio" ? (
                <>
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
                      role="application"
                      aria-label="Preview editavel do template"
                      onClickCapture={handleCanvasBlockSelection}
                    >
                      <TemplateRenderer
                        templateSlug={templateSlug}
                        blocks={previewBlocks}
                        profile={initialProfile}
                        version={initialVersion}
                        templateSourcePackage={initialTemplateSourcePackage}
                        renderHiddenBlocks
                      />
                    </div>
                  </div>
                  {selectedBlock && canvasSelectionFrame ? (
                    <>
                      {editableSlotFrames.map((slotFrame) => {
                        const isActiveText = slotFrame.key === activeInlineFieldKey;
                        const isActiveImage = slotFrame.key === activeInlineImageFieldKey;
                        const isActiveBoolean = slotFrame.key === activeInlineBooleanFieldKey;
                        const isImage = slotFrame.kind === "image";
                        const isBoolean = slotFrame.kind === "boolean";
                        const ariaLabel = `Editar ${slotFrame.label} no canvas`;

                        return (
                          <button
                            key={`${selectedBlock.id}:${slotFrame.key}:${slotFrame.left}:${slotFrame.top}`}
                            ref={(node) => {
                              if (node) {
                                slotButtonRefs.current.set(slotFrame.key, node);
                              } else {
                                slotButtonRefs.current.delete(slotFrame.key);
                              }
                            }}
                            type="button"
                            aria-label={ariaLabel}
                            title={ariaLabel}
                            className={`absolute rounded-xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                              isActiveText || isActiveImage || isActiveBoolean
                                ? "border-2 shadow-[0_0_0_1px_rgba(255,255,255,0.82)]"
                                : "border border-dashed"
                            } ${
                              isImage
                                ? "border-sky-400/90 bg-sky-400/10"
                                : isBoolean
                                  ? "border-amber-400/95 bg-amber-300/10"
                                : "border-lime-400/90 bg-lime-300/10"
                            }`}
                            style={{
                              left: `${slotFrame.left}px`,
                              top: `${slotFrame.top}px`,
                              width: `${slotFrame.width}px`,
                              height: `${slotFrame.height}px`,
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              activateEditableSlot(slotFrame);
                            }}
                            onKeyDown={(event) => handleEditableSlotKeyDown(event, slotFrame)}
                          >
                            <span className="sr-only">{ariaLabel}</span>
                          </button>
                        );
                      })}
                      <div
                        className="pointer-events-none absolute rounded-[1.25rem] border-2 border-lime-500/95 shadow-[0_0_0_1px_rgba(255,255,255,0.82)]"
                        style={{
                          left: `${canvasSelectionFrame.left}px`,
                          top: `${canvasSelectionFrame.top}px`,
                          width: `${canvasSelectionFrame.width}px`,
                          height: `${canvasSelectionFrame.height}px`,
                        }}
                      />
                      <div
                        className="absolute z-20 flex items-center gap-1 rounded-full border border-neutral-200 bg-white/96 p-1 shadow-lg backdrop-blur"
                        style={{
                          left: `${Math.max(canvasSelectionFrame.left + 10, 10)}px`,
                          top: `${Math.max(canvasSelectionFrame.top - 18, 10)}px`,
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={busyKey === `reorder:${selectedBlock.id}`}
                          onClick={() => void moveBlock(selectedBlock.id, -1)}
                          aria-label="Mover bloco para cima"
                          className="h-8 w-8 rounded-full px-0"
                        >
                          <ArrowUp className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={busyKey === `reorder:${selectedBlock.id}`}
                          onClick={() => void moveBlock(selectedBlock.id, 1)}
                          aria-label="Mover bloco para baixo"
                          className="h-8 w-8 rounded-full px-0"
                        >
                          <ArrowDown className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          loading={busyKey === `visibility:${selectedBlock.id}`}
                          onClick={() => void toggleVisibility(selectedBlock)}
                          aria-label={selectedBlock.visible ? "Ocultar bloco" : "Exibir bloco"}
                          className="h-8 w-8 rounded-full px-0"
                        >
                          {selectedBlock.visible ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    </>
                  ) : null}
                  {selectedBlock && activeInlineField && inlineFieldFrame ? (
                    <div
                      className="absolute z-30"
                      style={{
                        left: `${inlineFieldFrame.left}px`,
                        top: `${Math.max(inlineFieldFrame.top - 42, 8)}px`,
                        width: `${Math.max(inlineFieldFrame.width, 180)}px`,
                        minHeight: `${Math.max(inlineFieldFrame.height, inlineFieldFrame.kind === "longText" ? 120 : 44)}px`,
                      }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="overflow-hidden rounded-[1.35rem] border border-lime-300 bg-white/97 shadow-xl ring-2 ring-lime-400/70 backdrop-blur">
                        <div className="flex items-center justify-between gap-3 border-b border-neutral-200/80 bg-lime-50/80 px-4 py-2.5">
                          <div className="min-w-0">
                            <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-lime-900/70">
                              Editando texto
                            </p>
                            <p className="truncate text-sm font-semibold text-neutral-900">
                              {inlineFieldFrame.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 rounded-full px-3"
                              data-ft-inline-action="true"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => cancelInlineFieldChange()}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 rounded-full px-3"
                              data-ft-inline-action="true"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => void commitInlineFieldChange(activeInlineFieldValue)}
                            >
                              Salvar
                            </Button>
                          </div>
                        </div>
                        <div className="p-3">
                          {inlineFieldFrame.kind === "longText" ? (
                            <textarea
                              autoFocus
                              value={activeInlineFieldValue}
                              data-ft-inline-editor="true"
                              className="min-h-[8.5rem] w-full rounded-2xl border border-transparent bg-white px-3 py-3 text-sm font-medium text-neutral-950 outline-none placeholder:text-neutral-400"
                              placeholder={inlineFieldFrame.label}
                              onChange={(event) => setActiveInlineFieldValue(event.target.value)}
                              onBlur={(event) => {
                                const nextTarget = event.relatedTarget;
                                if (
                                  nextTarget instanceof HTMLElement &&
                                  nextTarget.dataset.ftInlineAction === "true"
                                ) {
                                  return;
                                }
                                void commitInlineFieldChange(event.target.value);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelInlineFieldChange();
                                  return;
                                }

                                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                                  event.preventDefault();
                                  void commitInlineFieldChange(activeInlineFieldValue);
                                }
                              }}
                            />
                          ) : (
                            <input
                              autoFocus
                              type="text"
                              value={activeInlineFieldValue}
                              data-ft-inline-editor="true"
                              className="h-12 w-full rounded-2xl border border-transparent bg-white px-3 text-sm font-medium text-neutral-950 outline-none placeholder:text-neutral-400"
                              placeholder={inlineFieldFrame.label}
                              onChange={(event) => setActiveInlineFieldValue(event.target.value)}
                              onBlur={(event) => {
                                const nextTarget = event.relatedTarget;
                                if (
                                  nextTarget instanceof HTMLElement &&
                                  nextTarget.dataset.ftInlineAction === "true"
                                ) {
                                  return;
                                }
                                void commitInlineFieldChange(event.target.value);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelInlineFieldChange();
                                  return;
                                }

                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void commitInlineFieldChange(activeInlineFieldValue);
                                }
                              }}
                            />
                          )}
                          <p className="px-1 pt-2 text-[0.72rem] text-neutral-500">
                            {inlineFieldFrame.kind === "longText"
                              ? "Ctrl/Cmd + Enter salva. Esc cancela."
                              : "Enter salva. Esc cancela. Ctrl/Cmd + S salva o rascunho."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {selectedBlock && activeInlineImageField && inlineImageFrame ? (
                    <>
                      <div
                        className={`absolute z-20 rounded-[1.1rem] border-2 border-sky-500/95 bg-sky-400/8 ${
                          imageDragActive ? "cursor-grabbing" : activeInlineImageValue?.fitMode === "fit" ? "cursor-default" : "cursor-grab"
                        }`}
                        style={{
                          left: `${inlineImageFrame.left}px`,
                          top: `${inlineImageFrame.top}px`,
                          width: `${inlineImageFrame.width}px`,
                          height: `${inlineImageFrame.height}px`,
                        }}
                        onPointerDown={handleInlineImagePointerDown}
                      />
                      <div
                        className="absolute z-30 flex max-w-[min(28rem,calc(100%-1rem))] flex-wrap items-center gap-1 rounded-2xl border border-neutral-200 bg-white/96 p-2 shadow-xl backdrop-blur"
                        style={{
                          left: `${Math.max(inlineImageFrame.left + 8, 8)}px`,
                          top: `${Math.max(inlineImageFrame.top + 8, 8)}px`,
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="mr-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                          {inlineImageFrame.label}
                        </span>
                        {(["fit", "fill", "crop"] as const).map((mode) => {
                          const isActive = activeInlineImageValue?.fitMode === mode;
                          const labels = {
                            fit: "Fit",
                            fill: "Fill",
                            crop: "Crop",
                          } as const;

                          return (
                            <Button
                              key={mode}
                              type="button"
                              variant={isActive ? "primary" : "ghost"}
                              size="sm"
                              className="h-8 rounded-full px-3"
                              onClick={() =>
                                void commitTopLevelImageField(activeInlineImageField.key, (image) => ({
                                  ...image,
                                  fitMode: mode,
                                }))
                              }
                            >
                              {labels[mode]}
                            </Button>
                          );
                        })}
                        {selectedBlock?.blockType === "portfolio.custom-section" &&
                        activeInlineImageField.key === "image" ? (
                          <>
                            {(["left", "center", "right"] as const).map((align) => (
                              <Button
                                key={align}
                                type="button"
                                variant={
                                  draftConfig.imageAlign === align ? "primary" : "ghost"
                                }
                                size="sm"
                                className="h-8 rounded-full px-3"
                                onClick={() => updateDraftField("imageAlign", align)}
                              >
                                {align === "left"
                                  ? "Esq."
                                  : align === "center"
                                    ? "Centro"
                                    : "Dir."}
                              </Button>
                            ))}
                          </>
                        ) : null}
                        <label className="inline-flex h-8 cursor-pointer items-center rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50">
                          Trocar
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                void uploadTopLevelImage(activeInlineImageField.key, file);
                              }
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full px-3 text-coral-700"
                          onClick={() => void removeTopLevelImage(activeInlineImageField.key)}
                        >
                          Remover
                        </Button>
                        {activeInlineImageValue?.fitMode !== "fit" ? (
                          <span className="ml-1 text-[0.72rem] text-neutral-500">
                            Arraste para reposicionar
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  {selectedBlock && activeInlineListImage && inlineListImageFrame ? (
                    <>
                      <div
                        className={`absolute z-20 rounded-[1.1rem] border-2 border-sky-500/95 bg-sky-400/8 ${
                          imageDragActive ? "cursor-grabbing" : activeInlineListImageValue?.fitMode === "fit" ? "cursor-default" : "cursor-grab"
                        }`}
                        style={{
                          left: `${inlineListImageFrame.left}px`,
                          top: `${inlineListImageFrame.top}px`,
                          width: `${inlineListImageFrame.width}px`,
                          height: `${inlineListImageFrame.height}px`,
                        }}
                        onPointerDown={handleInlineListImagePointerDown}
                      />
                      <div
                        className="absolute z-30 flex max-w-[min(28rem,calc(100%-1rem))] flex-wrap items-center gap-1 rounded-2xl border border-neutral-200 bg-white/96 p-2 shadow-xl backdrop-blur"
                        style={{
                          left: `${Math.max(inlineListImageFrame.left + 8, 8)}px`,
                          top: `${Math.max(inlineListImageFrame.top + 8, 8)}px`,
                        }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <span className="mr-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                          {inlineListImageFrame.label}
                        </span>
                        {(["fit", "fill", "crop"] as const).map((mode) => {
                          const isActive = activeInlineListImageValue?.fitMode === mode;
                          return (
                            <Button
                              key={mode}
                              type="button"
                              variant={isActive ? "primary" : "ghost"}
                              size="sm"
                              className="h-8 rounded-full px-3"
                              onClick={() =>
                                void commitListImageField(activeInlineListImage.fieldKey, activeInlineListImage.index, (image) => ({
                                  ...image,
                                  fitMode: mode,
                                }))
                              }
                            >
                              {mode === "fit" ? "Fit" : mode === "fill" ? "Fill" : "Crop"}
                            </Button>
                          );
                        })}
                        <label className="inline-flex h-8 cursor-pointer items-center rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50">
                          Trocar
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) {
                                void uploadListImage(activeInlineListImage.fieldKey, activeInlineListImage.index, file);
                              }
                              event.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full px-3 text-coral-700"
                          onClick={() => void removeListImage(activeInlineListImage.fieldKey, activeInlineListImage.index)}
                        >
                          Remover
                        </Button>
                        {activeInlineListImageValue?.fitMode !== "fit" ? (
                          <span className="ml-1 text-[0.72rem] text-neutral-500">
                            Arraste para reposicionar
                          </span>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  {selectedBlock && activeInlineBooleanFieldKey && inlineBooleanFrame ? (
                    <div
                      className="absolute z-30"
                      style={{
                        left: `${Math.max(inlineBooleanFrame.left + inlineBooleanFrame.width - 18, 8)}px`,
                        top: `${Math.max(inlineBooleanFrame.top - 10, 8)}px`,
                      }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-semibold shadow-lg backdrop-blur ${
                          draftConfig[activeInlineBooleanFieldKey] === false
                            ? "border-amber-300 bg-white/96 text-amber-700"
                            : "border-coral-200 bg-white/96 text-coral-700"
                        }`}
                        onClick={() =>
                          void commitBooleanFieldChange(
                            activeInlineBooleanFieldKey,
                            !(typeof draftConfig[activeInlineBooleanFieldKey] === "boolean"
                              ? Boolean(draftConfig[activeInlineBooleanFieldKey])
                              : false)
                          )
                        }
                        aria-label={
                          draftConfig[activeInlineBooleanFieldKey] === false
                            ? `Restaurar ${activeInlineBooleanField?.label ?? activeInlineBooleanFieldKey}`
                            : `Ocultar ${activeInlineBooleanField?.label ?? activeInlineBooleanFieldKey}`
                        }
                      >
                        {draftConfig[activeInlineBooleanFieldKey] === false ? "Restaurar" : "X"}
                      </button>
                    </div>
                  ) : null}
                  <div className="border-t border-neutral-200 bg-white/94 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Adicionar ao final</p>
                        <p className="text-xs text-neutral-500">
                          Novas secoes entram no rascunho e so aparecem publicamente depois de publicar.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="h-10 rounded-full px-4"
                        onClick={() => setShowAddMenu((current) => !current)}
                        aria-expanded={showAddMenu}
                        aria-label="Adicionar nova secao"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                    {showAddMenu ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {availableBlockDefs.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 text-sm text-neutral-500 sm:col-span-2">
                            Nao ha mais blocos disponiveis para este template.
                          </div>
                        ) : (
                          availableBlockDefs.map((blockDef) => (
                            <button
                              key={blockDef.id}
                              type="button"
                              onClick={() => void addBlock(blockDef.key)}
                              className="flex min-h-14 items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition hover:border-lime-300 hover:bg-lime-50"
                            >
                              <span>
                                <span className="block text-sm font-semibold text-neutral-900">
                                  {blockDef.label}
                                </span>
                                <span className="block text-xs text-neutral-500">
                                  {blockDef.blockType}
                                </span>
                              </span>
                              <Plus className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                            </button>
                          ))
                        )}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="px-3 py-4 sm:px-5">
                  <ResumeView
                    templateSlug={templateSlug}
                    blocks={previewBlocks}
                    profile={initialProfile}
                    version={initialVersion}
                    config={initialResumeConfig}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="order-1 min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white/95 xl:sticky xl:top-20 xl:order-2 xl:self-start">
          <div className="border-b border-neutral-200 px-3 py-3">
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

            <div className="grid grid-cols-1 gap-2 2xl:grid-cols-2">
              <Button
                type="button"
                loading={busyKey === "save-page"}
                disabled={!hasUnsavedChanges && busyKey !== "save-page"}
                onClick={() => void persistPageDraft()}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Salvar
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={busyKey === "publish" || busyKey === "save-page"}
                onClick={() => void publishPage()}
                className="2xl:col-span-2"
              >
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Publicar
              </Button>
              {!selectedBlockDef?.required && selectedBlock ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  loading={busyKey === `remove:${selectedBlock.id}`}
                  onClick={() => void removeSelectedBlock()}
                  className="2xl:col-span-2"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remover
                </Button>
              ) : null}
            </div>

            {selectedBlock && selectedBlockDef ? (
              <>

                {inlineEditableFields.length > 0 ? (
                  <div className="rounded-[1.1rem] border border-lime-200 bg-lime-50/80 px-4 py-3">
                    <p className="text-sm font-semibold text-lime-950">Edicao direta no canvas</p>
                    <p className="mt-1 text-xs leading-6 text-lime-900/80">
                      {inlineEditableFields.length} campo(s) deste bloco ja podem ser editados direto
                      na preview: texto, imagem e elementos visuais.
                    </p>
                  </div>
                ) : null}

                {sidebarEditableFields.length > 0 ? (
                  <div className="space-y-4">
                    {sidebarEditableFields.map((field) => renderEditableField(field))}
                  </div>
                ) : (
                  <div className="rounded-[1.1rem] border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-sm leading-7 text-neutral-500">
                    Este bloco nao precisa mais do painel lateral para os campos principais.
                  </div>
                )}
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


