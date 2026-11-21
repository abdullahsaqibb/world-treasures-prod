import Link from "next/link";
import type {StorefrontItem} from "@/lib/storefront-products";

/**
 * Every product shown in this curated storefront area comes from the same
 * ACTIVE + verified Neon catalogue as /catalog and the admin portal.
 * No hardcoded offer, demo product, or fictitious stock can be rendered here.
 */
export function VerifiedCollections({products}:{products:StorefrontItem[]}){
 const seen=new Set<string>();
 const latest=products.filter(item=>{
  if(seen.has(item.slug))return false;
  seen.add(item.slug);
  return true;
 }).slice(0,6);
 if(!latest.length)return null;
 const money=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
 return <section id="new-arrivals" className="section arrivals wt-verified-arrivals" aria-label="Verified new arrivals">
  <div className="wrap">
   <div className="wt-arrivals-heading">
    <div><p className="eyebrow">FRESH OFF THE FLIGHT · VERIFIED COLLECTION</p><h2>Discover the latest arrivals</h2><p>Real product listings from our live catalogue. Online orders are not enabled yet.</p></div>
    <Link href="/catalog" className="wt-btn light">View all products →</Link>
   </div>
   <div className="wt-cart-shop-grid">
    {latest.map(item=><article className="wt-cart-product" key={item.slug}>
     <Link className="wt-cart-product-image" href={"/catalog/"+encodeURIComponent(item.slug)}>
      {item.image?<img loading="lazy" src={item.image} alt={item.name}/>:<span>Image coming soon</span>}
     </Link>
     <div className="wt-cart-product-info">
      <span>{item.category}</span>
      <h3><Link href={"/catalog/"+encodeURIComponent(item.slug)}>{item.name}</Link></h3>
      <p>{money(item.priceCents)}</p><small>{item.stock>0?"In stock":"Currently unavailable"} · Catalogue preview only</small>
      <Link href={"/catalog/"+encodeURIComponent(item.slug)}>See product →</Link>
     </div>
    </article>)}
   </div>
  </div>
 </section>;
}
