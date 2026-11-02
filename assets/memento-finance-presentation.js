/* Pure financial period/filter labels. No DOM, calculations, state or writes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoFinancePresentation=api;})(globalThis,()=>{
'use strict';
function periodContext({view,mode,scope,from,to,account,custom,extra=[],query=''},formatDate){
 const period=custom?'Eigen datumbereik':mode==='salary'?'Loonperiode':'Kalenderperiode';
 const filters=view!=='dashboard'&&(view!=='transactions'||mode==='salary')?' · Eigen filters'+(mode==='salary'&&scope==='personal'?' (dashboard heeft een loonperiode)':''):'';
 return period+' · '+formatDate(from)+' t/m '+formatDate(to)+' · '+account+filters+
  (view==='transactions'?(extra.length?' · '+extra.join(' · '):'')+(query?' · Zoekterm: '+query:''):'');
}
return {periodContext};
});
