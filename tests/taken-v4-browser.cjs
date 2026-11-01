"use strict";
// All records live in a fresh local Chromium profile served from localhost.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),{fixture}=require('./helpers/visual-fixture.cjs'),enter=require('./helpers/enter-app.cjs');
const baseline=process.env.MEMENTO_TAKEN_BASELINE_ROOT,root=baseline||path.resolve(__dirname,'..'),out='/tmp/memento-taken-v4/'+(baseline?'before':'after');
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname;if(name==='/__seed__'){res.end('<title>Isolated fixture</title>');return}const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
const key='compass_life_preview_v1',errors=[],evidence=[];
let browser,url;
async function nav(page,view){
 if(page.viewportSize().width>800){if(await page.evaluate(()=>document.body.dataset.compassArea)!=='life')await page.locator('#compassAreaBar [data-compass-area="life"]').click();await page.locator('#lifeNavigation [data-life-view="'+view+'"]').click();return}
 await page.locator('[data-memento-menu="open"]').click();if(await page.evaluate(()=>document.body.dataset.compassArea)!=='life')await page.locator('[data-memento-switch="life"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:'+view+'"]').click();
}
async function openEditor(page,id='v4-routine'){await page.locator('[data-order-id="'+id+'"] .life-task-menu summary').click();await page.locator('[data-life-edit-task="'+id+'"]').click();await page.locator('#lifeTaskForm[data-mg-ready]').waitFor()}
async function geometry(page,label){
 const box=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth,first:document.querySelector('#lifeTaskResults .life-task')?.getBoundingClientRect().toJSON(),menu:document.querySelector('.life-task-menu[open] .life-task-actions')?.getBoundingClientRect().toJSON(),footer:document.querySelector('#lifeDialog:not([hidden]) .life-dialog-footer')?.getBoundingClientRect().toJSON()}));
 assert(box.scroll<=box.width+1,label+' document overflow');
 if(box.footer){assert(box.footer.bottom<=box.height+1,label+' unreachable footer');assert(box.footer.top>=0,label+' clipped footer')}
 if(box.menu){assert(box.menu.left>=0&&box.menu.right<=box.width+1,label+' clipped menu');assert(box.menu.top>=0&&box.menu.bottom<=box.height+1,label+' unreachable menu')}
 evidence.push({label,...box});
}
async function launchFixture(width,count=43){
 const data=await fixture(),base=structuredClone(data.life.tasks.find(t=>t.id==='kitchen'));
 data.life.tasks=Array.from({length:count},(_,i)=>({...structuredClone(base),id:i===0?'v4-routine':'v4-'+i,title:i===0?'Kattenbak schoonmaken — lange titel om afbreken op mobiel te controleren':'Geïsoleerde testtaak '+i,category:i<3?'Huishouden':i%2?'Werk':'Persoonlijk',repeat:i===0?'custom':'none',repeatDays:4,kind:i===0?'routine':'task',date:'2026-11-01',priority:i===0,notes:'Bewaar deze notitie',sourceLabel:'Testbron',extra:{preserve:true},steps:i===0?[{text:'Voorbereiden',done:true,custom:'a'},{text:'Uitvoeren',done:false},{text:'Voorbereiden',done:false,custom:'b'}]:[],history:i===0?[{date:'2026-10-28',legacy:true}]:[]}));
 const context=await browser.newContext({viewport:{width,height:852},hasTouch:true,locale:'nl-NL',timezoneId:'Europe/Amsterdam',reducedMotion:'reduce'});
 await context.route('https://**/*',r=>r.abort());
 await context.addInitScript(()=>{const NativeDate=Date,fixed=NativeDate.parse('2026-11-01T12:00:00+01:00');window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[fixed+performance.now()]))}static now(){return fixed+performance.now()}}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(url+'/__seed__');await page.evaluate(({data,key})=>{localStorage.setItem(key,JSON.stringify(data.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(data.pin))},{data,key});
 await page.evaluate(async files=>{const db=await new Promise((ok,bad)=>{const r=indexedDB.open('memento_knowledge_files_v1',1);r.onupgradeneeded=()=>{const store=r.result.createObjectStore('files',{keyPath:'id'});store.createIndex('noteId','noteId',{unique:false})};r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)});await new Promise((ok,bad)=>{const tx=db.transaction('files','readwrite');tx.oncomplete=ok;tx.onerror=()=>bad(tx.error);for(const {base64,...meta} of files)tx.objectStore('files').put({...meta,blob:new Blob([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],{type:meta.type})})});db.close()},data.files);
 await page.goto(url,{waitUntil:'domcontentloaded'});await enter(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await nav(page,'tasks');
 return {page,context};
}
async function life(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key)}
(async()=>{try{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));url='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [360,393,412,1280]){
  const {page,context}=await launchFixture(width);
  assert.equal(await page.locator('#lifeTaskResults .life-task').count(),43);
  await geometry(page,width+' list');await page.screenshot({path:out+'/'+width+'-list.png'});
  await page.locator('[data-order-id="v4-routine"] .life-task-menu summary').click();await page.waitForFunction(()=>document.querySelector('.life-task-menu[open] .life-task-actions')?.style.left);await geometry(page,width+' menu');await page.screenshot({path:out+'/'+width+'-menu.png'});
  await page.locator('[data-life-edit-task="v4-routine"]').click();await page.locator('#lifeTaskForm[data-mg-ready]').waitFor();
  await geometry(page,width+' editor');await page.screenshot({path:out+'/'+width+'-editor.png'});
  if(!baseline){
   assert.equal(await page.locator('#lifeTaskTimer').count(),1);
   const controls=await page.locator('.memento-step-order button').evaluateAll(nodes=>nodes.map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));
   assert(controls.every(c=>c.width>=44&&c.height>=44),'Step touch targets');
   await page.setViewportSize({width,height:480});await page.locator('#lifeTaskEstimate').focus();await page.waitForFunction(()=>{const input=document.querySelector('#lifeTaskEstimate').getBoundingClientRect(),body=document.querySelector('.life-dialog-body').getBoundingClientRect(),footer=document.querySelector('.life-dialog-footer').getBoundingClientRect();return footer.bottom<=innerHeight+1&&input.top>=body.top&&input.bottom<=body.bottom+1});await geometry(page,width+' keyboard-height');await page.screenshot({path:out+'/'+width+'-short.png'});
  }
  await context.close();
 }
 if(baseline)return;
 const {page,context}=await launchFixture(393),getTask=async()=> (await life(page)).tasks.find(t=>t.id==='v4-routine');
 assert.equal((await getTask()).planning,undefined,'No invented estimates');
 assert.equal(await page.locator('.memento-task-category').count(),3);
 assert.equal(await page.locator('#lifeTaskResults [data-task-timer]').count(),0,'No card timers');
 await page.locator('#lifeSearch').fill('Kattenbak');assert.equal(await page.locator('#lifeTaskResults .life-task').count(),1);await page.locator('#lifeSearch').fill('');
 await openEditor(page);await page.locator('#lifeTaskEstimate').fill('12');
 await page.locator('[data-task-step-move="2"][data-direction="-1"]').click();await page.locator('[form="lifeTaskForm"]').click();
 let task=await getTask();assert.equal(task.planning.estimateMinutes,12);assert.deepEqual(task.steps.map(s=>[s.text,s.done,s.custom]),[['Voorbereiden',true,'a'],['Voorbereiden',false,'b'],['Uitvoeren',false,undefined]]);assert(task.extra.preserve);
 await openEditor(page);await page.locator('.memento-task-timer summary').click();await page.locator('[data-task-timer="start"]').click();await page.waitForTimeout(1100);await page.locator('[data-task-timer="pause"]').click();assert((await getTask()).timing.session.activeSeconds>=1);
 await page.locator('[data-task-timer="resume"]').click();await page.locator('[data-task-timer="stop"]').click();await page.locator('#lifeMeasuredMinutes').fill('12');await page.locator('[data-task-timer="confirm"]').scrollIntoViewIfNeeded();await geometry(page,'393 timer review');await page.screenshot({path:out+'/393-timer-review.png'});await page.locator('[data-task-timer="confirm"]').click();
 assert.equal((await getTask()).timing.measurements.length,1);assert.equal((await getTask()).done,false);await page.locator('[form="lifeTaskForm"]').click();
 task=await getTask();const measured=structuredClone(task.timing.measurements),oldOccurrence=task.timing.occurrenceId;assert.equal(task.planning.estimateSource,'measurement');
 // A second session is independent and background time is not silently counted.
 await openEditor(page);await page.locator('.memento-task-timer summary').click();await page.locator('[data-task-timer="start"]').click();
 await page.evaluate(()=>document.dispatchEvent(new Event('freeze')));assert.equal((await getTask()).timing.session.status,'needsReview');
 await page.reload({waitUntil:'domcontentloaded'});await enter(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await nav(page,'tasks');await openEditor(page);await page.locator('.memento-task-timer summary').click();assert(await page.locator('#lifeMeasuredMinutes').isVisible());
 await page.locator('#lifeMeasuredMinutes').fill('2');await page.locator('[data-task-timer="confirm"]').click();await page.locator('[form="lifeTaskForm"]').click();
 task=await getTask();assert.equal(task.timing.measurements.length,2);assert.equal(task.timing.measurements[0].occurrenceId,task.timing.measurements[1].occurrenceId);
 // A failed measurement commit must keep both stored history and the editor.
 await openEditor(page);await page.locator('.memento-task-timer summary').click();await page.locator('[data-task-timer="start"]').click();await page.locator('[data-task-timer="stop"]').click();await page.locator('#lifeMeasuredMinutes').fill('3');
 const beforeFailure=await life(page);
 await page.evaluate(k=>{const native=Storage.prototype.setItem;let fail=true;window.__restoreV4Storage=()=>{Storage.prototype.setItem=native};Storage.prototype.setItem=function(key,value){if(key===k&&fail){fail=false;throw new DOMException('Isolated quota failure','QuotaExceededError')}return native.call(this,key,value)}},key);
 await page.locator('[data-task-timer="confirm"]').click();assert.deepEqual(await life(page),beforeFailure);assert.equal(await page.locator('#lifeMeasuredMinutes').inputValue(),'3');
 await page.evaluate(()=>window.__restoreV4Storage());await page.locator('[data-task-timer="confirm"]').click();assert.equal((await getTask()).timing.measurements.length,3);await page.locator('[form="lifeTaskForm"]').click();
 // Declining the estimate must still save the confirmed measurement separately.
 await openEditor(page);await page.locator('.memento-task-timer summary').click();await page.locator('[data-task-timer="start"]').click();await page.locator('[data-task-timer="stop"]').click();await page.locator('#lifeMeasuredMinutes').fill('8');
 page.removeAllListeners('dialog');page.on('dialog',d=>d.message().includes('gebruiken als geschatte duur')?d.dismiss():d.accept());
 await page.locator('[data-task-timer="confirm"]').click();assert.equal((await getTask()).timing.measurements.length,4);assert.equal(await page.locator('#lifeTaskEstimate').inputValue(),'3');await page.locator('[form="lifeTaskForm"]').click();assert.equal((await getTask()).planning.estimateMinutes,3);
 // Existing ZIP format preserves every new field and the original binary file.
 const zip=await page.evaluate(async k=>{const life=JSON.parse(localStorage.getItem(k)),finance=JSON.parse(localStorage.getItem('uitgavenkompas_v1'));const archive=await window.MementoCompleteBackup.createArchive({life,finance},window.MementoKnowledgeStore);const restored=await window.MementoCompleteBackup.prepareArchive(archive.blob,window.MementoKnowledgeStore);return {life:restored.life,files:restored.manifest.files}},key);
 assert.deepEqual(zip.life,await life(page));assert(zip.files.length>0);
 const savedJSON=await life(page);await nav(page,'backup');
 const invalidJSON=structuredClone(savedJSON);invalidJSON.tasks.find(t=>t.id==='v4-routine').planning.estimateMinutes=0;
 await page.locator('#lifeImportFile').setInputFiles({name:'invalid-v4.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'compass-life-backup',version:1,lifeState:invalidJSON}))});await page.waitForFunction(()=>document.querySelector('#lifeMessage').textContent.includes('Ongeldige geschatte taakduur'));assert.deepEqual(await life(page),savedJSON);
 await page.locator('#lifeImportFile').setInputFiles({name:'isolated-v4.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'compass-life-backup',version:1,lifeState:savedJSON}))});await page.waitForFunction(()=>document.querySelector('#lifeMessage').textContent.includes('Back-up hersteld'));assert.deepEqual(await life(page),savedJSON);await nav(page,'tasks');
 await page.locator('[data-life-complete="v4-routine"]').click();task=await getTask();assert.equal(task.date,'2026-11-05');assert.equal(task.id,'v4-routine');assert.equal(task.done,false);assert.equal(task.history.length,2);assert.equal(task.history[0].legacy,true);assert.equal(task.history[1].occurrenceId,oldOccurrence);assert.notEqual(task.timing.occurrenceId,oldOccurrence);assert(task.steps.every(s=>!s.done));assert.deepEqual(task.timing.measurements[0],measured[0]);assert.equal(task.planning.estimateMinutes,3);
 // Undo restores the exact original occurrence, including its confirmed sessions.
 await page.locator('[data-life-action="undo"]').click();assert.equal((await getTask()).timing.occurrenceId,oldOccurrence);
 await openEditor(page);await page.locator('#lifeTaskEstimate').fill('');await page.locator('[form="lifeTaskForm"]').click();assert.equal((await getTask()).planning.estimateMinutes,null);
 // Duplicate uses a new task ID and carries no personal timing.
 await page.locator('[data-order-id="v4-routine"] .life-task-menu summary').click();await page.locator('[data-life-duplicate="v4-routine"]').click();const copy=(await life(page)).tasks.find(t=>t.title.endsWith('(kopie)'));assert(copy);assert.equal(copy.timing,undefined);assert.deepEqual(copy.history,[]);
 // Existing day route still uses existing dates and task rows, without duration.
 await nav(page,'today');assert.equal(await page.locator('#lifeApp [data-task-timer]').count(),0);assert(!await page.locator('#lifeApp').textContent().then(s=>s.includes('min geschat')));
 await nav(page,'agenda');await geometry(page,'agenda unchanged');await context.close();
 for(const count of [0,1]){const f=await launchFixture(393,count);assert.equal(await f.page.locator('#lifeTaskResults .life-task').count(),count);await geometry(f.page,count+' tasks');await f.page.screenshot({path:out+'/'+count+'-tasks.png'});await f.context.close()}
 assert.deepEqual(errors,[]);console.log('PASS Taken v4: categories, editor, steps, estimates, sessions, restart, repeat, undo, copy, Mijn dag and mobile geometry');
 }finally{fs.writeFileSync(out+'/geometry.json',JSON.stringify(evidence,null,2));await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
