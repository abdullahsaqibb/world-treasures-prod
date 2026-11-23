import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { saveDeliveryCity,updateDeliveryRate } from "../actions";
export const dynamic="force-dynamic";
export default async function DeliveryPage(){
 await ensureAdminPage();
 const cities=await db.city.findMany({include:{rates:{where:{service:"STANDARD"},orderBy:{createdAt:"desc"},take:1}},orderBy:[{province:"asc"},{name:"asc"}]});
 const now=new Date();
 const available=cities.filter(c=>c.active&&c.rates.some(rate=>rate.active&&rate.validFrom<=now&&(!rate.validUntil||rate.validUntil>=now))).length;
 const prepared=cities.length-available;
 return <div><span className="wt-eyebrow">Fulfillment & delivery</span><div className="wt-head"><div><h1>Delivery & shipping</h1><p className="wt-lede">Manage city-based delivery prices in South African Rand. Use the figures provided by your courier or delivery partner.</p></div><span className="wt-badge green">{available} enabled cities</span></div>
 <div className="wt-help"><strong>Launch safety:</strong> Create zones with the availability checkbox OFF until courier quotes are confirmed. A city only appears in the public delivery API after its city and current standard rate are both enabled. Payments and orders remain disabled.</div>
 <div className="wt-grid"><div className="wt-stat"><small>Ready for delivery quotes</small><b>{available}</b><span>Active city and current standard rate</span></div><div className="wt-stat"><small>Draft / not active</small><b>{prepared}</b><span>Hidden from public shipping options</span></div></div>
 <div className="wt-2col"><section className="wt-card"><div className="wt-cardhead"><h2>Current delivery zones</h2><span className="wt-badge">{cities.length} cities</span></div>
 {cities.length? <div className="wt-stack">{cities.map(city=>{const rate=city.rates[0];const availableNow=Boolean(city.active&&rate?.active&&rate.validFrom<=now&&(!rate.validUntil||rate.validUntil>=now));return <form className="wt-card" style={{padding:16,marginBottom:0}} key={city.id} action={rate?updateDeliveryRate:saveDeliveryCity}>
 <div className="wt-cardhead"><div><h3>{city.name}</h3><span className="wt-muted">{city.province}</span></div><span className={"wt-badge "+(availableNow?"green":"amber")}>{availableNow?"Published":"Draft / inactive"}</span></div>
 {rate?<input type="hidden" name="rateId" value={rate.id}/>:<><input type="hidden" name="city" value={city.name}/><input type="hidden" name="province" value={city.province}/></>}
 <div className="wt-formgrid"><label className="wt-field">Delivery fee (ZAR)<input type="number" name="feeZar" required min="0" step=".01" defaultValue={rate?(rate.feeCents/100).toFixed(2):""}/></label><div className="wt-field"><span>Availability</span><label className="wt-check"><input type="checkbox" name="active" defaultChecked={availableNow}/> Publish this rate</label></div></div>
 <div className="wt-actions" style={{marginTop:14}}><button type="submit" className="wt-btn light">Save changes</button></div></form>})}</div>:<div className="wt-empty"><h3>No cities configured</h3><p>Add your first delivery zone using the form.</p></div>}</section>
 <section className="wt-card"><h2>Add a delivery city</h2><p className="wt-lede">Prepare a South African city and standard delivery fee. The rate stays private until you explicitly enable it.</p>
 <form action={saveDeliveryCity} className="wt-stack"><label className="wt-field">City<input name="city" required maxLength={100} placeholder="e.g. Johannesburg"/></label><label className="wt-field">Province<input name="province" required maxLength={100} placeholder="e.g. Gauteng"/></label><label className="wt-field">Standard delivery fee (ZAR)<input name="feeZar" type="number" step=".01" min="0" required placeholder="e.g. 75.00"/></label><label className="wt-check"><input name="active" type="checkbox"/> Publish this city and rate (only after verifying the courier fee)</label><button type="submit" className="wt-btn orange">Save delivery city</button></form>
 <div className="wt-help">No placeholder delivery fees will be imported. Rates are managed separately from product prices. Confirm actual coverage and prices with your courier before enabling.</div>
 </section></div></div>;

}
