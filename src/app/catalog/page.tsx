import Link from "next/link";
import {getPublishedProducts,zar} from "@/lib/published-catalog";
import "./catalog.css";
export const dynamic="force-dynamic";
export const metadata={title:"Verified Collection | World Treasures",description:"Browse the verified, currently published World Treasures collection."};
export default async function CatalogPage(){
 const products=await getPublishedProducts();
 return <main className="wt-live-catalog"><div className="wt-catalog-top"><div><div className="wt-catalog-kicker">WORLD TREASURES / VERIFIED COLLECTION</div><h1>THE GOOD STUFF.</h1><p className="wt-catalog-lead">Our latest verified and published products, managed directly from the World Treasures merchant portal.</p></div><Link className="wt-catalog-back" href="/">← Back to home</Link></div>
 <div className="wt-catalog-wrap">{products.length?<div className="wt-catalog-grid">{products.map(product=>{
 const variant=product.variants[0];const image=product.images[0]?.url;
 const stock=product.variants.reduce((n,v)=>n+Math.max(0,(v.inventory?.onHand??0)-(v.inventory?.reserved??0)),0);
 return <Link href={"/catalog/"+encodeURIComponent(product.slug)} className="wt-catalog-card" key={product.id}><div className="wt-catalog-media">{image?<img src={image} alt={product.images[0]?.alt||product.name}/>:<span>No image available</span>}</div><small>{product.category.name}</small><strong>{product.name}</strong><b>{variant?zar(variant.priceCents):"Price unavailable"}</b><small>{stock>0?"In stock":"Currently unavailable"}</small></Link>
 })}</div>:<div className="wt-catalog-empty"><div className="wt-catalog-kicker">CURATED WITH CARE</div><h2>Verified products are coming soon.</h2><p>We are reviewing product descriptions, photographs and prices before making them available here.</p></div>}
 <p className="wt-catalog-note">Catalogue preview only. Online purchases and payments will be enabled after checkout and fulfillment testing.</p></div></main>;
}