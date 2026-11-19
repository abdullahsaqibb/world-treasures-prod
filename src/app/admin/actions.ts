"use server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/auth";
import { revalidatePath } from "next/cache";

function money(value:FormDataEntryValue|null){const s=String(value??"");if(!/^\d+(\.\d{1,2})?$/.test(s))throw new Error("Enter a non-negative ZAR amount (up to two decimals)");const [r,c=""]=s.split(".");const n=Number(r)*100+Number(c.padEnd(2,"0"));if(!Number.isSafeInteger(n)||n>100000000)throw new Error("Amount exceeds limit");return n;}
function qty(value:FormDataEntryValue|null){const s=String(value??"");if(!/^\d+$/.test(s))throw new Error("Invalid stock quantity");const n=Number(s);if(!Number.isSafeInteger(n)||n>1000000)throw new Error("Invalid stock quantity");return n;}
function clean(value:FormDataEntryValue|null,max=150){const text=String(value??"").trim();if(!text||text.length>max)throw new Error("Invalid text input");return text;}
export async function saveProduct(form:FormData){
 await requireAdmin();
 const productId=clean(form.get("productId"),128);
 const name=clean(form.get("name"));
 const priceCents=money(form.get("priceZar"));
 const stock=qty(form.get("stock"));
 const product=await db.product.findUnique({where:{id:productId},include:{variants:{include:{inventory:true},take:1}}});
 if(!product||!product.variants[0])throw new Error("Unknown product");
 const variant=product.variants[0];
 await db.$transaction(async tx=>{
  await tx.product.update({where:{id:productId},data:{name}});
  await tx.productVariant.update({where:{id:variant.id},data:{priceCents}});
  await tx.inventory.upsert({where:{variantId:variant.id},create:{variantId:variant.id,onHand:stock,reserved:0},update:{onHand:stock}});
 });
 revalidatePath("/admin/products");
}
export async function saveDeliveryCity(form:FormData){
 await requireAdmin();
 const name=clean(form.get("city"),100);
 const province=clean(form.get("province"),100);
 const normalizedName=name.toLocaleLowerCase("en-ZA").replace(/\s+/g," ");
 const feeCents=money(form.get("feeZar"));
 const active=form.get("active")==="on";
 const city=await db.city.upsert({where:{province_normalizedName:{province,normalizedName}},create:{name,province,normalizedName,active,aliases:[]},update:{name,active}});
 const old=await db.shippingRate.findFirst({where:{cityId:city.id,service:"STANDARD",courier:null},orderBy:{createdAt:"desc"}});
 if(old){await db.shippingRate.update({where:{id:old.id},data:{feeCents,active}});}
 else{await db.shippingRate.create({data:{cityId:city.id,feeCents,active,service:"STANDARD"}});}
 revalidatePath("/admin/delivery");
}
export async function updateDeliveryRate(form:FormData){
 await requireAdmin();
 const rateId=clean(form.get("rateId"),128);
 const feeCents=money(form.get("feeZar"));
 const active=form.get("active")==="on";
 await db.shippingRate.update({where:{id:rateId},data:{feeCents,active}});
 revalidatePath("/admin/delivery");
}
