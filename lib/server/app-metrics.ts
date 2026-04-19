import type { AppProfile } from "@/lib/server/app-viewer";

export function getProfileStrength(profile: AppProfile) {
  const checks = [
    Boolean(profile.displayName || profile.user.name),
    Boolean(profile.headline),
    Boolean(profile.bio),
    profile.experiences.length > 0,
    profile.projects.length > 0,
    profile.links.length > 0 || Boolean(profile.websiteUrl),
    profile.achievements.length > 0 || profile.proofs.length > 0,
  ];

  const completed = checks.filter(Boolean).length;

  return {
    completed,
    total: checks.length,
    percent: Math.round((completed / checks.length) * 100),
  };
}

export function getAppCounts(profile: AppProfile) {
  const pages = profile.versions.flatMap((version) => (version.page ? [version.page] : []));
  const resumeConfigs = profile.versions.flatMap((version) =>
    version.resumeConfig ? [version.resumeConfig] : []
  );

  return {
    versions: profile.versions.length,
    pages: pages.length,
    publishedPages: pages.filter((page) => page.publishState === "PUBLISHED").length,
    resumeConfigs: resumeConfigs.length,
    publishedResumes: resumeConfigs.filter(
      (config) => config.publishState === "PUBLISHED"
    ).length,
    experiences: profile.experiences.length,
    projects: profile.projects.length,
    proofs: profile.proofs.length,
    links: profile.links.length + (profile.websiteUrl ? 1 : 0),
  };
}
