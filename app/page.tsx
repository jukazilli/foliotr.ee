import type { Metadata } from "next"
import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import HowItWorks from "@/components/landing/HowItWorks"
import CTA from "@/components/landing/CTA"
import Footer from "@/components/landing/Footer"

export const metadata: Metadata = {
  title: "FolioTree — Mostre mais do que um perfil",
  description:
    "Transforme sua trajetória profissional em presença clara, viva e convincente. Crie sua página FolioTree gratuitamente.",
}

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  )
}
