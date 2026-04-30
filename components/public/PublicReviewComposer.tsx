"use client";

import { useState } from "react";
import { MessageCircle, Star, X } from "lucide-react";
import { submitPublicReviewAction } from "@/app/[username]/review-actions";
import { PublicReviewRatingInput } from "@/components/public/PublicReviewRatingInput";

interface PublicReviewComposerProps {
  username: string;
  returnPath: string;
  avatarUrl?: string | null;
  displayName: string;
}

export function PublicReviewComposer({
  username,
  returnPath,
  avatarUrl,
  displayName,
}: PublicReviewComposerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="rounded-xl border border-[#dddfe2] bg-white p-4 shadow-[0_1px_2px_rgb(0_0_0/0.16)]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-[#e4e6eb]">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="min-h-10 flex-1 rounded-full bg-[#f0f2f5] px-4 text-left text-[17px] font-medium text-[#65676b] transition hover:bg-[#e4e6eb]"
          >
            Escreva uma review para {displayName}
          </button>
        </div>
      </section>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-white/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-composer-title"
        >
          <form
            action={submitPublicReviewAction}
            className="w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-[0_12px_28px_rgb(0_0_0/0.2),0_2px_4px_rgb(0_0_0/0.1)]"
          >
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="returnPath" value={returnPath} />
            <div className="hidden" aria-hidden="true">
              <label>
                Site
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="relative flex min-h-16 items-center justify-center border-b border-[#dddfe2] px-14">
              <h2
                id="review-composer-title"
                className="text-xl font-bold text-[#050505]"
              >
                Enviar review
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-3 grid h-10 w-10 place-items-center rounded-full bg-[#e4e6eb] text-[#65676b] transition hover:bg-[#d8dadf]"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
            </div>

            <div className="grid max-h-[72vh] gap-4 overflow-y-auto p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-[#e4e6eb]">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#050505]">{displayName}</p>
                  <p className="text-xs font-semibold text-[#65676b]">
                    A review fica oculta até aprovação.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#dddfe2] p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#050505]">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                  Nota
                </div>
                <PublicReviewRatingInput defaultValue={5} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="reviewerName"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="Nome"
                  className="rounded-lg border border-[#ccd0d5] bg-white px-3 py-2 text-sm outline-none focus:border-[#0866ff]"
                />
                <input
                  name="reviewerRole"
                  maxLength={140}
                  placeholder="Cargo"
                  className="rounded-lg border border-[#ccd0d5] bg-white px-3 py-2 text-sm outline-none focus:border-[#0866ff]"
                />
                <input
                  name="reviewerCompany"
                  maxLength={120}
                  placeholder="Empresa"
                  className="rounded-lg border border-[#ccd0d5] bg-white px-3 py-2 text-sm outline-none focus:border-[#0866ff]"
                />
                <input
                  name="reviewerEmail"
                  type="email"
                  placeholder="Email opcional"
                  className="rounded-lg border border-[#ccd0d5] bg-white px-3 py-2 text-sm outline-none focus:border-[#0866ff]"
                />
              </div>

              <textarea
                name="description"
                required
                minLength={10}
                maxLength={500}
                placeholder="Escreva a review"
                className="min-h-32 resize-y rounded-lg border border-[#ccd0d5] bg-white px-3 py-3 text-[18px] outline-none focus:border-[#0866ff]"
              />

              <button
                type="submit"
                className="min-h-11 rounded-lg bg-[#0866ff] px-4 text-[15px] font-bold text-white transition hover:bg-[#075ce5]"
              >
                Enviar para aprovação
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
