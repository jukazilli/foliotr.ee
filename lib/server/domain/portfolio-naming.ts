import type { VersionAggregate } from "@/lib/server/domain/includes";
import { readVersionProfileSnapshot } from "@/lib/server/domain/page-snapshots";

type PortfolioNameSnapshot = {
  displayName?: string | null;
  headline?: string | null;
  experiences?: Array<{ role?: string | null }>;
};

function cleanText(value: string | null | undefined) {
  const text = value?.trim();
  return text && text.length > 0 ? text : null;
}

export function derivePortfolioNameFromSnapshot(
  snapshot: PortfolioNameSnapshot | null | undefined,
  fallback = "Portfolio"
) {
  return (
    cleanText(snapshot?.headline) ??
    cleanText(snapshot?.experiences?.find((item) => cleanText(item.role))?.role) ??
    cleanText(snapshot?.displayName) ??
    fallback
  );
}

export function derivePortfolioVersionName(
  version: VersionAggregate,
  fallback = "Portfolio"
) {
  const snapshot = readVersionProfileSnapshot(version.profileSnapshot);

  return derivePortfolioNameFromSnapshot(
    snapshot,
    cleanText(version.customHeadline) ??
      cleanText(version.experiences[0]?.experience.role) ??
      cleanText(version.name) ??
      fallback
  );
}
