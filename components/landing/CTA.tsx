import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="bg-lime-500 py-16 text-lime-900 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
        <div>
          <p className="font-data text-xs font-bold uppercase text-lime-800">
            Comece pelo essencial
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-5xl font-extrabold leading-none sm:text-6xl">
            Sua trajetória tem valor. Faça esse valor aparecer.
          </h2>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-900 px-6 py-3 text-base font-bold text-white shadow-xl shadow-lime-900/20 transition-transform hover:-translate-y-0.5"
        >
          Criar minha conta
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
