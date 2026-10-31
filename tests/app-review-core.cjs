'use strict';
const assert=require('node:assert/strict'),C=require('../assets/memento-review-core.js');
let n=0;function test(name,fn){fn();n++;console.log('PASS',name)}
const tx=(type,amount,account='personal',extra={})=>({id:String(Math.random()),type,amount,account,date:'2026-10-29',category:'Boodschappen',...extra});
const calc=(ts,ids=['personal','creditcard'])=>C.finance(ts,'2026-10-01','2026-10-31',ids,t=>t.splits||[{category:t.category,amount:t.amount}]);
test('real expenses and boundary transfers have separate amounts',()=>{const x=calc([tx('income',3000),tx('expense',100),tx('transfer',200,'personal',{transferToAccount:'joint'})]);assert.equal(x.income,3000);assert.equal(x.expenses,100);assert.equal(x.transferOut,200);assert.equal(x.net,2700);assert.equal(x.result,2900);assert.deepEqual(x.cats,[['Boodschappen',100]])});
test('joint received amount of 900 remains visible without calling transfer salary',()=>{const x=calc([tx('income',400,'joint'),tx('transfer',500,'personal',{transferToAccount:'joint'}),tx('expense',215.17,'joint')],['joint']);assert.equal(x.received,900);assert.equal(x.income,400);assert.equal(x.transferIn,500);assert.equal(x.net,684.83)});
test('creditcard purchase counts once and internal repayment counts zero',()=>{const x=calc([tx('expense',32.34,'creditcard'),tx('transfer',32.34,'personal',{transferToAccount:'creditcard'})]);assert.equal(x.expenses,32.34);assert.equal(x.transferOut,0);assert.equal(x.net,-32.34)});
test('refunds and split categories reconcile to net expenses in cents',()=>{const x=calc([tx('expense',10.3,'personal',{splits:[{category:'A',amount:5.15},{category:'B',amount:5.15}]}),tx('refund',.2,'personal',{category:'A'})]);assert.equal(x.expenses,10.1);assert.equal(x.cats.reduce((n,x)=>n+Math.round(x[1]*100),0),1010)});
test('date scope, old metadata and the original array are untouched',()=>{const rows=[tx('expense',2,'personal',{date:'2026-09-30',legacy:{id:'keep'}}),tx('expense',3,'joint'),tx('expense',4)];const before=JSON.stringify(rows),x=calc(rows);assert.equal(x.expenses,4);assert.equal(JSON.stringify(rows),before)});
test('zero is zero rather than fabricated data',()=>{const x=calc([]);assert.equal(x.net,0);assert.equal(x.expenses,0);assert.deepEqual(x.cats,[])});
for(const [text,expected]of [['2',2],['1,5',1.5],['1/2',.5],['1 1/2',1.5],['',null],['naar smaak',null],['1/0',null],['2–3',null]])test('quantity '+JSON.stringify(text),()=>assert.equal(C.quantity(text),expected));
test('scale never changes an unknown amount or its unit',()=>{assert.equal(C.scale('naar smaak',2),'naar smaak');assert.equal(C.scale('1/2',2),'1');assert.equal(C.scale('1,5',2),'3')});
test('saved task selections accept optional metadata',()=>{assert(C.validFilters({taskFilters:[{id:'one',name:'Huishouden',filters:{search:'',taskScope:'household',categoryFilter:'all',roomFilter:'all',repeatFilter:'all',taskSort:'date',taskTab:'open'}}]}));assert(C.validFilters({}))});
test('invalid or duplicate saved selections are rejected before import',()=>{assert.throws(()=>C.validFilters(null));assert.throws(()=>C.validFilters({taskFilters:[{id:'bad'}]}));assert.throws(()=>C.validFilters({taskFilters:Array(13).fill({})}))});

// Structural guard: extracted navigation scripts execute at their original
// synchronous positions, and the offline precache includes both exact URLs.
test('navigation modules stay ordered, synchronous and offline-cacheable',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const modules=[
  ['mementoUnifiedNavScript','assets/memento-unified-nav.js','20261031-extract-v1'],
  ['mementoTabLayout','assets/memento-tab-layout.js','20261031-extract-v1']
 ];
 const offsets=[];
 for(const [id,file,version] of modules){
  const url='./'+file+'?v='+version,tag='<script id="'+id+'" src="'+url+'"></script>';
  assert.equal(html.split(tag).length-1,1,id+' must load exactly once without async/defer');
  assert.equal(sw.split('"'+url+'"').length-1,1,file+' must be in service worker precache');
  const source=fs.readFileSync(path.join(root,file),'utf8');
  new vm.Script(source,{filename:file});
  offsets.push(html.indexOf(tag));
 }
 assert(offsets[0]<offsets[1],'menu navigation must initialize before tab layout');
 assert(html.indexOf('id="mementoQuickNav"')<offsets[0],'navigation DOM must exist before initialization');
 assert(!html.includes('<script id="mementoUnifiedNavScript">'));
 assert(!html.includes('<script id="mementoTabLayout">'));
});
console.log(n+' app review core checks passed.');
