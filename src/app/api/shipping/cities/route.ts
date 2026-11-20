import {db} from "@/lib/db";
import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
/** Public read-only list of enabled Standard delivery destinations. Never exposes admin credentials. */
export async function GET(){
 try{
  const now=new Date();
  const cities=await db.city.findMany({
   where:{active:true,rates:{some:{service:"STANDARD",active:true,validFrom:{lte:now},OR:[{validUntil:null},{validUntil:{gte:now}}]}}},
   select:{id:true,name:true,province:true},
   orderBy:[{province:"asc"},{name:"asc"}],take:300
  });
  return NextResponse.json({cities},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Delivery destinations are temporarily unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
