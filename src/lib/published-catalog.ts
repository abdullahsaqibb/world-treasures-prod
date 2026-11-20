import {db} from "@/lib/db";

/** Public reads are intentionally restricted to both verified and published records. */
export const publicProductWhere={status:"ACTIVE" as const,verified:true};

export async function getPublishedProducts(){
 return db.product.findMany({
  where:publicProductWhere,
  orderBy:[{updatedAt:"desc"}],
  include:{
   category:true,
   images:{orderBy:{sortOrder:"asc"}},
   variants:{orderBy:{id:"asc"},include:{inventory:true}}
  }
 });
}
export async function getPublishedProduct(slug:string){
 return db.product.findFirst({
  where:{...publicProductWhere,slug},
  include:{
   category:true,
   images:{orderBy:{sortOrder:"asc"}},
   variants:{orderBy:{id:"asc"},include:{inventory:true}}
  }
 });
}
export function zar(cents:number){
 return new Intl.NumberFormat("en-ZA",{currency:"ZAR",style:"currency"}).format(cents/100);
}
