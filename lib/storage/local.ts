import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";

export interface UploadImageToLocalInput {
  key: string;
  body: Buffer;
}

export interface UploadedLocalObject {
  provider: "local";
  bucket: "public";
  key: string;
  url: string;
}

function assertSafeLocalUploadKey(key: string) {
  const normalized = normalize(key).replace(/\\/g, "/");

  if (
    normalized !== key ||
    !key.startsWith("uploads/") ||
    key.startsWith("/") ||
    key.includes("..") ||
    key.includes("\\")
  ) {
    throw new Error("Unsafe local upload key.");
  }
}

export async function uploadImageToLocal(
  input: UploadImageToLocalInput
): Promise<UploadedLocalObject> {
  assertSafeLocalUploadKey(input.key);

  const absolutePath = join(process.cwd(), "public", input.key);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, input.body);

  return {
    provider: "local",
    bucket: "public",
    key: input.key,
    url: `/${input.key}`,
  };
}
