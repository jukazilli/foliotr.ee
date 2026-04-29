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
  const tabValues = useMemo(() => tabs.map((tab) => tab.value).join("|"), [tabs]);

  useEffect(() => {
    if (tabs.length === 0) return;

    const nextValue =
      defaultValue && tabs.some((tab) => tab.value === defaultValue)
        ? defaultValue
        : tabs.some((tab) => tab.value === activeTab)
          ? activeTab
          : tabs[0]?.value ?? "";

    if (nextValue && nextValue !== activeTab) {
      setActiveTab(nextValue);
    }
  }, [activeTab, defaultValue, tabs, tabValues]);

  if (tabs.length === 0) return null;

  return (
    <div className="grid gap-5 lg:h-[calc(100dvh-13rem)] lg:min-h-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="rounded-[22px] border-2 border-line bg-white p-3 shadow-app lg:sticky lg:top-24 lg:max-h-full lg:self-start lg:overflow-y-auto">
        <p className="px-3 pb-3 pt-1 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-muted">
          Dados do perfil
        </p>
        <div role="tablist" aria-label="Seções do perfil" className="grid gap-1">
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

      <section className="min-w-0 lg:flex lg:min-h-0 lg:flex-col">
        {tabs.map((tab) => (
          <div
            key={tab.value}
            id={`profile-tabpanel-${tab.value}`}
            role="tabpanel"
            aria-labelledby={`profile-tab-${tab.value}`}
            hidden={activeTab !== tab.value}
            tabIndex={0}
            className="outline-none lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2"
          >
            {activePanelId === `profile-tabpanel-${tab.value}` ? tab.children : null}
          </div>
        ))}
      </section>
    </div>
  );
}
