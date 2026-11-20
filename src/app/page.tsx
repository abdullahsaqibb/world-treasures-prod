import { ApprovedRegions } from "@/components/ApprovedRegions";
import { LegacyRuntime } from "@/components/LegacyRuntime";
import { CartExperience } from "@/components/CartExperience";
import { db } from "@/lib/db";
import { getPublishedProducts } from "@/lib/published-catalog";
import type { StoreCopyKey } from "@/lib/storefront-copy";
export const dynamic="force-dynamic";

/** Preserve the approved DOM; apply only explicitly published copy overrides. */
export default async function Home() {
 let overrides:Partial<Record<StoreCopyKey,string>>={};
 let shopProducts:Array<{id:string;slug:string;name:string;category:string;image:string;priceCents:number;stock:number}>=[];
 try {
  const entries=await db.storeContent.findMany({where:{publishedValue:{not:null}},select:{key:true,publishedValue:true}});
  overrides=Object.fromEntries(entries.filter(e=>e.publishedValue!==null).map(e=>[e.key,e.publishedValue])) as Partial<Record<StoreCopyKey,string>>;
  const published=await getPublishedProducts();
  shopProducts=published.flatMap(p=>{
   const available=p.variants.filter(v=>v.priceCents>0).map(v=>({...v,remaining:Math.max(0,(v.inventory?.onHand??0)-(v.inventory?.reserved??0))}));
   const chosen=available.find(v=>v.remaining>0)??available[0];
   if(!chosen)return [];
   return [{id:chosen.id,slug:p.slug,name:p.name,category:p.category.name,image:p.images[0]?.url??"",priceCents:chosen.priceCents,stock:chosen.remaining}];
  });
 }catch{
  // On a branch whose database has not been migrated yet, render the approved content unchanged.
 }
 return <><div style={{background:"#14243a",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:14,flexWrap:"wrap",padding:"9px 15px",fontFamily:"DM Sans, Arial, sans-serif",fontSize:12}}><span>World Treasures verified product collection</span><a href="/catalog" style={{color:"#ffd2ac",fontWeight:800,textDecoration:"underline"}}>{shopProducts.length>0?`Browse ${shopProducts.length} verified ${shopProducts.length===1?"product":"products"} →`:"View verified collection →"}</a></div><ApprovedRegions overrides={overrides}/><LegacyRuntime /><CartExperience products={shopProducts}/></>;
}
