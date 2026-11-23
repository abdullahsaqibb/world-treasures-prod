import type {MetadataRoute} from "next";
import {db} from "@/lib/db";
import {publicProductWhere} from "@/lib/product-visibility";
export const dynamic="force-dynamic";
const origin="https://www.worldtreasures.co.za";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const staticEntries:MetadataRoute.Sitemap=[
  {url:origin+"/",changeFrequency:"weekly",priority:1},
  {url:origin+"/catalog",changeFrequency:"daily",priority:.9}
 ];
 try{
  const products=await db.product.findMany({
   where:publicProductWhere,
   select:{slug:true,updatedAt:true},
   orderBy:{updatedAt:"desc"},
   take:10000
  });
  return [...staticEntries,...products.map(p=>({
   url:origin+"/catalog/"+encodeURIComponent(p.slug),
   lastModified:p.updatedAt,
   changeFrequency:"weekly" as const,
   priority:.7
  }))];
 }catch{
  // DB downtime must not expose unpublished product URLs or take the sitemap offline.
  return staticEntries;
 }
}
