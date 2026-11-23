import Link from "next/link";
import {getPublishedProducts,zar} from "@/lib/published-catalog";
import "./catalog.css";
import {getRecoveredShowcase} from "@/lib/recovered-showcase";
export const dynamic="force-dynamic";
export const metadata={title:"Imported Snacks & Drinks Collection",description:"Explore verified imported chips, candy, chocolates and drinks from World Treasures in Walmer, Port Elizabeth (Gqeberha), South Africa.",alternates:{canonical:"/catalog"},openGraph:{title:"Imported Snacks & Drinks | World Treasures",url:"https://www.worldtreasures.co.za/catalog"}};
export default async function CatalogPage(){
 const [products,recoveredPreview]=await Promise.all([getPublishedProducts(),getRecoveredShowcase()]);
 return <main className="wt-live-catalog"><div className="wt-catalog-top"><div><div className="wt-catalog-kicker">WORLD TREASURES / VERIFIED COLLECTION</div><h1>THE GOOD STUFF.</h1><p className="wt-catalog-lead">Our latest verified and published products, managed directly from the World Treasures merchant portal.</p></div><Link className="wt-catalog-back" href="/">← Back to home</Link></div>
 <div className="wt-catalog-wrap">{products.length?<div className="wt-catalog-grid">{products.map(product=>{
 const prices=product.variants.map(variant=>variant.priceCents).filter(price=>price>0);const minPrice=prices.length?Math.min(...prices):null;const image=product.images[0]?.url;
 const stock=product.variants.reduce((n,v)=>n+Math.max(0,(v.inventory?.onHand??0)-(v.inventory?.reserved??0)),0);
 return <Link href={"/catalog/"+encodeURIComponent(product.slug)} className="wt-catalog-card" key={product.id}><div className="wt-catalog-media">{image?<img src={image} alt={product.images[0]?.alt||product.name}/>:<span>No image available</span>}</div><small>{product.category.name}</small><strong>{product.name}</strong><b>{minPrice!==null?(prices.length>1?"From "+zar(minPrice):zar(minPrice)):"Price unavailable"}</b><small>{stock>0?"In stock":"Currently unavailable"}</small></Link>
 })}</div>:<div className="wt-catalog-empty"><div className="wt-catalog-kicker">CURATED WITH CARE</div><h2>Verified products are coming soon.</h2><p>We are reviewing product descriptions, photographs and prices before making them available here.</p></div>}
 {recoveredPreview.length>0&&<section className="wt-recovered-showcase" aria-label="Original World Treasures range awaiting verification">
 <div className="wt-catalog-kicker">ORIGINAL WORLD TREASURES RANGE · UNDER REVIEW</div>
 <h2>Discover our original range</h2>
 <p>The original product range has been restored to the merchant portal. These listings are previews until their pricing, stock and packaging information have been verified.</p>
 <div className="wt-catalog-grid">{recoveredPreview.map(p=><article key={p.id} className="wt-catalog-card">
 <div className="wt-catalog-media">{p.image?<img src={p.image} alt={p.name} loading="lazy"/>:<span>Image coming soon</span>}</div>
 <small>{p.category} · Catalogue preview</small><strong>{p.name}</strong><b>Price to be confirmed</b><small>Not yet available to purchase</small>
 </article>)}</div></section>}
 <p className="wt-catalog-note">Catalogue preview only. Online purchases and payments will be enabled after checkout and fulfillment testing.</p></div></main>;
}