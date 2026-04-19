import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  FileText,
  Globe2,
  Layers3,
  Link2,
  Sparkles,
} from "lucide-react";

const proofBlocks = [
  { label: "Case", value: "+18% ativação", tone: "bg-lime-500 text-lime-900" },
  { label: "Projeto", value: "Checkout B2B", tone: "bg-cyan-100 text-cyan-900" },
  { label: "Prova", value: "Métrica + link", tone: "bg-green-100 text-green-900" },
];

const linkBlocks = [
  { icon: BriefcaseBusiness, label: "Experiência", value: "3 cargos selecionados" },
  { icon: Layers3, label: "Versão", value: "Product Lead" },
  { icon: Globe2, label: "Página", value: "publicada" },
  { icon: FileText, label: "Currículo", value: "modo leitura" },
];

export default function Hero() {
  return (
    <section className="soft-grid-bg px-3 pb-12 pt-9 sm:px-5 lg:pb-16">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div className="px-1 py-8 sm:py-12 lg:py-16">
          <p className="font-data text-xs font-semibold uppercase text-blue-700">
            Living professional evidence
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold leading-none text-neutral-950 sm:text-6xl lg:text-7xl">
            Mostre mais que um perfil.
          </h1>
          <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-neutral-700">
            Organize seu perfil, seus projetos e seus resultados em um so lugar.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="liquid-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold text-lime-900 transition-transform hover:-translate-y-0.5"
            >
              Criar meu FolioTree
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white/70 px-6 py-3 text-base font-bold text-neutral-900 shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              Entrar
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {["Perfil", "Versões", "Páginas", "Currículo"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-blue-100 bg-white/72 px-3 py-1.5 font-data text-xs font-semibold text-neutral-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-[2rem] bg-blue-500 p-4 text-white shadow-2xl shadow-blue-900/18 sm:p-6 lg:min-h-[650px]">
      <div className="flex items-center justify-between gap-4">
        <span className="font-data text-xs font-semibold uppercase text-white/76">
          foliotree.com/@ana
        </span>
        <span className="rounded-full bg-lime-500 px-3 py-1 font-data text-xs font-bold uppercase text-lime-900">
          ao vivo
        </span>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.86fr]">
        <div className="glass-panel rounded-[1.5rem] p-5 text-neutral-950">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime-500 font-display text-2xl font-extrabold text-lime-900">
              AC
            </div>
            <div className="min-w-0">
              <p className="font-display text-2xl font-extrabold">Ana Corrêa</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-neutral-600">
                Designer de produto que transforma sistemas complexos em experiências
                claras.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {linkBlocks.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3"
              >
                <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-950">{label}</p>
                  <p className="text-xs font-medium text-neutral-500">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {proofBlocks.map((block) => (
            <div
              key={block.label}
              className={`${block.tone} rounded-[1.25rem] p-4 shadow-lg shadow-blue-950/10`}
            >
              <p className="font-data text-xs font-bold uppercase">{block.label}</p>
              <p className="mt-2 font-display text-2xl font-extrabold leading-tight">
                {block.value}
              </p>
            </div>
          ))}
          <div className="rounded-[1.25rem] border border-white/24 bg-white/14 p-4 backdrop-blur">
            <Sparkles className="h-5 w-5 text-lime-500" aria-hidden="true" />
            <p className="mt-4 font-display text-3xl font-extrabold leading-tight text-lime-500">
              Seu trabalho, com contexto.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/24 bg-white/14 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-lime-500" aria-hidden="true" />
            <p className="text-sm font-semibold text-white/86">
              Um link simples para compartilhar seu trabalho.
            </p>
          </div>
          <div className="flex items-center gap-2 font-data text-xs font-semibold uppercase text-white/70">
            <Link2 className="h-4 w-4" aria-hidden="true" />
            pronto para enviar
          </div>
        </div>
      </div>
    </div>
  );
}



