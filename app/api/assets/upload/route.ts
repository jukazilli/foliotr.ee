import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import { getImageAssetPolicy, validateImageAssetCandidate } from "@/lib/storage/policy";
import { uploadImageToS3 } from "@/lib/storage/s3";

export const runtime = "nodejs";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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

    if (policy.provider !== "s3") {
      return jsonError("INTERNAL_ERROR", 503, {
        message: "Storage S3 nao configurado.",
      });
    }

    const profile = await getOwnedProfileBase(prisma, session.user.id);
    const extension = MIME_EXTENSIONS[file.type] ?? "bin";
    const filename = `${randomUUID()}.${extension}`;
    const purpose = String(formData.get("purpose") ?? "asset").replace(/[^a-z0-9_-]/gi, "");
    const storageKey = `uploads/${session.user.id}/${purpose || "asset"}/${filename}`;
    let uploadErrorMessage = "";
    const uploaded = await uploadImageToS3({
      key: storageKey,
      body: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    }).catch((error: unknown) => {
      uploadErrorMessage =
        error instanceof Error ? error.message : "Falha ao enviar imagem ao storage.";
      return null;
    });

    if (!uploaded) {
      return jsonError("INTERNAL_ERROR", 500, {
        message: `Falha ao enviar imagem ao storage S3: ${uploadErrorMessage}`,
      });
    }

    const asset = await prisma.asset.create({
      data: {
        profileId: profile.id,
        kind: "IMAGE",
        status: "READY",
        url: uploaded.url,
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
        data: { avatarUrl: uploaded.url },
      });
    }

    return jsonOk({ asset, profile: shouldSetAvatar ? { avatarUrl: uploaded.url } : undefined }, { status: 201 });
  } catch (error) {
    return handleRouteError("POST /api/assets/upload", error);
  }
}
