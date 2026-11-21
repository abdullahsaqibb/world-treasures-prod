import test from "node:test";
import assert from "node:assert/strict";
import {toStorefrontItems} from "../src/lib/storefront-products";
const catalog=[{name:"Imported crisps",slug:"crisps",category:{name:"Chips"},images:[{url:"https://example.com/crisps.png"}],variants:[
 {id:"single",label:"Single pack",priceCents:4990,inventory:{onHand:7,reserved:2}},
 {id:"box",label:"Box of 12",priceCents:39990,inventory:{onHand:2,reserved:0}}
]}];
test("storefront retains each published variant with independent price and SKU identity",()=>{
 const items=toStorefrontItems(catalog);
 assert.deepEqual(items.map(x=>x.id),["single","box"]);
 assert.deepEqual(items.map(x=>x.priceCents),[4990,39990]);
 assert.deepEqual(items.map(x=>x.stock),[5,2]);
 assert.equal(items[0].name,"Imported crisps · Single pack");
});
test("storefront excludes unpriced variants, caps negative available stock and handles no gallery",()=>{
 const rows=toStorefrontItems([{...catalog[0],images:[],variants:[
 {id:"free",label:"Not priced",priceCents:0,inventory:null},
 {id:"out",label:"Available",priceCents:250,inventory:{onHand:0,reserved:3}}
 ]}]);
 assert.deepEqual(rows.map(x=>x.id),["out"]);
 assert.equal(rows[0].stock,0);
 assert.equal(rows[0].image,"");
});
