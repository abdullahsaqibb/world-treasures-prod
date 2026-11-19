/* ===== Photo layer: glow per card and cursor parallax on the hero photos ===== */
(function(){
'use strict';
const safe=fn=>{try{fn()}catch(err){console.warn('Photo layer:',err)}};
safe(()=>{
  document.querySelectorAll('.product-art').forEach(a=>{if(!a.querySelector('.fx-glow')){const g=document.createElement('span');g.className='fx-glow';a.prepend(g)}});
});
safe(()=>{
  if(reduced||!matchMedia('(pointer:fine)').matches)return;
  const hero=document.getElementById('heroArt');if(!hero)return;
  hero.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse')return;
    const r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    document.querySelectorAll('.stage-slot').forEach(slot=>{
      const img=slot.querySelector('img');if(!img)return;
      const k=slot.classList.contains('is-active')?1:.45;
      img.style.translate=`${(x*26*k).toFixed(1)}px ${(y*18*k).toFixed(1)}px`;
    });
  });
  hero.addEventListener('pointerleave',()=>document.querySelectorAll('.stage-slot img').forEach(img=>img.style.translate=''));
});
})();

