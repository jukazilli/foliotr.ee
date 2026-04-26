import type { TestResult } from "./types";

export type BehavioralAnalysisSnapshot = {
  id: string;
  completedAt: string | null;
  aiReport: string | null;
  result: TestResult;
};

type PublicAnalysisRecord = {
  id: string;
  completedAt: Date | string | null;
  aiReport: string | null;
  result: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readTestResult(value: unknown): TestResult | null {
  if (!isRecord(value)) return null;
  if (!isRecord(value.bigFive) || !isRecord(value.riasec)) return null;
  if (!Array.isArray((value.bigFive as { ranking?: unknown }).ranking)) return null;
  if (!Array.isArray((value.riasec as { ranking?: unknown }).ranking)) return null;
  if (typeof value.dominantArchetypeLabel !== "string") return null;
  if (typeof value.summary !== "string") return null;

  return value as unknown as TestResult;
}

export function toBehavioralAnalysisSnapshot(
  record: PublicAnalysisRecord | null | undefined
): BehavioralAnalysisSnapshot | null {
  if (!record) return null;

  const result = readTestResult(record.result);
  if (!result) return null;

  return {
    id: record.id,
    completedAt:
      record.completedAt instanceof Date
        ? record.completedAt.toISOString()
        : record.completedAt,
    aiReport: record.aiReport,
    result,
  };
}

export function selectBehavioralAnalysis(
  sessions: PublicAnalysisRecord[] | undefined,
  target: "portfolio" | "resume"
) {
  if (!sessions?.length) return null;

  const selected = sessions.find((session) => {
    const flags = session as PublicAnalysisRecord & {
      publicInPortfolio?: boolean;
      publicInResume?: boolean;
    };

    return target === "portfolio" ? flags.publicInPortfolio : flags.publicInResume;
  });

  return toBehavioralAnalysisSnapshot(selected);
}
