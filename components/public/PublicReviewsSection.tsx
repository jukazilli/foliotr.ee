import { Star } from "lucide-react";
import { submitPublicReviewAction } from "@/app/[username]/review-actions";
import type { PublicReviewSummary } from "@/lib/server/domain/reviews";

interface PublicReviewsSectionProps {
  username: string;
  returnPath: string;
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

export default function PublicReviewsSection({
  username,
  returnPath,
  summary,
}: PublicReviewsSectionProps) {
  return (
    <section className="border-b border-black/10 bg-white px-4 py-8 print:hidden sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Reviews
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-semibold text-neutral-950">
                {summary.averageRating?.toFixed(1) ?? "-"}
              </span>
              <span className="pb-1 text-sm font-medium text-neutral-600">
                {summary.count
                  ? `${summary.count} review${summary.count === 1 ? "" : "s"} publicada${
                      summary.count === 1 ? "" : "s"
                    }`
                  : "Nenhuma review publicada ainda"}
              </span>
            </div>
            {summary.averageRating ? (
              <div className="mt-3">
                <Stars value={Math.round(summary.averageRating)} />
              </div>
            ) : null}
          </div>

          <div className="grid gap-3">
            {summary.reviews.slice(0, 3).map((review) => (
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
          </div>
        </div>

        <form
          action={submitPublicReviewAction}
          className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
        >
          <input type="hidden" name="username" value={username} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <div>
            <p className="text-sm font-semibold text-neutral-950">Deixe uma review</p>
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
              placeholder="Cargo ou contexto"
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>
          <input
            name="reviewerEmail"
            type="email"
            placeholder="Email opcional"
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <label className="grid gap-2 text-sm font-medium text-neutral-700">
            Nota
            <select
              name="rating"
              defaultValue="5"
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            >
              <option value="5">5 estrelas</option>
              <option value="4">4 estrelas</option>
              <option value="3">3 estrelas</option>
              <option value="2">2 estrelas</option>
              <option value="1">1 estrela</option>
            </select>
          </label>
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={500}
            placeholder="Como foi trabalhar com essa pessoa?"
            className="min-h-28 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-md bg-neutral-950 px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Enviar review
          </button>
        </form>
      </div>
    </section>
  );
}
