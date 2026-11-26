import {db} from "./db";
import {buildAccountActionNotice} from "./notification-workflows";
import {sendCustomerTransactionalEmail} from "./customer-email-transport";
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
 * Authentication tokens are NEVER placed in the durable email outbox because
 * that would store bearer credentials in plaintext in its HTML/text columns.
 * Persist a hashed one-time challenge first, then deliver directly through
 * Resend with a stable provider idempotency key. Rate-limit the caller.
 */
export async function prepareCustomerLoginEmail(emailInput:string,now=new Date()){
 if(process.env.CUSTOMER_ACCOUNTS_ENABLED!=="true"||
    process.env.CUSTOMER_EMAIL_DELIVERY_ENABLED!=="true")
  throw new Error("Customer account email sign-in is not enabled");
 const email=normalizedCustomerEmail(emailInput);
 const token=createCustomerToken();
 const notice=buildAccountActionNotice("ACCOUNT_VERIFICATION","Customer",customerSignInUrl(token));
 const challenge=await db.customerLoginChallenge.create({
  data:{email,tokenHash:hashCustomerToken(token),expiresAt:customerChallengeExpiry(now)}
 });
 try{
  await sendCustomerTransactionalEmail({
   eventKey:"login:"+challenge.id,recipient:email,
   subject:notice.subject,html:notice.html,text:notice.text
  },{verifiedEvent:true});
 }catch{
  // An unsent, stored challenge must not linger as an active login link.
  // Even an ambiguous provider timeout cannot create an unauthorized session.
  await db.customerLoginChallenge.updateMany({
   where:{id:challenge.id,consumedAt:null},
   data:{expiresAt:now}
  });
  throw new Error("Customer sign-in email could not be delivered");
 }
 return {queued:false,sent:true};
}
