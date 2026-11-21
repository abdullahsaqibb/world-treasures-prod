import {auth,isAdminSession} from "@/auth";
import {redirect} from "next/navigation";
/** Validate the authenticated admin principal on every protected page. */
export async function ensureAdminPage(){
 const session=await auth();
 if(!isAdminSession(session))redirect("/admin/login");
 return session;
}
