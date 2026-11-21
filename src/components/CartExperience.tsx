"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import "./cart-experience.css";

export type StorefrontItem={id:string;slug:string;name:string;category:string;image:string;priceCents:number;stock:number};
type Product=StorefrontItem;
type DeliveryCity={id:string;name:string;province:string};
type Cart = Record<string,number>;
type Step="bag"|"delivery"|"payment";
const zar=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
function readCart(catalog:Map<string,Product>):Cart {
 try {
  const value=JSON.parse(localStorage.getItem("wt-cart-v1")||"{}") as unknown;
  if(!value||typeof value!=="object"||Array.isArray(value))return {};
  const entries=Object.entries(value).filter(([id,n])=>catalog.has(id)&&Number.isInteger(n)&&Number(n)>0).map(([id,n])=>[id,Math.min(99,catalog.get(id)!.stock,Number(n))]).filter(([,n])=>Number(n)>0);
  return Object.fromEntries(entries);
 }catch{return {};}
}
export function CartExperience({products,recoveredPreview=[]}:{products:Product[];recoveredPreview?:Product[]}){
 const catalog=useMemo(()=>new Map(products.map(p=>[p.id,p])),[products]);
 const [mounted,setMounted]=useState(false);
 const [cart,setCart]=useState<Cart>({});
 const [bagOpen,setBagOpen]=useState(false);
 const [checkoutOpen,setCheckoutOpen]=useState(false);
 const [step,setStep]=useState<Step>("bag");
 const [expanded,setExpanded]=useState(false);
 const [notice,setNotice]=useState("");
 const [filter,setFilter]=useState("All");
 const [guestEmail,setGuestEmail]=useState("");
 const [guestName,setGuestName]=useState("");
 const [guestPhone,setGuestPhone]=useState("");
 const [addressLine1,setAddressLine1]=useState("");
 const [addressLine2,setAddressLine2]=useState("");
 const [postalCode,setPostalCode]=useState("");
 const [cityId,setCityId]=useState("");
 const [cities,setCities]=useState<DeliveryCity[]>([]);
 const [shippingCents,setShippingCents]=useState<number|null>(null);
 const [deliveryError,setDeliveryError]=useState("");
 const [targets,setTargets]=useState<{grid:HTMLElement|null;contents:HTMLElement|null;checkout:HTMLElement|null;filters:HTMLElement|null;arrivals:HTMLElement|null}>({grid:null,contents:null,checkout:null,filters:null,arrivals:null});
 useEffect(()=>{
  setCart(readCart(catalog));
  setTargets({grid:document.getElementById("productGrid"),contents:document.getElementById("cartContents"),checkout:document.getElementById("checkoutContent"),filters:document.getElementById("filters"),arrivals:document.getElementById("newProducts")});
  setMounted(true);
 },[catalog]);
 useEffect(()=>{if(mounted)localStorage.setItem("wt-cart-v1",JSON.stringify(cart));},[cart,mounted]);
 const items=useMemo(()=>Object.entries(cart).map(([id,qty])=>({product:catalog.get(id)!,qty:Math.min(qty,catalog.get(id)?.stock??0)})).filter(x=>x.product&&x.qty>0),[cart,catalog]);
 const categories=useMemo(()=>["All",...new Set([...products,...recoveredPreview].map(p=>p.category))],[products,recoveredPreview]);
 const shown=filter==="All"?products:products.filter(p=>p.category===filter);
 const shownPreview=filter==="All"?recoveredPreview:recoveredPreview.filter(p=>p.category===filter);
 const count=items.reduce((sum,i)=>sum+i.qty,0);
 const total=items.reduce((sum,i)=>sum+i.qty*i.product.priceCents,0);
 useEffect(()=>{
  if(!mounted)return;
  const counter=document.getElementById("cartCount");
  if(counter)counter.textContent=String(count);
  const header=document.getElementById("openCart");
  header?.setAttribute("aria-label", "Open shopping bag, "+count+" items");
 },[count,mounted]);
 useEffect(()=>{
  if(!mounted)return;
  const original=document.getElementById("openCart");
  const handler=(e:Event)=>{e.preventDefault();e.stopImmediatePropagation();setExpanded(false);setBagOpen(true);};
  original?.addEventListener("click",handler,true);
  return()=>original?.removeEventListener("click",handler,true);
 },[mounted]);
 useEffect(()=>{
  const returnCleanup: Array<()=>void>=[];
  const dialogs=[{id:"cartDialog",open:bagOpen,close:()=>setBagOpen(false)},{id:"checkoutDialog",open:checkoutOpen,close:()=>setCheckoutOpen(false)}];
  for(const item of dialogs){const dialog=document.getElementById(item.id) as HTMLDialogElement|null;if(!dialog)continue;
   if(item.open&&!dialog.open)dialog.showModal();
   else if(!item.open&&dialog.open)dialog.close();
   const onClose=()=>item.close();
   dialog.addEventListener("close",onClose);
   const onBackdrop=(e:MouseEvent)=>{if(e.target===dialog)item.close();};
   dialog.addEventListener("click",onBackdrop);
   const closer=dialog.querySelector(".close");
   const onButton=(e:Event)=>{e.preventDefault();item.close();};
   closer?.addEventListener("click",onButton,true);
   returnCleanup.push(()=>{dialog.removeEventListener("close",onClose);dialog.removeEventListener("click",onBackdrop);closer?.removeEventListener("click",onButton,true);});
  }
  return()=>{returnCleanup.forEach(fn=>fn());};
 },[bagOpen,checkoutOpen,mounted]);
 function change(id:string,delta:number){
  const p=catalog.get(id);if(!p||p.stock<=0)return;
  setCart(prev=>{const next={...prev},qty=Math.max(0,Math.min(99,p.stock,(prev[id]||0)+delta));if(qty)next[id]=qty;else delete next[id];return next;});
 }
 function add(p:Product){change(p.id,1);setNotice(p.name+" added to bag");}
 function startCheckout(){setBagOpen(false);setStep("bag");setExpanded(false);setCheckoutOpen(true);}
 useEffect(()=>{
  if(!checkoutOpen)return;
  const controller=new AbortController();
  fetch("/api/shipping/cities",{signal:controller.signal,cache:"no-store"}).then(r=>r.ok?r.json():Promise.reject(new Error("Cities unavailable"))).then(data=>setCities(Array.isArray(data.cities)?data.cities:[])).catch(()=>{if(!controller.signal.aborted)setDeliveryError("Delivery destinations are not available yet.")});
  return()=>controller.abort();
 },[checkoutOpen]);
 useEffect(()=>{
  setShippingCents(null);setDeliveryError("");
  if(!checkoutOpen||!cityId)return;
  const controller=new AbortController();
  fetch("/api/shipping/quote?cityId="+encodeURIComponent(cityId),{signal:controller.signal,cache:"no-store"}).then(async response=>{const body=await response.json();if(!response.ok)throw Error(body.error||"Shipping rate unavailable");return body;}).then(data=>setShippingCents(Number(data.feeCents))).catch(e=>{if(!controller.signal.aborted)setDeliveryError(e instanceof Error?e.message:"Could not load delivery rate")});
  return()=>controller.abort();
 },[cityId,checkoutOpen]);
 const itemList=(editable:boolean)=><div className="wt-cart-list">{items.map(({product:p,qty})=><div className="wt-cart-line" key={p.id}>
  <img src={p.image} alt="" /><div className="wt-cart-desc"><strong>{p.name}</strong><span>{zar(p.priceCents)} each</span></div>
  {editable?<div className="wt-cart-qty"><button aria-label={"Remove one "+p.name} onClick={()=>change(p.id,-1)}>−</button><b>{qty}</b><button aria-label={"Add one "+p.name} onClick={()=>change(p.id,1)}>+</button></div>:<b>× {qty}</b>}
  <b className="wt-line-price">{zar(p.priceCents*qty)}</b></div>)}</div>;
 const basket=<div className="wt-basket-visual" aria-hidden="true"><div className="wt-basket-packets">{items.slice(0,5).map(({product:p},idx)=><img key={p.id} src={p.image} alt="" style={{transform:`translateX(-50%) rotate(${(idx-(Math.min(items.length,5)-1)/2)*18}deg)`,left:`${50+(idx-(Math.min(items.length,5)-1)/2)*13}%`,animationDelay:`${idx*95}ms`}}/>)}</div><div className="wt-basket-box"><span>WORLD TREASURES</span><small>{count} {count===1?"ITEM":"ITEMS"} COLLECTED</small></div></div>;
 const filters=<div className="wt-cart-filter-set" role="group" aria-label="Filter published products">{categories.map(category=><button key={category} type="button" className={category===filter?"is-active":""} aria-pressed={category===filter} onClick={()=>setFilter(category)}>{category}</button>)}</div>;
 const productCard=(p:Product,featured=false)=><article className="product wt-prototype-product" key={p.id}>
  <div className="product-art" style={{"--tile":p.category==="Drinks"?"#dce7e8":p.category==="Chocolate"?"#e8d6ca":p.category==="Chips"?"#e7e4d2":"#efdfd8"} as React.CSSProperties}>
   {featured&&<span className="badge hot">NEW ARRIVAL</span>}
   <Link href={"/catalog/"+encodeURIComponent(p.slug)} aria-label={"View "+p.name} className="wt-prototype-image-link">
    {p.image?<img src={p.image} alt={p.name} loading="lazy" draggable={false}/>:<span>Photo coming soon</span>}
   </Link>
   <Link href={"/catalog/"+encodeURIComponent(p.slug)} className="quick">Discover this product ↗</Link>
  </div>
  <div className="product-info">
   <p className="origin">{p.category.toUpperCase()} · WORLD TREASURES</p>
   <h3><Link href={"/catalog/"+encodeURIComponent(p.slug)}>{p.name}</Link></h3>
   <div className="product-bottom"><span>{zar(p.priceCents)}</span><button type="button" className="add" disabled={p.stock===0} onClick={()=>add(p)} title={p.stock>0?"Add "+p.name+" to preview bag":"Currently unavailable"} aria-label={p.stock>0?"Add "+p.name+" to preview bag":"Currently unavailable"}>{p.stock>0?"+":"×"}</button></div>
  </div>
 </article>;
 const verifiedGrid=shown.length?<>{shown.map(p=>productCard(p))}</>:null;
 const previewGrid=shownPreview.length?<section className="wt-recovered-showcase" style={{gridColumn:"1/-1"}} aria-label="Original World Treasures product showcase">
 <div className="wt-recovered-heading"><h3>Discover our original range</h3><p>These products are undergoing verification. Prices and availability are not confirmed and online purchasing is disabled.</p></div>
 <div className="grid">{shownPreview.map(p=><article className="product" key={p.id}><div className="product-art">{p.image?<img src={p.image} alt={p.name} loading="lazy" className="wt-recovery-image"/>:"Photo coming soon"}</div><div className="product-info"><p className="origin">{p.category}</p><h3>{p.name}</h3><div className="product-bottom"><span>Price to be confirmed</span></div></div></article>)}</div>
 </section>:null;
 const productsGrid=<>{verifiedGrid}{previewGrid}{!verifiedGrid&&!previewGrid&&<div className="wt-cart-empty-catalog"><h3>Our verified collection is being prepared.</h3><p>Products will appear after their information, pricing and photos are approved.</p><Link href="/catalog">View verified collection →</Link></div>}</>;
 const newestProducts=products.slice(0,8);
 const arrivalsCards=<>{newestProducts.map(p=>productCard(p,true))}</>;
 const basketDetails=<div className="wt-cart-popup-shade" onClick={()=>setExpanded(false)} role="presentation"><section className="wt-cart-popup" role="dialog" aria-modal="true" aria-label="Products inside your basket" onClick={e=>e.stopPropagation()}><div className="wt-cart-popup-head"><div><strong>Inside your basket</strong><span>{count} {count===1?"item":"items"} selected</span></div><button type="button" aria-label="Close basket details" onClick={()=>setExpanded(false)}>×</button></div>{itemList(false)}<div className="wt-cart-total"><span>Products subtotal</span><strong>{zar(total)}</strong></div><button className="wt-cart-primary" onClick={()=>setExpanded(false)}>Back to your bag</button></section></div>;
 const bagContents=<div className="wt-cart-panel wt-cart-page">
 {items.length? <><div className="cart-page-layout">
  <section className="wt-bag-items" aria-label="Products in your bag">
   <p className="cart-caption">{count} {count===1?"item":"items"} in your bag</p>
   {itemList(true)}
   <button className="wt-bag-back-shopping" type="button" onClick={()=>{setBagOpen(false);document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})}}>← Continue shopping</button>
  </section>
  <aside className="order-summary wt-bag-order-summary" aria-label="Order summary">
   <h3>ORDER SUMMARY</h3>
   <div className="wt-bag-summary-row"><span>Subtotal</span><strong>{zar(total)}</strong></div>
   <p>Delivery calculated at checkout.<br/>Store collection is free.</p>
   <p className="wt-bag-delivery-note">Delivery rates are confirmed during checkout.</p>
   <button className="wt-cart-primary" type="button" onClick={startCheckout}>Checkout →</button>
   <div className="wt-bag-payfast"><strong>Payment placeholder</strong><small>Payments are not enabled</small></div>
   <p className="wt-cart-disclaimer">Prototype checkout. No payment or order is sent.</p>
   <div className="wt-cart-bag-bottom">
    <p className="wt-cart-bag-label">YOUR ORDER, PACKED TOGETHER</p>
    <button type="button" className="wt-cart-basket-toggle wt-cart-bag-basket" aria-label="Open the products inside your basket" aria-expanded={expanded} onClick={()=>setExpanded(true)}>
     <span className={bagOpen?"wt-cart-basket-animate":""}>{basket}</span>
     <strong>What's in your bag?</strong>
     <span>Click to see all {count} {count===1?"item":"items"} inside ↗</span>
    </button>
   </div>
  </aside>
 </div>{expanded&&basketDetails}</>:<div className="wt-cart-blank"><div className="wt-cart-empty-icon">🛍️</div><h3>Your bag is empty</h3><p>Find something delicious and add it to your basket.</p><button onClick={()=>{setBagOpen(false);document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})}}>Explore snacks →</button></div>}
 </div>;
 const checkoutContents=<div className="wt-cart-checkout">
 <div className="wt-cart-progress"><span className={step==="bag"?"current":""}>01 · Bag</span><span className={step==="delivery"?"current":""}>02 · Delivery</span><span className={step==="payment"?"current":""}>03 · Payment</span></div>
 <h2>Review your order</h2>
 <p className="wt-cart-help">Everything you've selected, packed together. Click the basket to expand your item list.</p>
 <button className="wt-cart-basket-toggle" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{basket}<strong>{count} items in your World Treasures basket</strong><span>{expanded?"Hide items −":"View everything inside +"}</span></button>
 {expanded&&basketDetails}
 <div className="wt-cart-total"><span>Products subtotal</span><strong>{zar(total)}</strong></div>
 {step==="bag"&&<><button className="wt-cart-primary" onClick={()=>setStep("delivery")} disabled={!count}>Continue to delivery →</button><button className="wt-cart-secondary" onClick={()=>{setCheckoutOpen(false);setBagOpen(true)}}>← Edit your bag</button></>}
 {step==="delivery"&&<form className="wt-cart-step wt-checkout-guest" onSubmit={e=>{e.preventDefault();if(!e.currentTarget.reportValidity())return;if(shippingCents===null){setDeliveryError("Select a city with an available delivery rate.");return;}setStep("payment");}}>
  <h3>Guest checkout preview</h3><p>You can review delivery without creating an account. No details are sent to the server or saved as an order.</p>
  <label>Your name<input type="text" autoComplete="name" required maxLength={120} value={guestName} onChange={e=>setGuestName(e.target.value)} placeholder="Full name"/></label>
  <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={guestEmail} onChange={e=>setGuestEmail(e.target.value)} placeholder="name@example.com"/></label>
  <label>Phone number<input type="tel" autoComplete="tel" required maxLength={30} value={guestPhone} onChange={e=>setGuestPhone(e.target.value)} placeholder="South African contact number"/></label>
  <label>Street address<input type="text" autoComplete="address-line1" required maxLength={200} value={addressLine1} onChange={e=>setAddressLine1(e.target.value)} placeholder="Street address"/></label>
  <label>Apartment or unit (optional)<input type="text" autoComplete="address-line2" maxLength={200} value={addressLine2} onChange={e=>setAddressLine2(e.target.value)} placeholder="Unit, floor or building"/></label>
  <label>Postal code<input type="text" autoComplete="postal-code" required maxLength={12} value={postalCode} onChange={e=>setPostalCode(e.target.value)} placeholder="Postal code"/></label>
  <label>Delivery city<select value={cityId} required onChange={e=>setCityId(e.target.value)}><option value="">Choose city</option>{cities.map(city=><option key={city.id} value={city.id}>{city.name}, {city.province}</option>)}</select></label>
  {shippingCents!==null&&<p role="status">Standard delivery preview: <strong>{zar(shippingCents)}</strong></p>}
  {deliveryError&&<p role="alert">{deliveryError}</p>}
  <button className="wt-cart-primary" type="submit">Review payment placeholder →</button>
  <button className="wt-cart-secondary" type="button" onClick={()=>setStep("bag")}>← Back to bag</button>
 </form>}
 {step==="payment"&&<div className="wt-cart-step"><h3>Payment is not enabled</h3><p>Your guest details remain only in this browser session. No order has been placed, no email has been sent, and no payment has been collected.</p><div className="wt-cart-total"><span>Items</span><strong>{zar(total)}</strong></div>{shippingCents!==null&&<div className="wt-cart-total"><span>Delivery estimate</span><strong>{zar(shippingCents)}</strong></div>}<div className="wt-cart-total"><span>Estimated total</span><strong>{zar(total+(shippingCents??0))}</strong></div><button type="button" className="wt-cart-primary" disabled>Payments coming soon — unavailable</button><button className="wt-cart-secondary" onClick={()=>setStep("delivery")}>← Back to delivery</button></div>}
 </div>;
 if(!mounted)return null;
 return <>{targets.grid&&createPortal(productsGrid,targets.grid)}{targets.filters&&createPortal(filters,targets.filters)}{targets.contents&&createPortal(bagContents,targets.contents)}{targets.checkout&&createPortal(checkoutContents,targets.checkout)}
 <div className="wt-cart-live" role="status" aria-live="polite">{notice}</div></>;
}
