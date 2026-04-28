import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const FALLBACK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#FAF9F6"/><path d="M25.1 38.9 21.4 42.6a9.6 9.6 0 0 1-13.6-13.6l8-8a9.6 9.6 0 0 1 13.6 0" stroke="#FF4D00" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/><path d="m38.9 25.1 3.7-3.7a9.6 9.6 0 0 1 13.6 13.6l-8 8a9.6 9.6 0 0 1-13.6 0" stroke="#FF4D00" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/><path d="m23.5 40.5 17-17" stroke="#FF4D00" stroke-linecap="round" stroke-width="8"/></svg>`;

function faviconResponse(icon: BodyInit) {
  return new NextResponse(icon, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}

export async function GET() {
  try {
    const icon = await readFile(path.join(process.cwd(), "public", "favicon.svg"));

    return faviconResponse(icon);
  } catch {
    return faviconResponse(FALLBACK_ICON);
  }
}
