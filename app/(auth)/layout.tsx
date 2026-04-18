import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FolioTree — Acesso",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Metade esquerda — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-blue-900 px-12 py-14">
        <div>
          <span className="font-display text-2xl font-bold text-white tracking-tight">
            FolioTree
          </span>
        </div>

        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-bold text-white leading-tight">
              LinkedIn mostra.{" "}
              <span className="text-lime-500">FolioTree prova.</span>
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
              Mostre quem você é de verdade — com uma trajetória clara, versões
              adaptadas e páginas que impressionam.
            </p>
          </div>

          <ul className="space-y-4">
            {[
              {
                icon: "✦",
                title: "Um perfil, múltiplos contextos",
                desc: "Crie versões diferentes para cada oportunidade.",
              },
              {
                icon: "✦",
                title: "Currículo pronto em segundos",
                desc: "Gerado automaticamente a partir do seu perfil.",
              },
              {
                icon: "✦",
                title: "Página pública profissional",
                desc: "Seu portfólio com URL personalizada.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="text-lime-500 text-lg mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-blue-300 text-sm mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-blue-400 text-xs">
          © {new Date().getFullYear()} FolioTree. Todos os direitos reservados.
        </p>
      </div>

      {/* Metade direita — formulário */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-white px-6 py-12">
        {/* Logo mobile */}
        <div className="mb-8 lg:hidden">
          <span className="font-display text-2xl font-bold text-neutral-900">
            FolioTree
          </span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
