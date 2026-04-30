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
      className="flex gap-3 overflow-x-auto pb-3"
      role="region"
      aria-label="Meus portfólios"
    >
      {items.map((item) => (
        <article
          key={item.id}
          className="w-[222px] shrink-0 overflow-hidden rounded-xl border border-[#dddfe2] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)]"
        >
          <Link href={item.href} className="block">
            <div className="relative h-[222px] bg-[#f0f2f5]">
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#e4e6eb] text-[#65676b]">
                  <BriefcaseBusiness className="h-10 w-10" aria-hidden />
                </div>
              )}
            </div>
          </Link>

          <div className="grid min-h-[160px] content-between gap-3 p-3">
            <div className="min-w-0">
              <Link
                href={item.href}
                className="line-clamp-2 text-[17px] font-bold leading-5 text-[#050505] hover:underline"
              >
                {item.role || item.title}
              </Link>
              {item.company ? (
                <p className="mt-1 line-clamp-1 text-[15px] leading-5 text-[#65676b]">
                  {item.company}
                </p>
              ) : item.description ? (
                <p className="mt-1 line-clamp-1 text-[15px] leading-5 text-[#65676b]">
                  {item.description}
                </p>
              ) : null}
            </div>

            <Link
              href={item.href}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-[#e7f3ff] px-3 text-[15px] font-bold text-[#0866ff] transition hover:bg-[#dbeafe]"
            >
              Ver detalhes
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
