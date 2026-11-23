import {test} from "node:test";
import assert from "node:assert/strict";
import {localDeliveryPolicy,assessLocalDeliveryDistance} from "../src/lib/local-delivery-policy";

test("Walmer store local coverage is 15 km, no implied fees",()=>{
 assert.equal(localDeliveryPolicy.maxDistanceKm,15);
 assert.match(localDeliveryPolicy.originAddress,/60-A Heugh Road/);
 assert.match(localDeliveryPolicy.originAddress,/Walmer/);
});
test("distance must be verified by the server and lie within the 15 km boundary",()=>{
 assert.deepEqual(assessLocalDeliveryDistance(null,false),{eligible:false,reason:"UNVERIFIED_DISTANCE"});
 assert.deepEqual(assessLocalDeliveryDistance(5,false),{eligible:false,reason:"UNVERIFIED_DISTANCE"});
 assert.deepEqual(assessLocalDeliveryDistance(-1,true),{eligible:false,reason:"UNVERIFIED_DISTANCE"});
 assert.deepEqual(assessLocalDeliveryDistance(Number.NaN,true),{eligible:false,reason:"UNVERIFIED_DISTANCE"});
 assert.deepEqual(assessLocalDeliveryDistance(15,true),{eligible:true,distanceKm:15});
 assert.deepEqual(assessLocalDeliveryDistance(15.01,true),{eligible:false,reason:"OUTSIDE_RADIUS"});
});
