"use server";
import {requireAdmin} from "@/auth";
import {db} from "@/lib/db";
import {checkAvailableStock,clean,money,optionalText,qty} from "@/lib/catalog-validation";
import {revalidatePath} from "next/cache";

export type VariantResult={ok:boolean;message:string};
function readableError(error:unknown):string{
 const value=error as {code?:string;message?:string};
 if(value?.code==="P2002")return "This SKU is already used by another product variant.";
 const message=value?.message??"";
 if(/^(Enter |Invalid |Stock |SKU |Choose |Product |Variant |Amount |Every )/.test(message))return message;
 return "The variant could not be saved. Please check the details and try again.";
}
function parse(form:FormData){
 const label=clean(form.get("label"),100);
 const sku=clean(form.get("sku"),100).toUpperCase();
 if(!/^[A-Z0-9][A-Z0-9._-]*$/.test(sku))throw new Error("SKU may only contain letters, numbers, dots, dashes and underscores");
 const priceCents=money(form.get("priceZar"));
 const onHand=qty(form.get("onHand"));
 const weightRaw=optionalText(form.get("weightGrams"),12);
 const weightGrams=weightRaw?qty(weightRaw):null;
 return {label,sku,priceCents,onHand,weightGrams};
}
export async function createVariantState(_before:VariantResult,form:FormData):Promise<VariantResult>{
 try{
  await requireAdmin();
  const productId=clean(form.get("productId"),128);
  const entry=parse(form);
  const product=await db.product.findUnique({where:{id:productId},select:{slug:true,status:true,verified:true}});
  if(!product)throw new Error("Product not found");
  if(product.status==="ACTIVE"&&!product.verified)throw new Error("Product must be verified before adding a published variant");
  if(product.status==="ACTIVE"&&entry.priceCents<=0)throw new Error("Every published variant needs a verified price greater than zero");
  await db.$transaction(async tx=>{
   const variant=await tx.productVariant.create({data:{productId,sku:entry.sku,label:entry.label,priceCents:entry.priceCents,weightGrams:entry.weightGrams}});
   await tx.inventory.create({data:{variantId:variant.id,onHand:entry.onHand,reserved:0}});
  });
  revalidatePath("/admin/products/"+encodeURIComponent(productId));revalidatePath("/catalog/"+encodeURIComponent(product.slug));revalidatePath("/catalog");revalidatePath("/");
  return {ok:true,message:"Variant created. Refresh the page to see the complete variant list."};
 }catch(error){return {ok:false,message:readableError(error)};}
}
export async function updateVariantState(_before:VariantResult,form:FormData):Promise<VariantResult>{
 try{
  await requireAdmin();
  const variantId=clean(form.get("variantId"),128);
  const entry=parse(form);
  const variant=await db.productVariant.findUnique({where:{id:variantId},include:{product:{select:{id:true,slug:true,status:true,verified:true}},inventory:true}});
  if(!variant)throw new Error("Variant not found");
  checkAvailableStock(entry.onHand,variant.inventory?.reserved??0);
  if(variant.product.status==="ACTIVE"&&(!variant.product.verified||entry.priceCents<=0))throw new Error("Every published variant needs verification and a nonzero price");
  await db.$transaction(async tx=>{
   const changed=await tx.inventory.updateMany({where:{variantId,reserved:{lte:entry.onHand}},data:{onHand:entry.onHand}});
   if(!changed.count){
    const current=await tx.inventory.findUnique({where:{variantId},select:{reserved:true}});
    if(current)throw new Error("Stock cannot be lower than reserved units");
    await tx.inventory.create({data:{variantId,onHand:entry.onHand,reserved:0}});
   }
   await tx.productVariant.update({where:{id:variantId},data:{sku:entry.sku,label:entry.label,priceCents:entry.priceCents,weightGrams:entry.weightGrams}});
  });
  revalidatePath("/admin/products/"+encodeURIComponent(variant.product.id));revalidatePath("/catalog/"+encodeURIComponent(variant.product.slug));revalidatePath("/catalog");revalidatePath("/");
  return {ok:true,message:"Variant and inventory updated successfully."};
 }catch(error){return {ok:false,message:readableError(error)};}
}
