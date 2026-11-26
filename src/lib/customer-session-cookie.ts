import {cookies} from "next/headers";
import {findActiveCustomerSession,revokeCustomerSession} from "./customer-auth-service";
import {CUSTOMER_SESSION_TTL_MS} from "./customer-auth-tokens";

export const CUSTOMER_COOKIE_NAME="wt-customer-session";
export const customerCookieOptions={
 httpOnly:true,secure:true,sameSite:"lax" as const,path:"/",
 maxAge:Math.floor(CUSTOMER_SESSION_TTL_MS/1000)
};
export async function setCustomerCookie(token:string){
 (await cookies()).set(CUSTOMER_COOKIE_NAME,token,customerCookieOptions);
}
export async function currentCustomer(){
 const token=(await cookies()).get(CUSTOMER_COOKIE_NAME)?.value;
 if(!token)return null;
 try{return await findActiveCustomerSession(token);}catch{return null;}
}
export async function signOutCustomer(){
 const cookieJar=await cookies();
 const token=cookieJar.get(CUSTOMER_COOKIE_NAME)?.value;
 if(token){try{await revokeCustomerSession(token);}catch{/* Cookie is still cleared. */}}
 cookieJar.delete(CUSTOMER_COOKIE_NAME);
}
