"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Crop,
  ExternalLink,
  FolderOpenDot,
  GraduationCap,
  ImagePlus,
  Link2,
  Maximize2,
  Medal,
  Minimize2,
  Plus,
  Save,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  AssetGalleryPicker,
  type GalleryImageAsset,
} from "@/components/assets/AssetGalleryPicker";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { UsernameEditor } from "@/components/settings/UsernameEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeStoragePublicUrl } from "@/lib/storage/public-url";

type EditableProfile = {
  id: string;
  displayName: string | null;
  avatarUrl?: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  pronouns: string | null;
  websiteUrl: string | null;
  publicEmail: string | null;
  phone: string | null;
  birthDate: string | null;
  defaultPresentationId: string | null;
  openToOpportunities: boolean;
  opportunityMotivation: string | null;
  showOpportunityMotivation: boolean;
  user: {
    username: string | null;
    name: string | null;
    email: string | null;
  };
  experiences: EditableExperience[];
  educations: EditableEducation[];
  projects: EditableProject[];
  achievements: EditableAchievement[];
  highlights: EditableHighlight[];
  proofs: EditableProof[];
  presentations: EditablePresentation[];
  links: EditableLink[];
  skills: EditableSkill[];
  versions: Array<{
    id: string;
    name: string;
    isDefault: boolean;
    pages: unknown[];
    resumeConfig: unknown | null;
  }>;
};

type EditablePresentation = {
  _key: string;
  id?: string;
  title: string;
  body: string;
  context: string;
  isArchived: boolean;
};

type EditableExperience = {
  _key: string;
  id?: string;
  company: string;
  role: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  logoUrl: string;
  logoAssetId?: string | null;
};

type EditableEducation = {
  _key: string;
  id?: string;
  institution: string;
  degree: string;
  field: string;
  description: string;
  startDate: string;
  endDate: string;
  current: boolean;
  logoUrl: string;
};

type EditableProject = {
  _key: string;
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  repoUrl: string;
  tagsText: string;
  featured: boolean;
  coverAssetId?: string | null;
  coverFitMode: ProjectCoverFitMode;
  coverPositionX: number;
  coverPositionY: number;
  startDate: string;
  endDate: string;
};

type EditableAchievement = {
  _key: string;
  id?: string;
  title: string;
  description: string;
  date: string;
  metric: string;
  imageUrl: string;
  assetId?: string | null;
};

type EditableHighlight = {
  _key: string;
  id?: string;
  title: string;
  description: string;
  metric: string;
  assetId?: string | null;
};

type EditableProof = {
  _key: string;
  id?: string;
  title: string;
  description: string;
  metric: string;
  url: string;
  imageUrl: string;
  tagsText: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerEmail: string;
  rating: number;
  isVisible: boolean;
  source: string;
  assetId?: string | null;
};

type EditableLink = {
  _key: string;
  id?: string;
  platform: string;
  label: string;
  url: string;
};

type EditableSkill = {
  _key: string;
  id?: string;
  name: string;
  category: string;
  level: "" | "beginner" | "intermediate" | "advanced" | "expert";
};

type SaveStatus = "idle" | "saving" | "saved" | "error";
type ProjectCoverFitMode = "fit" | "fill" | "crop";

type ProfileGalleryTarget =
  | { kind: "avatar" }
  | { kind: "projectCover"; projectKey: string };

function key() {
  return `tmp_${Math.random().toString(36).slice(2, 10)}`;
}

