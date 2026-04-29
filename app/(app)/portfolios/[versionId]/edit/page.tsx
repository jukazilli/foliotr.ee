import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listCanonicalTemplates } from "@/lib/server/domain/canonical-templates";
import { getPrimaryVersionPage } from "@/lib/server/domain/includes";
import {
  buildVersionProfileSnapshot,
  readVersionProfileSnapshot,
} from "@/lib/server/domain/page-snapshots";
import { getOwnedProfileBase } from "@/lib/server/domain/profile-base";
import { getOwnedVersion } from "@/lib/server/domain/versions";
import { PortfolioVariationWizard } from "@/components/portfolios/PortfolioVariationWizard";
import { savePortfolioVariationAction } from "@/app/(app)/portfolios/[versionId]/edit/actions";

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    : [];
}

function readFirstText(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

function toCollectionItem(
  item: Record<string, unknown>,
  titleKeys: string[],
  subtitleKeys: string[]
) {
  const id = readFirstText(item, ["id"]);
  if (!id) return null;

  return {
    id,
    title: readFirstText(item, titleKeys) || "Item sem título",
    subtitle: readFirstText(item, subtitleKeys) || null,
  };
}

function buildVersionCollections(snapshot: unknown) {
  const source =
    typeof snapshot === "object" && snapshot !== null
      ? (snapshot as Record<string, unknown>)
      : {};

  return {
    experiences: toRecordArray(source.experiences)
      .map((item) => toCollectionItem(item, ["role"], ["company", "location"]))
      .filter((item): item is NonNullable<typeof item> => item !== null),
    educations: toRecordArray(source.educations)
      .map((item) => toCollectionItem(item, ["degree", "field"], ["institution"]))
      .filter((item): item is NonNullable<typeof item> => item !== null),
    projects: toRecordArray(source.projects)
      .map((item) => toCollectionItem(item, ["title"], ["description", "url"]))
      .filter((item): item is NonNullable<typeof item> => item !== null),
    skills: toRecordArray(source.skills)
      .map((item) => toCollectionItem(item, ["name"], ["category", "level"]))
      .filter((item): item is NonNullable<typeof item> => item !== null),
    achievements: toRecordArray(source.achievements)
      .map((item) => toCollectionItem(item, ["title"], ["metric", "description"]))
      .filter((item): item is NonNullable<typeof item> => item !== null),
    proofs: toRecordArray(source.proofs)
      .map((item) =>
        toCollectionItem(item, ["title", "reviewerName"], ["metric", "description"])
      )
      .filter((item): item is NonNullable<typeof item> => item !== null),
    highlights: toRecordArray(source.highlights)
      .map((item) => toCollectionItem(item, ["title"], ["metric", "description"]))
      .filter((item): item is NonNullable<typeof item> => item !== null),
    links: toRecordArray(source.links)
      .map((item) => toCollectionItem(item, ["label", "platform"], ["url"]))
      .filter((item): item is NonNullable<typeof item> => item !== null),
  };
}

export default async function PortfolioVariationEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ versionId: string }>;
  searchParams: Promise<{ saved?: string; published?: string; error?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [{ versionId }, query] = await Promise.all([params, searchParams]);
  const [profile, version, templates] = await Promise.all([
    getOwnedProfileBase(prisma, session.user.id),
    getOwnedVersion(prisma, session.user.id, versionId).catch(() => null),
    listCanonicalTemplates(prisma),
  ]);

  if (!version) {
    notFound();
  }

  const snapshot =
    readVersionProfileSnapshot(version.profileSnapshot) ??
    buildVersionProfileSnapshot(profile);
  const page = getPrimaryVersionPage(version);
  const defaultTemplate = templates[0] ?? null;

  if (!page && !defaultTemplate) {
    redirect("/templates?error=missing-template");
  }

  const publicHref =
    page && profile.user.username ? `/${profile.user.username}/${page.slug}` : null;
  const saveAction = savePortfolioVariationAction.bind(null, version.id);

  return (
    <main className="py-5">
      <PortfolioVariationWizard
        saveAction={saveAction}
        saved={query.saved === "1"}
        published={query.published === "1"}
        error={query.error}
        templates={templates.map((template) => ({
          id: template.id,
          name: template.name,
          slug: template.slug,
          summary: template.summary,
          category: template.category,
        }))}
        initialValues={{
          versionName: version.name,
          displayName: toText(snapshot.displayName),
          headline: toText(snapshot.headline ?? version.customHeadline),
          bio: toText(snapshot.bio ?? version.customBio),
          location: toText(snapshot.location),
          avatarUrl: toText(snapshot.avatarUrl),
          bannerUrl: toText(snapshot.bannerUrl),
          slug: page?.slug ?? "",
          publicHref,
          templateId: page?.templateId ?? defaultTemplate?.id ?? "",
          publishState: page?.publishState ?? "DRAFT",
          collections: buildVersionCollections(snapshot),
          selections: {
            experienceIds: version.experiences.map((item) => item.experienceId),
            educationIds: version.educations.map((item) => item.educationId),
            projectIds: version.projects.map((item) => item.projectId),
            skillIds: version.skills.map((item) => item.skillId),
            achievementIds: version.achievements.map((item) => item.achievementId),
            proofIds: version.proofs.map((item) => item.proofId),
            highlightIds: version.highlights.map((item) => item.highlightId),
            linkIds: version.links.map((item) => item.linkId),
          },
        }}
      />
    </main>
  );
}
