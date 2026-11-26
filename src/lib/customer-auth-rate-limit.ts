import {createHmac} from "node:crypto";
import {db} from "./db";
import {requireIsolatedPreviewDatabase} from "./preview-database-guard";

/** Fail closed if a trusted proxy address, AUTH_SECRET or shared DB is absent. */
function hashedKey(label:string,value:string):string{
 const secret=process.env.AUTH_SECRET;
 if(!secret||secret.length<24)throw new Error("Missing request throttle secret");
 return createHmac("sha256",secret).update("customer-login\0"+label+"\0"+value).digest("hex");
}
export function customerThrottleKeys(email:string,ip:string){
 if(!ip||ip==="unknown"||ip.length>128)throw new Error("Trusted client IP unavailable");
 return [hashedKey("email",email),hashedKey("ip",ip)];
}
export async function allowCustomerSignInRequest(email:string,request:Request):Promise<boolean>{
 try{
  await requireIsolatedPreviewDatabase();
  // Never trust a client-controlled x-forwarded-for value for security decisions.
  // Vercel injects x-vercel-forwarded-for at its trusted proxy boundary.
  const ip=request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()||"";
  const [emailKey,ipKey]=customerThrottleKeys(email,ip);
  for(const [key,limit] of [[emailKey,4],[ipKey,20]] as const){
   const rows=await db.$queryRaw<Array<{attempts:number}>>`
     INSERT INTO "AdminLoginAttempt" ("key","attempts","windowStart")
     VALUES (${key},1,CURRENT_TIMESTAMP)
     ON CONFLICT ("key") DO UPDATE SET
       "attempts"=CASE WHEN "AdminLoginAttempt"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
                       THEN 1 ELSE "AdminLoginAttempt"."attempts"+1 END,
       "windowStart"=CASE WHEN "AdminLoginAttempt"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '1 hour'
                       THEN CURRENT_TIMESTAMP ELSE "AdminLoginAttempt"."windowStart" END
     RETURNING "attempts"
   `;
   if((rows[0]?.attempts??limit+1)>limit)return false;
  }
  return true;
 }catch{
  // Database connectivity and proxy-header failures must not bypass limits.
  return false;
 }
}
