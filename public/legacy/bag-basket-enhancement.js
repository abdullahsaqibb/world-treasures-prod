/* World Treasures — resilient enhancement for the real cart order-summary page.
   Works with both legacy-rendered .cart-page-layout and React-managed bag UI. */
(function () {
  "use strict";
  if (window.__wtBagBasketEnhancement) return;
  window.__wtBagBasketEnhancement = true;

  const styleId = "wt-bag-enhance-style";
  if (!document.getElementById(styleId)) {
    const css = document.createElement("style");
    css.id = styleId;
    css.textContent = `
      .wt-enhanced-basket { margin-top:22px; padding:17px 12px 15px; background:#f7f3ec; border:1px solid #d0d5df; border-radius:15px; color:#15253d }
      .wt-enhanced-basket-label { display:block; text-align:center; font:800 10px/1.4 system-ui,sans-serif; letter-spacing:.13em; margin:0 0 12px; }
      .wt-enhanced-basket-button { width:100%; display:grid; justify-items:center; gap:8px; border:0; background:transparent; padding:5px; border-radius:10px; cursor:pointer; color:inherit; }
      .wt-enhanced-basket-button:focus-visible{outline:3px solid #ef774e;outline-offset:4px}
      .wt-enhanced-basket-figure {position:relative;display:block;width:min(100%,290px);height:168px;margin:auto}
      .wt-enhanced-basket-packets{position:absolute;inset:0 0 46px;z-index:1;pointer-events:none}
      .wt-enhanced-basket-packets img{position:absolute;left:50%;bottom:0;width:76px;height:108px;object-fit:contain;transform-origin:50% 100%;filter:drop-shadow(0 4px 4px #0002);animation:wt-enhanced-drop .8s cubic-bezier(.22,.78,.27,1.12) both;animation-delay:calc(var(--wt-idx)*120ms)}
      .wt-enhanced-basket-bin { position:absolute;z-index:2;bottom:0;left:50%;transform:translateX(-50%);width:205px;height:91px;background:linear-gradient(140deg,#ed8459,#cb623c);border:3px solid #1d3043;border-radius:8px 8px 22px 22px;clip-path:polygon(0 0,100% 0,94% 100%,6% 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;box-shadow:inset 0 10px 0 #ffd4ae35}
      .wt-enhanced-basket-bin strong{font:900 14px/1.3 system-ui,sans-serif;letter-spacing:.04em}
      .wt-enhanced-basket-bin small{font:750 10px/1.5 system-ui,sans-serif;letter-spacing:.1em}
      .wt-enhanced-basket-button>strong {font:800 14px/1.3 system-ui,sans-serif}
      .wt-enhanced-basket-button>small {font:700 12px/1.4 system-ui,sans-serif;color:#a85537}
      @keyframes wt-enhanced-drop { 0%{opacity:0;translate:0 -85px;scale:.6} 65%{opacity:1} 100%{opacity:1;translate:0 0;scale:1} }
      .wt-enhanced-details-backdrop {position:fixed;inset:0;z-index:2147483647;background:#13202cc0;display:grid;place-items:center;padding:18px;backdrop-filter:blur(4px)}
      .wt-enhanced-details { background:#fffdf9;border-radius:18px;width:min(520px,100%);max-height:86dvh;overflow-y:auto;padding:24px;box-shadow:0 20px 80px #0005;color:#162638;font:14px/1.5 system-ui,sans-serif }
      .wt-enhanced-details header{position:static!important;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;background:transparent!important;border:0!important;color:inherit!important}
      .wt-enhanced-details h2{font:800 23px/1.2 system-ui,sans-serif!important;letter-spacing:0!important;text-transform:none!important;margin:0!important}
      .wt-enhanced-details-close{width:36px;height:36px;border-radius:50%;background:#eff0f1;border:0;cursor:pointer;color:#192938;font-size:22px}
      .wt-enhanced-details-row{display:grid;grid-template-columns:56px minmax(0,1fr) auto;align-items:center;gap:12px;padding:13px 0;border-top:1px solid #e7e8e9}
      .wt-enhanced-details-row img{width:52px;height:65px;object-fit:contain}
      .wt-enhanced-details-row strong{font-size:13px}
      .wt-enhanced-details-row small{display:block;color:#66717b;margin-top:4px}
      .wt-enhanced-details-total{border-top:1px solid #cfd6dc;display:flex;justify-content:space-between;gap:10px;padding-top:16px;margin-top:10px;font-size:16px;font-weight:800}
      @media(prefers-reduced-motion:reduce){.wt-enhanced-basket-packets img{animation:none!important}}
    `;
    document.head.append(css);
  }

  const esc = (s) => String(s || "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const asMoney = (s) => String(s||"").match(/R\s*[\d,.]+/)?.[0] || "";
  const extractItems = (root) => {
    const lines = root.querySelectorAll(".line-item, .wt-cart-line");
    return Array.from(lines).map((node) => {
      const img = node.querySelector("img");
      const name = node.querySelector("h3, .wt-cart-desc strong")?.textContent?.trim() ||
                   node.querySelector("strong")?.textContent?.trim() || "Product";
      const quantity = Number(node.querySelector(".quantity span, .wt-cart-qty b")?.textContent?.trim() || 1);
      const price = asMoney(node.querySelector(".wt-line-price")?.textContent) ||
                    asMoney(node.querySelector("strong")?.textContent) ||
                    asMoney(node.textContent);
      return {img:img?.getAttribute("src")||"",name,quantity:Number.isFinite(quantity)&&quantity>0?quantity:1,price};
    }).filter(x=>x.img);
  };
  function openContents(items, total) {
    if(document.querySelector(".wt-enhanced-details-backdrop"))return;
    const backdrop=document.createElement("div");backdrop.className="wt-enhanced-details-backdrop";
    backdrop.innerHTML=`<section class="wt-enhanced-details" role="dialog" aria-modal="true" aria-label="Products inside your shopping basket"><header><h2>Inside your basket</h2><button type="button" class="wt-enhanced-details-close" aria-label="Close basket contents">×</button></header><div class="wt-enhanced-details-lines">${items.map(i=>`<div class="wt-enhanced-details-row"><img src="${esc(i.img)}" alt=""><div><strong>${esc(i.name)}</strong><small>Quantity: ${i.quantity}</small></div><strong>${esc(i.price)}</strong></div>`).join("")}</div><div class="wt-enhanced-details-total"><span>Subtotal</span><strong>${esc(total)}</strong></div></section>`;
    const prior=document.activeElement;
    const close=()=>{document.removeEventListener("keydown",onKey);backdrop.remove();if(prior instanceof HTMLElement)prior.focus();};
    const onKey=e=>{if(e.key==="Escape"){e.preventDefault();close()}};
    document.addEventListener("keydown",onKey);
    backdrop.addEventListener("click",e=>{if(e.target===backdrop||e.target.closest(".wt-enhanced-details-close"))close()});
    // Append inside the currently open modal: a modal dialog otherwise sits above ordinary body overlays.
    const openDialog=document.querySelector("#cartDialog[open], #checkoutDialog[open]") || document.body;
    openDialog.append(backdrop);
    backdrop.querySelector(".wt-enhanced-details-close")?.focus();
  }
  function enhance(root) {
    if(!root || root.querySelector(".wt-enhanced-basket") || root.querySelector(".wt-cart-bag-bottom"))return;
    const dialog=root.closest("#cartDialog");
    if(dialog && !dialog.open)return;
    const bag=root.closest(".cart-page-layout, .wt-cart-page") || document;
    const items=extractItems(bag);
    if(!items.length)return;
    const summary=root.querySelector(".wt-bag-summary-row strong, .totals strong, [class*=summary] strong");
    const total=asMoney(summary?.textContent) || asMoney(root.textContent) || "";
    const widget=document.createElement("section");widget.className="wt-enhanced-basket";
    widget.innerHTML=`<span class="wt-enhanced-basket-label">YOUR PRODUCTS, PACKED TOGETHER</span><button type="button" class="wt-enhanced-basket-button" aria-label="Open the products inside your shopping basket"><span class="wt-enhanced-basket-figure"><span class="wt-enhanced-basket-packets">${items.slice(0,5).map((i,index)=>`<img src="${esc(i.img)}" alt="" style="--wt-idx:${index};left:${50+(index-(Math.min(items.length,5)-1)/2)*14}%;transform:translateX(-50%) rotate(${(index-(Math.min(items.length,5)-1)/2)*17}deg)">`).join("")}</span><span class="wt-enhanced-basket-bin"><strong>WORLD TREASURES</strong><small>${items.reduce((n,i)=>n+i.quantity,0)} ITEMS INSIDE</small></span></span><strong>What's in your basket?</strong><small>Click to reveal your selected products ↗</small></button>`;
    root.append(widget);
    widget.querySelector("button")?.addEventListener("click",()=>openContents(extractItems(bag),asMoney(root.textContent)||total));
  }
  let busy=false;
  function scan() {
    busy=false;
    document.querySelectorAll("#cartDialog .order-summary, .cart-page-layout .order-summary").forEach(enhance);
  }
  const schedule=()=>{if(busy)return;busy=true;requestAnimationFrame(scan)};
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["open"]});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",scan,{once:true});
  else scan();
})();
