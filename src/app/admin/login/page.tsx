import { signIn } from "@/auth";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default function Login() {
  const configured=Boolean(process.env.AUTH_SECRET && process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET && process.env.ADMIN_GITHUB_IDS);
  return <main style={{maxWidth:500,margin:"12vh auto",padding:32,fontFamily:"system-ui"}}>
    <h1>World Treasures Admin</h1>
    <p>Only authorized staff can access management features.</p>
    {configured ? <form action={async()=>{"use server";await signIn("github",{redirectTo:"/admin"});}}><button type="submit" style={{padding:14,background:"#101F38",color:"#fff",borderRadius:8}}>Sign in with GitHub</button></form> : <p>Administrator sign-in is not configured. See ADMIN_SETUP.md.</p>}
    <p><Link href="/">Return to store</Link></p>
  </main>;
}
