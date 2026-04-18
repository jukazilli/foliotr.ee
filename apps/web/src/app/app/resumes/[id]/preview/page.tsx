import { demoResume } from "@foliotree/domain";
import { ResumeRenderer } from "@/components/renderers/resume-renderer";

export default function ResumePreviewPage() {
  return <ResumeRenderer resume={demoResume} />;
}
