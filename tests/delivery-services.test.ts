import {test} from "node:test";
import assert from "node:assert/strict";
import {deliveryServices,parseDeliveryService,deliveryServiceLabel} from "../src/lib/delivery-services";

test("local and national delivery are separate supported modes",()=>{
 assert.deepEqual([...deliveryServices],["LOCAL","NATIONAL"]);
 assert.equal(parseDeliveryService("LOCAL"),"LOCAL");
 assert.equal(parseDeliveryService("NATIONAL"),"NATIONAL");
 assert.equal(deliveryServiceLabel("LOCAL"),"Local store delivery");
 assert.equal(deliveryServiceLabel("NATIONAL"),"Nationwide courier");
});
test("unrecognized delivery methods cannot be published or quoted",()=>{
 for(const value of ["STANDARD","DROP_SHIP","",null,undefined,"local","NATIONAL "])
  assert.throws(()=>parseDeliveryService(value),/valid delivery service/);
});
