"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {createPortal} from "react-dom";
import type {StorefrontItem} from "@/lib/storefront-products";

const previewShowcase:StorefrontItem[]=[
 {id:"preview-takis",slug:"preview-takis",name:"GLOBAL SNACKS",category:"SNACKS",image:"/products/takis.webp",priceCents:0,stock:0},
 {id:"preview-berry",slug:"preview-berry",name:"SWEET DISCOVERIES",category:"SWEETS",image:"/products/berry.webp",priceCents:0,stock:0},
 {id:"preview-pop",slug:"preview-pop",name:"WORLDWIDE TREATS",category:"DISCOVER",image:"/products/pop.webp",priceCents:0,stock:0},
 {id:"preview-cocoa",slug:"preview-cocoa",name:"CHOCOLATE FINDS",category:"CHOCOLATE",image:"/products/cocoa.webp",priceCents:0,stock:0},
 {id:"preview-guava",slug:"preview-guava",name:"BOLD FLAVOURS",category:"DRINKS",image:"/products/guava.webp",priceCents:0,stock:0}
];

/** Enhance the approved hero DOM instead of replacing its original layout. */
export function StorefrontHero({products}:{products:StorefrontItem[]}){
 const isPreviewShowcase=products.length===0;
 const featured=useMemo(()=>{
  const seen=new Set<string>();
  const verified=products.filter(product=>{if(!product.image||seen.has(product.slug))return false;seen.add(product.slug);return true}).slice(0,5);
  return verified.length?verified:previewShowcase;
 },[products]);
 const [mounted,setMounted]=useState(false);
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false);
 const start=useRef<{x:number;y:number}|null>(null);
 const [targets,setTargets]=useState<{deck:HTMLElement|null;dots:HTMLElement|null}>({deck:null,dots:null});
 useEffect(()=>{setMounted(true);setTargets({deck:document.getElementById("stageDeck"),dots:document.getElementById("stageDots")})},[]);
 useEffect(()=>{
  if(!mounted||featured.length<2||paused)return;
  const timer=window.setInterval(()=>setActive(i=>(i+1)%featured.length),5500);
  return()=>window.clearInterval(timer);
 },[mounted,featured.length,paused]);
 useEffect(()=>{
  if(!mounted||!featured.length)return;
  const item=featured[active%featured.length];
  const update=(id:string,value:string)=>{const n=document.getElementById(id);if(n)n.textContent=value};
  update("stageWord",item.category.toUpperCase());
  update("stageName",item.name);
  update("stageOrigin",isPreviewShowcase?"WORLD TREASURES / ILLUSTRATIVE PREVIEW":"WORLD TREASURES / VERIFIED RANGE");
  update("stagePrice",isPreviewShowcase?"CATALOGUE COMING SOON":new Intl.NumberFormat("en-ZA",{style:"currency",currency:"ZAR"}).format(item.priceCents/100));
  update("stageCounter",String(active+1).padStart(2,"0")+" / "+String(featured.length).padStart(2,"0"));
  const change=(delta:number)=>setActive(i=>(i+delta+featured.length)%featured.length);
  const prev=document.getElementById("heroPrev"),next=document.getElementById("heroNext"),pause=document.getElementById("heroPause"),shop=document.getElementById("stageShop");
  const onPrev=(e:Event)=>{e.stopImmediatePropagation();change(-1)};
  const onNext=(e:Event)=>{e.stopImmediatePropagation();change(1)};
  const onPause=(e:Event)=>{e.stopImmediatePropagation();setPaused(p=>!p)};
  const onShop=(e:Event)=>{e.stopImmediatePropagation();document.getElementById("shop")?.scrollIntoView({behavior:"smooth"})};
  prev?.addEventListener("click",onPrev,true);next?.addEventListener("click",onNext,true);pause?.addEventListener("click",onPause,true);shop?.addEventListener("click",onShop,true);
  if(pause)pause.textContent=paused?"Play":"Pause";
  return()=>{prev?.removeEventListener("click",onPrev,true);next?.removeEventListener("click",onNext,true);pause?.removeEventListener("click",onPause,true);shop?.removeEventListener("click",onShop,true)};
 },[mounted,featured,active,paused,isPreviewShowcase]);
 if(!mounted)return null;
 return <>
 {targets.deck&&createPortal(<div className="wt-live-hero-touch"
   onTouchStart={event=>{if(event.touches.length===1)start.current={x:event.touches[0].clientX,y:event.touches[0].clientY}}}
   onTouchEnd={event=>{const from=start.current;start.current=null;if(!from||!event.changedTouches.length)return;const dx=event.changedTouches[0].clientX-from.x,dy=event.changedTouches[0].clientY-from.y;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.25)setActive(i=>(i+(dx<0?1:-1)+featured.length)%featured.length)}}
   aria-label="Featured products">
   {featured.map((item,index)=>{
    const relative=(index-active+featured.length)%featured.length;
    const previous=relative===featured.length-1,next=relative===1;
    const cls=index===active?"is-active":previous?"is-prev":next?"is-next":"";
    return <div className={"stage-slot "+cls} key={item.slug} aria-hidden={index!==active}><div className="stage-float"><div className="stage-pack wt-live-stage-pack"><div className="hero-front"><img src={item.image} alt={item.name} draggable={false}/></div></div></div></div>;
   })}
  </div>,targets.deck)}
 {targets.dots&&createPortal(featured.map((item,index)=><button key={item.slug} type="button" aria-label={"Show "+item.name} aria-pressed={index===active} onClick={()=>setActive(index)}/>),targets.dots)}
 </>;
}
