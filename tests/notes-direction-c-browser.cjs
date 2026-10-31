'use strict';
// Real app, isolated fictional hierarchy; also runnable against the unchanged baseline.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),K=require('../assets/memento-knowledge-core.js');
const root=path.resolve(process.env.MEMENTO_NOTES_ROOT||path.join(__dirname,'..'));
const phase=process.env.MEMENTO_NOTES_PHASE||'after',out=process.env.MEMENTO_NOTES_OUT||'/tmp/memento-notes-c';
const project='kc2-projecten-onderzoek',dossiers=project+'-dossiers',products=project+'-producten',sources=project+'-bronnen';
const reports=[];
async function fixture(){
 const data=await require('./helpers/visual-fixture.cjs').fixture();K.migrateHierarchy(data.life);
 for(const [i,cid] of [dossiers,dossiers,dossiers,sources,sources].entries()){
  const n=K.makeNote({title:['Fictief projectplan','Onderzoek naar materialen','Een lange projecttitel met aanvullende informatie voor later','Bronnenlijst','Vergelijking'][i],body:'Een korte voorvertoning met https://example.com/'+('lange-url/'.repeat(30)),collectionId:cid,tags:['Onderzoek','Idee','Later']},data.life);
  n.id='direction-c-'+i;n.tags=['Onderzoek','Idee','Later'];n.updatedAt='2026-10-30T09:00:00.000Z';data.life.notes.push(n);
 }
 return data;
}
(async()=>{let browser;try{
 browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 const data=await fixture();
 for(const width of [360,393,412,1280]){
  const dir=path.join(out,phase,String(width));fs.mkdirSync(dir,{recursive:true});
  const ctx=await browser.newContext({viewport:{width,height:852},hasTouch:width<800,reducedMotion:'reduce',locale:'nl-NL',timezoneId:'Europe/Amsterdam',serviceWorkers:'block'});
  await ctx.route('https://**/*',route=>{
   const u=new URL(route.request().url());if(u.hostname!=='memento.test')return route.abort();
   const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
   return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream'});
  });
  await ctx.addInitScript(()=>{const D=Date,t=D.parse('2026-10-30T10:00:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://memento.test/manifest.json');
  await page.evaluate(d=>{localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(d.pin));},data);
  await page.goto('https://memento.test/');await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  async function navigate(view){
   if(width>800){if(await page.evaluate(()=>document.body.dataset.compassArea)!=='life')await page.locator('#compassAreaBar [data-compass-area=life]').click();await page.locator('#lifeNavigation [data-life-view="'+view+'"]').click();}
   else{await page.locator('[data-memento-menu=open]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:'+view+'"]').click();}
  }
  const stored=()=>page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1')}));
  await navigate('notes');const before=await stored();
  async function shot(name){
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(80);
   await page.screenshot({path:path.join(dir,name+'.png'),animations:'disabled'});
   const report=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();
    const smallTargets=[...document.querySelectorAll('.kc-app button,.kc-app summary,.kc-app input:not([type=checkbox]),.kc-app select')].filter(el=>{const r=el.getBoundingClientRect();return el.checkVisibility()&&r.width&&r.height&&(r.width<44||r.height<44);}).map(el=>({text:el.textContent.slice(0,40),rect:el.getBoundingClientRect().toJSON()}));
    return {scrollY,scrollWidth:document.documentElement.scrollWidth,header:rect('#compassAreaBar'),title:rect('.kc-header'),first:rect('.kc-collection-row'),last:document.querySelector('.kc-collection-rows')?.lastElementChild?.getBoundingClientRect().toJSON(),note:rect('.kc-item'),bottom:rect('#mementoQuickNav'),covers:document.querySelectorAll('.kc-collection-row .kc-art-wrap').length,smallTargets};
   });reports.push({width,name,...report});
   assert(report.scrollWidth<=width+1,name+' has no page overflow');
   if(phase==='after'&&report.title){assert(report.title.y>=report.header.bottom,name+' title clears fixed app header');assert.deepEqual(report.smallTargets,[],name+' touch targets');}
   return report;
  }
  const home=await shot('home');
  await page.locator('[data-kc=collection][data-id="'+project+'"]').first().click();const parent=await shot('parent');
  await page.locator('[data-kc=collection][data-id="'+dossiers+'"]').click();const child=await shot('child');
  if(phase==='after'){
   assert(home.covers>=5);assert(home.first.height>=112&&home.first.height<=124,'Root cover height');
   assert.equal(parent.covers,0,'No cover banners on subfolder rows');assert(parent.first.height>=68&&parent.first.height<=76,'Compact folder rows');
   if(width<800)assert(parent.last.bottom<parent.bottom.y,'Three subfolders fit first viewport');
   assert.match(await page.locator('.kc-count').innerText(),/^3 notities/);
   assert.equal(await page.locator('.kc-item').count(),3);assert(child.note.height>=78&&child.note.height<=104);
   assert.equal(await page.locator('.kc-filter-drawer').getAttribute('open'),null);
   await page.locator('.kc-filter-drawer summary').focus();await page.keyboard.press('Enter');await shot('filters-open');
   await page.locator('[data-kc-change=tag]').selectOption('Later');
   assert.equal(await page.locator('.kc-item').count(),3);
   await page.locator('[data-kc-change=sort]').selectOption('title');assert.match(await page.locator('.kc-item strong').first().innerText(),/^Een lange/);
   await page.locator('[data-kc-change=sort]').selectOption('recent');
   await page.locator('[data-kc=mode][data-id=gallery]').click();assert.equal(await page.locator('.kc-gallery').count(),1);
   await page.locator('[data-kc=mode][data-id=table]').click();assert.equal(await page.locator('.kc-table').count(),1);
   await page.locator('[data-kc=mode][data-id=list]').click();
   await page.locator('[data-kc-input=search]').fill('bestaat-niet');await page.waitForTimeout(250);
   assert.equal(await page.getByText('Geen resultaten',{exact:true}).count(),1);await shot('no-results');
   await page.locator('.kc-empty [data-kc=clear-filters]').click();assert.equal(await page.locator('.kc-item').count(),3);
   await page.locator('[data-kc-input=search]').fill('Fictief');
   await page.locator('.kc-item').first().click();
   const detailHistoryIndex=await page.evaluate(()=>history.state?.mementoNotes?.index);
   assert.equal(typeof detailHistoryIndex,'number','Detail history entry must exist before navigating back');
   await page.locator('[data-kc=back]').click();
   // The app uses asynchronous history.go() for its return journey.
   // The result count alone does not establish that popstate committed.
   await page.waitForFunction(previousIndex=>{
    const index=history.state?.mementoNotes?.index;
    return typeof index==='number'&&index<previousIndex&&document.querySelector('.kc-header h2')?.textContent?.trim()==='Projectdossiers';
   },detailHistoryIndex,{timeout:5000});
   assert.equal(await page.locator('.kc-item').count(),1);
   assert.equal(await page.locator('[data-kc-input=search]').inputValue(),'Fictief');
   // Use real keyboard input after history navigation; the original result-count assertion remains strict.
   await page.evaluate(()=>{
    window.__kcClearEvents=[];
    for(const type of ['input','search','change'])document.addEventListener(type,e=>{
     if(e.target?.matches?.('[data-kc-input="search"]'))window.__kcClearEvents.push({type,value:e.target.value,attached:document.contains(e.target)});
    },true);
   });
   await page.locator('[data-kc-input=search]').press('ControlOrMeta+A');
   await page.locator('[data-kc-input=search]').press('Backspace');
   // Popstate and list rendering can settle after the input event. Poll the
   // actual rendered, cleared search; keep the original strict result count.
       try{
     await page.waitForFunction(() => document.querySelector('[data-kc-input="search"]')?.value === '' && document.querySelectorAll('.kc-item').length === 3, null, {timeout:5000});
    }catch(error){
     const state=await page.evaluate(()=>{
      const input=document.querySelector('[data-kc-input="search"]'),filter=sel=>document.querySelector(sel)?.value;
      const life=JSON.parse(localStorage.getItem('compass_life_preview_v1')||'{}');
      const collection='kc2-projecten-onderzoek-dossiers';
      const matches=window.MementoKnowledgeCore?.search(life,{collectionId:collection,query:'',status:'active'})||[];
      return {input:input?.value??null,items:document.querySelectorAll('.kc-item').length,summary:document.querySelector('.kc-count')?.textContent||null,header:document.querySelector('.kc-header h2')?.textContent||null,tag:filter('[data-kc-change="tag"]'),kind:filter('[data-kc-change="kind"]'),sort:filter('[data-kc-change="sort"]'),coreMatches:matches.length,notes:life.notes?.length,route:history.state?.mementoNotes||null,events:window.__kcClearEvents||[],active:document.activeElement?.outerHTML?.slice(0,180),matches:[...document.querySelectorAll('[data-kc-input="search"]')].map(x=>({value:x.value,connected:x.isConnected}))};
     });
     console.error('KC_SEARCH_CLEAR_DIAGNOSTIC '+JSON.stringify({width,...state}));
     throw error;
    }
   assert.equal(await page.locator('.kc-item').count(),3);
   await page.locator('[data-kc-input=search]').fill('bestaat-niet');await page.waitForTimeout(250);
   await page.locator('[data-kc=back]').click();
   assert.match(await page.locator('.kc-count').innerText(),/^5 notities.*3 subverzamelingen/);
   assert.equal(await page.locator('.kc-empty').count(),0,'No empty direct-notes card under folders');
   await page.locator('[data-kc=collection][data-id="'+products+'"]').click();
   assert.equal(await page.getByText('Hier staan nog geen notities',{exact:true}).count(),1);assert.equal(await page.locator('[data-kc=new]').count(),1);await shot('empty');
   await page.locator('.kc-empty [data-kc=new]').click();assert.equal(await page.locator('[data-kc-edit=collectionId]').inputValue(),products);
   await page.goBack();await page.locator('.kc-empty').waitFor();
   // New draft opening and canceling must not write empty notes.
   assert.deepEqual(await stored(),before);
   await page.locator('.kc-breadcrumbs [data-kc=home]').click();
   await page.locator('[data-kc=collection][data-id="'+project+'"]').first().click();
   await page.locator('[data-kc=collection][data-id="'+dossiers+'"]').click();
   await page.goBack();await page.waitForTimeout(100);assert.equal(await page.locator('.kc-header h2').innerText(),'Projecten & onderzoek');
   await page.goForward();await page.waitForTimeout(100);assert.equal(await page.locator('.kc-item').count(),3);
   await page.locator('.kc-breadcrumbs [data-kc=home]').click();
   await page.evaluate(()=>window.scrollTo(0,600));
   await page.locator('[data-kc=collection][data-id="'+project+'"]').first().click();await shot('after-scroll-navigation');
   await page.setViewportSize({width,height:430});await shot('short');
   await page.evaluate(()=>document.documentElement.style.fontSize='20px');await shot('large-text');
   assert.deepEqual(await stored(),before,'Browsing, filters and draft opening preserve stored data');
   await page.setViewportSize({width,height:852});await page.evaluate(()=>document.documentElement.style.fontSize='');
   await page.locator('.kc-breadcrumbs [data-kc=home]').click();
   await page.locator('[data-kc-input=central-search]').fill(data.life.tasks[0].title);
   assert(await page.locator('[data-kc=search-result][data-kind=task]').count()>0);
   await page.locator('[data-kc=search-result][data-kind=task]').first().click();
   assert.equal(await page.locator('#lifeApp').getAttribute('data-life-view'),'tasks');
   if(await page.locator('#lifeDialog:not([hidden]) .life-close').isVisible())await page.locator('#lifeDialog .life-close').click();
  }
  if(width===393){for(const view of ['today','tasks','agenda']){await navigate(view);await page.evaluate(()=>window.scrollTo(0,0));await shot('adjacent-'+view);}}
  if(phase==='after'&&width===393){
   await navigate('notes');await page.evaluate(()=>window.MementoKnowledge.open());
   await page.locator('[data-kc=collection][data-id="'+project+'"]').first().click();
   await page.locator('[data-kc=collection][data-id="'+dossiers+'"]').click();
   await page.locator('.kc-item').first().click();
   const saved=await stored();
   await page.evaluate(()=>{window.directionCWrite=window.MementoKnowledgeBridge.write;window.MementoKnowledgeBridge.write=()=>false;});
   await page.locator('#kc-body').fill('Fictieve invoer die bij een mislukte opslag zichtbaar moet blijven.');
   await page.goBack();await page.waitForTimeout(100);
   assert.equal(await page.locator('#kc-body').inputValue(),'Fictieve invoer die bij een mislukte opslag zichtbaar moet blijven.');
   assert.match(await page.locator('#kc-save-state').innerText(),/Opslaan mislukt/);assert.deepEqual(await stored(),saved);
   await shot('storage-error');await page.evaluate(()=>window.MementoKnowledgeBridge.write=window.directionCWrite);
   await page.locator('[data-kc=save]').click();assert.match(await page.locator('#kc-save-state').innerText(),/Opgeslagen/);
   await page.locator('.kc-breadcrumbs [data-kc=home]').click();
   // Stress fixture only: one direct note, many folders and a long parent name.
   await page.evaluate(id=>window.MementoKnowledgeBridge.write(s=>{
    const C=window.MementoKnowledgeCore;C.saveCollection(s,{...s.knowledge.collections.find(c=>c.id===id),name:'Een heel lange persoonlijke verzamelingsnaam met extra informatie voor later'});
    for(let i=0;i<12;i++)C.saveCollection(s,{name:'Extra subverzameling met een lange naam '+i,icon:'folder',view:'list',parentId:id});
    s.notes.push(C.makeNote({title:'Een rechtstreekse notitie',body:'Ook naast de submappen bereikbaar.',collectionId:id},s));
   }),project);
   await page.locator('[data-kc=collection][data-id="'+project+'"]').first().click();await shot('many-folders-long-name');
   assert.equal(await page.locator('.kc-folder-row').count(),15);assert.equal(await page.locator('.kc-item').count(),1);
   assert.equal(await page.getByText('Rechtstreekse notities',{exact:true}).count(),1);
   await page.locator('.kc-collection-actions summary').click();await shot('management-open');
  }
  assert.deepEqual(errors,[]);await ctx.close();
 }
 console.log(JSON.stringify({phase,passed:true,reports},null,2));
}finally{fs.mkdirSync(path.join(out,phase),{recursive:true});fs.writeFileSync(path.join(out,phase,'report.json'),JSON.stringify(reports,null,2));await browser?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
