"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";

export type PublicPortfolioCarouselItem = {
  id: string;
  href: string;
  resumeHref: string | null;
  title: string;
  description: string | null;
  coverUrl?: string | null;
  role?: string | null;
  company?: string | null;
  isDefault: boolean;
};

type PublicPortfolioCarouselProps = {
  items: PublicPortfolioCarouselItem[];
};

export function PublicPortfolioCarousel({ items }: PublicPortfolioCarouselProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm font-semibold text-[#65676b]">
        Nenhum portfólio publicado ainda.
      </p>
    );
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2"
      role="region"
      aria-label="Meus portfólios"
    >
      {items.map((item) => (
        <article
          key={item.id}
          className="w-[176px] shrink-0 overflow-hidden rounded-lg border border-[#dddfe2] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:w-[188px]"
        >
          <Link href={item.href} className="block">
            <div className="relative h-[150px] bg-[#f0f2f5] sm:h-[160px]">
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#e4e6eb] text-[#65676b]">
                  <BriefcaseBusiness className="h-8 w-8" aria-hidden />
                </div>
              )}
            </div>
          </Link>

          <div className="grid min-h-[112px] content-between gap-2 p-2.5">
            <div className="min-w-0">
              <Link
                href={item.href}
                className="line-clamp-2 text-[15px] font-bold leading-5 text-[#050505] hover:underline"
              >
                {item.role || item.title}
              </Link>
              {item.company ? (
                <p className="mt-0.5 line-clamp-1 text-[13px] leading-5 text-[#65676b]">
                  {item.company}
                </p>
              ) : item.description ? (
                <p className="mt-0.5 line-clamp-1 text-[13px] leading-5 text-[#65676b]">
                  {item.description}
                </p>
              ) : null}
            </div>

            <Link
              href={item.href}
              className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md bg-[#e7f3ff] px-2.5 text-[13px] font-bold text-[#0866ff] transition hover:bg-[#dbeafe]"
            >
              Ver detalhes
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
