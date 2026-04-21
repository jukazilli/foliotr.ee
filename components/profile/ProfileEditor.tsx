"use client";

import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ExternalLink,
  FolderOpenDot,
  GraduationCap,
  Link2,
  Medal,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  coverFitMode: "fit" | "fill" | "crop";
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
type UploadStatus = "idle" | "uploading";

type StoredProfilePhoto = {
  dataUrl: string;
  name: string;
  type: string;
  size: number;
};

const PROFILE_PHOTO_MAX_SIZE = 5 * 1024 * 1024;
const PROFILE_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function key() {
  return `tmp_${Math.random().toString(36).slice(2, 10)}`;
}

function persistedId(id?: string) {
  return id && !id.startsWith("tmp_") ? id : undefined;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
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
  if (raw.startsWith("/api/assets/proxy?key=")) return raw;
  return cleanUrl(raw);
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
  highlights: "Highlights",
  experiences: "Experiencias",
  educations: "Formacao",
  skills: "Skills",
  projects: "Projetos",
  achievements: "Reconhecimentos",
  proofs: "Provas",
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
  proofs: "Prova",
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
    avatarUrl: text(profile.avatarUrl),
    headline: text(profile.headline),
    bio: text(profile.bio),
    location: text(profile.location),
    pronouns: text(profile.pronouns),
    websiteUrl: text(profile.websiteUrl),
    publicEmail: text(profile.publicEmail),
    phone: text(profile.phone),
    birthDate: toDateInput(profile.birthDate),
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
      coverFitMode:
        item.coverFitMode === "fit" || item.coverFitMode === "fill" || item.coverFitMode === "crop"
          ? item.coverFitMode
          : "crop",
      coverPositionX: typeof item.coverPositionX === "number" ? item.coverPositionX : 50,
      coverPositionY: typeof item.coverPositionY === "number" ? item.coverPositionY : 50,
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
      assetId: item.assetId ?? null,
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
        {meta ? <span className="font-data text-[10px] uppercase tracking-[0.16em] text-neutral-400">{meta}</span> : null}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20";
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

export function ProfileEditor({ initialProfile }: { initialProfile: EditableProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(() => normalizeProfile(initialProfile));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<StoredProfilePhoto | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [dirtyCollections, setDirtyCollections] = useState<Set<CollectionField>>(() => new Set());

  const username = profile.user.username;
  const age = useMemo(() => {
    if (!profile.birthDate) return null;
    const birthDate = new Date(`${profile.birthDate}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) return null;

    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      years -= 1;
    }

    return years >= 0 ? years : null;
  }, [profile.birthDate]);

  function setBase<K extends keyof EditableProfile>(field: K, value: EditableProfile[K]) {
    setProfile((current) => ({ ...current, [field]: value }));
    setStatus("idle");
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

  function removeItem<T extends { _key: string }>(field: keyof EditableProfile, keyValue: string) {
    setProfile((current) => ({
      ...current,
      [field]: (current[field] as unknown as T[]).filter((item) => item._key !== keyValue),
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

    const baseBody = (await baseResponse.json()) as { profile: Partial<EditableProfile> };
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

    setProfile((current) => normalizeProfile({ ...current, ...profilePatch } as EditableProfile));
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

  const photoPreview = profilePhoto?.dataUrl || profile.avatarUrl || "";

  function removeProfilePhoto() {
    setProfilePhoto(null);
    setBase("avatarUrl", "" as EditableProfile["avatarUrl"]);
    setPhotoError("");
  }

  async function uploadProfilePhoto(file: File) {
    setUploadStatus("uploading");

    const formData = new FormData();
    formData.set("file", file);
    formData.set("purpose", "avatar");

    const response = await fetch("/api/assets/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(formatApiError(body));
    }

    const body = (await response.json()) as {
      asset: { url: string };
      profile?: { avatarUrl?: string | null };
    };
    const avatarUrl = body.profile?.avatarUrl ?? body.asset.url;

    setProfilePhoto(null);
    setBase("avatarUrl", avatarUrl as EditableProfile["avatarUrl"]);
    setPhotoError("");
    setStatus("saved");
    router.refresh();
  }

  function handleProfilePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!PROFILE_PHOTO_TYPES.includes(file.type)) {
      setPhotoError("Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > PROFILE_PHOTO_MAX_SIZE) {
      setPhotoError("A foto deve ter ate 5 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setPhotoError("Nao foi possivel abrir a foto.");
        return;
      }

      const nextPhoto: StoredProfilePhoto = {
        dataUrl: result,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      setProfilePhoto(nextPhoto);
      setPhotoError("");
      void uploadProfilePhoto(file)
        .catch((error: unknown) => {
          setProfilePhoto(null);
          setPhotoError(error instanceof Error ? error.message : "Nao foi possivel enviar a foto.");
        })
        .finally(() => {
          setUploadStatus("idle");
        });
    };

    reader.onerror = () => {
      setPhotoError("Nao foi possivel abrir a foto.");
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-data text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
            Perfil base
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950 sm:text-[2.5rem]">
            {profile.displayName || profile.user.name || "Seu perfil"}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="default">{profile.educations.length} formacoes</Badge>
            <Badge variant="info">{profile.experiences.length} experiencias</Badge>
            <Badge variant="version">{profile.projects.length} projetos</Badge>
            <Badge variant="premium">
              {profile.proofs.length + profile.achievements.length + profile.highlights.length} provas
            </Badge>
            <Badge variant="warning">{profile.versions.length} versoes</Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {username ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/${username}`} target="_blank">
                  Template visual
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
            {status === "saved" ? <Check className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {saveLabel}
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-coral-100 bg-coral-50 px-4 py-3 text-sm font-medium text-coral-900">
          {error}
        </div>
      ) : null}

      <ProfileTabs
        tabs={[
          {
            value: "dados",
            label: "Dados basicos",
            count: 1,
            children: (
              <div className="mx-auto max-w-3xl">
                <Card className="rounded-[24px]">
                  <CardContent className="space-y-5 p-5">
                    <div className="grid gap-4 rounded-[20px] border border-neutral-200 bg-neutral-50 p-4 sm:grid-cols-[120px_1fr] sm:items-center">
                      <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white">
                        {photoPreview ? (
                          <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserRound className="h-10 w-10 text-neutral-400" aria-hidden />
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">Foto</p>
                          <p className="mt-1 text-sm text-neutral-600">
                            {photoPreview ? "Preview atualizado." : "Adicione uma foto."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50">
                            {uploadStatus === "uploading"
                              ? "Enviando..."
                              : photoPreview
                                ? "Trocar foto"
                                : "Adicionar foto"}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              disabled={uploadStatus === "uploading"}
                              onChange={handleProfilePhotoChange}
                            />
                          </label>

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
                          <p className="text-sm font-medium text-coral-800">{photoError}</p>
                        ) : null}
                      </div>
                    </div>

                    <Field label="Nome de exibicao">
                      <input className={inputClass()} value={profile.displayName ?? ""} onChange={onInput("displayName")} />
                    </Field>
                    <Field label="Handle" meta="URL publica">
                      <div className="flex items-center rounded-xl border border-neutral-200 bg-white pl-3">
                        <span className="font-data text-xs text-neutral-400">foliotree.com/@</span>
                        <input className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-neutral-700 outline-none" value={username ?? ""} readOnly />
                      </div>
                    </Field>
                    <Field label="Headline" meta="template e curriculo">
                      <input className={inputClass()} value={profile.headline ?? ""} onChange={onInput("headline")} />
                    </Field>
                    <Field label="Bio curta">
                      <textarea className={textareaClass()} value={profile.bio ?? ""} onChange={onInput("bio")} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Localizacao">
                        <input className={inputClass()} value={profile.location ?? ""} onChange={onInput("location")} />
                      </Field>
                      <Field label="Pronomes">
                        <input className={inputClass()} value={profile.pronouns ?? ""} onChange={onInput("pronouns")} />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Email publico">
                        <input className={inputClass()} value={profile.publicEmail ?? ""} onChange={onInput("publicEmail")} />
                      </Field>
                      <Field label="Telefone">
                        <input className={inputClass()} value={profile.phone ?? ""} onChange={onInput("phone")} />
                      </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Data de nascimento">
                        <input
                          type="date"
                          className={inputClass()}
                          value={profile.birthDate ?? ""}
                          onChange={(event) => setBase("birthDate", event.target.value)}
                        />
                      </Field>
                      <Field label="Idade" meta="calculada automaticamente">
                        <div className="flex h-[42px] items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-700">
                          {age !== null ? `${age} anos` : "Nao informada"}
                        </div>
                      </Field>
                    </div>
                    <Field label="Site">
                      <input className={inputClass()} value={profile.websiteUrl ?? ""} onChange={onInput("websiteUrl")} />
                    </Field>
                  </CardContent>
                </Card>
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
                        <input type="date" className={inputClass()} value={item.startDate} onChange={(event) => updateList<EditableEducation>("educations", item._key, { startDate: event.target.value })} />
                        <input type="date" className={inputClass()} value={item.endDate} disabled={item.current} onChange={(event) => updateList<EditableEducation>("educations", item._key, { endDate: event.target.value })} />
                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                          <input type="checkbox" checked={item.current} onChange={(event) => updateList<EditableEducation>("educations", item._key, { current: event.target.checked })} />
                          Atual
                        </label>
                      </div>
                      <div className="grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className={inputClass()} placeholder="Instituicao" value={item.institution} onChange={(event) => updateList<EditableEducation>("educations", item._key, { institution: event.target.value })} />
                          <input className={inputClass()} placeholder="Curso ou grau" value={item.degree} onChange={(event) => updateList<EditableEducation>("educations", item._key, { degree: event.target.value })} />
                        </div>
                        <input className={inputClass()} placeholder="Area de estudo" value={item.field} onChange={(event) => updateList<EditableEducation>("educations", item._key, { field: event.target.value })} />
                        <textarea className={textareaClass()} placeholder="Resumo da formacao, enfase, projetos ou conquistas" value={item.description} onChange={(event) => updateList<EditableEducation>("educations", item._key, { description: event.target.value })} />
                        <input className={inputClass()} placeholder="Logo da instituicao" value={item.logoUrl} onChange={(event) => updateList<EditableEducation>("educations", item._key, { logoUrl: event.target.value })} />
                      </div>
                      <IconButton label="Remover formacao" onClick={() => removeItem<EditableEducation>("educations", item._key)}>
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
                        <input type="date" className={inputClass()} value={item.startDate} onChange={(event) => updateList<EditableExperience>("experiences", item._key, { startDate: event.target.value })} />
                        <input type="date" className={inputClass()} value={item.endDate} disabled={item.current} onChange={(event) => updateList<EditableExperience>("experiences", item._key, { endDate: event.target.value })} />
                        <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                          <input type="checkbox" checked={item.current} onChange={(event) => updateList<EditableExperience>("experiences", item._key, { current: event.target.checked })} />
                          Atual
                        </label>
                      </div>
                      <div className="grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className={inputClass()} placeholder="Cargo" value={item.role} onChange={(event) => updateList<EditableExperience>("experiences", item._key, { role: event.target.value })} />
                          <input className={inputClass()} placeholder="Empresa" value={item.company} onChange={(event) => updateList<EditableExperience>("experiences", item._key, { company: event.target.value })} />
                        </div>
                        <textarea className={textareaClass()} placeholder="Resumo e impacto" value={item.description} onChange={(event) => updateList<EditableExperience>("experiences", item._key, { description: event.target.value })} />
                        <input className={inputClass()} placeholder="Localizacao" value={item.location} onChange={(event) => updateList<EditableExperience>("experiences", item._key, { location: event.target.value })} />
                      </div>
                      <IconButton label="Remover experiencia" onClick={() => removeItem<EditableExperience>("experiences", item._key)}>
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
                    <CardContent className="grid gap-4 p-4 md:grid-cols-[96px_1fr_auto]">
                      <div className="h-20 overflow-hidden rounded-xl bg-cyan-50">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="grid gap-3">
                        <input className={inputClass()} placeholder="Titulo" value={item.title} onChange={(event) => updateList<EditableProject>("projects", item._key, { title: event.target.value })} />
                        <textarea className={textareaClass()} placeholder="Resumo do projeto" value={item.description} onChange={(event) => updateList<EditableProject>("projects", item._key, { description: event.target.value })} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className={inputClass()} placeholder="URL publica" value={item.url} onChange={(event) => updateList<EditableProject>("projects", item._key, { url: event.target.value })} />
                          <input className={inputClass()} placeholder="Repositorio" value={item.repoUrl} onChange={(event) => updateList<EditableProject>("projects", item._key, { repoUrl: event.target.value })} />
                        </div>
                        <input className={inputClass()} placeholder="Imagem" value={item.imageUrl} onChange={(event) => updateList<EditableProject>("projects", item._key, { imageUrl: event.target.value })} />
                        <input className={inputClass()} placeholder="Tags separadas por virgula" value={item.tagsText} onChange={(event) => updateList<EditableProject>("projects", item._key, { tagsText: event.target.value })} />
                      </div>
                      <IconButton label="Remover projeto" onClick={() => removeItem<EditableProject>("projects", item._key)}>
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
            count: profile.achievements.length + profile.highlights.length + profile.skills.length,
            children: (
              <div className="space-y-6">
                <ListPanel
                  icon={<Medal className="h-4 w-4" />}
                  count={profile.highlights.length}
                  label="highlights"
                  addLabel="Highlight"
                  onAdd={() => addItem<EditableHighlight>("highlights", { _key: key(), title: "", description: "", metric: "" })}
                >
                  {profile.highlights.map((item) => (
                    <CompactEditableRow key={item._key} title={item.title} detail={item.description} metric={item.metric} onTitle={(value) => updateList<EditableHighlight>("highlights", item._key, { title: value })} onDetail={(value) => updateList<EditableHighlight>("highlights", item._key, { description: value })} onMetric={(value) => updateList<EditableHighlight>("highlights", item._key, { metric: value })} onRemove={() => removeItem<EditableHighlight>("highlights", item._key)} />
                  ))}
                </ListPanel>

                <ListPanel
                  icon={<Medal className="h-4 w-4" />}
                  count={profile.achievements.length}
                  label="reconhecimentos"
                  addLabel="Reconhecimento"
                  onAdd={() => addItem<EditableAchievement>("achievements", { _key: key(), title: "", description: "", date: "", metric: "", imageUrl: "" })}
                >
                  {profile.achievements.map((item) => (
                    <CompactEditableRow key={item._key} title={item.title} detail={item.description} metric={item.metric} onTitle={(value) => updateList<EditableAchievement>("achievements", item._key, { title: value })} onDetail={(value) => updateList<EditableAchievement>("achievements", item._key, { description: value })} onMetric={(value) => updateList<EditableAchievement>("achievements", item._key, { metric: value })} onRemove={() => removeItem<EditableAchievement>("achievements", item._key)} />
                  ))}
                </ListPanel>

                <ListPanel
                  icon={<Check className="h-4 w-4" />}
                  count={profile.skills.length}
                  label="skills"
                  addLabel="Skill"
                  onAdd={() => addItem<EditableSkill>("skills", { _key: key(), name: "", category: "", level: "" })}
                >
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.skills.map((item) => (
                      <Card key={item._key} className="rounded-[18px]">
                        <CardContent className="grid gap-3 p-4">
                          <input className={inputClass()} placeholder="Skill" value={item.name} onChange={(event) => updateList<EditableSkill>("skills", item._key, { name: event.target.value })} />
                          <input className={inputClass()} placeholder="Categoria" value={item.category} onChange={(event) => updateList<EditableSkill>("skills", item._key, { category: event.target.value })} />
                          <IconButton label="Remover skill" onClick={() => removeItem<EditableSkill>("skills", item._key)}>
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
            label: "Links & provas",
            count: profile.links.length + profile.proofs.length,
            children: (
              <div className="space-y-6">
                <ListPanel
                  icon={<Link2 className="h-4 w-4" />}
                  count={profile.links.length}
                  label="links"
                  addLabel="Link"
                  onAdd={() => addItem<EditableLink>("links", { _key: key(), platform: "website", label: "", url: "" })}
                >
                  {profile.links.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-3 p-4 md:grid-cols-[140px_1fr_1fr_auto]">
                        <input className={inputClass()} placeholder="Tipo" value={item.platform} onChange={(event) => updateList<EditableLink>("links", item._key, { platform: event.target.value })} />
                        <input className={inputClass()} placeholder="Label" value={item.label} onChange={(event) => updateList<EditableLink>("links", item._key, { label: event.target.value })} />
                        <input className={inputClass()} placeholder="URL" value={item.url} onChange={(event) => updateList<EditableLink>("links", item._key, { url: event.target.value })} />
                        <IconButton label="Remover link" onClick={() => removeItem<EditableLink>("links", item._key)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>

                <ListPanel
                  icon={<ExternalLink className="h-4 w-4" />}
                  count={profile.proofs.length}
                  label="provas"
                  addLabel="Prova"
                  onAdd={() => addItem<EditableProof>("proofs", { _key: key(), title: "", description: "", metric: "", url: "", imageUrl: "", tagsText: "" })}
                >
                  {profile.proofs.map((item) => (
                    <Card key={item._key} className="rounded-[20px]">
                      <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                        <div className="grid gap-3">
                          <input className={inputClass()} placeholder="Titulo da prova" value={item.title} onChange={(event) => updateList<EditableProof>("proofs", item._key, { title: event.target.value })} />
                          <textarea className={textareaClass()} placeholder="Contexto" value={item.description} onChange={(event) => updateList<EditableProof>("proofs", item._key, { description: event.target.value })} />
                          <div className="grid gap-3 sm:grid-cols-3">
                            <input className={inputClass()} placeholder="Metrica" value={item.metric} onChange={(event) => updateList<EditableProof>("proofs", item._key, { metric: event.target.value })} />
                            <input className={inputClass()} placeholder="URL" value={item.url} onChange={(event) => updateList<EditableProof>("proofs", item._key, { url: event.target.value })} />
                            <input className={inputClass()} placeholder="Tags" value={item.tagsText} onChange={(event) => updateList<EditableProof>("proofs", item._key, { tagsText: event.target.value })} />
                          </div>
                        </div>
                        <IconButton label="Remover prova" onClick={() => removeItem<EditableProof>("proofs", item._key)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  ))}
                </ListPanel>
              </div>
            ),
          },
        ]}
      />
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
        <input className={inputClass()} placeholder="Titulo" value={title} onChange={(event) => onTitle(event.target.value)} />
        <input className={inputClass()} placeholder="Descricao" value={detail} onChange={(event) => onDetail(event.target.value)} />
        <input className={inputClass()} placeholder="Metrica" value={metric} onChange={(event) => onMetric(event.target.value)} />
        <IconButton label="Remover" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </CardContent>
    </Card>
  );
}
