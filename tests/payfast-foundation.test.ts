import {buildOrderStatusEmail} from "../src/lib/transactional-email";
import {test} from "node:test";
import assert from "node:assert/strict";
import {payFastCanonical,payFastSignature,verifyPayFastSignature,payFastSettings,payFastCheckoutUrls,payFastValidationUrls} from "../src/lib/payfast";
import {nextOrderState,noticeForEvent} from "../src/lib/order-lifecycle";
test("PayFast custom checkout signs ordered fields, excludes signature and escapes values",()=>{
 const f={merchant_id:"10000100",amount:"59.90",item_name:"Imported Chips & Snacks",signature:"untrusted"};
 const canonical=payFastCanonical(f,"secret phrase");
 assert.equal(canonical,"merchant_id=10000100&amount=59.90&item_name=Imported+Chips+%26+Snacks&passphrase=secret+phrase");
 const signature=payFastSignature(f,"secret phrase");
 assert.match(signature,/^[0-9a-f]{32}$/);
 assert.equal(verifyPayFastSignature(f,signature,"secret phrase"),true);
 assert.equal(verifyPayFastSignature(f,signature,"wrong"),false);
 assert.equal(verifyPayFastSignature(f,"bad","secret phrase"),false);
 assert.notEqual(signature,payFastSignature({amount:"59.90",merchant_id:"10000100",item_name:"Imported Chips & Snacks"},"secret phrase"));
});
test("PayFast URLs are environment specific and payment release is always gated",()=>{
 assert.match(payFastCheckoutUrls.sandbox,/^https:\/\/sandbox\.payfast\.co\.za/);
 assert.match(payFastCheckoutUrls.production,/^https:\/\/www\.payfast\.co\.za/);
 assert.match(payFastValidationUrls.sandbox,/sandbox/);
 assert.match(payFastValidationUrls.production,/www/);
 assert.equal(payFastSettings().checkoutEnabled,false);
});
test("order state changes require valid verified lifecycle event",()=>{
 assert.equal(nextOrderState("PENDING_PAYMENT","PAYMENT_VERIFIED"),"PAID");
 assert.equal(nextOrderState("PAID","START_PROCESSING"),"PROCESSING");
 assert.equal(nextOrderState("PROCESSING","DISPATCH_CONFIRMED"),"SHIPPED");
 assert.equal(nextOrderState("SHIPPED","DELIVERY_CONFIRMED"),"DELIVERED");
 assert.equal(nextOrderState("PAID","REFUND_VERIFIED"),"REFUNDED");
 assert.throws(()=>nextOrderState("PENDING_PAYMENT","DISPATCH_CONFIRMED"),/Invalid/);
 assert.throws(()=>nextOrderState("CANCELLED","PAYMENT_VERIFIED"),/Invalid/);
 assert.throws(()=>nextOrderState("DELIVERED","START_PROCESSING"),/Invalid/);
 assert.equal(noticeForEvent("PAYMENT_VERIFIED"),"PAYMENT_CONFIRMED");
 assert.equal(noticeForEvent("DISPATCH_CONFIRMED"),"SHIPPED");
});

test("customer status templates escape HTML and require genuine shipment tracking",()=>{
 const shipping=buildOrderStatusEmail("SHIPPED","WT-123","<Alice>",{courier:"Test Courier",trackingNumber:"ABC-123"});
 assert.match(shipping.html,/&lt;Alice&gt;/);
 assert.match(shipping.text,/ABC-123/);
 assert.throws(()=>buildOrderStatusEmail("SHIPPED","WT-123","Alice"),/tracking/);
 assert.match(buildOrderStatusEmail("REFUNDED","WT-123","Alice").subject,/refund/);
 for(const kind of ["PROCESSING","DELIVERED","CANCELLED"] as const)
  assert.match(buildOrderStatusEmail(kind,"WT-123","Alice").subject,/WT-123/);
});
