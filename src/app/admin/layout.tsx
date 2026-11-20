import { auth } from "@/auth";
import { isAuthorizedAdminId } from "@/lib/admin-config";
import { AdminFrame } from "./AdminFrame";
import "./admin.css";
import "./merchant-ui.css";
import "./brand-refresh.css";
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){
 const session=await auth();
 const allowed=isAuthorizedAdminId(session?.user?.id);
 if(!allowed)return <div className="wt-admin">{children}</div>;
 return <AdminFrame email={session?.user?.email}>{children}</AdminFrame>;
}
