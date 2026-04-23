import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";

export const metadata: Metadata = {
  title: "FolioTree - Mostre mais que um perfil",
  description:
    "Transforme sua trajetória profissional em evidência clara, viva e fácil de entender.",
};

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-neutral-100">
      <Navbar />
      <Hero />
    </main>
  );
}
