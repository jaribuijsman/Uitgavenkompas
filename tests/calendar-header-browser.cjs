'use strict';
// Isolated real-render regression; HTTPS/OAuth/API are fixtures, never user accounts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=process.env.MEMENTO_CALENDAR_ROOT||path.resolve(__dirname,'..'),phase=process.env.MEMENTO_CALENDAR_PHASE||'after';
const out=process.env.MEMENTO_CALENDAR_OUT||'/tmp/memento-calendar-header';fs.mkdirSync(path.join(out,phase),{recursive:true});
const reports=[];
(async()=>{let browser;try{
 browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
 const original=await require('./helpers/visual-fixture.cjs').fixture();
 const fixture=JSON.parse(JSON.stringify(original).replaceAll('2026-10-27','2026-10-30'));
 fixture.life.appointments.push({...fixture.life.appointments[0],id:'completed-fixture',title:'Afgeronde fictieve afspraak',done:true,completedAt:'2026-10-30T08:00:00.000Z'});
 for(const width of [360,393,412,1280]){
  const ctx=await browser.newContext({viewport:{width,height:852},hasTouch:width<800,reducedMotion:'reduce',locale:'nl-NL',timezoneId:'Europe/Amsterdam',serviceWorkers:'block'});
  await ctx.route('https://**/*',async route=>{
   const u=new URL(route.request().url());if(u.hostname!=='memento.test')return route.abort();
   const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
   await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream'});
  });
  await ctx.addInitScript(()=>{const D=Date,t=D.parse('2026-10-30T09:30:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});
  if(process.env.MEMENTO_CALENDAR_FONT)await ctx.addInitScript(font=>document.addEventListener('DOMContentLoaded',()=>document.documentElement.style.setProperty('--m-font',font)),process.env.MEMENTO_CALENDAR_FONT);
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://memento.test/manifest.json');
  await page.evaluate(d=>{localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(d.pin));localStorage.setItem('memento_gcal_connected_preference_v1','yes');},fixture);
  await page.goto('https://memento.test/');await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  const today=()=>page.locator(width>800?'#lifeNavigation [data-life-view="today"]':'#mementoQuickNav [data-memento-dest="life:today"]').click();
  if(width>800&&await page.evaluate(()=>document.body.dataset.compassArea)!=='life')await page.locator('#compassAreaBar [data-compass-area="life"]').click();
  await today();
  await page.evaluate(()=>document.fonts.ready);
  const day=page.locator('[data-memento-date="2026-10-30"]'),header=day.locator('.memento-day-caption');
  await header.scrollIntoViewIfNeeded();
  const measure=()=>page.evaluate(()=>{const day=document.querySelector('[data-memento-date="2026-10-30"]'),h=day.querySelector('.memento-day-caption'),rect=s=>h.querySelector(s)?.getBoundingClientRect().toJSON();return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,header:h.getBoundingClientRect().toJSON(),duty:rect('.memento-duty-badge'),connect:rect('[data-memento-gcal-connect]'),dayAdd:document.querySelector('.memento-day-add-menu>summary')?.getBoundingClientRect().toJSON(),firstTask:document.querySelector('.life-day-column .life-task')?.getBoundingClientRect().toJSON()};});
  const report=await measure();reports.push(report);
  await page.screenshot({path:path.join(out,phase,width+'-day.png'),fullPage:true,animations:'disabled'});
  await day.screenshot({path:path.join(out,phase,width+'-appointments.png'),animations:'disabled'});
  assert(report.scrollWidth<=width+1);assert.equal(await header.locator('.memento-duty-badge').count(),0);assert.equal(await page.evaluate(()=>window.MementoFitnessCore.duty('2026-10-30').time),'14:00–22:00');
  if(phase==='after'){
   const icon=header.getByRole('button',{name:'Google-agenda opnieuw verbinden',exact:true});assert.equal(await icon.count(),1);
   assert.equal(await page.locator('[data-memento-gcal-connect]').count(),1);assert.equal(await day.locator('.memento-day-hint button').count(),0);
   assert(report.connect.width>=44&&report.connect.height>=44);
   assert.equal(report.header.height,44,'Header stays on one row with platform fonts');
   assert.equal(report.duty,null,'Shift badge is removed from the appointment header');
   assert(report.dayAdd.width>=44&&report.dayAdd.height>=44,'New add menu is touch accessible');
   assert(report.connect.y>=report.header.y,'Connection icon remains inside header row');
   const stored=()=>page.evaluate(()=>({life:JSON.parse(localStorage.getItem('compass_life_preview_v1')),finance:localStorage.getItem('uitgavenkompas_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')}));
   const before=await stored();
   // Exercise the existing delegated handler and actual OAuth callback with a fake client.
   await page.evaluate(()=>{window.__oauth=[];window.google={accounts:{oauth2:{initTokenClient:options=>{window.__oauth.push({scope:options.scope});window.__oauthCallback=options.callback;return {requestAccessToken:request=>window.__oauth.push(request)};}}}};});
   await icon.click();assert.deepEqual(await page.evaluate(()=>window.__oauth),[{scope:'https://www.googleapis.com/auth/calendar.events.readonly'},{prompt:''}]);
   await icon.focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>window.__oauth.length),4);
   await page.route('https://www.googleapis.com/calendar/v3/calendars/primary/events?**',r=>r.fulfill({json:{items:[{id:'remote-fixture',summary:'Fictieve Google-afspraak',start:{dateTime:'2026-10-30T12:00:00+01:00'},end:{dateTime:'2026-10-30T13:00:00+01:00'}}]}}));
   await page.evaluate(()=>window.__oauthCallback({access_token:'isolated-test-token',expires_in:3600}));
   await page.waitForFunction(()=>window.MementoGoogleCalendar.todayState().connected&&!window.MementoGoogleCalendar.todayState().loading);
   assert.equal(await day.getByText('Fictieve Google-afspraak',{exact:true}).count(),1);
   const after=await stored();assert.equal(after.finance,before.finance);assert.equal(after.pin,before.pin);
   for(const key of ['tasks','notes','appointments','fitness','settings'])assert.deepEqual(after.life[key],before.life[key],key+' remains unchanged by Google sync');
   const completed=page.locator('[data-life-day="2026-10-30"] .memento-day-completed>summary');
   await completed.click();assert.equal(await page.getByText('Afgeronde fictieve afspraak',{exact:true}).isVisible(),true);
   await completed.click();
   await page.locator('.memento-day-add-menu>summary').click();
   await page.locator('.memento-day-add-actions [data-memento-day-new-event]').click();assert.equal(await page.locator('#lifeDialog').isVisible(),true);
   await page.locator('#lifeDialog .life-close').click();
   await page.evaluate(()=>{localStorage.removeItem('memento_gcal_connected_preference_v1');});await page.reload();await require('./helpers/enter-app.cjs')(page);
   await today();
   assert.equal(await day.getByRole('button',{name:'Google-agenda verbinden',exact:true}).count(),1);
   await page.setViewportSize({width,height:430});await header.scrollIntoViewIfNeeded();assert((await measure()).scrollWidth<=width+1);
   await page.evaluate(()=>document.documentElement.style.fontSize='20px');assert((await measure()).scrollWidth<=width+1);
  }
  assert.deepEqual(errors,[]);await ctx.close();
 }
 console.log(JSON.stringify({phase,reports,passed:true},null,2));
}finally{fs.writeFileSync(path.join(out,phase,'report.json'),JSON.stringify({phase,reports},null,2));await browser?.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
