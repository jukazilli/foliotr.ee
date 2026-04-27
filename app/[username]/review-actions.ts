"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createPublicReview } from "@/lib/server/domain/reviews";

function getClientIpFromHeaders(requestHeaders: Pick<Headers, "get">) {
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return forwardedIp || requestHeaders.get("x-real-ip") || "unknown";
}

function safeReturnPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function submitPublicReviewAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const returnPath = safeReturnPath(formData.get("returnPath"));
  const requestHeaders = await headers();

  const result = await createPublicReview(formData, {
    clientIp: getClientIpFromHeaders(requestHeaders),
  });

  if (username) {
    revalidatePath(`/${username}`);
  }

  const status = result.ok ? "review-sent" : "review-error";
  redirect(`${returnPath}?status=${status}`);
}
