/** Transactional emails only. Never send messages from unverified order events. */
export type OrderEmailItem={name:string;quantity:number;unitPriceCents:number};
export type OrderEmailDetails={
 orderNumber:string;customerName:string;items:OrderEmailItem[];
 subtotalCents:number;shippingCents:number;totalCents:number;
 deliveryCity:string;deliveryProvince:string;
};
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]!));
const formatMoney=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
function checkOrder(details:OrderEmailDetails){
 if(!/^[a-zA-Z0-9-]{3,80}$/.test(details.orderNumber))throw new Error("Invalid order number");
 if(!details.items.length||details.items.length>100)throw new Error("Invalid order items");
 if(details.items.some(x=>!Number.isSafeInteger(x.quantity)||x.quantity<1||!Number.isSafeInteger(x.unitPriceCents)||x.unitPriceCents<0))throw new Error("Invalid order quantities");
 const subtotal=details.items.reduce((n,x)=>n+x.quantity*x.unitPriceCents,0);
 if(subtotal!==details.subtotalCents||!Number.isSafeInteger(details.shippingCents)||details.shippingCents<0||subtotal+details.shippingCents!==details.totalCents)throw new Error("Order totals do not match");
}
export function buildPaidOrderEmail(details:OrderEmailDetails){
 checkOrder(details);
 const rows=details.items.map(item=>`<tr><td style="padding:10px 0;border-bottom:1px solid #e5e5e5">${escapeHtml(item.name)} × ${item.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #e5e5e5;text-align:right">${formatMoney(item.quantity*item.unitPriceCents)}</td></tr>`).join("");
 const subject=`World Treasures · Payment confirmed · ${details.orderNumber}`;
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body style="background:#f9f5e9;color:#24271f;font:15px Arial,sans-serif;padding:26px"><main style="max-width:580px;margin:auto;background:white;padding:28px;border-radius:10px"><h1 style="font-size:24px">WORLD TREASURES</h1><p>Hi ${escapeHtml(details.customerName)},</p><p>We have confirmed payment for order <strong>${escapeHtml(details.orderNumber)}</strong>.</p><h2 style="font-size:17px">Your order</h2><table style="border-collapse:collapse;width:100%">${rows}<tr><td style="padding-top:16px">Subtotal</td><td style="text-align:right;padding-top:16px">${formatMoney(details.subtotalCents)}</td></tr><tr><td>Delivery</td><td style="text-align:right">${formatMoney(details.shippingCents)}</td></tr><tr><th style="text-align:left;padding-top:12px">Total paid</th><th style="text-align:right;padding-top:12px">${formatMoney(details.totalCents)}</th></tr></table><p>Delivery destination: ${escapeHtml(details.deliveryCity)}, ${escapeHtml(details.deliveryProvince)}.</p><p>We'll send an update when your order is ready for dispatch. This email is a payment confirmation, not proof that the order has shipped.</p><p>Thanks for discovering with us,<br>World Treasures</p></main></body></html>`;
 const text=`World Treasures — Payment confirmed\n\nHi ${details.customerName},\nYour payment for order ${details.orderNumber} is confirmed.\n\n${details.items.map(x=>`${x.name} x ${x.quantity}: ${formatMoney(x.quantity*x.unitPriceCents)}`).join("\n")}\nSubtotal: ${formatMoney(details.subtotalCents)}\nDelivery: ${formatMoney(details.shippingCents)}\nTotal paid: ${formatMoney(details.totalCents)}\nDelivery destination: ${details.deliveryCity}, ${details.deliveryProvince}.\nWe will update you when your order is ready for dispatch.\n\nWorld Treasures`;
 return {subject,html,text};
}
export function buildEmailTest(){
 return {subject:"World Treasures · Email connection test",
 html:"<div style='font-family:Arial,sans-serif;padding:24px;background:#f9f5e9'><h1>World Treasures</h1><p>Your transactional email connection is working.</p><p>This is an administrator test, not a real order or payment confirmation.</p></div>",
 text:"World Treasures email connection test. This is an administrator test, not a real order or payment confirmation."};
}
