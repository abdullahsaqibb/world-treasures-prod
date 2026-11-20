import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function OrdersPage(){
 await ensureAdminPage();
 const [orders,total,paid,pending]=await Promise.all([
 db.order.findMany({include:{items:true,city:true,payments:true},orderBy:{createdAt:"desc"},take:100}),
 db.order.count(),db.order.count({where:{status:"PAID"}}),db.order.count({where:{status:"PENDING_PAYMENT"}})]);
 return <div><span className="wt-eyebrow">Sales operations</span><div className="wt-head"><div><h1>Orders</h1><p className="wt-lede">Track customer orders and payment status. Order checkout and PayFast payment processing are not yet enabled.</p></div><Link href="/admin" className="wt-btn light">← Overview</Link></div>
 <div className="wt-grid"><div className="wt-stat"><small>All orders</small><b>{total}</b><span>Total recorded orders</span></div><div className="wt-stat"><small>Pending payment</small><b>{pending}</b><span>Awaiting confirmation</span></div><div className="wt-stat"><small>Paid orders</small><b>{paid}</b><span>Payment status recorded</span></div></div>
 <section className="wt-card"><div className="wt-cardhead"><h2>Recent orders</h2><span className="wt-badge">Read only</span></div>
 {orders.length?<div className="wt-tablewrap"><table className="wt-table"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Delivery city</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong>{o.orderNumber}</strong></td><td>{o.email}</td><td>{o.items.reduce((n,i)=>n+i.quantity,0)}</td><td>{o.city.name}</td><td>R {(o.totalCents/100).toFixed(2)}</td><td><span className="wt-badge amber">{o.status.replaceAll("_"," ")}</span></td><td>{o.createdAt.toLocaleDateString("en-ZA")}</td></tr>)}</tbody></table></div>:<div className="wt-empty"><h3>No orders yet</h3><p>Customer orders will appear here when checkout and payment processing are connected.</p></div>}</section>
 <div className="wt-help">Upcoming: order detail pages, fulfillment timeline, tracking, refunds, PayFast transaction reconciliation, customer notifications and export tools. These actions are not active yet.</div></div>;
}