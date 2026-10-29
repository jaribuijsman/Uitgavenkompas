/* Pure review helpers. No storage, DOM, services or migrations. */
(function(root){'use strict';
 const cents=v=>Math.round(Math.abs(Number(v)||0)*100);
 function finance(transactions,from,to,ids,parts){
  let income=0,expenses=0,transferIn=0,transferOut=0;const categories=new Map(),daily=new Map(),txs=[],selected=new Set(ids);
  for(const t of transactions){
   if(!t.date||t.date<from||t.date>to)continue;
   const amount=cents(t.amount),inside=selected.has(t.account||'personal'),destination=selected.has(t.transferToAccount);
   if(t.type==='transfer'){
    if(inside===destination)continue;txs.push(t);if(inside)transferOut+=amount;else transferIn+=amount;continue;
   }
   if(!inside)continue;txs.push(t);
   if(t.type==='income'){income+=amount;continue;}
   const sign=t.type==='refund'?-1:1;expenses+=sign*amount;daily.set(t.date,(daily.get(t.date)||0)+sign*amount);
   for(const p of parts(t)){const name=p.category||t.category||'Overig';categories.set(name,(categories.get(name)||0)+sign*cents(p.amount));}
  }
  txs.sort((a,b)=>b.date.localeCompare(a.date)||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  return {income:income/100,expenses:expenses/100,transferIn:transferIn/100,transferOut:transferOut/100,received:(income+transferIn)/100,outgoing:(expenses+transferOut)/100,result:(income-expenses)/100,net:(income-expenses+transferIn-transferOut)/100,cats:[...categories].map(([n,v])=>[n,v/100]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),daily:new Map([...daily].map(([d,v])=>[d,v/100])),txs};
 }
 function quantity(text){
  const s=String(text??'').trim().replace(',','.');if(!s)return null;
  if(/^\d+(?:\.\d+)?$/.test(s))return Number(s);
  const m=/^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(s);if(!m||Number(m[3])===0)return null;
  return Number(m[1]||0)+Number(m[2])/Number(m[3]);
 }
 function scale(text,factor){if(factor===1)return String(text??'');const v=quantity(text);return v===null?String(text??''):new Intl.NumberFormat('nl-NL',{maximumFractionDigits:3}).format(v*factor);}
 function validFilters(prefs){
  if(!prefs||typeof prefs!=='object'||Array.isArray(prefs))throw Error('Ongeldige weergavevoorkeuren.');
  const rows=prefs.taskFilters;if(rows===undefined)return true;
  if(!Array.isArray(rows)||rows.length>12)throw Error('Ongeldige bewaarde taakfilters.');
  const ids=new Set();for(const row of rows){if(!row||typeof row.id!=='string'||ids.has(row.id)||typeof row.name!=='string'||!row.name.trim()||row.name.length>80||!row.filters||typeof row.filters!=='object')throw Error('Ongeldig bewaard taakfilter.');ids.add(row.id);for(const k of ['search','taskScope','categoryFilter','roomFilter','repeatFilter','taskSort','taskTab'])if(typeof row.filters[k]!=='string'||row.filters[k].length>2500)throw Error('Ongeldige taakfilterkeuze.');}
  return true;
 }
 const api={finance,quantity,scale,validFilters};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MementoReviewCore=api;
})(typeof window!=='undefined'?window:globalThis);
