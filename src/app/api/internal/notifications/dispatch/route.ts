import {NextRequest,NextResponse} from "next/server";
import {timingSafeEqual} from "node:crypto";
import {dispatchPendingNotifications} from "@/lib/notification-outbox";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const configured=process.env.CRON_SECRET||"";
 const auth=req.headers.get("authorization")||"";
 const expected="Bearer "+configured;
 const valid=configured.length>=32&&Buffer.byteLength(auth)===Buffer.byteLength(expected)&&
  timingSafeEqual(Buffer.from(auth),Buffer.from(expected));
 if(!valid)return new NextResponse("Unauthorized",{status:401});
 if(process.env.CUSTOMER_EMAIL_DELIVERY_ENABLED!=="true")
  return NextResponse.json({disabled:true},{headers:{"Cache-Control":"no-store"}});
 try{
  const outcome=await dispatchPendingNotifications(10);
  return NextResponse.json(outcome,{headers:{"Cache-Control":"no-store"}});
 }catch{
  return NextResponse.json({error:"Notification worker unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}