function persistedId(id?: string) {
  return id && !id.startsWith("tmp_") ? id : undefined;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeProjectCoverFitMode(value: unknown): ProjectCoverFitMode {
  return value === "fit" || value === "fill" || value === "crop" ? value : "crop";
}

function coverObjectFit(mode: ProjectCoverFitMode) {
  return mode === "fit" ? "contain" : "cover";
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toDateInput(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function compactTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanUrl(value: string | null | undefined) {
  const raw = value?.trim() ?? "";
  if (!raw || raw === "https://" || raw === "http://") return "";

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function cleanAssetUrl(value: string | null | undefined) {
  const raw = value?.trim() ?? "";
  if (!raw) return "";
  const normalized = normalizeStoragePublicUrl(raw);
  if (normalized.startsWith("/")) return normalized;
  return cleanUrl(normalized);
}

const ERROR_LABELS: Record<string, string> = {
  displayName: "Nome de exibicao",
  headline: "Headline",
  bio: "Bio curta",
  location: "Localizacao",
  pronouns: "Pronomes",
  websiteUrl: "Site",
  publicEmail: "Email publico",
  phone: "Telefone",
  birthDate: "Data de nascimento",
  defaultPresentationId: "Apresentação padrão",
  openToOpportunities: "Aberto a oportunidades",
  opportunityMotivation: "Motivacao de mudanca",
  showOpportunityMotivation: "Mostrar motivacao",
  highlights: "Highlights",
  experiences: "Experiencias",
  educations: "Formacao",
  skills: "Skills",
  projects: "Projetos",
  achievements: "Reconhecimentos",
  proofs: "Reviews",
  presentations: "Apresentações",
  links: "Links",
  company: "Empresa",
  role: "Cargo",
  institution: "Instituicao",
  degree: "Curso",
  field: "Area de estudo",
  description: "Descricao",
  startDate: "Data de inicio",
  endDate: "Data final",
  current: "Atual",
  logoUrl: "Logo",
  name: "Nome",
  category: "Categoria",
  level: "Nivel",
  title: "Titulo",
  imageUrl: "Imagem",
  url: "URL",
  repoUrl: "Repositorio",
  tags: "Tags",
  date: "Data",
  metric: "Metrica",
  platform: "Tipo",
  label: "Label",
};

const SINGULAR_COLLECTION_LABELS: Record<string, string> = {
  highlights: "Highlight",
  experiences: "Experiencia",
  educations: "Formacao",
  skills: "Skill",
  projects: "Projeto",
  achievements: "Reconhecimento",
  proofs: "Review",
  presentations: "Apresentação",
  links: "Link",
};

function isCollectionField(field: keyof EditableProfile): field is CollectionField {
  return (
    field === "highlights" ||
    field === "experiences" ||
    field === "educations" ||
    field === "skills" ||
    field === "projects" ||
    field === "achievements" ||
    field === "proofs" ||
    field === "presentations" ||
    field === "links"
  );
}

function formatValidationPath(path: string) {
  const parts = path.split(".").filter(Boolean);
  if (parts.length === 0) return "Formulario";

  const labels: string[] = [];

  for (const [partIndex, part] of parts.entries()) {
    const index = Number(part);
    if (Number.isInteger(index) && String(index) === part) {
      const collection = parts[partIndex - 1];
      labels.push(`${SINGULAR_COLLECTION_LABELS[collection] ?? "Item"} ${index + 1}`);
      continue;
    }

    if (SINGULAR_COLLECTION_LABELS[part]) {
      labels.push(ERROR_LABELS[part] ?? part);
      continue;
    }

    labels.push(ERROR_LABELS[part] ?? part);
  }

  return labels.join(" > ");
}

function formatApiError(body: unknown) {
  if (!body || typeof body !== "object") {
    return "Nao foi possivel interpretar a resposta do servidor.";
  }

  const error = body as {
    error?: {
      message?: string;
      details?:
        | Record<string, string[]>
        | {
            fieldErrors?: Record<string, string[]>;
            issues?: Array<{ path: string; message: string; code?: string }>;
          };
    };
  };

  const details = error.error?.details;
  if (details && typeof details === "object") {
    if ("message" in details && typeof details.message === "string") {
      return details.message;
    }

    if (
      "issues" in details &&
      Array.isArray(details.issues) &&
      details.issues.length > 0 &&
      typeof details.issues[0] === "object" &&
      details.issues[0] !== null &&
      "path" in details.issues[0] &&
      "message" in details.issues[0]
    ) {
      const firstIssue = details.issues[0] as { path: string; message: string };
      return `${formatValidationPath(firstIssue.path)}: ${firstIssue.message}`;
    }

    const fieldErrors =
      "fieldErrors" in details && details.fieldErrors ? details.fieldErrors : details;

    const first = Object.entries(fieldErrors)
      .filter(([, messages]) => Array.isArray(messages) && messages.length > 0)
      .map(([field, messages]) => `${formatValidationPath(field)}: ${messages[0]}`)[0];

    if (first) return first;
  }

  return error.error?.message ?? "Nao foi possivel salvar.";
}

function normalizeProfile(profile: EditableProfile): EditableProfile {
  return {
    ...profile,
    displayName: text(profile.displayName),
    avatarUrl: cleanAssetUrl(profile.avatarUrl),
    headline: text(profile.headline),
    bio: text(profile.bio),
    location: text(profile.location),
    pronouns: text(profile.pronouns),
    websiteUrl: text(profile.websiteUrl),
    publicEmail: text(profile.publicEmail),
    phone: text(profile.phone),
    birthDate: toDateInput(profile.birthDate),
    defaultPresentationId: text(profile.defaultPresentationId),
    openToOpportunities: Boolean(profile.openToOpportunities),
    opportunityMotivation: text(profile.opportunityMotivation),
    showOpportunityMotivation: Boolean(profile.showOpportunityMotivation),
    experiences: profile.experiences.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      company: text(item.company),
      role: text(item.role),
      description: text(item.description),
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
      current: Boolean(item.current),
      location: text(item.location),
      logoUrl: text(item.logoUrl),
      logoAssetId: item.logoAssetId ?? null,
    })),
    educations: profile.educations.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      institution: text(item.institution),
      degree: text(item.degree),
      field: text(item.field),
      description: text(item.description),
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
      current: Boolean(item.current),
      logoUrl: text(item.logoUrl),
    })),
    projects: profile.projects.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      title: text(item.title),
      description: text(item.description),
      imageUrl: text(item.imageUrl),
      url: text(item.url),
      repoUrl: text(item.repoUrl),
      tagsText: Array.isArray((item as unknown as { tags?: string[] }).tags)
        ? (item as unknown as { tags: string[] }).tags.join(", ")
        : text(item.tagsText),
      featured: Boolean(item.featured),
      coverAssetId: item.coverAssetId ?? null,
      coverFitMode: normalizeProjectCoverFitMode(item.coverFitMode),
      coverPositionX:
        typeof item.coverPositionX === "number"
          ? clampPercent(item.coverPositionX)
          : 50,
      coverPositionY:
        typeof item.coverPositionY === "number"
          ? clampPercent(item.coverPositionY)
          : 50,
      startDate: toDateInput(item.startDate),
      endDate: toDateInput(item.endDate),
    })),
    achievements: profile.achievements.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      title: text(item.title),
      description: text(item.description),
      date: toDateInput(item.date),
      metric: text(item.metric),
      imageUrl: text(item.imageUrl),
      assetId: item.assetId ?? null,
    })),
    highlights: profile.highlights.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      title: text(item.title),
      description: text(item.description),
      metric: text(item.metric),
      assetId: item.assetId ?? null,
    })),
    proofs: profile.proofs.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      title: text(item.title),
      description: text(item.description),
      metric: text(item.metric),
      url: text(item.url),
      imageUrl: text(item.imageUrl),
      tagsText: Array.isArray((item as unknown as { tags?: string[] }).tags)
        ? (item as unknown as { tags: string[] }).tags.join(", ")
        : text(item.tagsText),
      reviewerName: text(item.reviewerName) || text(item.title),
      reviewerRole: text(item.reviewerRole) || text(item.metric),
      reviewerEmail: text(item.reviewerEmail),
      rating:
        typeof item.rating === "number" && item.rating >= 1 && item.rating <= 5
          ? item.rating
          : 5,
      isVisible: Boolean(item.isVisible),
      source: text(item.source) || "manual",
      assetId: item.assetId ?? null,
    })),
    presentations: profile.presentations.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      title: text(item.title),
      body: text(item.body),
      context: text(item.context),
      isArchived: Boolean(item.isArchived),
    })),
    links: profile.links.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      platform: text(item.platform),
      label: text(item.label),
      url: text(item.url),
    })),
    skills: profile.skills.map((item) => ({
      _key: item.id ?? key(),
      id: item.id,
      name: text(item.name),
      category: text(item.category),
      level: item.level ?? "",
    })),
  };
}

type CollectionField =
  | "highlights"
  | "experiences"
  | "educations"
  | "skills"
  | "projects"
  | "achievements"
  | "proofs"
  | "presentations"
  | "links";

function buildBasePayload(profile: EditableProfile) {
  return {
    displayName: profile.displayName ?? "",
    avatarUrl: cleanAssetUrl(profile.avatarUrl),
    headline: profile.headline ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    pronouns: profile.pronouns ?? "",
    websiteUrl: cleanUrl(profile.websiteUrl),
    publicEmail: profile.publicEmail?.trim() ?? "",
    phone: profile.phone ?? "",
    birthDate: profile.birthDate || null,
    defaultPresentationId: profile.defaultPresentationId || null,
    openToOpportunities: profile.openToOpportunities,
    opportunityMotivation: profile.opportunityMotivation ?? "",
    showOpportunityMotivation: profile.showOpportunityMotivation,
  };
}

