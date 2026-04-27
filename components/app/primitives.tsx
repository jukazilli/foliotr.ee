import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm font-medium leading-7 text-muted sm:text-[15px]">
          {description}
        </p>
        {meta ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
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
  blue: "bg-white",
  lime: "bg-cream",
  violet: "bg-white",
  cyan: "bg-cream",
  neutral: "bg-white",
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
            <Badge variant="default" className="mb-4">
              {label}
            </Badge>
          ) : null}
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
            {title}
          </h2>
          <p className="mt-3 text-sm font-medium leading-7 text-muted">{description}</p>
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
  blue: "bg-white",
  violet: "bg-white",
  cyan: "bg-cream",
  lime: "bg-cream",
};

export function StatCard({ label, value, hint, tone = "neutral" }: StatCardProps) {
  return (
    <Card className={cn("rounded-2xl border-white/70", statToneStyles[tone])}>
      <CardContent className="px-5 py-5">
        <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        <p className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-ink">
          {value}
        </p>
        <p className="mt-2 text-sm font-medium leading-6 text-muted">{hint}</p>
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
  blue: "bg-white",
  violet: "bg-white",
  cyan: "bg-cream",
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
          "h-full transition-all hover:-translate-y-0.5",
          flowToneStyles[tone]
        )}
      >
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {step}
            </span>
            <Badge variant="default" className="bg-white/80 text-neutral-700">
              {status}
            </Badge>
          </div>
          <div>
            <CardTitle className="font-display text-xl font-bold tracking-[-0.02em]">
              {title}
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-7 text-muted">
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
