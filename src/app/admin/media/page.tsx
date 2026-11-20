import {ensureAdminPage} from "@/lib/admin-access";
import Link from "next/link";
import {MediaPreflight} from "./MediaPreflight";
export const dynamic="force-dynamic";
export default async function MediaPage(){
 await ensureAdminPage();
 return <div><span className="wt-eyebrow">BRAND / CREATIVE ASSETS</span>
 <div className="wt-head"><div><h1>Product media</h1><p className="wt-lede">Prepare and inspect product photographs before they enter the approved catalog. Secure cloud uploads are not enabled until storage is configured.</p></div><Link className="wt-btn light" href="/admin/products">← Product catalog</Link></div>
 <MediaPreflight/>
 <section className="wt-card" style={{marginTop:20}}><div className="wt-cardhead"><h2>Storage connection checklist</h2><span className="wt-badge amber">Requires approval</span></div><div className="wt-feature-stack">
 <div className="wt-feature-row"><div><strong>1. Select storage provider</strong><small>Recommended: a dedicated public Vercel Blob store for product photos only</small></div><span className="wt-state-pill">Awaiting decision</span></div>
 <div className="wt-feature-row"><div><strong>2. Connect storage to the development environment</strong><small>Keep server-side credentials private; no tokens in browser code or GitHub</small></div><span className="wt-state-pill">Not configured</span></div>
 <div className="wt-feature-row"><div><strong>3. Enable authenticated direct uploads</strong><small>Staff authorization, token expiry, server-side MIME and image validation, unique paths and upload limits</small></div><span className="wt-state-pill">Planned</span></div>
 <div className="wt-feature-row"><div><strong>4. Test upload → preview → product save → public catalog</strong><small>Verify working URLs and safe retention before any production activation</small></div><span className="wt-state-pill">Planned</span></div>
 </div></section></div>;
}