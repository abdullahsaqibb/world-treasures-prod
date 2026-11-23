import {db} from "./db";
import {buildAccountActionNotice} from "./notification-workflows";
import {queueVerifiedNotification} from "./notification-outbox";
import {
 createCustomerToken,hashCustomerToken,normalizedCustomerEmail,
 customerChallengeExpiry,customerSessionExpiry,customerSignInUrl
} from "./customer-auth-tokens";

/**
 * Internal backend service, NOT connected to publicly accessible routes.
 * Before public activation, add IP/email throttling, bot mitigation, generic
 * non-enumerating responses, transactional email and secure cookie endpoints.
 */
export async function createCustomerSignInChallenge(emailInput:string,now=new Date()){
 const email=normalizedCustomerEmail(emailInput);
 const rawToken=createCustomerToken();
 await db.customerLoginChallenge.create({
  data:{email,tokenHash:hashCustomerToken(rawToken),expiresAt:customerChallengeExpiry(now)}
 });
 return {email,token:rawToken};
}

/** Consumes the token atomically with the user/session write. One token cannot be replayed. */
export async function consumeCustomerSignInChallenge(token:string,now=new Date()){
 const tokenHash=hashCustomerToken(token);
 const sessionToken=createCustomerToken();
 const sessionHash=hashCustomerToken(sessionToken);
 const result=await db.$transaction(async tx=>{
  const challenge=await tx.customerLoginChallenge.findUnique({where:{tokenHash}});
  if(!challenge||challenge.consumedAt||challenge.expiresAt<=now)
   throw new Error("Customer sign-in link is invalid or expired");
  const claim=await tx.customerLoginChallenge.updateMany({
   where:{id:challenge.id,consumedAt:null,expiresAt:{gt:now}},
   data:{consumedAt:now}
  });
  if(claim.count!==1)throw new Error("Customer sign-in link has already been used");
  const user=await tx.user.upsert({
   where:{email:challenge.email},
   create:{email:challenge.email,role:"CUSTOMER"},
   update:{}
  });
  if(user.role!=="CUSTOMER")throw new Error("This identity is reserved");
  await tx.customerSession.create({
   data:{userId:user.id,tokenHash:sessionHash,expiresAt:customerSessionExpiry(now)}
  });
  return {userId:user.id,email:user.email};
 });
 return {...result,sessionToken};
}
export async function findActiveCustomerSession(token:string,now=new Date()){
 const tokenHash=hashCustomerToken(token);
 const session=await db.customerSession.findUnique({
  where:{tokenHash},include:{user:{select:{id:true,email:true,role:true}}}
 });
 if(!session||session.revokedAt||session.expiresAt<=now||session.user.role!=="CUSTOMER")return null;
 return {id:session.user.id,email:session.user.email};
}
export async function revokeCustomerSession(token:string){
 const tokenHash=hashCustomerToken(token);
 await db.customerSession.updateMany({where:{tokenHash,revokedAt:null},data:{revokedAt:new Date()}});
}

/**
 * Prepare a real one-time sign-in notification in the SAME transaction as its
 * challenge. No email is sent here: the disabled-by-default outbox worker handles
 * actual delivery once separately authorized and tested.
 *
 * Do not expose as a public endpoint until distributed throttling, enumeration
 * safeguards, abuse controls, and cookie-based verification are implemented.
 */
export async function prepareCustomerLoginEmail(emailInput:string,now=new Date()){
 if(process.env.CUSTOMER_ACCOUNTS_ENABLED!=="true")
  throw new Error("Customer accounts are not enabled");
 const email=normalizedCustomerEmail(emailInput);
 const token=createCustomerToken();
 const notice=buildAccountActionNotice("ACCOUNT_VERIFICATION","Customer",customerSignInUrl(token));
 await db.$transaction(async tx=>{
  const challenge=await tx.customerLoginChallenge.create({
   data:{email,tokenHash:hashCustomerToken(token),expiresAt:customerChallengeExpiry(now)}
  });
  await queueVerifiedNotification(tx,{
   eventKey:"login:"+challenge.id,
   kind:"ACCOUNT_VERIFICATION",
   recipient:email,
   subject:notice.subject,
   html:notice.html,
   text:notice.text
  },true);
 });
 // Never return the raw token or provider data to a public request handler.
 return {queued:true};
}
