import test from "node:test";
import assert from "node:assert/strict";
import {verifyTotp} from "../src/lib/totp";
const secret="GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // RFC 6238 ASCII secret "12345678901234567890"
test("RFC 6238 SHA1 known time-step matches last six digits",()=>{
 assert.equal(verifyTotp(secret,"287082",59000),true);
 assert.equal(verifyTotp(secret,"081804",1111111109000),true);
});
test("TOTP rejects invalid codes, invalid secrets and stale codes",()=>{
 assert.equal(verifyTotp(secret,"abc123",59000),false);
 assert.equal(verifyTotp("bad","287082",59000),false);
 assert.equal(verifyTotp(secret,"287082",119000),false);
});
test("TOTP tolerates only one adjacent 30-second step",()=>{
 assert.equal(verifyTotp(secret,"287082",89000),true);
 assert.equal(verifyTotp(secret,"287082",149000),false);
});
