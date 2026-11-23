import {db} from "@/lib/db";
import {NextResponse} from "next/server";
import {parseDeliveryService} from "@/lib/delivery-services";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const param=new URL(request.url).searchParams.get("service");
 let service: "LOCAL"|"NATIONAL"|null=null;
 if(param){
  try{service=parseDeliveryService(param);}
  catch{return NextResponse.json({error:"Invalid delivery service"},{status:400,headers:{"Cache-Control":"no-store"}});}
 }
 try{
  const now=new Date();
  const whereRate={active:true,validFrom:{lte:now},OR:[{validUntil:null},{validUntil:{gte:now}}],service:{in:service?[service]:["LOCAL","NATIONAL","STANDARD"]}};
  const cities=await db.city.findMany({
   where:{active:true,rates:{some:whereRate}},
   select:{id:true,name:true,province:true,rates:{where:whereRate,select:{service:true}}},
   orderBy:[{province:"asc"},{name:"asc"}],take:300
  });
  return NextResponse.json({cities:cities.map(c=>({
    id:c.id,name:c.name,province:c.province,services:[...new Set(c.rates.map(r=>r.service))]
   }))},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Delivery destinations are temporarily unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
