import {test} from "node:test";
import assert from "node:assert/strict";
import {customerAccountOrigin} from "../src/lib/customer-account-origin";
test("production account URLs always use canonical store domain",()=>{
 assert.equal(customerAccountOrigin({VERCEL_ENV:"production",VERCEL_URL:"attacker.example"} as NodeJS.ProcessEnv),"https://www.worldtreasures.co.za");
});
test("preview account URLs accept only the project Vercel hostname",()=>{
 assert.equal(customerAccountOrigin({VERCEL_ENV:"preview",VERCEL_URL:"world-treasures-prod-example-123.vercel.app"} as NodeJS.ProcessEnv),"https://world-treasures-prod-example-123.vercel.app");
 assert.throws(()=>customerAccountOrigin({VERCEL_ENV:"preview",VERCEL_URL:"attacker.vercel.app"} as NodeJS.ProcessEnv));
 assert.throws(()=>customerAccountOrigin({VERCEL_ENV:"preview",VERCEL_URL:"world-treasures-prod-example.vercel.app.evil.com"} as NodeJS.ProcessEnv));
});
