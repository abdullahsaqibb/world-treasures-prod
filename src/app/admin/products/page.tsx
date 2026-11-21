import {ensureAdminPage} from "@/lib/admin-access";
import {db} from "@/lib/db";
import Link from "next/link";
import type {Prisma} from "@prisma/client";
export const dynamic="force-dynamic";
type Filter={q?:string;status?:string;category?:string;stock?:string;verified?:string;sort?:string;page?:string};
function queryString(filters:Filter,updates:Filter={}){const p=new URLSearchParams();const combined={...filters,...updates};Object.entries(combined).forEach(([k,v])=>{if(v&&v!=="all")p.set(k,v)});return p.toString();}
export default async function ProductsPage({searchParams}:{searchParams:Promise<Filter>}){
 await ensureAdminPage();
 const f=await searchParams,query=(f.q??"").trim().slice(0,80);
 const filter={q:query,status:["draft","active","archived"].includes(f.status??"")?f.status:"all",category:f.category??"all",stock:["low","out","available"].includes(f.stock??"")?f.stock:"all",verified:["yes","no"].includes(f.verified??"")?f.verified:"all",sort:f.sort==="name"?"name":"recent"};
 const categories=await db.category.findMany({orderBy:{name:"asc"},select:{id:true,name:true}});
 const categoryId=categories.some(c=>c.id===filter.category)?filter.category:undefined;
 const where:Prisma.ProductWhereInput={
  ...(query?{OR:[{name:{contains:query,mode:"insensitive"}},{slug:{contains:query,mode:"insensitive"}},{variants:{some:{sku:{contains:query,mode:"insensitive"}}}}]}:{}),
  ...(filter.status==="draft"?{status:"DRAFT"}:filter.status==="active"?{status:"ACTIVE"}:filter.status==="archived"?{status:"ARCHIVED"}:{}),
  ...(categoryId?{categoryId}:{}),
  ...(filter.verified==="yes"?{verified:true}:filter.verified==="no"?{verified:false}:{}),
  ...(filter.stock==="out"?{variants:{some:{inventory:{is:{onHand:0}}}}}:filter.stock==="low"?{variants:{some:{inventory:{is:{onHand:{gt:0,lte:5}}}}}}:filter.stock==="available"?{variants:{some:{inventory:{is:{onHand:{gt:5}}}}}}:{})
 };
 const pageInput=Number(f.page),page=Number.isSafeInteger(pageInput)&&pageInput>0?Math.min(pageInput,100000):1,pageSize=25;
 const [products,matching,all,drafts,published,archived,unverified]=await Promise.all([
 db.product.findMany({where,include:{category:true,images:{take:1,orderBy:{sortOrder:"asc"}},variants:{include:{inventory:true}}},orderBy:filter.sort==="name"?[{name:"asc"}]:[{updatedAt:"desc"}],take:pageSize,skip:(page-1)*pageSize}),
 db.product.count({where}),db.product.count(),db.product.count({where:{status:"DRAFT"}}),db.product.count({where:{status:"ACTIVE",verified:true}}),
 db.product.count({where:{status:"ARCHIVED"}}),db.product.count({where:{verified:false}})
 ]);
 const tabs=[{label:"All",val:"all",count:all},{label:"Drafts",val:"draft",count:drafts},{label:"Published",val:"active",count:published},{label:"Archived",val:"archived",count:archived}];
 const isProduction=process.env.VERCEL_ENV==="production";
 const next=page*pageSize<matching;
 return <div><span className="wt-eyebrow">MERCHANDISE / CATALOG</span><div className="wt-head"><div><h1>Your product collection.</h1><p className="wt-lede">Review, organize and manage product listings. Search by product name, URL or SKU.</p></div><div className="wt-actions"><Link className="wt-btn light" href="/catalog" target="_blank" rel="noopener noreferrer">↗ Storefront catalog</Link><Link className="wt-btn light" href="/api/admin/products/export">↓ Export CSV</Link><Link className="wt-btn orange" href="/admin/products/new">＋ Add product</Link></div></div>
 <div className="wt-grid"><div className="wt-stat"><small>Total products</small><b>{all}</b><span>{isProduction?"Live production catalog":"Preview sandbox catalog"}</span></div><div className="wt-stat"><small>Unverified listings</small><b>{unverified}</b><span>Need supplier or label confirmation</span></div><div className="wt-stat"><small>Draft listings</small><b>{drafts}</b><span>Not published to customers</span></div><div className="wt-stat"><small>Archived</small><b>{archived}</b><span>Stored in the catalog</span></div></div>
 <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">CATALOG LIBRARY</span><h2>Manage your products <span className="wt-muted">({matching} matching)</span></h2></div><div className="wt-actions">{tabs.map(t=><Link className={"wt-btn "+(filter.status===t.val?"":"light")} key={t.val} href={"/admin/products?"+queryString(filter,{status:t.val,page:"1"})}>{t.label} ({t.count})</Link>)}</div></div>
 <form method="get" className="wt-catalog-filters" aria-label="Filter product catalog">
  <label className="wt-field"><span>Search</span><input name="q" type="search" defaultValue={query} placeholder="Name, barcode or SKU…"/></label>
  <label className="wt-field"><span>Category</span><select name="category" defaultValue={categoryId??"all"}><option value="all">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <label className="wt-field"><span>Stock</span><select name="stock" defaultValue={filter.stock}><option value="all">Any stock</option><option value="available">6+ units</option><option value="low">Low stock (1–5)</option><option value="out">Out of stock</option></select></label>
  <label className="wt-field"><span>Verification</span><select name="verified" defaultValue={filter.verified}><option value="all">All statuses</option><option value="yes">Verified</option><option value="no">Needs review</option></select></label>
  <label className="wt-field"><span>Sort</span><select name="sort" defaultValue={filter.sort}><option value="recent">Recently updated</option><option value="name">Name A–Z</option></select></label>
  <input type="hidden" name="status" value={filter.status}/><div className="wt-catalog-filter-actions"><button className="wt-btn orange" type="submit">Apply filters</button><Link className="wt-btn light" href="/admin/products">Reset</Link></div>
 </form>
 <div className="wt-tablewrap"><table className="wt-table"><thead><tr><th scope="col">Product</th><th scope="col">Category</th><th scope="col">Price</th><th scope="col">On hand</th><th scope="col">Status</th><th scope="col">Verified</th><th scope="col">Actions</th></tr></thead><tbody>
 {products.map(p=>{const v=p.variants[0],stock=p.variants.reduce((sum,item)=>sum+Math.max(0,(item.inventory?.onHand??0)-(item.inventory?.reserved??0)),0),prices=p.variants.map(item=>item.priceCents).filter(price=>price>0),minPrice=prices.length?Math.min(...prices):null;return <tr key={p.id}><td><div className="wt-product">{p.images[0]&&(/^(https:\/\/|\/(?!\/))/i.test(p.images[0].url))?<img src={p.images[0].url} alt="" loading="lazy"/>:<span className="wt-badge">No photo</span>}<div><strong>{p.name}</strong><small>{v?.sku??"No SKU"}</small></div></div></td><td>{p.category.name}</td><td>{minPrice===null?"Price not set":(prices.length>1?"From R ":"R ")+(minPrice/100).toFixed(2)}</td><td><span className={"wt-badge "+(stock<=5?"red":"")}>{stock} available</span></td><td><span className={"wt-badge "+(p.status==="ACTIVE"?"green":"amber")}>{p.status.toLowerCase()}</span></td><td>{p.verified?<span className="wt-badge green">Verified</span>:<span className="wt-badge amber">Needs review</span>}</td><td><Link className="wt-btn light" href={"/admin/products/"+encodeURIComponent(p.id)}>Edit →</Link></td></tr>})}
 </tbody></table></div>
 {products.length===0&&<div className="wt-empty"><h3>No matching products</h3><p>Try changing filters, or create a new item.</p><Link className="wt-btn orange" href="/admin/products/new">Add a product →</Link></div>}
 <div className="wt-table-pagination"><span>Showing {products.length?((page-1)*pageSize+1):0}–{Math.min(page*pageSize,matching)} of {matching} products</span><div className="wt-actions">{page>1&&<Link className="wt-btn light" href={"/admin/products?"+queryString(filter,{page:String(page-1)})}>← Previous</Link>}{next&&<Link className="wt-btn light" href={"/admin/products?"+queryString(filter,{page:String(page+1)})}>Next →</Link>}</div></div>
 </section><div className="wt-help"><strong>{isProduction?"Live production catalog:":"Preview sandbox:"}</strong> {isProduction?"Products appear on the live storefront when marked ACTIVE and verified. Payments and orders remain disabled.":"This database is isolated from Production. Changes here do not appear at www.worldtreasures.co.za. Use the live admin to manage real products."}</div>
 </div>;
}