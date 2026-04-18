const steps = [
  {
    number: "01",
    title: "Preencha seu perfil",
    description:
      "Adicione experiências, projetos, habilidades e links. É a sua base — você faz isso uma vez.",
  },
  {
    number: "02",
    title: "Crie uma versão",
    description:
      "Adapte para o contexto certo: empresa tech, trabalho freelance, candidatura específica. Cada versão conta uma história diferente.",
  },
  {
    number: "03",
    title: "Escolha um template",
    description:
      "Visual profissional pronto para publicar. Nenhum código, nenhum designer necessário.",
  },
  {
    number: "04",
    title: "Publique sua página",
    description:
      "Link único, currículo incluído. Compartilhe onde quiser — LinkedIn, WhatsApp, email.",
  },
]

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-neutral-100 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Do zero ao publicado{" "}
            <span className="text-blue-500">em minutos.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-neutral-500">
            Quatro passos simples para transformar sua trajetória em presença online real.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6">
          {/* Connector line — desktop only */}
          <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-px bg-neutral-200 md:block" />

          {steps.map(({ number, title, description }) => (
            <div key={number} className="relative flex flex-col items-start gap-4 md:items-center md:text-center">
              {/* Number bubble */}
              <div className="relative z-10 flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full border-4 border-neutral-100 bg-white shadow-sm">
                <span className="font-display text-2xl font-extrabold text-lime-500">{number}</span>
              </div>

              {/* Text */}
              <div>
                <h3 className="font-display text-base font-bold text-neutral-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
