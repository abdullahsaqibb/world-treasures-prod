import {ensureAdminPage} from "@/lib/admin-access";
import {db} from "@/lib/db";
import {notFound} from "next/navigation";
import Link from "next/link";
import {updateOrderFulfillment} from "../operations";
export const dynamic="force-dynamic";

export default async function OrderDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{result?:string}>}){
 await ensureAdminPage();
 const {id}=await params;
 const {result}=await searchParams;
 const order=await db.order.findUnique({where:{id},include:{items:true,payments:{include:{events:true}},city:true}});
 if(!order)notFound();
 const editable=process.env.ORDER_OPERATIONS_ENABLED==="true";
 const verifiedPaid=order.payments.some(p=>p.status==="COMPLETED"&&p.events.some(e=>e.verified));
 const actions:ReadonlyArray<{event:string;label:string}>=[
  ...(order.status==="PAID"&&verifiedPaid?[{event:"START_PROCESSING",label:"Start preparation"}]:[]),
  ...(order.status==="PROCESSING"&&verifiedPaid?[{event:"DISPATCH_CONFIRMED",label:"Confirm dispatch"}]:[]),
  ...(order.status==="SHIPPED"&&verifiedPaid?[{event:"DELIVERY_CONFIRMED",label:"Mark delivered"}]:[]),
  ...(order.status==="PENDING_PAYMENT"?[{event:"CANCEL_UNPAID",label:"Cancel unpaid order"}]:[])
 ];
 return <div>
  <span className="wt-eyebrow">Sales operations / order detail</span>
  <div className="wt-head"><div><h1>Order {order.orderNumber}</h1><p className="wt-lede">Status: {order.status.replaceAll("_"," ")} · {order.email}</p></div>
   <Link className="wt-btn light" href="/admin/orders">← Orders</Link></div>
  {result==="updated"&&<p className="wt-help" role="status">Order status was saved.</p>}
  {result==="failed"&&<p className="wt-help" role="alert">The action was not applied. Check payment verification, tracking, permissions and inventory state.</p>}
  <section className="wt-card"><h2>Order information</h2>
   <p>Customer: {order.email}</p><p>Delivery: {order.city.name}, {order.city.province}</p>
   <p>Total: R {(order.totalCents/100).toFixed(2)}</p>
   {order.trackingCourier&&<p>Tracking: {order.trackingCourier} · {order.trackingNumber}</p>}
   <div className="wt-tablewrap"><table className="wt-table"><thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Line total</th></tr></thead>
   <tbody>{order.items.map(i=><tr key={i.id}><td>{i.productName}</td><td>{i.sku}</td><td>{i.quantity}</td><td>R {(i.lineTotalCents/100).toFixed(2)}</td></tr>)}</tbody></table></div>
  </section>
  <section className="wt-card"><h2>Fulfillment and notifications</h2>
   {!editable?<p className="wt-help">Operational actions are disabled until migration and QA approval. This view is read-only.</p>:
    !actions.length?<p className="wt-help">No eligible admin action for this order. Verified payments and refunds cannot be entered manually.</p>:
    <div className="wt-stack">{actions.map(action=><form key={action.event} action={updateOrderFulfillment} className="wt-feature-row">
      <input type="hidden" name="orderId" value={order.id}/>
      <input type="hidden" name="event" value={action.event}/>
      {action.event==="DISPATCH_CONFIRMED"&&<div>
       <label>Courier <input required name="courier" maxLength={100}/></label>
       <label>Tracking number <input required name="trackingNumber" maxLength={100}/></label>
       <label>Tracking URL (optional) <input name="trackingUrl" type="url" maxLength={1000}/></label>
      </div>}
      <button type="submit" className="wt-btn light">{action.label}</button>
    </form>)}</div>}
   <p className="wt-help">Customers receive transactional updates only when verified order transitions are saved and the email-delivery worker is approved.</p>
  </section>
 </div>;
}
