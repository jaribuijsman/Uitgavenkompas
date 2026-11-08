/* Local calendar recurrence. Expansion is read-only and bounded to one requested day.
 * Missing month days (31 April, 29 February in a non-leap year) are skipped.
 * Exceptions retain their original occurrence key when moved to another date. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoAppointmentRecurrence=api;})(globalThis,()=>{
'use strict';
const rules=['none','weekly','monthly','yearly'];
function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const d=new Date(s+'T12:00:00Z');return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===s;}
function repeatsOn(a,date){
 if(!validDate(date)||date<a.date)return false;
 if(date===a.date)return true;
 const rule=a.recurrence||'none';
 if(rule==='weekly')return (Date.parse(date+'T12:00:00Z')-Date.parse(a.date+'T12:00:00Z'))/86400000%7===0;
 if(rule==='monthly')return date.slice(8)===a.date.slice(8);
 return rule==='yearly'&&date.slice(5)===a.date.slice(5);
}
function occurrence(a,key){
 const ex=a.exceptions?.[key];if(ex?.cancelled)return null;
 return {...a,...ex,id:a.id+'::'+key,seriesId:a.id,occurrenceDate:key,date:ex?.date||key,done:ex?.done??(key===a.date?Boolean(a.done):false),completedAt:ex?.completedAt??(key===a.date?a.completedAt||'':'')};
}
function forDay(items,date){return items.flatMap(a=>{
 if(!a.recurrence||a.recurrence==='none')return a.date===date?[a]:[];
 const keys=new Set([date,...Object.keys(a.exceptions||{}).filter(k=>(a.exceptions[k].date||k)===date)]);
 return [...keys].filter(k=>repeatsOn(a,k)||Object.hasOwn(a.exceptions||{},k)).map(k=>occurrence(a,k)).filter(e=>e&&e.date===date);
});}
function resolve(items,id){
 const exact=items.find(a=>a.id===id);if(exact)return {series:exact,event:exact,key:''};
 const key=String(id).slice(-10),seriesId=String(id).slice(0,-12),series=items.find(a=>a.id===seriesId);
 if(!series||!series.recurrence||series.recurrence==='none'||(!repeatsOn(series,key)&&!Object.hasOwn(series.exceptions||{},key)))return null;
 const event=occurrence(series,key);return event?{series,event,key}:null;
}
function validate(a){
 if(a.recurrence!==undefined&&!rules.includes(a.recurrence))throw Error('Ongeldige afspraakherhaling.');
 if(a.recurrence&&a.recurrence!=='none'&&!validDate(a.date))throw Error('Ongeldige begindatum voor afspraakherhaling.');
 if(a.exceptions===undefined)return;
 if(!a.exceptions||typeof a.exceptions!=='object'||Array.isArray(a.exceptions))throw Error('Ongeldige afspraakuitzonderingen.');
 for(const [key,x] of Object.entries(a.exceptions)){
  if(!validDate(key)||!x||typeof x!=='object'||Array.isArray(x))throw Error('Ongeldige afspraakuitzondering.');
  if(x.cancelled!==undefined&&typeof x.cancelled!=='boolean')throw Error('Ongeldige afspraakuitzondering.');
  if(x.date!==undefined&&!validDate(x.date))throw Error('Ongeldige uitzonderingsdatum.');
  if(x.title!==undefined&&(typeof x.title!=='string'||!x.title.trim()))throw Error('Ongeldige uitzonderingstitel.');
  for(const f of ['allDay','done'])if(x[f]!==undefined&&typeof x[f]!=='boolean')throw Error('Ongeldige uitzonderingsstatus.');
  for(const f of ['time','endTime'])if(x[f]!==undefined&&x[f]!==''&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(x[f]))throw Error('Ongeldige uitzonderingstijd.');
  for(const f of ['completedAt','notes','location'])if(x[f]!==undefined&&typeof x[f]!=='string')throw Error('Ongeldige uitzonderingstekst.');
  if(Object.keys(x).some(k=>!['cancelled','date','title','allDay','done','time','endTime','completedAt','notes','location'].includes(k)))throw Error('Onbekend uitzonderingsveld.');
 }
}
return {rules,validDate,repeatsOn,forDay,resolve,validate};
});
