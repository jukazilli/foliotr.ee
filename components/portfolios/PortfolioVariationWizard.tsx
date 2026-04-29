"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  FileText,
  ImageIcon,
  LayoutTemplate,
  Save,
  Upload,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AssetGalleryPicker,
  type GalleryImageAsset,
} from "@/components/assets/AssetGalleryPicker";
import { cn } from "@/lib/utils";

type WizardTemplate = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  category: string;
};

type VersionCollectionItem = {
  id: string;
  title: string;
  subtitle?: string | null;
};

type VersionCollections = {
  experiences: VersionCollectionItem[];
  educations: VersionCollectionItem[];
  projects: VersionCollectionItem[];
  skills: VersionCollectionItem[];
  achievements: VersionCollectionItem[];
  proofs: VersionCollectionItem[];
  highlights: VersionCollectionItem[];
  links: VersionCollectionItem[];
};

type VersionSelectionValues = {
  experienceIds: string[];
  educationIds: string[];
  projectIds: string[];
  skillIds: string[];
  achievementIds: string[];
  proofIds: string[];
  highlightIds: string[];
  linkIds: string[];
};

type WizardInitialValues = {
  versionName: string;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  avatarUrl: string;
  bannerUrl: string;
  slug: string;
  publicHref: string | null;
  templateId: string;
  publishState: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  collections: VersionCollections;
  selections: VersionSelectionValues;
};

type PortfolioVariationWizardProps = {
  initialValues: WizardInitialValues;
  templates: WizardTemplate[];
  saveAction: (formData: FormData) => void;
  saved?: boolean;
  published?: boolean;
  error?: string;
};

const steps = [
  { id: "cover", label: "Capa", icon: ImageIcon },
  { id: "identity", label: "Identidade", icon: UserRound },
  { id: "data", label: "Dados", icon: FileText },
  { id: "template", label: "Tema", icon: LayoutTemplate },
  { id: "publish", label: "Publicar", icon: Check },
] as const;

type StepId = (typeof steps)[number]["id"];

function inputClassName() {
  return "w-full rounded-xl border-2 border-line bg-white px-3 py-2 text-sm font-semibold text-ink outline-none transition focus:border-black";
}

type TextFieldName =
  | "versionName"
  | "displayName"
  | "headline"
  | "bio"
  | "location"
  | "avatarUrl"
  | "bannerUrl"
  | "slug";

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: TextFieldName;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-extrabold text-ink">
      {label}
      <input
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClassName()}
      />
    </label>
  );
}

