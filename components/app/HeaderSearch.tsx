"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserRound } from "lucide-react";
import { normalizeUsernameInput } from "@/lib/usernames";

type SearchUser = {
  username: string;
  displayName: string;
  headline: string | null;
  avatarUrl: string | null;
  href: string;
};

function cleanQuery(value: string) {
  return normalizeUsernameInput(value.replace(/^@/, ""));
}

export function HeaderSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const normalizedQuery = useMemo(() => cleanQuery(query), [query]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/search/users?q=${encodeURIComponent(normalizedQuery)}`, {
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : { users: [] }))
        .then((body: { users?: SearchUser[] }) => {
          setUsers(Array.isArray(body.users) ? body.users : []);
          setOpen(true);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setUsers([]);
        })
        .finally(() => setLoading(false));
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalizedQuery]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function goToUser(user: SearchUser) {
    setOpen(false);
    setQuery("");
    router.push(user.href);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (users[0]) {
      goToUser(users[0]);
      return;
    }

    if (normalizedQuery.length >= 2) {
      setOpen(false);
      router.push(`/${normalizedQuery}`);
    }
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <form
        onSubmit={handleSubmit}
        className="flex h-12 min-w-0 items-center gap-3 rounded-full bg-[#f0f2f5] px-4"
        role="search"
      >
        <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
        <input
          id="app-header-search"
          name="appHeaderSearch"
          type="search"
          placeholder="Buscar usuário no LINKFOLIO"
          className="min-w-0 flex-1 bg-transparent text-base font-normal text-ink outline-none placeholder:text-muted"
          aria-label="Buscar usuário no LINKFOLIO"
          autoComplete="off"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </form>

      {open && normalizedQuery.length >= 2 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-[#dddfe2] bg-white shadow-[0_8px_24px_rgb(0_0_0/0.12)]">
          {users.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-2">
              {users.map((user) => (
                <button
                  key={user.username}
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-[#f7f8fa]"
                  onClick={() => goToUser(user)}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0f2f5] text-[#65676b]">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-5 w-5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#050505]">
                      {user.displayName}
                    </span>
                    <span className="block truncate text-xs text-[#65676b]">
                      @{user.username}
                      {user.headline ? ` · ${user.headline}` : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-[#65676b]">
              {loading ? "Buscando usuários..." : "Nenhum usuário encontrado."}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
