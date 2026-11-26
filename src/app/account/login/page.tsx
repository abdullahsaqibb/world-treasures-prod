import Link from "next/link";
import type {Metadata} from "next";
export const metadata:Metadata={title:"Customer sign in",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default function CustomerLoginPage({searchParams}:{searchParams:Promise<{sent?:string}>}){
 return <main style={{maxWidth:540,margin:"8vh auto",padding:"24px 22px",fontFamily:"var(--body,Arial,sans-serif)"}}>
  <Link href="/" style={{fontWeight:800}}>← WORLD TREASURES</Link>
  <h1 style={{fontSize:"clamp(38px,6vw,62px)",margin:"38px 0 16px"}}>YOUR ACCOUNT</h1>
  <p style={{lineHeight:1.7,marginBottom:24}}>Sign in using a secure one-time link sent to your email. No password needed.</p>
  <form action="/api/customer/auth/request" method="post" style={{display:"grid",gap:14}}>
   <label htmlFor="customer-email" style={{fontWeight:700}}>Email address</label>
   <input id="customer-email" name="email" required type="email" autoComplete="email" maxLength={254}
    placeholder="you@example.com" style={{padding:15,border:"1px solid var(--line,#ddd)",borderRadius:5}}/>
   <button type="submit" style={{padding:16,background:"var(--ink,#24271f)",color:"white",borderRadius:5,fontWeight:700}}>Email me a sign-in link</button>
  </form>
  <p style={{marginTop:20,lineHeight:1.6,fontSize:13}}>For account security, request a link only for your own email address. Customer accounts are separate from merchant staff access.</p>
  <Link href="/catalog" style={{display:"inline-block",marginTop:26,textDecoration:"underline"}}>Continue browsing</Link>
 </main>;
}
