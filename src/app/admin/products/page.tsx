import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { saveProduct } from "../actions";
export const dynamic="force-dynamic";
const input={padding:"9px 11px",border:"1px solid #cbd0d3",borderRadius:6,maxWidth:"100%"};
export default async function ProductsPage(){
 await ensureAdminPage();
 const products=await db.product.findMany({include:{category:true,variants:{include:{inventory:true},take:1}},orderBy:{name:"asc"}});
 return <section><h1>Products</h1><p>All prototype products start as drafts. Product prices and availability must be verified before publishing. Editing here does not change the approved storefront yet.</p>
 <div style={{display:"grid",gap:14}}>
 {products.map(p=>{const v=p.variants[0];return <form action={saveProduct} key={p.id} style={{background:"white",padding:18,borderRadius:10,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,alignItems:"end"}}>
 <input name="productId" type="hidden" value={p.id}/>
 <label>Product name<input style={input} name="name" defaultValue={p.name} required maxLength={150}/></label>
 <label>Price (ZAR)<input style={input} name="priceZar" type="number" min="0" step="0.01" defaultValue={((v?.priceCents??0)/100).toFixed(2)} required/></label>
 <label>Stock on hand<input style={input} name="stock" type="number" min="0" step="1" defaultValue={v?.inventory?.onHand??0} required/></label>
 <div><strong>{p.category.name}</strong><br/><small>{p.status} · {p.verified?"Verified":"Unverified"}</small></div>
 <button type="submit" style={{padding:12,color:"white",background:"#101F38",borderRadius:7}}>Save</button>
 </form>})}</div>
 {products.length===0&&<p>Catalog is empty. Run the prototype seed after the database migration.</p>}
 </section>;
}
