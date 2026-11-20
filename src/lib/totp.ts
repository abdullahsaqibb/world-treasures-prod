import {createHmac,timingSafeEqual} from "node:crypto";
/** RFC 6238 time-based one-time password verification (SHA1/30 seconds/6 digits). */
function decodeBase32(value:string):Buffer|null{
 const normalized=value.toUpperCase().replace(/[\s-]/g,"").replace(/=+$/,"");
 if(normalized.length<16||normalized.length>128||!/^[A-Z2-7]+$/.test(normalized))return null;
 const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
 const bytes:number[]=[];
 let bits=0,buffer=0;
 for(const ch of normalized){
  buffer=(buffer<<5)|alphabet.indexOf(ch);bits+=5;
  if(bits>=8){bits-=8;bytes.push((buffer>>bits)&255);buffer&=(1<<bits)-1}
 }
 return Buffer.from(bytes);
}
export function verifyTotp(secret:string,candidate:string,atMillis=Date.now()):boolean{
 if(!/^\d{6}$/.test(candidate)||!Number.isFinite(atMillis))return false;
 const decoded=decodeBase32(secret);
 if(!decoded)return false;
 const counter=Math.floor(atMillis/30000);
 for(let drift=-1;drift<=1;drift++){
  const step=counter+drift;
  if(step<0)continue;
  const data=Buffer.alloc(8);data.writeBigUInt64BE(BigInt(step));
  const digest=createHmac("sha1",decoded).update(data).digest();
  const offset=digest[digest.length-1]&15;
  const binary=((digest[offset]&0x7f)<<24)|(digest[offset+1]<<16)|(digest[offset+2]<<8)|digest[offset+3];
  const expected=String(binary%1000000).padStart(6,"0");
  if(timingSafeEqual(Buffer.from(expected),Buffer.from(candidate)))return true;
 }
 return false;
}
