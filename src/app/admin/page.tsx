import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function AdminDashboard(){
 await ensureAdminPage();
 const [products,drafts,unverified,lowStock,cities,orders,customers,recent] = await Promise.all([
 db.product.count(),db.product.count({where:{status:"DRAFT"}}),db.product.count({where:{verified:false}}),
 db.inventory.count({where:{onHand:{lte:5}}}),db.city.count({where:{active:true,rates:{some:{active:true}}}}),
 db.order.count(),db.user.count(),db.product.findMany({take:5,orderBy:{updatedAt:"desc"},include:{category:true,images:{take:1},variants:{take:1,include:{inventory:true}}}})
 ]);
 const metrics=[{label:"Total products",value:products,detail:"Catalog items"},{label:"Draft products",value:drafts,detail:"Not yet published"},{label:"Pending verification",value:unverified,detail:"Awaiting final product information"},{label:"Low stock records",value:lowStock,detail:"5 units or fewer"}];
 const shortcuts=[
 {icon:"＋",title:"Add a new product",description:"Guided details, price, image and stock",href:"/admin/products/new"},
 {icon:"▣",title:"Manage the catalog",description:"Edit products and check listing status",href:"/admin/products"},
 {icon:"⇢",title:"Set delivery fees",description:"Create delivery zones and city prices",href:"/admin/delivery"},
 {icon:"✎",title:"Storefront content",description:"See the content and theme editing roadmap",href:"/admin/storefront"},
 {icon:"▤",title:"Review orders",description:"View order pipeline and current orders",href:"/admin/orders"},
 {icon:"♙",title:"Customer records",description:"See registered customer information",href:"/admin/customers"}
 ];
 return <div>
 <span className="wt-eyebrow">Your business at a glance</span>
 <div className="wt-head"><div><h1>Good to see you.</h1><p className="wt-lede">Everything you need to manage World Treasures, in one place. Start by reviewing the imported products and adding verified details.</p></div><Link href="/admin/products/new" className="wt-btn orange">＋ Add product</Link></div>
 <div className="wt-grid">{metrics.map(m=><div className="wt-stat" key={m.label}><small>{m.label}</small><b>{m.value}</b><span>{m.detail}</span></div>)}</div>
 <div className="wt-help"><strong>Setup reminder:</strong> Product names, stock and prices imported from the prototype are not confirmed. Every imported item is a draft and unverified. Publishing products to the customer-facing store is not enabled yet.</div>
 <section className="wt-card"><div className="wt-cardhead"><h2>Quick actions</h2><span className="wt-muted">Choose what you want to do</span></div><div className="wt-shortcuts">{shortcuts.map(x=><Link key={x.href} href={x.href} className="wt-shortcut"><span className="wt-ico">{x.icon}</span><b>{x.title}</b><span>{x.description}</span></Link>)}</div></section>
 <div className="wt-2col"><section className="wt-card"><div className="wt-cardhead"><h2>Recently updated products</h2><Link href="/admin/products" className="wt-muted">View all →</Link></div><div className="wt-tablewrap"><table className="wt-table"><thead><tr><th>Product</th><th>Status</th><th>Stock</th></tr></thead><tbody>{recent.map(p=><tr key={p.id}><td><Link href={"/admin/products/"+encodeURIComponent(p.id)}><strong>{p.name}</strong></Link><div className="wt-muted">{p.category.name}</div></td><td><span className="wt-badge amber">{p.status}</span></td><td>{p.variants[0]?.inventory?.onHand??0}</td></tr>)}</tbody></table></div></section>
 <section className="wt-card"><h2>Store readiness</h2><p className="wt-lede">Your operations workspace is being configured in stages.</p><div className="wt-stack">
 <div>✓ <strong>Database and product catalog</strong><div className="wt-muted">Connected and ready</div></div>
 <div>✓ <strong>Administrator sign-in</strong><div className="wt-muted">Restricted GitHub access</div></div>
 <div>○ <strong>Product verification</strong><div className="wt-muted">{unverified} items require review</div></div>
 <div>○ <strong>Storefront synchronization</strong><div className="wt-muted">Not activated yet</div></div>
 <div>○ <strong>Checkout and payments</strong><div className="wt-muted">Not activated yet</div></div>
 <div className="wt-muted">Current records: {orders} orders · {customers} customers · {cities} active shipping cities</div>
 </div></section></div>
 </div>;
}