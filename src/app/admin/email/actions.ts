"use server";
import {requireAdmin} from "@/auth";
import {sendAdminEmailTest} from "@/lib/email-provider";

export type EmailTestState={status:"idle"|"sent"|"error";message:string};
export async function testTransactionalEmail(_prior:EmailTestState):Promise<EmailTestState>{
 await requireAdmin();
 if(process.env.VERCEL_ENV==="production"&&process.env.EMAIL_ADMIN_TEST_ENABLED!=="true")
   return {status:"error",message:"Administrator email test is disabled in Production. Set EMAIL_ADMIN_TEST_ENABLED=true after verifying the sender domain."};
 try{
  await sendAdminEmailTest();
  return {status:"sent",message:"Test accepted by the email provider. Check the admin inbox and message delivery status."};
 }catch(error){
  // Do not leak provider credentials or recipient addresses in action responses.
  return {status:"error",message:error instanceof Error&&error.message.startsWith("Email provider,")?error.message:"Email test could not be delivered. Check sender verification and provider settings."};
 }
}
