import type { Metadata } from "next";
import LandingExperience from "@/components/landing/LandingExperience";

export const metadata: Metadata = {
  title: "LINKFOLIO - Mostre mais que um perfil",
  description:
    "Transforme sua trajetória profissional em evidência clara, viva e fácil de entender.",
};

export default function LandingPage() {
  return <LandingExperience />;
}
