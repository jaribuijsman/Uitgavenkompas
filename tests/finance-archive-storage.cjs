'use strict';
const assert=require('node:assert/strict'),{tab,clone,Guard,ZIP,emptyLife,sha256}=require('./helpers/storage-fixture.cjs');
module.exports=(async()=>{
 const initial={version:3,transactions:[{id:'income',date:'2026-09-25',type:'income',amount:100,account:'personal',category:'Salaris'}],categories:[{name:'Salaris',kind:'income'}],settings:{salaryPayDates:['2026-09-25','2026-10-26']},monthClosures:{'2026-09':{count:1,net:100}},custom:{preserve:true}};
 const s=await tab(new Map([[Guard.KEYS.finance,JSON.stringify(initial)]]));
 try{
  const b=s.MementoFinancePeriodBridge;b.select('salary','2026-09');let report=b.data('personalBundle');assert(b.closePeriod('personalBundle',report.signature));const saved=clone(s.fin.state),raw=s.storage.get(Guard.KEYS.finance),key='salary:2026-09:personalBundle';assert.equal(saved.periodClosures[key].length,1);assert.deepEqual(saved.transactions,initial.transactions);assert.deepEqual(saved.monthClosures,initial.monthClosures);
  const set=s.localStorage.setItem;s.localStorage.setItem=()=>{throw Error('quota');};assert.equal(b.closePeriod('personalBundle',report.signature),false);assert.equal(s.storage.get(Guard.KEYS.finance),raw);assert.deepEqual(clone(s.fin.state),saved);s.localStorage.setItem=set;
  // A newer raw source rejects a stale archiving attempt without overwriting it.
  const newer=JSON.stringify({...saved,custom:{newer:true}});s.storage.set(Guard.KEYS.finance,newer);assert.equal(b.closePeriod('personalBundle',report.signature),false);assert.equal(s.storage.get(Guard.KEYS.finance),newer);
  const restored=await tab(new Map([[Guard.KEYS.finance,JSON.stringify(initial)]]));try{restored.FileReader=class{readAsText(file){this.result=file.contents;this.onload();}};restored.fin.importBackup({contents:raw});assert.deepEqual(clone(restored.fin.state.periodClosures),saved.periodClosures);assert.deepEqual(clone(restored.fin.state.monthClosures),initial.monthClosures);}finally{restored.MementoStorageGuard.close();}
  const zip=ZIP.zip([{name:'manifest.json',bytes:new TextEncoder().encode(JSON.stringify({format:'memento-complete',version:2,exportedAt:'2026-11-23T10:00:00Z',files:[]}))},{name:'data/life.json',bytes:new TextEncoder().encode(JSON.stringify(emptyLife()))},{name:'data/finance.json',bytes:new TextEncoder().encode(raw)},{name:'data/preferences.json',bytes:new TextEncoder().encode('{}')}]);const prepared=await ZIP.prepareArchive(zip,{sha256});assert.deepEqual(prepared.finance.periodClosures,saved.periodClosures);
  console.log('PASS financial archive guard: append, quota rollback, stale source rejection, legacy preservation, JSON and ZIP validation');
 }finally{s.MementoStorageGuard.close();}
})();
