import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Globe2, Layers3 } from "lucide-react";

const proofBlocks = [
  { label: "Case", value: "+18% ativacao", tone: "bg-coral-100 text-coral-900" },
  { label: "Projeto", value: "Checkout B2B", tone: "bg-cyan-100 text-cyan-900" },
  { label: "Prova", value: "Metrica + link", tone: "bg-violet-100 text-violet-900" },
];

const linkBlocks = [
  { icon: BriefcaseBusiness, label: "Experiencia", value: "3 cargos selecionados" },
  { icon: Layers3, label: "Versao", value: "Product Lead" },
  { icon: Globe2, label: "Pagina", value: "publicada" },
  { icon: FileText, label: "Curriculo", value: "modo leitura" },
];

export default function Hero() {
  return (
    <section className="bg-lime-500 px-4 pb-16 pt-5 sm:px-6 lg:pb-24">
      <div className="mx-auto grid max-w-[97rem] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-12">
        <div className="px-2 py-8 sm:px-4 sm:py-12 lg:py-16">
          <p className="font-ui text-sm font-bold uppercase tracking-[0.08em] text-lime-900/78">
            Living professional evidence
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.6rem,8vw,7.15rem)] font-[900] leading-[0.9] tracking-[-0.06em] text-lime-900">
            Mostre mais que um perfil.
          </h1>
          <p className="mt-7 max-w-[36rem] text-[1.32rem] font-medium leading-[1.42] tracking-[-0.01em] text-lime-900">
            Organize seu perfil, seus projetos e seus resultados em um so lugar.
          </p>

          <div className="mt-9 flex max-w-[40rem] flex-col gap-3 sm:flex-row">
            <div className="flex h-[4.8rem] items-center rounded-2xl bg-white px-5 text-[1.12rem] font-medium text-neutral-500 shadow-[0_10px_30px_rgba(15,17,21,0.08)] sm:min-w-[19rem] sm:flex-1">
              foliotree/
            </div>
            <Link
              href="/register"
              className="inline-flex h-[4.8rem] items-center justify-center gap-2 rounded-full bg-lime-900 px-8 text-[1.12rem] font-semibold text-white transition-colors hover:bg-lime-800 sm:min-w-[18rem]"
            >
              Criar conta
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="relative overflow-hidden rounded-[2.8rem] bg-[#d8d0cd] p-5 shadow-[0_24px_80px_rgba(15,17,21,0.14)] sm:p-6">
      <div className="rounded-[2.2rem] bg-[linear-gradient(135deg,#efe8e5_0%,#d9d0cc_52%,#c6bbb6_100%)] p-5 lg:min-h-[46rem]">
        <div className="flex items-center justify-between gap-4">
          <span className="font-data text-xs font-semibold uppercase text-neutral-700/70">
            foliotree.com/@ana
          </span>
          <span className="rounded-full bg-lime-500 px-3 py-1 font-data text-xs font-bold uppercase text-lime-900">
            ao vivo
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="rounded-[2rem] bg-white p-5 text-neutral-950 shadow-[0_16px_48px_rgba(15,17,21,0.08)]">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-lime-500 font-display text-2xl font-extrabold text-lime-900">
                AC
              </div>
              <div className="min-w-0">
                <p className="font-display text-[2rem] font-[800] tracking-[-0.04em]">
                  Ana Correa
                </p>
                <p className="mt-1 text-sm font-medium leading-6 text-neutral-600">
                  Designer de produto que transforma sistemas complexos em experiencias claras.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2.5">
              {linkBlocks.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3"
                >
                  <Icon className="h-5 w-5 text-blue-700" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-950">{label}</p>
                    <p className="text-xs font-medium text-neutral-500">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {proofBlocks.map((block) => (
              <div
                key={block.label}
                className={`${block.tone} rounded-[1.55rem] p-4 shadow-[0_16px_40px_rgba(15,17,21,0.08)]`}
              >
                <p className="font-data text-xs font-bold uppercase">{block.label}</p>
                <p className="mt-2 font-display text-[1.8rem] font-[800] leading-tight tracking-[-0.04em]">
                  {block.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[1.55rem] bg-white/60 p-4 backdrop-blur">
          <p className="font-ui text-sm font-semibold text-neutral-700">
            Seu trabalho, com contexto.
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-neutral-600">
            Um link claro para compartilhar perfil, projetos e provas.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {["Perfil", "Projetos", "Provas"].map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-3 py-2 text-center text-xs font-semibold text-neutral-700 shadow-[0_8px_24px_rgba(15,17,21,0.06)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
