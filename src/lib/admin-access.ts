import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isAuthorizedAdminId } from "@/lib/admin-config";

/** Verify authorization for every protected admin page, not the public login page. */
export async function ensureAdminPage() {
  const session = await auth();
  if (!isAuthorizedAdminId(session?.user?.id)) redirect("/admin/login");
  return session;
}
