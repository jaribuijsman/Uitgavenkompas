'use strict';
// Release evidence: actual renders and accessibility checks of all existing main views.
// Automated contrast cannot resolve every glass/background-image combination; preserve
// incomplete results for visual review instead of silently calling them passes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{default:AxeBuilder}=require('@axe-core/playwright');
const root=path.resolve(process.env.MEMENTO_RELEASE_ROOT||path.join(__dirname,'..'));
const out=process.env.MEMENTO_RELEASE_OUT||'/tmp/memento-release';fs.mkdirSync(out,{recursive:true});
const routes=[['day','life','today'],['tasks','life','tasks'],['groceries','life','groceries'],['wishes','life','wishes'],['agenda','life','agenda'],['knowledge','life','notes'],['fitness','life','fitness'],['settings','life','backup'],['finance','finance','dashboard'],['transactions','finance','transactions'],['analysis','finance','analysis'],['accounts','finance','accounts'],['budgets','finance','budgets'],['planning','finance','planning'],['smartbuy','finance','smartbuy'],['moneycoach','finance','moneycoach'],['receipts','finance','receipts'],['finance-settings','finance','settings']];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 if(name==='/__seed__'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Isolated release acceptance</title>');return;}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
async function settle(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function nav(page,area,view){
 if(page.viewportSize().width>800){if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('#compassAreaBar [data-compass-area="'+area+'"]').click();await page.locator(area==='life'?'#lifeNavigation [data-life-view="'+view+'"]':'#sideNav [data-view="'+view+'"]').click();}
 else{await page.locator('[data-memento-menu=open]').click();if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('[data-memento-switch="'+area+'"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="'+area+':'+view+'"]').click();}
 await page.evaluate(()=>scrollTo(0,0));await settle(page);
}
async function audit(page,screen,width,report){
 const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 const bounds=await page.evaluate(()=>({clientWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
 report.push({width,screen,bounds,violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary,checks:n.any}))})),incomplete:r.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,html:n.html}))})),passes:r.passes.map(v=>v.id)});
 await page.screenshot({path:path.join(out,width+'-'+screen+'.jpg'),type:'jpeg',quality:80,animations:'disabled'});
 assert(bounds.scrollWidth<=width+1,screen+' overflow');assert.deepEqual(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[],screen+' confirmed accessibility violations');
}
(async()=>{let browser;const report=[],errors=[];try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});const data=await require('./helpers/visual-fixture.cjs').fixture(),url='http://127.0.0.1:'+server.address().port;
 for(const width of [360,393,412,1280]){
  const ctx=await browser.newContext({viewport:{width,height:width>800?900:852},hasTouch:width<800,locale:'nl-NL',timezoneId:'Europe/Amsterdam',reducedMotion:'reduce'});await ctx.route('https://**/*',r=>r.abort());
  await ctx.addInitScript(()=>{const D=Date,t=Date.parse('2026-10-27T09:30:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});
  const page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto(url+'/__seed__');await page.evaluate(async d=>{
   localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(d.pin));
   const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('memento_knowledge_files_v1',1);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('files',{keyPath:'id'});s.createIndex('noteId','noteId',{unique:false});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
   await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);for(const {base64,...meta}of d.files)tx.objectStore('files').put({...meta,blob:new Blob([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],{type:meta.type})});});db.close();
  },data);
  await page.goto(url);await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await nav(page,'life','notes');
  const before=await page.evaluate(()=>({finance:localStorage.getItem('uitgavenkompas_v1'),life:localStorage.getItem('compass_life_preview_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')}));
  for(const [name,area,view]of routes)await nav(page,area,view).then(()=>audit(page,name,width,report));
  await nav(page,'life','tasks');await page.locator('.memento-filter-drawer>summary').click();await audit(page,'task-filters-open',width,report);assert.equal(await page.locator('#mgTaskFilterPresets').getAttribute('role'),'group');
  await nav(page,'finance','planning');assert(await page.locator('.bill-date span').first().evaluate(n=>parseFloat(getComputedStyle(n).fontSize)>=12));
  await nav(page,'finance','receipts');
  for(const step of ['input','check','link']){
   await page.locator('#ml-receipts [data-ml-tab="'+step+'"]').click();await settle(page);await audit(page,'receipt-'+step,width,report);
   const panel=await page.locator('#ml-receipts-'+step).boundingBox(),tabs=await page.locator('#ml-receipts').boundingBox();assert(panel&&tabs&&Math.abs(panel.x-tabs.x)<=1,'Receipt panel follows tabs at same left edge');assert(panel.y>=tabs.y+tabs.height-1,'Receipt panel starts below tabs');
   assert(panel.width>=tabs.width-1,'Receipt steps use the available content width');
  }
  await nav(page,'finance','transactions');await page.locator('#addTransaction').click();await audit(page,'transaction-dialog',width,report);await page.locator('#txDescription').focus();await page.keyboard.press('Escape');await page.locator('#modalBackdrop.open').waitFor({state:'hidden'});
  await nav(page,'life','tasks');await page.locator('#lifeAdd').click();await audit(page,'task-dialog',width,report);await page.locator('#lifeTaskTitle').focus();await page.keyboard.press('Escape');await page.locator('#lifeDialog').waitFor({state:'hidden'});
  await nav(page,'life','agenda');await page.locator('[data-mg-agenda=month]').click();await audit(page,'calendar-month',width,report);
  await nav(page,'life','fitness');await page.locator('[data-fit=tab][data-id=plan]').click();await audit(page,'fitness-plan',width,report);await page.locator('[data-fit=tab][data-id=progress]').click();await audit(page,'fitness-progress',width,report);
  const after=await page.evaluate(()=>({finance:localStorage.getItem('uitgavenkompas_v1'),life:localStorage.getItem('compass_life_preview_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')}));assert.deepEqual(after,before,'Read-only navigation and audits preserve exact guarded data');await ctx.close();console.log('PASS release acceptance '+width);
 }
 assert.deepEqual(errors,[]);
}catch(e){report.push({failure:e.stack});console.error(e);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,errors},null,2));await browser?.close();server.close();}})();
