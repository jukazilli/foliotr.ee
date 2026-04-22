import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-data",
});

export const metadata: Metadata = {
  title: "FolioTree",
  description: "Sua trajetoria profissional, clara em segundos.",
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
        className={`${sora.variable} ${inter.variable} ${ibmPlexMono.variable} bg-neutral-100 font-sans text-neutral-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
