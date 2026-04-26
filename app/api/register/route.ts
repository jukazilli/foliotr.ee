import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { registerSchema, usernameSchema } from "@/lib/validations";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  jsonValidationError,
} from "@/lib/server/api";
import {
  AUTH_MUTATION_RATE_LIMIT,
  checkRateLimit,
  getRateLimitKey,
} from "@/lib/security/rate-limit";
import { normalizeUsernameInput } from "@/lib/usernames";
import {
  getUsernameAvailability,
  usernameConflictDetails,
} from "@/lib/server/domain/usernames";

function readEmailInput(value: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

async function getEmailAvailability(email: string) {
  if (!email) {
    return null;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  return {
    available: !existingUser,
    email,
    message: existingUser ? "Esse email ja esta em uso." : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const rawUsername = searchParams.get("username");
    const email = readEmailInput(searchParams.get("email"));
    const result: {
      username?: Awaited<ReturnType<typeof getUsernameAvailability>>;
      email?: Awaited<ReturnType<typeof getEmailAvailability>>;
    } = {};

    if (rawUsername !== null) {
      const username = normalizeUsernameInput(rawUsername);
      const parsedUsername = usernameSchema.safeParse(username);

      if (!parsedUsername.success) {
        throw new ZodError(parsedUsername.error.issues);
      }

      result.username = await getUsernameAvailability(parsedUsername.data);
    }

    if (email) {
      result.email = await getEmailAvailability(email);
    }

    return jsonOk(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("GET /api/register", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase();
    const username = data.username ? normalizeUsernameInput(data.username) : null;

    const rateLimit = checkRateLimit(
      getRateLimitKey(request, "auth:register", email),
      AUTH_MUTATION_RATE_LIMIT
    );

    if (!rateLimit.allowed) {
      return jsonError("RATE_LIMITED", 429);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return jsonError("CONFLICT", 409, {
        field: "email",
        message: "Esse email ja esta em uso.",
        email,
      });
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (existingUsername) {
        return jsonError("CONFLICT", 409, {
          field: "username",
          ...(await usernameConflictDetails(username)),
        });
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: data.name,
          username,
          passwordHash,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          displayName: data.name,
          headline: data.profession || null,
          location: [data.city, data.state, data.country].filter(Boolean).join(", ") || null,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          bio: data.education ? `Escolaridade: ${data.education}` : null,
          onboardingDone: true,
        },
      });

      await tx.version.create({
        data: {
          profileId: profile.id,
          name: "Principal",
          isDefault: true,
        },
      });
    });

    return jsonOk({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/register", error);
  }
}
