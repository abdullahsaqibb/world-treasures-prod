import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { AdminIcon } from "./AdminFrame";
import Link from "next/link";
export const dynamic="force-dynamic";
const zar=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
export default async function AdminDashboard(){
 await ensureAdminPage();
 const [products,drafts,unverified,lowStock,cities,orders,customers,recent,latestOrders] = await Promise.all([
 db.product.count(),db.product.count({where:{status:"DRAFT"}}),db.product.count({where:{verified:false}}),
 db.inventory.count({where:{onHand:{lte:5}}}),db.city.count({where:{active:true,rates:{some:{active:true}}}}),
 db.order.count(),db.user.count(),db.product.findMany({take:5,orderBy:{updatedAt:"desc"},include:{category:true,variants:{take:1,include:{inventory:true}}}}),
 db.order.findMany({take:4,orderBy:{createdAt:"desc"},select:{id:true,orderNumber:true,status:true,totalCents:true,createdAt:true}})
 ]);
 const metrics=[
 {icon:"products",label:"Products in catalog",value:products,detail:unverified+" awaiting verification"},
 {icon:"orders",label:"Orders recorded",value:orders,detail:"Payments are not live"},
 {icon:"truck",label:"Delivery zones",value:cities,detail:"Cities with active rates"},
 {icon:"chart",label:"Low-stock variants",value:lowStock,detail:"5 units or fewer"}
 ];
 const actions=[
 {title:"Add a product",detail:"Step-by-step product listing",icon:"products",href:"/admin/products/new"},
 {title:"Review catalog",detail:unverified+" products still need checking",icon:"categories",href:"/admin/products"},
 {title:"Set delivery charges",detail:"Create zones and edit ZAR rates",icon:"truck",href:"/admin/delivery"},
 {title:"Edit storefront copy",detail:"Draft text and preview publishing",icon:"monitor",href:"/admin/storefront"}
 ];
 return <div>
 <section className="wt-hero-panel"><div><span className="wt-eyebrow">MERCHANT OVERVIEW</span><h1>Your store. One clear workspace.</h1><p>Manage World Treasures without technical tools. Start with product verification, stock and delivery setup while we prepare the launch systems.</p></div><Link href="/admin/products/new" className="wt-btn">＋ Add a product</Link></section>
 <div className="wt-kpi-strip">{metrics.map(m=><div className="wt-kpi" key={m.label}><span className="wt-kpi-icon"><AdminIcon name={m.icon} size={19}/></span><div className="wt-kpi-label">{m.label}</div><div className="wt-kpi-num">{m.value}</div><div className="wt-kpi-note">{m.detail}</div></div>)}</div>
 <div className="wt-dashboard-columns"><div>
 <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">GET THINGS DONE</span><h2>Quick actions</h2></div><span className="wt-badge">Operations</span></div><div className="wt-action-list">{actions.map(a=><Link href={a.href} key={a.href}><span className="wt-action-icon"><AdminIcon name={a.icon} size={19}/></span><div><strong>{a.title}</strong><small>{a.detail}</small></div><span className="wt-action-arrow">→</span></Link>)}</div></section>
 <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">CATALOG ACTIVITY</span><h2>Recently edited products</h2></div><Link href="/admin/products" className="wt-btn light">All products →</Link></div>{recent.length?<div className="wt-tablewrap"><table className="wt-table"><thead><tr><th>Product</th><th>Stock</th><th>Listing</th><th></th></tr></thead><tbody>{recent.map(p=><tr key={p.id}><td><strong>{p.name}</strong><div className="wt-muted">{p.category.name}</div></td><td>{p.variants[0]?.inventory?.onHand??0}</td><td><span className="wt-badge amber">{p.status.toLowerCase()}</span></td><td><Link href={"/admin/products/"+encodeURIComponent(p.id)}>Edit →</Link></td></tr>)}</tbody></table></div>:<div className="wt-empty">No products have been created yet.</div>}</section>
 </div><div>
 <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">LAUNCH CHECKLIST</span><h2>Store readiness</h2></div></div><div className="wt-setup-timeline">
 <div className="wt-setup-step"><span className="wt-setup-check">✓</span><div><strong>Development database</strong><small>Connected and populated</small></div></div>
 <div className="wt-setup-step"><span className="wt-setup-check">✓</span><div><strong>Staff authentication</strong><small>Restricted GitHub administrator access</small></div></div>
 <div className="wt-setup-step pending"><span className="wt-setup-check">○</span><div><strong>Verify product information</strong><small>{drafts} drafts · {unverified} unverified items</small></div></div>
 <div className="wt-setup-step pending"><span className="wt-setup-check">○</span><div><strong>Checkout and PayFast</strong><small>Not yet connected to transactions</small></div></div>
 <div className="wt-setup-step pending"><span className="wt-setup-check">○</span><div><strong>Customer sign-in & email</strong><small>Planned: guest, Google and email options</small></div></div>
 <div className="wt-setup-step pending"><span className="wt-setup-check">○</span><div><strong>Production publish</strong><small>Will follow end-to-end testing</small></div></div></div></section>
 <section className="wt-card"><div className="wt-cardhead"><h2>Latest orders</h2><Link href="/admin/orders" className="wt-muted">View all →</Link></div>{latestOrders.length?latestOrders.map(o=><div className="wt-feature-row" key={o.id}><div><strong>{o.orderNumber}</strong><small>{o.status.replaceAll("_"," ")} · {o.createdAt.toLocaleDateString("en-ZA")}</small></div><strong>{zar(o.totalCents)}</strong></div>):<div className="wt-empty"><h3>No orders yet</h3><p>Orders will appear after checkout and payments are connected.</p></div>}</section>
 <div className="wt-help">This is a <strong>development workspace</strong>. Product prices and stock are provisional; the public storefront is not yet synchronized with the database.</div>
 </div></div></div>;
}