import {buildPaidOrderEmail,buildOrderStatusEmail,type OrderEmailDetails} from "./transactional-email";

export type NotificationKind=
 | "ORDER_PLACED" | "PAYMENT_CONFIRMED" | "ORDER_PROCESSING"
 | "ORDER_SHIPPED" | "ORDER_DELIVERED" | "ORDER_CANCELLED"
 | "ORDER_REFUNDED" | "ACCOUNT_WELCOME" | "ACCOUNT_VERIFICATION"
 | "PASSWORD_RESET" | "CART_REMINDER";
export type NotificationEvent={
 kind:NotificationKind;
 source:"persisted_order"|"verified_payment"|"verified_fulfillment"|"verified_account"|"consented_marketing";
};
export const notificationCatalog:ReadonlyArray<NotificationEvent>=[
 {kind:"ORDER_PLACED",source:"persisted_order"},
 {kind:"PAYMENT_CONFIRMED",source:"verified_payment"},
 {kind:"ORDER_PROCESSING",source:"verified_fulfillment"},
 {kind:"ORDER_SHIPPED",source:"verified_fulfillment"},
 {kind:"ORDER_DELIVERED",source:"verified_fulfillment"},
 {kind:"ORDER_CANCELLED",source:"persisted_order"},
 {kind:"ORDER_REFUNDED",source:"verified_payment"},
 {kind:"ACCOUNT_WELCOME",source:"verified_account"},
 {kind:"ACCOUNT_VERIFICATION",source:"verified_account"},
 {kind:"PASSWORD_RESET",source:"verified_account"},
 {kind:"CART_REMINDER",source:"consented_marketing"}
];
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]!));
const safeName=(s:string)=>{if(!s.trim()||s.length>120)throw new Error("Invalid customer name");return s.trim()};
const safeOrder=(s:string)=>{if(!/^[A-Za-z0-9-]{3,80}$/.test(s))throw new Error("Invalid order number");return s};
const layout=(heading:string,name:string,message:string)=>({
 html:`<!doctype html><html lang="en"><body style="font:15px Arial,sans-serif;background:#f9f5e9;padding:24px"><main style="margin:auto;max-width:580px;padding:28px;background:#fff;color:#202932"><h1 style="font-size:22px">WORLD TREASURES</h1><h2>${escapeHtml(heading)}</h2><p>Hello ${escapeHtml(name)},</p><p>${escapeHtml(message)}</p><p>World Treasures</p></main></body></html>`,
 text:`World Treasures — ${heading}\nHello ${name},\n\n${message}\n\nWorld Treasures`
});
export function buildOrderPlacedNotice(orderNumber:string,customerName:string){
 const order=safeOrder(orderNumber),name=safeName(customerName);
 const subject=`World Treasures · Order received · ${order}`;
 const message=`We received your order ${order}. It is awaiting payment confirmation. Please do not treat this message as a paid receipt or dispatch confirmation.`;
 return {subject,...layout("Order received",name,message)};
}
export function buildWelcomeNotice(customerName:string){
 const name=safeName(customerName);
 return {subject:"Welcome to World Treasures",...layout("Welcome to World Treasures",name,"Your customer account has been created. Browse our imported snacks and drinks whenever you like.")};
}
/** Preview/template adapter, not a sending trigger. It must never initiate customer emails itself. */
export function buildOrderLifecyclePreview(kind:NotificationKind,details:OrderEmailDetails,tracking?:{courier:string;trackingNumber:string;trackingUrl?:string}){
 switch(kind){
  case "ORDER_PLACED":return buildOrderPlacedNotice(details.orderNumber,details.customerName);
  case "PAYMENT_CONFIRMED":return buildPaidOrderEmail(details);
  case "ORDER_PROCESSING":return buildOrderStatusEmail("PROCESSING",details.orderNumber,details.customerName);
  case "ORDER_SHIPPED":return buildOrderStatusEmail("SHIPPED",details.orderNumber,details.customerName,tracking);
  case "ORDER_DELIVERED":return buildOrderStatusEmail("DELIVERED",details.orderNumber,details.customerName);
  case "ORDER_CANCELLED":return buildOrderStatusEmail("CANCELLED",details.orderNumber,details.customerName);
  case "ORDER_REFUNDED":return buildOrderStatusEmail("REFUNDED",details.orderNumber,details.customerName);
  default:throw new Error("Notification requires a separate verified account or consent workflow");
 }
}

/** Email links are created only by the future verified customer-account flow. */
export function buildAccountActionNotice(kind:"ACCOUNT_VERIFICATION"|"PASSWORD_RESET",customerName:string,actionUrl:string){
 const name=safeName(customerName);
 const url=new URL(actionUrl);
 if(url.protocol!=="https:"||url.host!=="www.worldtreasures.co.za"||
  (kind==="ACCOUNT_VERIFICATION"?url.pathname!=="/account/verify":url.pathname!=="/account/reset"))
  throw new Error("Invalid account action URL");
 const heading=kind==="ACCOUNT_VERIFICATION"?"Verify your email address":"Reset your password";
 const message=kind==="ACCOUNT_VERIFICATION"?"Please verify your email address using the secure link below.":"A password reset was requested for your account. Ignore this message if you did not request it.";
 const link=url.toString();
 const content=layout(heading,name,message);
 return {
  subject:"World Treasures · "+heading,
  text:content.text+"\n\n"+link,
  html:content.html.replace("</main>","<p><a href=\""+escapeHtml(link)+"\">"+escapeHtml(heading)+"</a></p></main>")
 };
}
/** Marketing reminders are NEVER sent for a mere add-to-basket click. */
export function buildCartReminderNotice(customerName:string,hasOptedIn:boolean){
 if(!hasOptedIn)throw new Error("Cart reminders require documented marketing consent");
 const name=safeName(customerName);
 return {subject:"Your World Treasures bag is waiting",...layout("Something caught your eye?",name,"If you still want to browse your saved bag, visit World Treasures. Online checkout may not yet be available.")};
}
