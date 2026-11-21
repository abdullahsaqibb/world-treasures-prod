"use client";
import {useActionState,useEffect} from "react";
import {useRouter} from "next/navigation";
import {createVariantState,updateVariantState,type VariantResult} from "../variant-actions";
import {PendingSubmit} from "../PendingSubmit";
type Variant={id:string;sku:string;label:string;priceCents:number;onHand:number;reserved:number;weightGrams:number|null};
const initial:VariantResult={ok:false,message:""};
function VariantForm({productId,variant}:{productId:string;variant?:Variant}){
 const router=useRouter();
 const [state,action]=useActionState(variant?updateVariantState:createVariantState,initial);
 useEffect(()=>{if(state.ok)router.refresh()},[state,router]);
 return <form action={action} className="wt-variant-form">
  <input type="hidden" name="productId" value={productId}/>
  {variant&&<input type="hidden" name="variantId" value={variant.id}/>}
  <div className="wt-formgrid">
   <label className="wt-field">Variant label<small>e.g. Single pack or Box of 12</small><input name="label" required maxLength={100} defaultValue={variant?.label??""} placeholder="Box of 12"/></label>
   <label className="wt-field">Unique SKU<input name="sku" required maxLength={100} defaultValue={variant?.sku??""} placeholder="WT-SNACK-BOX12"/></label>
   <label className="wt-field">Retail price (R)<input name="priceZar" required type="number" min="0" max="1000000" step=".01" defaultValue={variant?(variant.priceCents/100).toFixed(2):""} placeholder="0.00"/></label>
   <label className="wt-field">On hand<small>{variant?variant.reserved+" units reserved":"Stock quantity"}</small><input name="onHand" required type="number" min={variant?.reserved??0} max={1000000} step={1} defaultValue={variant?.onHand??0}/></label>
   <label className="wt-field">Weight (grams)<input name="weightGrams" type="number" min="0" step={1} defaultValue={variant?.weightGrams??""} placeholder="Optional"/></label>
  </div>
  {state.message&&<div role={state.ok?"status":"alert"} className={"wt-help "+(state.ok?"wt-form-success":"wt-form-error")}>{state.message}</div>}
  <div className="wt-actions"><PendingSubmit pendingText="Saving variant…">{variant?"Save variant":"Add variant →"}</PendingSubmit></div>
 </form>;
}
export default function VariantManager({productId,variants}:{productId:string;variants:Variant[]}){
 return <section className="wt-card wt-variant-manager"><div className="wt-cardhead"><div><span className="wt-eyebrow">MERCHANDISE / OPTIONS</span><h2>Sizes, packs & variants</h2></div><span className="wt-badge">{variants.length} variant{variants.length===1?"":"s"}</span></div>
 <p className="wt-lede">Each variant has its own SKU, price and inventory. All variants display on the verified product page once published.</p>
 <div className="wt-variant-list">{variants.map((variant,i)=><details key={variant.id} className="wt-variant-entry"><summary><strong>{variant.label}</strong><span>{variant.sku}</span><b>R {(variant.priceCents/100).toFixed(2)}</b><small>{variant.onHand-variant.reserved} available</small><span className="wt-variant-edit">Edit ↗</span></summary><VariantForm productId={productId} variant={variant}/></details>)}</div>
 <details className="wt-variant-entry wt-variant-new"><summary><strong>＋ Add another variant</strong><span>New size, package or bundle option</span></summary><VariantForm productId={productId}/></details>
 <p className="wt-help">Variant deletion is disabled to protect inventory and future order references. Existing variants can be edited. Online orders are not enabled yet.</p>
 </section>;
}
