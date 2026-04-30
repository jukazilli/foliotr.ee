import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations";
import {
  getUsernameAvailability,
  isUniqueUsernameError,
  parseUsernameInput,
  usernameConflictDetails,
  usernameExists,
} from "@/lib/server/domain/usernames";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  jsonValidationError,
} from "@/lib/server/api";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const username = parseUsernameInput(
      new URL(request.url).searchParams.get("username")
    );
    return jsonOk(await getUsernameAvailability(username, session.user.id), {
      status: 200,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("GET /api/onboarding", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const userId = session.user.id;
    const body = await request.json();
    const data = onboardingSchema.parse({
      ...body,
      username: parseUsernameInput(body?.username),
    });

    if (await usernameExists(data.username, userId)) {
      return jsonError(
        "CONFLICT",
        409,
        await usernameConflictDetails(data.username, userId)
      );
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { username: data.username },
        });

        await tx.profile.update({
          where: { userId },
          data: {
            displayName: data.displayName,
            headline: data.headline,
            bio: data.bio || null,
            location: data.location || null,
            openToOpportunities: data.openToOpportunities,
            opportunityMotivation: data.opportunityMotivation || null,
            showOpportunityMotivation: Boolean(data.opportunityMotivation),
            onboardingDone: true,
          },
        });

        if (data.currentCompany && data.currentRole) {
          const existingCurrentExperience = await tx.experience.findFirst({
            where: {
              profile: { userId },
              current: true,
            },
            select: { id: true },
          });

          if (existingCurrentExperience) {
            await tx.experience.update({
              where: { id: existingCurrentExperience.id },
              data: {
                company: data.currentCompany,
                role: data.currentRole,
                location: data.location || null,
              },
            });
          } else {
            await tx.experience.create({
              data: {
                profile: { connect: { userId } },
                company: data.currentCompany,
                role: data.currentRole,
                location: data.location || null,
                current: true,
                startDate: new Date(),
              },
            });
          }
        }
      });
    } catch (error) {
      if (isUniqueUsernameError(error)) {
        return jsonError(
          "CONFLICT",
          409,
          await usernameConflictDetails(data.username, userId)
        );
      }

      throw error;
    }

    return jsonOk({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/onboarding", error);
  }
}
