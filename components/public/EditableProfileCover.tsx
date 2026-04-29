"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Move, Trash2, X } from "lucide-react";

const coverFallbackStyle = { backgroundColor: "#ffffff" };
const positionStep = 4;

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function parseJsonResponse(response: Response) {
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const payloadRecord =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    const nestedError =
      payloadRecord?.error && typeof payloadRecord.error === "object"
        ? (payloadRecord.error as Record<string, unknown>)
        : null;
    const message =
      (typeof payloadRecord?.message === "string" && payloadRecord.message) ||
      (typeof nestedError?.message === "string" && nestedError.message) ||
      "Nao foi possivel salvar a capa.";
    throw new Error(message);
  }

  return payload;
}

interface EditableProfileCoverProps {
  bannerUrl: string | null;
  bannerPositionX: number;
  bannerPositionY: number;
  isOwner: boolean;
}

export function EditableProfileCover({
  bannerUrl,
  bannerPositionX,
  bannerPositionY,
  isOwner,
}: EditableProfileCoverProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragStartRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    x: number;
    y: number;
  } | null>(null);
  const [imageUrl, setImageUrl] = useState(bannerUrl ?? "");
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeRequested, setRemoveRequested] = useState(false);
  const [position, setPosition] = useState({
    x: clampPercent(bannerPositionX),
    y: clampPercent(bannerPositionY),
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = removeRequested ? "" : localPreviewUrl || imageUrl;
  const hasImage = Boolean(previewUrl);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  function beginEditing() {
    if (!isOwner) return;
    setEditing(true);
    setError("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);

    setSelectedFile(file);
    setRemoveRequested(false);
    setLocalPreviewUrl(URL.createObjectURL(file));
    setPosition({ x: 50, y: 50 });
    setEditing(true);
    setError("");
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!editing || !hasImage) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: position.x,
      y: position.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const box = event.currentTarget.getBoundingClientRect();
    const deltaX = ((event.clientX - start.clientX) / Math.max(1, box.width)) * 100;
    const deltaY = ((event.clientY - start.clientY) / Math.max(1, box.height)) * 100;

    setPosition({
      x: clampPercent(start.x - deltaX),
      y: clampPercent(start.y - deltaY),
    });
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (start?.pointerId === event.pointerId) {
      dragStartRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function moveBy(deltaX: number, deltaY: number) {
    setPosition((current) => ({
      x: clampPercent(current.x + deltaX),
      y: clampPercent(current.y + deltaY),
    }));
  }

  function cancelEditing() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl("");
    setSelectedFile(null);
    setRemoveRequested(false);
    setImageUrl(bannerUrl ?? "");
    setPosition({
      x: clampPercent(bannerPositionX),
      y: clampPercent(bannerPositionY),
    });
    setEditing(false);
    setError("");
  }

  async function uploadSelectedFile(): Promise<string> {
    if (removeRequested) return "";
    if (!selectedFile) return imageUrl;

    const formData = new FormData();
    formData.set("file", selectedFile);
    formData.set("purpose", "banner");

    const response = await fetch("/api/assets/upload", {
      method: "POST",
      body: formData,
    });
    const payload = await parseJsonResponse(response);
    const asset =
      payload &&
      typeof payload === "object" &&
      "asset" in payload &&
      payload.asset &&
      typeof payload.asset === "object" &&
      "url" in payload.asset &&
      typeof payload.asset.url === "string"
        ? payload.asset
        : null;

    if (!asset) {
      throw new Error("Upload concluido sem imagem valida.");
    }

    return asset.url as string;
  }

  async function saveCover() {
    if (saving) return;
    setSaving(true);
    setError("");

    try {
      const nextBannerUrl = await uploadSelectedFile();
      await parseJsonResponse(
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bannerUrl: nextBannerUrl,
            bannerPositionX: position.x,
            bannerPositionY: position.y,
          }),
        })
      );

      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl("");
      setSelectedFile(null);
      setRemoveRequested(false);
      setImageUrl(nextBannerUrl);
      setEditing(false);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Nao foi possivel salvar a capa."
      );
    } finally {
      setSaving(false);
    }
  }

  function removeCover() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl("");
    setSelectedFile(null);
    setRemoveRequested(true);
    setEditing(true);
    setError("");
  }

  return (
    <div
      className={`relative h-48 overflow-hidden sm:h-64 ${
        editing ? "cursor-grab touch-none" : ""
      }`}
      style={coverFallbackStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt=""
          className="h-full w-full select-none object-cover"
          draggable={false}
          style={{ objectPosition: `${position.x}% ${position.y}%` }}
        />
      ) : (
        <div className="flex h-full w-full items-end p-5" style={coverFallbackStyle}>
          <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-neutral-800/70">
            FolioTree
          </span>
        </div>
      )}

      {isOwner ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            className="absolute right-44 top-4 z-30 flex flex-wrap justify-end gap-2 max-sm:right-4 max-sm:top-16"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-950 shadow-sm"
              onClick={(event) => {
                event.stopPropagation();
                beginEditing();
              }}
            >
              <ImagePlus className="h-4 w-4" aria-hidden />
              {hasImage ? "Editar capa" : "Adicionar capa"}
            </button>
          </div>

          {editing ? (
            <div
              className="absolute right-4 top-16 z-30 flex max-w-[calc(100%-2rem)] flex-wrap justify-end gap-2 rounded-2xl bg-white/85 p-2 shadow-sm backdrop-blur max-sm:top-28"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerMove={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-950 shadow-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                <ImagePlus className="h-4 w-4" aria-hidden />
                {hasImage ? "Trocar" : "Upload"}
              </button>
              {imageUrl || localPreviewUrl ? (
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-red-200 bg-white px-4 text-sm font-bold text-red-700 shadow-sm"
                  onClick={removeCover}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remover
                </button>
              ) : null}
              {hasImage ? (
                <div className="grid grid-cols-3 gap-1 rounded-2xl border border-neutral-300 bg-white p-1 shadow-sm">
                  <span />
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full text-sm font-black hover:bg-neutral-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      moveBy(0, -positionStep);
                    }}
                    aria-label="Mover capa para cima"
                  >
                    ^
                  </button>
                  <span />
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full text-sm font-black hover:bg-neutral-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      moveBy(-positionStep, 0);
                    }}
                    aria-label="Mover capa para esquerda"
                  >
                    {"<"}
                  </button>
                  <span className="grid h-8 w-8 place-items-center text-xs font-black">
                    {position.x}/{position.y}
                  </span>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full text-sm font-black hover:bg-neutral-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      moveBy(positionStep, 0);
                    }}
                    aria-label="Mover capa para direita"
                  >
                    {">"}
                  </button>
                  <span />
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full text-sm font-black hover:bg-neutral-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      moveBy(0, positionStep);
                    }}
                    aria-label="Mover capa para baixo"
                  >
                    v
                  </button>
                  <span />
                </div>
              ) : null}
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-bold text-white shadow-sm disabled:opacity-60"
                disabled={saving}
                onClick={(event) => {
                  event.stopPropagation();
                  void saveCover();
                }}
              >
                <Check className="h-4 w-4" aria-hidden />
                {saving ? "Salvando" : "Salvar capa"}
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-950 shadow-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  cancelEditing();
                }}
              >
                <X className="h-4 w-4" aria-hidden />
                Cancelar
              </button>
              {hasImage ? (
                <span className="inline-flex h-10 items-center gap-2 rounded-full bg-neutral-950/85 px-3 text-xs font-bold text-white">
                  <Move className="h-4 w-4" aria-hidden />
                  Arraste a capa
                </span>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="absolute bottom-4 right-4 max-w-sm rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white">
              {error}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
