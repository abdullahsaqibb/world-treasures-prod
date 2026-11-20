import {requireAdmin} from "@/auth";
import {inspectMediaCandidate, MEDIA_MAX_BYTES} from "@/lib/media-policy";
import {createHash,randomUUID} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const FOLDER="world-treasures/product-images";
const FORMATS=new Set(["jpg","jpeg","png","webp","avif"]);

function config(){
 const cloud=process.env.CLOUDINARY_CLOUD_NAME?.trim();
 const key=process.env.CLOUDINARY_API_KEY?.trim();
 const secret=process.env.CLOUDINARY_API_SECRET?.trim();
 if(!cloud||!key||!secret||!/^[a-zA-Z0-9_-]+$/.test(cloud)||!/^[0-9]+$/.test(key))return null;
 return {cloud,key,secret};
}
function json(value:unknown,status=200){return NextResponse.json(value,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});}
function validOrigin(req:NextRequest){return req.headers.get("origin")===req.nextUrl.origin;}
function validId(id:unknown):id is string{return typeof id==="string"&&/^world-treasures\/product-images\/[0-9a-f-]{36}$/.test(id);}
function signature(params:Record<string,string>,secret:string){
 const base=Object.entries(params).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>k+"="+v).join("&");
 return createHash("sha1").update(base+secret).digest("hex");
}
export async function GET(){
 try{await requireAdmin();}catch{return json({error:"Unauthorized"},401);}
 return json({configured:Boolean(config()),provider:"Cloudinary",maxBytes:MEDIA_MAX_BYTES});
}
export async function POST(req:NextRequest){
 try{await requireAdmin();}catch{return json({error:"Unauthorized"},401);}
 if(!validOrigin(req))return json({error:"Invalid request origin"},403);
 const credentials=config();
 if(!credentials)return json({error:"Cloudinary is not configured in this Preview environment"},503);
 if(Number(req.headers.get("content-length")||0)>4096)return json({error:"Request too large"},413);
 let body:Record<string,unknown>;
 try{body=await req.json();}catch{return json({error:"Invalid JSON"},400);}
 if(!body||typeof body!=="object")return json({error:"Invalid request"},400);
 if(body.action==="sign"){
  if(typeof body.name!=="string"||typeof body.type!=="string"||typeof body.size!=="number")return json({error:"Invalid file details"},400);
  const issue=inspectMediaCandidate({name:body.name,type:body.type,size:body.size});
  if(issue)return json({error:issue},400);
  const params={folder:FOLDER,overwrite:"false",public_id:randomUUID(),timestamp:String(Math.floor(Date.now()/1000))};
  return json({uploadUrl:`https://api.cloudinary.com/v1_1/${credentials.cloud}/image/upload`,apiKey:credentials.key,...params,signature:signature(params,credentials.secret),maxBytes:MEDIA_MAX_BYTES});
 }
 if(body.action==="confirm"){
  if(!validId(body.publicId))return json({error:"Invalid upload identifier"},400);
  // Verify the asset against Cloudinary itself: never trust a browser-provided URL.
  const url=`https://api.cloudinary.com/v1_1/${credentials.cloud}/resources/image/upload/${body.publicId.split("/").map(encodeURIComponent).join("/")}`;
  let upstream:Response;
  try{upstream=await fetch(url,{headers:{Authorization:"Basic "+Buffer.from(credentials.key+":"+credentials.secret).toString("base64")},cache:"no-store",signal:AbortSignal.timeout(12000)});}
  catch{return json({error:"Unable to verify upload"},502);}
  if(!upstream.ok)return json({error:upstream.status===404?"Uploaded image not found":"Cloudinary verification failed"},upstream.status===404?404:502);
  const item=await upstream.json() as {public_id?:string;secure_url?:string;bytes?:number;format?:string;resource_type?:string;type?:string};
  if(item.public_id!==body.publicId||item.resource_type!=="image"||item.type!=="upload"||!FORMATS.has((item.format||"").toLowerCase())||typeof item.bytes!=="number"||item.bytes<=0||item.bytes>MEDIA_MAX_BYTES)return json({error:"Uploaded image violates media policy"},400);
  try{
   const candidate=new URL(item.secure_url||"");
   if(candidate.protocol!=="https:"||candidate.hostname!=="res.cloudinary.com"||!candidate.pathname.startsWith("/"+credentials.cloud+"/image/upload/"))return json({error:"Unexpected image URL"},502);
  }catch{return json({error:"Invalid image URL"},502);}
  return json({url:item.secure_url,publicId:item.public_id});
 }
 return json({error:"Unknown operation"},400);
}
