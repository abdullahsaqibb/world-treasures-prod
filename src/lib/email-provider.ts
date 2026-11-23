import {buildEmailTest} from "./transactional-email";

export function emailConfiguration(){
 const apiKey=process.env.RESEND_API_KEY?.trim()||"";
 const from=process.env.TRANSACTIONAL_EMAIL_FROM?.trim()||"";
 const recipient=process.env.ADMIN_LOGIN_EMAIL?.trim()||"";
 const validFrom=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(from);
 const validRecipient=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient);
 const configured=Boolean(apiKey&&validFrom&&validRecipient);
 return {configured,hasApiKey:Boolean(apiKey),hasSender:validFrom,hasAdminRecipient:validRecipient};
}

export async function sendAdminEmailTest(){
 const cfg=emailConfiguration();
 if(!cfg.configured)throw new Error("Email provider, verified sender and admin recipient must be configured before testing");
 const recipient=process.env.ADMIN_LOGIN_EMAIL!.trim();
 const from=process.env.TRANSACTIONAL_EMAIL_FROM!.trim();
 const key=process.env.RESEND_API_KEY!.trim();
 const template=buildEmailTest();
 const response=await fetch("https://api.resend.com/emails",{
   method:"POST",cache:"no-store",
   headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
   body:JSON.stringify({from,to:[recipient],...template}),
   signal:AbortSignal.timeout(10000)
 });
 if(!response.ok)throw new Error("Email provider rejected the test. Review verified domain and sender configuration.");
 const result=await response.json() as {id?:unknown};
 if(typeof result.id!=="string"||!result.id)throw new Error("Provider did not confirm a message ID");
 return {id:result.id};
}
