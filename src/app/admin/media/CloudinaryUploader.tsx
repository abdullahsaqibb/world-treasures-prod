"use client";
import {useEffect,useRef,useState} from "react";
import {inspectMediaCandidate} from "@/lib/media-policy";
type Props={onUploaded?:(url:string)=>void};
export function CloudinaryUploader({onUploaded}:Props){
 const [configured,setConfigured]=useState(false);
 const [status,setStatus]=useState<"checking"|"ready"|"missing">("checking");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [url,setUrl]=useState("");
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  let cancelled=false;
  fetch("/api/admin/media/cloudinary",{cache:"no-store",credentials:"same-origin"})
   .then(async r=>r.ok?await r.json():null)
   .then(data=>{if(cancelled)return;const ok=Boolean(data?.configured);setConfigured(ok);setStatus(ok?"ready":"missing");})
   .catch(()=>{if(!cancelled)setStatus("missing");});
  return()=>{cancelled=true;};
 },[]);
 async function upload(file:File){
  const issue=inspectMediaCandidate({name:file.name,type:file.type,size:file.size});
  if(issue){setMessage(issue);return;}
  setBusy(true);setUrl("");setMessage("Authorizing upload…");
  try{
   const signResp=await fetch("/api/admin/media/cloudinary",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"sign",name:file.name,type:file.type,size:file.size})});
   const signed=await signResp.json();
   if(!signResp.ok||!signed.uploadUrl||!signed.signature)throw new Error(signed.error||"Could not authorize upload");
   const form=new FormData();
   form.append("file",file);
   for(const key of ["apiKey","folder","overwrite","public_id","timestamp","signature"]){
    form.append(key==="apiKey"?"api_key":key,String(signed[key]));
   }
   setMessage("Uploading to Cloudinary…");
   const transfer=await fetch(signed.uploadUrl,{method:"POST",body:form});
   const uploaded=await transfer.json();
   if(!transfer.ok||typeof uploaded.public_id!=="string")throw new Error(uploaded.error?.message||"Cloudinary upload failed");
   setMessage("Verifying uploaded image…");
   const verifyResp=await fetch("/api/admin/media/cloudinary",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"confirm",publicId:uploaded.public_id})});
   const verified=await verifyResp.json();
   if(!verifyResp.ok||typeof verified.url!=="string")throw new Error(verified.error||"Upload verification failed");
   setUrl(verified.url);
   onUploaded?.(verified.url);
   setMessage(onUploaded?"Image verified. Save the product to link it to the catalog.":"Image verified. Copy the link to add it to a product.");
  }catch(e){setMessage(e instanceof Error?e.message:"Upload failed");}
  finally{setBusy(false);if(input.current)input.current.value="";}
 }
 return <div className="wt-r2-uploader">
  <label className="wt-field"><span>Upload a product photo to Cloudinary</span>
   <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={!configured||busy} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void upload(file);}}/>
   <small>JPEG, PNG, WebP or AVIF · Maximum 8 MB. Only upload product photos.</small>
  </label>
  <p className="wt-help" role="status">{status==="checking"?"Checking storage configuration…":status==="missing"?"Cloudinary is not yet configured for this preview.":busy?message:message||"Cloudinary is ready for a test upload."}</p>
  {url&&<label className="wt-field">Verified image URL<input readOnly value={url} onFocus={e=>e.target.select()}/></label>}
 </div>;
}
