import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function AdminDashboard(){
 await ensureAdminPage();
 const [products,cities,orders]=await Promise.all([db.product.count(),db.city.count(),db.order.count()]);
 return <section><h1>Admin overview</h1><p>Catalog values are provisional until your verified price document is imported.</p>
 <div style={{display:"flex",flexWrap:"wrap",gap:14}}>
 {[[products,"Products"],[cities,"Cities"],[orders,"Orders"]].map(([number,label])=><div key={label} style={{padding:25,minWidth:180,borderRadius:12,background:"white"}}><strong style={{fontSize:28}}>{number}</strong><p>{label}</p></div>)}</div>
 <p><Link href="/admin/products">Edit products</Link> · <Link href="/admin/delivery">Edit city-based delivery fees</Link></p></section>;
}
