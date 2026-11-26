import Link from "next/link";
import type {Metadata} from "next";
export const metadata:Metadata={title:"Verify customer sign-in",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function VerifyAccountPage({searchParams}:{searchParams:Promise<{token?:string}>}){
 const {token}=await searchParams;
 const valid=typeof token==="string"&&/^[A-Za-z0-9_-]{43}$/.test(token);
 return <main style={{maxWidth:520,margin:"9vh auto",padding:24}}>
  <Link href="/">← WORLD TREASURES</Link>
  <h1 style={{fontSize:48,margin:"30px 0 12px"}}>CONFIRM SIGN-IN</h1>
  <p style={{lineHeight:1.7,marginBottom:25}}>{valid?"Confirm to securely open your customer account.":"This sign-in link is invalid or incomplete."}</p>
  {valid?<form method="post" action="/api/customer/auth/verify">
    <input type="hidden" name="token" value={token}/>
    <button type="submit" style={{background:"var(--ink,#24271f)",color:"white",padding:16,borderRadius:4}}>Confirm my sign-in</button>
  </form>:<Link href="/account/login">Request a new link</Link>}
 </main>;
}
