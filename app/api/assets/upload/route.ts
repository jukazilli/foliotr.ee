import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import { uploadImageToLocal } from "@/lib/storage/local";
import { getImageAssetPolicy, validateImageAssetCandidate } from "@/lib/storage/policy";
import { uploadImageToS3 } from "@/lib/storage/s3";

export const runtime = "nodejs";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function toStoredAssetUrl(
  uploaded: { provider: string; url: string },
  storageKey: string
) {
  if (uploaded.provider === "s3") {
    return `/api/assets/proxy?key=${encodeURIComponent(storageKey)}`;
  }

  return uploaded.url;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("BAD_REQUEST", 400, { message: "Arquivo obrigatorio" });
    }

    const policy = getImageAssetPolicy();
    const validation = validateImageAssetCandidate(
      { mimeType: file.type, size: file.size },
      policy
    );

    if (!validation.valid) {
      return jsonError("BAD_REQUEST", 400, { reason: validation.reason });
    }

    if (policy.provider !== "s3" && policy.provider !== "local") {
      return jsonError("INTERNAL_ERROR", 503, {
        message: "Storage de imagens nao configurado.",
      });
    }

    const profile = await getOwnedProfileBase(prisma, session.user.id);
    const extension = MIME_EXTENSIONS[file.type] ?? "bin";
    const filename = `${randomUUID()}.${extension}`;
    const purpose = String(formData.get("purpose") ?? "asset").replace(
      /[^a-z0-9_-]/gi,
      ""
    );
    const storageKey = `uploads/${session.user.id}/${purpose || "asset"}/${filename}`;
    let uploadErrorMessage = "";
    const body = Buffer.from(await file.arrayBuffer());
    const uploaded = await (
      policy.provider === "local"
        ? uploadImageToLocal({
            key: storageKey,
            body,
          })
        : uploadImageToS3({
            key: storageKey,
            body,
            contentType: file.type,
          })
    ).catch((error: unknown) => {
      uploadErrorMessage =
        error instanceof Error ? error.message : "Falha ao enviar imagem ao storage.";
      return null;
    });

    if (!uploaded) {
      return jsonError("INTERNAL_ERROR", 500, {
        message: `Falha ao enviar imagem ao storage ${policy.provider}: ${uploadErrorMessage}`,
      });
    }

    const assetUrl = toStoredAssetUrl(uploaded, storageKey);
    const asset = await prisma.asset.create({
      data: {
        profileId: profile.id,
        kind: "IMAGE",
        status: "READY",
        url: assetUrl,
        storageKey,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        metadata: {
          provider: uploaded.provider,
          bucket: uploaded.bucket,
        },
      },
    });

    const shouldSetAvatar = formData.get("purpose") === "avatar";

    if (shouldSetAvatar) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { avatarUrl: assetUrl },
      });
    }

    return jsonOk(
      { asset, profile: shouldSetAvatar ? { avatarUrl: assetUrl } : undefined },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError("POST /api/assets/upload", error);
  }
}
