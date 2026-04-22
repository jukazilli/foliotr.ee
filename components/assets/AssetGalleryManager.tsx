"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowRight,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  UploadCloud,
} from "lucide-react";
import { StatCard } from "@/components/app/primitives";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function AssetGalleryManager() {
  const [assets, setAssets] = useState<GalleryImageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [latestAssetId, setLatestAssetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const newestAsset = useMemo(() => assets[0] ?? null, [assets]);

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
        throw new Error(formatApiError(payload, "Nao foi possivel carregar a galeria."));
      }

      const body = payload && typeof payload === "object" ? payload : {};
      const nextAssets = Array.isArray((body as { assets?: unknown[] }).assets)
        ? ((body as { assets: unknown[] }).assets
            .map(readAsset)
            .filter((item): item is GalleryImageAsset => Boolean(item)))
        : [];

      setAssets((current) => (cursor ? [...current, ...nextAssets] : nextAssets));
      setNextCursor(
        typeof (body as { nextCursor?: unknown }).nextCursor === "string"
          ? ((body as { nextCursor: string }).nextCursor ?? null)
          : null
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

      setAssets((current) => [asset, ...current.filter((item) => item.id !== asset.id)]);
      setLatestAssetId(asset.id);
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
    <div className="space-y-6">
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Imagens"
          value={assets.length}
          hint="Itens prontos para reutilizar no perfil e nas paginas."
          tone="lime"
        />
        <StatCard
          label="Upload"
          value={uploading ? "Em andamento" : "Disponivel"}
          hint="Envie novas fotos sem sair da galeria."
          tone="cyan"
        />
        <StatCard
          label="Mais recente"
          value={newestAsset?.createdAt ? formatDate(newestAsset.createdAt, "short") : "-"}
          hint={newestAsset?.name || "Sua imagem mais nova aparece primeiro."}
          tone="violet"
        />
      </section>

      <Card className="rounded-[28px] border-neutral-200">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <CardTitle className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
                Biblioteca de imagens
              </CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
                Reaproveite as fotos que voce ja enviou e mantenha uma base unica para avatar,
                capas e blocos do editor.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                loading={loading}
                disabled={uploading}
                onClick={() => void loadAssets()}
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Atualizar
              </Button>
              <Button
                type="button"
                loading={uploading}
                disabled={loading}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Enviar imagem
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/profile">
                Usar no perfil
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/pages">
                Usar nas paginas
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
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
                  Voce ainda nao enviou imagens
                </p>
                <p className="mt-2 max-w-md text-sm leading-7 text-neutral-600">
                  Envie uma foto uma vez para reutilizar depois no perfil, nas capas e no
                  editor.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {assets.map((asset) => {
                const isLatest = latestAssetId === asset.id;

                return (
                  <article
                    key={asset.id}
                    className={`overflow-hidden rounded-[24px] border bg-white shadow-sm transition ${
                      isLatest
                        ? "border-lime-300 ring-1 ring-lime-300"
                        : "border-neutral-200 hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                  >
                    <div className="aspect-square overflow-hidden bg-neutral-100">
                      <img
                        src={asset.url}
                        alt={asset.altText || asset.name || ""}
                        className="h-full w-full object-cover"
                      />
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
                      <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-500">
                        <span className="truncate">
                          {asset.createdAt ? formatDate(asset.createdAt, "short") : "sem data"}
                        </span>
                        {isLatest ? (
                          <span className="rounded-full bg-lime-100 px-2 py-0.5 font-medium text-lime-900">
                            novo
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {nextCursor ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                loading={loading}
                disabled={uploading}
                onClick={() => void loadAssets(nextCursor)}
              >
                Carregar mais
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
