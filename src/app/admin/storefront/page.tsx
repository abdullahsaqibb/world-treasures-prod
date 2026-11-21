import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { copyFields } from "@/lib/storefront-copy";
import { saveStorefrontCopy } from "../actions";
import Link from "next/link";
export const dynamic="force-dynamic";
const future=[
 {title:"Homepage section builder",details:"Reorder, show/hide and configure featured products, campaign blocks and hero slides."},
 {title:"Brand styling & theme",details:"Edit approved colours, fonts, spacing and mobile-specific design tokens."},
 {title:"Image and video library",details:"Drag-and-drop media uploads, organization and image replacement."},
 {title:"Pages, navigation & SEO",details:"Manage menu items, footer, policy pages, metadata and site settings."},
 {title:"Preview & revision history",details:"Compare changes, preview mobile layouts, schedule publishing and restore previous versions."}
];
export default async function StorefrontAdmin(){
 await ensureAdminPage();
 const rows=await db.storeContent.findMany();
 const byKey=new Map(rows.map(x=>[x.key,x]));
 const published=copyFields.filter(x=>byKey.get(x.key)?.publishedValue!==null&&byKey.has(x.key)).length;
 return <div><span className="wt-eyebrow">Store experience / Content management</span><div className="wt-head"><div><h1>Storefront editor</h1><p className="wt-lede">Edit the words customers see on the website. Save your work as a draft, then publish to the development storefront when reviewed.</p></div><Link href="/" target="_blank" className="wt-btn light">Open development storefront ↗</Link></div>
 <div className="wt-grid"><div className="wt-stat"><small>Editable copy fields</small><b>{copyFields.length}</b><span>In this first content release</span></div><div className="wt-stat"><small>Published overrides</small><b>{published}</b><span>Fields using edited text</span></div></div>
 <div className="wt-help"><strong>Safe publishing:</strong> Saving a draft only changes admin data. Publishing updates the development preview's public-facing copy. The live production website is not affected because this branch has not been merged.</div>
 <form action={saveStorefrontCopy} className="wt-card"><div className="wt-cardhead"><h2>Homepage copy</h2><span className="wt-badge green">Editable now</span></div>
 <p className="wt-lede">Each field is labeled by where it appears. Leave the original text if you don't want to change it.</p>
 <div className="wt-formgrid">{copyFields.map(field=>{
 const record=byKey.get(field.key);
 return <label className={"wt-field "+(field.key.endsWith("intro")?"full":"")} key={field.key}>{field.label}<small>{field.hint}</small>
 {field.key.endsWith("intro")?<textarea name={field.key} maxLength={500} defaultValue={record?.draftValue??field.original} required/>:<input name={field.key} maxLength={500} defaultValue={record?.draftValue??field.original} required/>}
 {record?.publishedValue!==null&&record?.publishedValue!==undefined?<small>Current published text: {record.publishedValue}</small>:<small>Using original storefront text</small>}
 </label>})}</div>
 <div className="wt-actions" style={{marginTop:22}}><button className="wt-btn light" name="intent" value="draft">Save draft changes</button><button className="wt-btn orange" name="intent" value="publish">Publish copy to preview</button></div>
 </form>
 <section className="wt-card"><div className="wt-cardhead"><h2>Next visual editing tools</h2><span className="wt-badge amber">Planned — not active</span></div><p className="wt-lede">The copy editor above works now. The following modules require additional storage, preview and design controls before we expose them to store operators.</p><div className="wt-shortcuts">{future.map(x=><div key={x.title} className="wt-shortcut"><span className="wt-badge amber">Coming next</span><b>{x.title}</b><span>{x.details}</span></div>)}</div></section>
 </div>;
}