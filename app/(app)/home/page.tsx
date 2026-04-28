import { redirect } from "next/navigation";
import PublicProfileHubPage from "@/components/public/PublicProfileHubPage";
import { getAppViewer } from "@/lib/server/app-viewer";
import { getPublicProfileHub } from "@/lib/server/domain/public-pages";
import { getPublicReviewSummary } from "@/lib/server/domain/reviews";

export default async function AuthenticatedHomePage() {
  const { user } = await getAppViewer();

  if (!user.username) {
    redirect("/profile");
  }

  const [hub, reviewSummary] = await Promise.all([
    getPublicProfileHub(user.username),
    getPublicReviewSummary(user.username),
  ]);

  if (!hub) {
    redirect("/profile");
  }

  return (
    <PublicProfileHubPage
      username={user.username}
      hub={hub}
      reviewSummary={reviewSummary}
      isOwner
      embedded
    />
  );
}
