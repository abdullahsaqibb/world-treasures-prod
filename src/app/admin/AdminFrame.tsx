"use client";
import {usePathname,useRouter} from "next/navigation";
import Link from "next/link";
import {useState} from "react";
import {signOut} from "next-auth/react";

type NavItem={label:string;href:string;icon:string;planned?:boolean};
const nav: {heading:string;items:NavItem[]}[]=[
 {heading:"Workspace",items:[{label:"Overview",href:"/admin",icon:"overview"},{label:"Launch readiness",href:"/admin/readiness",icon:"lock"},{label:"Orders",href:"/admin/orders",icon:"orders"},{label:"Customers",href:"/admin/customers",icon:"users"}]},
 {heading:"Merchandise",items:[{label:"Products",href:"/admin/products",icon:"products"},{label:"Categories",href:"/admin/categories",icon:"categories"},{label:"Delivery zones",href:"/admin/delivery",icon:"truck"},{label:"Discounts",href:"/admin/promotions",icon:"ticket",planned:true}]},
 {heading:"Experience",items:[{label:"Storefront editor",href:"/admin/storefront",icon:"monitor"},{label:"Media library",href:"/admin/media",icon:"image"},{label:"Analytics",href:"/admin/analytics",icon:"chart",planned:true}]},
 {heading:"Configuration",items:[{label:"Payments",href:"/admin/payments",icon:"wallet"},{label:"Transactional email",href:"/admin/email",icon:"mail"},{label:"Customer accounts",href:"/admin/accounts",icon:"lock",planned:true},{label:"Store settings",href:"/admin/settings",icon:"settings",planned:true}]}
];
const pathData:Record<string,string>={overview:"M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",orders:"M8 4h10l3 3v14H5V4h3z M8 9h10 M8 13h10 M8 17h6",users:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8z M18 8a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87",products:"M3 7l9-4 9 4v10l-9 4-9-4z M3 7l9 5 9-5 M12 12v9",categories:"M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",truck:"M1 5h14v12H1z M15 9h4l3 4v4h-7 M5 21a2 2 0 1 0 0-4a2 2 0 0 0 0 4z M19 21a2 2 0 1 0 0-4a2 2 0 0 0 0 4z",ticket:"M2 7h20v4a2 2 0 0 0 0 4v4H2v-4a2 2 0 0 0 0-4z M12 7v12",monitor:"M3 4h18v13H3z M8 21h8 M12 17v4",image:"M3 3h18v18H3z M8 10a2 2 0 1 0 0-4a2 2 0 0 0 0 4z M3 17l5-5 4 4 3-3 6 6",chart:"M3 3v18h18 M7 17V9 M12 17V5 M17 17v-6",wallet:"M3 6h18v14H3z M3 10h18 M16 15h3",mail:"M2 5h20v14H2z M2 5l10 8 10-8",lock:"M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",settings:"M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M19.1 4.9L17 7 M7 17l-2.1 2.1"};
export function AdminIcon({name,size=18}:{name:string;size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={pathData[name]||pathData.overview}/></svg>;}
function NavContent({pathname,onSelect}:{pathname:string;onSelect?:()=>void}){
 return <>{nav.map(section=><section className="wt-nav-group" key={section.heading}><h3>{section.heading}</h3><div className="wt-nav-group-links">{section.items.map(item=>{
 const active=pathname===item.href||(item.href!=="/admin"&&pathname.startsWith(item.href+"/"));
 return item.planned?<span key={item.href} className="wt-nav-link wt-nav-planned" aria-disabled="true" title={item.label+" is not available yet"}><AdminIcon name={item.icon}/><span>{item.label}</span><small>soon</small></span>:<Link onClick={onSelect} key={item.href} href={item.href} className={"wt-nav-link"+(active?" is-active":"")} aria-current={active?"page":undefined}><AdminIcon name={item.icon}/><span>{item.label}</span></Link>;
 })}</div></section>)}</>;
}
export function AdminFrame({children,email,isProduction}:{children:React.ReactNode;email?:string|null;isProduction:boolean}){
 const pathname=usePathname(),router=useRouter(),[search,setSearch]=useState(""),[mobile,setMobile]=useState(false),[loggingOut,setLoggingOut]=useState(false);
 const section=nav.flatMap(x=>x.items).filter(item=>pathname===item.href||pathname.startsWith(item.href+"/")).sort((a,b)=>b.href.length-a.href.length)[0];
 return <div className="wt-admin"><div className="wt-admin-shell">
 <aside className="wt-admin-sidebar">
  <Link href="/admin" className="wt-admin-brand" aria-label="World Treasures admin overview"><span className="wt-admin-logomark">W<span>T</span></span><span><strong>WORLD TREASURES</strong><small>Merchant workspace</small></span></Link>
  <div className="wt-admin-sidebar-scroll"><NavContent pathname={pathname}/></div>
  <div className="wt-admin-sidefooter"><span className="wt-admin-envdot"/><div><strong>{isProduction?"LIVE PRODUCTION":"PREVIEW SANDBOX"}</strong><small>{isProduction?"Changes publish to live catalogue":"Changes here do not sync to live"}</small></div></div>
 </aside>
 <div className="wt-admin-workspace">
  <header className="wt-admin-topbar">
   <button type="button" className="wt-admin-mobile-toggle" onClick={()=>setMobile(v=>!v)} aria-expanded={mobile} aria-label="Open management menu">☰</button>
   <div className="wt-admin-breadcrumb"><span>Management</span><span className="wt-admin-crumbslash">/</span><strong>{section?.label||"Workspace"}</strong></div>
   <form role="search" className="wt-admin-global-search" onSubmit={e=>{e.preventDefault();router.push("/admin/products?q="+encodeURIComponent(search.trim()));setSearch("");}}><svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" fill="none" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input aria-label="Search products" placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>↵</kbd></form>
   <div className="wt-admin-tools"><Link href="/admin/products/new" className="wt-admin-create" aria-label="Add a new product" title="Add a new product">＋ <span>Add product</span></Link><Link href="/" className="wt-admin-viewstore wt-admin-storelink" title="View the World Treasures storefront" aria-label="View storefront home">↗ <span>View store</span></Link><div className="wt-admin-avatar" title={email||"Administrator"}>{email?.charAt(0).toUpperCase()||"A"}</div><button type="button" className="wt-admin-viewstore wt-admin-signout" disabled={loggingOut} aria-label={loggingOut?"Signing out":"Sign out of World Treasures admin"} onClick={async()=>{if(loggingOut)return;setLoggingOut(true);try{await signOut({redirect:false});window.location.assign("/admin/login");}catch{setLoggingOut(false);window.location.assign("/admin/login");}}}>{loggingOut?"Signing out…":"Sign out"}</button></div>
  </header>
  {mobile&&<div className="wt-admin-mobile-overlay"><button onClick={()=>setMobile(false)} aria-label="Close menu" className="wt-admin-overlay-close">Close ×</button><NavContent pathname={pathname} onSelect={()=>setMobile(false)}/></div>}
  <main className="wt-body"><div className="wt-admin-content">{!isProduction&&<div role="alert" style={{background:"#fff2d5",color:"#6a3505",border:"2px solid #e8ad51",padding:"14px 18px",borderRadius:10,marginBottom:18,fontWeight:700}}>PREVIEW SANDBOX — Products created here do not appear on the live store. <a href="https://www.worldtreasures.co.za/admin/products" style={{textDecoration:"underline",color:"#7d3100",marginLeft:8}}>Manage live products →</a></div>}{children}</div></main>
 </div></div></div>;
}
