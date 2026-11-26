import {test} from "node:test";
import assert from "node:assert/strict";
import {customerAccountOrigin} from "../src/lib/customer-account-origin";
import {buildOrderPlacedNotice,buildWelcomeNotice,buildOrderLifecyclePreview,buildAccountActionNotice,buildCartReminderNotice,notificationCatalog} from "../src/lib/notification-workflows";
test("all customer email events have explicit source requirements",()=>{
 assert.equal(notificationCatalog.length,11);
 assert.equal(notificationCatalog.find(x=>x.kind==="CART_REMINDER")?.source,"consented_marketing");
 assert.equal(notificationCatalog.find(x=>x.kind==="PAYMENT_CONFIRMED")?.source,"verified_payment");
 assert.equal(notificationCatalog.find(x=>x.kind==="ORDER_SHIPPED")?.source,"verified_fulfillment");
});
test("order received is not a paid confirmation and safely escapes customer input",()=>{
 const t=buildOrderPlacedNotice("WT-2026-123","<Alice>");
 assert.match(t.subject,/Order received/);
 assert.doesNotMatch(t.subject,/Payment confirmed/);
 assert.match(t.text,/awaiting payment confirmation/);
 assert.match(t.html,/&lt;Alice&gt;/);
 assert.doesNotMatch(t.html,/<Alice>/);
 assert.throws(()=>buildOrderPlacedNotice("<script>","Alice"),/Invalid/);
});
test("welcome notification requires a real customer identity",()=>{
 const t=buildWelcomeNotice("A & B");
 assert.match(t.html,/A &amp; B/);
 assert.throws(()=>buildWelcomeNotice(" "),/Invalid/);
});
test("transactional preview adapter does not send and guards unsupported events",()=>{
 const d={orderNumber:"WT-123",customerName:"Alex",items:[{name:"Chips",quantity:1,unitPriceCents:5990}],subtotalCents:5990,shippingCents:0,totalCents:5990,deliveryCity:"Gqeberha",deliveryProvince:"Eastern Cape"};
 assert.match(buildOrderLifecyclePreview("PAYMENT_CONFIRMED",d).subject,/Payment confirmed/);
 assert.match(buildOrderLifecyclePreview("ORDER_SHIPPED",d,{courier:"Courier",trackingNumber:"ABC123"}).subject,/on its way/);
 assert.throws(()=>buildOrderLifecyclePreview("CART_REMINDER",d),/separate/);
});

test("account verification and password reset URLs stay on the store domain",()=>{
 const verify=buildAccountActionNotice("ACCOUNT_VERIFICATION","Alex",customerAccountOrigin()+"/account/verify?token=abc123");
 assert.match(verify.text,/account\/verify/);
 const reset=buildAccountActionNotice("PASSWORD_RESET","Alex",customerAccountOrigin()+"/account/reset?token=xyz");
 assert.match(reset.subject,/Reset your password/);
 assert.throws(()=>buildAccountActionNotice("PASSWORD_RESET","Alex","https://evil.example/account/reset?token=x"),/Invalid/);
 assert.throws(()=>buildAccountActionNotice("ACCOUNT_VERIFICATION","Alex","http://www.worldtreasures.co.za/account/verify"),/Invalid/);
 assert.throws(()=>buildAccountActionNotice("ACCOUNT_VERIFICATION","Alex",customerAccountOrigin()+"/account/verify-malicious?token=x"),/Invalid/);
 assert.throws(()=>buildAccountActionNotice("PASSWORD_RESET","Alex",customerAccountOrigin()+"/account/reset-extra?token=x"),/Invalid/);
});
test("cart reminder requires marketing consent and cannot send from basket action alone",()=>{
 assert.throws(()=>buildCartReminderNotice("Alex",false),/consent/);
 assert.match(buildCartReminderNotice("Alex",true).subject,/bag/);
});
