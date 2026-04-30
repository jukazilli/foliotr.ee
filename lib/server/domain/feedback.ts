import { z } from "zod";
import type { FeedbackKind, PrismaClient, UserRole } from "@/generated/prisma-client";
import { sendFeedbackTicketEmail } from "@/lib/server/feedback-email";

type DbClient = PrismaClient;

export const feedbackTicketInputSchema = z.object({
  kind: z.enum(["IMPROVEMENT", "CORRECTION"]),
  message: z.string().trim().min(6).max(1200),
  route: z.string().trim().min(1).max(240),
  url: z.string().trim().min(1).max(600),
  x: z.number().int().min(0).max(100000),
  y: z.number().int().min(0).max(100000),
  relativeX: z.number().min(0).max(1),
  relativeY: z.number().min(0).max(1),
  viewportWidth: z.number().int().min(1).max(100000),
  viewportHeight: z.number().int().min(1).max(100000),
  elementTag: z.string().trim().max(40).optional().nullable(),
  elementId: z.string().trim().max(120).optional().nullable(),
  elementClasses: z.string().trim().max(240).optional().nullable(),
  elementText: z.string().trim().max(240).optional().nullable(),
});

export type FeedbackTicketInput = z.infer<typeof feedbackTicketInputSchema>;

export function canUseDeveloperFeedbackMode(role: UserRole | string | null | undefined) {
  return role === "DEVELOPER";
}

export async function createFeedbackTicket(
  db: DbClient,
  reporterUserId: string,
  input: FeedbackTicketInput
) {
  const ticket = await db.$transaction(async (tx) => {
    const aggregate = await tx.feedbackTicket.aggregate({
      _max: {
        number: true,
      },
    });
    const nextNumber = (aggregate._max.number ?? 0) + 1;

    return tx.feedbackTicket.create({
      data: {
        number: nextNumber,
        kind: input.kind as FeedbackKind,
        message: input.message,
        route: input.route,
        url: input.url,
        x: input.x,
        y: input.y,
        relativeX: input.relativeX,
        relativeY: input.relativeY,
        viewportWidth: input.viewportWidth,
        viewportHeight: input.viewportHeight,
        elementTag: input.elementTag || null,
        elementId: input.elementId || null,
        elementClasses: input.elementClasses || null,
        elementText: input.elementText || null,
        reporterUserId,
      },
    });
  });

  await sendFeedbackTicketEmail(ticket);
  return ticket;
}

export async function listFeedbackTicketsForRoute(db: DbClient, route?: string | null) {
  return db.feedbackTicket.findMany({
    where: route
      ? {
          route,
        }
      : undefined,
    orderBy: [{ number: "asc" }],
    take: 200,
    select: {
      id: true,
      number: true,
      kind: true,
      message: true,
      route: true,
      url: true,
      x: true,
      y: true,
      relativeX: true,
      relativeY: true,
      viewportWidth: true,
      viewportHeight: true,
      elementTag: true,
      elementId: true,
      elementClasses: true,
      elementText: true,
      status: true,
      createdAt: true,
    },
  });
}
