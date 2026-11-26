import {NextRequest,NextResponse} from "next/server";
import {normalizedCustomerEmail} from "@/lib/customer-auth-tokens";
import {allowCustomerSignInRequest} from "@/lib/customer-auth-rate-limit";
import {prepareCustomerLoginEmail} from "@/lib/customer-auth-service";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const sameOrigin=(req:NextRequest)=>req.headers.get("origin")===req.nextUrl.origin;
export async function POST(req:NextRequest){
 if(process.env.CUSTOMER_ACCOUNTS_ENABLED!=="true")
  return new NextResponse("Customer accounts are not enabled",{status:503,headers:{"Cache-Control":"no-store"}});
 if(!sameOrigin(req)||!req.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))
  return new NextResponse("Bad request",{status:403});
 let email="";
 try{
  const body=await req.text();
  if(body.length>1000)return new NextResponse("Bad request",{status:400});
  email=normalizedCustomerEmail(new URLSearchParams(body).get("email")||"");
 }catch{return NextResponse.redirect(new URL("/account/login?status=sent",req.url),303);}
 // Return the same public response whether or not a link was queued.
 try{
  if(await allowCustomerSignInRequest(email,req))await prepareCustomerLoginEmail(email);
 }catch{/* No account enumeration and no provider details in public responses. */}
 const response=NextResponse.redirect(new URL("/account/login?status=sent",req.url),303);
 response.headers.set("Cache-Control","no-store");
 return response;
}
