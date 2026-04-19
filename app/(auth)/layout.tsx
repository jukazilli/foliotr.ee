import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, FileText, Layers3, Link2 } from "lucide-react";
import { auth } from "@/auth";
import { FolioTreeLogo } from "@/components/brand/FolioTreeLogo";

export const metadata: Metadata = {
  title: "FolioTree - Acesso",
};

const previewItems = [
  { icon: BadgeCheck, label: "Provas", text: "resultados e links" },
  { icon: Layers3, label: "Versoes", text: "objetivos diferentes" },
  { icon: FileText, label: "Curriculo", text: "versao resumida" },
];

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="soft-grid-bg min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl gap-5 lg:grid-cols-[0.96fr_1.04fr]">
        <aside className="relative hidden overflow-hidden rounded-[2rem] bg-blue-500 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <FolioTreeLogo href="/" className="text-white" wordmarkClassName="text-white" />

          <div className="max-w-xl">
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-none xl:text-6xl">
              Organize seu perfil.
              <span className="mt-2 block text-lime-500">Publique quando quiser.</span>
            </h1>
            <p className="mt-7 max-w-md text-base font-semibold leading-7 text-white/78">
              Reuna suas informacoes, crie versoes e escolha como mostrar seu trabalho.
            </p>
          </div>

          <div className="grid gap-2">
            {previewItems.map(({ icon: Icon, label, text }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-white/24 bg-white/14 p-2.5 backdrop-blur"
              >
                <Icon className="h-5 w-5 text-lime-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs font-medium text-white/64">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[calc(100vh-2.5rem)] flex-col">
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/74 bg-white/70 px-4 py-3 backdrop-blur lg:hidden">
            <FolioTreeLogo href="/" />
            <Link href="/" className="text-sm font-bold text-neutral-600 hover:text-neutral-950">
              Home
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="glass-panel w-full max-w-[30rem] rounded-[2rem] p-5 sm:p-8">
              <div className="mb-8 hidden items-center justify-between lg:flex">
                <FolioTreeLogo href="/" compact />
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-950"
                >
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                  Home
                </Link>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
