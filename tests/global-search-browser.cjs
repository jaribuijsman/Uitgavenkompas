'use strict';
/* Real Chromium smoke: universal search across Leven and Financien at mobile widths. */
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{task}=require('./helpers/storage-fixture.cjs'),enterApp=require('./helpers/enter-app.cjs');
const root=path.resolve(process.env.MEMENTO_NAVIGATION_ROOT||path.join(__dirname,'..'));
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/__seed__'){res.end('<!doctype html><title>Fixture</title>');return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
async function menu(page,area,view){
 await page.locator('[data-memento-menu="open"]').click();
 if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('[data-memento-switch="'+area+'"]').click();
 await page.locator('#mementoMenuGrid [data-memento-dest="'+area+':'+view+'"]').click();
}
async function navigationDrafts(page){
 const out=process.env.MEMENTO_NAVIGATION_OUT||'/tmp/memento-navigation';fs.mkdirSync(out,{recursive:true});
 const source=()=>page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1')}));
 const location=()=>page.evaluate(()=>({area:document.body.dataset.compassArea,view:document.getElementById('lifeApp').dataset.lifeView}));
 await page.locator('#cancelTx').click();await menu(page,'life','notes');
 await require('./helpers/reveal.cjs')(page,'#kc-quick-text');
 await page.locator('#kc-quick-text').fill('Onopgeslagen navigatieconcept');
 assert(await page.evaluate(()=>window.MementoKnowledge.hasPending()));
 await page.evaluate(()=>{window.__navigationDraftField=document.getElementById('kc-quick-text');});
 const noteBefore=await source(),noteBox=await page.locator('#kc-quick-text').boundingBox();await page.screenshot({path:out+'/note-before.png',animations:'disabled'});
 const related=await page.evaluate(()=>window.MementoKnowledgeBridge.openRelated('task','gs-task'));
 await page.screenshot({path:out+'/note-related.png',animations:'disabled'});
 assert.equal(await page.locator('#lifeDialog').isVisible(),false,'Rejected related-task navigation must not open a detail dialog');
 assert.equal(related,false,'Related navigation reports rejection');
 assert.equal(await page.evaluate(()=>window.MementoGlobalSearchLifeOpen('templates','gs-template')),false);
 assert.equal(await page.evaluate(()=>window.MementoLife.openTrash()),false);
 assert.equal(await page.evaluate(()=>window.MementoFitnessBridge.open()),false);
 assert.equal(await page.evaluate(()=>window.MementoLife.openBackup()),false);
 await page.evaluate(()=>{const select=document.getElementById('lifeMobileView');select.value='tasks';select.dispatchEvent(new Event('change',{bubbles:true}));});
 assert.equal(await page.locator('#lifeMobileView').inputValue(),'notes','Rejected legacy selector restores the active value');
 assert.equal(await page.evaluate(()=>window.MementoLife.openWish('headphones')),false);
 page.once('dialog',d=>d.accept());
 assert.equal(await page.evaluate(()=>window.MementoLife.openWish('gs-deleted-wish')),false,'Accepted restore confirmation must not mutate a wish when navigation is blocked');
 assert.deepEqual(await location(),{area:'life',view:'notes'});
 await page.locator('[data-memento-menu="open"]').click();await page.locator('[data-memento-switch="finance"]').click();
 assert.deepEqual(await location(),{area:'life',view:'notes'});
 assert.match(await page.locator('#mementoMenuTitle').textContent(),/Leven/);
 await page.locator('#mementoMenuGrid [data-memento-dest="life:backup"]').click();
 assert.deepEqual(await location(),{area:'life',view:'notes'});
 await menu(page,'life','notes');
 assert(await page.evaluate(()=>window.__navigationDraftField===document.getElementById('kc-quick-text')),'Selecting current view preserves the draft DOM');
 assert.equal(await page.locator('#kc-quick-text').inputValue(),'Onopgeslagen navigatieconcept');
 assert.deepEqual(await source(),noteBefore,'Rejected routes do not write either domain');
 assert.deepEqual(await page.locator('#kc-quick-text').boundingBox(),noteBox,'Rejected routes preserve note geometry');
 await page.screenshot({path:out+'/note-after.png',animations:'disabled'});
 await page.locator('#kc-quick-text').fill('');
 await menu(page,'life','today');
 await page.locator('#mgsInput').fill('Garage remblokken');
 await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage remblokken checken'}).click();
 await page.locator('#lifeDialog').waitFor({state:'visible'});await page.locator('[data-life-close]').first().click();
 await menu(page,'life','fitness');
 await page.evaluate(()=>{window.__navigationOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='compass_life_preview_v1')throw Error('Navigation quota fixture');return window.__navigationOriginalSetItem.call(this,k,v);};});
 await require('./helpers/reveal.cjs')(page,'[data-session-note]');
 await page.locator('[data-session-note]').fill('Fitnessconcept blijft behouden');
 assert(await page.evaluate(()=>window.MementoFitness.hasPending()));
 const fitnessBefore=await source(),fitnessBox=await page.locator('[data-session-note]').boundingBox();await page.evaluate(()=>{window.__navigationDraftField=document.querySelector('[data-session-note]');});
 await page.screenshot({path:out+'/fitness-before.png',animations:'disabled'});
 assert.equal(await page.evaluate(()=>window.MementoKnowledgeBridge.openRelated('task','gs-task')),false);
 assert.equal(await page.evaluate(()=>window.MementoGlobalSearchLifeOpen('templates','gs-template')),false);
 assert.equal(await page.locator('#lifeDialog').isVisible(),false);
 await menu(page,'life','notes');assert.deepEqual(await location(),{area:'life',view:'fitness'});
 await menu(page,'life','fitness');
 assert(await page.evaluate(()=>window.__navigationDraftField===document.querySelector('[data-session-note]')),'Selecting current Fitness preserves draft DOM');
 assert.equal(await page.locator('[data-session-note]').inputValue(),'Fitnessconcept blijft behouden');
 assert.deepEqual(await source(),fitnessBefore);
 assert.deepEqual(await page.locator('[data-session-note]').boundingBox(),fitnessBox,'Rejected routes preserve Fitness geometry');
 await page.screenshot({path:out+'/fitness-after.png',animations:'disabled'});
 await page.evaluate(()=>{Storage.prototype.setItem=window.__navigationOriginalSetItem;});
 await page.locator('[data-fit="retry"]').click();assert.equal(await page.evaluate(()=>window.MementoFitness.hasPending()),false);
 await menu(page,'life','today');
 assert.equal((await source()).finance,fitnessBefore.finance);
 assert.equal(await page.evaluate(()=>window.MementoNavigation.setArea('unsupported')),false);
 assert.equal(await page.evaluate(()=>window.MementoNavigation.setView('unsupported')),false);
 assert(await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).fitness.active.notes==='Fitnessconcept blijft behouden'));
 const beforeCancel=await source(),beforeCancelLocation=await location();page.once('dialog',d=>d.dismiss());
 assert.equal(await page.evaluate(()=>window.MementoLife.openWish('gs-deleted-wish')),false);
 assert.deepEqual(await location(),beforeCancelLocation);assert.deepEqual(await source(),beforeCancel);
 assert.equal(await page.evaluate(()=>window.MementoLife.openWish('headphones')),true);
 await page.locator('#lifeDialog').waitFor({state:'visible'});
 assert.equal(await page.locator('#lifeWishTitle').inputValue(),'Comfortabele koptelefoon voor onderweg');
 await page.locator('[data-life-close]').first().click();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({width:393,height:790,noteBox,fitnessBox,rejectedRoutesPreserveSources:true,sameViewRetainsDraftNodes:true,retrySavesFitnessDraft:true,overflow:false},null,2));
 console.log('PASS navigation rejection: note/Fitness drafts, menu, related/search bridges, same-view DOM, source preservation and successful retry');
}
(async()=>{
 let browser;
 try{
  await new Promise((ok,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',ok);});
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const fixture=await require('./helpers/visual-fixture.cjs').fixture();
  fixture.life.templates.push(task('gs-template','Bewaard testsjabloon'));
  fixture.life.wishes.push({...fixture.life.wishes[0],id:'gs-deleted-wish',deletedAt:'2026-10-01'});
  fixture.life.tasks.push({...task('gs-task','Garage remblokken checken'),date:'2026-10-27',notes:'Garage factuur controleren'});
  fixture.life.appointments.push({...fixture.life.appointments[0],id:'gs-appointment',title:'Garage De Hout afspraak'});
  fixture.life.notes.push({...fixture.life.notes[0],id:'gs-note',title:'Garage onderdelen',body:'Bandenspanning testen',deletedAt:'',archived:false});
  fixture.finance.transactions.push({...fixture.finance.transactions[0],id:'gs-fin',description:'Garage De Hout – dynamo',merchant:'Garage De Hout',amount:570,date:'2026-10-27',type:'expense'});
  const origin='http://127.0.0.1:'+server.address().port;
  for(const width of [360,393,412]){
    const context=await browser.newContext({viewport:{width,height:790},locale:'nl-NL',timezoneId:'Europe/Amsterdam',hasTouch:true,reducedMotion:'reduce'});
    await context.route('https://**/*',r=>r.abort());
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/__seed__');
    await page.evaluate(data=>{localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(data.life));},fixture);
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await enterApp(page);
    await page.waitForFunction(()=>window.MementoStorageGuard?.writable && window.MementoGlobalSearch?.mount);
    const field=page.locator('#mgsInput');
    await field.waitFor({state:'visible'});
    assert((await field.boundingBox()).height>=44,'Search input touch area');
    await field.fill('Garage');
    // Focus can show empty-query recents before the 90ms search debounce settles.
    await page.waitForFunction(()=>document.querySelector('.mgs-section-label')?.textContent?.includes('Garage') && [...document.querySelectorAll('#mgsDropdown [data-mgs-result]')].some(el=>el.textContent.includes('Garage remblokken checken')));
    assert(await page.locator('#mgsDropdown').isVisible(),'Dropdown opens');
    assert(await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage remblokken checken'}).count()===1,'Task found');
    assert(await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage De Hout – dynamo'}).count()===1,'Transaction found');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow at '+width);
    if(width===393){
      await page.screenshot({path:'/tmp/memento-global-search-393.png',animations:'disabled'});
      await field.fill('a');
      await page.locator('#mgsDropdown [data-mgs-more]').waitFor({state:'visible'});
      await page.locator('#mgsDropdown [data-mgs-more]').click();
      assert(await page.locator('#mgsDropdown .mgs-section').count()>1,'Expanded grouped results remain visible after focus returns');
      await field.fill('Garage');
      await page.waitForFunction(()=>document.querySelector('.mgs-section-label')?.textContent?.includes('Garage') && [...document.querySelectorAll('#mgsDropdown [data-mgs-result]')].some(el=>el.textContent.includes('Garage remblokken checken')));
      await page.locator('#mgsDropdown [data-mgs-filter="finance"]').click();
      assert.equal(await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage remblokken checken'}).count(),0,'Finance filter excludes tasks');
      await page.locator('#mgsDropdown [data-mgs-filter="all"]').click();
      await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage remblokken checken'}).click();
      await page.locator('#lifeDialog').waitFor({state:'visible'});
      await page.locator('[data-life-close]').first().click();
      await page.evaluate(()=>document.querySelector('#lifeNavigation [data-life-view="today"]').click());
      await field.fill('Bandenspanning');
      await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage onderdelen'}).waitFor();
      await field.fill('dynamo');
      await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage De Hout – dynamo'}).click();
      await page.waitForFunction(()=>document.body.dataset.compassArea==='finance');
      await page.locator('#modalBackdrop.open').waitFor();
      assert.equal(await page.locator('#txDescription').inputValue(),'Garage De Hout – dynamo','Selected transaction opens in its existing editor');
      await navigationDrafts(page);
    }
    assert.deepEqual(errors,[],'No runtime errors: '+width);
    await context.close();
  }
  console.log('PASS universal search: mobile sizes, filters, result navigation, diary body, finances');
 }finally{await browser?.close();await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1;});