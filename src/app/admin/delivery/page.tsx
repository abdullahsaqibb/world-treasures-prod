import {ensureAdminPage} from "@/lib/admin-access";
import {db} from "@/lib/db";
import {saveDeliveryService,updateDeliveryRate} from "../actions";
import {deliveryServiceLabel} from "@/lib/delivery-services";
export const dynamic="force-dynamic";
export default async function DeliveryPage(){
 await ensureAdminPage();
 const now=new Date();
 const cities=await db.city.findMany({
  include:{rates:{where:{service:{in:["LOCAL","NATIONAL","STANDARD"]}},orderBy:{createdAt:"desc"}}},
  orderBy:[{province:"asc"},{name:"asc"}]
 });
 const entries=cities.flatMap(city=>{
  const seen=new Set<string>();
  return city.rates.filter(rate=>{if(seen.has(rate.service))return false;seen.add(rate.service);return true;}).map(rate=>({
    city,rate,active:city.active&&rate.active&&rate.validFrom<=now&&(!rate.validUntil||rate.validUntil>=now)
  }));
 });
 const activeLocal=entries.filter(e=>e.active&&e.rate.service==="LOCAL").length;
 const activeNational=entries.filter(e=>e.active&&e.rate.service==="NATIONAL").length;
 return <div>
  <span className="wt-eyebrow">FULFILLMENT / DELIVERY OPTIONS</span>
  <div className="wt-head"><div><h1>Delivery & shipping</h1><p className="wt-lede">Manage local-store delivery and South African courier coverage independently. Both require real confirmed fees and serviceable destinations.</p></div><span className="wt-badge amber">Checkout disabled</span></div>
  <div className="wt-help"><strong>Do not invent coverage or prices.</strong> Save delivery destinations as drafts until a courier or local driver confirms fees. A published city is only available for its explicitly enabled service. National courier coverage here is city-based, not a blanket promise to serve every South African postal address.</div>
  <div className="wt-grid"><div className="wt-stat"><small>Published local destinations</small><b>{activeLocal}</b><span>Served by store delivery</span></div><div className="wt-stat"><small>Published courier destinations</small><b>{activeNational}</b><span>Served by nationwide courier</span></div><div className="wt-stat"><small>Prepared delivery rates</small><b>{entries.filter(x=>!x.active).length}</b><span>Hidden from customers</span></div></div>
  <div className="wt-2col"><section className="wt-card"><div className="wt-cardhead"><h2>Destination rates</h2><span className="wt-badge">{entries.length} configured</span></div>
   {entries.length?<div className="wt-stack">{entries.map(({city,rate,active})=><form key={rate.id} action={updateDeliveryRate} className="wt-card" style={{padding:16,marginBottom:0}}>
    <div className="wt-cardhead"><div><h3>{city.name}, {city.province}</h3><span className="wt-muted">{deliveryServiceLabel(rate.service)}</span></div><span className={"wt-badge "+(active?"green":"amber")}>{active?"Published":"Draft / inactive"}</span></div>
    <input type="hidden" name="rateId" value={rate.id}/>
    <div className="wt-formgrid"><label className="wt-field">Delivery fee (ZAR)<input name="feeZar" type="number" required min="0" step=".01" defaultValue={(rate.feeCents/100).toFixed(2)}/></label><div className="wt-field"><span>Availability</span><label className="wt-check"><input name="active" type="checkbox" defaultChecked={active}/> Publish rate</label></div></div>
    <div className="wt-actions" style={{marginTop:14}}><button type="submit" className="wt-btn light">Save changes</button></div>
   </form>)}</div>:<div className="wt-empty"><h3>No rates configured</h3><p>Add the first local or courier destination as a draft when the area and fee are confirmed.</p></div>}
  </section><section className="wt-card"><h2>Add a delivery destination</h2><p className="wt-lede">Create a specific city and its fee for one delivery method. You can add the same city twice with different local and courier rates.</p>
   <form action={saveDeliveryService} className="wt-stack">
    <label className="wt-field">Delivery method<select name="service" required defaultValue="LOCAL"><option value="LOCAL">Local delivery from physical store</option><option value="NATIONAL">Nationwide courier delivery</option></select></label>
    <label className="wt-field">Destination city<input name="city" required maxLength={100} placeholder="Enter confirmed city"/></label>
    <label className="wt-field">Province<input name="province" required maxLength={100} placeholder="Enter province"/></label>
    <label className="wt-field">Confirmed delivery fee (ZAR)<input name="feeZar" required type="number" min="0" step=".01" placeholder="Enter actual quote"/></label>
    <label className="wt-check"><input name="active" type="checkbox"/> Publish this destination and fee immediately</label>
    <button className="wt-btn orange" type="submit">Save destination</button>
   </form>
   <div className="wt-help">Recommended: leave Publish unchecked at first. If shipping refrigerated products, arrange a temperature-controlled service before offering them for courier shipping.</div>
  </section></div>
 </div>;
}
