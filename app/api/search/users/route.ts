import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { normalizeUsernameInput } from "@/lib/usernames";

function readSearchQuery(value: string | null) {
  const raw = String(value ?? "").trim().replace(/^@/, "").slice(0, 80);

  return {
    raw,
    username: normalizeUsernameInput(raw).slice(0, 40),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const query = readSearchQuery(request.nextUrl.searchParams.get("q"));

    if (query.raw.length < 2) {
      return jsonOk({ users: [] }, { status: 200 });
    }

    const profiles = await prisma.profile.findMany({
      where: {
        user: {
          username: {
            not: null,
          },
        },
        OR: [
          {
            user: {
              username: {
                startsWith: query.username || query.raw,
                mode: "insensitive",
              },
            },
          },
          {
            displayName: {
              contains: query.raw,
              mode: "insensitive",
            },
          },
          {
            user: {
              name: {
                contains: query.raw,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 8,
      select: {
        displayName: true,
        headline: true,
        avatarUrl: true,
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    });

    return jsonOk(
      {
        users: profiles
          .filter((profile) => profile.user.username)
          .map((profile) => ({
            username: profile.user.username,
            displayName: profile.displayName || profile.user.name || profile.user.username,
            headline: profile.headline,
            avatarUrl: profile.avatarUrl,
            href: `/${profile.user.username}`,
          })),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleRouteError("GET /api/search/users", error);
  }
}
