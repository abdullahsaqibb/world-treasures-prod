import {ensureAdminPage} from "@/lib/admin-access";
import {emailConfiguration} from "@/lib/email-provider";
import {buildEmailTest} from "@/lib/transactional-email";
import {EmailTestForm} from "./EmailTestForm";
export const dynamic="force-dynamic";
export default async function EmailPage(){
 await ensureAdminPage();
 const c=emailConfiguration();
 const enabled=process.env.VERCEL_ENV!=="production"||process.env.EMAIL_ADMIN_TEST_ENABLED==="true";
 const template=buildEmailTest();
 const rows=[
  {label:"Resend API connection",ok:c.hasApiKey,detail:"RESEND_API_KEY in Vercel environment"},
  {label:"Verified sender email",ok:c.hasSender,detail:"TRANSACTIONAL_EMAIL_FROM — address must be verified with the provider"},
  {label:"Owner test recipient",ok:c.hasAdminRecipient,detail:"Uses the authenticated store owner's configured login email, never an arbitrary recipient"},
  {label:"Production test-send switch",ok:enabled,detail:"EMAIL_ADMIN_TEST_ENABLED=true, only for deliberate owner tests"},
 ];
 return <div><span className="wt-eyebrow">COMMUNICATIONS / EMAIL</span>
 <div className="wt-head"><div><h1>Transactional email</h1><p className="wt-lede">Prepare order confirmations without exposing credentials or contacting customers before live checkout is approved.</p></div></div>
 <section className="wt-card"><h2>Connection readiness</h2><div className="wt-feature-stack">{rows.map(r=><div className="wt-feature-row" key={r.label}><div><strong>{r.label}</strong><small>{r.detail}</small></div><span className={"wt-state-pill"+(r.ok?" ready":"")}>{r.ok?"Present":"Not configured"}</span></div>)}</div>
 <p className="wt-help">Presence of an API key is not proof that the sending domain is verified or that messages are delivered.</p></section>
 <section className="wt-card"><h2>Administrator test</h2><EmailTestForm ready={c.configured&&enabled}/></section>
 <section className="wt-card"><h2>Prepared email templates</h2><div className="wt-stack"><p><strong>{template.subject}</strong></p><p>{template.text}</p><p className="wt-help">A separate payment-confirmed order template is prepared, but no automatic customer email is triggered until signed payment verification and order persistence are implemented and tested.</p></div></section>
 <section className="wt-card"><h2>Owner setup</h2><p>Create/verify a sending domain with Resend; place the API key and sender email in Vercel's encrypted environment variables. Verify SPF/DKIM per the provider's domain instructions, then enable the admin-only test switch. Never paste the API key into GitHub, the storefront, or a chat.</p></section>
 </div>;
}
