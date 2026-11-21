import { auth,isAdminSession } from "@/auth";
import { AdminFrame } from "./AdminFrame";
import "./admin.css";
import "./merchant-ui.css";
import "./brand-refresh.css";
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){
 const session=await auth();
 const allowed=isAdminSession(session);
 if(!allowed)return <div className="wt-admin">{children}</div>;
 return <AdminFrame email={session?.user?.email} isProduction={process.env.VERCEL_ENV==="production"}>{children}</AdminFrame>;
}
