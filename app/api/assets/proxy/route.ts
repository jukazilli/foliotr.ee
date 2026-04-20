import { handleRouteError, jsonError } from "@/lib/server/api";
import { getImageFromS3 } from "@/lib/storage/s3";

export const runtime = "nodejs";

function isSafeStorageKey(key: string) {
  return (
    key.startsWith("uploads/") &&
    !key.startsWith("/") &&
    !key.includes("..") &&
    !key.includes("\\")
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key") ?? "";

    if (!key || !isSafeStorageKey(key)) {
      return jsonError("BAD_REQUEST", 400, { message: "Imagem invalida" });
    }

    const object = await getImageFromS3(key);
    const body = object.Body;

    if (!body) {
      return jsonError("NOT_FOUND", 404, { message: "Imagem nao encontrada" });
    }

    return new Response(body.transformToWebStream(), {
      status: 200,
      headers: {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    if (error instanceof Error && ["NoSuchKey", "NotFound"].includes(error.name)) {
      return jsonError("NOT_FOUND", 404, { message: "Imagem nao encontrada" });
    }

    return handleRouteError("GET /api/assets/proxy", error);
  }
}
