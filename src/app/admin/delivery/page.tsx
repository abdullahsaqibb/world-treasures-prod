import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { saveDeliveryCity,updateDeliveryRate } from "../actions";
export const dynamic="force-dynamic";
export default async function DeliveryPage(){
 await ensureAdminPage();
 const cities=await db.city.findMany({include:{rates:{where:{service:"STANDARD"},orderBy:{createdAt:"desc"},take:1}},orderBy:[{province:"asc"},{name:"asc"}]});
 const available=cities.filter(c=>c.active&&c.rates[0]?.active).length;
 return <div><span className="wt-eyebrow">Fulfillment & delivery</span><div className="wt-head"><div><h1>Delivery & shipping</h1><p className="wt-lede">Manage city-based delivery prices in South African Rand. Use the figures provided by your courier or delivery partner.</p></div><span className="wt-badge green">{available} enabled cities</span></div>
 <div className="wt-help"><strong>Important:</strong> A delivery city must have an enabled rate before the shipping quote API will return it. Final checkout is still in development.</div>
 <div className="wt-2col"><section className="wt-card"><div className="wt-cardhead"><h2>Current delivery zones</h2><span className="wt-badge">{cities.length} cities</span></div>
 {cities.length? <div className="wt-stack">{cities.map(city=>{const rate=city.rates[0];return <form className="wt-card" style={{padding:16,marginBottom:0}} key={city.id} action={rate?updateDeliveryRate:saveDeliveryCity}>
 <div className="wt-cardhead"><div><h3>{city.name}</h3><span className="wt-muted">{city.province}</span></div><span className={"wt-badge "+(rate?.active?"green":"amber")}>{rate?.active?"Enabled":"Not enabled"}</span></div>
 {rate?<input type="hidden" name="rateId" value={rate.id}/>:<><input type="hidden" name="city" value={city.name}/><input type="hidden" name="province" value={city.province}/></>}
 <div className="wt-formgrid"><label className="wt-field">Delivery fee (ZAR)<input type="number" name="feeZar" required min="0" step=".01" defaultValue={rate?(rate.feeCents/100).toFixed(2):""}/></label><div className="wt-field"><span>Availability</span><label className="wt-check"><input type="checkbox" name="active" defaultChecked={rate?.active??false}/> Enable rate</label></div></div>
 <div className="wt-actions" style={{marginTop:14}}><button type="submit" className="wt-btn light">Save changes</button></div></form>})}</div>:<div className="wt-empty"><h3>No cities configured</h3><p>Add your first delivery zone using the form.</p></div>}</section>
 <section className="wt-card"><h2>Add a delivery city</h2><p className="wt-lede">Set up a new city and its standard delivery rate.</p>
 <form action={saveDeliveryCity} className="wt-stack"><label className="wt-field">City<input name="city" required maxLength={100} placeholder="e.g. Johannesburg"/></label><label className="wt-field">Province<input name="province" required maxLength={100} placeholder="e.g. Gauteng"/></label><label className="wt-field">Standard delivery fee (ZAR)<input name="feeZar" type="number" step=".01" min="0" required placeholder="e.g. 75.00"/></label><label className="wt-check"><input name="active" type="checkbox"/> Enable delivery immediately</label><button type="submit" className="wt-btn orange">Save delivery city</button></form>
 <div className="wt-help">Rates are managed separately from item prices. Enter a fee only after confirming it with your courier.</div>
 </section></div></div>;

}
