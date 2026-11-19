import { ensureAdminPage } from "@/lib/admin-access";
import { db } from "@/lib/db";
import { saveDeliveryCity,updateDeliveryRate } from "../actions";
export const dynamic="force-dynamic";
const input={padding:"9px 11px",border:"1px solid #cbd0d3",borderRadius:6,maxWidth:"100%"};
export default async function DeliveryPage(){
 await ensureAdminPage();
 const cities=await db.city.findMany({include:{rates:{where:{service:"STANDARD"},orderBy:{createdAt:"desc"},take:1}},orderBy:[{province:"asc"},{name:"asc"}]});
 return <section><h1>Delivery fees by city</h1><p>Enter courier-provided rates in ZAR. No city is available for customer checkout until it has an active rate.</p>
 <form action={saveDeliveryCity} style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"end",padding:18,background:"white",borderRadius:10}}>
 <label>City<input style={input} name="city" placeholder="e.g. Durban" required maxLength={100}/></label>
 <label>Province<input style={input} name="province" placeholder="e.g. KwaZulu-Natal" required maxLength={100}/></label>
 <label>Fee (ZAR)<input style={input} type="number" name="feeZar" step="0.01" min="0" required/></label>
 <label><input name="active" type="checkbox"/> Enable shipping</label>
 <button style={{background:"#101F38",color:"white",padding:12,borderRadius:6}}>Save city</button>
 </form>
 <div style={{display:"grid",gap:12,marginTop:24}}>
 {cities.map(city=>{const rate=city.rates[0];return <form key={city.id} action={rate?updateDeliveryRate:saveDeliveryCity} style={{padding:16,borderRadius:8,background:"white",display:"flex",flexWrap:"wrap",alignItems:"center",gap:18}}>
 <strong>{city.name}, {city.province}</strong>
 {rate?<><input type="hidden" name="rateId" value={rate.id}/><label>Fee (ZAR) <input style={input} type="number" name="feeZar" step="0.01" min="0" defaultValue={(rate.feeCents/100).toFixed(2)} required/></label><label><input name="active" type="checkbox" defaultChecked={rate.active}/> Enabled</label></>:
 <><input type="hidden" name="city" value={city.name}/><input type="hidden" name="province" value={city.province}/><label>Fee (ZAR) <input style={input} type="number" name="feeZar" step="0.01" min="0" required/></label><label><input name="active" type="checkbox"/> Enabled</label></>}
 <button style={{background:"#101F38",color:"white",padding:12,borderRadius:6}}>Update</button></form>})}
 </div>
 {cities.length===0&&<p>No cities configured yet. Add the first city above.</p>}
 </section>;
}
