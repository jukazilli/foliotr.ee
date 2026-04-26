import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "./linkfolio-redesign.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-primary",
});

export const metadata: Metadata = {
  title: "LINKFOLIO",
  description: "Crie uma pagina viva para mostrar trabalho, curriculo e versoes.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} bg-paper font-sans text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
