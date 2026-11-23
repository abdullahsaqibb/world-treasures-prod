import {createHash,timingSafeEqual} from "node:crypto";
/** PayFast's CUSTOM checkout signature has insertion-ordered fields.
 * Do not reuse PayFast's alphabetically-sorted server API signature.
 */
export type PayFastPaymentFields=Record<string,string|number|undefined|null>;
const encodePayFast=(value:string)=>encodeURIComponent(value.trim()).replace(/%20/g,"+").replace(/[!'()*]/g,ch=>"%"+ch.charCodeAt(0).toString(16).toUpperCase());
export function payFastCanonical(fields:PayFastPaymentFields,passphrase?:string){
 const pairs=Object.entries(fields).filter(([key,value])=>
  key!=="signature"&&value!==undefined&&value!==null&&String(value).trim()!==""
 ).map(([key,value])=>key+"="+encodePayFast(String(value)));
 if(passphrase?.trim())pairs.push("passphrase="+encodePayFast(passphrase));
 return pairs.join("&");
}
export function payFastSignature(fields:PayFastPaymentFields,passphrase?:string){
 return createHash("md5").update(payFastCanonical(fields,passphrase),"utf8").digest("hex");
}
export function verifyPayFastSignature(fields:PayFastPaymentFields,expected:string,passphrase?:string){
 if(!/^[a-f0-9]{32}$/i.test(expected))return false;
 return timingSafeEqual(Buffer.from(payFastSignature(fields,passphrase),"hex"),Buffer.from(expected,"hex"));
}
export const payFastCheckoutUrls={
 sandbox:"https://sandbox.payfast.co.za/eng/process",
 production:"https://www.payfast.co.za/eng/process"
} as const;
export const payFastValidationUrls={
 sandbox:"https://sandbox.payfast.co.za/eng/query/validate",
 production:"https://www.payfast.co.za/eng/query/validate"
} as const;
export function payFastSettings(){
 const merchantId=process.env.PAYFAST_MERCHANT_ID?.trim()||"";
 const merchantKey=process.env.PAYFAST_MERCHANT_KEY?.trim()||"";
 const passphrase=process.env.PAYFAST_PASSPHRASE?.trim()||"";
 const configured=Boolean(merchantId&&merchantKey&&passphrase);
 return {
  merchantIdPresent:Boolean(merchantId),
  merchantKeyPresent:Boolean(merchantKey),
  passphrasePresent:Boolean(passphrase),
  configured,
  checkoutEnabled:false, // hard launch gate: enabling credentials must never silently enable payments
  environment:process.env.VERCEL_ENV==="production"?"production":"sandbox"
 } as const;
}
