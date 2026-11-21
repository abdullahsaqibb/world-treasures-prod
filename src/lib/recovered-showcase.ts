import {db} from "@/lib/db";
import {toStorefrontItems} from "@/lib/storefront-products";

/**
 * Original 15 World Treasures prototype products, recovered from the November 19
 * seed catalog into the live database. Only these IDs/slugs may be shown as
 * explicitly provisional previews while awaiting merchant verification.
 * Never expose unrelated draft listings.
 */
export const recoveredShowcaseSlugs=[
 "berry","pop","cocoa","guava","takis","cookie","import-1","import-2",
 "import-3","import-4","import-5","import-6","import-7","import-8","crunch"
] as const;

export async function getRecoveredShowcase(){
 const recovered=await db.product.findMany({
  where:{slug:{in:[...recoveredShowcaseSlugs]},status:"DRAFT",verified:false},
  include:{category:true,images:{orderBy:{sortOrder:"asc"}},variants:{orderBy:{id:"asc"},include:{inventory:true}}}
 });
 return toStorefrontItems(recovered).sort((a,b)=>recoveredShowcaseSlugs.indexOf(a.slug as typeof recoveredShowcaseSlugs[number])-recoveredShowcaseSlugs.indexOf(b.slug as typeof recoveredShowcaseSlugs[number]));
}
