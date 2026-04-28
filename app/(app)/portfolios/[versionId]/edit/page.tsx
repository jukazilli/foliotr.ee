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
        }}
      />
    </main>
  );
}
