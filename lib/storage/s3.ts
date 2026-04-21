import { Agent } from "node:https";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { getEnv } from "@/lib/env";
import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

export interface UploadImageToS3Input {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl?: string;
}

export interface UploadedS3Object {
  provider: "s3";
  bucket: string;
  key: string;
  url: string;
}

let cachedClient: S3Client | null = null;

function requireS3Config() {
  const env = getEnv();
  const missing = [
    ["STORAGE_S3_ENDPOINT", env.STORAGE_S3_ENDPOINT],
    ["STORAGE_S3_REGION", env.STORAGE_S3_REGION],
    ["STORAGE_S3_BUCKET", env.STORAGE_S3_BUCKET],
    ["STORAGE_S3_ACCESS_KEY_ID", env.STORAGE_S3_ACCESS_KEY_ID],
    ["STORAGE_S3_SECRET_ACCESS_KEY", env.STORAGE_S3_SECRET_ACCESS_KEY],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing S3 storage configuration: ${missing.join(", ")}`);
  }

  return {
    endpoint: env.STORAGE_S3_ENDPOINT!,
    region: env.STORAGE_S3_REGION!,
    bucket: env.STORAGE_S3_BUCKET!,
    accessKeyId: env.STORAGE_S3_ACCESS_KEY_ID!,
    secretAccessKey: env.STORAGE_S3_SECRET_ACCESS_KEY!,
    tlsRejectUnauthorized: env.STORAGE_S3_TLS_REJECT_UNAUTHORIZED,
    publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL || undefined,
  };
}

function getS3Client() {
  if (cachedClient) return cachedClient;

  const config = requireS3Config();
  const requestHandler = new NodeHttpHandler({
    connectionTimeout: 5000,
    requestTimeout: 20000,
    httpsAgent: config.tlsRejectUnauthorized
      ? undefined
      : new Agent({
          rejectUnauthorized: false,
        }),
  });

  cachedClient = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    requestHandler,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}

function toPublicBaseUrl(endpoint: string, bucket: string) {
  const url = new URL(endpoint);
  url.hostname = url.hostname.replace(".storage.supabase.co", ".supabase.co");
  url.pathname = url.pathname.replace(
    /\/storage\/v1\/s3\/?$/,
    "/storage/v1/object/public"
  );
  return `${url.toString().replace(/\/$/, "")}/${bucket}`;
}

function buildPublicUrl(config: ReturnType<typeof requireS3Config>, key: string) {
  const baseUrl =
    config.publicBaseUrl?.replace(/\/$/, "") ??
    toPublicBaseUrl(config.endpoint, config.bucket);
  return normalizeStoragePublicUrl(
    `${baseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`
  );
}

export async function uploadImageToS3(
  input: UploadImageToS3Input
): Promise<UploadedS3Object> {
  const config = requireS3Config();
  const client = getS3Client();

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
    })
  );

  return {
    provider: "s3",
    bucket: config.bucket,
    key: input.key,
    url: buildPublicUrl(config, input.key),
  };
}

export async function getImageFromS3(key: string) {
  const config = requireS3Config();
  const client = getS3Client();

  return client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  );
}
