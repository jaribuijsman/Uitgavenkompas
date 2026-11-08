'use strict';
/* Real rendered application; isolated fixtures and mocked Google transport only. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{fixture}=require('./helpers/visual-fixture.cjs'),{task}=require('./helpers/storage-fixture.cjs');
const baseline=process.env.MEMENTO_AGENDA_BASELINE_ROOT,root=baseline||path.resolve(__dirname,'..'),out='/tmp/memento-agenda-plan/'+(baseline?'before':'after');fs.mkdirSync(out,{recursive:true});
const reports=[];
async function nav(page,view){
 if(page.viewportSize().width>800){if(await page.evaluate(()=>document.body.dataset.compassArea)!=='life')await page.locator('#compassAreaBar [data-compass-area="life"]').click();await page.locator('#lifeNavigation [data-life-view="'+view+'"]').click();return}
 if(view==='today'){await page.locator('#mementoQuickNav [data-memento-dest="life:today"]').click();return}
 await page.locator('[data-memento-menu="open"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:'+view+'"]').click();
}
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));
async function shot(page,name){await page.evaluate(()=>document.fonts.ready);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow: '+name);await page.screenshot({path:path.join(out,name+'.png'),fullPage:false});}
(async()=>{let browser;try{
 browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const width of [360,393,412,1280])for(const theme of ['forest','superdark']){
  const ctx=await browser.newContext({viewport:{width,height:852},hasTouch:width<800,isMobile:width<800,reducedMotion:'reduce',locale:'nl-NL',timezoneId:'Europe/Amsterdam',serviceWorkers:'block'});
  await ctx.route('https://**/*',route=>{const u=new URL(route.request().url());if(u.hostname!=='memento.test')return route.abort();const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream'});});
  await ctx.addInitScript(()=>{const D=Date,t=D.parse('2026-11-08T10:00:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]))}static now(){return t}};});
  const data=await fixture();data.life.tasks=Array.from({length:12},(_,i)=>({...task('plan-task-'+i,'Fictieve taak '+i+' met langere titel'),date:'2026-11-08',category:i<8?'Persoonlijk':'Werk'}));
  const event=(id,date)=>({id,title:'Fictieve afspraak '+id,date,time:'09:00',allDay:false,done:false,notes:'Bewaar',createdAt:'2026-11-01T10:00:00Z'});
  data.life.appointments=Array.from({length:6},(_,i)=>event('local-'+i,'2026-11-'+String(i+6).padStart(2,'0')));
  data.life.appointments.push(event('night-marker','2026-11-02'));
  data.life.appointments.push({...event('birthday','2026-11-08'),title:'Fictieve verjaardag',recurrence:'yearly',allDay:true,time:''});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://memento.test/manifest.json');await page.evaluate(({data,theme})=>{localStorage.setItem('compass_life_preview_v1',JSON.stringify(data.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));localStorage.setItem('memento_card_theme_v1',theme);},{data,theme});
  await page.goto('https://memento.test/');await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  const original=await stored(page),finance=await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1'));const prefix=width+'-'+theme;
  console.log('VERIFY '+prefix);await nav(page,'today');await page.locator('[data-life-day-slide="0"]').click();await shot(page,prefix+'-day');
  if(!baseline){assert.equal(await page.locator('.ml-day-context,.mg-day-head').count(),0);assert.match(await page.locator('#mementoDaySelectedDate').innerText(),/zondag 8 november.*Ochtenddienst.*06:00–14:00/);await page.locator('[data-life-day-slide="1"]').click();assert.match(await page.locator('#mementoDaySelectedDate').innerText(),/maandag 9 november.*Middagdienst/);}
  await nav(page,'tasks');await shot(page,prefix+'-tasks');
  if(!baseline){
   assert.equal(await page.locator('#lifeQuickForm').count(),0);assert.equal(await page.locator('.memento-task-category[open]').count(),0);assert(await page.locator('#lifeAdd').isVisible());
   await page.locator('[data-task-group="Persoonlijk"]>summary').click();await page.locator('[data-task-group="Werk"]>summary').click();assert.equal(await page.locator('.memento-task-category[open]').count(),2);
   await page.locator('#lifeSearch').fill('Fictieve');assert.equal(await page.locator('.memento-task-category[open]').count(),2,'Filtering preserves disclosure choices');await page.locator('#lifeSearch').fill('');
   await shot(page,prefix+'-tasks-expanded');
   await nav(page,'agenda');await nav(page,'tasks');assert.equal(await page.locator('.memento-task-category[open]').count(),0,'Re-entry collapses groups');
  }
  await nav(page,'agenda');await shot(page,prefix+'-agenda');
  if(!baseline){
   const geometry=await page.locator('[data-gcal-day="2026-11-08"]').evaluate(el=>{const r=s=>el.querySelector(s).getBoundingClientRect().toJSON();return {cell:el.getBoundingClientRect().toJSON(),number:r(':scope>span:first-child'),dot:r('.memento-cal-dots'),duty:r('.memento-duty-code'),color:getComputedStyle(el.querySelector('.memento-cal-dots')).backgroundColor,dutyColor:getComputedStyle(el.querySelector('.memento-duty-code')).color,cellColor:getComputedStyle(el).color}});
   assert.equal(geometry.dutyColor,geometry.cellColor,'Selected shift letter inherits the readable selected text color');
   assert(geometry.dot.x>=geometry.number.right&&geometry.dot.right<=geometry.cell.right,'Dot sits beside number within cell');assert(geometry.dot.bottom<=geometry.duty.top,'Dot does not sit below duty');
   assert.equal(await page.locator('[data-gcal-day="2026-11-11"] .memento-duty-code').innerText(),'');assert(await page.locator('[data-gcal-day="2026-11-11"]').evaluate(el=>el.classList.contains('has-gcal-event')),'Free day keeps appointment dot');
   assert.equal(await page.locator('[data-gcal-day="2026-11-12"].has-gcal-event').count(),0,'No false dot on empty date');reports.push({width,theme,geometry});
  }
  if(!baseline&&width===393&&theme==='forest'){
   for(let i=0;i<12;i++)await page.locator('[data-memento-agenda-shift="1"]').click();await page.locator('[data-gcal-day="2027-11-08"]').click();assert(await page.getByText('Fictieve verjaardag',{exact:true}).isVisible(),'Yearly all-day occurrence appears next year');for(let i=0;i<12;i++)await page.locator('[data-memento-agenda-shift="-1"]').click();
   await page.evaluate(()=>{const e={id:'google-night-fixture',summary:'Fictief over middernacht',start:{dateTime:'2026-11-12T23:30:00+01:00'},end:{dateTime:'2026-11-13T00:30:00+01:00'}};window.MementoLife.rememberGoogleAppointments([e,e],'2026-11-12','2026-11-14');window.MementoGoogleCalendar.refreshAgenda();});
   for(const date of ['2026-11-12','2026-11-13']){assert(await page.locator('[data-gcal-day="'+date+'"]').evaluate(el=>el.classList.contains('has-gcal-event')));await page.locator('[data-gcal-day="'+date+'"]').click();assert.equal(await page.locator('#memento-gcal-events').getByText('Fictief over middernacht',{exact:true}).count(),1,'Google instance is deduplicated across calendar days');}
   // Create from the retained editor and verify one persisted series plus virtual occurrences.
   await page.locator('[data-memento-new-event]').click();await page.locator('#mementoEventTitle').fill('Fictieve wekelijkse afspraak');await page.locator('#mementoEventDate').fill('2026-11-09');await page.locator('#mementoEventAllDay').check();await page.locator('#mementoEventRecurrence').selectOption('weekly');await page.setViewportSize({width,height:480});await page.locator('#mementoEventRecurrence').focus();assert(await page.locator('.life-dialog-footer').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1}),'Editor save/cancel reachable with keyboard-height viewport');await shot(page,prefix+'-recurrence-editor');await page.setViewportSize({width,height:852});await page.locator('[form="mementoAppointmentForm"][type="submit"]').click();
   let state=await stored(page),series=state.appointments.find(e=>e.title==='Fictieve wekelijkse afspraak');assert.equal(state.appointments.length,original.appointments.length+1);assert.equal(series.time,'');
   const occurrence=id=>page.locator('[data-memento-edit-event="'+series.id+'::'+id+'"]');
   await page.locator('[data-gcal-day="2026-11-16"]').click();await occurrence('2026-11-16').click();assert.equal(await page.locator('#mementoEventScope').inputValue(),'occurrence');await page.locator('#mementoEventTitle').fill('Alleen dit voorkomen');await page.locator('#mementoEventDate').fill('2026-11-17');await page.locator('[form="mementoAppointmentForm"]').click();
   await page.locator('[data-gcal-day="2026-11-17"]').click();assert(await page.locator('#memento-gcal-events').getByText('Alleen dit voorkomen',{exact:true}).isVisible());assert.equal(await page.locator('[data-gcal-day="2026-11-16"].has-gcal-event').count(),0);
   await occurrence('2026-11-16').click();await page.locator('.memento-appt-manage>summary').click();page.once('dialog',d=>d.accept());await page.locator('[data-memento-delete-event]').click();assert.equal((await stored(page)).appointments.find(e=>e.id===series.id).exceptions['2026-11-16'].cancelled,true);
   await page.locator('[data-gcal-day="2026-11-23"]').click();await occurrence('2026-11-23').click();await page.locator('#mementoEventScope').selectOption('series');assert.equal(await page.locator('#mementoEventDate').inputValue(),'2026-11-09','Whole-series editing uses original anchor');await page.locator('#mementoEventTitle').fill('Hele reeks gewijzigd');await page.locator('[form="mementoAppointmentForm"]').click();assert(await page.getByText('Hele reeks gewijzigd',{exact:true}).isVisible());
   await page.reload();await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await nav(page,'agenda');await page.locator('[data-gcal-day="2026-11-23"]').click();assert(await page.getByText('Hele reeks gewijzigd',{exact:true}).isVisible());await occurrence('2026-11-23').click();await page.locator('#mementoEventScope').selectOption('series');await page.locator('.memento-appt-manage>summary').click();page.once('dialog',d=>d.accept());await page.locator('[data-memento-delete-event]').click();assert.equal((await stored(page)).appointments.length,original.appointments.length);
   // Android touch: moving before the hold cancels sorting; holding activates feedback.
   await nav(page,'tasks');await page.locator('[data-task-group="Persoonlijk"]>summary').click();const list=page.locator('[data-task-category="Persoonlijk"]'),grip=list.locator('.memento-sort-handle').first();await grip.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
   const options=await list.evaluate(el=>({delay:Sortable.get(el).options.delay,handle:Sortable.get(el).options.handle}));assert.equal(options.delay,500);assert.equal(options.handle,'.memento-sort-handle');
   const before=await stored(page),session=await ctx.newCDPSession(page),box=await grip.boundingBox(),point={x:box.x+box.width/2,y:box.y+box.height/2,id:1};
   await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...point,y:point.y-40}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await page.locator('.memento-sort-chosen').count(),0);assert.deepEqual((await stored(page)).tasks,before.tasks);
   await page.evaluate(()=>new Promise(resolve=>{let last=scrollY,stable=0;function frame(){stable=scrollY===last?stable+1:0;last=scrollY;if(stable>=4)resolve();else requestAnimationFrame(frame)}requestAnimationFrame(frame)}));await grip.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));const b=await grip.boundingBox(),p={x:b.x+b.width/2,y:b.y+b.height/2,id:2};assert(await page.evaluate(p=>Boolean(document.elementFromPoint(p.x,p.y)?.closest('.memento-sort-handle')),p),'Hold begins on the visible grip');await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await page.waitForFunction(()=>document.querySelector('.memento-sort-chosen'),null,{timeout:2000});assert.equal(await page.locator('.memento-sort-chosen').count(),1,'Feedback begins after hold');await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();await list.locator('[data-life-detail]').first().click();assert(await page.locator('#lifeDialog').isVisible(),'Normal task tap opens detail');await page.locator('#lifeDialog .life-close').click();
   assert.equal(await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1')),finance);state=await stored(page);assert.deepEqual(state.notes,original.notes);assert.deepEqual(state.appointments,original.appointments);
  }
  assert.deepEqual(errors,[],'No runtime errors '+prefix);await ctx.close();
 }
 fs.writeFileSync(path.join(out,'geometry.json'),JSON.stringify(reports,null,2));console.log('PASS plan browser: '+(baseline?'baseline screenshots':'day context, task defaults, recurrence lifecycle, touch and both themes at 360/393/412/1280px'));
}finally{await browser?.close()}})().catch(e=>{console.error(e);process.exitCode=1});
