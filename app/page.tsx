import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "FolioTree - Mostre mais que um perfil",
  description:
    "Transforme sua trajetória profissional em evidência clara, viva e fácil de entender.",
};

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-neutral-100">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
