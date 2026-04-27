"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPublicReview } from "@/lib/server/domain/reviews";

function safeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function submitPublicReviewAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const returnPath = safeReturnPath(formData.get("returnPath"));

  const result = await createPublicReview(formData);

  if (username) {
    revalidatePath(`/${username}`);
  }

  const status = result.ok ? "review-sent" : "review-error";
  redirect(`${returnPath}?status=${status}`);
}
