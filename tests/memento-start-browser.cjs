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
  fixture.life.checklists=[{id:'portal-check',title:'Ochtendzorg',moment:'morning',repeat:'daily',pinned:true,deletedAt:'',steps:[{id:'portal-step',text:'Tanden flossen'}],days:{}}];
  fixture.life.appointments=[
   {id:'portal-a',title:'Tandarts',date,time:'09:30',endTime:'10:00',allDay:false,location:'',notes:'',done:false,completedAt:'',createdAt:date+'T07:00:00Z'},
   {id:'portal-b',title:'Afspraak',date,time:'15:30',endTime:'16:00',allDay:false,location:'',notes:'',done:false,completedAt:'',createdAt:date+'T07:00:00Z'}
  ];fixture.life.googleAppointments=[];fixture.life.appointmentChecks={};
  const forecastDates=Array.from({length:6},(_,i)=>new Date(Date.parse(date+'T12:00:00Z')+i*86400000).toISOString().slice(0,10));
  const weather={
   current:{time:date+'T12:00',temperature_2m:14.2,apparent_temperature:13,weather_code:61,wind_speed_10m:15,is_day:1},
   daily:{time:forecastDates,weather_code:[0,61,2,3,95,71],temperature_2m_min:[9,8,7,6,5,4],temperature_2m_max:[15,14,13,12,11,10],precipitation_probability_max:[70,80,10,15,45,60]},
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
   // The portal fixture contains a PDF attachment. Populate its IndexedDB bytes
   // before opening Memento so V2's fail-closed migration can verify the hashes.
   await page.evaluate(async files=>{
    const db=await new Promise((ok,bad)=>{const r=indexedDB.open('memento_knowledge_files_v1',1);r.onupgradeneeded=()=>{const st=r.result.createObjectStore('files',{keyPath:'id'});st.createIndex('noteId','noteId',{unique:false})};r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)});
    await new Promise((ok,bad)=>{const tx=db.transaction('files','readwrite');tx.oncomplete=ok;tx.onerror=()=>bad(tx.error);for(const {base64,...meta} of files)tx.objectStore('files').put({...meta,blob:new Blob([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],{type:meta.type})})});db.close();
   },fixture.files);
   await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
   await page.locator('#mementoStart').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.mementoTheme),'forest','Bosgroen is the default');
   const forestMaterial=await page.evaluate(()=>{
    const style=selector=>getComputedStyle(document.querySelector(selector)).backgroundImage;
    return {weather:style('#mementoStart .ms-weather'),quote:style('#mementoStart .ms-thought')};
   });
   assert.equal(forestMaterial.weather,forestMaterial.quote,'Weather and quote must use the same card material');
   await page.waitForFunction(()=>document.querySelectorAll('#ms-hourly .ms-hour').length===6);
   assert.equal(await page.locator('#mementoStart .ms-day').count(),0,'The rhythm card is removed');
   assert.equal(await page.locator('#mementoStart .ms-feature-nav').count(),0,'The weather carousel dots are removed');
   assert.equal(await page.locator('#mementoStart .ms-quote').count(),1,'The quote has its own card');
   assert.match(await page.locator('#ms-quote-host').innerText(),/Quote van de dag/i);
   const quote = page.locator('#ms-quote-host');
   const disclosure = quote.locator('summary');
   assert.equal(await quote.locator('time').getAttribute('datetime'), '2026-10-28');
   assert.equal(await quote.locator('.ms-quote-detail').isVisible(), false);
   await disclosure.tap();
   assert.equal(await quote.locator('.ms-quote-detail').isVisible(), true);
   assert.match(await quote.locator('.ms-quote-detail').innerText(), /De gedachte uitgelegd[\s\S]+Sta vandaag stil bij/);
   assert((await disclosure.boundingBox()).height >= 48, 'The whole quote preview is a touch target');
   assert(await quote.locator('.ms-quote-detail').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
   if(width===393){
    fs.mkdirSync('/tmp/memento-start/after',{recursive:true});
    await quote.screenshot({path:'/tmp/memento-start/after/stoic-expanded-393.png',animations:'disabled'});
   }
   await disclosure.press('Enter');
   assert.equal(await quote.locator('.ms-quote-detail').isVisible(), false);
   if(width===393)await quote.screenshot({path:'/tmp/memento-start/after/stoic-compact-393.png',animations:'disabled'});
   assert.deepEqual(await page.locator('[data-ms-create]').allTextContents(),['＋Taak','＋Snelle notitie','＋Transactie']);
   assert.equal(await page.locator('#ms-temp').innerText(),'14°');
   assert.equal(await page.locator('#ms-hourly .ms-hour').count(),6);
   await page.waitForFunction(()=>document.querySelectorAll('#ms-forecast-days .ms-forecast-day').length===5);
   assert.deepEqual(await page.locator('#ms-forecast-days .ms-forecast-icon').allTextContents(),['☂','⛅','☁','ϟ','❄'],'Daily icons follow Open-Meteo daily weather_code');
   assert.deepEqual(await page.locator('#ms-forecast-days .ms-forecast-day strong').allTextContents(),['14°','13°','12°','11°','10°']);
   assert.equal(await page.locator('[data-ms-weather-page]').count(),2);
   const cardHeights=await page.locator('#mementoStart .ms-weather').evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().height));
   assert(Math.abs(cardHeights[0]-cardHeights[1])<=2,'Weather slides keep an equal card height: '+cardHeights.join(', '));
   await page.locator('[data-ms-weather-page="1"]').click();
   await page.waitForFunction(()=>{const s=document.getElementById('ms-weather-slider');return Math.abs(s.scrollLeft-s.clientWidth)<2});
   assert.equal(await page.locator('[data-ms-weather-page="1"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#ms-forecast-days .ms-forecast-day').count(),5);
   await page.locator('[data-ms-weather-page="0"]').click();
   await page.waitForFunction(()=>document.getElementById('ms-weather-slider').scrollLeft<2);
   assert.equal(await page.locator('#pinForm').isVisible(),false);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   for(const height of [640,700,800]){
    await page.setViewportSize({width,height});
    await page.locator('#mementoStart .ms-shell').evaluate(shell=>{shell.scrollTop=shell.scrollHeight});
    for(const selector of ['.ms-quickbutton','.ms-refresh','.ms-continue']){
     assert((await page.locator('#mementoStart '+selector).first().boundingBox()).height>=44,'Touch height '+selector);
    }
   }
   if(width===393){
    await page.setViewportSize({width,height:772});
    await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
    fs.mkdirSync('/tmp/memento-start/after',{recursive:true});
    await page.screenshot({path:'/tmp/memento-start/after/start-top-393.png',animations:'disabled'});
     await page.locator('[data-ms-weather-page="1"]').click();
     await page.waitForFunction(()=>{const s=document.getElementById('ms-weather-slider');return Math.abs(s.scrollLeft-s.clientWidth)<2});
     await page.screenshot({path:'/tmp/memento-start/after/start-weather-5day-393.png',animations:'disabled'});
     await page.locator('[data-ms-weather-page="0"]').click();
    await page.locator('#mementoStart .ms-shell').evaluate(shell=>{shell.scrollTop=shell.scrollHeight;});
    await page.screenshot({path:'/tmp/memento-start/after/start-bottom-393.png',animations:'disabled'});
    await page.locator('#ms-continue').click();
    assert.equal(await page.locator('#mementoQuickNav [data-memento-dest="life:checklists"]').count(),1,'Checklists takes the fourth fixed tab');
    assert.equal(await page.locator('#mementoQuickNav [data-memento-dest="life:notes"]').count(),0,'Knowledge is no longer fixed');
    await page.locator('[data-memento-menu="open"]').click();
    assert.equal(await page.locator('#mementoMenuGrid [data-memento-dest="life:notes"]').count(),1,'Knowledge remains in More');
    await page.locator('#mementoMenuClose').click();
    await page.locator('#mementoQuickNav [data-memento-dest="life:checklists"]').click();
    assert.equal(await page.locator('#lifeApp').getAttribute('data-life-view'),'checklists');
    await page.screenshot({path:'/tmp/memento-start/after/checklist-overview-393.png',animations:'disabled'});
    await page.locator('[data-dr-open="portal-check"]').click();
    await page.screenshot({path:'/tmp/memento-start/after/checklist-focus-393.png',animations:'disabled'});
    await page.locator('[data-dr-check="portal-check"]').check();
    assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')))).checklists[0].days['2026-10-28'].includes('portal-step'));
    await page.locator('[data-dr-complete="portal-check"]').click();
    const run=await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).checklists[0]);
    assert.equal(run.runHistory.length,1,'Completion saves a durable run');
    assert.deepEqual(run.runHistory[0].stepIds,['portal-step']);
    assert.deepEqual(run.days['2026-10-28'],['portal-step'],'Daily state and older progress remain intact');
    await page.locator('[data-dr-open="portal-check"]').click();
    assert.equal(await page.locator('[data-dr-complete="portal-check"]').isDisabled(),true,'An already-completed daily run cannot be recorded twice');
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('[data-dr-reset="portal-check"]').click();
    const afterReset=await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).checklists[0]);
    assert.equal(afterReset.runHistory.length,1,'Reset does not delete completion history');
    assert.deepEqual(afterReset.days['2026-10-28'],[]);
    await page.locator('[data-dr-back]').click();
    await page.locator('[data-dr-new]').click();
    await page.locator('#drTitle').fill('Avondzorg');
    await page.locator('#drMoment').selectOption('evening');
    await page.locator('#drStepEditor [data-dr-step-text]').fill('Water drinken');
    await page.locator('[data-dr-step-add]').click();
    await page.locator('#drStepEditor [data-dr-step-text]').nth(1).fill('Tanden poetsen');
    await page.locator('[form="drChecklistForm"]').click();
    await page.locator('#lifeDialog').waitFor({state:'hidden'});
    const newItem=await page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).checklists.find(c=>c.title==='Avondzorg'));
    assert.deepEqual(newItem.steps.map(step=>step.text),['Water drinken','Tanden poetsen']);
    assert.equal(newItem.moment,'evening');
    await page.screenshot({path:'/tmp/memento-start-checklists-393.png',animations:'disabled'});
    await page.locator('[data-dr-open="'+newItem.id+'"]').click();
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('[data-dr-delete="'+newItem.id+'"]').click();
    await page.locator('[data-dr-trash]').click();
    await page.locator('[data-dr-restore="'+newItem.id+'"]').click();
    assert.equal((await page.evaluate(id=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).checklists.find(c=>c.id===id).deletedAt,newItem.id)),'');
    await page.evaluate(()=>window.MementoStart.showWelcome());
    await page.locator('[data-ms-create="note"]').click();
    await page.locator('#memento-hq-preview').waitFor({state:'visible'});
    await page.locator('[data-action=inbox]').first().click();await page.locator('#mm-note-form').waitFor({state:'visible'});
    await page.evaluate(()=>window.MementoStart.showWelcome());
    const before=await page.evaluate(()=>({life:localStorage.getItem('compass_life_preview_v1'),finance:localStorage.getItem('uitgavenkompas_v1')}));
    await page.locator('[data-ms-create="task"]').click();
    await page.locator('#lifeTaskForm').waitFor({state:'visible'});
    for(const id of ['lifeTaskTitle','lifeTaskKind','lifeTaskCategory','lifeTaskDate','lifeTaskRepeat','lifeTaskRoom','lifeTaskPriority','lifeTaskNotes','lifeTaskSteps'])assert.equal(await page.locator('#'+id).count(),1);
    await page.locator('[data-life-close]').first().click();
    await page.evaluate(()=>window.MementoStart.showWelcome());
    await page.locator('[data-ms-create="note"]').click();
    await page.locator('[data-action=inbox]').first().click();await page.locator('#mm-note-form').waitFor({state:'visible'});
    // V2 capture is an inline form, not the removed V1 quick textarea controls.
    assert.equal(await page.locator('#mm-note-form button').count(),1);
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
   await page.locator('#mementoSettingsFinance [data-ms-target=appearance]').click();
   assert.equal(await page.locator('#mementoSettingsFinance [data-ms-theme="forest"]').getAttribute('aria-pressed'),'true');
   await page.locator('#mementoSettingsFinance [data-ms-theme="glass"]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.mementoTheme),'glass');
   assert.equal(await page.evaluate(()=>localStorage.getItem('memento_card_theme_v1')),'glass');
   assert.equal(await page.locator('#mementoSettingsFinance [data-ms-theme="glass"]').getAttribute('aria-pressed'),'true');
   const glassMaterial=await page.evaluate(()=>{
    const style=selector=>getComputedStyle(document.querySelector(selector)).backgroundImage;
    return {weather:style('#mementoStart .ms-weather'),quote:style('#mementoStart .ms-thought')};
   });
   assert.notEqual(glassMaterial.weather,forestMaterial.weather,'Changing theme must alter the real portal material');
   assert.equal(glassMaterial.weather,glassMaterial.quote);
   // Super Dark is a third, independent and persistent whole-app theme.
   await page.locator('#mementoSettingsFinance [data-ms-theme="superdark"]').click();
   // Observe the final painted state after the live material switch.
   await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
   const dark=await page.evaluate(()=>{
    const css=selector=>getComputedStyle(document.querySelector(selector));
    const bg=selector=>css(selector).backgroundImage;
    return {
     theme:document.documentElement.dataset.mementoTheme,
     stored:localStorage.getItem('memento_card_theme_v1'),
     chrome:document.querySelector('meta[name="theme-color"]').content,
     weather:bg('#mementoStart .ms-weather'),
     quote:bg('#mementoStart .ms-thought'),
     nightArt:css('#pinLock .mf-image').filter,
     sceneShade:bg('#pinLock .memento-scene-shade'),
     body:css('body').backgroundColor,
     area:document.body.dataset.compassArea,
     nightToken:css('html').getPropertyValue('--mg-night-bg').trim(),
     scrollWidth:document.documentElement.scrollWidth,
     width:innerWidth
    };
   });
   assert.equal(dark.theme,'superdark');
   assert.equal(dark.stored,'superdark');
   assert.equal(dark.chrome,'#070b09');
   assert.equal(dark.body,'rgb(7, 11, 9)');
   assert.equal(dark.nightToken,'#080e11','Night palette CSS is active');
   assert.equal(dark.weather,dark.quote);
   assert.notEqual(dark.weather,glassMaterial.weather);
   assert.notEqual(dark.weather,forestMaterial.weather);
   assert.match(dark.nightArt,/brightness\(0\.(39|48|60)\)/,'Original landscape should be night-graded');
   assert.match(dark.sceneShade,/linear-gradient/,'Night scenery has a dark veil');
   assert(dark.scrollWidth<=dark.width+1,'No horizontal overflow in Super Dark');
   assert.equal(await page.locator('#mementoSettingsFinance [data-ms-theme="superdark"]').getAttribute('aria-pressed'),'true');
   // Switching existing styles must not inherit any night-only treatment.
   await page.locator('#mementoSettingsFinance [data-ms-theme="forest"]').click();
   assert.equal(await page.evaluate(()=>document.querySelector('meta[name="theme-color"]').content),'#102b22');
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.mementoTheme),'forest');
   await page.locator('#mementoSettingsFinance [data-ms-theme="glass"]').click();
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.mementoTheme),'glass');
   await page.locator('#mementoSettingsFinance [data-ms-theme="superdark"]').click();
   await page.locator('#mementoSettingsFinance [data-ms-page="appearance"] [data-ms-back]').click();
   await page.locator('#mementoSettingsFinance [data-ms-target=privacy]').click();
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
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.mementoTheme),'superdark','Card theme survives app relaunch');
   assert.equal(await page.locator('#pinForm').isVisible(),false);
   // After scrolling to the last quick action, the separate footer must not
   // cover it at the target Samsung A54 CSS viewport width.
   await page.locator('#mementoStart .ms-shell').evaluate(shell=>{shell.scrollTop=shell.scrollHeight;});
   await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
   const nightGeometry=await page.evaluate(()=>{
    const rect=selector=>document.querySelector(selector).getBoundingClientRect().toJSON();
    return {quick:rect('#mementoStart .ms-quickbutton:last-child'),footer:rect('#mementoStart .ms-footer'),
      width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      material:getComputedStyle(document.documentElement).getPropertyValue('--mg-surface').trim()};
   });
   assert(nightGeometry.quick.bottom<=nightGeometry.footer.top-6,'Super Dark quick action must clear the bottom CTA: '+JSON.stringify(nightGeometry));
   assert(nightGeometry.scrollWidth<=nightGeometry.width+1,'Super Dark start has horizontal overflow');
   assert.match(nightGeometry.material,/#121f19/i,'Dark content cards must use the calmer night material');
   assert.deepEqual(errors,[],'No page errors');
   console.log('PASS quote card, weather, focus checklist, navigation, themes and PIN at '+width+'px');
   await context.close();
  }
  const calendarContext=await browser.newContext({viewport:{width:1280,height:800},timezoneId:'America/New_York',reducedMotion:'reduce'});
  const calendarPage=await calendarContext.newPage();
  await calendarPage.route('https://api.open-meteo.com/**',route=>route.abort());
  await calendarPage.clock.install({time:new Date('2024-02-28T23:59:56-05:00')});
  await calendarPage.clock.pauseAt(new Date('2024-02-28T23:59:58-05:00'));
  await calendarPage.goto(origin+'/',{waitUntil:'domcontentloaded'});
  const calendarQuote=calendarPage.locator('#ms-quote-host');
  async function assertDay(iso,title){
   assert.equal(await calendarQuote.locator('time').getAttribute('datetime'),iso);
   assert.equal(await calendarQuote.locator('cite').textContent(),title);
  }
  const calendar=await calendarPage.evaluate(()=>window.MementoStoicDays);
  const expectedKeys=Array.from({length:366},(_,i)=>new Date(Date.UTC(2024,0,i+1)).toISOString().slice(5,10));
  assert.deepEqual(Object.keys(calendar),expectedKeys);
  for(const key of expectedKeys){
   const entry=calendar[key];
   assert.equal(entry.dateKey,key);
   assert.equal(entry.month,Number(key.slice(0,2)));
   assert.equal(entry.day,Number(key.slice(3)));
   assert(entry.sourceTitle&&entry.bookAttribution&&entry.thoughtNl&&entry.explanationNl&&entry.reflectionNl,key);
  }
  await assertDay('2024-02-28','WHEN YOU LOSE CONTROL');
  await calendarQuote.locator('summary').click();
  await calendarPage.clock.runFor(2000);
  await assertDay('2024-02-29','YOU CAN’T ALWAYS (BE) GET(TING) WHAT YOU WANT');
  assert.equal(await calendarQuote.locator('details').getAttribute('open'),null);
  assert.equal(await calendarQuote.locator('summary').evaluate(el=>el===document.activeElement),true);
  for(const [stamp,iso,title] of [
   ['2024-03-01T00:00:00-05:00','2024-03-01','WHERE PHILOSOPHY BEGINS'],
   ['2025-02-28T23:59:58-05:00','2025-02-28','WHEN YOU LOSE CONTROL'],
   ['2025-03-01T00:00:00-05:00','2025-03-01','WHERE PHILOSOPHY BEGINS'],
   ['2026-11-13T08:00:00-05:00','2026-11-13','NEVER COMPLAIN, NEVER EXPLAIN'],
   ['2026-12-31T23:59:58-05:00','2026-12-31','GET ACTIVE IN YOUR OWN RESCUE'],
   ['2027-01-01T00:00:00-05:00','2027-01-01','CONTROL AND CHOICE']
  ]){
   await calendarPage.clock.setSystemTime(new Date(stamp));
   await calendarPage.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
   await assertDay(iso,title);
  }
  assert.equal(await calendarPage.locator('#compassQuoteData').count(),0);
  await calendarPage.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await calendarContext.setOffline(true);
  await calendarPage.reload({waitUntil:'domcontentloaded'});
  await assertDay('2027-01-01','CONTROL AND CHOICE');
  await calendarQuote.locator('summary').click();
  assert.equal(await calendarQuote.locator('.ms-quote-detail').isVisible(),true);
  await calendarContext.setOffline(false);
  await calendarPage.evaluate(()=>{
   delete window.MementoStoicDays['11-13'];
  });
  await calendarPage.clock.setSystemTime(new Date('2027-11-13T08:00:00-05:00'));
  await calendarPage.evaluate(()=>window.dispatchEvent(new Event('pageshow')));
  assert.equal(await calendarQuote.locator('time').getAttribute('datetime'),'2027-11-13');
  assert.match(await calendarQuote.innerText(),/Quote tijdelijk niet beschikbaar/);
  assert.equal(await calendarQuote.locator('summary').count(),0);
  console.log('PASS local midnight, leap day, New Year, resume, offline reload and missing quote');
  await calendarContext.close();
 }finally{if(browser)await browser.close();await new Promise(done=>server.close(done))}
})().catch(e=>{console.error(e);process.exitCode=1});
