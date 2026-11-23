import {test} from "node:test";
import assert from "node:assert/strict";
import {buildPaidOrderEmail,buildEmailTest} from "../src/lib/transactional-email";

test("paid order email validates totals and formats South African Rand",()=>{
 const email=buildPaidOrderEmail({
  orderNumber:"WT-2026-1",customerName:"Test Customer",
  items:[{name:"Takis Fuego",quantity:2,unitPriceCents:5990}],
  subtotalCents:11980,shippingCents:4500,totalCents:16480,
  deliveryCity:"Durban",deliveryProvince:"KwaZulu-Natal"
 });
 assert.match(email.subject,/WT-2026-1/);
 assert.match(email.text,/Takis Fuego x 2/);
 assert.match(email.html,/Durban/);
 assert.match(email.text,/164[.,]80|164/);
});

test("email HTML escapes user-provided product names and customer names",()=>{
 const email=buildPaidOrderEmail({
  orderNumber:"WT-2026-2",customerName:"<script>alert(1)</script>",
  items:[{name:'Snack <img src=x onerror=alert(1)>',quantity:1,unitPriceCents:1000}],
  subtotalCents:1000,shippingCents:0,totalCents:1000,
  deliveryCity:"Cape Town",deliveryProvince:"Western Cape"
 });
 assert.doesNotMatch(email.html,/<script>/);
 assert.doesNotMatch(email.html,/<img src=x/);
 assert.match(email.html,/&lt;script&gt;/);
 assert.match(email.html,/&lt;img/);
});

test("paid order email rejects mismatched totals and quantities",()=>{
 const input={orderNumber:"WT-2026-3",customerName:"Person",items:[{name:"Snack",quantity:1,unitPriceCents:2500}],subtotalCents:2500,shippingCents:500,totalCents:3000,deliveryCity:"Pretoria",deliveryProvince:"Gauteng"};
 assert.throws(()=>buildPaidOrderEmail({...input,totalCents:2999}),/totals/);
 assert.throws(()=>buildPaidOrderEmail({...input,items:[{...input.items[0],quantity:0}]}),/quantities/);
});
test("test email is clearly not a real payment confirmation",()=>{
 const {subject,text}=buildEmailTest();
 assert.match(subject,/test/i);
 assert.match(text,/not a real order/i);
});
