import {db} from "@/lib/db";
import {NextResponse} from "next/server";
import {parseDeliveryService,deliveryServiceLabel} from "@/lib/delivery-services";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const cityId=params.get("cityId");
 if(!cityId||cityId.length>128)return NextResponse.json({error:"Select a valid city"},{status:400});
 // Legacy STANDARD is maintained only for older clients. New client integrations
 // must explicitly request LOCAL or NATIONAL to avoid misquoting the service.
 const requested=params.get("service");
 let service:string="STANDARD";
 if(requested){
  try{service=parseDeliveryService(requested);}
  catch{return NextResponse.json({error:"Invalid delivery service"},{status:400});}
 }
 const now=new Date();
 const rate=await db.shippingRate.findFirst({
  where:{cityId,active:true,city:{active:true},service,validFrom:{lte:now},OR:[{validUntil:null},{validUntil:{gte:now}}]},
  orderBy:{createdAt:"desc"},
  select:{feeCents:true,service:true,city:{select:{name:true,province:true}}}
 });
 if(!rate)return NextResponse.json({error:"No confirmed delivery rate for this method and city"},{status:404,headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({cityId,city:rate.city.name,province:rate.city.province,service:rate.service,serviceName:deliveryServiceLabel(rate.service),feeCents:rate.feeCents,currency:"ZAR"},{headers:{"Cache-Control":"no-store"}});
}
