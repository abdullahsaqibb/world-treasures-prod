import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductEditor from "../ProductEditor";
import VariantManager from "../VariantManager";
export const dynamic="force-dynamic";
export default async function EditProductPage({params}:{params:Promise<{id:string}>}){
 await ensureAdminPage();
 const {id}=await params;
 const [p,categories]=await Promise.all([
 db.product.findUnique({where:{id},include:{variants:{include:{inventory:true},orderBy:{id:"asc"}},images:{orderBy:{sortOrder:"asc"}}}}),
 db.category.findMany({orderBy:{name:"asc"},select:{id:true,name:true}})
 ]);
 if(!p)notFound();
 const variant=p.variants[0];
 return <><ProductEditor categories={categories} product={{id:p.id,name:p.name,slug:p.slug,description:p.description,verified:p.verified,status:p.status,categoryId:p.categoryId,image:p.images[0]?.url??"",gallery:p.images.map(img=>img.url),sku:variant?.sku??"",priceCents:variant?.priceCents??0,stock:variant?.inventory?.onHand??0,reserved:variant?.inventory?.reserved??0,weightGrams:variant?.weightGrams??null}}/><VariantManager productId={p.id} variants={p.variants.map(v=>({id:v.id,sku:v.sku,label:v.label,priceCents:v.priceCents,onHand:v.inventory?.onHand??0,reserved:v.inventory?.reserved??0,weightGrams:v.weightGrams}))}/></>;
}
