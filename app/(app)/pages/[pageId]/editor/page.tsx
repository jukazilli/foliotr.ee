import { redirect } from "next/navigation";
import { getAppViewer } from "@/lib/server/app-viewer";

export default async function PageEditorRoute() {
  await getAppViewer();
  redirect("/portfolios?legacy=editor");
}
