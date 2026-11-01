/* Shared pure date boundaries for Finance; projected dates are never confirmations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoFinancePeriodCore=api;})(globalThis,()=>{
'use strict';
const iso=d=>[d.getUTCFullYear(),String(d.getUTCMonth()+1).padStart(2,'0'),String(d.getUTCDate()).padStart(2,'0')].join('-');
const valid=s=>typeof s==='string'&&/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
const shift=(s,n)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return iso(d)};
const monthShift=(k,n)=>{const [y,m]=k.split('-').map(Number);return iso(new Date(Date.UTC(y,m-1+n,1))).slice(0,7)};
const expected=(k,payday)=>{const [y,m]=k.split('-').map(Number),day=Math.max(1,Math.min(31,Number(payday)||25));return iso(new Date(Date.UTC(y,m-1,Math.min(day,new Date(Date.UTC(y,m,0)).getUTCDate()))))};
function range({mode='salary',key,payday=25,dates=[],today}){
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)||!valid(today))throw Error('Ongeldige financiële periode');
 const confirmed=new Map(dates.filter(valid).map(d=>[d.slice(0,7),d])),next=monthShift(key,1);
 const start=mode==='salary'?(confirmed.get(key)||expected(key,payday)):key+'-01';
 const endExclusive=mode==='salary'?(confirmed.get(next)||expected(next,payday)):next+'-01';
 const end=shift(endExclusive,-1),observedEnd=today<start?null:(today<end?today:end);
 return {mode,key,start,end,endExclusive,observedEnd,isCurrent:start<=today&&today<endExclusive,startConfirmed:mode==='month'||confirmed.has(key),endConfirmed:mode==='month'||confirmed.has(next),status:mode==='month'||confirmed.has(key)&&confirmed.has(next)?'confirmed':'provisional'};
}
function currentSalaryKey({payday=25,dates=[],today}){const k=today.slice(0,7);return today<range({mode:'salary',key:k,payday,dates,today}).start?monthShift(k,-1):k}
return {valid,shift,monthShift,range,currentSalaryKey};
});
