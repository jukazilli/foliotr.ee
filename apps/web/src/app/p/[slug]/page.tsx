import { demoPage } from "@foliotree/domain";
import { PublicPageRenderer } from "@/components/renderers/public-page-renderer";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return <PublicPageRenderer page={demoPage} />;
}
