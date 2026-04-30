import { Star } from "lucide-react";
import type { PublicReviewSummary } from "@/lib/server/domain/reviews";

interface PublicReviewsSectionProps {
  summary: PublicReviewSummary;
}

function Stars({ value }: { value: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} de 5 estrelas`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < value ? "fill-yellow-400 text-yellow-500" : "text-neutral-300"
          }`}
        />
      ))}
    </span>
  );
}

export default function PublicReviewsSection({ summary }: PublicReviewsSectionProps) {
  return (
    <section className="rounded-xl border border-[#dddfe2] bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.16)] print:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#65676b]">
            Reviews
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-[#050505]">
            Avaliações publicadas
          </h2>
        </div>
        <span className="rounded-full bg-[#f0f2f5] px-3 py-1 text-xs font-bold text-[#65676b]">
          {summary.count} publicada{summary.count === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {summary.reviews.slice(0, 8).map((review) => (
          <article key={review.id} className="rounded-xl border border-[#dddfe2] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-[#050505]">{review.reviewerName}</p>
                {review.reviewerRole ? (
                  <p className="text-sm text-[#65676b]">{review.reviewerRole}</p>
                ) : null}
              </div>
              <Stars value={review.rating} />
            </div>
            {review.description ? (
              <p className="mt-3 text-[15px] leading-6 text-[#050505]">
                {review.description}
              </p>
            ) : null}
          </article>
        ))}
        {summary.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#ccd0d5] bg-[#f0f2f5] p-5 text-sm font-semibold text-[#65676b]">
            Nenhuma avaliação publicada ainda.
          </div>
        ) : null}
      </div>
    </section>
  );
}
