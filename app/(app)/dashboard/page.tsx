import { redirect } from "next/navigation";
import { getAppShellViewer } from "@/lib/server/app-viewer";

export default async function DashboardPage() {
  const viewer = await getAppShellViewer();

  redirect(viewer.user.username ? `/${viewer.user.username}` : "/profile");
}
