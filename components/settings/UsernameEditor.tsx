"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeUsernameInput } from "@/lib/usernames";

type UsernameAvailability = {
  available: boolean;
  username: string;
  message?: string;
  suggestions?: string[];
};

type SaveStatus = "idle" | "checking" | "saving" | "saved" | "error";

function readApiMessage(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const error = (
    body as { error?: { message?: string; details?: { message?: string } } }
  ).error;
  return error?.details?.message ?? error?.message ?? null;
}

export function UsernameEditor({
  initialUsername,
  onChanged,
}: {
  initialUsername: string | null;
  onChanged?: (username: string) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialUsername ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const normalizedValue = useMemo(() => normalizeUsernameInput(value), [value]);
  const unchanged = normalizedValue === (initialUsername ?? "");

  useEffect(() => {
    if (!value.trim() || unchanged) {
      setStatus("idle");
      setMessage("");
      setSuggestions([]);
      return;
    }

    const parsed =
      normalizedValue.length >= 3 &&
      normalizedValue.length <= 20 &&
      /^[a-z0-9._-]+$/.test(normalizedValue);

    if (!parsed) {
      setStatus("error");
      setMessage("Use 3 a 20 caracteres: letras, numeros, ponto, underline ou hifen.");
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setStatus("checking");
      fetch(`/api/username?username=${encodeURIComponent(normalizedValue)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          const body = (await response.json().catch(() => null)) as
            | UsernameAvailability
            | unknown;

          if (!response.ok) {
            throw new Error(
              readApiMessage(body) ?? "Nao foi possivel validar o username."
            );
          }

          const availability = body as UsernameAvailability;
          if (availability.available) {
            setStatus("idle");
            setMessage("Username disponivel.");
            setSuggestions([]);
            return;
          }

          setStatus("error");
          setMessage(availability.message ?? "Esse username ja esta em uso.");
          setSuggestions(availability.suggestions ?? []);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setStatus("error");
          setMessage(
            error instanceof Error ? error.message : "Nao foi possivel validar."
          );
        });
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [normalizedValue, unchanged, value]);

  function applySuggestion(suggestion: string) {
    setValue(suggestion);
    setSuggestions([]);
    setMessage("");
    setStatus("idle");
  }

  async function saveUsername() {
    setStatus("saving");
    setMessage("");

    const response = await fetch("/api/username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: normalizedValue }),
    });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const details = body?.error?.details;
      setStatus("error");
      setMessage(
        details?.message ?? readApiMessage(body) ?? "Nao foi possivel salvar."
      );
      setSuggestions(Array.isArray(details?.suggestions) ? details.suggestions : []);
      return;
    }

    const username = body?.user?.username ?? normalizedValue;
    setValue(username);
    setStatus("saved");
    setMessage("Username atualizado.");
    setSuggestions([]);
    onChanged?.(username);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2">
          <Globe className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
          <span className="font-mono text-xs text-neutral-400">foliotr.ee/</span>
          <input
            id="profile-username"
            name="username"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setStatus("idle");
              setMessage("");
            }}
            className="min-w-0 flex-1 bg-transparent font-mono text-sm font-semibold text-neutral-800 outline-none"
            aria-label="Username"
            autoComplete="off"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="primary"
          loading={status === "saving"}
          disabled={unchanged || status === "checking" || status === "error"}
          onClick={() => void saveUsername()}
          className="shrink-0"
        >
          {status === "saved" ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Salvar
        </Button>
      </div>

      {message ? (
        <p
          className={
            status === "error"
              ? "text-xs font-medium text-coral-700"
              : "text-xs font-medium text-lime-800"
          }
        >
          {message}
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => applySuggestion(suggestion)}
              className="rounded-full border border-lime-300 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-lime-950 transition hover:bg-lime-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
