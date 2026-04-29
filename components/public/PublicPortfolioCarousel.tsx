"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, Globe2 } from "lucide-react";

export type PublicPortfolioCarouselItem = {
  id: string;
  href: string;
  resumeHref: string | null;
  title: string;
  description: string | null;
  coverUrl?: string | null;
  isDefault: boolean;
};

type PublicPortfolioCarouselProps = {
  items: PublicPortfolioCarouselItem[];
};

function getCardStyle(offset: number, reducedMotion: boolean) {
  const absOffset = Math.abs(offset);

  return {
    scale: offset === 0 ? 1 : 0.86,
    opacity: absOffset > 1 ? 0 : offset === 0 ? 1 : 0.72,
    x: reducedMotion ? 0 : offset * 228,
    y: reducedMotion ? 0 : Math.abs(offset) * 18,
    rotate: reducedMotion ? 0 : offset * -2,
    zIndex: 10 - absOffset,
    pointerEvents: absOffset > 1 ? "none" : "auto",
  } as const;
}

export function PublicPortfolioCarousel({ items }: PublicPortfolioCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;
  const activeItem = items[activeIndex] ?? null;
  const visibleItems = useMemo(
    () =>
      items
        .map((item, index) => ({ item, index, offset: index - activeIndex }))
        .filter(({ offset }) => Math.abs(offset) <= 1),
    [activeIndex, items]
  );

  if (items.length === 0) {
    return (
      <p className="text-sm font-semibold text-neutral-500">
        Nenhum portfólio publicado ainda.
      </p>
    );
  }

  function goToPrevious() {
    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1));
  }

  function goToNext() {
    setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="space-y-3">
      <div className="relative h-[310px] overflow-hidden rounded-xl bg-neutral-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.35),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(132,204,22,0.22),transparent_28%),linear-gradient(135deg,#111827,#0a0a0a)]" />
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-neutral-950">
            {items.length} ativo{items.length === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goToPrevious}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-950 transition hover:bg-white"
              aria-label="Portfólio anterior"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-neutral-950 transition hover:bg-white"
              aria-label="Próximo portfólio"
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          role="region"
          aria-label="Portfólios publicados"
          aria-roledescription="carousel"
        >
          {visibleItems.map(({ item, index, offset }) => {
            const style = getCardStyle(offset, reducedMotion);

            return (
              <motion.article
                key={item.id}
                className="absolute h-[230px] w-[260px] overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} de ${items.length}: ${item.title}`}
                animate={{
                  x: style.x,
                  y: style.y,
                  scale: style.scale,
                  opacity: style.opacity,
                  rotate: style.rotate,
                }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 260, damping: 30 }
                }
                style={{
                  zIndex: style.zIndex,
                  pointerEvents: style.pointerEvents,
                }}
                onClick={() => setActiveIndex(index)}
              >
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#fbcfe8,#fef9c3_45%,#d9f99d)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/10" />
                <Link
                  href={item.href}
                  className="absolute inset-0 z-10 flex flex-col justify-end p-4 text-white"
                >
                  <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
                    <Globe2 className="h-3 w-3" aria-hidden />
                    Portfolio web
                  </span>
                  <span className="line-clamp-2 text-xl font-extrabold leading-tight">
                    {item.title}
                  </span>
                  {item.description ? (
                    <span className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-white/75">
                      {item.description}
                    </span>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold">
                    Abrir
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </span>
                </Link>
              </motion.article>
            );
          })}
        </div>

        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-1.5 rounded-full transition ${
                index === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/45"
              }`}
              aria-label={`Ver ${item.title}`}
            />
          ))}
        </div>
      </div>

      {activeItem?.resumeHref ? (
        <Link
          href={activeItem.resumeHref}
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-extrabold text-neutral-800 transition hover:border-neutral-950 hover:bg-white"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden />
          Currículo rápido
        </Link>
      ) : null}
    </div>
  );
}
