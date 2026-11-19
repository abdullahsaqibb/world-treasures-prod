"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag, Search, Menu, X, Plus, Minus, RotateCcw, ChevronDown, Check, Truck, Sparkles } from "lucide-react";
import { products, formatZAR, type Product } from "@/lib/catalog";

type Theme = "gold"|"coral"|"teal"|"lime"|"violet"|"rose";
const themes: {id:Theme; label:string; swatches:string[]}[] = [
 {id:"gold",label:"Treasure Gold",swatches:["#101F38","#E7B956","#177D69","#F6F3EB"]},
 {id:"coral",label:"Sunset Coral",swatches:["#12233D","#FF795B","#F4B9A9","#FFF5EB"]},
 {id:"teal",label:"Coastal Teal",swatches:["#0B2135","#42CCB4","#91C9E7","#EFF7F8"]},
 {id:"lime",label:"Electric Lime",swatches:["#10293C","#C6EA58","#409A75","#F7FAED"]},
 {id:"violet",label:"Royal Violet",swatches:["#1B1C40","#B7A2F2","#8D65BB","#F7F3FF"]},
 {id:"rose",label:"Berry Rose",swatches:["#16253D","#EF8CAA","#B65180","#FFF4F6"]}
];
const clamp = (n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));

function useTheme(){ const [theme,setTheme]=useState<Theme>("gold"); useEffect(()=>{const stored=localStorage.getItem("wt-theme");if(themes.some(t=>t.id===stored))setTheme(stored as Theme);},[]);useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("wt-theme",theme);},[theme]);return [theme,setTheme] as const; }

