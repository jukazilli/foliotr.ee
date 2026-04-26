import { NextRequest } from "next/server";
import type { Prisma } from "@/generated/prisma-client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, jsonOk } from "@/lib/server/api";
import { calculateResult } from "@/lib/vocational-test/scoring";
import { generateGeminiReport } from "@/lib/vocational-test/gemini";
import {
  METHOD_VERSION,
  assertCompleteAnswers,
  completeSessionSchema,
} from "@/lib/vocational-test/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("UNAUTHORIZED", 401);
    }

    const input = completeSessionSchema.parse(await request.json());
    const completion = assertCompleteAnswers(input.answers);

    if (!completion.ok) {
      return jsonError("BAD_REQUEST", 400, {
        message: "Responda todas as perguntas antes de finalizar.",
        missing: completion.missing,
      });
    }

    const result = calculateResult(input.answers, input.profile);
    let aiReport: string | null = null;
    let reportProvider: string | null = null;
    let reportModel: string | null = null;
    let reportGeneratedAt: Date | null = null;

    try {
      const generated = await generateGeminiReport({
        profile: input.profile,
        answers: input.answers,
        result,
      });

      aiReport = generated.report;
      reportProvider = generated.provider;
      reportModel = generated.model;
      reportGeneratedAt = generated.report ? new Date() : null;
    } catch {
      aiReport = null;
      reportProvider = "gemini";
      reportModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
      reportGeneratedAt = null;
    }

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

    const data = {
      methodVersion: METHOD_VERSION,
      status: "completed",
      currentQuestionIndex: 0,
      profile: input.profile,
      answers: input.answers,
      result: result as unknown as Prisma.InputJsonValue,
      aiReport,
      reportProvider,
      reportModel,
      reportGeneratedAt,
      completedAt: new Date(result.completedAt),
    };

    const saved = existingDraft
      ? await prisma.vocationalTestSession.update({
          where: { id: existingDraft.id },
          data,
        })
      : await prisma.vocationalTestSession.create({
          data: {
            userId: session.user.id,
            ...data,
          },
        });

    return jsonOk({
      session: {
        id: saved.id,
        methodVersion: saved.methodVersion,
        status: saved.status,
        result: saved.result,
        aiReport: saved.aiReport,
        reportProvider: saved.reportProvider,
        reportModel: saved.reportModel,
        publicInPortfolio: saved.publicInPortfolio,
        publicInResume: saved.publicInResume,
        reportGeneratedAt: saved.reportGeneratedAt?.toISOString() ?? null,
        completedAt: saved.completedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    return handleRouteError("POST /api/vocational-test/complete", error);
  }
}
