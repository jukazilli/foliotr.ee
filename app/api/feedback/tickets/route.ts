import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  canUseDeveloperFeedbackMode,
  createFeedbackTicket,
  feedbackTicketInputSchema,
  listFeedbackTicketsForRoute,
} from "@/lib/server/domain/feedback";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  jsonValidationError,
} from "@/lib/server/api";
import { checkRateLimit, getRateLimitKey } from "@/lib/security/rate-limit";

const FEEDBACK_RATE_LIMIT = {
  windowMs: 10 * 60_000,
  max: 20,
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!canUseDeveloperFeedbackMode(user?.role)) {
      return jsonError("FORBIDDEN", 403);
    }

    const route = request.nextUrl.searchParams.get("route");
    const tickets = await listFeedbackTicketsForRoute(prisma, route);

    return jsonOk({ tickets }, { status: 200 });
  } catch (error) {
    return handleRouteError("GET /api/feedback/tickets", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const rateLimit = checkRateLimit(
      getRateLimitKey(request, "feedback:create", session.user.id),
      FEEDBACK_RATE_LIMIT
    );

    if (!rateLimit.allowed) {
      return jsonError("RATE_LIMITED", 429);
    }

    const body = await request.json();
    const input = feedbackTicketInputSchema.parse(body);
    const ticket = await createFeedbackTicket(prisma, session.user.id, input);

    return jsonOk(
      {
        ticket: {
          id: ticket.id,
          number: ticket.number,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonValidationError(error);
    }

    return handleRouteError("POST /api/feedback/tickets", error);
  }
}
