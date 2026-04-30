import Link from "next/link";

export default function PublicPortfolioNotFound() {
  return (
    <main className="min-h-screen bg-[#f2f4f7] px-4 py-10 text-[#050505] sm:px-6">
      <section className="mx-auto max-w-2xl rounded-xl border border-[#dddfe2] bg-white p-6 text-center shadow-[0_1px_2px_rgb(0_0_0/0.16)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#65676b]">
          Portfólio indisponível
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
          Esse portfólio não está mais disponível ou o usuário removeu a página.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#65676b]">
          O link pode ter sido despublicado, movido para rascunho ou removido pelo dono
          do perfil.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md bg-[#e7f3ff] px-4 text-sm font-bold text-[#0866ff] transition hover:bg-[#dbeafe]"
        >
          Voltar para o início
        </Link>
      </section>
    </main>
  );
}
