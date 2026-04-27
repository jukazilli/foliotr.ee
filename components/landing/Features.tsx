import {
  BadgeCheck,
  Fingerprint,
  Globe2,
  Layers3,
  Link2,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "Uma base central",
    description:
      "Perfil, experiências, projetos, links e reviews ficam no mesmo lugar.",
    tone: "bg-cyan-100 text-cyan-900",
  },
  {
    icon: BadgeCheck,
    title: "Review com contexto",
    description:
      "Resultados ganham métrica, papel, link e história suficiente para serem entendidos.",
    tone: "bg-green-100 text-green-900",
  },
  {
    icon: Layers3,
    title: "Versões por objetivo",
    description:
      "Adapte a mesma trajetória para vaga, cliente, palestra ou transição de carreira.",
    tone: "bg-violet-100 text-violet-900",
  },
  {
    icon: Globe2,
    title: "Página pública clara",
    description:
      "Um link profissional que alguém entende rápido, sem decifrar um histórico inteiro.",
    tone: "bg-lime-500 text-lime-900",
  },
  {
    icon: Link2,
    title: "Blocos compartilháveis",
    description:
      "Organização inspirada em blocos: cada evidência aparece como uma escolha clara.",
    tone: "bg-blue-100 text-blue-900",
  },
  {
    icon: Sparkles,
    title: "Expressão com estrutura",
    description:
      "A interface tem energia, mas mantém leitura profissional e hierarquia direta.",
    tone: "bg-coral-100 text-coral-900",
  },
];

export default function Features() {
  return (
    <section id="reviews" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="font-data text-xs font-semibold uppercase text-neutral-500">
              Por que existe
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-950 sm:text-5xl">
              Menos perfil genérico. Mais evidência entendível.
            </h2>
          </div>
          <p className="max-w-2xl text-base font-semibold leading-8 text-neutral-600">
            FolioTree não tenta substituir sua carreira por um template. Ele organiza o
            que prova seu valor e transforma isso em saídas claras.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, tone }) => (
            <article
              key={title}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-blue-900/10"
            >
              <div
                className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-neutral-950">
                {title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-neutral-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
