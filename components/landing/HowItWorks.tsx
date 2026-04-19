const steps = [
  {
    number: "01",
    title: "Organize a base",
    description: "Adicione suas informacoes principais.",
  },
  {
    number: "02",
    title: "Escolha o recorte",
    description: "Crie versoes para objetivos diferentes.",
  },
  {
    number: "03",
    title: "Compartilhe a saída",
    description: "Publique a pagina ou use o curriculo.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="soft-grid-bg py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="font-data text-xs font-semibold uppercase text-blue-700">
              Como funciona
            </p>
            <h2 className="mt-4 font-display text-4xl font-extrabold leading-tight text-neutral-950 sm:text-5xl">
              Tres passos para comecar.
            </h2>
          </div>

          <div id="fluxo" className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="glass-panel rounded-2xl p-5">
                <span className="font-data text-sm font-bold text-blue-600">
                  {step.number}
                </span>
                <h3 className="mt-8 font-display text-2xl font-extrabold text-neutral-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-semibold leading-7 text-neutral-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

