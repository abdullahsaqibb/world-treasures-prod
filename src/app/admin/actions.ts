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
 if(stock<(variant.inventory?.reserved??0))throw new Error("Stock cannot be lower than units reserved for orders");
 await db.$transaction(async tx=>{
  // Check again within the transaction to avoid silently reducing stock beneath reservations.
  const current=await tx.inventory.findUnique({where:{variantId:variant.id},select:{reserved:true}});
  if(current&&stock<current.reserved)throw new Error("Stock cannot be lower than reserved units");
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

function optionalText(value:FormDataEntryValue|null,max=1500) {
 const result=String(value??"").trim();if(result.length>max)throw new Error("Text too long");return result;
}
function slugify(value:string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
function imagePath(value:string){
 if(!value)return null;
 if(value.startsWith("/")&&!value.startsWith("//")&&!/\s/.test(value))return value;
 if(/^https:\/\/[^\s]+$/i.test(value))return value;
 throw new Error("Image must be a secure https URL or a local /products/... path");
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
 const weight=optionalText(form.get("weightGrams"),12);
 const weightGrams=weight?qty(weight):null;
 const category=await db.category.findUnique({where:{id:categoryId}});
 if(!category)throw new Error("Choose a valid category");
 const id=crypto.randomUUID();
 await db.$transaction(async tx=>{
  await tx.product.create({data:{id,name,slug,description,categoryId,status:"DRAFT",verified:false}});
  if(image)await tx.productImage.create({data:{productId:id,url:image,alt:name}});
  const variant=await tx.productVariant.create({data:{productId:id,sku,label:"Standard",priceCents,weightGrams}});
  await tx.inventory.create({data:{variantId:variant.id,onHand:stock,reserved:0}});
 });
 revalidatePath("/admin/products");revalidatePath("/admin");
 const {redirect}=await import("next/navigation");redirect("/admin/products/"+encodeURIComponent(id));
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
 const status=form.get("status")==="ARCHIVED"?"ARCHIVED":"DRAFT";
 const verified=form.get("verified")==="on";
 const existing=await db.product.findUnique({where:{id},include:{variants:{include:{inventory:true},take:1},images:{orderBy:{sortOrder:"asc"},take:1}}});
 if(!existing?.variants[0])throw new Error("Product not found");
 const variant=existing.variants[0];
 if(stock<(variant.inventory?.reserved??0))throw new Error("Stock cannot be lower than quantity already reserved");
 if(!await db.category.findUnique({where:{id:categoryId}}))throw new Error("Choose a valid category");
 await db.$transaction(async tx=>{
  const current=await tx.inventory.findUnique({where:{variantId:variant.id},select:{reserved:true}});
  if(current&&stock<current.reserved)throw new Error("Stock cannot be lower than reserved units");
  await tx.product.update({where:{id},data:{name,slug,description,categoryId,status,verified}});
  await tx.productVariant.update({where:{id:variant.id},data:{sku,priceCents,weightGrams}});
  await tx.inventory.upsert({where:{variantId:variant.id},create:{variantId:variant.id,onHand:stock,reserved:0},update:{onHand:stock}});
  const prior=existing.images[0];
  if(image&&prior)await tx.productImage.update({where:{id:prior.id},data:{url:image,alt:name}});
  else if(image)await tx.productImage.create({data:{productId:id,url:image,alt:name}});
  else if(prior)await tx.productImage.delete({where:{id:prior.id}});
 });
 revalidatePath("/admin");revalidatePath("/admin/products");revalidatePath("/admin/products/"+encodeURIComponent(id));
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
