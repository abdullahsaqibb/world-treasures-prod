import {test} from "node:test";
import assert from "node:assert/strict";
import {customerEmailTransportReady,sendCustomerTransactionalEmail} from "../src/lib/customer-email-transport";
const env={RESEND_API_KEY:"test-key",TRANSACTIONAL_EMAIL_FROM:"orders@worldtreasures.co.za",CUSTOMER_EMAIL_DELIVERY_ENABLED:"true"} as NodeJS.ProcessEnv;
const message={eventKey:"order:WT-001:paid",recipient:"customer@example.com",subject:"Payment confirmed",html:"<p>Paid</p>",text:"Paid"};
test("sending is disabled by default even with a configured Resend key",()=>{
 assert.equal(customerEmailTransportReady({...env,CUSTOMER_EMAIL_DELIVERY_ENABLED:undefined}),false);
 assert.equal(customerEmailTransportReady(env),true);
});
test("unverified events fail closed without contacting provider",async()=>{
 let sends=0;
 const send=(async()=>{sends++;return {ok:true,json:async()=>({id:"id"})};}) as unknown as typeof fetch;
 await assert.rejects(sendCustomerTransactionalEmail(message,{verifiedEvent:false,env,send}),/verified event/);
 await assert.rejects(sendCustomerTransactionalEmail(message,{verifiedEvent:true,env:{...env,CUSTOMER_EMAIL_DELIVERY_ENABLED:"false"},send}),/disabled/);
 assert.equal(sends,0);
});
test("rejects malformed event keys and email recipients",async()=>{
 const send=(async()=>{throw new Error("must not send");}) as unknown as typeof fetch;
 await assert.rejects(sendCustomerTransactionalEmail({...message,eventKey:"bad key"},{verifiedEvent:true,env,send}),/event key/);
 await assert.rejects(sendCustomerTransactionalEmail({...message,recipient:"not-an-email"},{verifiedEvent:true,env,send}),/recipient/);
});
test("uses a stable idempotency key and returns provider id",async()=>{
 let calls=0;
 const send=(async(url:unknown,init?:RequestInit)=>{
  calls++;
  assert.equal(url,"https://api.resend.com/emails");
  assert.equal((init?.headers as Record<string,string>)["Idempotency-Key"],"wt-order:WT-001:paid");
  assert.deepEqual(JSON.parse(String(init?.body)).to,["customer@example.com"]);
  return {ok:true,json:async()=>({id:"resend-msg-1"})};
 }) as unknown as typeof fetch;
 const result=await sendCustomerTransactionalEmail(message,{verifiedEvent:true,env,send});
 assert.equal(result.providerId,"resend-msg-1");
 assert.equal(calls,1);
});
