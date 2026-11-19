import Link from "next/link";
import { auth } from "@/auth";
import "./admin.css";

export const dynamic = "force-dynamic";
const links = [
 { href:"/admin", symbol:"◫",label:"Overview"},
 { href:"/admin/products",symbol:"▣",label:"All products"},
 { href:"/admin/products/new",symbol:"+",label:"Add product"},
 { href:"/admin/orders",symbol:"▤",label:"Orders"},
 { href:"/admin/customers",symbol:"♙",label:"Customers"},
 { href:"/admin/delivery",symbol:"⇢",label:"Delivery & shipping"},
 { href:"/admin/storefront",symbol:"✎",label:"Storefront & content"}
];
export default async function AdminLayout({children}:{children:React.ReactNode}){
 const session=await auth();
 const ids=(process.env.ADMIN_GITHUB_IDS??"").split(",").map(s=>s.trim());
 const allowed=Boolean(session?.user?.id && ids.includes(session.user.id));
 if(!allowed) return <div className="wt-admin"><main className="wt-body">{children}</main></div>;
 return <div className="wt-admin"><div className="wt-shell">
 <aside className="wt-side"><div className="wt-brand"><span className="wt-brandmark">WT</span><div><strong>WORLD TREASURES</strong><small>Commerce control center</small></div></div>
 <div><div className="wt-navlabel">MANAGEMENT</div><nav>{links.map(x=><Link key={x.href} href={x.href}><span className="wt-navdot">{x.symbol}</span>{x.label}</Link>)}</nav></div>
 <div className="wt-sidemeta">Development workspace<br/> Changes are not yet published to the approved storefront.</div></aside>
 <div className="wt-main">
 <details className="wt-mobile-nav"><summary>☰ World Treasures · Menu</summary><div className="wt-moblinks">{links.map(x=><Link key={x.href} href={x.href}>{x.label}</Link>)}</div></details>
 <header className="wt-top"><div><strong>Store management</strong> <span className="wt-muted">/ World Treasures</span></div><div className="wt-topright"><span className="wt-pill">DEVELOPMENT</span><Link href="/" target="_blank">View store ↗</Link></div></header>
 <main className="wt-body">{children}</main>
 </div></div></div>;
}