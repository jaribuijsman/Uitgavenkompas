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
(async()=>{
 let browser;
 try{
  await new Promise((done,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',done)});
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const fixture=await require('./helpers/visual-fixture.cjs').fixture();
  const date='2026-10-28';
  fixture.life.tasks=[...([1,2,3,4].map(i=>({...task('portal-t'+i,'Voorbeeldtaak '+i),date}))),{...task('portal-late','Leuke outfit scoren'),date:'2026-10-27'}];
  fixture.life.appointments=[
   {id:'portal-a',title:'Tandarts',date,time:'09:30',endTime:'10:00',allDay:false,location:'',notes:'',done:false,completedAt:'',createdAt:date+'T07:00:00Z'},
   {id:'portal-b',title:'Afspraak',date,time:'15:30',endTime:'16:00',allDay:false,location:'',notes:'',done:false,completedAt:'',createdAt:date+'T07:00:00Z'}
  ];fixture.life.googleAppointments=[];fixture.life.appointmentChecks={};
  const weather={
   current:{time:date+'T12:00',temperature_2m:14.2,apparent_temperature:13,weather_code:61,wind_speed_10m:15,is_day:1},
   daily:{time:[date],temperature_2m_min:[9],temperature_2m_max:[15],precipitation_probability_max:[70]},
   hourly:{time:Array.from({length:24},(_,i)=>date+'T'+String(i).padStart(2,'0')+':00'),temperature_2m:Array.from({length:24},(_,i)=>10+i/6),weather_code:Array(24).fill(61),precipitation_probability:Array(24).fill(70)}
  };
  const origin='http://127.0.0.1:'+server.address().port;
  for(const width of [360,393,412]){
   const context=await browser.newContext({viewport:{width,height:800},locale:'nl-NL',timezoneId:'Europe/Amsterdam',hasTouch:true,reducedMotion:'reduce'});
   const page=await context.newPage();const errors=[];
   page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://api.open-meteo.com/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(weather)}));
   await page.addInitScript(()=>{const D=Date,stamp=Date.parse('2026-10-28T12:00:00+01:00');window.Date=class extends D{constructor(...args){super(...(args.length?args:[stamp]))}static now(){return stamp}}});
   await page.goto(origin+'/__seed__');
   await page.evaluate(data=>{
    localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));
    localStorage.setItem('compass_life_preview_v1',JSON.stringify(data.life));
   },fixture);
   await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
   await page.locator('#mementoStart').waitFor({state:'visible'});
   await page.waitForFunction(()=>document.querySelectorAll('#ms-hourly .ms-hour').length===6);
   assert.match(await page.locator('#ms-events').innerText(),/2\s*afspraken/);
   assert.match(await page.locator('#ms-tasks').innerText(),/4 vandaag · 1 achterstallig/);
   assert.equal(await page.locator('#ms-task-first-title').innerText(),'Leuke outfit scoren');
   assert.match(await page.locator('#ms-task-first').innerText(),/27 okt.*1 dag te laat/);
   assert.equal(await page.locator('#mementoStart .ms-day').count(),1);
   assert.equal(await page.locator('#mementoStart .ms-cardrow').count(),4);
   assert.deepEqual(await page.locator('[data-ms-create]').allTextContents(),['＋Taak','＋Snelle notitie','＋Transactie']);
   assert.equal(await page.locator('#ms-temp').innerText(),'14°');
   assert.equal(await page.locator('#ms-hourly .ms-hour').count(),6);
   assert.equal(await page.locator('#pinForm').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   for(const height of [640,700,800]){
    await page.setViewportSize({width,height});
    await page.locator('#ms-task-row-second').scrollIntoViewIfNeeded();
    const reachable=await page.locator('#ms-task-row-second').evaluate(el=>{const r=el.getBoundingClientRect(),f=document.querySelector('.ms-footer').getBoundingClientRect();return r.top>=0&&r.bottom<=f.top+1});
    assert(reachable,'Last row remains reachable above fixed footer');
    for(const selector of ['.ms-quickbutton','.ms-cardrow','.ms-overview','.ms-continue']){
     assert((await page.locator('#mementoStart '+selector).first().boundingBox()).height>=44,'Touch height '+selector);
    }
   }
   if(width===393){
    await page.setViewportSize({width,height:772});
    await page.locator('[data-ms-create="note"]').click();
    await page.locator('#kc-quick-text').waitFor({state:'visible'});
    await page.evaluate(()=>window.MementoStart.showWelcome());
    const before=await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1')}));
    await page.locator('[data-ms-create="task"]').click();
    await page.locator('#lifeTaskForm').waitFor({state:'visible'});
    for(const id of ['lifeTaskTitle','lifeTaskKind','lifeTaskCategory','lifeTaskDate','lifeTaskRepeat','lifeTaskRoom','lifeTaskPriority','lifeTaskNotes','lifeTaskSteps'])assert.equal(await page.locator('#'+id).count(),1);
    await page.locator('[data-life-close]').first().click();
    await page.evaluate(()=>window.MementoStart.showWelcome());
    await page.locator('[data-ms-create="note"]').click();
    await page.locator('#kc-quick-text').waitFor({state:'visible'});
    assert.equal(await page.locator('[data-kc="quick-save"]').count(),1);
    assert.equal(await page.locator('[data-kc="quick-expand"]').count(),1);
    assert.equal(await page.locator('#kc-quick-mic').count(),1);
    await page.evaluate(()=>window.MementoStart.showWelcome());
    await page.locator('[data-ms-create="transaction"]').click();
    await page.locator('#txForm').waitFor({state:'visible'});
    for(const id of ['txDescription','txAmount','txDate','txMerchant','txCategory','txSubcategory','txAccount','txPerson','txPaymentMethod','txNote','toggleSplit'])assert.equal(await page.locator('#'+id).count(),1);
    for(const type of ['expense','income','refund','transfer'])assert.equal(await page.locator('[data-txtype="'+type+'"]').count(),1);
    await page.locator('#cancelTx').click();
    assert.deepEqual(await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1')})),before,'Opening/cancelling real editors must not change records');
    await page.evaluate(()=>window.MementoStart.showWelcome());
   }
   await page.locator('#ms-continue').click();
   await page.locator('#pinLock').waitFor({state:'hidden'});
   await page.evaluate(()=>{document.querySelector('#compassAreaBar [data-compass-area="finance"]').click();document.querySelector('#sideNav [data-view="settings"]').click();});
   await require('./helpers/reveal.cjs')(page,'#view-settings [data-memento-pin-lock-now]');await page.locator('#view-settings [data-memento-pin-lock-now]').click();
   await page.locator('#pinForm').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>localStorage.getItem('memento_manual_pin_lock_v1')),null);
   await page.locator('#pinInput').fill('123456');
   await page.locator('#pinSubmit').click();
   await page.locator('#pinInput').fill('123456');
   await page.locator('#pinSubmit').click();
   await page.waitForFunction(()=>localStorage.getItem('memento_manual_pin_lock_v1')==='1');
   assert.equal(await page.locator('#mementoStart').isVisible(),false);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#pinForm').waitFor({state:'visible'});
   assert.equal(await page.locator('#mementoStart').isVisible(),false);
   await page.locator('#pinInput').fill('000000');
   await page.locator('#pinSubmit').click();
   assert.match(await page.locator('#pinError').innerText(),/onjuist/i);
   await page.locator('#pinInput').fill('123456');
   await page.locator('#pinSubmit').click();
   await page.waitForFunction(()=>localStorage.getItem('memento_manual_pin_lock_v1')===null);
   await page.locator('#pinLock').waitFor({state:'hidden'});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#mementoStart').waitFor({state:'visible'});
   assert.equal(await page.locator('#pinForm').isVisible(),false);
   assert.deepEqual(errors,[],'No page errors');
   console.log('PASS real create routes, glass dayline, weather, overdue date and manual PIN at '+width+'px');
   await context.close();
  }
 }finally{if(browser)await browser.close();await new Promise(done=>server.close(done))}
})().catch(e=>{console.error(e);process.exitCode=1});
