import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { METHOD_VERSION, saveSessionSchema } from "@/lib/vocational-test/validation";

function serializeSession(session: {
  id: string;
  methodVersion: string;
  status: string;
  currentQuestionIndex: number;
  profile: unknown;
  answers: unknown;
  result: unknown;
  aiReport: string | null;
  reportProvider: string | null;
  reportModel: string | null;
  reportGeneratedAt: Date | null;
  publicInPortfolio: boolean;
  publicInResume: boolean;
  completedAt: Date | null;
  updatedAt: Date;
}) {
  return {
    ...session,
    reportGeneratedAt: session.reportGeneratedAt?.toISOString() ?? null,
    publicInPortfolio: session.publicInPortfolio,
    publicInResume: session.publicInResume,
    completedAt: session.completedAt?.toISOString() ?? null,
    updatedAt: session.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const testSession = await prisma.vocationalTestSession.findFirst({
      where: {
        userId: session.user.id,
        methodVersion: METHOD_VERSION,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
    const sessions = await prisma.vocationalTestSession.findMany({
      where: {
        userId: session.user.id,
        methodVersion: METHOD_VERSION,
        status: "completed",
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 10,
    });

    return jsonOk({
      session: testSession ? serializeSession(testSession) : null,
      sessions: sessions.map(serializeSession),
    });
  } catch (error) {
    return handleRouteError("GET /api/vocational-test/session", error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const input = saveSessionSchema.parse(await request.json());
    const existingDraft = await prisma.vocationalTestSession.findFirst({
      where: {
        userId: session.user.id,
        methodVersion: METHOD_VERSION,
        status: "draft",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const saved = existingDraft
      ? await prisma.vocationalTestSession.update({
          where: { id: existingDraft.id },
          data: {
            profile: input.profile,
            answers: input.answers,
            currentQuestionIndex: input.currentQuestionIndex,
          },
        })
      : await prisma.vocationalTestSession.create({
          data: {
            userId: session.user.id,
            methodVersion: METHOD_VERSION,
            status: "draft",
            profile: input.profile,
            answers: input.answers,
            currentQuestionIndex: input.currentQuestionIndex,
          },
        });

    return jsonOk({ session: serializeSession(saved) });
  } catch (error) {
    return handleRouteError("PUT /api/vocational-test/session", error);
  }
}
