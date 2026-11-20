import test from "node:test";
import assert from "node:assert/strict";
import {money,qty,clean,optionalText,slugify,imagePath,checkAvailableStock,checkPublishEligibility} from "../src/lib/catalog-validation";

test("ZAR amounts convert to precise integer cents",()=>{
 assert.equal(money("12.50"),1250);
 assert.equal(money("12"),1200);
 assert.equal(money("0.01"),1);
 assert.equal(money("1000000"),100000000);
});
test("ZAR validation rejects negatives, excess decimals, scientific notation and oversized amounts",()=>{
 for(const value of ["-1","1.005","1e6","","1000000.01","1,000","NaN"," 1", "Infinity"]){
  assert.throws(()=>money(value),undefined,"Should reject "+value);
 }
});
test("stock quantity only accepts nonnegative integers within limit",()=>{
 assert.equal(qty("0"),0);
 assert.equal(qty("1000000"),1000000);
 for(const value of ["-1","2.3","1e2","1000001","NaN",""])assert.throws(()=>qty(value));
});
test("name and descriptions are trimmed and size-limited",()=>{
 assert.equal(clean("  Takis Fuego  "),"Takis Fuego");
 assert.equal(optionalText(null),"");
 assert.throws(()=>clean(" "));
 assert.throws(()=>clean("a".repeat(151)));
 assert.throws(()=>optionalText("a".repeat(1501)));
});
test("slugs normalize names and reject blank-only handles after normalization",()=>{
 assert.equal(slugify(" Takis Fuego · 90g "),"takis-fuego-90g");
 assert.equal(slugify("**"),"");
});
test("images permit local paths or HTTPS and block unsafe schemes or traversal",()=>{
 assert.equal(imagePath(""),null);
 assert.equal(imagePath("/products/takis.webp"),"/products/takis.webp");
 assert.equal(imagePath("https://example.com/a.png"),"https://example.com/a.png");
 for(const value of ["javascript:alert(1)","data:image/svg+xml,foo","http://example.com/x.png","//evil.example.com/path","/products/../hidden","/products/hello world.png","https://user:pass@example.com/photo.jpg"])assert.throws(()=>imagePath(value));
});
test("stock cannot be below reserved units",()=>{
 checkAvailableStock(12,2);
 checkAvailableStock(2,2);
 assert.throws(()=>checkAvailableStock(1,2));
 assert.throws(()=>checkAvailableStock(-1,0));
 assert.throws(()=>checkAvailableStock(5,-1));
});

test("publishing rejects unverified, unpriced or incomplete products",()=>{
 const valid={verified:true,name:"Takis Fuego 90g",description:"Imported savoury snack",images:["/products/berry.webp"],variants:[{sku:"WT-TAKIS",priceCents:4990,onHand:3,reserved:0}]};
 assert.doesNotThrow(()=>checkPublishEligibility(valid));
 assert.throws(()=>checkPublishEligibility({...valid,verified:false}),/Verify/);
 assert.throws(()=>checkPublishEligibility({...valid,description:""}),/description/);
 assert.throws(()=>checkPublishEligibility({...valid,images:[]}),/photo/);
 assert.throws(()=>checkPublishEligibility({...valid,variants:[]}),/variant/);
 assert.throws(()=>checkPublishEligibility({...valid,variants:[{...valid.variants[0],priceCents:0}]}),/price/);
 assert.throws(()=>checkPublishEligibility({...valid,variants:[{...valid.variants[0],onHand:0,reserved:2}]}),/Stock/);
});
