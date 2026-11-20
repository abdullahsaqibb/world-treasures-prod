"use server";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/** Guard stock against concurrent reservations inside the SQL UPDATE itself.
 * A failed write aborts the enclosing transaction so price/catalog changes roll back too.
 */
async function updateInventoryWithoutDroppingReservations(tx:Prisma.TransactionClient,variantId:string,onHand:number){
 const updated=await tx.inventory.updateMany({
  where:{variantId,reserved:{lte:onHand}},
  data:{onHand}
 });
 if(updated.count===1)return;
 const current=await tx.inventory.findUnique({where:{variantId},select:{reserved:true}});
 if(current)throw new Error("Stock cannot be lower than reserved units");
 await tx.inventory.create({data:{variantId,onHand,reserved:0}});
}

/** Preserve the primary image and its ordered gallery. All URLs must be HTTPS or local paths. */
function galleryFromForm(form:FormData):string[]{
 const cover=imagePath(optionalText(form.get("image"),1200));
 const lines=optionalText(form.get("galleryUrls"),7800).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.length>7)throw new Error("Maximum 8 product images including the cover");
 const urls=[...(cover?[cover]:[]),...lines.map(x=>imagePath(x)!)];
 return [...new Set(urls)];
}

import { requireAdmin } from "@/auth";
import { revalidatePath } from "next/cache";
import { money,qty,clean,optionalText,slugify,imagePath,checkAvailableStock,checkPublishEligibility } from "@/lib/catalog-validation";

