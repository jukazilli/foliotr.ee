import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function CTA() {
  return (
    <section className="bg-blue-900 py-28">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Sua trajetória tem valor.
        </h2>
        <h2 className="font-display mt-2 text-4xl font-extrabold leading-tight tracking-tight text-lime-500 sm:text-5xl lg:text-6xl">
          Faça esse valor aparecer.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg text-white/70">
          Crie sua página FolioTree hoje. É gratuito.
        </p>
        <div className="mt-10">
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 rounded-xl bg-lime-500 px-9 py-4 text-lg font-bold text-lime-900 shadow-xl shadow-lime-500/20 hover:bg-lime-400 transition-colors"
          >
            Criar minha conta
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}
