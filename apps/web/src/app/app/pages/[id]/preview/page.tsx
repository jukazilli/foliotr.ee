import { demoPage } from "@foliotree/domain";
import { PublicPageRenderer } from "@/components/renderers/public-page-renderer";

export default function PagePreviewPage() {
  return <PublicPageRenderer page={demoPage} />;
}
