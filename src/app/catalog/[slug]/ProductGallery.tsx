"use client";
import {useState} from "react";
type GalleryImage={id:string;url:string;alt:string};
export default function ProductGallery({images,productName}:{images:GalleryImage[];productName:string}){
 const [selected,setSelected]=useState(0);
 const [failed,setFailed]=useState(false);
 if(!images.length)return <div className="wt-catalog-detail-main"><span>Photo not available</span></div>;
 const active=images[Math.min(selected,images.length-1)];
 return <div><div className="wt-catalog-detail-main">{failed?<span>Image unavailable</span>:<img src={active.url} alt={active.alt||productName} onError={()=>setFailed(true)}/>}</div>
 {images.length>1&&<div className="wt-catalog-thumbnails" aria-label="Product photos">{images.map((img,i)=><button type="button" className="wt-catalog-thumbnail" key={img.id} onClick={()=>{setSelected(i);setFailed(false)}} aria-pressed={i===selected} aria-label={`View photo ${i+1} of ${images.length} for ${productName}`}><img src={img.url} alt="" loading="lazy"/></button>)}</div>}</div>;
}
