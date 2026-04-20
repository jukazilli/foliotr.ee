import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FolioTree",
  description: "Sua trajetória profissional, clara em segundos.",
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
      <body className="bg-neutral-100 font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
