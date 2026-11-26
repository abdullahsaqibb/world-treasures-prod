import {createHash,randomBytes} from "node:crypto";
import {customerAccountOrigin} from "./customer-account-origin";

/** Tokens must remain server-side and are never logged or added to URLs by untrusted input. */
export const CUSTOMER_CHALLENGE_TTL_MS=15*60*1000;
export const CUSTOMER_SESSION_TTL_MS=7*24*60*60*1000;
export function normalizedCustomerEmail(input:string){
 const email=input.trim().toLowerCase();
 if(email.length<3||email.length>254||!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))
  throw new Error("Invalid customer email");
 return email;
}
export function createCustomerToken(){
 return randomBytes(32).toString("base64url");
}
export function hashCustomerToken(token:string){
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))throw new Error("Invalid customer token");
 return createHash("sha256").update(token).digest("hex");
}
export function customerChallengeExpiry(now=new Date()){
 return new Date(now.getTime()+CUSTOMER_CHALLENGE_TTL_MS);
}
export function customerSessionExpiry(now=new Date()){
 return new Date(now.getTime()+CUSTOMER_SESSION_TTL_MS);
}
export function customerSignInUrl(token:string){
 hashCustomerToken(token);
 const url=new URL("/account/verify",customerAccountOrigin());
 url.searchParams.set("token",token);
 return url.toString();
}
