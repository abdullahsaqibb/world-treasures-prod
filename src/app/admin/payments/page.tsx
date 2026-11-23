import {ensureAdminPage} from "@/lib/admin-access";
import {db} from "@/lib/db";
import {payFastSettings} from "@/lib/payfast";
import Link from "next/link";
export const dynamic="force-dynamic";
export default async function PaymentsPage(){
 await ensureAdminPage();
 const cfg=payFastSettings();
 const [transactions,pending,confirmed,refunds]=await Promise.all([
  db.payment.count(),db.payment.count({where:{status:"PENDING"}}),
  db.payment.count({where:{status:"COMPLETED"}}),db.payment.count({where:{status:"REFUNDED"}})
 ]);
 const checks=[
  {name:"Merchant ID",ok:cfg.merchantIdPresent,detail:"PAYFAST_MERCHANT_ID — company-managed South African PayFast merchant account"},
  {name:"Merchant Key",ok:cfg.merchantKeyPresent,detail:"PAYFAST_MERCHANT_KEY — Vercel encrypted server-side only"},
  {name:"Security passphrase",ok:cfg.passphrasePresent,detail:"PAYFAST_PASSPHRASE — must match the merchant dashboard"},
  {name:"Verified payment callback",ok:false,detail:"Live PayFast ITN validation, source checks, amount matching and idempotency not activated"},
  {name:"Checkout release approval",ok:cfg.checkoutEnabled,detail:"Real checkout stays disabled even after credentials are supplied"},
  {name:"Refund reconciliation",ok:false,detail:"Refund authorization, reconciliation and customer updates not activated"}
 ];
 return <div>
  <span className="wt-eyebrow">FINANCE / GATEWAY</span>
  <div className="wt-head"><div><h1>PayFast payment management</h1><p className="wt-lede">World Treasures will use the South African company's PayFast merchant account. This workspace never displays merchant secrets or enables a payment from a configuration change.</p></div><span className="wt-badge amber">Card checkout disabled</span></div>
  <div className="wt-grid">
   <div className="wt-stat"><small>Recorded payment attempts</small><b>{transactions}</b><span>Database records</span></div>
   <div className="wt-stat"><small>Awaiting payment</small><b>{pending}</b><span>Unverified / pending</span></div>
   <div className="wt-stat"><small>Confirmed payments</small><b>{confirmed}</b><span>Internal status, not independently audited</span></div>
   <div className="wt-stat"><small>Refunded records</small><b>{refunds}</b><span>Merchant reconciliation pending</span></div>
  </div>
  <section className="wt-card"><div className="wt-cardhead"><h2>Integration readiness</h2><span className="wt-badge">{cfg.environment==="production"?"Production":"Preview / sandbox"}</span></div>
   <div className="wt-feature-stack">{checks.map(c=><div className="wt-feature-row" key={c.name}><div><strong>{c.name}</strong><small>{c.detail}</small></div><span className={"wt-state-pill"+(c.ok?" ready":"")}>{c.ok?"Present":"Not ready"}</span></div>)}</div>
  </section>
  <section className="wt-card"><h2>Company handoff</h2><p className="wt-lede">Once the South African company has an approved PayFast account, it can securely add the merchant ID, merchant key and security passphrase to Vercel. Never send these in chat or commit them to GitHub. A separate sandbox-to-live verification and release is required.</p>
   <div className="wt-help"><strong>Important:</strong> A return/success URL is not payment proof. Orders can only become PAID after a genuine validated, matching and deduplicated PayFast ITN and stored payment transaction. Email notifications must follow those verified transitions.</div>
   <Link className="wt-btn light" href="/admin/orders">View orders →</Link>
  </section>
 </div>;
}
