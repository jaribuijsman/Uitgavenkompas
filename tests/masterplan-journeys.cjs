/* Reproducible action counts and a real old-worker -> current-worker upgrade.
 * Requires MEMENTO_BASELINE_ROOT: an immutable 52ac8c2 snapshot, never a user profile. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const current=path.resolve(__dirname,'..'),baseline=process.env.MEMENTO_BASELINE_ROOT,out=process.env.MEMENTO_JOURNEY_OUT||'/tmp/memento-journeys';
if(!baseline)throw Error('MEMENTO_BASELINE_ROOT must select the original main snapshot');
let source=current;const report={baseline:'52ac8c2f120b97769e26a8fb7f2ec1735ea7c0c9',journeys:[],upgrade:null,failure:null};fs.mkdirSync(out,{recursive:true});
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
 },data);await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
}
(async()=>{let browser;
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const url='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
  const data=await require('./helpers/visual-fixture.cjs').fixture();data.life.notes.find(n=>n.id==='visual-note').body+='\n\n'+('Bewaarde achtergrond. '.repeat(100))+'JourneyInhoudUniek midden in de inhoud.';
  async function context(){const c=await browser.newContext({viewport:{width:393,height:852},hasTouch:true,reducedMotion:'reduce',locale:'nl-NL',timezoneId:'Europe/Amsterdam'});await c.route('https://**/*',r=>r.abort());await c.addInitScript(()=>{const D=Date,t=Date.parse('2026-10-28T12:00:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});return c;}
  for(const phase of ['before','after'])for(const journey of ['task','note','find-note','diary','payment']){
   source=phase==='before'?baseline:current;const ctx=await context(),page=await ctx.newPage(),errors=[];page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await seed(page,data,url);let actions=0,fields=null;
   const act=async fn=>{actions++;await fn();},click=selector=>act(()=>page.locator(selector).first().click()),fill=(selector,value)=>act(()=>page.locator(selector).fill(value));
   const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));
   if(journey==='task'){await fill('#lifeQuickTitle','Journey taak');await click('#lifeQuickForm [type=submit]');assert.equal((await stored()).tasks.filter(t=>t.title==='Journey taak').length,1);}
   if(journey==='note'){await click('[data-life-quick-kind=note]');await fill('#lifeQuickTitle','Journey notitie');await click('#lifeQuickForm [type=submit]');assert.equal((await stored()).notes.filter(n=>n.body==='Journey notitie').length,1);}
   if(journey==='find-note'){
    await click('#mementoQuickNav [data-memento-dest="life:notes"]');
    if(phase==='before'){await click('[data-kc=all]');await click('#kc-filter-drawer>summary');await fill('[data-kc-input=search]','JourneyInhoudUniek');await click('[data-kc=open][data-id=visual-note]');assert((await page.locator('.kc-readable').innerText()).includes('JourneyInhoudUniek'));}
    else{await fill('[data-kc-input=central-search]','JourneyInhoudUniek');await click('[data-kc=search-result][data-id=visual-note]');assert((await page.locator('#kc-body').inputValue()).includes('JourneyInhoudUniek'));}
   }
   if(journey==='diary'){
    if(phase==='before'){await click('#mementoQuickNav [data-memento-dest="life:notes"]');await click('[data-kc=collection][data-id=kc2-levenspad]');await click('[data-kc=collection][data-id=kc2-levenspad-dagboek]');await click('[data-kc=journal-today]');}
    else await click('[data-life-journal]');
    await fill('#kc-body','Journey dagboektekst.');await click('[data-kc=save]');assert.equal((await stored()).notes.filter(n=>n.journal?.date==='2026-10-28'&&n.body==='Journey dagboektekst.').length,1);
   }
   if(journey==='payment'){
    await click('[data-memento-menu=open]');await click('[data-memento-switch=finance]');await click('#mementoMenuGrid [data-memento-dest="finance:planning"]');await click('[data-bill-paid=energy]');
    fields=await page.locator('#txForm input:not([type=hidden]),#txForm select,#txForm textarea').evaluateAll(nodes=>nodes.filter(n=>!n.disabled&&n.checkVisibility()).length);
    await click('[form=txForm][type=submit]');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('uitgavenkompas_v1')).transactions.filter(t=>t.billId==='energy').length),1);
   }
   await page.screenshot({path:path.join(out,phase+'-'+journey+'.jpg'),type:'jpeg',quality:72,animations:'disabled'});assert.deepEqual(errors,[]);report.journeys.push({phase,journey,actions,editablePaymentFields:fields,errors});await ctx.close();
  }
  // Same origin and profile, real service workers and IndexedDB; source switches only on the local test server.
  source=baseline;const ctx=await context(),page=await ctx.newPage();page.on('dialog',d=>d.accept());await seed(page,data,url);
  const upgradeTrace=async label=>{report.upgradeTrace??=[];report.upgradeTrace.push(await page.evaluate(async label=>({label,core:typeof window.MementoFitnessCore,duty:typeof window.MementoFitnessCore?.duty,scripts:[...document.scripts].filter(s=>s.src.includes('fitness')).map(s=>s.src),caches:await Promise.all((await caches.keys()).map(async name=>{const c=await caches.open(name),html=await c.match(location.href);return {name,htmlFitness:html?(await html.text()).match(/memento-fitness-core\.js[^"<]*/)?.[0]:null,assets:(await c.keys()).filter(r=>r.url.includes('fitness-core')).map(r=>r.url)};}))}),label));};
  await page.locator('#mementoQuickNav [data-memento-dest="life:notes"]').click();await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(async()=>{const r=await navigator.serviceWorker.getRegistration();return window.MementoStorageGuard?.writable&&r?.active?.state==='activated'&&!r.installing&&!r.waiting&&navigator.serviceWorker.controller===r.active;});
  const before=await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')}));
  // Keep a legacy same-origin cache ahead of the new release in CacheStorage order.
  // An offline navigation must not use another cache's HTML or its old script URLs.
  await page.evaluate(async html=>{const legacy=await caches.open('uitgavenkompas-legacy-document');for(const p of ['./','./index.html'])await legacy.put(new URL(p,location.href),new Response(html,{headers:{'Content-Type':'text/html'}}));},fs.readFileSync(path.join(baseline,'index.html'),'utf8'));
  source=current;await page.evaluate(async()=>{window.__previousMementoController=navigator.serviceWorker.controller;await(await navigator.serviceWorker.getRegistration()).update();});const worker=fs.readFileSync(path.join(current,'sw.js'),'utf8'),cache=worker.match(/const CACHE = "([^"]+)"/)[1],required=JSON.parse(worker.match(/const CORE = (\[.*?\]);/)[1]);
  // Opening a new cache precedes addAll/activation. Wait for the actual worker takeover,
  // not just a cache directory, before assessing an offline upgrade.
  await page.waitForFunction(async({name,required})=>{const r=await navigator.serviceWorker.getRegistration();if(r?.active?.state!=='activated'||r.installing||r.waiting||navigator.serviceWorker.controller!==r.active||navigator.serviceWorker.controller===window.__previousMementoController)return false;const c=await caches.open(name);return(await Promise.all(required.map(p=>c.match(new URL(p,location.href))))).every(Boolean);},{name:cache,required});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoFitnessCore?.duty);await upgradeTrace('online-new-worker');
  await ctx.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.MementoStorageGuard?.writable&&window.MementoFitnessCore?.duty);await page.locator('#mementoQuickNav [data-memento-dest="life:notes"]').click();
  await upgradeTrace('offline');const after=await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')}));assert.deepEqual(after,before);
  assert.equal(await page.evaluate(()=>window.MementoFitnessCore.duty('2026-10-28').code),'O');assert.equal(await page.locator('#pinLock').isVisible(),false);
  const binary=await page.evaluate(async id=>{const r=await window.MementoKnowledgeStore.get(id);return await window.MementoKnowledgeStore.sha256(r.blob);},data.files[0].id);assert.equal(binary,data.files[0].hash);
  const keys=await page.evaluate(()=>caches.keys());assert(keys.includes(cache));assert(!keys.includes('memento-pwa-v35-20261028-account-transfers-v1'));await page.screenshot({path:path.join(out,'upgraded-offline.jpg'),type:'jpeg',quality:72,animations:'disabled'});
  report.upgrade={passed:true,currentCache:cache,exactMainData:true,pinUnchanged:true,attachmentHash:binary,oldCacheRemoved:true,legacyCacheIgnored:true};await ctx.close();console.log(JSON.stringify(report,null,2));
 }catch(e){report.failure=String(e);console.error(e);process.exitCode=1;}
 finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));if(browser)await browser.close();server.close();}
})();
