/* Immutable period reports. No DOM, storage, network or inferred salary confirmations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoFinanceArchiveCore=api;})(globalThis,()=>{
'use strict';
const scopes={personalBundle:['personal','creditcard'],joint:['joint'],all:['personal','joint','creditcard']};
const clone=v=>JSON.parse(JSON.stringify(v));
const canonical=v=>JSON.stringify(stable(v));
function stable(v){if(Array.isArray(v))return v.map(stable);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]));return v;}
const cents=v=>Math.round(Math.abs(Number(v)||0)*100);
function report(state,{period,scope='personalBundle',budget={categories:{},total:0},parts=t=>t.splits?.length?t.splits:[{category:t.category||'Overig',subcategory:t.subcategory||'',amount:t.amount}],previous=null}){
 if(!scopes[scope])throw Error('Kies een geldig rekeningoverzicht.');
 const ids=scopes[scope],inside=id=>ids.includes(id||'personal');
 const txs=period.observedEnd?state.transactions.filter(t=>t.date>=period.start&&t.date<=period.observedEnd&&(inside(t.account)||(t.type==='transfer'&&inside(t.transferToAccount)))).map(clone).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)):[];
 let income=0,expense=0,transferIn=0,transferOut=0,internal=0;const cats={},subs={};
 for(const t of txs){const n=cents(t.amount);if(t.type==='transfer'){if(inside(t.account)&&inside(t.transferToAccount))internal+=n;else if(inside(t.account))transferOut+=n;else transferIn+=n;continue;}if(t.type==='income'){income+=n;continue;}const sign=t.type==='refund'?-1:1;expense+=sign*n;
  for(const p of parts(t)){const k=p.category||'Overig',v=sign*cents(p.amount),sub=p.subcategory||(t.splits?.length?'':t.subcategory)||'';cats[k]=(cats[k]||0)+v;if(sub){const key=JSON.stringify([k,sub]);subs[key]=(subs[key]||0)+v;}}
 }
 const categories=Object.entries(cats).map(([category,v])=>({category,netExpenses:v/100})).sort((a,b)=>b.netExpenses-a.netExpenses||a.category.localeCompare(b.category));
 const subcategories=Object.entries(subs).map(([k,v])=>({category:JSON.parse(k)[0],subcategory:JSON.parse(k)[1],netExpenses:v/100})).sort((a,b)=>b.netExpenses-a.netExpenses);
 const total=Number(budget.total)||0,categoryBudgets=Object.entries(budget.categories||{}).map(([category,limit])=>({category,limit,actual:(cats[category]||0)/100,remaining:(Math.round(limit*100)-(cats[category]||0))/100}));
 const basis={period:{...clone(period),incomplete:period.observedEnd!==period.end,provisional:period.status!=='confirmed'},scope,accounts:[...ids],transactions:txs,budget:clone(budget)};
 return {format:'memento-period-analysis',schemaVersion:1,currency:'EUR',...basis,analysis:{count:txs.length,income:income/100,netExpenses:expense/100,result:(income-expense)/100,netCashFlow:(income-expense+transferIn-transferOut)/100,categories,subcategories,budget:{total,remaining:total?(Math.round(total*100)-expense)/100:null,categories:categoryBudgets},transfers:{incoming:transferIn/100,outgoing:transferOut/100,internal:internal/100},previous},signature:canonical(basis),rules:{period:'Start inclusief; volgend salaris exclusief. Alleen transacties t/m observedEnd.',result:'Inkomsten minus netto uitgaven; geen banksaldo.',refunds:'Negatieve uitgaven.',transfers:'Apart; interne overboekingen en creditcardaflossingen niet opnieuw als uitgave.',privacy:'Volledige transacties inclusief eventuele notities; deel het bestand zelf.'}};
}
function key(period,scope){return [period.mode,period.key,scope].join(':');}
function latest(state,period,scope){return (state.periodClosures?.[key(period,scope)]||[]).at(-1)||null;}
function closable(period,today){return period.status==='confirmed'&&period.end<today&&!!period.observedEnd;}
function append(state,data,{today,id,closedAt}){if(!closable(data.period,today))throw Error('Alleen een afgelopen periode met bevestigde grenzen kan worden afgesloten.');const k=key(data.period,data.scope),records=state.periodClosures?.[k]||[],record={id,version:records.length+1,closedAt,report:clone(data)};return {...(state.periodClosures||{}),[k]:[...records,record]};}
return {report,key,latest,closable,append,canonical,scopes};
});