function buildCollectionPayload(profile: EditableProfile, collection: CollectionField) {
  if (collection === "highlights") {
    return profile.highlights
      .filter((item) => item.title.trim())
      .map((item) => ({
        id: persistedId(item.id),
        title: item.title,
        description: item.description,
        metric: item.metric,
        assetId: item.assetId ?? null,
      }));
  }

  if (collection === "experiences") {
    return profile.experiences
      .filter((item) => item.company.trim() && item.role.trim() && item.startDate)
      .map((item) => ({
        id: persistedId(item.id),
        company: item.company,
        role: item.role,
        description: item.description,
        startDate: item.startDate,
        endDate: item.current ? null : item.endDate || null,
        current: item.current,
        location: item.location,
        logoUrl: cleanAssetUrl(item.logoUrl),
        logoAssetId: item.logoAssetId ?? null,
      }));
  }

  if (collection === "educations") {
    return profile.educations
      .filter((item) => item.institution.trim() && item.startDate)
      .map((item) => ({
        id: persistedId(item.id),
        institution: item.institution,
        degree: item.degree,
        field: item.field,
        description: item.description,
        startDate: item.startDate,
        endDate: item.current ? null : item.endDate || null,
        current: item.current,
        logoUrl: cleanAssetUrl(item.logoUrl),
      }));
  }

  if (collection === "skills") {
    return profile.skills
      .filter((item) => item.name.trim())
      .map((item) => ({
        id: persistedId(item.id),
        name: item.name,
        category: item.category,
        level: item.level || undefined,
      }));
  }

  if (collection === "projects") {
    return profile.projects
      .filter((item) => item.title.trim())
      .map((item) => ({
        id: persistedId(item.id),
        title: item.title,
        description: item.description,
        imageUrl: cleanAssetUrl(item.imageUrl),
        url: cleanUrl(item.url),
        repoUrl: cleanUrl(item.repoUrl),
        tags: compactTags(item.tagsText),
        featured: item.featured,
        coverAssetId: item.coverAssetId ?? null,
        coverFitMode: item.coverFitMode,
        coverPositionX: item.coverPositionX,
        coverPositionY: item.coverPositionY,
        startDate: item.startDate || null,
        endDate: item.endDate || null,
      }));
  }

  if (collection === "achievements") {
    return profile.achievements
      .filter((item) => item.title.trim())
      .map((item) => ({
        id: persistedId(item.id),
        title: item.title,
        description: item.description,
        date: item.date || null,
        metric: item.metric,
        imageUrl: cleanAssetUrl(item.imageUrl),
        assetId: item.assetId ?? null,
      }));
  }

  if (collection === "proofs") {
    return profile.proofs
      .filter((item) => item.title.trim())
      .map((item) => ({
        id: persistedId(item.id),
        title: item.title,
        description: item.description,
        metric: item.metric,
        url: cleanUrl(item.url),
        imageUrl: cleanAssetUrl(item.imageUrl),
        tags: compactTags(item.tagsText),
        assetId: item.assetId ?? null,
        reviewerName: item.reviewerName || item.title,
        reviewerRole: item.reviewerRole,
        reviewerEmail: item.reviewerEmail,
        rating: item.rating,
        isVisible: item.isVisible,
        source: item.source || "manual",
      }));
  }

  if (collection === "presentations") {
    return profile.presentations
      .filter((item) => item.title.trim() && item.body.trim())
      .map((item) => ({
        id: persistedId(item.id),
        title: item.title,
        body: item.body,
        context: item.context,
        isArchived: item.isArchived,
      }));
  }

  return profile.links
    .filter((item) => item.platform.trim() && cleanUrl(item.url))
    .map((item) => ({
      id: persistedId(item.id),
      platform: item.platform,
      label: item.label,
      url: cleanUrl(item.url),
    }));
}

