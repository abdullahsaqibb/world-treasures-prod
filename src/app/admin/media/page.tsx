import {ensureAdminPage} from "@/lib/admin-access";
import Link from "next/link";
import {MediaPreflight} from "./MediaPreflight";
import {CloudinaryUploader} from "./CloudinaryUploader";
import {db} from "@/lib/db";
export const dynamic="force-dynamic";
export default async function MediaPage(){
 await ensureAdminPage();
 const assets=await db.productImage.findMany({select:{id:true,url:true,alt:true,product:{select:{id:true,name:true,status:true,verified:true}}},orderBy:{product:{updatedAt:"desc"}},take:150});
 return <div><span className="wt-eyebrow">BRAND / CREATIVE ASSETS</span>
 <div className="wt-head"><div><h1>Product media</h1><p className="wt-lede">Prepare and inspect product photographs before they enter the approved catalog. Cloudinary is selected for product photography in this preview. Uploads require secure Preview credentials.</p></div><Link className="wt-btn light" href="/admin/products">← Product catalog</Link></div>
 <div className="wt-grid"><div className="wt-stat"><small>Linked product photos</small><b>{assets.length}</b><span>Showing up to 150 recent images</span></div><div className="wt-stat"><small>Products with photos</small><b>{new Set(assets.map(a=>a.product.id)).size}</b><span>Existing database gallery references</span></div></div>
 <section className="wt-card" style={{marginBottom:20}}><div className="wt-cardhead"><div><span className="wt-eyebrow">CATALOG MEDIA / READ ONLY</span><h2>Images linked to products</h2></div><span className="wt-badge">Database references</span></div>{assets.length?<div className="wt-media-preview-grid">{assets.map(asset=><div className="wt-media-preview-item" key={asset.id}><div className="wt-media-imagebox"><img src={asset.url} alt={asset.alt||asset.product.name} loading="lazy"/></div><strong>{asset.product.name}</strong><small>{asset.product.status==="ACTIVE"&&asset.product.verified?"Verified catalog":asset.product.status.toLowerCase()}</small><Link className="wt-btn light" href={"/admin/products/"+encodeURIComponent(asset.product.id)}>Edit product ↗</Link></div>)}</div>:<div className="wt-empty"><h3>No product photos linked yet</h3><p>Add image URLs in the product editor to populate this library.</p></div>}<p className="wt-help">This library reflects existing ProductImage database records. Changing an image happens in its product editor; no files are uploaded or deleted here.</p></section>
 <MediaPreflight/>
 <section className="wt-card" style={{marginTop:20}}><div className="wt-cardhead"><h2>Cloudinary direct upload</h2><span className="wt-badge">Development</span></div><CloudinaryUploader/></section>
 <section className="wt-card" style={{marginTop:20}}><div className="wt-cardhead"><h2>Storage connection checklist</h2><span className="wt-badge amber">Requires approval</span></div><div className="wt-feature-stack">
 <div className="wt-feature-row"><div><strong>1. Select storage provider</strong><small>Selected: Cloudinary Free for product photos; subject to free-plan credit limits</small></div><span className="wt-state-pill">Selected</span></div>
 <div className="wt-feature-row"><div><strong>2. Connect storage to the development environment</strong><small>Keep server-side credentials private; no tokens in browser code or GitHub</small></div><span className="wt-state-pill">Configured in Preview; verify in browser</span></div>
 <div className="wt-feature-row"><div><strong>3. Enable authenticated direct uploads</strong><small>Staff authorization, signed Cloudinary uploads, unique IDs, provider verification and media limits</small></div><span className="wt-state-pill">Implemented; needs live QA</span></div>
 <div className="wt-feature-row"><div><strong>4. Test upload → preview → product save → public catalog</strong><small>Verify working URLs and safe retention before any production activation</small></div><span className="wt-state-pill">Planned</span></div>
 </div></section></div>;
}