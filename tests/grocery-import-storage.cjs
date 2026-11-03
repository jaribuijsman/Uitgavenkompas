'use strict';
const assert=require('node:assert/strict'),{tab,emptyLife,locks}=require('./helpers/storage-fixture.cjs'),C=require('../assets/memento-grocery-import.js');
const clone=v=>JSON.parse(JSON.stringify(v)),KEY='compass_life_preview_v1';
(async()=>{
 const ordinary={id:'ordinary-tomato',title:'Tomaat',quantity:'6',category:'Eigen categorie',list:'groceries',favorite:true,needed:true,bought:false,deletedAt:'',notes:'Bewaar dit merk'};
 const items=C.makeItems({id:'batch',title:'Fictieve maaltijd',sourceUrl:'',rows:C.parse('2 Tomaat\nZout naar smaak').map(r=>({...r,category:'Groente & fruit'}))},(()=>{let n=0;return()=>`recipe-${++n}`})());
 const initial={...emptyLife(),groceries:[ordinary,...items]},storage=new Map([[KEY,JSON.stringify(initial)]]),s=await tab(storage,locks());
 assert.equal(s.life.blocked,false);assert.equal(s.life.save(),true);assert.deepEqual(clone(s.life.validate(clone(initial)).groceries),initial.groceries);
 for(const view of ['saved','favorites','trash']){s.life.groceryTab=view;assert.deepEqual(clone(s.life.shoppingItems()),[ordinary]);}
 s.life.groceryTab='list';assert.equal(s.life.shoppingItems().length,3);
 assert.equal(s.life.changeShoppingItem(items[0].id,'favorite'),false);assert.equal(s.life.changeShoppingItem(items[0].id,'move'),false);
 assert.equal(s.life.changeShoppingItem(items[0].id,'bought',true),true);assert.equal(s.life.state.groceries.length,2);assert.deepEqual(clone(s.life.state.groceries[0]),ordinary);assert(!JSON.parse(storage.get(KEY)).groceries.some(g=>g.id===items[0].id));
 // The real click handler restores the last transaction, and later writes invalidate it.
 const click=dataset=>s.get('lifeApp').listeners.click[0]({target:{closest:selector=>selector==='[data-shopping-import]'?null:{dataset}}});
 click({lifeAction:'undo'});assert.equal(s.life.state.groceries.length,3);
 const before=storage.get(KEY),setItem=s.localStorage.setItem;s.localStorage.setItem=(key,value)=>{if(key===KEY)throw Error('Storage unavailable fixture');return setItem(key,value)};
 assert.equal(s.life.changeShoppingItem(items[0].id,'bought',true),false);assert.equal(storage.get(KEY),before);assert.equal(s.life.state.groceries.length,3);s.localStorage.setItem=setItem;
 assert.equal(s.life.changeShoppingItem(items[0].id,'bought',true),true);
 assert.equal(s.life.mutate(()=>{s.life.state.groceries[0].quantity='7'}),true);click({lifeAction:'undo'});assert.equal(s.life.state.groceries[0].quantity,'7');assert.equal(s.life.state.groceries.length,2);
 const reloaded=await tab(new Map([[KEY,storage.get(KEY)]]),locks());assert.equal(reloaded.life.blocked,false);assert.equal(reloaded.life.state.groceries[1].category,'Groente & fruit');
 const bad=clone(initial);bad.groceries[1].favorite=true;assert.throws(()=>s.life.validate(bad));
 console.log('PASS one-off reload/backup validation, catalogue exclusion, ordinary product independence, real checkbox, failed save rollback and undo invalidation');
})().catch(e=>{console.error(e);process.exitCode=1});
