import { ApprovedRegions } from "@/components/ApprovedRegions";
import { LegacyRuntime } from "@/components/LegacyRuntime";
import { CartExperience } from "@/components/CartExperience";
import { StorefrontHero } from "@/components/StorefrontHero";
import { db } from "@/lib/db";
import { getPublishedProducts } from "@/lib/published-catalog";
import {toStorefrontItems,type StorefrontItem} from "@/lib/storefront-products";
import type { StoreCopyKey } from "@/lib/storefront-copy";
export const dynamic="force-dynamic";

/** The original 15 storefront examples, now recovered as editable Production drafts.
 * This explicit allowlist ensures unrelated merchant drafts never leak publicly.
 */
const recoveredShowcaseSlugs=[
 "berry","pop","cocoa","guava","takis","cookie","import-1","import-2",
 "import-3","import-4","import-5","import-6","import-7","import-8","crunch"
];

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
  const recovered=await db.product.findMany({
   where:{slug:{in:recoveredShowcaseSlugs},status:"DRAFT",verified:false},
   include:{category:true,images:{orderBy:{sortOrder:"asc"}},variants:{orderBy:{id:"asc"},include:{inventory:true}}},
  });
  recoveredPreview=toStorefrontItems(recovered).sort((a,b)=>recoveredShowcaseSlugs.indexOf(a.slug)-recoveredShowcaseSlugs.indexOf(b.slug));
 }catch{
  // On a branch whose database has not been migrated yet, render the approved content unchanged.
 }
 return <><div className="wt-public-launch-note" role="note"><strong>World Treasures catalogue preview</strong><span>Product prices and information are being verified. Online orders and payments are not yet enabled.</span><a href="/catalog" style={{color:"#ffd5b2",fontWeight:800,textDecoration:"underline"}}>View verified collection →</a></div><ApprovedRegions overrides={overrides} products={shopProducts}/><StorefrontHero products={shopProducts} recoveredPreview={recoveredPreview}/><LegacyRuntime /><CartExperience products={shopProducts} recoveredPreview={recoveredPreview}/></>;
}
