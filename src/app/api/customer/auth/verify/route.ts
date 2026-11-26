import {NextRequest,NextResponse} from "next/server";
import {consumeCustomerSignInChallenge} from "@/lib/customer-auth-service";
import {CUSTOMER_COOKIE_NAME,customerCookieOptions} from "@/lib/customer-session-cookie";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){
 if(process.env.CUSTOMER_ACCOUNTS_ENABLED!=="true")
  return new NextResponse("Customer login is not available",{status:503});
 if(req.headers.get("origin")!==req.nextUrl.origin||
    !req.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))
  return new NextResponse("Bad request",{status:403});
 let token="";
 try{
  const raw=await req.text();
  if(raw.length>200)return new NextResponse("Bad request",{status:400});
  token=new URLSearchParams(raw).get("token")||"";
 }catch{return new NextResponse("Invalid request",{status:400});}
 try{
  const customer=await consumeCustomerSignInChallenge(token);
  if(!customer.userId)return new NextResponse("Invalid account",{status:400});
  const response=NextResponse.redirect(new URL("/account",req.url),303);
  response.cookies.set(CUSTOMER_COOKIE_NAME,customer.sessionToken,customerCookieOptions);
  response.headers.set("Cache-Control","no-store");
  return response;
 }catch{
  const response=NextResponse.redirect(new URL("/account/login?status=invalid",req.url),303);
  response.headers.set("Cache-Control","no-store");
  return response;
 }
}
