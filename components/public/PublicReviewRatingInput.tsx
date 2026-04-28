"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface PublicReviewRatingInputProps {
  defaultValue?: number;
  compact?: boolean;
}

function clampRating(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function PublicReviewRatingInput({
  defaultValue = 5,
  compact = false,
}: PublicReviewRatingInputProps) {
  const [rating, setRating] = useState(() => clampRating(defaultValue));

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium text-neutral-700">Nota</legend>
      <input type="hidden" name="rating" value={rating} />
      <div
        className={`inline-flex w-fit items-center gap-1 rounded-full border bg-white ${
          compact ? "border-[#03045E] px-3 py-2" : "border-neutral-300 px-3 py-2"
        }`}
        role="radiogroup"
        aria-label="Nota da review"
      >
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          const selected = value <= rating;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} estrela${value === 1 ? "" : "s"}`}
              className="rounded-full p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onClick={() => setRating(value)}
            >
              <Star
                className={`h-6 w-6 ${
                  selected ? "fill-yellow-400 text-yellow-500" : "text-neutral-300"
                }`}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
