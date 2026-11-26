/**
 * Server-side transport only. No storefront, cart, customer or order action calls this yet.
 * Connect only to persisted, trusted lifecycle events with an outbox/unique event key.
 */
export type CustomerEmailMessage={
  eventKey:string;
  recipient:string;
  subject:string;
  html:string;
  text:string;
};
const validEmail=(value:string)=>/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
export function customerEmailTransportReady(env:NodeJS.ProcessEnv=process.env){
  return env.CUSTOMER_EMAIL_DELIVERY_ENABLED==="true" &&
    Boolean(env.RESEND_API_KEY?.trim()&&validEmail(env.TRANSACTIONAL_EMAIL_FROM?.trim()||""));
}
export async function sendCustomerTransactionalEmail(
  message:CustomerEmailMessage,
  options:{verifiedEvent:boolean;env?:NodeJS.ProcessEnv;send?:typeof fetch}
):Promise<{providerId:string}>{
  const env=options.env??process.env;
  if(!options.verifiedEvent)throw new Error("Customer notification requires a persisted verified event");
  if(!customerEmailTransportReady(env))throw new Error("Customer email delivery is disabled or not configured");
  if(!/^[A-Za-z0-9][A-Za-z0-9:_-]{7,127}$/.test(message.eventKey))
    throw new Error("Invalid notification event key");
  if(!validEmail(message.recipient)||message.recipient.length>254)
    throw new Error("Invalid recipient");
  if(!message.subject.trim()||message.subject.length>180||
     !message.html.trim()||!message.text.trim()||
     message.html.length>150000||message.text.length>150000)
    throw new Error("Invalid message content");
  // Resend idempotency applies to repeated requests using the same persisted event key.
  // This is not a replacement for a durable outbox and unique event constraints.
  const response=await (options.send??fetch)("https://api.resend.com/emails",{
    method:"POST",cache:"no-store",
    headers:{
      Authorization:"Bearer "+env.RESEND_API_KEY!.trim(),
      "Content-Type":"application/json",
      "Idempotency-Key":"wt-"+message.eventKey
    },
    body:JSON.stringify({
      from:env.TRANSACTIONAL_EMAIL_FROM!.trim(),
      to:[message.recipient.trim()],
      subject:message.subject,html:message.html,text:message.text
    }),
    signal:AbortSignal.timeout(10000)
  });
  if(!response.ok)throw new Error("Customer email provider rejected the request");
  const body=await response.json() as {id?:unknown};
  if(typeof body.id!=="string"||!body.id)throw new Error("Customer email provider returned no message ID");
  return {providerId:body.id};
}