export default function Storefront(){
 const [theme,setTheme]=useTheme();
 const [slide,setSlide]=useState(0);
 const [bag,setBag]=useState<Record<string,number>>({});
 const [bagOpen,setBagOpen]=useState(false);
 const [menuOpen,setMenuOpen]=useState(false);
 const [toast,setToast]=useState("");
 const [category,setCategory]=useState("All");
 const [search,setSearch]=useState("");
 const [zoom,setZoom]=useState(1);
 const [tilt,setTilt]=useState({x:0,y:0});
 const [handoff,setHandoff]=useState(false);
 const heroRef=useRef<HTMLElement>(null);const inspectionRef=useRef<HTMLElement>(null);const heroImageRef=useRef<HTMLImageElement>(null);const inspectionImageRef=useRef<HTMLImageElement>(null);const cartRef=useRef<HTMLButtonElement>(null);
 const pointer=useRef<{x:number;y:number;id:number}|null>(null);
 const wheel=useRef({last:0,accum:0,sign:0});
 const inspectPointers=useRef(new Map<number,{x:number;y:number}>());const pinchRef=useRef<{distance:number;zoom:number}|null>(null);
 const tiltRef=useRef<{x:number;y:number}>({x:0,y:0});const zoomRef=useRef(1);
 const prevScroll=useRef(0);const handoffLock=useRef(false);const allowHandoff=useRef(true);
 const selected=products[slide];
 const count=Object.values(bag).reduce((a,b)=>a+b,0);
 const total=products.reduce((sum,p)=>sum+(bag[p.id]||0)*p.priceCents,0);
 const categories=["All",...Array.from(new Set(products.map(p=>p.category)))];
 const filtered=products.filter(p=>(category==="All"||p.category===category)&&p.name.toLowerCase().includes(search.toLowerCase()));
 const switchSlide=useCallback((delta:number)=>setSlide(v=>(v+delta+products.length)%products.length),[]);
 const goSlide=(idx:number)=>setSlide((idx+products.length)%products.length);
 const showToast=(txt:string)=>{setToast(txt);window.setTimeout(()=>setToast(""),2700);};
 const animateToCart=(img:HTMLImageElement|null)=>{
   if(!img||!cartRef.current||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const from=img.getBoundingClientRect(),to=cartRef.current.getBoundingClientRect();if(from.width<4)return;
   const clone=img.cloneNode() as HTMLImageElement;
   clone.className="flying-product";
   Object.assign(clone.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`});document.body.append(clone);
   const dx=to.left+to.width/2-from.left-from.width/2,dy=to.top+to.height/2-from.top-from.height/2;
   const endW=Math.min(26,from.width*.16),endH=Math.min(26,from.height*.16);
   const sx=endW/from.width,sy=endH/from.height;
   const anim=clone.animate([{transform:'translate(0,0) scale(1)',opacity:1,offset:0},{transform:`translate(${dx*.48}px,${dy*.24-55}px) scale(.72) rotate(-12deg)`,opacity:1,offset:.48},{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy}) rotate(18deg)`,opacity:.1,offset:1}],{duration:780,easing:'cubic-bezier(.24,.7,.2,1)'});
   anim.onfinish=()=>{clone.remove();cartRef.current?.animate([{transform:'scale(1)'},{transform:'scale(1.22)'},{transform:'scale(1)'}],{duration:320})};
 };
 const add=(p:Product,img?:HTMLImageElement|null)=>{setBag(v=>({...v,[p.id]:(v[p.id]||0)+1}));animateToCart(img||null);showToast(`${p.name} added to bag`);};
 const setQty=(id:string,n:number)=>setBag(v=>{const copy={...v};if(n<=0)delete copy[id];else copy[id]=n;return copy;});
 const scrollTo=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth'});setMenuOpen(false)};
 const cardImages=useRef<Record<string,HTMLImageElement|null>>({});
 // Drag gesture: one gesture = one product. No slide movement during dragging; repeat from same location.
 const heroDown=(e:React.PointerEvent)=>{if(e.pointerType==='mouse'&&e.button!==0)return;pointer.current={x:e.clientX,y:e.clientY,id:e.pointerId};};
 const heroUp=(e:React.PointerEvent)=>{const p=pointer.current;if(!p||p.id!==e.pointerId)return;pointer.current=null;const dx=e.clientX-p.x,dy=e.clientY-p.y;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.2)switchSlide(dx<0?1:-1);};
 const onHeroWheel=(e:React.WheelEvent)=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)*1.35)return;const now=performance.now(),dir=Math.sign(e.deltaX);if(!dir)return;if(now-wheel.current.last>240||wheel.current.sign!==dir)wheel.current.accum=0;wheel.current.last=now;wheel.current.sign=dir;wheel.current.accum+=Math.abs(e.deltaX);if(wheel.current.accum>=65){wheel.current.accum=0;switchSlide(dir);}};
 useEffect(()=>{setTilt({x:0,y:0});tiltRef.current={x:0,y:0};setZoom(1);zoomRef.current=1;},[slide]);
 const animateHandoff=useCallback(()=>{
   if(handoffLock.current||!allowHandoff.current)return;
   const source=heroImageRef.current,target=inspectionImageRef.current;
   if(!source||!target)return;
   const b=source.getBoundingClientRect(),e=target.getBoundingClientRect();if(!e.width||!e.height)return;
   allowHandoff.current=false;handoffLock.current=true;setHandoff(true);
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){handoffLock.current=false;setHandoff(false);return;}
   const ghost=source.cloneNode() as HTMLImageElement;ghost.className="handoff-ghost";
   Object.assign(ghost.style,{left:`${b.left}px`,top:`${b.top}px`,width:`${b.width}px`,height:`${b.height}px`});document.body.appendChild(ghost);
   const dx=e.left+e.width/2-b.left-b.width/2,dy=e.top+e.height/2-b.top-b.height/2;
   const anim=ghost.animate([{transform:'translate(0,0) rotate(0deg) scale(1)',opacity:1},{transform:`translate(${dx*.52}px,${dy*.46-80}px) rotate(-23deg) scale(.85)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) rotate(0deg) scale(${e.width/Math.max(b.width,1)},${e.height/Math.max(b.height,1)})`,opacity:1}],{duration:900,easing:'cubic-bezier(.2,.75,.23,1)'});
   anim.onfinish=()=>{ghost.remove();handoffLock.current=false;setHandoff(false)};
   anim.oncancel=()=>{ghost.remove();handoffLock.current=false;setHandoff(false)};
 },[]);
 useEffect(()=>{const onScroll=()=>{const current=window.scrollY;const down=current>prevScroll.current+2;prevScroll.current=current;const area=inspectionRef.current;if(!area)return;const rect=area.getBoundingClientRect();const height=window.innerHeight;
   // Only arm from ABOVE the section, never from the content below it.
   if(rect.top>height*.78)allowHandoff.current=true;
   if(down&&rect.top<height*.75&&rect.top>0&&allowHandoff.current)animateHandoff();};
   window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll);
 },[animateHandoff]);
 const inspectionDown=(e:React.PointerEvent)=>{const m=inspectPointers.current;m.set(e.pointerId,{x:e.clientX,y:e.clientY});e.currentTarget.setPointerCapture(e.pointerId);if(m.size===2){const [a,b]=[...m.values()];pinchRef.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:zoomRef.current};}};
 const inspectionMove=(e:React.PointerEvent)=>{const m=inspectPointers.current;if(!m.has(e.pointerId))return;const last=m.get(e.pointerId)!;m.set(e.pointerId,{x:e.clientX,y:e.clientY});if(m.size>=2){const [a,b]=[...m.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pinchRef.current?.distance){const next=clamp(pinchRef.current.zoom*d/pinchRef.current.distance,.7,2.15);zoomRef.current=next;setZoom(next);}return;}const next={x:clamp(tiltRef.current.x-(e.clientY-last.y)*.38,-24,24),y:clamp(tiltRef.current.y+(e.clientX-last.x)*.38,-28,28)};tiltRef.current=next;setTilt(next);};
 const inspectionUp=(e:React.PointerEvent)=>{inspectPointers.current.delete(e.pointerId);if(inspectPointers.current.size<2)pinchRef.current=null;};
 const zoomBy=(delta:number)=>{zoomRef.current=clamp(zoomRef.current+delta,.7,2.15);setZoom(zoomRef.current)};
 return <>
 <header className="site-header"><div className="header-inner"><button aria-label="World Treasures home" className="brand" onClick={()=>scrollTo('home')}><img src="/assets/brand/treasure-mark.svg" alt=""/><span><strong>WORLD</strong><strong className="accent">TREASURES</strong></span></button><nav className="desktop-nav" aria-label="Main navigation"><button onClick={()=>scrollTo('shop')}>Shop</button><button onClick={()=>scrollTo('inspect')}>A closer look</button><button onClick={()=>scrollTo('why')}>Why World Treasures</button></nav><div className="header-actions"><button className="cart-button" ref={cartRef} onClick={()=>setBagOpen(true)} aria-label={`Shopping bag with ${count} items`}><ShoppingBag size={21}/>{count>0&&<span className="cart-count">{count}</span>}</button><button aria-label="Toggle menu" className="menu-toggle" onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X size={22}/>:<Menu size={22}/>}</button></div></div>{menuOpen&&<nav className="mobile-links"><button onClick={()=>scrollTo('shop')}>Shop</button><button onClick={()=>scrollTo('inspect')}>A closer look</button><button onClick={()=>scrollTo('why')}>About</button></nav>}</header>
 <main>
 <section className="hero" ref={heroRef} id="home" style={{'--h1':selected.colors[0],'--h2':selected.colors[1],'--h3':selected.colors[2],'--h4':selected.colors[3]} as React.CSSProperties}>
  <div className="hero-glow g1"/><div className="hero-glow g2"/><div className="hero-glow g3"/>
  <div className="hero-inner"><div className="hero-info"><span className="eyebrow">DISCOVER THE UNEXPECTED</span><h1>Worldwide snacks.<br/><em>Unforgettable finds.</em></h1><p>A little adventure in every bite. Discover an ever-changing selection of imported snacks and drinks.</p><div className="hero-cta"><button className="primary-btn" onClick={()=>scrollTo('shop')}>Explore products <ArrowRight size={17}/></button><button className="text-btn" onClick={()=>scrollTo('inspect')}>Take a closer look <ChevronDown size={17}/></button></div></div>
  <div className="hero-stage" onPointerDown={heroDown} onPointerUp={heroUp} onPointerCancel={()=>pointer.current=null} onWheel={onHeroWheel}>
   <div className="hero-backword" key={selected.id} aria-hidden>{selected.name.split('·')[0].toUpperCase()}</div><img className="hero-product" key={selected.id+'img'} ref={heroImageRef} src={selected.image} alt={selected.name} draggable={false}/><div className="hero-label"><span>{selected.category}</span><strong>{selected.name}</strong><span>{formatZAR(selected.priceCents)}</span></div>
   <div className="hero-controls"><button aria-label="Previous product" onClick={()=>switchSlide(-1)}><ArrowLeft size={21}/></button><span>{String(slide+1).padStart(2,'0')} / {products.length}</span><button aria-label="Next product" onClick={()=>switchSlide(1)}><ArrowRight size={21}/></button></div>
  </div></div><div className="hero-dots" aria-label="Choose featured product">{products.map((p,i)=><button key={p.id} aria-label={`Show ${p.name}`} aria-current={i===slide?'true':undefined} onClick={()=>goSlide(i)} className={i===slide?'active':''}/>)}</div>
 </section>
 <section className="inspection section-wrap" ref={inspectionRef} id="inspect"><div className="inspection-copy"><div className="section-kicker">THE DETAILS MATTER</div><h2>Take a <em>closer look.</em></h2><p>Meet your pick: <strong>{selected.name}</strong>. Inspect the packaging with drag-to-tilt and pinch-to-zoom. Your product follows you here from the hero above.</p><div className="inspection-meta"><span>{selected.category}</span><span>{selected.country}</span><span>{formatZAR(selected.priceCents)}</span></div><button className="primary-btn" onClick={()=>add(selected,inspectionImageRef.current)}>Add to bag <ShoppingBag size={16}/></button></div><div className="inspection-display"><div className="inspection-orbit" onPointerDown={inspectionDown} onPointerMove={inspectionMove} onPointerUp={inspectionUp} onPointerCancel={inspectionUp} onLostPointerCapture={inspectionUp}><img ref={inspectionImageRef} className={`inspection-product ${handoff?'landing':''}`} src={selected.image} alt={`Inspect ${selected.name}`} draggable={false} style={{transform:`perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${zoom})`}}/></div><div className="zoom-tools"><button aria-label="Zoom in" onClick={()=>zoomBy(.2)}><Plus size={18}/></button><button aria-label="Zoom out" onClick={()=>zoomBy(-.2)}><Minus size={18}/></button><button aria-label="Reset 3D view" onClick={()=>{zoomRef.current=1;tiltRef.current={x:0,y:0};setZoom(1);setTilt({x:0,y:0})}}><RotateCcw size={17}/></button></div><div className="interaction-hint">Drag to tilt · Pinch to zoom</div></div></section>
 <section className="catalog section-wrap" id="shop"><div className="catalog-heading"><div><div className="section-kicker">CURATED FOR THE CURIOUS</div><h2>Explore the <em>collection.</em></h2><p>Start with the 15 products from our approved prototype.</p></div><div className="search-box"><Search size={17}/><input aria-label="Search products" placeholder="Search snacks and drinks" value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="categories">{categories.map(c=><button key={c} aria-pressed={c===category} onClick={()=>setCategory(c)} className={c===category?'selected':''}>{c}</button>)}</div><div className="product-grid">{filtered.map(p=><article className="product-card" key={p.id}><div className="product-art" style={{'--pcolor':p.colors[2]} as React.CSSProperties}><img src={p.image} alt={p.name} ref={el=>{cardImages.current[p.id]=el}} loading="lazy"/><span className="category-chip">{p.category}</span></div><div className="product-body"><div className="product-name">{p.name}</div><div className="product-description">{p.shortDescription}</div><div className="product-bottom"><strong>{formatZAR(p.priceCents)}</strong><button aria-label={`Add ${p.name} to bag`} onClick={()=>add(p,cardImages.current[p.id])}><Plus size={19}/></button></div></div></article>)}</div>{filtered.length===0&&<p className="empty-state">No products match your search.</p>}</section>
 <section className="why section-wrap" id="why"><div className="why-head"><span className="section-kicker">YOUR NEXT DISCOVERY</span><h2>Bringing the world <em>closer.</em></h2><p>Unexpected flavors, iconic favorites and discoveries worth sharing.</p></div><div className="why-grid"><div><Sparkles size={26}/><h3>Curated discoveries</h3><p>A colorful collection of international snacks and drinks.</p></div><div><Truck size={26}/><h3>Delivery rates by city</h3><p>We're building a transparent city-based courier pricing portal.</p></div><div><ShoppingBag size={26}/><h3>Easy shopping</h3><p>Explore products, make your picks, and build a bag.</p></div></div></section>
 </main>
 <footer className="footer"><div className="section-wrap footer-inner"><div><div className="footer-brand">WORLD <span>TREASURES</span></div><p>Imported snacks & drinks. Discover something different.</p><small>Prototype catalog and prices are illustrative until confirmed by the store.</small></div><div className="theme-panel"><strong>Choose your colours</strong><p>Try one of six navy-based website palettes.</p><div className="theme-grid">{themes.map(t=><button key={t.id} className={`theme-choice ${theme===t.id?'picked':''}`} onClick={()=>setTheme(t.id)} aria-label={`Choose ${t.label} theme`} aria-pressed={theme===t.id}><span className="swatches">{t.swatches.map((s,i)=><span key={i} style={{background:s}}/>)}</span><span>{t.label}</span>{theme===t.id&&<Check size={16}/>}</button>)}</div></div></div></footer>
 {toast&&<div className="toast" role="status"><Check size={18}/>{toast}</div>}
 {bagOpen&&<div className="drawer-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setBagOpen(false)}}><aside className="cart-drawer" aria-label="Shopping bag"><header><h2>Your bag <span>({count})</span></h2><button aria-label="Close bag" onClick={()=>setBagOpen(false)}><X/></button></header><div className="cart-lines">{products.filter(p=>bag[p.id]).map(p=><div className="cart-line" key={p.id}><img src={p.image} alt=""/><div><strong>{p.name}</strong><span>{formatZAR(p.priceCents)}</span><div className="quantity"><button aria-label={`Remove one ${p.name}`} onClick={()=>setQty(p.id,(bag[p.id]||0)-1)}><Minus size={14}/></button>{bag[p.id]}<button aria-label={`Add one ${p.name}`} onClick={()=>setQty(p.id,(bag[p.id]||0)+1)}><Plus size={14}/></button></div></div></div>)}{count===0&&<div className="empty-state">Your bag is empty. Explore something new!</div>}</div><div className="cart-summary"><div><strong>Subtotal</strong><strong>{formatZAR(total)}</strong></div><small>Shipping will be calculated from your delivery city in Phase 3.</small><button className="primary-btn" disabled title="Real checkout arrives in Phase 3">Checkout coming in Phase 3</button></div></aside></div>}
 </>;
}
