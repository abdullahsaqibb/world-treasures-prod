import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const cityId=new URL(request.url).searchParams.get("cityId");
 if(!cityId || cityId.length>128)return NextResponse.json({error:"Select a city"},{status:400});
 const rate=await db.shippingRate.findFirst({
  where:{cityId,active:true,city:{active:true},service:"STANDARD",validFrom:{lte:new Date()},OR:[{validUntil:null},{validUntil:{gte:new Date()}}]},
  orderBy:{createdAt:"desc"},select:{feeCents:true,city:{select:{name:true,province:true}}}
 });
 if(!rate)return NextResponse.json({error:"No configured delivery rate"},{status:404});
 return NextResponse.json({cityId,city:rate.city.name,province:rate.city.province,feeCents:rate.feeCents,currency:"ZAR"},{headers:{"Cache-Control":"no-store"}});
}
