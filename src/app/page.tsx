import { ApprovedRegions } from "@/components/ApprovedRegions";
import { LegacyRuntime } from "@/components/LegacyRuntime";
import { CartExperience } from "@/components/CartExperience";
import { StorefrontHero } from "@/components/StorefrontHero";
import { db } from "@/lib/db";
import { getPublishedProducts } from "@/lib/published-catalog";
import {toStorefrontItems,type StorefrontItem} from "@/lib/storefront-products";
import type { StoreCopyKey } from "@/lib/storefront-copy";
import {getRecoveredShowcase} from "@/lib/recovered-showcase";
export const dynamic="force-dynamic";

const localBusinessData={
 "@context":"https://schema.org",
 "@type":"Store",
 "@id":"https://www.worldtreasures.co.za/#store",
 name:"World Treasures",
 url:"https://www.worldtreasures.co.za/",
 description:"Store offering imported snacks, candy, chocolates and beverages in Walmer, Gqeberha.",
 address:{
  "@type":"PostalAddress",
  streetAddress:"60-A Heugh Road",
  addressLocality:"Walmer, Gqeberha (Port Elizabeth)",
  addressRegion:"Eastern Cape",
  addressCountry:"ZA"
 }
};

/** Preserve the approved DOM; apply only explicitly published copy overrides. */
export default async function Home() {
 let overrides:Partial<Record<StoreCopyKey,string>>={};
 let shopProducts:StorefrontItem[]=[];
 let recoveredPreview:StorefrontItem[]=[];
 try {
  const entries=await db.storeContent.findMany({where:{publishedValue:{not:null}},select:{key:true,publishedValue:true}});
  overrides=Object.fromEntries(entries.filter(e=>e.publishedValue!==null).map(e=>[e.key,e.publishedValue])) as Partial<Record<StoreCopyKey,string>>;
  const published=await getPublishedProducts();
  shopProducts=toStorefrontItems(published);
  recoveredPreview=await getRecoveredShowcase();
 }catch{
  // On a branch whose database has not been migrated yet, render the approved content unchanged.
 }
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(localBusinessData).replace(/</g,"\\u003c")}}/><div className="wt-public-launch-note" role="note"><strong>World Treasures catalogue preview</strong><span>Browse our verified international snacks and drinks. Online orders and payments are not yet enabled.</span><a href="/catalog" style={{color:"#ffd5b2",fontWeight:800,textDecoration:"underline"}}>View verified collection →</a></div><ApprovedRegions overrides={overrides}/><StorefrontHero products={shopProducts} recoveredPreview={recoveredPreview}/><LegacyRuntime /><CartExperience products={shopProducts} recoveredPreview={recoveredPreview}/></>;
}
