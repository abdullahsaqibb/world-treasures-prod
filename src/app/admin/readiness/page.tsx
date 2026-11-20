import {ensureAdminPage} from "@/lib/admin-access";
import {adminConfiguration} from "@/lib/admin-config";
import {db} from "@/lib/db";
import Link from "next/link";
export const dynamic="force-dynamic";
type Check={label:string;ok:boolean;detail:string;critical?:boolean};
export default async function Readiness(){
 await ensureAdminPage();
 const cfg=adminConfiguration();
 let schema=false,dbError=false,products=0,verified=0,active=0,cities=0,orders=0,mailConfigured=false;
 try {
  const [p,v,a,c,o]=await Promise.all([
   db.product.count(),
   db.product.count({where:{verified:true}}),
   db.product.count({where:{status:"ACTIVE",verified:true}}),
   db.city.count({where:{active:true,rates:{some:{active:true}}}}),
   db.order.count()
  ]);
  schema=true;products=p;verified=v;active=a;cities=c;orders=o;
 }catch{dbError=true}
 // These status bits intentionally reveal no environment variable values or credentials.
 mailConfigured=Boolean(process.env.TRANSACTIONAL_EMAIL_API_KEY);
 const checks:Check[]=[
  {label:"Staff GitHub OAuth",ok:cfg.oauth&&cfg.sessionSecret&&cfg.allowlist,detail:"OAuth application, session secret and restricted staff access",critical:true},
  {label:"Database connection",ok:cfg.database&&schema,detail:dbError?"Database connection or schema could not be verified":"Required catalog, order and delivery tables are queryable",critical:true},
  {label:"Migration connection",ok:cfg.directDatabase,detail:"Direct database URL available for reviewed migrations"},
  {label:"Verified products",ok:verified>0,detail:verified+" of "+products+" products checked against supplier details",critical:true},
  {label:"Publishable catalog",ok:active>0,detail:active+" products marked ACTIVE and verified",critical:true},
  {label:"Delivery coverage",ok:cities>0,detail:cities+" active cities with active shipping rates",critical:true},
  {label:"PayFast processing",ok:false,detail:"No live checkout, verified ITN webhook or refund reconciliation is implemented",critical:true},
  {label:"Order notifications",ok:false,detail:mailConfigured?"Email credential present; transactional workflows not implemented":"Transactional sender and notification workflows are not connected"},
  {label:"Customer accounts",ok:false,detail:"Google/email customer authentication is planned; not active"}
 ];
 const ready=checks.filter(x=>x.ok).length;
 return <div><span className="wt-eyebrow">OPERATIONS / RELEASE CHECKS</span><div className="wt-head"><div><h1>Launch readiness</h1><p className="wt-lede">A factual checklist derived from this environment's configuration and live database counts. This is not a substitute for browser or payment acceptance tests.</p></div><Link href="/admin" className="wt-btn light">← Dashboard</Link></div>
 <div className="wt-grid"><div className="wt-stat"><small>Checks passing</small><b>{ready}/{checks.length}</b><span>Configuration and readiness</span></div><div className="wt-stat"><small>Products in this environment</small><b>{products}</b><span>{verified} verified</span></div><div className="wt-stat"><small>Orders recorded</small><b>{orders}</b><span>Not proof of successful payment</span></div><div className="wt-stat"><small>Environment</small><b style={{fontSize:"20px"}}>{cfg.environment.toUpperCase()}</b><span>Current Vercel deployment target</span></div></div>
 <section className="wt-card"><div className="wt-cardhead"><h2>System checks</h2><span className="wt-badge amber">Not approved for live trading</span></div><div className="wt-feature-stack">{checks.map(check=><div className="wt-feature-row" key={check.label}><div><strong>{check.label}</strong><small>{check.detail}</small></div><span className={"wt-state-pill"+(check.ok?" ready":"")}>{check.ok?"Present":check.critical?"Blocking":"Incomplete"}</span></div>)}</div></section>
 <div className="wt-help"><strong>Release rule:</strong> The store must not accept real transactions until prices, inventory, shipping, PayFast ITN verification, order persistence, and email confirmations pass end-to-end acceptance tests. The presence of credentials alone is not proof that an integration is operational.</div>
 </div>;
}
