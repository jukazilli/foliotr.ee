"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Check,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

export interface GalleryImageAsset {
  id: string;
  url: string;
  name?: string | null;
  altText?: string | null;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  metadata?: Record<string, unknown>;
  createdAt?: string | Date;
}

interface AssetGalleryPickerProps {
  open: boolean;
  title?: string;
  description?: string;
  uploadPurpose?: string;
  currentUrl?: string | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: GalleryImageAsset) => void | Promise<void>;
}

const IMAGE_FILE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const IMAGE_FILE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const IMAGE_FILE_MAX_SIZE = 5 * 1024 * 1024;

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function parseJsonResponse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatApiError(payload: unknown, fallback: string) {
  const error = asRecord(asRecord(payload).error);
  const details = asRecord(error.details);

  if (typeof details.message === "string") return details.message;
  if (typeof error.message === "string") return error.message;

  return fallback;
}

function readAsset(value: unknown): GalleryImageAsset | null {
  const asset = asRecord(value);

  if (typeof asset.id !== "string" || typeof asset.url !== "string") {
    return null;
  }

  return {
    id: asset.id,
    url: normalizeStoragePublicUrl(asset.url),
    name: typeof asset.name === "string" ? asset.name : null,
    altText: typeof asset.altText === "string" ? asset.altText : null,
    mimeType: typeof asset.mimeType === "string" ? asset.mimeType : null,
    size: typeof asset.size === "number" ? asset.size : null,
    width: typeof asset.width === "number" ? asset.width : null,
    height: typeof asset.height === "number" ? asset.height : null,
    metadata: asRecord(asset.metadata),
    createdAt:
      typeof asset.createdAt === "string" || asset.createdAt instanceof Date
        ? asset.createdAt
        : undefined,
  };
}

