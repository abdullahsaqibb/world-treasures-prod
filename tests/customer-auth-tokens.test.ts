import {test} from "node:test";
import assert from "node:assert/strict";
import {
 normalizedCustomerEmail,createCustomerToken,hashCustomerToken,
 customerChallengeExpiry,customerSessionExpiry,customerSignInUrl
} from "../src/lib/customer-auth-tokens";
test("customer email normalization rejects malformed addresses",()=>{
 assert.equal(normalizedCustomerEmail("  Alex@Example.COM  "),"alex@example.com");
 assert.throws(()=>normalizedCustomerEmail("not-an-email"),/Invalid/);
 assert.throws(()=>normalizedCustomerEmail("x".repeat(255)+"@x.com"),/Invalid/);
});
test("customer tokens are random, hashed and never stored as plaintext",()=>{
 const one=createCustomerToken(),two=createCustomerToken();
 assert.notEqual(one,two);
 assert.equal(one.length,43);
 assert.match(hashCustomerToken(one),/^[0-9a-f]{64}$/);
 assert.notEqual(hashCustomerToken(one),one);
 assert.throws(()=>hashCustomerToken("too-short"),/Invalid/);
});
test("login and session expiries are bounded independently",()=>{
 const now=new Date("2026-11-23T12:00:00.000Z");
 assert.equal(customerChallengeExpiry(now).getTime()-now.getTime(),15*60*1000);
 assert.equal(customerSessionExpiry(now).getTime()-now.getTime(),7*24*60*60*1000);
});
test("verification links are anchored to the verified store domain",()=>{
 const token=createCustomerToken(),url=new URL(customerSignInUrl(token));
 assert.equal(url.origin,"https://www.worldtreasures.co.za");
 assert.equal(url.pathname,"/account/verify");
 assert.equal(url.searchParams.get("token"),token);
});
