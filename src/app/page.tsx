import { ApprovedRegions } from "@/components/ApprovedRegions";
import { LegacyRuntime } from "@/components/LegacyRuntime";
import { CartExperience } from "@/components/CartExperience";
import { db } from "@/lib/db";
import type { StoreCopyKey } from "@/lib/storefront-copy";
export const dynamic="force-dynamic";

/** Preserve the approved DOM; apply only explicitly published copy overrides. */
export default async function Home() {
 let overrides:Partial<Record<StoreCopyKey,string>>={};
 try {
  const entries=await db.storeContent.findMany({where:{publishedValue:{not:null}},select:{key:true,publishedValue:true}});
  overrides=Object.fromEntries(entries.filter(e=>e.publishedValue!==null).map(e=>[e.key,e.publishedValue])) as Partial<Record<StoreCopyKey,string>>;
 }catch{
  // On a branch whose database has not been migrated yet, render the approved content unchanged.
 }
 return <><ApprovedRegions overrides={overrides}/><LegacyRuntime /><CartExperience /></>;
}