function formatSize(size: number | null | undefined) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetGalleryPicker({
  open,
  title = "Galeria de fotos",
  description = "Reutilize imagens ja enviadas ou adicione uma nova.",
  uploadPurpose = "asset",
  currentUrl,
  onOpenChange,
  onSelect,
}: AssetGalleryPickerProps) {
  const [assets, setAssets] = useState<GalleryImageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const normalizedCurrentUrl = currentUrl ? normalizeStoragePublicUrl(currentUrl) : "";

  const orderedAssets = useMemo(
    () =>
      [...assets].sort((left, right) => {
        const leftSelected =
          normalizedCurrentUrl &&
          normalizeStoragePublicUrl(left.url) === normalizedCurrentUrl;
        const rightSelected =
          normalizedCurrentUrl &&
          normalizeStoragePublicUrl(right.url) === normalizedCurrentUrl;

        if (leftSelected === rightSelected) return 0;
        return leftSelected ? -1 : 1;
      }),
    [assets, normalizedCurrentUrl]
  );

  async function loadAssets(cursor?: string | null) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      kind: "IMAGE",
      status: "READY",
      limit: "48",
    });
    if (cursor) params.set("cursor", cursor);

    try {
      const response = await fetch(`/api/assets?${params.toString()}`);
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          formatApiError(payload, "Nao foi possivel carregar a galeria.")
        );
      }

      const body = asRecord(payload);
      const nextAssets = Array.isArray(body.assets)
        ? body.assets
            .map(readAsset)
            .filter((item): item is GalleryImageAsset => Boolean(item))
        : [];

      setAssets((current) => (cursor ? [...current, ...nextAssets] : nextAssets));
      setNextCursor(typeof body.nextCursor === "string" ? body.nextCursor : null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nao foi possivel carregar a galeria."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    void loadAssets();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !uploading && !selectingId) {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open, selectingId, uploading]);

  async function selectAsset(asset: GalleryImageAsset) {
    setSelectingId(asset.id);
    setError("");

    try {
      await onSelect(asset);
      onOpenChange(false);
    } catch (selectError) {
      setError(
        selectError instanceof Error
          ? selectError.message
          : "Nao foi possivel usar esta imagem."
      );
    } finally {
      setSelectingId(null);
    }
  }

  async function uploadFile(file: File) {
    if (!IMAGE_FILE_TYPES.includes(file.type)) {
      setError("Use JPG, PNG, WebP ou GIF.");
      return;
    }

    if (file.size > IMAGE_FILE_MAX_SIZE) {
      setError("A imagem deve ter ate 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    formData.set("purpose", uploadPurpose);

    setUploading(true);
    setError("");

    try {
      const response = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(formatApiError(payload, "Nao foi possivel enviar a imagem."));
      }

      const asset = readAsset(asRecord(payload).asset);
      if (!asset) {
        throw new Error("Upload concluido sem asset valido.");
      }

      setAssets((current) => [
        asset,
        ...current.filter((item) => item.id !== asset.id),
      ]);
      await selectAsset(asset);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Nao foi possivel enviar a imagem."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!file) return;
    void uploadFile(file);
  }

  return (
    <>
      <input
        ref={fileInputRef}
        id="asset-gallery-file-input"
        name="assetGalleryFile"
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        onChange={handleFileChange}
      />

      {open ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-neutral-950/54 px-3 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="asset-gallery-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !uploading && !selectingId) {
              onOpenChange(false);
            }
          }}
        >
          <div className="flex max-h-[min(48rem,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="asset-gallery-title"
                  className="font-display text-xl font-semibold tracking-tight text-neutral-950"
                >
                  {title}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">{description}</p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-950 disabled:pointer-events-none disabled:opacity-50"
                aria-label="Fechar galeria"
                disabled={uploading || Boolean(selectingId)}
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                <ImageIcon className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                {assets.length} imagens na galeria
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading || uploading || Boolean(selectingId)}
                  onClick={() => void loadAssets()}
                >
                  <RefreshCw
                    className={cn("h-4 w-4", loading && "animate-spin")}
                    aria-hidden="true"
                  />
                  Atualizar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={uploading || Boolean(selectingId)}
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-4 w-4" aria-hidden="true" />
                  Enviar foto
                </Button>
              </div>
            </div>

            {error ? (
              <div className="border-b border-coral-100 bg-coral-50 px-4 py-3 text-sm font-medium text-coral-900 sm:px-5">
                {error}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {loading && assets.length === 0 ? (
                <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Carregando imagens
                  </span>
                </div>
              ) : orderedAssets.length === 0 ? (
                <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center">
                  <div>
                    <ImageIcon
                      className="mx-auto h-9 w-9 text-neutral-300"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-sm font-semibold text-neutral-900">
                      Nenhuma imagem enviada ainda
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      Envie uma foto uma vez e reutilize em outros pontos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {orderedAssets.map((asset) => {
                    const assetUrl = normalizeStoragePublicUrl(asset.url);
                    const isCurrent =
                      normalizedCurrentUrl && assetUrl === normalizedCurrentUrl;
                    const isSelecting = selectingId === asset.id;

                    return (
                      <button
                        key={asset.id}
                        type="button"
                        className={cn(
                          "group min-w-0 rounded-xl border bg-white p-2 text-left shadow-sm transition hover:border-lime-300 hover:bg-lime-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500",
                          isCurrent
                            ? "border-lime-400 ring-1 ring-lime-400"
                            : "border-neutral-200"
                        )}
                        disabled={uploading || Boolean(selectingId)}
                        onClick={() => void selectAsset(asset)}
                      >
                        <span className="relative block aspect-square overflow-hidden rounded-lg bg-neutral-100">
                          <img
                            src={assetUrl}
                            alt={asset.altText || asset.name || ""}
                            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                          />
                          {isCurrent ? (
                            <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-lime-400 text-lime-950 shadow-sm">
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                          ) : null}
                          {isSelecting ? (
                            <span className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
                              <Loader2
                                className="h-5 w-5 animate-spin text-neutral-900"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-2 block truncate text-xs font-semibold text-neutral-900">
                          {asset.name || "Imagem"}
                        </span>
                        <span className="block truncate text-[11px] text-neutral-500">
                          {formatSize(asset.size) || asset.mimeType || "Imagem"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {nextCursor ? (
                <div className="mt-4 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={loading}
                    disabled={uploading || Boolean(selectingId)}
                    onClick={() => void loadAssets(nextCursor)}
                  >
                    Carregar mais
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
