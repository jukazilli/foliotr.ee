import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/onboarding");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      headline: true,
      bio: true,
      location: true,
      openToOpportunities: true,
      opportunityMotivation: true,
      onboardingDone: true,
      user: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  if (!profile) {
    redirect("/login");
  }

  if (profile.onboardingDone && profile.user.username) {
    redirect(`/${profile.user.username}`);
  }

  return (
    <OnboardingWizard
      initialProfile={{
        displayName: profile.displayName ?? profile.user.name ?? "",
        username: profile.user.username ?? "",
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        openToOpportunities: profile.openToOpportunities,
        opportunityMotivation: profile.opportunityMotivation ?? "",
      }}
    />
  );
}
