"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import products from "@/data/products.json";
import "./cart-experience.css";

type Product = (typeof products)[number];
type Cart = Record<string,number>;
type Step="bag"|"delivery"|"payment";
const catalog=new Map(products.map(p=>[p.id,p]));
const zar=(cents:number)=>new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(cents/100);
function readCart():Cart {
 try {
  const value=JSON.parse(localStorage.getItem("wt-cart-v1")||"{}") as unknown;
  if(!value||typeof value!=="object"||Array.isArray(value))return {};
  const entries=Object.entries(value).filter(([id,n])=>catalog.has(id)&&Number.isInteger(n)&&Number(n)>0).map(([id,n])=>[id,Math.min(99,Number(n))]);
  return Object.fromEntries(entries);
 }catch{return {};}
}
export function CartExperience(){
 const [mounted,setMounted]=useState(false);
 const [cart,setCart]=useState<Cart>({});
 const [bagOpen,setBagOpen]=useState(false);
 const [checkoutOpen,setCheckoutOpen]=useState(false);
 const [step,setStep]=useState<Step>("bag");
 const [expanded,setExpanded]=useState(false);
 const [notice,setNotice]=useState("");
 const [targets,setTargets]=useState<{grid:HTMLElement|null;contents:HTMLElement|null;checkout:HTMLElement|null}>({grid:null,contents:null,checkout:null});
 useEffect(()=>{
  setCart(readCart());
  setTargets({grid:document.getElementById("productGrid"),contents:document.getElementById("cartContents"),checkout:document.getElementById("checkoutContent")});
  setMounted(true);
 },[]);
 useEffect(()=>{if(mounted)localStorage.setItem("wt-cart-v1",JSON.stringify(cart));},[cart,mounted]);
 const items=useMemo(()=>Object.entries(cart).map(([id,qty])=>({product:catalog.get(id)!,qty})).filter(x=>x.product&&x.qty>0),[cart]);
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
  setCart(prev=>{const next={...prev},qty=Math.max(0,Math.min(99,(prev[id]||0)+delta));if(qty)next[id]=qty;else delete next[id];return next;});
 }
 function add(p:Product){change(p.id,1);setNotice(p.name+" added to bag");}
 function startCheckout(){setBagOpen(false);setStep("bag");setExpanded(false);setCheckoutOpen(true);}
 const itemList=(editable:boolean)=><div className="wt-cart-list">{items.map(({product:p,qty})=><div className="wt-cart-line" key={p.id}>
  <img src={p.image} alt="" /><div className="wt-cart-desc"><strong>{p.name}</strong><span>{zar(p.priceCents)} each</span></div>
  {editable?<div className="wt-cart-qty"><button aria-label={"Remove one "+p.name} onClick={()=>change(p.id,-1)}>−</button><b>{qty}</b><button aria-label={"Add one "+p.name} onClick={()=>change(p.id,1)}>+</button></div>:<b>× {qty}</b>}
  <b className="wt-line-price">{zar(p.priceCents*qty)}</b></div>)}</div>;
 const basket=<div className="wt-basket-visual" aria-hidden="true"><div className="wt-basket-packets">{items.slice(0,5).map(({product:p},idx)=><img key={p.id} src={p.image} alt="" style={{transform:`translateX(-50%) rotate(${(idx-(Math.min(items.length,5)-1)/2)*18}deg)`,left:`${50+(idx-(Math.min(items.length,5)-1)/2)*13}%`,animationDelay:`${idx*95}ms`}}/>)}</div><div className="wt-basket-box"><span>WORLD TREASURES</span><small>{count} {count===1?"ITEM":"ITEMS"} COLLECTED</small></div></div>;
 const productsGrid=<div className="wt-cart-shop-grid">{products.map(p=><article className="wt-cart-product" key={p.id}>
 <div className="wt-cart-product-image"><img src={p.image} alt={p.name}/></div><div className="wt-cart-product-info"><span>{p.category}</span><h3>{p.name}</h3><p>{zar(p.priceCents)}</p><button type="button" onClick={()=>add(p)}>＋ Add to bag</button></div></article>)}</div>;
 const basketDetails=<div className="wt-cart-popup-shade" onClick={()=>setExpanded(false)} role="presentation"><section className="wt-cart-popup" role="dialog" aria-modal="true" aria-label="Products inside your basket" onClick={e=>e.stopPropagation()}><div className="wt-cart-popup-head"><div><strong>Inside your basket</strong><span>{count} {count===1?"item":"items"} selected</span></div><button type="button" aria-label="Close basket details" onClick={()=>setExpanded(false)}>×</button></div>{itemList(false)}<div className="wt-cart-total"><span>Products subtotal</span><strong>{zar(total)}</strong></div><button className="wt-cart-primary" onClick={()=>setExpanded(false)}>Back to your bag</button></section></div>;
 const bagContents=<div className="wt-cart-panel">
 {items.length? <><p className="wt-cart-help">Review the products in your bag and adjust quantities before checkout.</p>{itemList(true)}<div className="wt-cart-total"><span>Subtotal</span><strong>{zar(total)}</strong></div><div className="wt-cart-bag-bottom"><p className="wt-cart-bag-label">YOUR ORDER, PACKED TOGETHER</p><button type="button" className="wt-cart-basket-toggle wt-cart-bag-basket" aria-label="Open the products inside your basket" aria-expanded={expanded} onClick={()=>setExpanded(true)}><span className={bagOpen?"wt-cart-basket-animate":""}>{basket}</span><strong>Tap to open your basket</strong><span>See all {count} {count===1?"item":"items"} inside ↗</span></button></div><p className="wt-cart-disclaimer">Prototype prices only. Delivery calculated separately. No real order is placed.</p><button className="wt-cart-primary" onClick={startCheckout}>Review your order →</button>{expanded&&basketDetails}</>:<div className="wt-cart-blank"><div className="wt-cart-empty-icon">🛍️</div><h3>Your bag is empty</h3><p>Find something delicious and add it to your basket.</p><button onClick={()=>{setBagOpen(false);document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})}}>Explore snacks →</button></div>}
 </div>;
 const checkoutContents=<div className="wt-cart-checkout">
 <div className="wt-cart-progress"><span className={step==="bag"?"current":""}>01 · Bag</span><span className={step==="delivery"?"current":""}>02 · Delivery</span><span className={step==="payment"?"current":""}>03 · Payment</span></div>
 <h2>Review your order</h2>
 <p className="wt-cart-help">Everything you've selected, packed together. Click the basket to expand your item list.</p>
 <button className="wt-cart-basket-toggle" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>{basket}<strong>{count} items in your World Treasures basket</strong><span>{expanded?"Hide items −":"View everything inside +"}</span></button>
 {expanded&&basketDetails}
 <div className="wt-cart-total"><span>Products subtotal</span><strong>{zar(total)}</strong></div>
 {step==="bag"&&<><button className="wt-cart-primary" onClick={()=>setStep("delivery")} disabled={!count}>Continue to delivery →</button><button className="wt-cart-secondary" onClick={()=>{setCheckoutOpen(false);setBagOpen(true)}}>← Edit your bag</button></>}
 {step==="delivery"&&<div className="wt-cart-step"><h3>Delivery details</h3><p>The delivery address and shipping-quote integration are not connected to payment yet. You can still review your selections here.</p><label>Delivery city <input placeholder="Your city in South Africa" disabled/></label><button className="wt-cart-primary" onClick={()=>setStep("payment")}>Continue to payment preview →</button><button className="wt-cart-secondary" onClick={()=>setStep("bag")}>← Back to bag</button></div>}
 {step==="payment"&&<div className="wt-cart-step"><h3>Payment will be available soon</h3><p>This is an interactive checkout preview, not a working payment flow. No order or charge has been created. Prices and stock are provisional and need verification.</p><button className="wt-cart-secondary" onClick={()=>setStep("delivery")}>← Back to delivery</button></div>}
 </div>;
 if(!mounted)return null;
 return <>{targets.grid&&createPortal(productsGrid,targets.grid)}{targets.contents&&createPortal(bagContents,targets.contents)}{targets.checkout&&createPortal(checkoutContents,targets.checkout)}
 <div className="wt-cart-live" role="status" aria-live="polite">{notice}</div></>;
}
