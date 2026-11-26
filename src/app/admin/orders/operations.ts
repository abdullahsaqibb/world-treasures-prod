"use server";
import {requireAdmin} from "@/auth";
import {applyAdminOrderAction} from "@/lib/order-operations";
import {redirect} from "next/navigation";

export async function updateOrderFulfillment(form:FormData){
 await requireAdmin();
 const orderId=String(form.get("orderId")||"").trim();
 if(!/^[a-zA-Z0-9_-]{8,128}$/.test(orderId))throw new Error("Invalid order");
 const event=String(form.get("event")||"");
 const courier=String(form.get("courier")||"");
 const trackingNumber=String(form.get("trackingNumber")||"");
 const trackingUrl=String(form.get("trackingUrl")||"");
 const tracking=event==="DISPATCH_CONFIRMED"?{courier,trackingNumber,trackingUrl}:undefined;
 try{
  await applyAdminOrderAction(orderId,event,tracking);
 }catch{
  redirect("/admin/orders/"+encodeURIComponent(orderId)+"?result=failed");
 }
 redirect("/admin/orders/"+encodeURIComponent(orderId)+"?result=updated");
}
