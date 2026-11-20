import {requireAdmin} from "@/auth";
import {inspectMediaCandidate,imageSignatureMatches,MEDIA_MAX_BYTES} from "@/lib/media-policy";
import {imageExtension,r2Client,r2Configuration,r2PublicUrl} from "@/lib/r2-storage";
import {GetObjectCommand,HeadObjectCommand,PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {NextRequest,NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
export const runtime="nodejs";
export const dynamic="force-dynamic";

function response(body:unknown,status=200){return NextResponse.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
function sameOrigin(request:NextRequest){
 const origin=request.headers.get("origin");
 if(!origin)return false;
 // Browser admin UI POSTs must originate from the same host and scheme, including branch preview.
 return origin===request.nextUrl.origin;
}
export async function GET(){
 try{
  await requireAdmin();
  return response({configured:Boolean(r2Configuration()),provider:"Cloudflare R2",maxBytes:MEDIA_MAX_BYTES});
 }catch{return response({error:"Unauthorized"},401);}
}
export async function POST(request:NextRequest){
 try{await requireAdmin();}catch{return response({error:"Unauthorized"},401);}
 try{
 if(!sameOrigin(request))return response({error:"Invalid origin"},403);
 const config=r2Configuration();
 if(!config)return response({error:"R2 storage is not configured for this environment"},503);
 const length=Number(request.headers.get("content-length")||"0");
 if(length>4096)return response({error:"Request too large"},413);
 let body:Record<string,unknown>;
 try{body=await request.json();}catch{return response({error:"Invalid request"},400);}
 if(!body||typeof body!=="object"||typeof body.action!=="string")return response({error:"Invalid request"},400);
 const client=r2Client(config);
 if(body.action==="sign"){
  const name=body.name,type=body.type,size=body.size;
  if(typeof name!=="string"||typeof type!=="string"||typeof size!=="number")return response({error:"Invalid image details"},400);
  const problem=inspectMediaCandidate({name,type,size});
  if(problem)return response({error:problem},400);
  const ext=imageExtension(type);
  if(!ext)return response({error:"Unsupported format"},400);
  const key="product-images/"+randomUUID()+"."+ext;
  // Short-lived PUT capability; AWS credentials never leave the server.
  const uploadUrl=await getSignedUrl(client,new PutObjectCommand({Bucket:config.bucket,Key:key,ContentType:type}),{expiresIn:90});
  return response({key,uploadUrl,expiresIn:90});
 }
 if(body.action==="confirm"){
  const key=body.key;
  if(typeof key!=="string"||!/^product-images\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/.test(key))return response({error:"Invalid media key"},400);
  let head;
  try{head=await client.send(new HeadObjectCommand({Bucket:config.bucket,Key:key}));}catch{return response({error:"Upload not found"},404);}
  const type=head.ContentType??"",size=head.ContentLength??0;
  const issue=inspectMediaCandidate({name:key.split("/").at(-1)??"",size,type});
  if(issue)return response({error:issue},400);
  try{
   const data=await client.send(new GetObjectCommand({Bucket:config.bucket,Key:key,Range:"bytes=0-31"}));
   const start=await data.Body?.transformToByteArray();
   if(!start||!imageSignatureMatches(type,start))return response({error:"File contents do not match image format"},400);
  }catch{return response({error:"Could not verify uploaded image contents"},502);}
  return response({url:r2PublicUrl(config,key),key});
 }
 return response({error:"Unknown media operation"},400);
 }catch(e){console.error("R2 media operation failed",e instanceof Error?e.name:"unknown");return response({error:"Media storage request failed"},500);}
}
