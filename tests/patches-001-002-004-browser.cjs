/* Real Chromium: portal forecast, personal day counts, manual PIN lifecycle, mobile widths. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const {task}=require('./helpers/storage-fixture.cjs');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/__seed__'){res.end('<!doctype html><title>Isolated fixture</title>');return}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
(async()=>{let browser;try{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));browser=await chromium.launch({args:['--no-sandbox']});
 for(const width of [360,393,412]){
 const ctx=await browser.newContext({viewport:{width,height:852},timezoneId:'Europe/Amsterdam',locale:'nl-NL',hasTouch:true,reducedMotion:'reduce'}),page=await ctx.newPage();page.on('dialog',d=>d.accept());const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{const D=Date,t=D.parse('2026-10-29T08:00:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]))}static now(){return t}}});
 let requests=0,fail=false;const weather=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/patch-weather.json'),'utf8'));
 await page.route('https://api.open-meteo.com/**',r=>{requests++;return fail?r.abort():r.fulfill({contentType:'application/json',body:JSON.stringify(weather)})});
 const fixture=await require('./helpers/visual-fixture.cjs').fixture();
 fixture.life.tasks=[...['late','focused','routine'].map(id=>({...task(id,'Een lange taaknaam met notities en gekoppelde gegevens voor controle '+id),date:'2026-10-28',notes:'Bewaren',sourceNoteId:'original-note',focusDate:id==='focused'?'2026-10-29':'',kind:id==='routine'?'routine':'task',repeat:id==='routine'?'daily':'none'})),...['done','archived','deleted'].map(id=>({...task(id),date:'2026-10-28',done:id==='done',archived:id==='archived',deletedAt:id==='deleted'?'2026-10-28':''}))];
 fixture.life.appointments=[1,2,3].map(i=>({id:'a'+i,title:'Een lange afspraaknaam met behoud van afvinken en bewerken '+i,date:'2026-10-29',time:'09:00',notes:'Originele notities',done:false}));fixture.life.googleAppointments=[];
 const url='http://127.0.0.1:'+server.address().port;await page.goto(url+'/__seed__');await page.evaluate(d=>{localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life))},fixture);
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelectorAll('#ms-hourly .ms-hour').length===6);assert(requests>0);assert.equal(await page.locator('.ms-source a').getAttribute('href'),'https://open-meteo.com/');
 await page.locator('#ms-refresh').click();await page.waitForFunction(()=>!document.querySelector('#ms-refresh').disabled);assert.equal(requests,2);
 fail=true;await page.locator('#ms-refresh').click();await page.waitForFunction(()=>document.querySelector('#ms-weather-status').textContent.includes('mislukt'));assert.match(await page.locator('#ms-weather-status').innerText(),/opgeslagen weer/);
 await page.locator('#ms-continue').click();await page.evaluate(()=>{document.querySelector('#compassAreaBar [data-compass-area=life]').click();document.querySelector('#lifeNavigation [data-life-view=today]').click()});
 await page.locator('.life-overdue-group>summary').waitFor({state:'visible'});
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));const before=await saved();
 assert.equal(await page.locator('.life-overdue-group').getAttribute('open'),'');assert.equal(await page.locator('.life-overdue-group .life-task').count(),3);assert.equal(await page.locator('.memento-day-summary').count(),0);assert.equal(await page.locator('.life-horizon>.life-day-column .life-day-heading>span').count(),0);assert.match(await page.locator('.life-overdue-group>summary').innerText(),/Nog te doen — eerder gepland/);assert.equal(await page.locator('.memento-overdue-count').innerText(),'3');assert.equal(await page.locator('#lifeContent [data-flow-weather]').count(),0);
 const card=page.locator('.life-overdue-group .life-task').first(),dimensions=await card.evaluate(el=>({height:el.getBoundingClientRect().height,checkbox:el.querySelector('.life-complete').getBoundingClientRect().height,menu:el.querySelector('.life-task-menu>summary').getBoundingClientRect().height}));assert(dimensions.height<=176,'Overdue row should remain compact with long sample text');assert(dimensions.checkbox>=44&&dimensions.menu>=44,'Touch targets must remain at least 44px');
 await page.locator('.life-overdue-group>summary').click();assert.equal(await page.locator('.life-overdue-group .life-task:visible').count(),0);await page.locator('.life-overdue-group>summary').click();assert.equal(await page.locator('.life-overdue-group .life-task:visible').count(),3);
 assert.match(await page.locator('.memento-duty-badge').first().innerText(),/^06:00–14:00$/);assert.equal(await page.locator('.memento-day-caption .memento-duty-badge').count(),3);
 assert.match(await page.locator('.life-overdue-group').innerText(),/1 dag te laat/);assert.deepEqual((await saved()).tasks,before.tasks);
 await page.screenshot({path:path.join(__dirname,'../docs/patches-001-002-004/day-'+width+'.png')});await page.locator('[data-life-day="2026-10-29"]').scrollIntoViewIfNeeded();await page.waitForTimeout(200);await page.screenshot({path:path.join(__dirname,'../docs/patches-001-002-004/appointments-'+width+'.png')});
 await page.locator('[data-memento-complete-event=a1]').click();await page.locator('.memento-completed-appointments summary').click();await page.locator('[data-memento-complete-event=a1]').click();assert.equal((await saved()).appointments.find(a=>a.id==='a1').done,false);
 await page.locator('[data-memento-edit-event=a1]').click();assert.equal(await page.locator('#lifeDialog').isVisible(),true);await page.locator('[data-life-close]').first().click();
 await page.locator('[data-life-complete=late]').click();assert.equal(await page.locator('.life-overdue-group .life-task').count(),2);
 await page.locator('[data-life-complete=routine]').click();assert.equal(await page.locator('.life-overdue-group .life-task').count(),1);assert.equal((await saved()).tasks.filter(t=>t.id==='routine').length,1);assert.equal((await saved()).tasks.find(t=>t.id==='routine').date,'2026-10-30');
 await page.locator('.life-overdue-group .life-task-menu summary').click();await page.locator('[data-life-edit-task=focused]').click();await page.locator('#lifeTaskDate').fill('2026-10-29');await page.locator('[form=lifeTaskForm][type=submit]').click();assert.equal(await page.locator('.life-overdue-group').count(),0);const focused=(await saved()).tasks.find(t=>t.id==='focused');assert.equal(focused.notes,'Bewaren');assert.equal(focused.sourceNoteId,'original-note');
 await page.locator('#lifeQuickTitle').fill('Ingevoerde nieuwe taak');await page.locator('#lifeQuickForm [type=submit]').click();assert.equal((await saved()).tasks.filter(t=>t.title==='Ingevoerde nieuwe taak').length,1);const created=(await saved()).tasks.find(t=>t.title==='Ingevoerde nieuwe taak');await page.locator('.life-task-menu').filter({has:page.locator('[data-life-task-delete="'+created.id+'"]')}).locator('summary').click();await page.locator('[data-life-task-delete="'+created.id+'"]').click();assert((await saved()).tasks.find(t=>t.id===created.id).deletedAt);
 await page.reload({waitUntil:'domcontentloaded'});await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await page.locator('#mementoQuickNav [data-memento-dest="life:today"]').click();await page.locator('#lifeQuickForm').waitFor({state:'visible'});assert.equal(await page.locator('.memento-day-summary').count(),0);assert.equal(await page.locator('.life-overdue-group').count(),0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);const unchanged=await saved();await page.evaluate(()=>localStorage.removeItem('compass_weather_beverwijk_v1'));await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#ms-weather-status').textContent.includes('ophalen mislukt'));assert.equal(await page.locator('#ms-temp').innerText(),'—°');assert.deepEqual(await saved(),unchanged);assert.deepEqual(errors,[]);
 console.log('PASS patch behavior, shared weather refresh/failure, data preservation, appointments and tasks at '+width);await ctx.close();
 }
 }finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
