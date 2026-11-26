import {type Prisma,type NotificationOutbox} from "@prisma/client";
import {db} from "./db";
import {requireIsolatedPreviewDatabase} from "./preview-database-guard";
import {sendCustomerTransactionalEmail,customerEmailTransportReady} from "./customer-email-transport";

type QueueClient=Pick<Prisma.TransactionClient,"notificationOutbox">;
type QueueMessage={
 eventKey:string;kind:string;recipient:string;subject:string;html:string;text:string;
};
/**
 * Call *inside the same database transaction* that persists a trusted lifecycle
 * event. The caller must derive eventKey from an immutable provider/order event.
 * Never enqueue for a browser click or payment return URL.
 */
export async function queueVerifiedNotification(
 tx:QueueClient,message:QueueMessage,verifiedEvent:boolean
):Promise<{created:boolean}>{
 if(!verifiedEvent)throw new Error("Verified event required");
 if(!/^[A-Za-z0-9][A-Za-z0-9:_-]{7,127}$/.test(message.eventKey))throw new Error("Invalid event key");
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(message.recipient))throw new Error("Invalid recipient");
 if(!message.kind||!message.subject.trim()||!message.html.trim()||!message.text.trim())throw new Error("Incomplete notification");
 const result=await tx.notificationOutbox.createMany({data:[message],skipDuplicates:true});
 return {created:result.count===1};
}

export function retryDelayMs(attempt:number):number{
 return Math.min(60*60*1000,30*1000*Math.pow(2,Math.min(7,Math.max(0,attempt-1))));
}
export type DispatchSummary={claimed:number;sent:number;failed:number;disabled:boolean};
/**
 * Internal-only worker: do not expose publicly. Scheduler may be attached
 * after deployment isolation, audited authorization and acceptance testing.
 */
export async function dispatchPendingNotifications(maxBatch=10):Promise<DispatchSummary>{
 await requireIsolatedPreviewDatabase();
 if(!customerEmailTransportReady())return {claimed:0,sent:0,failed:0,disabled:true};
 const now=new Date();
 const candidates=await db.notificationOutbox.findMany({
  where:{status:{in:["PENDING","FAILED"]},nextAttemptAt:{lte:now},attempts:{lt:5}},
  select:{id:true},orderBy:{createdAt:"asc"},take:Math.min(25,Math.max(1,maxBatch))
 });
 let claimed=0,sent=0,failed=0;
 for(const candidate of candidates){
  const lock=await db.notificationOutbox.updateMany({
   where:{id:candidate.id,status:{in:["PENDING","FAILED"]},nextAttemptAt:{lte:now},attempts:{lt:5}},
   data:{status:"PROCESSING",lockedAt:now,attempts:{increment:1}}
  });
  if(lock.count!==1)continue;
  claimed++;
  const event=await db.notificationOutbox.findUnique({where:{id:candidate.id}});
  if(!event)continue;
  try{
   const result=await sendCustomerTransactionalEmail({
    eventKey:event.eventKey,recipient:event.recipient,subject:event.subject,
    html:event.html,text:event.text
   },{verifiedEvent:true});
   await db.notificationOutbox.update({
    where:{id:event.id},
    data:{status:"SENT",providerId:result.providerId,lockedAt:null,lastError:null,sentAt:new Date()}
   });
   sent++;
  }catch{
   // Do not persist provider responses or secrets / customer message content.
   await db.notificationOutbox.update({
    where:{id:event.id},
    data:{status:"FAILED",lockedAt:null,lastError:"Delivery attempt failed",
     nextAttemptAt:new Date(Date.now()+retryDelayMs(event.attempts))}
   });
   failed++;
  }
 }
 return {claimed,sent,failed,disabled:false};
}
/**
 * PROCESSING rows require operational reconciliation before requeue:
 * an unknown provider response may already represent an accepted email.
 * Reuse the immutable event key to make any audited retry idempotent.
 */
export function needsReconciliation(event:Pick<NotificationOutbox,"status"|"lockedAt">,now=new Date()){
 return event.status==="PROCESSING"&&!!event.lockedAt&&now.getTime()-event.lockedAt.getTime()>15*60*1000;
}
