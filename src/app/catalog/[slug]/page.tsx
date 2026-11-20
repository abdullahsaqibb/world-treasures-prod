import Link from "next/link";
import {notFound} from "next/navigation";
import {getPublishedProduct,zar} from "@/lib/published-catalog";
import "../catalog.css";
import ProductGallery from "./ProductGallery";
export const dynamic="force-dynamic";
export default async function CatalogDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const product=await getPublishedProduct(slug);
 if(!product)notFound();
 const photo=product.images[0];
 return <main className="wt-live-catalog"><div className="wt-catalog-top"><div className="wt-catalog-kicker">{product.category.name.toUpperCase()} / VERIFIED COLLECTION</div><Link href="/catalog" className="wt-catalog-back">← All verified products</Link></div><div className="wt-catalog-wrap wt-catalog-detail">
 <section><ProductGallery productName={product.name} images={product.images.map(img=>({id:img.id,url:img.url,alt:img.alt||product.name}))}/></section>
 <section><div className="wt-catalog-kicker">WORLD TREASURES / PUBLISHED PRODUCT</div><h1>{product.name}</h1><p className="wt-catalog-lead">{product.description}</p><div className="wt-catalog-variants">{product.variants.map(variant=>{const available=Math.max(0,(variant.inventory?.onHand??0)-(variant.inventory?.reserved??0));return <div className="wt-catalog-variant" key={variant.id}><div><strong>{variant.label}</strong><div className="wt-catalog-badge">{available>0?"In stock":"Out of stock"}</div></div><b>{zar(variant.priceCents)}</b></div>})}</div><p className="wt-catalog-note">Online purchasing is not available yet. Product availability and pricing are presented for catalogue review until payment processing is activated.</p></section></div></main>;
}