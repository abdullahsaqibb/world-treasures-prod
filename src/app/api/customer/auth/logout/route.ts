import {NextRequest,NextResponse} from "next/server";
import {CUSTOMER_COOKIE_NAME} from "@/lib/customer-session-cookie";
import {revokeCustomerSession} from "@/lib/customer-auth-service";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest){
 if(req.headers.get("origin")!==req.nextUrl.origin)return new NextResponse("Bad request",{status:403});
 const token=req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
 if(token){try{await revokeCustomerSession(token);}catch{/* Cookie cleared regardless */}}
 const response=NextResponse.redirect(new URL("/",req.url),303);
 response.cookies.delete(CUSTOMER_COOKIE_NAME);
 response.headers.set("Cache-Control","no-store");
 return response;
}
