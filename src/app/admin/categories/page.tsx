import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { createCategory,renameCategory } from "../actions";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function CategoriesPage(){
 await ensureAdminPage();
 const categories=await db.category.findMany({include:{_count:{select:{products:true}}},orderBy:{name:"asc"}});
 return <div><span className="wt-eyebrow">Catalog structure</span><div className="wt-head"><div><h1>Categories</h1><p className="wt-lede">Organize products into categories so customers can find the right snacks and treats.</p></div><Link className="wt-btn light" href="/admin/products">← Products</Link></div>
 <div className="wt-2col"><section className="wt-card"><div className="wt-cardhead"><h2>Existing categories</h2><span className="wt-badge">{categories.length} total</span></div>
 <div className="wt-stack">{categories.map(c=><form action={renameCategory} className="wt-card" style={{padding:15,marginBottom:0}} key={c.id}><input type="hidden" name="categoryId" value={c.id}/><div className="wt-formgrid"><label className="wt-field">Category name<input required name="name" maxLength={90} defaultValue={c.name}/></label><div className="wt-field"><span>Products</span><strong>{c._count.products}</strong><small>URL slug: {c.slug}</small></div></div><div className="wt-actions" style={{marginTop:10}}><button type="submit" className="wt-btn light">Save name</button></div></form>)}</div>
 </section><section className="wt-card"><h2>Add a category</h2><p className="wt-lede">Create a new category before adding products in that group.</p><form action={createCategory} className="wt-stack"><label className="wt-field">Category name<input name="name" required maxLength={90} placeholder="e.g. Energy Drinks"/></label><label className="wt-field">URL slug (optional)<input name="slug" maxLength={90} placeholder="e.g. energy-drinks"/></label><button type="submit" className="wt-btn orange">Create category</button></form><div className="wt-help">Changing a category name updates the admin catalog. Storefront navigation still uses the approved static prototype until synchronization is enabled.</div></section></div></div>;
}