export function normalizeStoragePublicUrl(url: string) {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const key = parsed.searchParams.get("key");

    if (parsed.pathname === "/api/assets/proxy" && key) {
      return `/api/assets/proxy?key=${encodeURIComponent(decodeURIComponent(key))}`;
    }

    if (parsed.hostname === "api" && parsed.pathname === "/assets/proxy" && key) {
      return `/api/assets/proxy?key=${encodeURIComponent(decodeURIComponent(key))}`;
    }

    if (parsed.hostname === "proxy" && parsed.pathname === "/" && key) {
      return `/api/assets/proxy?key=${encodeURIComponent(decodeURIComponent(key))}`;
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
