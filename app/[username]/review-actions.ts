"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
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

function withReviewerCompany(formData: FormData) {
  const nextFormData = new FormData();
  formData.forEach((value, key) => {
    nextFormData.append(key, value);
  });

  const role = String(formData.get("reviewerRole") ?? "").trim();
  const company = String(formData.get("reviewerCompany") ?? "").trim();
  const roleWithCompany = [role, company].filter(Boolean).join(" - ");

  if (roleWithCompany) {
    nextFormData.set("reviewerRole", roleWithCompany.slice(0, 140));
  }

  return nextFormData;
}

export async function submitPublicReviewAction(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const returnPath = safeReturnPath(formData.get("returnPath"));
  const [requestHeaders, session] = await Promise.all([headers(), auth()]);

  const result = await createPublicReview(withReviewerCompany(formData), {
    clientIp: getClientIpFromHeaders(requestHeaders),
    viewer: session?.user
      ? {
          id: session.user.id,
          email: session.user.email ?? null,
          username: session.user.username ?? null,
        }
      : null,
  });

  if (username) {
    revalidatePath(`/${username}`);
  }

  const status = result.ok ? "review-sent" : "review-error";
  redirect(`${returnPath}?status=${status}`);
}
