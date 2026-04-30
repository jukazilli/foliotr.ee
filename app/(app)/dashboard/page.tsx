import { redirect } from "next/navigation";
import { getAppViewer } from "@/lib/server/app-viewer";

export default async function DashboardPage() {
  await getAppViewer();
  redirect("/home");
}
