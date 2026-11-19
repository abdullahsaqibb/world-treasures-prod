
/* Independent fail-safe: a storefront exception cannot trap visitors behind the intro. */
(function(){
 var hidden=false;
 function unlock(){
  if(hidden)return;
  var intro=document.getElementById('intro');if(!intro)return;
  hidden=true;intro.hidden=true;intro.style.setProperty('display','none','important');
 }
 setTimeout(unlock,2500);
 var skip=document.getElementById('skipIntro');if(skip)skip.addEventListener('click',unlock);
})();
