import Link from "next/link";
import { AdminIcon } from "./AdminFrame";
export type PlannedFeature={title:string;detail:string;state?:"planned"|"ready"};
export function AdminFeaturePage({eyebrow,title,description,icon,items,note}:{eyebrow:string;title:string;description:string;icon:string;items:PlannedFeature[];note:string}){
 return <div><span className="wt-eyebrow">{eyebrow}</span><div className="wt-head"><div className="wt-feature-header"><span className="wt-feature-header-icon"><AdminIcon name={icon} size={23}/></span><div><h1>{title}</h1><p className="wt-lede">{description}</p></div></div><Link href="/admin" className="wt-btn light">← Dashboard</Link></div>
 <section className="wt-card"><div className="wt-cardhead"><h2>Management capabilities</h2><span className="wt-badge amber">In development</span></div><p className="wt-muted">This is the planned management surface. Features labeled “Planned” are not enabled yet, so no live customer or payment data can be changed here.</p><div className="wt-feature-stack">{items.map(i=><div className="wt-feature-row" key={i.title}><div><strong>{i.title}</strong><small>{i.detail}</small></div><span className={"wt-state-pill"+(i.state==="ready"?" ready":"")}>{i.state||"Planned"}</span></div>)}</div></section>
 <div className="wt-help">{note}</div></div>;
}