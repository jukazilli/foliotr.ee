import { demoResume } from "@foliotree/domain";
import { ResumeRenderer } from "@/components/renderers/resume-renderer";

export default async function PublicResumePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await params;
  return <ResumeRenderer resume={demoResume} />;
}
