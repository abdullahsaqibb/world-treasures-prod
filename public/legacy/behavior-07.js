
/* World Treasures — progressive interaction patch. No additional libraries. */
(()=>{
 'use strict';
 // Touch events (not pointer capture) for mobile Safari and Android.
 const stage=document.getElementById('heroArt');
 if(stage){
  let swipe=null,lastTouch=0;
  stage.addEventListener('touchstart',e=>{
   if(e.touches.length!==1 || e.target.closest('.stage-controls,.stage-info'))return;
   const t=e.touches[0];swipe={x:t.clientX,y:t.clientY,dx:0,dy:0,start:performance.now(),horizontal:false};
  },{passive:true});
  stage.addEventListener('touchmove',e=>{
   if(!swipe ||e.touches.length!==1)return;
   const t=e.touches[0];swipe.dx=t.clientX-swipe.x;swipe.dy=t.clientY-swipe.y;
   if(!swipe.horizontal && Math.abs(swipe.dx)>13 && Math.abs(swipe.dx)>Math.abs(swipe.dy)*1.2)swipe.horizontal=true;
   if(swipe.horizontal && e.cancelable)e.preventDefault();
  },{passive:false});
  stage.addEventListener('touchend',e=>{
   if(!swipe)return;
   if(e.changedTouches.length){const t=e.changedTouches[0];swipe.dx=t.clientX-swipe.x;swipe.dy=t.clientY-swipe.y;}
   if(Math.abs(swipe.dx)>42 && Math.abs(swipe.dx)>Math.abs(swipe.dy)*1.15 && performance.now()-lastTouch>320){
    lastTouch=performance.now();
    try{navigateHero(swipe.dx<0?1:-1);resetHeroClock();}catch(err){console.warn('Carousel swipe',err)}
    const active=stage.querySelector('.stage-slot.is-active');if(active)active.blur?.();
   }
   swipe=null;
  },{passive:true});
  stage.addEventListener('touchcancel',()=>swipe=null,{passive:true});
 }
 const section=document.getElementById('flavourLab');
 const model=document.getElementById('inspectModel');
 const manip=document.getElementById('inspectManual');
 const center=section?.querySelector('.inspect-center');
 if(!section||!model||!manip||!center)return;
 section.classList.add('wt-inspection-reworked');
 let manual=false,zoom=1,rx=0,ry=0,drag=null;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 const writeTransform=()=>{
  manip.style.setProperty('--wt-rx',rx+'deg');manip.style.setProperty('--wt-ry',ry+'deg');manip.style.setProperty('--wt-zoom',zoom.toFixed(3));
 };
 // No extra construct/deconstruct. The selected product's trip is the only entrance motion.
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let handoffRunning=false,armed=true,flight=null,ghost=null,flightTimer=null;
 function selectedHeroPhoto(){
  return document.querySelector('#stageDeck .stage-slot.is-active .hero-front img') ||
   document.querySelector('#stageDeck .stage-slot.is-active img');
 }
 function cleanupFlight(){
  if(flightTimer){clearTimeout(flightTimer);flightTimer=null}
  if(ghost){ghost.remove();ghost=null}
  section.classList.remove('wt-handoff-flight');
  handoffRunning=false;flight=null;
 }
 function flySelectedProductIntoInspection(){
  if(!armed||handoffRunning)return;
  armed=false;
  const photo=selectedHeroPhoto();
  const source=photo?.currentSrc||photo?.getAttribute('src');
  if(reducedMotion||!source||!model.getBoundingClientRect().width||!Element.prototype.animate)return;
  handoffRunning=true;
  ghost=document.createElement('img');
  ghost.className='wt-product-handoff';ghost.alt='';ghost.setAttribute('aria-hidden','true');
  ghost.src=source;
  const hero=photo.getBoundingClientRect(),target=model.getBoundingClientRect();
  const vw=innerWidth,vh=innerHeight;
  const width=Math.max(100,Math.min(340,hero.width||target.width||220));
  const height=width*Math.max(.75,Math.min(1.65,(hero.height||width*1.25)/(hero.width||width)));
  ghost.style.width=width+'px';ghost.style.height=height+'px';
  const startX=hero.width?hero.left+hero.width/2-width/2:vw/2-width/2;
  const startY=hero.bottom>0&&hero.top<vh?hero.top+hero.height/2-height/2:-height*.74;
  const endX=target.left+target.width/2-width/2;
  const endY=target.top+target.height/2-height/2;
  const endScale=Math.min(1.7,Math.max(.5,target.width/width));
  const transform=(x,y,deg,scale)=>`translate3d(${Math.round(x)}px,${Math.round(y)}px,0) rotate(${deg}deg) rotateY(${deg*.6}deg) scale(${scale})`;
  document.body.append(ghost);section.classList.add('wt-handoff-flight');
  flight=ghost.animate([
   {transform:transform(startX,startY,-18,.85),opacity:0,offset:0},
   {transform:transform(startX+(endX-startX)*.3,startY+(endY-startY)*.3,15,1.1),opacity:1,offset:.28},
   {transform:transform(startX+(endX-startX)*.76,startY+(endY-startY)*.68,-9,Math.max(.65,endScale*1.12)),opacity:1,offset:.72},
   {transform:transform(endX,endY,0,endScale),opacity:1,offset:1}
  ],{duration:900,easing:'cubic-bezier(.2,.75,.23,1)',fill:'forwards'});
  flight.addEventListener('finish',cleanupFlight,{once:true});
  flight.addEventListener('cancel',cleanupFlight,{once:true});
  flightTimer=setTimeout(cleanupFlight,1300);
 }
 const chapter=section.querySelector('#labChapter'),desc=section.querySelector('#labDescription');
 if(chapter)chapter.textContent='02 / EXPLORE THE PACK';
 if(desc)desc.textContent='Selected from the hero carousel. Drag to tilt, pinch with two fingers to zoom, or use the zoom controls.';
 section.querySelector('#labProgress')?.style.setProperty('transform','scaleX(1)');
 // Handoff is strictly a top-to-bottom entrance: never animate when coming back
 // from lower sections. Rearm only after the visitor returns ABOVE inspection.
 let previousPageY=window.scrollY;
 let scrollDirection=0;
 const updateHandoffDirection=()=>{
  const nextY=window.scrollY;
  const difference=nextY-previousPageY;
  if(Math.abs(difference)>1)scrollDirection=difference>0?1:-1;
  previousPageY=nextY;
  const bounds=center.getBoundingClientRect();
  // Centre is below the viewport: user has returned to the hero side.
  if(bounds.top>=window.innerHeight*.95){
   armed=true;
   if(handoffRunning){flight?.cancel();cleanupFlight()}
  }
 };
 window.addEventListener('scroll',updateHandoffDirection,{passive:true});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   const entry=entries[0];
   if(!entry)return;
   const bounds=center.getBoundingClientRect();
   if(!entry.isIntersecting){
    // Only reset above the section. Leaving below must NOT rearm the effect.
    if(bounds.top>=window.innerHeight*.95)armed=true;
    if(handoffRunning){flight?.cancel();cleanupFlight()}
    return;
   }
   if(entry.intersectionRatio>=.28 && scrollDirection===1 && armed){
    flySelectedProductIntoInspection();
   }
  },{threshold:[0,.28,.5]});
  observer.observe(center);
 }else{
  // Fallback for older browsers: preserve the same downward-only rule.
  window.addEventListener('scroll',()=>{
   const r=center.getBoundingClientRect();
   if(armed && scrollDirection===1 && r.top<window.innerHeight*.75 && r.bottom>window.innerHeight*.25){
    flySelectedProductIntoInspection();
   }
  },{passive:true});
 }
 // Tilt uses a photo plane with perspective, not an invented backside or a fake 360-degree texture.
 function selectMode(mode){manual=mode!=='scroll';section.classList.toggle('manual-view',manual);document.querySelectorAll('[data-inspect-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.inspectView===mode)));
  if(mode==='front'){rx=0;ry=0}else if(mode==='tilt'){rx=-8;ry=24}else{rx=0;ry=0}writeTransform();}
 section.querySelectorAll('[data-inspect-view]').forEach(b=>b.addEventListener('click',e=>{e.stopImmediatePropagation();selectMode(b.dataset.inspectView)},{capture:true}));
 section.querySelector('#wtZoomIn')?.addEventListener('click',()=>{zoom=clamp(zoom+.18,.7,2.15);writeTransform()});
 section.querySelector('#wtZoomOut')?.addEventListener('click',()=>{zoom=clamp(zoom-.18,.7,2.15);writeTransform()});
 section.querySelector('#wtViewerReset')?.addEventListener('click',()=>{zoom=1;selectMode('scroll')});
 // Two-finger pinch zoom on the packet, independent of page scrolling and tilt.
 let pinch=null,pinching=false;
 const touchDistance=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
 center.addEventListener('touchstart',e=>{
  if(e.touches.length!==2)return;
  const dist=touchDistance(e.touches[0],e.touches[1]);
  if(dist<10)return;
  pinch={distance:dist,initialZoom:zoom};pinching=true;drag=null;
  section.classList.remove('wt-viewer-dragging');
  if(e.cancelable)e.preventDefault();
 },{passive:false});
 center.addEventListener('touchmove',e=>{
  if(!pinch||e.touches.length!==2)return;
  if(e.cancelable)e.preventDefault();
  zoom=clamp(pinch.initialZoom*touchDistance(e.touches[0],e.touches[1])/pinch.distance,.7,2.15);
  writeTransform();
 },{passive:false});
 const endPinch=e=>{if(!pinch)return;if(e.touches.length<2){pinch=null;pinching=false;drag=null;section.classList.remove('wt-viewer-dragging')}};
 center.addEventListener('touchend',endPinch,{passive:true});
 center.addEventListener('touchcancel',()=>{pinch=null;pinching=false;drag=null;section.classList.remove('wt-viewer-dragging')},{passive:true});
 center.addEventListener('pointerdown',e=>{if(pinching||e.target.closest('button')||e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,y:e.clientY,ry,rx,id:e.pointerId};manual=true;section.classList.add('wt-viewer-dragging','manual-view');section.querySelectorAll('[data-inspect-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.inspectView==='tilt')));center.setPointerCapture(e.pointerId)});
 center.addEventListener('pointermove',e=>{if(pinching||!drag||drag.id!==e.pointerId)return;ry=clamp(drag.ry+(e.clientX-drag.x)*.26,-55,55);rx=clamp(drag.rx-(e.clientY-drag.y)*.2,-30,30);writeTransform()});
 function stopDrag(){drag=null;section.classList.remove('wt-viewer-dragging')}
 center.addEventListener('pointerup',stopDrag);center.addEventListener('pointercancel',stopDrag);
 center.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();zoom=clamp(zoom+(e.deltaY>0?-.08:.08),.7,2.15);writeTransform()},{passive:false});
 document.addEventListener('keydown',e=>{if(!section.contains(document.activeElement))return;if(e.key==='+'){zoom=clamp(zoom+.12,.7,2.15);writeTransform()}else if(e.key==='-'){zoom=clamp(zoom-.12,.7,2.15);writeTransform()}});
 writeTransform();
})();
