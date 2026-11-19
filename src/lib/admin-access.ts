import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Verify authorization for every protected admin page, not the public login page. */
export async function ensureAdminPage() {
  const session = await auth();
  const ids = new Set((process.env.ADMIN_GITHUB_IDS ?? "").split(",").map(v => v.trim()).filter(Boolean));
  if (!session?.user?.id || !ids.has(session.user.id)) redirect("/admin/login");
  return session;
}
