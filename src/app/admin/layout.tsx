import { auth } from "@/auth";
import { AdminFrame } from "./AdminFrame";
import "./admin.css";
import "./merchant-ui.css";
import "./brand-refresh.css";
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){
 const session=await auth();
 const ids=new Set((process.env.ADMIN_GITHUB_IDS??"").split(",").map(s=>s.trim()).filter(Boolean));
 const allowed=Boolean(session?.user?.id&&ids.has(session.user.id));
 if(!allowed)return <div className="wt-admin">{children}</div>;
 return <AdminFrame email={session?.user?.email}>{children}</AdminFrame>;
}
