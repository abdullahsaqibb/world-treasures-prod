/** Build-time bundled theme initialization; no runtime file-system reads. */
export const initialTheme = "(function(){try{var t=localStorage.getItem('wt-color-scheme');if(['gold','coral','teal','lime','violet','rose'].includes(t))document.documentElement.dataset.wtTheme=t;}catch(e){}})();";
