"use client";
import Link from "next/link";
import {useActionState,useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {createCatalogProductState,updateCatalogProductState,type CatalogFormState} from "../actions";
import {PendingSubmit} from "../PendingSubmit";
import {CloudinaryUploader} from "../media/CloudinaryUploader";
type CategoryOption={id:string;name:string};
type ProductData={id:string;name:string;slug:string;description:string|null;verified:boolean;status:"DRAFT"|"ACTIVE"|"ARCHIVED";categoryId:string;image:string;gallery:string[];sku:string;priceCents:number;stock:number;reserved:number;weightGrams:number|null};
export default function ProductEditor({categories,product}:{categories:CategoryOption[],product?:ProductData}){
 const editing=Boolean(product);
 const router=useRouter();
 const initialState:CatalogFormState={ok:false,message:""};
 const [result,submitAction]=useActionState(editing?updateCatalogProductState:createCatalogProductState,initialState);
 useEffect(()=>{if(result.ok&&result.productId)router.replace("/admin/products/"+encodeURIComponent(result.productId));},[result,router]);
 const [name,setName]=useState(product?.name??"");
 const [image,setImage]=useState(product?.image??"");
 const [imageFailed,setImageFailed]=useState(false);
 const [gallery,setGallery]=useState((product?.gallery??[]).filter(u=>u!==product?.image).join("\n"));
 const [categoryId,setCategoryId]=useState(product?.categoryId??"");
 const [price,setPrice]=useState(product?(product.priceCents/100).toFixed(2):"");
 const [stock,setStock]=useState(String(product?.stock??0));
 const selectedCategory=categories.find(x=>x.id===categoryId)?.name||"Choose a category";
 const imageAllowed=image.startsWith("/")&&!image.startsWith("//")||/^https:\/\/[^\s]+$/i.test(image);
 return <div>
 <div className="wt-head"><div><span className="wt-eyebrow">MERCHANDISE / {editing?"EDIT PRODUCT":"NEW PRODUCT"}</span><h1>{editing?"Refine the listing.":"Add something good."}</h1><p className="wt-lede">Everything your customers need to know, all in one guided form. No coding required.</p><div className="wt-product-topline"><span className="wt-badge amber">{product?.status==="ACTIVE"?"Published catalog":product?.status==="ARCHIVED"?"Archived catalog":"Draft catalog"}</span>{product?.verified?<span className="wt-badge green">Information verified</span>:<span className="wt-badge">Pending review</span>}</div></div><div className="wt-actions">{product?.status==="ACTIVE"&&product.verified&&<Link className="wt-btn light" href={"/catalog/"+encodeURIComponent(product.slug)} target="_blank" rel="noopener noreferrer">↗ View published product</Link>}<Link className="wt-btn light" href="/admin/products">← Back to products</Link></div></div>
 <form action={submitAction} className="wt-stack">
 {product&&<input type="hidden" name="productId" value={product.id}/>}
 <div className="wt-product-editor-grid">
 <div className="wt-product-editor-main">
  <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">STEP 01 / THE ESSENTIALS</span><h2>Tell us about the product</h2></div><span className="wt-badge">Required</span></div>
   <div className="wt-formgrid">
    <label className="wt-field full">Product name<small>Use the name shoppers will recognize on the packaging</small><input name="name" required maxLength={150} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Takis Fuego · 90g"/></label>
    <label className="wt-field">Category<select name="categoryId" required value={categoryId} onChange={e=>setCategoryId(e.target.value)}><option value="" disabled>Choose a category</option>{categories.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><small>Need another one? <Link href="/admin/categories" style={{textDecoration:"underline"}}>Manage categories</Link></small></label>
    <label className="wt-field">SKU / product code<small>Optional on new products — we generate one</small><input name="sku" maxLength={100} defaultValue={product?.sku??""} placeholder="e.g. WT-TAKIS-FUEGO-90G"/></label>
    <label className="wt-field full">Product description<small>Include size, flavour, ingredients or origin where verified</small><textarea name="description" maxLength={3000} defaultValue={product?.description??""} placeholder="Describe why customers will love this product…"/></label>
    <label className="wt-field full">Product URL handle<small>Advanced / optional — automatically generated for new products</small><input name="slug" maxLength={150} pattern="[a-zA-Z0-9-]+" defaultValue={product?.slug??""} placeholder="e.g. takis-fuego-90g"/></label>
   </div>
  </section>
  <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">STEP 02 / PRICING & STOCK</span><h2>Make it ready to sell</h2></div><span className="wt-badge">ZAR</span></div>
   <div className="wt-formgrid">
    <label className="wt-field">Selling price (R)<small>Use a verified retail price</small><input name="priceZar" type="number" step="0.01" min="0" max="1000000" required value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00"/></label>
    <label className="wt-field">Units in stock<small>{product?product.reserved+" units currently reserved":"Available quantity at your store"}</small><input name="stock" type="number" step="1" min={product?.reserved??0} max="1000000" required value={stock} onChange={e=>setStock(e.target.value)}/></label>
    <label className="wt-field">Package weight in grams<small>Optional, useful for future shipping estimates</small><input name="weightGrams" type="number" min="0" step="1" defaultValue={product?.weightGrams??""} placeholder="90"/></label>
   </div>
  </section>
  <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">STEP 03 / PHOTOGRAPHY</span><h2>Make it look irresistible</h2></div><span className="wt-badge">Image</span></div>
   <p className="wt-lede">Save product photos in display order. Use HTTPS links, existing product paths, or the Cloudinary uploader when configured.</p>
   <label className="wt-field">Main product image<small>Image preview updates automatically on the right</small><input name="image" maxLength={1200} value={image} onChange={e=>{setImage(e.target.value);setImageFailed(false);}} placeholder="/products/takis.webp or https://…"/></label>
   <label className="wt-field">Additional gallery images (one URL per line)<small>Up to 7 additional photos. The main image appears first in the storefront gallery.</small><textarea name="galleryUrls" rows={4} maxLength={7800} value={gallery} onChange={e=>setGallery(e.target.value)} placeholder={"https://example.com/front.webp\\nhttps://example.com/back.webp"}/></label>
   <CloudinaryUploader onUploaded={url=>{if(!image){setImage(url);setImageFailed(false)}else{setGallery(current=>[...new Set([...current.split("\n").map(u=>u.trim()).filter(Boolean),url])].join("\n"))}}}/>
   <div className="wt-help">Cloudinary images are linked to this environment’s product record only when you save the form. Preview and Production maintain separate product records.</div>
  </section>
  <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">STEP 04 / QUALITY CONTROL</span><h2>Review the listing</h2></div></div>
   <p className="wt-help">Publishing requires verified packaging, a description, real pricing and at least one image. Published products appear in this environment’s verified catalogue; changes made on Preview do not sync to the live store. Payments remain disabled.</p>
   {editing?<div className="wt-formgrid">
    <label className="wt-field">Catalog status<select name="status" defaultValue={product?.status??"DRAFT"}><option value="DRAFT">Draft — private listing</option><option value="ACTIVE">Published — visible in verified catalog</option><option value="ARCHIVED">Archived — hide in catalog</option></select></label>
    <div className="wt-field"><span>Supplier / package verification</span><label className="wt-check"><input type="checkbox" name="verified" defaultChecked={product?.verified}/> I checked the information against the actual item.</label><small>Required before selecting Published. Only check this after verifying product information.</small></div>
   </div>:<p className="wt-muted">New products start as drafts. You can return to verify them after saving.</p>}
  </section>
 </div>
 <aside className="wt-product-editor-side">
  <section className="wt-card"><div className="wt-cardhead"><div><span className="wt-eyebrow">REAL-TIME PREVIEW</span><h2>Product card</h2></div></div>
   <div className="wt-product-preview">{image&&imageAllowed&&!imageFailed?<img src={image} alt="Preview of product" onError={()=>setImageFailed(true)}/>:<div className="wt-product-preview-placeholder">{imageFailed?"Image could not be loaded — check the URL":"Your product photo will appear here"}</div>}<small>{selectedCategory}</small><strong>{name||"Your product name"}</strong><b>R {Number.isFinite(Number(price))?Number(price||0).toFixed(2):"0.00"}</b></div>
   <p className="wt-lede" style={{fontSize:12,marginTop:14}}>Preview of this product listing. Public visibility requires ACTIVE status and verification.</p>
  </section>
  <section className="wt-card"><div className="wt-cardhead"><h2>Before you save</h2></div><ul className="wt-review-points">
   <li><span>✓</span> Check the product name and package size</li>
   <li><span>✓</span> Confirm the retail price in South African Rand</li>
   <li><span>✓</span> Enter the actual available stock</li>
   <li><span>✓</span> Use a clear image of the item being sold</li>
   <li><span>✓</span> Verify ingredients and supplier details when relevant</li>
  </ul></section>
 </aside>
 </div>
 {result.message&&<div role={result.ok?"status":"alert"} aria-live="polite" className={"wt-help "+(result.ok?"wt-form-success":"wt-form-error")}>{result.message}</div>}
 <div className="wt-editor-savebar"><small>Changes are saved to the database attached to <strong>this environment</strong>.</small><div className="wt-actions"><Link className="wt-btn light" href="/admin/products">Cancel</Link><PendingSubmit pendingText={editing?"Saving product…":"Creating draft…"}>{editing?"Save product changes":"Save as draft →"}</PendingSubmit></div></div>
 </form></div>;

}
