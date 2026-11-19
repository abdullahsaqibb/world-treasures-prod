import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function CustomersPage(){
 await ensureAdminPage();
 const [customers,count]=await Promise.all([db.user.findMany({include:{_count:{select:{orders:true,addresses:true}}},orderBy:{createdAt:"desc"},take:100}),db.user.count()]);
 return <div><span className="wt-eyebrow">Customer relationships</span><div className="wt-head"><div><h1>Customers</h1><p className="wt-lede">Browse customer accounts and order history at a glance. Customer registration is not active on the storefront yet.</p></div><span className="wt-badge">{count} customers</span></div>
 <section className="wt-card"><div className="wt-cardhead"><h2>Customer directory</h2><span className="wt-badge">Read only</span></div>
 {customers.length?<div className="wt-tablewrap"><table className="wt-table"><thead><tr><th>Customer</th><th>Email</th><th>Orders</th><th>Addresses</th><th>Joined</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><strong>{c.name||"Customer"}</strong></td><td>{c.email}</td><td>{c._count.orders}</td><td>{c._count.addresses}</td><td>{c.createdAt.toLocaleDateString("en-ZA")}</td></tr>)}</tbody></table></div>:<div className="wt-empty"><h3>Your customer list is empty</h3><p>Once registration and checkout are implemented, customer profiles and order histories will appear here.</p></div>}</section>
 <div className="wt-help">Upcoming: customer profiles, consent-aware messaging, address book, order detail history, and export tools with privacy protections.</div></div>;
}