export function PortfolioVariationWizard({
  initialValues,
  templates,
  saveAction,
  saved,
  published,
  error,
}: PortfolioVariationWizardProps) {
  const [activeStep, setActiveStep] = useState<StepId>("cover");
  const [values, setValues] = useState(initialValues);
  const [selections, setSelections] = useState(initialValues.selections);
  const [pickerTarget, setPickerTarget] = useState<"avatarUrl" | "bannerUrl" | null>(
    null
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === values.templateId) ?? null,
    [templates, values.templateId]
  );

  function setField<Key extends keyof WizardInitialValues>(
    key: Key,
    value: WizardInitialValues[Key]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function applyAsset(asset: GalleryImageAsset) {
    if (!pickerTarget) return;
    setField(pickerTarget, asset.url);
    setPickerTarget(null);
  }

  function toggleSelection(
    key: keyof VersionSelectionValues,
    id: string,
    checked: boolean
  ) {
    setSelections((current) => {
      const currentIds = current[key];
      const nextIds = checked
        ? Array.from(new Set([...currentIds, id]))
        : currentIds.filter((itemId) => itemId !== id);

      return { ...current, [key]: nextIds };
    });
  }

  function renderCollection(
    label: string,
    key: keyof VersionCollections,
    selectionKey: keyof VersionSelectionValues
  ) {
    const items = values.collections[key];
    const selected = new Set(selections[selectionKey]);

    return (
      <section className="rounded-2xl border-2 border-line bg-cream p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-black text-ink">{label}</h3>
          <span className="rounded-full border-2 border-line bg-white px-2 py-1 text-xs font-black text-ink">
            {selected.size}/{items.length}
          </span>
        </div>

        {items.length > 0 ? (
          <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto pr-1">
            {items.map((item) => {
              const checked = selected.has(item.id);

              return (
                <label
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border-2 border-line bg-white p-3 text-sm font-bold text-ink"
                >
                  <input
                    type="checkbox"
                    name={selectionKey}
                    value={item.id}
                    checked={checked}
                    onChange={(event) =>
                      toggleSelection(selectionKey, item.id, event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-black"
                  />
                  <span className="min-w-0">
                    <span className="block overflow-wrap-anywhere">{item.title}</span>
                    {item.subtitle ? (
                      <span className="mt-1 block overflow-wrap-anywhere text-xs font-semibold text-ink/60">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-ink/60">
            Nenhum item no perfil mestre.
          </p>
        )}
      </section>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/portfolios">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Portfolios
          </Link>
        </Button>

        {values.publicHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={values.publicHref} target="_blank">
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ver publico
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mb-5 overflow-hidden rounded-2xl border-2 border-line bg-white shadow-app">
        <div className="relative h-52 border-b-2 border-line bg-cream md:h-64">
          {values.bannerUrl ? (
            <Image
              src={values.bannerUrl}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center bg-cream text-ink/40">
              <ImageIcon className="h-10 w-10" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 px-5 pb-5 pt-0 md:flex-row md:items-end md:justify-between">
          <div className="-mt-12 flex items-end gap-4">
            <button
              type="button"
              onClick={() => setPickerTarget("avatarUrl")}
              className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-white bg-cream shadow-app"
              aria-label="Trocar foto da variacao"
            >
              {values.avatarUrl ? (
                <Image
                  src={values.avatarUrl}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <UserRound className="h-12 w-12 text-ink/50" aria-hidden="true" />
              )}
            </button>
            <div className="pb-2">
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-ink/50">
                Variacao
              </p>
              <h1 className="font-display text-3xl font-black text-ink md:text-4xl">
                {values.headline || values.versionName || "Portfolio"}
              </h1>
              <p className="mt-1 text-sm font-bold text-ink/70">
                {selectedTemplate?.name ?? "Sem tema selecionado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {saved || published || error ? (
        <div
          className={cn(
            "mb-5 rounded-xl border-2 px-4 py-3 text-sm font-extrabold",
            error
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-line bg-[#dcfce7] text-ink"
          )}
        >
          {error
            ? "Nao foi possivel concluir a acao. Revise template e slug."
            : published
              ? "Variacao publicada."
              : "Rascunho salvo."}
        </div>
      ) : null}

      <form action={saveAction} className="grid gap-5">
        <input type="hidden" name="avatarUrl" value={values.avatarUrl} />
        <input type="hidden" name="bannerUrl" value={values.bannerUrl} />
        <input type="hidden" name="templateId" value={values.templateId} />
        <input type="hidden" name="versionName" value={values.versionName} />
        <input type="hidden" name="displayName" value={values.displayName} />
        <input type="hidden" name="headline" value={values.headline} />
        <input type="hidden" name="bio" value={values.bio} />
        <input type="hidden" name="location" value={values.location} />
        <input type="hidden" name="slug" value={values.slug} />

        <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-line bg-white p-2 shadow-app">
          {steps.map((step) => {
            const Icon = step.icon;
            const active = activeStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold transition",
                  active ? "bg-pink text-ink" : "bg-white text-ink/60 hover:bg-cream"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {step.label}
              </button>
            );
          })}
        </div>

        <section className="rounded-2xl border-2 border-line bg-white p-5 shadow-app">
          {activeStep === "cover" ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <div className="overflow-hidden rounded-2xl border-2 border-line bg-cream">
                <div className="relative aspect-[16/7] min-h-56">
                  {values.bannerUrl ? (
                    <Image
                      src={values.bannerUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-ink/40">
                      <ImageIcon className="h-12 w-12" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-ink/50">
                    Capa da versão
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-black text-ink">
                    Imagem do carrossel
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-ink/70">
                    Esta capa aparece no card público desta versão e não altera a capa
                    do perfil base.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPickerTarget("bannerUrl")}
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Trocar capa
                  </Button>
                  {values.bannerUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setField("bannerUrl", "")}
                    >
                      Remover capa
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {activeStep === "identity" ? (
            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  label="Fallback do nome"
                  name="versionName"
                  value={values.versionName}
                  onChange={(value) => setField("versionName", value)}
                  placeholder="Usado se o cargo estiver vazio"
                />
                <TextField
                  label="Cargo exibido"
                  name="headline"
                  value={values.headline}
                  onChange={(value) => setField("headline", value)}
                  placeholder="Cargo ou posicionamento"
                />
                <TextField
                  label="Nome exibido"
                  name="displayName"
                  value={values.displayName}
                  onChange={(value) => setField("displayName", value)}
                  placeholder="Nome público desta variação"
                />
                <TextField
                  label="Cidade"
                  name="location"
                  value={values.location}
                  onChange={(value) => setField("location", value)}
                  placeholder="Cidade/UF"
                />
              </div>

              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-ink/50">
                  Dados do perfil mestre
                </p>
                <h2 className="mt-1 font-display text-2xl font-black text-ink">
                  Escolha o que entra nesta versão
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {renderCollection("Experiências", "experiences", "experienceIds")}
                {renderCollection("Formação", "educations", "educationIds")}
                {renderCollection("Projetos", "projects", "projectIds")}
                {renderCollection("Reconhecimentos", "achievements", "achievementIds")}
                {renderCollection("Skills", "skills", "skillIds")}
                {renderCollection("Reviews", "proofs", "proofIds")}
                {renderCollection("Destaques", "highlights", "highlightIds")}
                {renderCollection("Links", "links", "linkIds")}
              </div>
            </div>
          ) : null}

          {activeStep === "data" ? (
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-extrabold text-ink">
                Sobre esta variacao
                <textarea
                  name="bio"
                  value={values.bio}
                  onChange={(event) => setField("bio", event.target.value)}
                  rows={7}
                  className={cn(inputClassName(), "resize-y")}
                  placeholder="Resumo orientado para esta versao do portfolio"
                />
              </label>
              <TextField
                label="Slug publico"
                name="slug"
                value={values.slug}
                onChange={(value) => setField("slug", value)}
                placeholder="minha-versao"
              />
            </div>
          ) : null}

          {activeStep === "template" ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((template) => {
                const active = values.templateId === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setField("templateId", template.id)}
                    className={cn(
                      "min-h-32 rounded-2xl border-2 p-4 text-left transition",
                      active
                        ? "border-black bg-pink shadow-app"
                        : "border-line bg-white hover:bg-cream"
                    )}
                  >
                    <span className="font-mono text-xs font-black uppercase text-ink/50">
                      {template.category}
                    </span>
                    <strong className="mt-2 block font-display text-xl font-black text-ink">
                      {template.name}
                    </strong>
                    <span className="mt-2 block text-sm font-semibold text-ink/70">
                      {template.summary || template.slug}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {activeStep === "publish" ? (
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <h2 className="font-display text-2xl font-black text-ink">
                  Finalizar variacao
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold text-ink/70">
                  Salvar rascunho atualiza apenas esta variacao. Publicar atualiza o
                  link publico e o curriculo gerados por ela.
                </p>
                <div className="mt-4 rounded-xl border-2 border-line bg-cream p-3 text-sm font-bold text-ink">
                  Status atual:{" "}
                  {values.publishState === "PUBLISHED" ? "publicado" : "rascunho"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button type="submit" name="intent" value="draft" variant="outline">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Salvar rascunho
                </Button>
                <Button type="submit" name="intent" value="publish">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Publicar
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      </form>

      <AssetGalleryPicker
        open={pickerTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPickerTarget(null);
        }}
        uploadPurpose="portfolio"
        title={pickerTarget === "bannerUrl" ? "Selecionar capa" : "Selecionar foto"}
        description="Use uma imagem da galeria ou envie uma nova para esta variacao."
        onSelect={applyAsset}
      />
    </>
  );
}
