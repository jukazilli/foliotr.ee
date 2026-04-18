import { User, Layers, Globe, FileText, Layout, TrendingUp } from "lucide-react"

const features = [
  {
    icon: User,
    title: "Perfil base",
    description: "Preencha uma vez. Tudo começa aqui. Seus dados, experiências e projetos em um lugar só.",
  },
  {
    icon: Layers,
    title: "Versões",
    description: "Adapte sua apresentação para cada contexto e oportunidade — sem reescrever tudo do zero.",
  },
  {
    icon: Globe,
    title: "Páginas públicas",
    description: "Sua presença online que prova, não só mostra. Um link com tudo que você já entregou.",
  },
  {
    icon: FileText,
    title: "Modo currículo",
    description: "Recruiter-friendly. Mesmo conteúdo, apresentação direta e otimizada para leitura rápida.",
  },
  {
    icon: Layout,
    title: "Templates",
    description: "Visual profissional sem precisar de designer. Escolha um tema e publique em minutos.",
  },
  {
    icon: TrendingUp,
    title: "Provas e resultados",
    description: "Mostre métricas, conquistas e o que você realmente entregou — não só o que fez.",
  },
]

export default function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Uma base.{" "}
            <span className="text-blue-500">Múltiplos outputs.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-500">
            Do perfil completo ao currículo imprimível — tudo a partir do mesmo lugar, adaptado para cada momento.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-neutral-900/[0.08] bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-lime-100">
                <Icon size={22} className="text-lime-700" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
