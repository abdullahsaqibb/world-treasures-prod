import {test} from "node:test";
import assert from "node:assert/strict";
import {retryDelayMs,needsReconciliation} from "../src/lib/notification-outbox";
test("failed delivery retry uses bounded exponential backoff",()=>{
 assert.equal(retryDelayMs(1),30000);
 assert.equal(retryDelayMs(2),60000);
 assert.equal(retryDelayMs(3),120000);
 assert.equal(retryDelayMs(20),3600000);
});
test("stale processing events require reconciliation, not automatic duplicate send",()=>{
 const now=new Date("2026-11-23T12:00:00Z");
 assert.equal(needsReconciliation({status:"PROCESSING",lockedAt:new Date("2026-11-23T11:30:00Z")},now),true);
 assert.equal(needsReconciliation({status:"PROCESSING",lockedAt:new Date("2026-11-23T11:55:00Z")},now),false);
 assert.equal(needsReconciliation({status:"SENT",lockedAt:new Date("2026-11-23T11:30:00Z")},now),false);
});
