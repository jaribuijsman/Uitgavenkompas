'use strict';
// Quick notes now belong to Mijn dag. Keep their safety contracts out of Fitness.
const assert=require('node:assert/strict');
module.exports=async function checkQuickNote(page){
 const go=async view=>{
  if(view==='today')await page.locator('#mementoQuickNav [data-memento-dest="life:today"]').click();
  else{await page.locator('[data-memento-menu="open"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:'+view+'"]').click();}
 };
 const life=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));
 await go('today');
 const finance=await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1'));
 await page.locator('[data-life-quick-kind="note"]').click();
 await page.locator('[data-life-quick-options]').click();await page.locator('#lifeQuickCollection').selectOption('inbox');await page.locator('#lifeDialog [data-life-close]').last().click();
 await page.evaluate(()=>{
  window.SpeechRecognition=window.webkitSpeechRecognition=class{
   start(){this.onstart?.();this.onresult?.({resultIndex:0,results:[Object.assign([{transcript:'Herinner me aan de afspraak'}],{isFinal:true})]});}
   stop(){this.onend?.();}
  };
 });
 const field=page.locator('#lifeQuickTitle'),submit=page.locator('#lifeQuickForm [type=submit]');
 const before=await life();await field.fill('Fictieve startnotitie');await page.locator('#mementoVoiceButton').click();
 assert.equal(await field.inputValue(),'Fictieve startnotitie Herinner me aan de afspraak');
 await page.locator('#mementoVoiceButton').click();assert.deepEqual(await life(),before,'Dictation must not write before confirmation');
 await submit.click();const body='Fictieve startnotitie Herinner me aan de afspraak';
 const matching=(await life()).notes.filter(n=>n.body===body);assert.equal(matching.length,1);assert.equal(matching[0].collectionId,'inbox');assert.equal(await field.inputValue(),'');
 await field.fill('Fictief concept bij opslagfout');const beforeQuota=await life();
 await page.evaluate(()=>{window.__quickNoteSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='compass_life_preview_v1')throw Error('Simulated quota');return window.__quickNoteSetItem.call(this,k,v)};});
 try{await submit.click();assert.equal(await field.inputValue(),'Fictief concept bij opslagfout');assert.deepEqual(await life(),beforeQuota,'Rejected write must preserve all stored Life data');}
 finally{await page.evaluate(()=>{Storage.prototype.setItem=window.__quickNoteSetItem;delete window.__quickNoteSetItem});}
 await submit.click();assert.equal((await life()).notes.filter(n=>n.body==='Fictief concept bij opslagfout').length,1,'Explicit retry saves exactly once');
 await go('notes');await page.locator('[data-action=inbox]').first().click();await page.locator('[data-note-edit="'+matching[0].id+'"]').click();
 assert.equal(await page.locator('#kc-body').inputValue(),body);
 const count=(await life()).notes.length;await page.locator('#kc-body').fill(body+' en verder uitwerken');await page.locator('[data-kc="save"]').click();
 await page.waitForFunction(({id,body})=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).notes.find(n=>n.id===id)?.body===body,{id:matching[0].id,body:body+' en verder uitwerken'});
 assert.equal((await life()).notes.length,count,'Editing keeps the saved note identity');
 await page.reload();await require('./enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
 assert.equal((await life()).notes.find(n=>n.id===matching[0].id).body,body+' en verder uitwerken');assert.equal(await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1')),finance);
 console.log('PASS Mijn dag quick note: confirmed dictation, quota draft/retry, Inbox editor identity and restart; finance unchanged');
};
