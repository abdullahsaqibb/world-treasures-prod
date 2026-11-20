#!/usr/bin/env node
import {randomBytes} from "node:crypto";
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function toBase32(bytes){
 let value=0,bits=0,out="";
 for(const byte of bytes){value=(value<<8)|byte;bits+=8;while(bits>=5){bits-=5;out+=alphabet[(value>>>bits)&31];value&=(1<<bits)-1;}}
 if(bits>0)out+=alphabet[(value<<(5-bits))&31];
 return out;
}
const secret=toBase32(randomBytes(20));
const label="World Treasures:Owner";
const uri="otpauth://totp/"+encodeURIComponent(label)+"?"+new URLSearchParams({secret,issuer:"World Treasures",algorithm:"SHA1",digits:"6",period:"30"}).toString();
console.log("\nPrivate World Treasures authenticator setup");
console.log("Do NOT post the following in chat or GitHub. Store it securely.");
console.log("\nADMIN_TOTP_SECRET="+secret);
console.log("\nAuthenticator manual setup:");
console.log("Issuer: World Treasures | Account: Owner | Type: Time based | Digits: 6");
console.log("\nIf your authenticator supports a provisioning URL, use:");
console.log(uri);
console.log("\nApply ADMIN_TOTP_SECRET as a Sensitive Vercel environment variable on Preview first.");
console.log("Do not enable owner password auth in Production until this code, MFA and recovery are tested.\n");
