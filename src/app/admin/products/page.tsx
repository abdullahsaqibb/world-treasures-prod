import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function ProductsPage({searchParams}:{searchParams:Promise<{q?:string;status?:string}>}){
 await ensureAdminPage();
 const {q="",status="all"}=await searchParams;
 const query=q.trim().slice(0,80);
 const products=await db.product.findMany({
 where:{...(query?{OR:[{name:{contains:query,mode:"insensitive"}},{slug:{contains:query,mode:"insensitive"}}]}:{}),...(status==="draft"?{status:"DRAFT"}:status==="archived"?{status:"ARCHIVED"}:{})},
 include:{category:true,images:{take:1,orderBy:{sortOrder:"asc"}},variants:{take:1,include:{inventory:true}}},orderBy:{updatedAt:"desc"},take:200
 });
 const [all,drafts,archived]=await Promise.all([db.product.count(),db.product.count({where:{status:"DRAFT"}}),db.product.count({where:{status:"ARCHIVED"}})]);
 const tabs=[{label:"All products",val:"all",count:all},{label:"Drafts",val:"draft",count:drafts},{label:"Archived",val:"archived",count:archived}];
 return <div><span className="wt-eyebrow">Inventory & merchandising</span><div className="wt-head"><div><h1>Product catalog</h1><p className="wt-lede">Create products, manage prices and stock, and review listing information. Changes are saved to the development catalog.</p></div><Link className="wt-btn orange" href="/admin/products/new">＋ Add new product</Link></div>
 <div className="wt-card"><div className="wt-cardhead"><h2>Products <span className="wt-muted">({all})</span></h2><div className="wt-actions">{tabs.map(t=><Link key={t.val} className={"wt-btn "+(status===t.val?"":"light")} href={"/admin/products?status="+t.val+(query?"&q="+encodeURIComponent(query):"")}>{t.label} ({t.count})</Link>)}</div></div>
 <form method="get" style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}><input className="wt-search" name="q" placeholder="Search product names or URL slugs..." defaultValue={query}/><input name="status" type="hidden" value={status}/><button className="wt-btn" type="submit">Search</button>{query&&<Link className="wt-btn light" href="/admin/products">Clear</Link>}</form>
 <div className="wt-tablewrap"><table className="wt-table"><thead><tr><th>Product</th><th>Category</th><th>Price (ZAR)</th><th>Stock</th><th>Status</th><th>Verified</th><th></th></tr></thead><tbody>
 {products.map(p=>{const v=p.variants[0];const stock=v?.inventory?.onHand??0;return <tr key={p.id}><td><div className="wt-product">{p.images[0]&&p.images[0].url.startsWith("/")?<img src={p.images[0].url} alt=""/>:<span className="wt-badge">No photo</span>}<div><strong>{p.name}</strong><small>{v?.sku??"No SKU"}</small></div></div></td><td>{p.category.name}</td><td>R {((v?.priceCents??0)/100).toFixed(2)}</td><td><span className={"wt-badge "+(stock<=5?"red":"")}>{stock} units</span></td><td><span className={"wt-badge "+(p.status==="ACTIVE"?"green":"amber")}>{p.status.toLowerCase()}</span></td><td>{p.verified?<span className="wt-badge green">Verified</span>:<span className="wt-badge amber">Needs review</span>}</td><td><Link className="wt-btn light" href={"/admin/products/"+encodeURIComponent(p.id)}>Edit →</Link></td></tr>})}
 </tbody></table></div>
 {products.length===0&&<div className="wt-empty"><h3>No matching products</h3><p>Try a different search or add the first product.</p><Link className="wt-btn orange" href="/admin/products/new">Add product</Link></div>}
 </div><div className="wt-help"><strong>Before going live:</strong> Draft inventory and prices still need client verification. The live storefront currently uses the separately approved product content; it does not automatically update from this catalog yet.</div>
 </div>;
}