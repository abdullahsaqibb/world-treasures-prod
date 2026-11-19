import Link from "next/link";
import { createCatalogProduct,updateCatalogProduct } from "../actions";
type CategoryOption={id:string;name:string};
type ProductData={id:string;name:string;slug:string;description:string|null;verified:boolean;status:"DRAFT"|"ACTIVE"|"ARCHIVED";categoryId:string;image:string;sku:string;priceCents:number;stock:number;reserved:number;weightGrams:number|null};
export default function ProductEditor({categories,product}:{categories:CategoryOption[],product?:ProductData}){
 const editing=Boolean(product);
 return <div><div className="wt-head"><div><span className="wt-eyebrow">Catalog / {editing?"Edit listing":"New listing"}</span><h1>{editing?"Edit product":"Add a product"}</h1><p className="wt-lede">{editing?"Update the information below and save your changes.":"Follow the sections below. Your product will be saved as an unpublished draft."}</p></div><Link className="wt-btn light" href="/admin/products">← All products</Link></div>
 <form action={editing?updateCatalogProduct:createCatalogProduct} className="wt-stack">
 {product&&<input type="hidden" name="productId" value={product.id}/>}
 <section className="wt-card"><div className="wt-cardhead"><h2>01. Product information</h2><span className="wt-badge">Required details</span></div>
 <div className="wt-formgrid"><label className="wt-field">Product name<input name="name" required maxLength={150} defaultValue={product?.name??""} placeholder="e.g. Takis Fuego 90g"/></label>
 <label className="wt-field">Product URL slug<small>Only lowercase letters, numbers and dashes</small><input name="slug" required defaultValue={product?.slug??""} placeholder="e.g. takis-fuego-90g" maxLength={150} pattern="[a-zA-Z0-9-]+"/></label>
 <label className="wt-field">Category<select name="categoryId" defaultValue={product?.categoryId??""} required><option value="" disabled>Choose a category</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
 <label className="wt-field">SKU / unique item code<small>Use the barcode or your own identifier</small><input name="sku" required maxLength={100} defaultValue={product?.sku??""} placeholder="WT-TAKIS-FUEGO-90G"/></label>
 <label className="wt-field full">Product description<small>Describe flavour, pack size, origin and any confirmed product details</small><textarea name="description" maxLength={3000} defaultValue={product?.description??""} placeholder="What should shoppers know about this product?"/></label></div></section>
 <section className="wt-card"><div className="wt-cardhead"><h2>02. Price & inventory</h2><span className="wt-badge">South African Rand</span></div><div className="wt-formgrid">
 <label className="wt-field">Selling price (ZAR)<input name="priceZar" type="number" step="0.01" min="0" max="1000000" required defaultValue={product?(product.priceCents/100).toFixed(2):""} placeholder="0.00"/></label>
 <label className="wt-field">Stock on hand<small>{product?product.reserved+" units are reserved.": "How many items do you have available?"}</small><input name="stock" type="number" step="1" min={product?.reserved??0} max="1000000" required defaultValue={product?.stock??0}/></label>
 <label className="wt-field">Weight in grams (optional)<small>Useful for shipping calculations later</small><input name="weightGrams" type="number" min="0" step="1" defaultValue={product?.weightGrams??""} placeholder="e.g. 90"/></label></div></section>
 <section className="wt-card"><div className="wt-cardhead"><h2>03. Product imagery</h2><span className="wt-badge">Image URL</span></div>
 <p className="wt-lede">For now, enter an existing image URL or a path such as /products/takis.webp. A drag-and-drop media library is planned for the next step.</p>
 <label className="wt-field">Main product image<input name="image" defaultValue={product?.image??""} maxLength={1200} placeholder="/products/product-photo.webp or https://..."/></label></section>
 <section className="wt-card"><div className="wt-cardhead"><h2>04. Review & listing status</h2></div>
 <div className="wt-help">New products are always saved as <strong>drafts</strong>. This admin database is not yet connected to the approved public storefront. Changing the status here does not publish a product online.</div>
 {editing?<div className="wt-formgrid">
 <label className="wt-field">Catalog status<select name="status" defaultValue={product?.status==="ARCHIVED"?"ARCHIVED":"DRAFT"}><option value="DRAFT">Draft — keep in catalog</option><option value="ARCHIVED">Archived — remove from working catalog</option></select></label>
 <div className="wt-field"><span>Product data verification</span><label className="wt-check"><input type="checkbox" name="verified" defaultChecked={product?.verified}/> I have checked details against the actual product label or supplier information.</label><small>Verification does not publish the product.</small></div>
 </div>:<p className="wt-muted">After saving, you can return to edit your new draft and mark its information verified.</p>}</section>
 <div className="wt-actions"><button type="submit" className="wt-btn orange">{editing?"Save product changes":"Create draft product"}</button><Link className="wt-btn light" href="/admin/products">Cancel</Link></div>
 </form></div>;
}