import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Poppins, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-data",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  style: ["normal", "italic"],
  variable: "--font-template-portfolio",
  display: "swap",
});

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
    <html
      lang="pt-BR"
      className={`${sora.variable} ${inter.variable} ${ibmPlexMono.variable} ${poppins.variable}`}
    >
      <body className="bg-neutral-100 font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
