import {test} from "node:test";
import assert from "node:assert/strict";
import {normalizeReservationLines} from "../src/lib/order-inventory";
test("duplicate variants are combined and sorted for consistent row locking",()=>{
 assert.deepEqual(normalizeReservationLines([
  {variantId:"variant-z",quantity:2},{variantId:"variant-a",quantity:3},
  {variantId:"variant-z",quantity:1}
 ]),[{variantId:"variant-a",quantity:3},{variantId:"variant-z",quantity:3}]);
});
test("invalid and excessive stock requests fail before any database action",()=>{
 assert.throws(()=>normalizeReservationLines([]),/Invalid/);
 assert.throws(()=>normalizeReservationLines([{variantId:"a",quantity:0}]),/Invalid/);
 assert.throws(()=>normalizeReservationLines([{variantId:"a",quantity:1000}]),/Invalid/);
 assert.throws(()=>normalizeReservationLines([{variantId:"a",quantity:800},{variantId:"a",quantity:300}]),/exceeds/);
});
