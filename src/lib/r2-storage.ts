import "server-only";
import {S3Client} from "@aws-sdk/client-s3";

export type R2Config={accountId:string;bucket:string;accessKeyId:string;secretAccessKey:string;publicBaseUrl:string};
export function r2Configuration():R2Config|null{
 const {R2_ACCOUNT_ID,R2_BUCKET_NAME,R2_ACCESS_KEY_ID,R2_SECRET_ACCESS_KEY,R2_PUBLIC_BASE_URL}=process.env;
 if(!R2_ACCOUNT_ID||!R2_BUCKET_NAME||!R2_ACCESS_KEY_ID||!R2_SECRET_ACCESS_KEY||!R2_PUBLIC_BASE_URL)return null;
 if(!/^[a-f0-9]{32}$/i.test(R2_ACCOUNT_ID)||!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(R2_BUCKET_NAME))return null;
 try{
  const url=new URL(R2_PUBLIC_BASE_URL);
  if(url.protocol!=="https:"||url.username||url.password||url.search||url.hash)return null;
  return {accountId:R2_ACCOUNT_ID,bucket:R2_BUCKET_NAME,accessKeyId:R2_ACCESS_KEY_ID,secretAccessKey:R2_SECRET_ACCESS_KEY,publicBaseUrl:url.origin+url.pathname.replace(/\/$/,"")};
 }catch{return null;}
}
export function r2Client(config:R2Config){
 return new S3Client({region:"auto",endpoint:"https://"+config.accountId+".r2.cloudflarestorage.com",credentials:{accessKeyId:config.accessKeyId,secretAccessKey:config.secretAccessKey}});
}
export function r2PublicUrl(config:R2Config,key:string):string{
 return config.publicBaseUrl+"/"+key.split("/").map(encodeURIComponent).join("/");
}
export function imageExtension(type:string):string{
 return ({"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/avif":"avif"} as Record<string,string>)[type]||"";
}
export function imageSignatureMatches(type:string,buf:Uint8Array):boolean{
 const ascii=(start:number,end:number)=>String.fromCharCode(...buf.slice(start,end));
 if(type==="image/jpeg")return buf[0]===255&&buf[1]===216&&buf[2]===255;
 if(type==="image/png")return buf[0]===137&&ascii(1,4)==="PNG"&&buf[4]===13&&buf[5]===10&&buf[6]===26&&buf[7]===10;
 if(type==="image/webp")return ascii(0,4)==="RIFF"&&ascii(8,12)==="WEBP";
 if(type==="image/avif")return ascii(4,8)==="ftyp"&&(ascii(8,12)==="avif"||ascii(8,12)==="avis");
 return false;
}
