/* Real baseline -> current worker -> offline upgrade, including binary attachments.
 * Select an immutable snapshot with MEMENTO_RECOVERY_BASELINE_ROOT, never a user profile. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const current=path.resolve(__dirname,'..'),baseline=process.env.MEMENTO_RECOVERY_BASELINE_ROOT,out=process.env.MEMENTO_RECOVERY_UPGRADE_OUT||'/tmp/memento-recovery-upgrade';
if(!baseline)throw Error('MEMENTO_RECOVERY_BASELINE_ROOT must select the original main snapshot');
let source=current;const report={baseline:process.env.MEMENTO_RECOVERY_BASELINE_SHA||'bf81413d6dc35fc097deeeb61c3eb09acf11834e',journeys:[],upgrade:null,failure:null};fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 if(name==='/__seed__'){res.end('<!doctype html><title>Isolated journey fixture</title>');return;}
 const file=path.resolve(source,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(source+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
async function seed(page,data,url){
 await page.goto(url+'/__seed__');await page.evaluate(async d=>{
  localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(d.pin));
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('memento_knowledge_files_v1',1);r.onupgradeneeded=()=>{const st=r.result.createObjectStore('files',{keyPath:'id'});st.createIndex('noteId','noteId',{unique:false});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);for(const {base64,...meta} of d.files)tx.objectStore('files').put({...meta,blob:new Blob([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],{type:meta.type})});});db.close();
 },data);await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable);if(await page.locator('#ms-continue').isVisible())await page.locator('#ms-continue').click();
}
(async()=>{let browser;
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const url='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
  const data=await require('./helpers/visual-fixture.cjs').fixture();data.life.notes.find(n=>n.id==='visual-note').body+='\n\n'+('Bewaarde achtergrond. '.repeat(100))+'JourneyInhoudUniek midden in de inhoud.';
  // The previous main must preserve these optional fields as well. The exact
  // Life JSON, attachments and PIN are compared again after the offline upgrade.
  const timedTask=data.life.tasks.find(t=>t.id==='kitchen');
  timedTask.planning={schemaVersion:1,estimateMinutes:12};
  timedTask.timing={schemaVersion:1,occurrenceId:'upgrade-current',measurements:[{id:'upgrade-measurement',taskId:timedTask.id,occurrenceId:'upgrade-previous',source:'timer',activeSeconds:720,confirmedAt:'2026-10-27T10:00:00.000Z',needsReview:false}],session:{id:'upgrade-review',occurrenceId:'upgrade-current',status:'needsReview',activeSeconds:30}};
  async function context(){const c=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,reducedMotion:'reduce',locale:'nl-NL',timezoneId:'Europe/Amsterdam'});await c.route('https://**/*',r=>r.abort());await c.addInitScript(()=>{const D=Date,t=Date.parse('2026-10-28T12:00:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});return c;}
  async function openNotes(){
   const fixed=page.locator('#mementoQuickNav [data-memento-dest="life:notes"]');
   if(await fixed.count())await fixed.click();
   else {await page.locator('#mementoQuickNav [data-memento-menu="open"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:notes"]').click();}
   assert.equal(await page.locator('#lifeApp').getAttribute('data-life-view'),'notes','Knowledge remains reachable via the active navigation');
  }
  // Same origin and profile, real service workers and IndexedDB; source switches only on the local test server.
  source=baseline;const ctx=await context();let page=await ctx.newPage();page.on('dialog',d=>d.accept());await seed(page,data,url);
  const upgradeTrace=async label=>{report.upgradeTrace??=[];report.upgradeTrace.push(await page.evaluate(async label=>({label,core:typeof window.MementoFitnessCore,duty:typeof window.MementoFitnessCore?.duty,scripts:[...document.scripts].filter(s=>s.src.includes('fitness')).map(s=>s.src),caches:await Promise.all((await caches.keys()).map(async name=>{const c=await caches.open(name),html=await c.match(location.href);return {name,htmlFitness:html?(await html.text()).match(/memento-fitness-core\.js[^"<]*/)?.[0]:null,assets:(await c.keys()).filter(r=>r.url.includes('fitness-core')).map(r=>r.url)};}))}),label));};
  await openNotes();await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload({waitUntil:'domcontentloaded'});if(await page.locator('#ms-continue').isVisible())await page.locator('#ms-continue').click();await page.waitForFunction(async()=>{const r=await navigator.serviceWorker.getRegistration();return window.MementoStorageGuard?.writable&&r?.active?.state==='activated'&&!r.installing&&!r.waiting&&navigator.serviceWorker.controller===r.active;});
  const before=await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')}));
  // Keep a legacy same-origin cache ahead of the new release in CacheStorage order.
  // An offline navigation must not use another cache's HTML or its old script URLs.
  await page.evaluate(async html=>{const legacy=await caches.open('uitgavenkompas-legacy-document');for(const p of ['./','./index.html'])await legacy.put(new URL(p,location.href),new Response(html,{headers:{'Content-Type':'text/html'}}));},fs.readFileSync(path.join(baseline,'index.html'),'utf8'));
  // Finish baseline document requests before switching server content; otherwise the
  // old worker can recreate its cache with an in-flight write after activation.
  await page.waitForLoadState('networkidle');
  const previousWorker=ctx.serviceWorkers()[0];assert(previousWorker,'Baseline worker is running');
  const previousWorkerClosed=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Baseline worker did not finish its in-flight work')),30000);previousWorker.once('close',()=>{clearTimeout(timer);resolve()})});
  source=current;await page.evaluate(async()=>{window.__previousMementoController=navigator.serviceWorker.controller;await(await navigator.serviceWorker.getRegistration()).update();});const worker=fs.readFileSync(path.join(current,'sw.js'),'utf8'),cache=worker.match(/const CACHE = "([^"]+)"/)[1],required=JSON.parse(worker.match(/const CORE = (\[.*?\]);/)[1]);
  // Opening a new cache precedes addAll/activation. Wait for the actual worker takeover,
  // not just a cache directory, before assessing an offline upgrade.
  await page.waitForFunction(async({name,required})=>{const r=await navigator.serviceWorker.getRegistration();if(r?.active?.state!=='activated'||r.installing||r.waiting||navigator.serviceWorker.controller!==r.active||navigator.serviceWorker.controller===window.__previousMementoController)return false;const c=await caches.open(name);return(await Promise.all(required.map(p=>c.match(new URL(p,location.href))))).every(Boolean);},{name:cache,required});await previousWorkerClosed;await page.reload({waitUntil:'domcontentloaded'});if(await page.locator('#ms-continue').isVisible())await page.locator('#ms-continue').click();await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoFitnessCore?.duty);await upgradeTrace('online-new-worker');report.workersOnline=await Promise.all(ctx.serviceWorkers().map(w=>w.evaluate(()=>CACHE).catch(e=>String(e))));
  await ctx.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});if(await page.locator('#ms-continue').isVisible())await page.locator('#ms-continue').click();await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoFitnessCore?.duty);await openNotes();
  // Enter the actual note workspace before asserting its additive migration.
  await page.evaluate(()=>window.MementoKnowledge.showNote('visual-note'));
  await page.locator('#mementoQuickNav [data-memento-dest="life:tasks"]').click();
  await openNotes();
  await page.waitForFunction(()=>window.MementoKnowledgeBridge.read().knowledge?.workspace?.version===2);
  await upgradeTrace('offline');report.workersOffline=await Promise.all(ctx.serviceWorkers().map(w=>w.evaluate(()=>CACHE).catch(e=>String(e))));const after=await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')}));
  // V2 adds a workspace to Knowledge metadata. Compare the original user-owned payload,
  // not its serialized byte string: additive migrations must not erase or alter any
  // existing record, ID, note text, optional task/fitness fields, PIN or finance data.
  assert.equal(after.finance,before.finance,'Finances must be byte-identical');
  assert.equal(after.pin,before.pin,'PIN configuration must remain unchanged');
  const originalLife=JSON.parse(before.life),upgradedLife=JSON.parse(after.life);
  for(const [key,value] of Object.entries(originalLife))if(key!=='knowledge')assert.deepEqual(upgradedLife[key],value,'Existing Life domain changed: '+key);
  assert.equal(upgradedLife.knowledge?.workspace?.version,2,'V2 workspace was not safely activated');
  for(const original of originalLife.knowledge?.collections||[]){const updated=upgradedLife.knowledge.collections.find(c=>c.id===original.id);assert(updated,'Existing collection ID lost: '+original.id);for(const [key,value] of Object.entries(original))if(key!=='parentId'&&key!=='order')assert.deepEqual(updated[key],value,'Existing collection field changed: '+original.id+'/'+key);}
  assert.deepEqual(upgradedLife.notes.map(n=>n.id),originalLife.notes.map(n=>n.id),'Original note identity/order changed');
  assert.equal(await page.evaluate(()=>window.MementoFitnessCore.duty('2026-10-28').code),'O');assert.equal(await page.locator('#pinLock').isVisible(),false);
  const binary=await page.evaluate(async id=>{const r=await window.MementoKnowledgeStore.get(id);return await window.MementoKnowledgeStore.sha256(r.blob);},data.files[0].id);assert.equal(binary,data.files[0].hash);
  const keys=await page.evaluate(()=>caches.keys());assert(keys.includes(cache));const oldCache=fs.readFileSync(path.join(baseline,'sw.js'),'utf8').match(/const CACHE = "([^"]+)"/)[1];
  // An old worker may finish an in-flight cache write after activation (see sw.js).
  // Prove the safety contract even when that obsolete cache reappears: poison its
  // document and a shared script URL, then really reload while offline.
  await page.evaluate(async({oldCache,required})=>{const c=await caches.open(oldCache);for(const p of ['./','./index.html'])await c.put(new URL(p,location.href),new Response('<!doctype html><script>window.__obsoleteDocumentUsed=true</script><h1>Obsolete fixture</h1>',{headers:{'Content-Type':'text/html'}}));const asset=required.find(p=>p.startsWith('./assets/memento-fitness-core.js?'));await c.put(new URL(asset,location.href),new Response('window.__obsoleteAssetUsed=true;throw Error("Obsolete asset fixture")',{headers:{'Content-Type':'application/javascript'}}));},{oldCache,required});
  await page.close();page=await ctx.newPage();await page.goto(url,{waitUntil:'domcontentloaded'});if(await page.locator('#ms-continue').isVisible())await page.locator('#ms-continue').click();await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoFitnessCore?.duty);
  assert.equal(await page.evaluate(()=>typeof window.MementoAppointmentRecurrence?.forDay),'function','New appointment helper is actually available offline');
  assert.equal(await page.locator('script[src*="memento-life-app.js"]').getAttribute('src'),required.find(p=>p.startsWith('./assets/memento-life-app.js?')),'The fresh offline document loads this release entrypoint');
  assert.equal(await page.evaluate(()=>Boolean(window.__obsoleteDocumentUsed||window.__obsoleteAssetUsed)),false,'Offline fresh document ignores poisoned old documents and shared asset URLs');
  assert.deepEqual(await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')})),after,'Negative cache fresh document preserves exact migrated data');
  await page.screenshot({path:path.join(out,'upgraded-offline.jpg'),type:'jpeg',quality:72,animations:'disabled'});
  report.upgrade={passed:true,currentCache:cache,protectedExistingData:true,additiveWorkspace:true,pinUnchanged:true,attachmentHash:binary,oldCacheRemoved:!keys.includes(oldCache),legacyCacheIgnored:true,resurrectedPoisonedCacheIgnored:true};  const assets=await page.evaluate(async({paths,name})=>{
   const currentCache=await caches.open(name);
   const entry=name=>paths.find(p=>p.startsWith('./assets/'+name+'?'));
   const cached=async name=>{const p=entry(name);return !!p&&Boolean(await currentCache.match(new URL(p,location.href)));};
   return {financeValidator:typeof window.MementoFinanceValidation?.validate,
    disclosure:typeof window.MementoDisclosure?.fold,
    touch:getComputedStyle(document.documentElement).getPropertyValue('--m-touch').trim(),
    tokens:await cached('memento-tokens.css'),
    nightCss:await cached('memento-superdark.css'),
    helper:await cached('memento-disclosure.js')};
  },{paths:required,name:cache});
  assert.equal(assets.financeValidator,'function');report.upgrade.financeValidationAvailableOffline=true;assert.equal(assets.disclosure,'function');assert.equal(assets.touch,'48px');assert(assets.tokens&&assets.nightCss&&assets.helper,'All current release styles and disclosure helpers are available offline');report.upgrade.newAssetsAvailableOffline=true;
  await ctx.close();console.log(JSON.stringify(report,null,2));
 }catch(e){report.failure=String(e);console.error(e);process.exitCode=1;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();server.close();}
})();
