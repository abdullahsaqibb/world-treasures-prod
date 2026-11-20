import {signIn} from "@/auth";
import Link from "next/link";
export const dynamic="force-dynamic";
export default function Login(){
 const configured=Boolean(process.env.AUTH_SECRET&&process.env.AUTH_GITHUB_ID&&process.env.AUTH_GITHUB_SECRET&&process.env.ADMIN_GITHUB_IDS);
 return <div className="wt-admin-login">
  <div className="wt-login-showcase"><div className="wt-login-brand"><span className="wt-login-logo">W<span>T</span></span><div><strong>WORLD TREASURES</strong><small>Merchant Studio</small></div></div>
   <div className="wt-login-art"><div className="wt-login-ring"/><span className="wt-login-spark spark-a">✳</span><span className="wt-login-spark spark-b">✳</span><span className="wt-login-block block-a">SELL</span><span className="wt-login-block block-b">CREATE</span><span className="wt-login-block block-c">GROW</span></div>
   <div className="wt-login-showcase-copy"><span className="wt-eyebrow">YOUR STORE. BEHIND THE SCENES.</span><h2>THE GOOD STUFF<br/>STARTS HERE.</h2><p>One place for products, people and everything that makes World Treasures happen.</p></div>
  </div>
  <div className="wt-login-area"><div className="wt-login-top"><span className="wt-admin-envdot"/> PRIVATE STAFF ACCESS</div><div className="wt-login-center"><span className="wt-login-tag">HELLO, TEAM WORLD TREASURES</span><h1>Welcome<br/>back<span>.</span></h1><p>Sign in to manage the store. Only approved administrators can enter this workspace.</p>
   {configured?<form action={async()=>{"use server";await signIn("github",{redirectTo:"/admin"});}}><button className="wt-login-button" type="submit"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 .6A11.4 11.4 0 0 0 8.4 22.8c.57.1.78-.24.78-.55v-2.1c-3.16.68-3.83-1.34-3.83-1.34-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.75 1.17 1.75 1.17 1.01 1.73 2.66 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.63 0-1.25.44-2.27 1.17-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.18A10.9 10.9 0 0 1 12 6.8c.97 0 1.95.13 2.87.39 2.18-1.49 3.13-1.18 3.13-1.18.63 1.58.24 2.75.12 3.04.73.81 1.17 1.83 1.17 3.08 0 4.38-2.65 5.34-5.18 5.62.41.36.77 1.05.77 2.12v2.38c0 .31.2.66.79.54A11.4 11.4 0 0 0 12 .6Z"/></svg> Continue with GitHub <span>↗</span></button></form>:<div className="wt-help">Administrator sign-in is not configured for this environment. Ask the store owner to complete the setup.</div>}
   <div className="wt-login-hint">Secure staff-only access · Product and customer accounts use separate permissions.</div>
   <Link className="wt-login-back" href="/">← Return to the storefront</Link>
  </div><div className="wt-login-foot">© World Treasures · Commerce control center</div></div>
 </div>;
}
