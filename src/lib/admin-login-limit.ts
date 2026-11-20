import {createHmac} from "node:crypto";
import {db} from "@/lib/db";

/**
 * Shared throttling across serverless instances, backed by Neon.
 * Identifiers are HMACed with AUTH_SECRET; raw client IP/email are not stored.
 * 8 attempts within a 15-minute window; successful login resets both counters.
 * Missing database table or connection fails closed instead of disabling protection.
 */
const MAX_ATTEMPTS=8;
function key(label:string,value:string):string{
 const secret=process.env.AUTH_SECRET;
 if(!secret)throw new Error("Admin session secret missing");
 return createHmac("sha256",secret).update(label+"\0"+value).digest("hex");
}
function identifiers(email:string,request:Request):string[]{
 const ip=(request.headers.get("x-vercel-forwarded-for")||
           request.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim().slice(0,80);
 return [key("account",email),key("ip",ip)];
}
export async function allowOwnerSignIn(email:string,request:Request):Promise<boolean>{
 try{
  const keys=identifiers(email,request);
  for(const value of keys){
   const rows=await db.$queryRaw<Array<{attempts:number}>>`
    INSERT INTO "AdminLoginAttempt" ("key","attempts","windowStart")
    VALUES (${value},1,CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "attempts"=CASE
       WHEN "AdminLoginAttempt"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN 1
       ELSE "AdminLoginAttempt"."attempts"+1
      END,
      "windowStart"=CASE
       WHEN "AdminLoginAttempt"."windowStart" <= CURRENT_TIMESTAMP - INTERVAL '15 minutes' THEN CURRENT_TIMESTAMP
       ELSE "AdminLoginAttempt"."windowStart"
      END
    RETURNING "attempts"
   `;
   if((rows[0]?.attempts??MAX_ATTEMPTS+1)>MAX_ATTEMPTS)return false;
  }
  return true;
 }catch(error){
  console.error("Owner login throttling unavailable",error instanceof Error?error.name:"unknown");
  return false;
 }
}
export async function clearOwnerSignInFailures(email:string,request:Request):Promise<void>{
 const keys=identifiers(email,request);
 await db.adminLoginAttempt.updateMany({where:{key:{in:keys}},data:{attempts:0,windowStart:new Date()}});
}
