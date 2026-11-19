
/* Keep the cart anchor available throughout the page. */
(()=>{const header=document.querySelector('header');if(!header)return;let scheduled=false;const update=()=>{header.classList.toggle('wt-scrolled',window.scrollY>50);scheduled=false};window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});update()})();
