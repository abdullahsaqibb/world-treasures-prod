import Link from "next/link";
export const dynamic="force-dynamic";
export default async function AdminLayout({children}:{children:React.ReactNode}){
 return <div style={{minHeight:"100vh",background:"#F6F3EB",color:"#101F38",fontFamily:"system-ui"}}>
 <nav style={{display:"flex",flexWrap:"wrap",gap:18,padding:"20px 5%",background:"#101F38",color:"white"}}>
 <strong>World Treasures Admin</strong><Link href="/admin">Overview</Link><Link href="/admin/products">Products</Link><Link href="/admin/delivery">Delivery fees</Link><Link href="/">Storefront</Link>
 </nav><main style={{maxWidth:1150,margin:"auto",padding:"30px 5%"}}>{children}</main></div>;
}
