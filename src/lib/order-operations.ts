import {db} from "./db";
import {requireIsolatedPreviewDatabase} from "./preview-database-guard";
import {nextOrderState,type OrderLifecycleEvent} from "./order-lifecycle";
import {queueVerifiedNotification} from "./notification-outbox";
import {buildOrderLifecyclePreview} from "./notification-workflows";
import {releaseOrderInventory,finalizeOrderInventory} from "./order-inventory";

export type AdminOrderAction="START_PROCESSING"|"DISPATCH_CONFIRMED"|"DELIVERY_CONFIRMED"|"CANCEL_UNPAID";
type Tracking={courier:string;trackingNumber:string;trackingUrl?:string};

export function validateOrderAction(event:string,tracking?:Tracking):AdminOrderAction{
 if(!["START_PROCESSING","DISPATCH_CONFIRMED","DELIVERY_CONFIRMED","CANCEL_UNPAID"].includes(event))
  throw new Error("Order action not permitted");
 if(event==="DISPATCH_CONFIRMED"){
  if(!tracking||!tracking.courier.trim()||tracking.courier.length>100||
     !/^[A-Za-z0-9._/-]{4,100}$/.test(tracking.trackingNumber))
   throw new Error("Dispatch requires a valid courier and tracking number");
  if(tracking.trackingUrl){
   const url=new URL(tracking.trackingUrl);
   if(url.protocol!=="https:"||url.username||url.password||url.href.length>1000)
    throw new Error("Invalid tracking URL");
  }
 }
 return event as AdminOrderAction;
}
/**
 * Admin-authenticated caller only; actual payment verification and refunds
 * must come from a validated payment integration, not this function.
 * No public checkout or payment step calls this.
 */
export async function applyAdminOrderAction(orderId:string,eventInput:string,tracking?:Tracking){
 await requireIsolatedPreviewDatabase();
 if(process.env.ORDER_OPERATIONS_ENABLED!=="true")throw new Error("Order management actions are not enabled");
 if(!orderId||orderId.length>128)throw new Error("Invalid order");
 const event=validateOrderAction(eventInput,tracking);
 return db.$transaction(async tx=>{
  const order=await tx.order.findUnique({
   where:{id:orderId},
   include:{items:true,payments:{include:{events:true}},city:true,user:true}
  });
  if(!order)throw new Error("Order not found");
  const next=nextOrderState(order.status,event as OrderLifecycleEvent);
  // Never use an editable paid-status flag alone as evidence of payment.
  if(event==="START_PROCESSING"||event==="DISPATCH_CONFIRMED"||event==="DELIVERY_CONFIRMED"){
   const hasVerifiedPayment=order.payments.some(payment=>
     payment.status==="COMPLETED"&&payment.events.some(e=>e.verified));
   if(!hasVerifiedPayment)throw new Error("Verified payment record required");
  }
  const identity=order.items.map(item=>{
   if(!item.variantId)throw new Error("Order item lacks durable stock identity");
   return {variantId:item.variantId,quantity:item.quantity};
  });
  if(event==="DISPATCH_CONFIRMED")await finalizeOrderInventory(tx,identity);
  if(event==="CANCEL_UNPAID")await releaseOrderInventory(tx,identity);
  const updated=await tx.order.updateMany({
   where:{id:order.id,status:order.status},
   data:{
    status:next,
    ...(event==="DISPATCH_CONFIRMED"?{
     trackingCourier:tracking!.courier.trim(),
     trackingNumber:tracking!.trackingNumber,
     trackingUrl:tracking!.trackingUrl?.trim()||null
    }:{})
   }
  });
  if(updated.count!==1)throw new Error("Order was already updated by another operation");
  const notificationKind=event==="START_PROCESSING"?"ORDER_PROCESSING":
    event==="DISPATCH_CONFIRMED"?"ORDER_SHIPPED":
    event==="DELIVERY_CONFIRMED"?"ORDER_DELIVERED":"ORDER_CANCELLED";
  const details={
   orderNumber:order.orderNumber,
   customerName:order.user?.name||"Customer",
   items:order.items.map(item=>({name:item.productName,quantity:item.quantity,unitPriceCents:item.unitPriceCents})),
   subtotalCents:order.subtotalCents,shippingCents:order.shippingFeeCents,totalCents:order.totalCents,
   deliveryCity:order.city.name,deliveryProvince:order.city.province
  };
  const notice=buildOrderLifecyclePreview(notificationKind,details,tracking);
  await queueVerifiedNotification(tx,{
   eventKey:"order:"+order.id+":"+event,kind:notificationKind,recipient:order.email,
   subject:notice.subject,html:notice.html,text:notice.text
  },true);
  return {orderId:order.id,status:next};
 });
}