function Field({
  label,
  children,
  meta,
}: {
  label: string;
  children: ReactNode;
  meta?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-neutral-800">{label}</span>
        {meta ? (
          <span className="font-data text-[10px] uppercase tracking-[0.16em] text-neutral-400">
            {meta}
          </span>
        ) : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function inputClass() {
  return "w-full min-w-0 rounded-[14px] border-2 border-line bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:ring-4 focus:ring-pink/70 disabled:bg-cream disabled:text-muted";
}

function textareaClass() {
  return `${inputClass()} min-h-28 resize-y leading-6`;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-coral-50 hover:text-coral-800"
    >
      {children}
    </button>
  );
}

function SectionBar({
  count,
  label,
  action,
}: {
  count: number;
  label: string;
  action: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {count} {label}
      </p>
      {action}
    </div>
  );
}

export function ProfileEditor({
  initialProfile,
  initialTab,
}: {
  initialProfile: EditableProfile;
  initialTab?: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(() => normalizeProfile(initialProfile));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [dirtyCollections, setDirtyCollections] = useState<Set<CollectionField>>(
    () => new Set()
  );
  const [today, setToday] = useState<Date | null>(null);
  const [profileGalleryTarget, setProfileGalleryTarget] =
    useState<ProfileGalleryTarget | null>(null);

  const username = profile.user.username;
  const age = useMemo(() => {
    if (!profile.birthDate || !today) return null;
    const birthDate = new Date(`${profile.birthDate}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return null;

    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      years -= 1;
    }

    return years >= 0 ? years : null;
  }, [profile.birthDate, today]);

  useEffect(() => {
    setToday(new Date());
  }, []);

  function setBase<K extends keyof EditableProfile>(
    field: K,
    value: EditableProfile[K]
  ) {
    setProfile((current) => ({ ...current, [field]: value }));
    setStatus("idle");
  }

  function setUsername(usernameValue: string) {
    setProfile((current) => ({
      ...current,
      user: {
        ...current.user,
        username: usernameValue,
      },
    }));
  }

  function updateList<T extends { _key: string }>(
    field: keyof EditableProfile,
    keyValue: string,
    patch: Partial<T>
  ) {
    setProfile((current) => ({
      ...current,
      [field]: (current[field] as unknown as T[]).map((item) =>
        item._key === keyValue ? { ...item, ...patch } : item
      ),
    }));
    if (isCollectionField(field)) {
      setDirtyCollections((current) => new Set(current).add(field));
    }
    setStatus("idle");
  }

  function addItem<T>(field: keyof EditableProfile, item: T) {
    setProfile((current) => ({
      ...current,
      [field]: [...(current[field] as unknown as T[]), item],
    }));
    if (isCollectionField(field)) {
      setDirtyCollections((current) => new Set(current).add(field));
    }
    setStatus("idle");
  }

  function removeItem<T extends { _key: string }>(
    field: keyof EditableProfile,
    keyValue: string
  ) {
    setProfile((current) => ({
      ...current,
      [field]: (current[field] as unknown as T[]).filter(
        (item) => item._key !== keyValue
      ),
    }));
    if (isCollectionField(field)) {
      setDirtyCollections((current) => new Set(current).add(field));
    }
    setStatus("idle");
  }

  async function saveProfile() {
    setStatus("saving");
    setError("");

    const baseResponse = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBasePayload(profile)),
    });

    if (!baseResponse.ok) {
      const body = await baseResponse.json().catch(() => null);
      setError(formatApiError(body));
      setStatus("error");
      return;
    }

    const baseBody = (await baseResponse.json()) as {
      profile: Partial<EditableProfile>;
    };
    const savedCollections = new Set<CollectionField>();
    const profilePatch: Record<string, unknown> = { ...baseBody.profile };

    for (const collection of dirtyCollections) {
      const response = await fetch(`/api/profile/collections/${collection}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: buildCollectionPayload(profile, collection) }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setProfile((current) =>
          normalizeProfile({ ...current, ...profilePatch } as EditableProfile)
        );
        setDirtyCollections((current) => {
          const next = new Set(current);
          for (const savedCollection of savedCollections) {
            next.delete(savedCollection);
          }
          return next;
        });
        setError(formatApiError(body));
        setStatus("error");
        router.refresh();
        return;
      }

      const body = (await response.json()) as {
        collection: CollectionField;
        items: EditableProfile[CollectionField];
      };

      profilePatch[body.collection] = body.items;
      savedCollections.add(body.collection);
    }

    setProfile((current) =>
      normalizeProfile({ ...current, ...profilePatch } as EditableProfile)
    );
    setDirtyCollections(new Set());
    setStatus("saved");
    router.refresh();
  }

  function onInput<K extends keyof EditableProfile>(field: K) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setBase(field, event.target.value as EditableProfile[K]);
    };
  }

  const saveLabel =
    status === "saving" ? "Salvando" : status === "saved" ? "Salvo" : "Salvar";

  const photoPreview = profile.avatarUrl || "";

  function removeProfilePhoto() {
    setBase("avatarUrl", "" as EditableProfile["avatarUrl"]);
    setPhotoError("");
  }

  function openProfileGallery(target: ProfileGalleryTarget) {
    setPhotoError("");
    setProfileGalleryTarget(target);
  }

  async function applyAvatarAsset(asset: GalleryImageAsset) {
    const nextProfile = {
      ...profile,
      avatarUrl: asset.url,
    };

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildBasePayload(nextProfile)),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(formatApiError(body));
    }

    const body = (await response.json()) as {
      profile: Partial<EditableProfile>;
    };

    setProfile((current) =>
      normalizeProfile({ ...current, ...body.profile, avatarUrl: asset.url })
    );
    setPhotoError("");
    setStatus("saved");
    router.refresh();
  }

  function applyProjectCoverAsset(projectKey: string, asset: GalleryImageAsset) {
    updateList<EditableProject>("projects", projectKey, {
      imageUrl: asset.url,
      coverAssetId: asset.id,
      coverFitMode: "crop",
      coverPositionX: 50,
      coverPositionY: 50,
    });
  }

  async function handleProfileGallerySelect(asset: GalleryImageAsset) {
    if (!profileGalleryTarget) return;

    if (profileGalleryTarget.kind === "avatar") {
      await applyAvatarAsset(asset);
      return;
    }

    applyProjectCoverAsset(profileGalleryTarget.projectKey, asset);
  }

  function removeProjectCover(projectKey: string) {
    updateList<EditableProject>("projects", projectKey, {
      imageUrl: "",
      coverAssetId: null,
      coverFitMode: "crop",
      coverPositionX: 50,
      coverPositionY: 50,
    });
  }

  return (
    <div className="app-grid-18">
      <AssetGalleryPicker
        open={Boolean(profileGalleryTarget)}
        title={
          profileGalleryTarget?.kind === "projectCover"
            ? "Galeria de capas"
            : "Galeria de fotos"
        }
        description="Escolha uma imagem ja enviada ou envie uma nova."
        uploadPurpose={
          profileGalleryTarget?.kind === "projectCover" ? "project" : "avatar"
        }
        currentUrl={
          profileGalleryTarget?.kind === "projectCover"
            ? profile.projects.find(
                (item) => item._key === profileGalleryTarget.projectKey
              )?.imageUrl
            : profile.avatarUrl
        }
        onOpenChange={(open) => {
          if (!open) setProfileGalleryTarget(null);
        }}
        onSelect={handleProfileGallerySelect}
      />
      <header className="app-col-full flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Perfil base
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.025em] text-ink sm:text-4xl">
            {profile.displayName || profile.user.name || "Seu perfil"}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="default">{profile.educations.length} formacoes</Badge>
            <Badge variant="info">{profile.experiences.length} experiencias</Badge>
            <Badge variant="version">{profile.projects.length} projetos</Badge>
            <Badge variant="premium">
              {profile.proofs.length +
                profile.achievements.length +
                profile.highlights.length}{" "}
              reviews e marcos
            </Badge>
            <Badge variant="info">{profile.presentations.length} apresentações</Badge>
            <Badge variant="warning">{profile.versions.length} versoes</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {username ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/${username}`} target="_blank">
                  Perfil público
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${username}/resume`} target="_blank">
                  Curriculo
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </>
          ) : null}
          <Button onClick={saveProfile} loading={status === "saving"}>
            {status === "saved" ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Save className="h-4 w-4" aria-hidden />
            )}
            {saveLabel}
          </Button>
        </div>
      </header>

      {error ? (
        <div className="app-col-full rounded-[16px] border-2 border-line bg-pink px-4 py-3 text-sm font-bold text-ink">
          {error}
        </div>
      ) : null}

      <div className="app-col-full">
        <ProfileTabs
          defaultValue={initialTab}
          tabs={[
            {
              value: "dados",
              label: "Dados basicos",
              count: 1,
              children: (
                <div className="app-grid-18">
                  <div className="app-col-main">
                    <Card className="rounded-[24px]">
                      <CardContent className="space-y-5 p-5">
                        <div className="grid gap-4 rounded-[20px] border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
                          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white">
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound
                                className="h-10 w-10 text-neutral-400"
                                aria-hidden
                              />
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">
                                Foto
                              </p>
                              <p className="mt-1 text-sm text-neutral-600">
                                {photoPreview
                                  ? "Preview atualizado."
                                  : "Adicione uma foto."}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openProfileGallery({ kind: "avatar" })}
                                className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-55"
                              >
                                {photoPreview ? "Trocar foto" : "Adicionar foto"}
                              </button>

                              {photoPreview ? (
                                <button
                                  type="button"
                                  onClick={removeProfilePhoto}
                                  className="inline-flex items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-coral-50 hover:text-coral-800"
                                >
                                  Remover foto
                                </button>
                              ) : null}
                            </div>

                            {photoError ? (
                              <p className="text-sm font-medium text-coral-800">
                                {photoError}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <Field label="Nome de exibicao">
                          <input
                            id="profile-display-name"
                            name="displayName"
                            className={inputClass()}
                            value={profile.displayName ?? ""}
                            onChange={onInput("displayName")}
                          />
                        </Field>
                        <Field label="Handle" meta="URL publica">
                          <UsernameEditor
                            initialUsername={username}
                            onChanged={setUsername}
                          />
                        </Field>
                        <Field label="Headline" meta="template e currículo">
                          <input
                            id="profile-headline"
                            name="headline"
                            className={inputClass()}
                            value={profile.headline ?? ""}
                            onChange={onInput("headline")}
                          />
                        </Field>
                        <Field label="Bio curta">
                          <textarea
                            id="profile-bio"
                            name="bio"
                            className={textareaClass()}
                            value={profile.bio ?? ""}
                            onChange={onInput("bio")}
                          />
                        </Field>
                        <div className="grid gap-4 rounded-[20px] border border-neutral-200 bg-neutral-50 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">
                                Oportunidades
                              </p>
                              <p className="mt-1 text-sm text-neutral-600">
                                Informe se você está aberto a conversas e o que faria
                                sentido para uma mudança.
                              </p>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                              <input
                                type="checkbox"
                                checked={profile.openToOpportunities}
                                onChange={(event) =>
                                  setBase("openToOpportunities", event.target.checked)
                                }
                              />
                              Aberto a novas oportunidades
                            </label>
                          </div>

                          <Field label="O que faria você mudar de emprego?">
                            <textarea
                              id="profile-opportunity-motivation"
                              name="opportunityMotivation"
                              className={textareaClass()}
                              placeholder="Ex: oportunidade de aprender algo novo, salário maior, migração de carreira..."
                              value={profile.opportunityMotivation ?? ""}
                              onChange={onInput("opportunityMotivation")}
                            />
                          </Field>

                          <label className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                            <input
                              type="checkbox"
                              checked={profile.showOpportunityMotivation}
                              onChange={(event) =>
                                setBase(
                                  "showOpportunityMotivation",
                                  event.target.checked
                                )
                              }
                            />
                            Mostrar essa resposta no perfil público
                          </label>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Localizacao">
                            <input
                              id="profile-location"
                              name="location"
                              className={inputClass()}
                              value={profile.location ?? ""}
                              onChange={onInput("location")}
                            />
                          </Field>
                          <Field label="Pronomes">
                            <input
                              id="profile-pronouns"
                              name="pronouns"
                              className={inputClass()}
                              value={profile.pronouns ?? ""}
                              onChange={onInput("pronouns")}
                            />
                          </Field>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Email publico">
                            <input
                              id="profile-public-email"
                              name="publicEmail"
                              className={inputClass()}
                              value={profile.publicEmail ?? ""}
                              onChange={onInput("publicEmail")}
                            />
                          </Field>
                          <Field label="Telefone">
                            <input
                              id="profile-phone"
                              name="phone"
                              className={inputClass()}
                              value={profile.phone ?? ""}
                              onChange={onInput("phone")}
                            />
                          </Field>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Data de nascimento">
                            <input
                              id="profile-birth-date"
                              name="birthDate"
                              type="date"
                              className={inputClass()}
                              value={profile.birthDate ?? ""}
                              onChange={(event) =>
                                setBase("birthDate", event.target.value)
                              }
                            />
                          </Field>
                          <Field label="Idade" meta="calculada automaticamente">
                            <div className="flex h-[42px] items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-700">
                              {age !== null ? `${age} anos` : "Nao informada"}
                            </div>
                          </Field>
                        </div>
                        <Field label="Site">
                          <input
                            id="profile-website-url"
                            name="websiteUrl"
                            className={inputClass()}
                            value={profile.websiteUrl ?? ""}
                            onChange={onInput("websiteUrl")}
                          />
                        </Field>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ),
            },
            {
              value: "formacao",
              label: "Formacao",
              count: profile.educations.length,
              children: (
                <ListPanel
                  icon={<GraduationCap className="h-4 w-4" />}
                  count={profile.educations.length}
                  label="formacoes"
                  addLabel="Formacao"
                  onAdd={() =>
                    addItem<EditableEducation>("educations", {
                      _key: key(),
                      institution: "",
                      degree: "",
                      field: "",
                      description: "",
                      startDate: new Date().toISOString().slice(0, 10),
                      endDate: "",
                      current: false,
                      logoUrl: "",
                    })
                  }
                >
                  {profile.educations.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-4 p-4 md:grid-cols-[130px_1fr_auto]">
                        <div className="space-y-3">
                          <input
                            type="date"
                            className={inputClass()}
                            value={item.startDate}
                            onChange={(event) =>
                              updateList<EditableEducation>("educations", item._key, {
                                startDate: event.target.value,
                              })
                            }
                          />
                          <input
                            type="date"
                            className={inputClass()}
                            value={item.endDate}
                            disabled={item.current}
                            onChange={(event) =>
                              updateList<EditableEducation>("educations", item._key, {
                                endDate: event.target.value,
                              })
                            }
                          />
                          <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                            <input
                              type="checkbox"
                              checked={item.current}
                              onChange={(event) =>
                                updateList<EditableEducation>("educations", item._key, {
                                  current: event.target.checked,
                                })
                              }
                            />
                            Atual
                          </label>
                        </div>
                        <div className="grid gap-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              className={inputClass()}
                              placeholder="Instituicao"
                              value={item.institution}
                              onChange={(event) =>
                                updateList<EditableEducation>("educations", item._key, {
                                  institution: event.target.value,
                                })
                              }
                            />
                            <input
                              className={inputClass()}
                              placeholder="Curso ou grau"
                              value={item.degree}
                              onChange={(event) =>
                                updateList<EditableEducation>("educations", item._key, {
                                  degree: event.target.value,
                                })
                              }
                            />
                          </div>
                          <input
                            className={inputClass()}
                            placeholder="Area de estudo"
                            value={item.field}
                            onChange={(event) =>
                              updateList<EditableEducation>("educations", item._key, {
                                field: event.target.value,
                              })
                            }
                          />
                          <textarea
                            className={textareaClass()}
                            placeholder="Resumo da formacao, enfase, projetos ou conquistas"
                            value={item.description}
                            onChange={(event) =>
                              updateList<EditableEducation>("educations", item._key, {
                                description: event.target.value,
                              })
                            }
                          />
                          <input
                            className={inputClass()}
                            placeholder="Logo da instituicao"
                            value={item.logoUrl}
                            onChange={(event) =>
                              updateList<EditableEducation>("educations", item._key, {
                                logoUrl: event.target.value,
                              })
                            }
                          />
                        </div>
                        <IconButton
                          label="Remover formacao"
                          onClick={() =>
                            removeItem<EditableEducation>("educations", item._key)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>
              ),
            },
            {
              value: "apresentacoes",
              label: "Apresentações",
              count: profile.presentations.length,
              children: (
                <ListPanel
                  icon={<UserRound className="h-4 w-4" />}
                  count={profile.presentations.length}
                  label="apresentações"
                  addLabel="Apresentação"
                  onAdd={() =>
                    addItem<EditablePresentation>("presentations", {
                      _key: key(),
                      title: "",
                      body: "",
                      context: "",
                      isArchived: false,
                    })
                  }
                >
                  <div className="mb-4 rounded-[16px] border border-line bg-cream px-4 py-3 text-sm font-semibold text-muted">
                    Crie apresentações reutilizáveis para trocar o texto de sobre em
                    portfólios e currículos sem reescrever tudo.
                  </div>
                  {profile.presentations.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                        <div className="grid gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-cream px-4 py-3">
                            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                              <input
                                type="radio"
                                name="defaultPresentationId"
                                checked={
                                  Boolean(item.id) &&
                                  profile.defaultPresentationId === item.id
                                }
                                disabled={!item.id}
                                onChange={() => {
                                  if (item.id) {
                                    setBase("defaultPresentationId", item.id);
                                  }
                                }}
                              />
                              Apresentação padrão do perfil público
                            </label>
                            {!item.id ? (
                              <span className="text-xs font-bold text-muted">
                                Salve antes de marcar como padrão.
                              </span>
                            ) : null}
                          </div>
                          <input
                            className={inputClass()}
                            placeholder="Nome interno da apresentação"
                            value={item.title}
                            onChange={(event) =>
                              updateList<EditablePresentation>(
                                "presentations",
                                item._key,
                                {
                                  title: event.target.value,
                                }
                              )
                            }
                          />
                          <input
                            className={inputClass()}
                            placeholder="Contexto opcional: vaga, cliente, área..."
                            value={item.context}
                            onChange={(event) =>
                              updateList<EditablePresentation>(
                                "presentations",
                                item._key,
                                {
                                  context: event.target.value,
                                }
                              )
                            }
                          />
                          <textarea
                            className={textareaClass()}
                            placeholder="Escreva a apresentação que será usada no bloco sobre/resumo."
                            value={item.body}
                            onChange={(event) =>
                              updateList<EditablePresentation>(
                                "presentations",
                                item._key,
                                {
                                  body: event.target.value,
                                }
                              )
                            }
                          />
                        </div>
                        <IconButton
                          label="Remover apresentação"
                          onClick={() =>
                            removeItem<EditablePresentation>("presentations", item._key)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>
              ),
            },
            {
              value: "experiencias",
              label: "Experiencias",
              count: profile.experiences.length,
              children: (
                <ListPanel
                  icon={<BriefcaseBusiness className="h-4 w-4" />}
                  count={profile.experiences.length}
                  label="experiencias"
                  addLabel="Experiencia"
                  onAdd={() =>
                    addItem<EditableExperience>("experiences", {
                      _key: key(),
                      company: "",
                      role: "",
                      description: "",
                      startDate: new Date().toISOString().slice(0, 10),
                      endDate: "",
                      current: true,
                      location: "",
                      logoUrl: "",
                    })
                  }
                >
                  {profile.experiences.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-4 p-4 md:grid-cols-[130px_1fr_auto]">
                        <div className="space-y-3">
                          <input
                            type="date"
                            className={inputClass()}
                            value={item.startDate}
                            onChange={(event) =>
                              updateList<EditableExperience>("experiences", item._key, {
                                startDate: event.target.value,
                              })
                            }
                          />
                          <input
                            type="date"
                            className={inputClass()}
                            value={item.endDate}
                            disabled={item.current}
                            onChange={(event) =>
                              updateList<EditableExperience>("experiences", item._key, {
                                endDate: event.target.value,
                              })
                            }
                          />
                          <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                            <input
                              type="checkbox"
                              checked={item.current}
                              onChange={(event) =>
                                updateList<EditableExperience>(
                                  "experiences",
                                  item._key,
                                  {
                                    current: event.target.checked,
                                  }
                                )
                              }
                            />
                            Atual
                          </label>
                        </div>
                        <div className="grid gap-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              className={inputClass()}
                              placeholder="Cargo"
                              value={item.role}
                              onChange={(event) =>
                                updateList<EditableExperience>(
                                  "experiences",
                                  item._key,
                                  {
                                    role: event.target.value,
                                  }
                                )
                              }
                            />
                            <input
                              className={inputClass()}
                              placeholder="Empresa"
                              value={item.company}
                              onChange={(event) =>
                                updateList<EditableExperience>(
                                  "experiences",
                                  item._key,
                                  {
                                    company: event.target.value,
                                  }
                                )
                              }
                            />
                          </div>
                          <textarea
                            className={textareaClass()}
                            placeholder="Resumo e impacto"
                            value={item.description}
                            onChange={(event) =>
                              updateList<EditableExperience>("experiences", item._key, {
                                description: event.target.value,
                              })
                            }
                          />
                          <input
                            className={inputClass()}
                            placeholder="Localizacao"
                            value={item.location}
                            onChange={(event) =>
                              updateList<EditableExperience>("experiences", item._key, {
                                location: event.target.value,
                              })
                            }
                          />
                        </div>
                        <IconButton
                          label="Remover experiencia"
                          onClick={() =>
                            removeItem<EditableExperience>("experiences", item._key)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>
              ),
            },
            {
              value: "projetos",
              label: "Projetos",
              count: profile.projects.length,
              children: (
                <ListPanel
                  icon={<FolderOpenDot className="h-4 w-4" />}
                  count={profile.projects.length}
                  label="projetos"
                  addLabel="Projeto"
                  onAdd={() =>
                    addItem<EditableProject>("projects", {
                      _key: key(),
                      title: "",
                      description: "",
                      imageUrl: "",
                      url: "",
                      repoUrl: "",
                      tagsText: "",
                      featured: false,
                      coverFitMode: "crop",
                      coverPositionX: 50,
                      coverPositionY: 50,
                      startDate: "",
                      endDate: "",
                    })
                  }
                >
                  {profile.projects.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-4 p-4 lg:grid-cols-[12rem_1fr_auto]">
                        <div className="space-y-2">
                          <div className="relative aspect-[7/5] overflow-hidden rounded-xl border border-neutral-200 bg-cyan-50">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full bg-white"
                                style={{
                                  objectFit: coverObjectFit(item.coverFitMode),
                                  objectPosition: `${item.coverPositionX}% ${item.coverPositionY}%`,
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                                <ImagePlus className="h-7 w-7" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openProfileGallery({
                                  kind: "projectCover",
                                  projectKey: item._key,
                                })
                              }
                              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-lime-50 hover:text-lime-800 disabled:pointer-events-none disabled:opacity-55"
                              title={item.imageUrl ? "Trocar capa" : "Adicionar capa"}
                              aria-label={
                                item.imageUrl
                                  ? "Trocar capa do projeto"
                                  : "Adicionar capa ao projeto"
                              }
                            >
                              <ImagePlus className="h-4 w-4" aria-hidden="true" />
                            </button>
                            {item.imageUrl ? (
                              <IconButton
                                label="Remover capa do projeto"
                                onClick={() => removeProjectCover(item._key)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </IconButton>
                            ) : null}
                            {(["fit", "fill", "crop"] as const).map((mode) => {
                              const Icon =
                                mode === "fit"
                                  ? Minimize2
                                  : mode === "fill"
                                    ? Maximize2
                                    : Crop;
                              const label =
                                mode === "fit"
                                  ? "Ajustar imagem inteira"
                                  : mode === "fill"
                                    ? "Preencher quadro"
                                    : "Recortar imagem";

                              return (
                                <button
                                  key={mode}
                                  type="button"
                                  aria-label={label}
                                  title={label}
                                  disabled={!item.imageUrl}
                                  onClick={() =>
                                    updateList<EditableProject>("projects", item._key, {
                                      coverFitMode: mode,
                                    })
                                  }
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                    item.coverFitMode === mode
                                      ? "border-lime-300 bg-lime-50 text-lime-900"
                                      : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
                                  } disabled:pointer-events-none disabled:opacity-40`}
                                >
                                  <Icon className="h-4 w-4" aria-hidden="true" />
                                </button>
                              );
                            })}
                          </div>
                          {item.imageUrl ? (
                            <div className="grid gap-2">
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={item.coverPositionX}
                                aria-label="Posicao horizontal da capa"
                                onChange={(event) =>
                                  updateList<EditableProject>("projects", item._key, {
                                    coverPositionX: clampPercent(
                                      Number(event.target.value)
                                    ),
                                  })
                                }
                                className="w-full accent-lime-500"
                              />
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={item.coverPositionY}
                                aria-label="Posicao vertical da capa"
                                onChange={(event) =>
                                  updateList<EditableProject>("projects", item._key, {
                                    coverPositionY: clampPercent(
                                      Number(event.target.value)
                                    ),
                                  })
                                }
                                className="w-full accent-lime-500"
                              />
                            </div>
                          ) : null}
                        </div>
                        <div className="grid gap-3">
                          <input
                            className={inputClass()}
                            placeholder="Titulo"
                            value={item.title}
                            onChange={(event) =>
                              updateList<EditableProject>("projects", item._key, {
                                title: event.target.value,
                              })
                            }
                          />
                          <textarea
                            className={textareaClass()}
                            placeholder="Resumo do projeto"
                            value={item.description}
                            onChange={(event) =>
                              updateList<EditableProject>("projects", item._key, {
                                description: event.target.value,
                              })
                            }
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              className={inputClass()}
                              placeholder="URL publica"
                              value={item.url}
                              onChange={(event) =>
                                updateList<EditableProject>("projects", item._key, {
                                  url: event.target.value,
                                })
                              }
                            />
                            <input
                              className={inputClass()}
                              placeholder="Repositorio"
                              value={item.repoUrl}
                              onChange={(event) =>
                                updateList<EditableProject>("projects", item._key, {
                                  repoUrl: event.target.value,
                                })
                              }
                            />
                          </div>
                          <input
                            className={inputClass()}
                            placeholder="Tags separadas por virgula"
                            value={item.tagsText}
                            onChange={(event) =>
                              updateList<EditableProject>("projects", item._key, {
                                tagsText: event.target.value,
                              })
                            }
                          />
                        </div>
                        <IconButton
                          label="Remover projeto"
                          onClick={() =>
                            removeItem<EditableProject>("projects", item._key)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>
              ),
            },
            {
              value: "reconhecimentos",
              label: "Reconhecimentos",
              count:
                profile.achievements.length +
                profile.highlights.length +
                profile.skills.length,
              children: (
                <div className="space-y-6">
                  <ListPanel
                    icon={<Medal className="h-4 w-4" />}
                    count={profile.highlights.length}
                    label="highlights"
                    addLabel="Highlight"
                    onAdd={() =>
                      addItem<EditableHighlight>("highlights", {
                        _key: key(),
                        title: "",
                        description: "",
                        metric: "",
                      })
                    }
                  >
                    {profile.highlights.map((item) => (
                      <CompactEditableRow
                        key={item._key}
                        title={item.title}
                        detail={item.description}
                        metric={item.metric}
                        onTitle={(value) =>
                          updateList<EditableHighlight>("highlights", item._key, {
                            title: value,
                          })
                        }
                        onDetail={(value) =>
                          updateList<EditableHighlight>("highlights", item._key, {
                            description: value,
                          })
                        }
                        onMetric={(value) =>
                          updateList<EditableHighlight>("highlights", item._key, {
                            metric: value,
                          })
                        }
                        onRemove={() =>
                          removeItem<EditableHighlight>("highlights", item._key)
                        }
                      />
                    ))}
                  </ListPanel>

                  <ListPanel
                    icon={<Medal className="h-4 w-4" />}
                    count={profile.achievements.length}
                    label="reconhecimentos"
                    addLabel="Reconhecimento"
                    onAdd={() =>
                      addItem<EditableAchievement>("achievements", {
                        _key: key(),
                        title: "",
                        description: "",
                        date: "",
                        metric: "",
                        imageUrl: "",
                      })
                    }
                  >
                    {profile.achievements.map((item) => (
                      <CompactEditableRow
                        key={item._key}
                        title={item.title}
                        detail={item.description}
                        metric={item.metric}
                        onTitle={(value) =>
                          updateList<EditableAchievement>("achievements", item._key, {
                            title: value,
                          })
                        }
                        onDetail={(value) =>
                          updateList<EditableAchievement>("achievements", item._key, {
                            description: value,
                          })
                        }
                        onMetric={(value) =>
                          updateList<EditableAchievement>("achievements", item._key, {
                            metric: value,
                          })
                        }
                        onRemove={() =>
                          removeItem<EditableAchievement>("achievements", item._key)
                        }
                      />
                    ))}
                  </ListPanel>

                  <ListPanel
                    icon={<Check className="h-4 w-4" />}
                    count={profile.skills.length}
                    label="skills"
                    addLabel="Skill"
                    onAdd={() =>
                      addItem<EditableSkill>("skills", {
                        _key: key(),
                        name: "",
                        category: "",
                        level: "",
                      })
                    }
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {profile.skills.map((item) => (
                        <Card key={item._key} className="rounded-[18px]">
                          <CardContent className="grid gap-3 p-4">
                            <input
                              className={inputClass()}
                              placeholder="Skill"
                              value={item.name}
                              onChange={(event) =>
                                updateList<EditableSkill>("skills", item._key, {
                                  name: event.target.value,
                                })
                              }
                            />
                            <input
                              className={inputClass()}
                              placeholder="Categoria"
                              value={item.category}
                              onChange={(event) =>
                                updateList<EditableSkill>("skills", item._key, {
                                  category: event.target.value,
                                })
                              }
                            />
                            <IconButton
                              label="Remover skill"
                              onClick={() =>
                                removeItem<EditableSkill>("skills", item._key)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ListPanel>
                </div>
              ),
            },
            {
              value: "links",
              label: "Links",
              count: profile.links.length,
              children: (
                <ListPanel
                  icon={<Link2 className="h-4 w-4" />}
                  count={profile.links.length}
                  label="links"
                  addLabel="Link"
                  onAdd={() =>
                    addItem<EditableLink>("links", {
                      _key: key(),
                      platform: "website",
                      label: "",
                      url: "",
                    })
                  }
                >
                  {profile.links.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-3 p-4 md:grid-cols-[140px_1fr_1fr_auto]">
                        <input
                          className={inputClass()}
                          placeholder="Tipo"
                          value={item.platform}
                          onChange={(event) =>
                            updateList<EditableLink>("links", item._key, {
                              platform: event.target.value,
                            })
                          }
                        />
                        <input
                          className={inputClass()}
                          placeholder="Label"
                          value={item.label}
                          onChange={(event) =>
                            updateList<EditableLink>("links", item._key, {
                              label: event.target.value,
                            })
                          }
                        />
                        <input
                          className={inputClass()}
                          placeholder="URL"
                          value={item.url}
                          onChange={(event) =>
                            updateList<EditableLink>("links", item._key, {
                              url: event.target.value,
                            })
                          }
                        />
                        <IconButton
                          label="Remover link"
                          onClick={() => removeItem<EditableLink>("links", item._key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>
              ),
            },
            {
              value: "reviews",
              label: "Reviews",
              count: profile.proofs.length,
              children: (
                <ListPanel
                  icon={<Star className="h-4 w-4" />}
                  count={profile.proofs.length}
                  label="reviews"
                  addLabel="Review"
                  onAdd={() =>
                    addItem<EditableProof>("proofs", {
                      _key: key(),
                      title: "",
                      description: "",
                      metric: "",
                      url: "",
                      imageUrl: "",
                      tagsText: "",
                      reviewerName: "",
                      reviewerRole: "",
                      reviewerEmail: "",
                      rating: 5,
                      isVisible: false,
                      source: "manual",
                    })
                  }
                >
                  {/* TODO: quando planos premium existirem, reviews ocultas devem aparecer aqui apenas para usuarios premium logados. */}
                  {profile.proofs.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                        <div className="grid gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-cream px-4 py-3">
                            <div>
                              <p className="text-sm font-bold text-ink">
                                {item.isVisible ? "Pública" : "Oculta"}
                              </p>
                              <p className="text-xs text-muted">
                                Reviews novas chegam ocultas até você aprovar.
                              </p>
                            </div>
                            <label className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                              <input
                                type="checkbox"
                                checked={item.isVisible}
                                onChange={(event) =>
                                  updateList<EditableProof>("proofs", item._key, {
                                    isVisible: event.target.checked,
                                  })
                                }
                              />
                              Mostrar no perfil público
                            </label>
                          </div>
                          <input
                            className={inputClass()}
                            placeholder="Nome de quem deixou a review"
                            value={item.reviewerName}
                            onChange={(event) =>
                              updateList<EditableProof>("proofs", item._key, {
                                reviewerName: event.target.value,
                                title: event.target.value,
                              })
                            }
                          />
                          <textarea
                            className={textareaClass()}
                            placeholder="Como foi trabalhar com você?"
                            value={item.description}
                            onChange={(event) =>
                              updateList<EditableProof>("proofs", item._key, {
                                description: event.target.value,
                              })
                            }
                          />
                          <div className="grid gap-3 sm:grid-cols-3">
                            <input
                              className={inputClass()}
                              placeholder="Cargo ou contexto"
                              value={item.reviewerRole}
                              onChange={(event) =>
                                updateList<EditableProof>("proofs", item._key, {
                                  reviewerRole: event.target.value,
                                  metric: event.target.value,
                                })
                              }
                            />
                            <input
                              className={inputClass()}
                              type="email"
                              placeholder="Email do avaliador"
                              value={item.reviewerEmail}
                              onChange={(event) =>
                                updateList<EditableProof>("proofs", item._key, {
                                  reviewerEmail: event.target.value,
                                })
                              }
                            />
                            <select
                              className={inputClass()}
                              value={item.rating}
                              onChange={(event) =>
                                updateList<EditableProof>("proofs", item._key, {
                                  rating: Number(event.target.value),
                                })
                              }
                            >
                              <option value={5}>5 estrelas</option>
                              <option value={4}>4 estrelas</option>
                              <option value={3}>3 estrelas</option>
                              <option value={2}>2 estrelas</option>
                              <option value={1}>1 estrela</option>
                            </select>
                          </div>
                        </div>
                        <IconButton
                          label="Remover review"
                          onClick={() => removeItem<EditableProof>("proofs", item._key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

function ListPanel({
  icon,
  count,
  label,
  addLabel,
  onAdd,
  children,
}: {
  icon: ReactNode;
  count: number;
  label: string;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <section>
      <SectionBar
        count={count}
        label={label}
        action={
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            {addLabel}
          </Button>
        }
      />
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600">
        {icon}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function CompactEditableRow({
  title,
  detail,
  metric,
  onTitle,
  onDetail,
  onMetric,
  onRemove,
}: {
  title: string;
  detail: string;
  metric: string;
  onTitle: (value: string) => void;
  onDetail: (value: string) => void;
  onMetric: (value: string) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="rounded-[20px]">
      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_160px_auto]">
        <input
          className={inputClass()}
          placeholder="Titulo"
          value={title}
          onChange={(event) => onTitle(event.target.value)}
        />
        <input
          className={inputClass()}
          placeholder="Descricao"
          value={detail}
          onChange={(event) => onDetail(event.target.value)}
        />
        <input
          className={inputClass()}
          placeholder="Metrica"
          value={metric}
          onChange={(event) => onMetric(event.target.value)}
        />
        <IconButton label="Remover" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </CardContent>
    </Card>
  );
}
