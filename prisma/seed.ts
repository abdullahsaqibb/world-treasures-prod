import { PrismaClient } from "@prisma/client";
import products from "../src/data/products.json";
const db=new PrismaClient();
async function main(){
 for(const p of products){
  const slug=p.category.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const category=await db.category.upsert({where:{slug},create:{slug,name:p.category},update:{name:p.category}});
  const product=await db.product.upsert({where:{id:p.id},create:{
   id:p.id,slug:p.id,name:p.name,description:p.shortDescription,categoryId:category.id,status:"DRAFT",verified:false
  },update:{}});
  if(!await db.productImage.findFirst({where:{productId:product.id,url:p.image}}))await db.productImage.create({data:{productId:product.id,url:p.image,alt:p.name}});
  const sku="WT-"+p.id.toUpperCase();
  const variant=await db.productVariant.upsert({where:{sku},create:{productId:product.id,sku,label:"Standard",priceCents:p.priceCents},update:{}});
  await db.inventory.upsert({where:{variantId:variant.id},create:{variantId:variant.id,onHand:p.stock,reserved:0},update:{}});
 }
 console.log("Seeded prototype catalog as drafts:",products.length);
}
main().finally(async()=>await db.$disconnect()).catch(e=>{console.error(e);process.exitCode=1;});
