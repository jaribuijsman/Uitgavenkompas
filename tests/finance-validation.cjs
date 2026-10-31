'use strict';
// Synthetic storage only. Verify boundary behavior and byte preservation, not just validators.
const assert=require('node:assert/strict');
const V=require('../assets/memento-finance-validation.js');
const {tab,clone,Guard,emptyLife,tx,ZIP,sha256}=require('./helpers/storage-fixture.cjs');
let count=0;
async function test(name,fn){await fn();count++;console.log('PASS',name);}
const valid=()=>({version:3,transactions:[tx('keep')],categories:[{name:'Overig',kind:'expense',subcategories:[]}],settings:{startBalance:-12.34}});
const invalid=[
 ['transaction collection',s=>{s.transactions={};}],['null collection',s=>{s.receipts=null;}],
 ['null record',s=>{s.transactions=[null];}],['numeric string',s=>{s.transactions[0].amount='12.34';}],
 ['negative amount',s=>{s.transactions[0].amount=-1;}],['missing amount',s=>{delete s.transactions[0].amount;}],
 ['invalid date',s=>{s.transactions[0].date='2026-02-30';}],['unknown type',s=>{s.transactions[0].type='other';}],
 ['unknown account',s=>{s.transactions[0].account='unknown';}],['duplicate ID',s=>{s.transactions.push(clone(s.transactions[0]));}],
 ['empty ID',s=>{s.transactions[0].id='';}],['unknown destination',s=>{Object.assign(s.transactions[0],{type:'transfer',transferToAccount:'bad'});}],
 ['self transfer',s=>{Object.assign(s.transactions[0],{type:'transfer',transferToAccount:'personal'});}],
 ['split mismatch',s=>{s.transactions[0].splits=[{category:'Overig',amount:2}];}],
 ['invalid category',s=>{s.categories=[{name:5}];}],['invalid subcategories',s=>{s.categories[0].subcategories='bad';}],
 ['invalid settings',s=>{s.settings=[];}],['invalid opening balance',s=>{s.settings.accountOpening={personal:'1'};}],
 ['unknown balance account',s=>{s.settings.actualBalances={unknown:2};}],['invalid budget',s=>{s.budgets={Overig:'10'};}],
 ['invalid month budget',s=>{s.budgetMonths={'2026-10':{all:{categories:{Overig:-1}}}};}],
 ['invalid bill',s=>{s.bills=[{id:'b',name:'Bill',amount:2,nextDate:'2026-10-01',frequency:'bad'}];}],
 ['invalid goal',s=>{s.goals=[{id:'g',name:'Goal',target:10,saved:'5'}];}],
 ['invalid receipt',s=>{s.receipts=[{id:'r',total:'1'}];}],['invalid trash',s=>{s.trash={transactions:[{id:'trash',deletedAt:'2026-10-31',item:{id:'bad'}}]};}],
 ['unknown version',s=>{s.version=999;}],
 ['invalid month closure',s=>{s.monthClosures={'2026-10':{net:'2'}};}],
 ['invalid salary history',s=>{s.settings.salaryPeriods=[{from:'2026-10-01',to:'2026-10-31',income:'1'}];}]
];
const rawZip=finance=>ZIP.zip([
 {name:'manifest.json',bytes:new TextEncoder().encode(JSON.stringify({format:'memento-complete',version:2,exportedAt:'2026-10-31T10:00:00Z',files:[]}))},
 {name:'data/life.json',bytes:new TextEncoder().encode(JSON.stringify(emptyLife()))},
 {name:'data/finance.json',bytes:new TextEncoder().encode(JSON.stringify(finance))},
 {name:'data/preferences.json',bytes:new TextEncoder().encode('{}')}
]);
(async()=>{
 await test('valid legacy data preserves values, IDs, historical names, links and unknown metadata',async()=>{
  const data=valid();delete data.transactions[0].account;data.transactions[0].category='Deleted category';data.transactions[0].billId='old-deleted-bill';data.custom={keep:'unchanged'};
  Object.assign(data.transactions[0],{transferToAccount:null,splits:null,billOccurrenceDate:null,receiptId:null});
  const raw=JSON.stringify(data,null,2);assert.equal(V.validate(data),data);assert.equal(JSON.stringify(data,null,2),raw);
  const s=await tab(new Map([[Guard.KEYS.finance,raw]]));assert.equal(s.fin.blocked,false);assert.equal(s.fin.state.settings.accountOpening.personal,-12.34);assert.deepEqual(clone(s.fin.state.transactions),data.transactions);assert.equal(s.storage.get(Guard.KEYS.finance),raw);s.MementoStorageGuard.close();
 });
 for(const [name,mutate] of invalid)await test(name+' refuses load, JSON, legacy combined JSON, recovery and intact ZIP without any writes',async()=>{
  const data=valid();mutate(data);const raw=JSON.stringify(data,null,2);assert.throws(()=>V.validate(data),/Ongeldige financiële/);
  const corrupt=await tab(new Map([[Guard.KEYS.finance,raw]]));assert.equal(corrupt.fin.blocked,true);assert.equal(corrupt.fin.save(),false);assert.equal(corrupt.storage.get(Guard.KEYS.finance),raw);corrupt.MementoStorageGuard.close();
  const s=await tab(new Map([[Guard.KEYS.finance,JSON.stringify(valid())],[Guard.KEYS.life,JSON.stringify(emptyLife())],['uitgavenkompas_pin_config_v1','fictional-pin'],['uitgavenkompas_auto_backup_v1',raw]]));
  const before=clone([...s.storage]),memory=clone(s.fin.state);let confirms=0;s.confirm=()=>{confirms++;return true;};
  s.FileReader=class{readAsText(f){this.result=f.contents;this.onload();}};
  s.fin.importBackup({contents:raw});assert.deepEqual(clone(s.fin.state),memory);s.fin.restoreAutoBackup();
  assert.equal(await s.life.importBackup(new Blob([JSON.stringify({format:'compass-life-backup',version:1,lifeState:emptyLife(),financeState:data})]),true),false);
  await assert.rejects(()=>ZIP.prepareArchive(rawZip(data),{sha256}),/Ongeldige financiële/);
  assert.equal(await s.life.importCompleteBackup(rawZip(data)),false);
  assert.deepEqual([...s.storage],before);assert.deepEqual(clone(s.fin.state),memory);assert.equal(s.fin.blocked,false);assert.equal(s.MementoKnowledgeStore.writes,0);assert.equal(confirms,0);s.MementoStorageGuard.close();
 });
 await test('nonfinite numbers are refused without coercion',()=>{for(const n of [NaN,Infinity,-Infinity]){const data=valid();data.transactions[0].amount=n;assert.throws(()=>V.validate(data));}});
 await test('empty persisted string is corruption rather than an uninitialized account',async()=>{const s=await tab(new Map([[Guard.KEYS.finance,'']]));assert(s.fin.blocked);assert.equal(s.fin.save(),false);assert.equal(s.storage.get(Guard.KEYS.finance),'');s.MementoStorageGuard.close();});
 await test('failed financial recovery keeps memory and blocked state; successful recovery retains original source',async()=>{
  const raw='{ "transactions": "damaged", "categories": [] }',s=await tab(new Map([[Guard.KEYS.finance,raw]]));
  const before=clone(s.fin.state);s.FileReader=class{readAsText(f){this.result=f.contents;this.onload();}};
  const setter=s.localStorage.setItem;s.localStorage.setItem=()=>{throw Error('quota');};
  s.fin.importBackup({contents:JSON.stringify(valid())});assert(s.fin.blocked);assert.deepEqual(clone(s.fin.state),before);assert.equal(s.storage.get(Guard.KEYS.finance),raw);
  s.localStorage.setItem=setter;s.fin.importBackup({contents:JSON.stringify(valid())});assert.equal(s.fin.blocked,false);assert.equal(s.fin.state.transactions[0].id,'keep');assert.equal(s.storage.get('uitgavenkompas_auto_backup_v1'),raw);s.MementoStorageGuard.close();
 });
 await test('cancelled recovery leaves byte-identical storage and memory',async()=>{const s=await tab(new Map([[Guard.KEYS.finance,JSON.stringify(valid())]]));const before=clone([...s.storage]),memory=clone(s.fin.state);s.confirm=()=>false;s.FileReader=class{readAsText(f){this.result=f.contents;this.onload();}};s.fin.importBackup({contents:JSON.stringify({...valid(),transactions:[]})});assert.deepEqual([...s.storage],before);assert.deepEqual(clone(s.fin.state),memory);s.MementoStorageGuard.close();});
 console.log(count+' financial boundary checks passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
