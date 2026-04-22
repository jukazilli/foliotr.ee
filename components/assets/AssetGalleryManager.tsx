"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import {
  formatApiError,
  formatAssetSize,
  GalleryImageAsset,
  IMAGE_FILE_ACCEPT,
  IMAGE_FILE_MAX_SIZE,
  IMAGE_FILE_TYPES,
  parseJsonResponse,
  readAsset,
} from "@/components/assets/gallery-shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GalleryPageResponse {
  assets?: unknown[];
  page?: number;
  totalPages?: number;
}

export function AssetGalleryManager() {
  const [assets, setAssets] = useState<GalleryImageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadAssets(targetPage = 1) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      kind: "IMAGE",
      status: "READY",
      limit: "12",
      page: String(targetPage),
    });

    try {
      const response = await fetch(`/api/assets?${params.toString()}`);
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(formatApiError(payload, "Nao foi possivel carregar a galeria."));
      }

      const body =
        payload && typeof payload === "object" ? (payload as GalleryPageResponse) : {};
      const nextAssets = Array.isArray(body.assets)
        ? body.assets.map(readAsset).filter((item): item is GalleryImageAsset => Boolean(item))
        : [];

      setAssets(nextAssets);
      setPage(typeof body.page === "number" && body.page > 0 ? body.page : targetPage);
      setTotalPages(
        typeof body.totalPages === "number" && body.totalPages > 0 ? body.totalPages : 1
      );
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
    void loadAssets();
  }, []);

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
    formData.set("purpose", "asset");

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

      const asset = readAsset((payload as { asset?: unknown })?.asset);
      if (!asset) {
        throw new Error("Upload concluido sem asset valido.");
      }

      await loadAssets(1);
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

  async function deleteAsset(asset: GalleryImageAsset) {
    if (!asset.id || deletingId || asset.canDelete === false) return;

    const confirmed = window.confirm(`Excluir "${asset.name || "Imagem"}"?`);
    if (!confirmed) return;

    setDeletingId(asset.id);
    setError("");

    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE",
      });
      const payload = await parseJsonResponse(response);

      if (!response.ok) {
        throw new Error(formatApiError(payload, "Nao foi possivel excluir a imagem."));
      }

      const nextPage = assets.length === 1 && page > 1 ? page - 1 : page;
      await loadAssets(nextPage);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Nao foi possivel excluir a imagem."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";

    if (!file) return;
    void uploadFile(file);
  }

  function renderPaginationButton(targetPage: number) {
    const isActive = targetPage === page;

    return (
      <button
        key={targetPage}
        type="button"
        disabled={loading || uploading || deletingId !== null || isActive}
        onClick={() => void loadAssets(targetPage)}
        className={cn(
          "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition",
          isActive
            ? "border-lime-300 bg-lime-50 text-lime-950"
            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        {targetPage}
      </button>
    );
  }

  const paginationTargets = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, page - 3),
    Math.max(5, page + 2)
  );

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        id="asset-gallery-page-file-input"
        name="assetGalleryPageFile"
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
          Galeria
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            loading={loading}
            disabled={uploading || deletingId !== null}
            onClick={() => void loadAssets(page)}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Atualizar
          </Button>
          <Button
            type="button"
            loading={uploading}
            disabled={loading || deletingId !== null}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Enviar
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3 text-sm font-medium text-coral-900">
          {error}
        </div>
      ) : null}

      {loading && assets.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Carregando imagens
          </span>
        </div>
      ) : assets.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-[24px] border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center">
          <div>
            <ImageIcon className="mx-auto h-10 w-10 text-neutral-300" aria-hidden="true" />
            <p className="mt-4 text-base font-semibold text-neutral-950">
              Nenhuma imagem enviada
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {assets.map((asset) => {
              const usageCount = asset.usageSummary?.count ?? 0;
              const inUse = asset.usageSummary?.inUse ?? false;
              const isDeleting = deletingId === asset.id;

              return (
                <Card
                  key={asset.id}
                  className={cn(
                    "overflow-hidden rounded-[24px] border-neutral-200",
                    inUse && "border-lime-300"
                  )}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                      <img
                        src={asset.url}
                        alt={asset.altText || asset.name || ""}
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={cn(
                          "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          inUse ? "bg-lime-100 text-lime-900" : "bg-white/92 text-neutral-700"
                        )}
                      >
                        {inUse ? `Em uso${usageCount > 1 ? ` (${usageCount})` : ""}` : "Livre"}
                      </span>
                      <button
                        type="button"
                        aria-label={`Excluir ${asset.name || "imagem"}`}
                        title={
                          asset.canDelete === false
                            ? "Imagem em uso"
                            : asset.name
                              ? `Excluir ${asset.name}`
                              : "Excluir imagem"
                        }
                        disabled={
                          loading ||
                          uploading ||
                          deletingId !== null ||
                          asset.canDelete === false
                        }
                        onClick={() => void deleteAsset(asset)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/92 text-neutral-700 transition hover:bg-coral-50 hover:text-coral-800 disabled:pointer-events-none disabled:opacity-45"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 p-3">
                      <div>
                        <p className="truncate text-sm font-semibold text-neutral-950">
                          {asset.name || "Imagem"}
                        </p>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {formatAssetSize(asset.size) || asset.mimeType || "Imagem"}
                        </p>
                      </div>

                      {inUse ? (
                        <p className="line-clamp-2 text-[11px] leading-5 text-neutral-500">
                          {asset.usageSummary?.locations
                            ?.slice(0, 2)
                            .map((location) => location.label)
                            .join(" · ") || "Em uso"}
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">
              Pagina {page} de {totalPages}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading || uploading || deletingId !== null}
                onClick={() => void loadAssets(page - 1)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50"
              >
                Anterior
              </button>
              {paginationTargets.map((targetPage) => renderPaginationButton(targetPage))}
              <button
                type="button"
                disabled={page >= totalPages || loading || uploading || deletingId !== null}
                onClick={() => void loadAssets(page + 1)}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-50"
              >
                Proxima
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
