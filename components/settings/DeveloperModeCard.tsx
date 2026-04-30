"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Bug } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEVELOPER_MODE_STORAGE_KEY = "linkfolio-developer-feedback-mode";

export function DeveloperModeCard() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(window.localStorage.getItem(DEVELOPER_MODE_STORAGE_KEY) === "true");
  }, []);

  function toggle() {
    const next = !active;
    setActive(next);
    window.localStorage.setItem(DEVELOPER_MODE_STORAGE_KEY, next ? "true" : "false");
    window.dispatchEvent(
      new CustomEvent("linkfolio:developer-feedback-mode", {
        detail: { active: next },
      })
    );
  }

  return (
    <Card className="border-red-200 bg-red-50/40">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-700" />
          </div>
          <div>
            <CardTitle>Zona de perigo</CardTitle>
            <CardDescription>
              Ative o modo desenvolvedor para visualizar marcações de feedback.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#050505]">Modo desenvolvedor</p>
            <p className="mt-0.5 text-xs text-[#65676b]">
              Mostra os tickets de feedback marcados na rota atual.
            </p>
          </div>
          <Button type="button" variant={active ? "destructive" : "outline"} onClick={toggle}>
            <Bug className="h-4 w-4" aria-hidden="true" />
            {active ? "Desativar" : "Ativar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
