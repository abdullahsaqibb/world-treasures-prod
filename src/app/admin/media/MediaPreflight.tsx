"use client";
import {useEffect,useMemo,useState} from "react";
import {inspectMediaCandidate,inspectMediaSelection,MEDIA_MAX_BYTES,MEDIA_MAX_FILES} from "@/lib/media-policy";
type Preview={name:string;size:number;url:string;type:string};
export function MediaPreflight(){
 const [files,setFiles]=useState<Preview[]>([]);
 const [issues,setIssues]=useState<string[]>([]);
 const totalBytes=useMemo(()=>files.reduce((n,f)=>n+f.size,0),[files]);
 useEffect(()=>()=>{files.forEach(f=>URL.revokeObjectURL(f.url))},[files]);
 function choose(selected:FileList|null){
  if(!selected){setIssues([]);setFiles([]);return;}
  const incoming=Array.from(selected);
  const errors=inspectMediaSelection(incoming);
  setIssues(errors);
  // Never persist local image files, upload, or write to the database.
  if(errors.length){setFiles([]);return;}
  setFiles(incoming.map(file=>({name:file.name,size:file.size,type:file.type,url:URL.createObjectURL(file)})));
 }
 return <section className="wt-card" aria-labelledby="wt-media-preflight"><div className="wt-cardhead"><div><span className="wt-eyebrow">PRODUCT PHOTOGRAPHY / PREPARATION</span><h2 id="wt-media-preflight">Check your product photos</h2></div><span className="wt-badge amber">Preview only</span></div>
 <p className="wt-lede">Select up to {MEDIA_MAX_FILES} photographs to inspect their size and format. They stay on this device—no upload or product change happens here.</p>
 <label className="wt-field" style={{marginTop:18}}>Choose product images
  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={e=>choose(e.currentTarget.files)} aria-describedby="wt-media-rules"/>
  <small id="wt-media-rules">JPEG, PNG, WebP or AVIF · Up to {MEDIA_MAX_BYTES/(1024*1024)} MB per file · Maximum {MEDIA_MAX_FILES} photos</small>
 </label>
 {issues.length>0&&<div className="wt-help wt-form-error" role="alert"><strong>These files cannot be accepted:</strong><ul>{issues.map((issue,i)=><li key={i}>{issue}</li>)}</ul></div>}
 {files.length>0&&<><div className="wt-help" role="status"><strong>{files.length} images pass initial checks</strong> · {(totalBytes/1024/1024).toFixed(2)} MB total. These are local previews only, not uploaded.</div><div className="wt-media-preview-grid">{files.map(file=><div className="wt-media-preview-item" key={file.name+"-"+file.size}><img alt={"Local preview of "+file.name} src={file.url}/><strong>{file.name}</strong><small>{(file.size/1024/1024).toFixed(2)} MB · {file.type.replace("image/","").toUpperCase()}</small></div>)}</div></>}
 <div className="wt-help"><strong>Storage not connected:</strong> Files are not saved. A secured upload route, Vercel Blob store and server-side file checks are required before these images can be attached to products.</div>
 </section>;
}
