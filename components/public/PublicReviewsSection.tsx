import { Star } from "lucide-react";
import { submitPublicReviewAction } from "@/app/[username]/review-actions";
import { PublicReviewRatingInput } from "@/components/public/PublicReviewRatingInput";
import type { PublicReviewSummary } from "@/lib/server/domain/reviews";

interface PublicReviewsSectionProps {
  username: string;
  returnPath: string;
  summary: PublicReviewSummary;
  canSubmit?: boolean;
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

export default function PublicReviewsSection({
  username,
  returnPath,
  summary,
  canSubmit = true,
}: PublicReviewsSectionProps) {
  return (
    <section className="rounded-2xl border bg-white p-5 print:hidden">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">
                Reviews
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-neutral-950">
                Avaliações publicadas
              </h2>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
              {summary.count} publicada{summary.count === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid max-h-[420px] gap-3 overflow-y-auto pr-1">
            {summary.reviews.slice(0, 8).map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-950">
                      {review.reviewerName}
                    </p>
                    {review.reviewerRole ? (
                      <p className="text-xs text-neutral-500">{review.reviewerRole}</p>
                    ) : null}
                  </div>
                  <Stars value={review.rating} />
                </div>
                {review.description ? (
                  <p className="mt-3 text-sm leading-6 text-neutral-700">
                    {review.description}
                  </p>
                ) : null}
              </article>
            ))}
            {summary.reviews.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-5 text-sm font-semibold text-neutral-500">
                Nenhuma avaliação publicada ainda.
              </div>
            ) : null}
          </div>
        </div>

        {canSubmit ? (
          <form
            action={submitPublicReviewAction}
            className="grid w-full gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          >
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="returnPath" value={returnPath} />
            <div className="hidden" aria-hidden="true">
              <label>
                Site
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-950">
                Deixe uma avaliação
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Ela fica oculta até o dono do perfil aprovar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="reviewerName"
                required
                minLength={2}
                maxLength={120}
                placeholder="Seu nome"
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
              <input
                name="reviewerRole"
                maxLength={140}
                placeholder="Cargo"
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
              <input
                name="reviewerCompany"
                maxLength={120}
                placeholder="Empresa"
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
              <input
                name="reviewerEmail"
                type="email"
                placeholder="Email opcional"
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>
            <PublicReviewRatingInput defaultValue={5} />
            <textarea
              name="description"
              required
              minLength={10}
              maxLength={500}
              placeholder="Escreva sua avaliação"
              className="min-h-28 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Enviar review
            </button>
          </form>
        ) : (
          <div className="w-full rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm font-semibold text-neutral-600">
            As avaliações do seu perfil aparecem aqui para moderação.
          </div>
        )}
      </div>
    </section>
  );
}
