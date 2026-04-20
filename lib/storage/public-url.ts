export function normalizeStoragePublicUrl(url: string) {
  if (!url) return url;

  try {
    const parsed = new URL(url);

    if (parsed.pathname === "/api/assets/proxy" && parsed.searchParams.get("key")) {
      return url;
    }

    if (parsed.pathname.startsWith("/storage/v1/object/public/")) {
      const [, , , , , bucket, ...keyParts] = parsed.pathname.split("/");
      const key = keyParts.join("/");

      if (bucket && key) {
        return `/api/assets/proxy?key=${encodeURIComponent(decodeURIComponent(key))}`;
      }
    }
  } catch {
    if (url.startsWith("/api/assets/proxy?")) {
      return url;
    }

    return url;
  }

  return url;
}
