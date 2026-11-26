import {test} from "node:test";
import assert from "node:assert/strict";
import {validateOrderAction} from "../src/lib/order-operations";
test("admin order actions cannot mark paid or refunded",()=>{
 assert.throws(()=>validateOrderAction("PAYMENT_VERIFIED"),/not permitted/);
 assert.throws(()=>validateOrderAction("REFUND_VERIFIED"),/not permitted/);
 assert.equal(validateOrderAction("START_PROCESSING"),"START_PROCESSING");
});
test("dispatch requires a verified tracking identity and an https tracking link",()=>{
 assert.throws(()=>validateOrderAction("DISPATCH_CONFIRMED"),/tracking/);
 assert.throws(()=>validateOrderAction("DISPATCH_CONFIRMED",{courier:"Courier",trackingNumber:"bad !"}),/tracking/);
 assert.throws(()=>validateOrderAction("DISPATCH_CONFIRMED",{courier:"Courier",trackingNumber:"TRK123",trackingUrl:"javascript:alert(1)"}),/URL/);
 assert.equal(validateOrderAction("DISPATCH_CONFIRMED",{courier:"Courier",trackingNumber:"TRK123",trackingUrl:"https://courier.example/track/TRK123"}),"DISPATCH_CONFIRMED");
});
