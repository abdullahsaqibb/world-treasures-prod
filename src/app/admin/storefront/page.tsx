import { ensureAdminPage } from "@/lib/admin-access";
import Link from "next/link";
export const dynamic="force-dynamic";
const areas=[
 {title:"Homepage hero & carousel",details:"Slide order, headlines, descriptions, call-to-action buttons, promotional banners and mobile hero images.",phase:"Planned"},
 {title:"Homepage sections",details:"Featured products, category blocks, bestselling items, section titles, display order, visibility and campaign sections.",phase:"Planned"},
 {title:"Brand & appearance",details:"Store logo, typography, colour palette, button styles, spacing, backgrounds and responsive presentation.",phase:"Planned"},
 {title:"Store navigation",details:"Main menu, footer links, categories, announcements, policy links and contact details.",phase:"Planned"},
 {title:"Pages & content",details:"About, shipping, returns, privacy, terms, contact information and search/SEO metadata.",phase:"Planned"},
 {title:"Media library",details:"Upload, organize, crop, replace and remove photos and banner images without writing image URLs.",phase:"Planned"}
];
export default async function StorefrontAdmin(){
 await ensureAdminPage();
 return <div><span className="wt-eyebrow">Store experience</span><div className="wt-head"><div><h1>Storefront & content</h1><p className="wt-lede">This is where your client will eventually manage how the public website looks and reads, without touching code.</p></div><Link href="/" target="_blank" className="wt-btn light">Preview current store ↗</Link></div>
 <div className="wt-help"><strong>Important:</strong> The public storefront is currently built from the approved React prototype, not a live page builder. These visual editing modules are planned, not functional controls. We'll add authenticated content storage, previews, and a Publish action before enabling them.</div>
 <section className="wt-card"><div className="wt-cardhead"><h2>Editing areas</h2><span className="wt-badge">Roadmap</span></div><div className="wt-shortcuts">{areas.map(x=><div className="wt-shortcut" key={x.title}><span className="wt-badge amber">{x.phase}</span><b>{x.title}</b><span>{x.details}</span></div>)}</div></section>
 <div className="wt-2col"><div className="wt-card"><h2>How editing will work</h2><div className="wt-stack" style={{marginTop:15}}><p><strong>1. Choose an area</strong><br/><span className="wt-muted">Select the homepage, a page, a section, or a visual asset.</span></p><p><strong>2. Edit safely</strong><br/><span className="wt-muted">Make changes in the editor, preserving the current live version.</span></p><p><strong>3. Preview desktop and mobile</strong><br/><span className="wt-muted">Review how customers will see your changes.</span></p><p><strong>4. Publish or roll back</strong><br/><span className="wt-muted">Promote a reviewed version to the live website, with a revision history.</span></p></div></div>
 <div className="wt-card"><h2>What you can manage today</h2><p className="wt-lede">The product database and delivery fees are ready to edit in this development admin.</p><div className="wt-stack"><Link className="wt-btn" href="/admin/products">Manage products →</Link><Link className="wt-btn light" href="/admin/delivery">Manage delivery rates →</Link></div></div></div>
 </div>;
}