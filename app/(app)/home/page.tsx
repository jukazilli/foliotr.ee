import { redirect } from "next/navigation";
import { getAppViewer } from "@/lib/server/app-viewer";

export default async function AuthenticatedHomePage() {
  const { user } = await getAppViewer();

  if (!user.username) {
    redirect("/profile");
  }

  redirect(`/${user.username}`);
}