export async function saveProduct(form:FormData){
 await requireAdmin();
 const productId=clean(form.get("productId"),128);
 const name=clean(form.get("name"));
 const priceCents=money(form.get("priceZar"));
 const stock=qty(form.get("stock"));
 const product=await db.product.findUnique({where:{id:productId},include:{variants:{include:{inventory:true},take:1}}});
 if(!product||!product.variants[0])throw new Error("Unknown product");
 const variant=product.variants[0];
 checkAvailableStock(stock,variant.inventory?.reserved??0);
 await db.$transaction(async tx=>{
  // Check again within the transaction to avoid silently reducing stock beneath reservations.
  await tx.product.update({where:{id:productId},data:{name}});
  await tx.productVariant.update({where:{id:variant.id},data:{priceCents}});
  await updateInventoryWithoutDroppingReservations(tx,variant.id,stock);
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

export async function createCatalogProduct(form:FormData){
 await requireAdmin();
 const name=clean(form.get("name"),150);
 const slug=slugify(optionalText(form.get("slug"),150)||name);
 if(!slug)throw new Error("Please provide a valid product URL slug");
 const categoryId=clean(form.get("categoryId"),128);
 const sku=(optionalText(form.get("sku"),100)||"WT-"+slug).toUpperCase();
 if(!/^[A-Z0-9][A-Z0-9._-]*$/.test(sku))throw new Error("SKU may contain letters, numbers, dots, dashes and underscores");
 const priceCents=money(form.get("priceZar"));
 const stock=qty(form.get("stock"));
 const description=optionalText(form.get("description"),3000);
 const image=imagePath(optionalText(form.get("image"),1200));
 const gallery=galleryFromForm(form);
 const weight=optionalText(form.get("weightGrams"),12);
 const weightGrams=weight?qty(weight):null;
 const category=await db.category.findUnique({where:{id:categoryId}});
 if(!category)throw new Error("Choose a valid category");
 const id=crypto.randomUUID();
 await db.$transaction(async tx=>{
  await tx.product.create({data:{id,name,slug,description,categoryId,status:"DRAFT",verified:false}});
  for(let i=0;i<gallery.length;i++)await tx.productImage.create({data:{productId:id,url:gallery[i],alt:name,sortOrder:i}});
  const variant=await tx.productVariant.create({data:{productId:id,sku,label:"Standard",priceCents,weightGrams}});
  await tx.inventory.create({data:{variantId:variant.id,onHand:stock,reserved:0}});
 });
 revalidatePath("/admin/products");revalidatePath("/admin");
 return id;
}
export async function updateCatalogProduct(form:FormData){
 await requireAdmin();
 const id=clean(form.get("productId"),128);
 const name=clean(form.get("name"),150);
 const slug=slugify(clean(form.get("slug"),150));
 if(!slug)throw new Error("Please provide a valid product URL slug");
 const categoryId=clean(form.get("categoryId"),128);
 const priceCents=money(form.get("priceZar"));
 const stock=qty(form.get("stock"));
 const description=optionalText(form.get("description"),3000);
 const image=imagePath(optionalText(form.get("image"),1200));
 const weight=optionalText(form.get("weightGrams"),12);
 const weightGrams=weight?qty(weight):null;
 const sku=clean(form.get("sku"),100).toUpperCase();
 if(!/^[A-Z0-9][A-Z0-9._-]*$/.test(sku))throw new Error("SKU may contain letters, numbers, dots, dashes and underscores");
 const status=form.get("status")==="ACTIVE"?"ACTIVE":form.get("status")==="ARCHIVED"?"ARCHIVED":"DRAFT";
 const verified=form.get("verified")==="on";
 const existing=await db.product.findUnique({where:{id},include:{variants:{include:{inventory:true},orderBy:{id:"asc"}},images:{orderBy:{sortOrder:"asc"}}}});
 if(!existing?.variants[0])throw new Error("Product not found");
 const variant=existing.variants[0];
 checkAvailableStock(stock,variant.inventory?.reserved??0);
 if(!await db.category.findUnique({where:{id:categoryId}}))throw new Error("Choose a valid category");
 if(status==="ACTIVE")checkPublishEligibility({
  verified,name,description,images:gallery,
  variants:existing.variants.map(v=>({
   sku:v.id===variant.id?sku:v.sku,
   priceCents:v.id===variant.id?priceCents:v.priceCents,
   onHand:v.id===variant.id?stock:v.inventory?.onHand??0,
   reserved:v.inventory?.reserved??0
  }))
 });
 await db.$transaction(async tx=>{
  await tx.product.update({where:{id},data:{name,slug,description,categoryId,status,verified}});
  await tx.productVariant.update({where:{id:variant.id},data:{sku,priceCents,weightGrams}});
  await updateInventoryWithoutDroppingReservations(tx,variant.id,stock);
  // Reuse existing gallery records whenever possible; remove only URLs explicitly removed in the editor.
  for(let i=0;i<gallery.length;i++){
   const prior=existing.images.find(x=>x.url===gallery[i]);
   if(prior)await tx.productImage.update({where:{id:prior.id},data:{sortOrder:i,alt:name}});
   else await tx.productImage.create({data:{productId:id,url:gallery[i],alt:name,sortOrder:i}});
  }
  const unwanted=existing.images.filter(x=>!gallery.includes(x.url)).map(x=>x.id);
  if(unwanted.length)await tx.productImage.deleteMany({where:{id:{in:unwanted},productId:id}});
 });
 revalidatePath("/admin");revalidatePath("/admin/products");revalidatePath("/admin/products/"+encodeURIComponent(id));revalidatePath("/catalog");revalidatePath("/catalog/"+encodeURIComponent(slug));revalidatePath("/");
}

export async function createCategory(form:FormData){
 await requireAdmin();
 const name=clean(form.get("name"),90);
 const slug=slugify(optionalText(form.get("slug"),90)||name);
 if(!slug)throw new Error("Invalid category slug");
 await db.category.create({data:{name,slug}});
 revalidatePath("/admin/categories");revalidatePath("/admin/products/new");revalidatePath("/admin/products");
}
export async function renameCategory(form:FormData){
 await requireAdmin();
 const id=clean(form.get("categoryId"),128);
 const name=clean(form.get("name"),90);
 await db.category.update({where:{id},data:{name}});
 revalidatePath("/admin/categories");revalidatePath("/admin/products");
}

export async function saveStorefrontCopy(form:FormData){
 await requireAdmin();
 const {copyFields}=await import("@/lib/storefront-copy");
 const intent=form.get("intent")==="publish"?"publish":"draft";
 await db.$transaction(async tx=>{
  for(const field of copyFields){
   const text=optionalText(form.get(field.key),500);
   if(!text)throw new Error("Content cannot be empty: "+field.label);
   const existing=await tx.storeContent.findUnique({where:{key:field.key}});
   if(existing)await tx.storeContent.update({where:{key:field.key},data:{draftValue:text,...(intent==="publish"?{publishedValue:text}:{})}});
   else await tx.storeContent.create({data:{key:field.key,draftValue:text,publishedValue:intent==="publish"?text:null}});
  }
 });
 revalidatePath("/admin/storefront");revalidatePath("/");
}

/** Form actions that return client-safe, actionable feedback instead of generic 500 pages. */
export type CatalogFormState={ok:boolean;message:string;productId?:string};
function catalogError(error:unknown):string{
 const e=error as {code?:string;message?:string;meta?:{target?:string[]}};
 if(e?.code==="P2002"){
  const target=(e.meta?.target??[]).join(" ").toLowerCase();
  if(target.includes("sku"))return "This SKU is already used by another item. Enter a different product code.";
  if(target.includes("slug"))return "This product URL is already used. Try a different handle.";
  return "A product already uses one of these identifiers. Check the SKU or URL.";
 }
 const message=e?.message??"";
 const allowedPrefixes=["Enter ","Invalid ","Stock ","Choose ","Please ","Product ","SKU ","Amount ","Image ","Text ","Unknown "];
 if(allowedPrefixes.some(prefix=>message.startsWith(prefix)))return message;
 return "We couldn't save your changes. Please try again. If this continues, contact the store administrator.";
}
export async function createCatalogProductState(_previous:CatalogFormState,form:FormData):Promise<CatalogFormState>{
 try {
  const id=await createCatalogProduct(form);
  return {ok:true,message:"Your draft product was created successfully.",productId:id};
 }catch(error){return {ok:false,message:catalogError(error)};}
}
export async function updateCatalogProductState(_previous:CatalogFormState,form:FormData):Promise<CatalogFormState>{
 try {
  await updateCatalogProduct(form);
  return {ok:true,message:"Product changes saved successfully."};
 }catch(error){return {ok:false,message:catalogError(error)};}
}
