"use client";
import {useEffect,useRef,useState} from "react";
import {inspectMediaCandidate} from "@/lib/media-policy";
type Props={onUploaded?:(url:string)=>void};
export function R2Uploader({onUploaded}:Props){
 const [enabled,setEnabled]=useState(false);
 const [status,setStatus]=useState<"checking"|"ready"|"missing">("checking");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  let cancelled=false;
  fetch("/api/admin/media/r2",{cache:"no-store",credentials:"same-origin"})
   .then(async r=>r.ok?await r.json():null)
   .then(data=>{if(cancelled)return;const ok=Boolean(data?.configured);setEnabled(ok);setStatus(ok?"ready":"missing")})
   .catch(()=>{if(!cancelled)setStatus("missing")});
  return()=>{cancelled=true};
 },[]);
 async function upload(file:File){
  const issue=inspectMediaCandidate({name:file.name,size:file.size,type:file.type});
  if(issue){setMessage(issue);return;}
  setBusy(true);setMessage("Requesting secure upload…");
  try{
   const sign=await fetch("/api/admin/media/r2",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"sign",name:file.name,type:file.type,size:file.size})});
   const signed=await sign.json();
   if(!sign.ok||typeof signed.uploadUrl!=="string"||typeof signed.key!=="string")throw new Error(signed.error||"Could not authorize upload");
   setMessage("Uploading photo to Cloudflare R2…");
   const transfer=await fetch(signed.uploadUrl,{method:"PUT",body:file,headers:{"Content-Type":file.type}});
   if(!transfer.ok)throw new Error("Cloudflare R2 upload failed. Check the bucket CORS policy and credentials.");
   setMessage("Verifying uploaded photo…");
   const verify=await fetch("/api/admin/media/r2",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"confirm",key:signed.key})});
   const verified=await verify.json();
   if(!verify.ok||typeof verified.url!=="string")throw new Error(verified.error||"Could not verify photo");
   onUploaded?.(verified.url);
   setMessage("Photo uploaded and verified. "+(onUploaded?"Save the product to retain its new image.":"Copy the URL below to use it in a product."));
   if(!onUploaded)setUrl(verified.url);
  }catch(error){setMessage(error instanceof Error?error.message:"Upload failed.");}
  finally{setBusy(false);if(input.current)input.current.value="";}
 }
 const [url,setUrl]=useState("");
 return <div className="wt-r2-uploader">
  <label className="wt-field"><span>Upload a photo directly to Cloudflare R2</span>
   <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy||!enabled} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void upload(file);}}/>
   <small>JPEG, PNG, WebP, AVIF · 8 MB maximum. Uploaded files are stored in your R2 bucket; use only product photographs.</small>
  </label>
  <p className="wt-help" role="status">{status==="checking"?"Checking storage configuration…":status==="missing"?"Cloudflare R2 is selected but not yet connected. Uploads remain disabled.":message||"Storage is configured. Choose a file to upload."}</p>
  {url&&<div className="wt-field"><span>Uploaded image URL</span><input readOnly value={url} onFocus={e=>e.target.select()} aria-label="Uploaded image URL for copying"/></div>}
 </div>;
}
