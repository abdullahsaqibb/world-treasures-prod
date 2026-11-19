(function(){
  const choices={gold:{label:'Treasure Gold',navy:'#101f38'},coral:{label:'Sunset Coral',navy:'#12233d'},teal:{label:'Coastal Teal',navy:'#0b2135'},lime:{label:'Electric Lime',navy:'#10293c'},violet:{label:'Royal Violet',navy:'#1b1c40'},rose:{label:'Berry Rose',navy:'#16253d'}};
  const buttons=Array.from(document.querySelectorAll('[data-wt-set-theme]'));
  const feedback=document.getElementById('wt-theme-feedback');
  function apply(theme,save){
    if(!Object.prototype.hasOwnProperty.call(choices,theme))theme='gold';
    document.documentElement.dataset.wtTheme=theme;
    buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wtSetTheme===theme)));
    if(feedback)feedback.textContent=choices[theme].label+' selected';
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',choices[theme].navy);
    if(save){try{localStorage.setItem('wt-color-scheme',theme)}catch(e){}}
  }
  buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.wtSetTheme,true)));
  apply(document.documentElement.dataset.wtTheme||'gold',false);
})();