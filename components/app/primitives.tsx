import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: PageIntroProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950 sm:text-[2.5rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600 sm:text-[15px]">
          {description}
        </p>
        {meta ? <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

interface EmptyWorkspaceStateProps {
  title: string;
  description: string;
  primaryAction?: {
    href: string;
    label: string;
  };
  secondaryAction?: {
    href: string;
    label: string;
  };
  accent?: "blue" | "lime" | "violet" | "cyan" | "neutral";
  label?: string;
}

const accentStyles = {
  blue: "border-blue-100 bg-blue-50/70",
  lime: "border-lime-100 bg-lime-50/80",
  violet: "border-violet-100 bg-violet-50/75",
  cyan: "border-cyan-100 bg-cyan-50/80",
  neutral: "border-neutral-200 bg-white",
};

export function EmptyWorkspaceState({
  title,
  description,
  primaryAction,
  secondaryAction,
  accent = "neutral",
  label,
}: EmptyWorkspaceStateProps) {
  return (
    <Card className={cn("border-dashed", accentStyles[accent])}>
      <CardContent className="flex flex-col gap-5 px-6 py-8 sm:px-8">
        <div className="max-w-xl">
          {label ? (
            <Badge variant="default" className="mb-4 bg-white/75 text-neutral-700">
              {label}
            </Badge>
          ) : null}
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-neutral-600">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {primaryAction ? (
            <Button asChild variant="primary">
              <Link href={primaryAction.href}>
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button asChild variant="outline">
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  hint: string;
  tone?: "neutral" | "blue" | "violet" | "cyan" | "lime";
}

const statToneStyles = {
  neutral: "bg-white",
  blue: "bg-blue-50/85",
  violet: "bg-violet-50/85",
  cyan: "bg-cyan-50/85",
  lime: "bg-lime-50/90",
};

export function StatCard({ label, value, hint, tone = "neutral" }: StatCardProps) {
  return (
    <Card className={cn("rounded-2xl border-white/70", statToneStyles[tone])}>
      <CardContent className="px-5 py-5">
        <p className="font-data text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
          {label}
        </p>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950">
          {value}
        </p>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{hint}</p>
      </CardContent>
    </Card>
  );
}

interface FlowStepCardProps {
  step: string;
  title: string;
  description: string;
  href: string;
  status: string;
  tone?: "neutral" | "blue" | "violet" | "cyan";
}

const flowToneStyles = {
  neutral: "bg-white",
  blue: "bg-blue-50/75",
  violet: "bg-violet-50/80",
  cyan: "bg-cyan-50/80",
};

export function FlowStepCard({
  step,
  title,
  description,
  href,
  status,
  tone = "neutral",
}: FlowStepCardProps) {
  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "h-full rounded-2xl border-white/75 transition-all hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md",
          flowToneStyles[tone]
        )}
      >
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-data text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              {step}
            </span>
            <Badge variant="default" className="bg-white/80 text-neutral-700">
              {status}
            </Badge>
          </div>
          <div>
            <CardTitle className="font-display text-2xl font-semibold tracking-tight">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-7 text-neutral-600">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 transition-transform group-hover:translate-x-0.5">
            Abrir
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
