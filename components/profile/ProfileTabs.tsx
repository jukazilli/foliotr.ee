"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type ProfileTab = {
  value: string;
  label: string;
  count?: number;
  children: ReactNode;
};

type ProfileTabsProps = {
  tabs: ProfileTab[];
  defaultValue?: string;
};

export function ProfileTabs({ tabs, defaultValue }: ProfileTabsProps) {
  const initialValue = defaultValue ?? tabs[0]?.value ?? "";
  const [activeTab, setActiveTab] = useState(initialValue);
  const activePanelId = useMemo(() => `profile-tabpanel-${activeTab}`, [activeTab]);
  const activeTabLabel = tabs.find((tab) => tab.value === activeTab)?.label ?? "Secao";

  useEffect(() => {
    if (tabs.length === 0) return;

    const nextValue = defaultValue ?? tabs[0]?.value ?? "";

    if (!tabs.some((tab) => tab.value === nextValue)) return;
    setActiveTab(nextValue);
  }, [defaultValue, tabs]);

  if (tabs.length === 0) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="rounded-[22px] border-2 border-line bg-white p-3 shadow-app lg:sticky lg:top-24 lg:self-start">
        <p className="px-3 pb-3 pt-1 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-muted">
          Dados do perfil
        </p>
        <div role="tablist" aria-label="Secoes do perfil" className="grid gap-1">
          {tabs.map((tab) => {
            const selected = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                id={`profile-tab-${tab.value}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`profile-tabpanel-${tab.value}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.value)}
                className={[
                  "flex min-h-12 w-full items-center justify-between gap-3 rounded-[16px] px-3 py-2 text-left text-sm font-bold transition",
                  selected
                    ? "bg-pink text-ink"
                    : "text-muted hover:bg-cream hover:text-ink",
                ].join(" ")}
              >
                <span className="truncate">{tab.label}</span>
                {typeof tab.count === "number" ? (
                  <Badge variant={selected ? "version" : "info"}>{tab.count}</Badge>
                ) : null}
              </button>
            );
          })}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-4 rounded-[18px] border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-neutral-500">
            Editando
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-neutral-950">
            {activeTabLabel}
          </h2>
        </div>

        {tabs.map((tab) => (
          <div
            key={tab.value}
            id={`profile-tabpanel-${tab.value}`}
            role="tabpanel"
            aria-labelledby={`profile-tab-${tab.value}`}
            hidden={activeTab !== tab.value}
            tabIndex={0}
            className="outline-none"
          >
            {activePanelId === `profile-tabpanel-${tab.value}` ? tab.children : null}
          </div>
        ))}
      </section>
    </div>
  );
}
