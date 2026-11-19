import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import ProductEditor from "../ProductEditor";
export const dynamic="force-dynamic";
export default async function NewProductPage(){await ensureAdminPage();const categories=await db.category.findMany({orderBy:{name:"asc"},select:{id:true,name:true}});return <ProductEditor categories={categories}/>;}
