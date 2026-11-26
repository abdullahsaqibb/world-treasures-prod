import Link from "next/link";
import {redirect} from "next/navigation";
import {currentCustomer} from "@/lib/customer-session-cookie";
import {db} from "@/lib/db";
import type {Metadata} from "next";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"My account",robots:{index:false,follow:false}};
export default async function AccountPage(){
 const user=await currentCustomer();
 if(!user)redirect("/account/login");
 const orders=await db.order.findMany({where:{userId:user.id},select:{id:true,orderNumber:true,status:true,totalCents:true,createdAt:true},orderBy:{createdAt:"desc"},take:30});
 return <main style={{maxWidth:1040,margin:"6vh auto",padding:"24px 5%"}}>
  <Link href="/">← WORLD TREASURES</Link>
  <h1 style={{fontSize:48,margin:"35px 0 18px"}}>MY ACCOUNT</h1>
  <p style={{marginBottom:25}}>Signed in as {user.email}</p>
  <form method="post" action="/api/customer/auth/logout"><button type="submit" style={{padding:"12px 20px",border:"1px solid var(--ink,#222)",background:"transparent"}}>Sign out</button></form>
  <section style={{marginTop:55}}>
   <h2 style={{fontSize:34,marginBottom:22}}>MY ORDERS</h2>
   {orders.length?<div style={{display:"grid",gap:15}}>{orders.map(order=><article key={order.id} style={{padding:18,border:"1px solid var(--line,#ddd)",borderRadius:4}}>
    <strong>{order.orderNumber}</strong> · {order.status.replaceAll("_"," ")}
    <p style={{marginTop:8}}>R {(order.totalCents/100).toFixed(2)} · {order.createdAt.toLocaleDateString("en-ZA")}</p>
   </article>)}</div>:<p>You have no orders yet. Checkout will be available after payment and delivery setup is complete.</p>}
  </section>
  <Link href="/catalog" style={{display:"inline-block",marginTop:30,textDecoration:"underline"}}>Explore products</Link>
 </main>;
}
