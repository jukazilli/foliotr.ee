"use client";

import { useMemo, useState, type ReactNode } from "react";
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

  if (tabs.length === 0) return null;

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Secoes do perfil"
        className="flex gap-1 overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-1"
      >
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
                "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                selected
                  ? "bg-green-500 text-green-900 shadow-sm shadow-green-900/10"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950",
              ].join(" ")}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? (
                <Badge
                  variant={selected ? "success" : "info"}
                  className={selected ? "bg-green-100 text-green-900" : undefined}
                >
                  {tab.count}
                </Badge>
              ) : null}
            </button>
          );
        })}
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
    </div>
  );
}
