import type {Prisma} from "@prisma/client";

export type ReservationLine={variantId:string;quantity:number};
export function normalizeReservationLines(lines:ReservationLine[]):ReservationLine[]{
 if(!Array.isArray(lines)||lines.length===0||lines.length>100)throw new Error("Invalid order lines");
 const totals=new Map<string,number>();
 for(const line of lines){
  if(!line||typeof line.variantId!=="string"||!line.variantId.trim()||line.variantId.length>128||
    !Number.isSafeInteger(line.quantity)||line.quantity<1||line.quantity>999)
   throw new Error("Invalid inventory reservation");
  const total=(totals.get(line.variantId)||0)+line.quantity;
  if(!Number.isSafeInteger(total)||total>999)throw new Error("Order quantity exceeds limit");
  totals.set(line.variantId,total);
 }
 return [...totals].map(([variantId,quantity])=>({variantId,quantity})).sort((a,b)=>a.variantId.localeCompare(b.variantId));
}
/**
 * Use ONLY inside the transaction that writes a persisted order and its lines.
 * The WHERE clause checks current DB values atomically, not a stale read.
 * If any line fails, throw to roll back the entire reservation and order.
 * Never reserve inventory from a local cart or pre-checkout preview.
 */
export async function reserveOrderInventory(tx:Prisma.TransactionClient,lines:ReservationLine[]){
 for(const line of normalizeReservationLines(lines)){
  const count=await tx.$executeRaw`
   UPDATE "Inventory"
      SET "reserved"="reserved"+${line.quantity}
    WHERE "variantId"=${line.variantId}
      AND "reserved">=0 AND "onHand">="reserved"
      AND ("onHand"-"reserved")>=${line.quantity}
  `;
  if(count!==1)throw new Error("Insufficient verified stock");
 }
}
/**
 * Call only after a verified, one-time cancellation/fulfillment transition,
 * in the same DB transaction. Enforces reservations cannot go negative.
 */
export async function releaseOrderInventory(tx:Prisma.TransactionClient,lines:ReservationLine[]){
 for(const line of normalizeReservationLines(lines)){
  const count=await tx.$executeRaw`
    UPDATE "Inventory"
       SET "reserved"="reserved"-${line.quantity}
     WHERE "variantId"=${line.variantId}
       AND "reserved">=${line.quantity}
  `;
  if(count!==1)throw new Error("Inventory reservation state mismatch");
 }
}
/** At verified fulfillment only: convert reserved inventory to sold inventory. */
export async function finalizeOrderInventory(tx:Prisma.TransactionClient,lines:ReservationLine[]){
 for(const line of normalizeReservationLines(lines)){
  const count=await tx.$executeRaw`
    UPDATE "Inventory"
       SET "reserved"="reserved"-${line.quantity}, "onHand"="onHand"-${line.quantity}
     WHERE "variantId"=${line.variantId}
       AND "reserved">=${line.quantity} AND "onHand">=${line.quantity}
  `;
  if(count!==1)throw new Error("Verified fulfillment inventory mismatch");
 }
}
