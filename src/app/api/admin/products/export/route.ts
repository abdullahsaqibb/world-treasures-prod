import {auth} from "@/auth";
import {db} from "@/lib/db";
import {NextResponse} from "next/server";
import {isAuthorizedAdminId} from "@/lib/admin-config";
export const dynamic="force-dynamic";
function cell(value:string|number|boolean|null|undefined){
 let v=String(value??"");
 // Prevent spreadsheet formula execution when users open the export.
 if(/^[\s\u0000-\u001f]*[=+@-]/.test(v))v="'"+v;
 return '"'+v.replaceAll('"','""')+'"';
}
export async function GET(){
 const session=await auth();
 if(!isAuthorizedAdminId(session?.user?.id))
  return NextResponse.json({error:"Unauthorized"},{status:401,headers:{"Cache-Control":"no-store"}});
 const products=await db.product.findMany({select:{name:true,slug:true,status:true,verified:true,category:{select:{name:true}},variants:{select:{sku:true,label:true,priceCents:true,weightGrams:true,inventory:{select:{onHand:true,reserved:true}}}}},orderBy:{name:"asc"}});
 const header=["Product name","Product URL","Category","SKU","Variant","Price (ZAR)","On hand","Reserved","Weight (g)","Status","Verified"];
 const rows=products.flatMap(p=>(p.variants.length?p.variants:[null]).map(v=>[p.name,p.slug,p.category.name,v?.sku??"",v?.label??"",(v? v.priceCents/100:0).toFixed(2),v?.inventory?.onHand??0,v?.inventory?.reserved??0,v?.weightGrams??"",p.status,p.verified?"yes":"no"]));
 const csv="\uFEFF"+[header,...rows].map(row=>row.map(cell).join(",")).join("\r\n")+"\r\n";
 return new Response(csv,{status:200,headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":'attachment; filename="world-treasures-catalog.csv"',"Cache-Control":"private, no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
}
