"use client";

import {
  createContext,
  FormEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, X } from "lucide-react";

type FeedbackKind = "IMPROVEMENT" | "CORRECTION";

type FeedbackTarget = {
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
  viewportWidth: number;
  viewportHeight: number;
  route: string;
  url: string;
  elementTag: string | null;
  elementId: string | null;
  elementClasses: string | null;
  elementText: string | null;
};

type FeedbackMarker = FeedbackTarget & {
  number: number;
  kind: FeedbackKind;
};

type FeedbackContextValue = {
  feedbackMode: boolean;
  setFeedbackMode: (active: boolean) => void;
  toggleFeedbackMode: () => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function readTargetDetails(target: EventTarget | null) {
  const element = target instanceof HTMLElement ? target : null;
  const text = element?.innerText?.replace(/\s+/g, " ").trim().slice(0, 220) || null;

  return {
    elementTag: element?.tagName.toLowerCase() ?? null,
    elementId: element?.id || null,
    elementClasses: element?.className
      ? String(element.className).replace(/\s+/g, " ").trim().slice(0, 220)
      : null,
    elementText: text,
  };
}

function buildTarget(event: ReactMouseEvent<HTMLDivElement>): FeedbackTarget {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return {
    x: Math.round(event.clientX),
    y: Math.round(event.clientY),
    relativeX: Number((event.clientX / Math.max(1, viewportWidth)).toFixed(4)),
    relativeY: Number((event.clientY / Math.max(1, viewportHeight)).toFixed(4)),
    viewportWidth,
    viewportHeight,
    route: window.location.pathname,
    url: window.location.href,
    ...readTargetDetails(event.target),
  };
}

function isIgnoredTarget(target: EventTarget | null) {
  return target instanceof HTMLElement
    ? Boolean(target.closest("[data-feedback-ignore='true']"))
    : false;
}

export function useFeedbackMode() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedbackMode must be used inside FeedbackModeProvider.");
  }

  return context;
}

export function FeedbackModeProvider({ children }: { children: ReactNode }) {
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [target, setTarget] = useState<FeedbackTarget | null>(null);
  const [kind, setKind] = useState<FeedbackKind>("IMPROVEMENT");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [markers, setMarkers] = useState<FeedbackMarker[]>([]);

  const contextValue = useMemo<FeedbackContextValue>(
    () => ({
      feedbackMode,
      setFeedbackMode,
      toggleFeedbackMode: () => setFeedbackMode((current) => !current),
    }),
    [feedbackMode]
  );

  function closeModal() {
    setTarget(null);
    setKind("IMPROVEMENT");
    setMessage("");
    setSaving(false);
    setError("");
  }

  function handleCaptureClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!feedbackMode || target || isIgnoredTarget(event.target)) return;

    event.preventDefault();
    event.stopPropagation();
    setTarget(buildTarget(event));
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target || saving) return;

    setSaving(true);
    setError("");

    const response = await fetch("/api/feedback/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...target,
        kind,
        message,
      }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      setSaving(false);
      setError(body?.error?.message ?? "Nao foi possivel enviar o feedback.");
      return;
    }

    const number = Number(body?.ticket?.number);
    if (Number.isFinite(number)) {
      setMarkers((current) => [...current, { ...target, kind, number }]);
    }

    closeModal();
  }

  return (
    <FeedbackContext.Provider value={contextValue}>
      <div className="relative min-h-screen" onClickCapture={handleCaptureClick}>
        {children}

        {feedbackMode ? (
          <div
            className="pointer-events-none fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#050505] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgb(0_0_0/0.18)]"
            data-feedback-ignore="true"
          >
            Modo feedback ativo. Clique em qualquer ponto da tela.
          </div>
        ) : null}

        {markers.map((marker) => (
          <span
            key={marker.number}
            className="pointer-events-none fixed z-[65] flex h-7 min-w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0866ff] px-2 text-xs font-bold text-white shadow-[0_4px_14px_rgb(0_0_0/0.22)]"
            style={{ left: marker.x, top: marker.y }}
            title={`Feedback #${marker.number}`}
          >
            #{marker.number}
          </span>
        ))}

        {target ? (
          <div
            className="fixed inset-0 z-[80] bg-black/10"
            data-feedback-ignore="true"
          >
            <form
              onSubmit={submitFeedback}
              className="absolute grid w-[min(92vw,24rem)] gap-3 rounded-xl border border-[#dddfe2] bg-white p-4 shadow-[0_18px_48px_rgb(0_0_0/0.18)]"
              style={{
                left: Math.min(target.x + 12, target.viewportWidth - 400),
                top: Math.min(target.y + 12, target.viewportHeight - 280),
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#050505]">
                    Novo feedback
                  </p>
                  <p className="text-xs text-[#65676b]">
                    Marcação em {target.route}
                  </p>
                </div>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full text-[#65676b] hover:bg-[#f0f2f5]"
                  onClick={closeModal}
                  aria-label="Cancelar feedback"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <label className="grid gap-1.5 text-sm font-medium text-[#050505]">
                Tipo
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as FeedbackKind)}
                  className="h-10 rounded-lg border border-[#dddfe2] bg-white px-3 text-sm outline-none focus:border-[#0866ff]"
                >
                  <option value="IMPROVEMENT">Melhoria</option>
                  <option value="CORRECTION">Correção</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-sm font-medium text-[#050505]">
                Descreva o que precisa melhorar
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  minLength={6}
                  maxLength={1200}
                  required
                  rows={5}
                  className="resize-none rounded-lg border border-[#dddfe2] bg-white px-3 py-2 text-sm font-normal leading-5 outline-none focus:border-[#0866ff]"
                  placeholder="Ex: o botão está branco com fundo branco."
                />
              </label>

              {error ? <p className="text-xs text-red-600">{error}</p> : null}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-[#dddfe2] px-4 text-sm font-semibold text-[#050505]"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0866ff] px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {saving ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </FeedbackContext.Provider>
  );
}
