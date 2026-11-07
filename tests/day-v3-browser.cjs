'use strict';
// Contract: docs/mijn-dag-v3-acceptance.md. Isolated data, no production accounts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out='/tmp/memento-day-v3';fs.mkdirSync(out,{recursive:true});
const reports=[];
(async()=>{
 const fixture=await require('./helpers/visual-fixture.cjs').fixture();
 const {task}=require('./helpers/storage-fixture.cjs');
 const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
 for(const [width,count] of [[360,3],[393,3],[412,3],[1280,3],[393,0],[393,43]]){
  const ctx=await browser.newContext({viewport:{width,height:852},isMobile:width<800,hasTouch:width<800,locale:'nl-NL',timezoneId:'Europe/Amsterdam',reducedMotion:'reduce',serviceWorkers:'block'});
  await ctx.route('https://**/*',route=>{
   const u=new URL(route.request().url());if(u.hostname!=='memento.test')return route.abort();
   const file=path.resolve(root,'.'+(u.pathname==='/'?'/index.html':decodeURIComponent(u.pathname)));
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:''});
   return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json'})[path.extname(file)]||'application/octet-stream'});
  });
  await ctx.addInitScript(()=>{const D=Date,t=D.parse('2026-10-31T13:30:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});
  const data=structuredClone(fixture);
  data.life.tasks=Array.from({length:count},(_,i)=>({...task('v3-task-'+i,i===0?'Een lange taaknaam om de compacte indeling en de volledige tekst in het detail te controleren':'Fictieve taak '+i),date:'2026-10-31',notes:i===0?'Fictieve taaknotitie':'',focusDate:''}));
  data.life.appointments=count?[{...fixture.life.appointments[0],id:'v3-event',title:'Fictieve afspraak met notitie',date:'2026-10-31',time:'12:00',endTime:'13:00',notes:'Dit is een geïsoleerde notitie.',location:''}]:[];
  data.life.googleAppointments=[];data.life.appointmentChecks={};
  if(count){data.life.tasks.push({...task('v3-tomorrow','Fictieve taak voor morgen'),date:'2026-11-01'});}
  if(count===3){data.life.tasks.push({...task('v3-overdue','Fictieve taak die te laat is'),date:'2026-10-30'});}
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);
  const tag=width+'-'+count;
  const shot=label=>page.screenshot({path:path.join(out,tag+'-'+label+'.png'),animations:'disabled'});
  try{
   await page.goto('https://memento.test/manifest.json');
   await page.evaluate(d=>{localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));},data);
   await page.goto('https://memento.test/');await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
   const goToday=async()=>{
    if(width<800)await page.locator('#mementoQuickNav [data-memento-dest="life:today"]').click();
    else await page.locator('#lifeNavigation [data-life-view="today"]').click();
   };
   await goToday();
   if(count===3){
    const overdue=page.locator('[data-life-day="2026-10-31"] .life-overdue-group');
    assert(await overdue.isVisible(),'Overdue tasks retain a visible place on Mijn dag');
    assert.match(await overdue.innerText(),/Te laat — nog te doen/);
    assert(await overdue.locator('[data-life-edit-task="v3-overdue"]').count(),'Overdue task remains actionable');
   }
   const stored=()=>page.evaluate(()=>({life:JSON.parse(localStorage.getItem('compass_life_preview_v1')),finance:localStorage.getItem('uitgavenkompas_v1')}));
   const original=await stored();
   const measure=()=>page.evaluate(()=>{
    const track=document.querySelector('#lifeDayTrack'),r=track.getBoundingClientRect(),card=track.querySelector('.memento-v3-card');
    return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:getComputedStyle(track).overflowX,verticalOverflow:getComputedStyle(track).overflowY,track:r.toJSON(),scrollLeft:track.scrollLeft,slideWidths:[...track.children].map(n=>n.getBoundingClientRect().width),card:card?.getBoundingClientRect().toJSON(),zones:card?[...card.children].map(n=>n.getBoundingClientRect().toJSON()):[]};
   });
   async function contained(label){
    const m=await measure();reports.push({tag,label,...m});
    assert(m.scrollWidth<=m.viewport+1,label+' page overflow: '+JSON.stringify(m));
    assert(['auto','scroll'].includes(m.overflow),label+' lost carousel scroll containment');
    assert.equal(m.verticalOverflow,'hidden',label+' must not introduce a nested vertical scroll area');
    assert(m.slideWidths.every(w=>Math.abs(w-m.track.width)<2),label+' day widths changed');
   }
   await contained('closed');
   const quick=page.locator('#lifeQuickForm');
   assert(await quick.isVisible(),'Quick capture must be visible without expansion');
   assert.equal(await page.locator('.memento-day-quick').count(),0,'Obsolete quick-capture disclosure should be removed');
   assert.equal(await page.locator('.mg-day-head [data-life-journal]').count(),0,'Duplicate header diary shortcut');
   assert.equal(await page.locator('.memento-duty-badge').count(),0,'Duplicate shift hours in appointment caption');
   const quickOrder=await page.evaluate(()=>{const q=document.querySelector('#lifeQuickForm'),s=document.querySelector('#mementoUniversalSearchHost'),d=document.querySelector('.memento-day-v3-bar');return Boolean(q&&s&&d&&(s.compareDocumentPosition(q)&Node.DOCUMENT_POSITION_FOLLOWING)&&(q.compareDocumentPosition(d)&Node.DOCUMENT_POSITION_FOLLOWING))});
   assert(quickOrder,'Quick capture must be between universal search and day selector');
   assert.deepEqual(await quick.locator('[data-life-quick-kind]').allTextContents(),['Notitie','Afspraak','Taak']);
    assert.equal(await page.locator('.memento-day-add-menu,[data-dr-free],.dr-move').count(),0,'No duplicate add or inline timeline planning buttons');
   assert.equal(await quick.locator('[data-life-journal]').count(),0,'Dagboek was removed from quick capture');
   for(const selector of ['[data-life-quick-kind="note"]','[data-life-quick-kind="appointment"]','[data-life-quick-kind="task"]','.memento-voice-btn','.memento-capture-submit','.memento-capture-options']){
    const b=await quick.locator(selector).boundingBox();assert(b&&b.width>=44&&b.height>=44,'Quick action touch area '+selector);
   }
   await quick.locator('[data-life-quick-kind="note"]').click();
   assert.equal(await page.locator('#lifeQuickTitle').getAttribute('placeholder'),'Wat wil je onthouden?');
   await quick.locator('[data-life-quick-kind="task"]').click();
   assert.equal(await page.locator('#lifeQuickTitle').getAttribute('placeholder'),'Wat wil je doen?');
    assert(await quick.locator('#lifeQuickTime').isVisible(),'Task quick capture offers an optional time immediately');
   await shot('day');
   if(!count){assert.equal(await page.locator('.memento-v3-card').count(),0);continue;}
   const event=page.locator('[data-life-day="2026-10-31"] .memento-v3-card').filter({has:page.locator('[data-memento-edit-event="v3-event"]')});
   const zones=await event.evaluate(el=>[...el.children].map(n=>n.getBoundingClientRect().toJSON()));
   assert.equal(zones.length,3);for(let i=0;i<2;i++)assert(zones[i].right<=zones[i+1].left+1,'Time, title and actions must not overlap');
    assert(zones[1].left-zones[0].right>=7,'Appointment title needs visible spacing after the time badge');
   const actions=await event.locator('.memento-event-actions').evaluate(el=>[...el.children].map(n=>({className:n.className,rect:n.getBoundingClientRect().toJSON()})));
   assert.deepEqual(actions.map(n=>n.className),['memento-day-note','memento-event-complete','life-task-menu memento-v3-menu']);
   for(let i=0;i<actions.length-1;i++)assert(actions[i].rect.right<=actions[i+1].rect.left+1,'Note, checkbox and menu must not overlap');
   assert(actions.every(n=>Math.abs(n.rect.y-actions[0].rect.y)<2),'Actions must share one row');
   for(const selector of ['.memento-event-complete','.memento-v3-menu>summary','.memento-day-note>summary']){
    const b=await event.locator(selector).boundingBox();assert(b.width>=44&&b.height>=44,'Touch target '+selector);
   }
   if(count===43){
    await page.locator('[data-life-day="2026-10-31"] .life-task').last().scrollIntoViewIfNeeded();await contained('43-tasks');
    await page.locator('[data-life-day-slide="1"]').click();await page.waitForFunction(()=>document.querySelector('#lifeDayTrack').getBoundingClientRect().height<500);
    await contained('short-day-after-43-tasks');continue;
   }
   await event.locator('.memento-v3-menu>summary').click();
   await page.waitForFunction(()=>!!document.querySelector('#lifeDayTrack.mg-menu-ancestor'));
   await contained('appointment-menu-open');await shot('menu');
   const popup=event.locator('.life-task-actions');const b=await popup.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1);
   await popup.getByRole('button',{name:'Bewerken',exact:true}).click();
   await page.locator('#mementoAppointmentForm').waitFor();
   assert.equal(await page.locator('.life-task-menu[open]').count(),0,'Editing closes the background menu');
   assert.equal(await page.locator('#mementoEventTitle').inputValue(),'Fictieve afspraak met notitie');
   const form=await page.evaluate(()=>{
    const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();
    return {start:rect('#mementoEventTime'),end:rect('#mementoEventEnd'),check:rect('#mementoEventAllDay'),label:rect('label:has(>#mementoEventAllDay)'),title:rect('#mementoEventTitle'),mic:rect('[data-memento-dictate="mementoEventTitle"]')};
   });
   assert(Math.abs(form.start.y-form.end.y)<2,'Times must share a row');assert(form.start.right<=form.end.x+1);
   assert(form.check.width>=20&&form.check.width<=24&&form.check.height<=24,'Checkbox visual dimensions');assert(form.label.height>=44);
   assert(Math.abs(form.title.y-form.mic.y)<2&&form.mic.width===44,'Title and real dictation share one row');
   assert.equal(await page.locator('.life-dialog-footer [data-memento-delete-event]').count(),0);
   assert.equal(await page.locator('.life-dialog-footer [data-life-close]').innerText(),'Annuleren');
   await shot('editor');
   await page.locator('#mementoEventTime').fill('12:15');await page.locator('#mementoEventEnd').fill('13:15');
   await page.locator('#mementoEventAllDay').check();assert.equal(await page.locator('#mementoEventTime').isEnabled(),false);
   await page.locator('#mementoEventAllDay').uncheck();assert.equal(await page.locator('#mementoEventTime').inputValue(),'12:15');
   const notes='Fictieve lange notitie. '.repeat(300);await page.locator('#mementoEventNotes').fill(notes);
   await page.locator('[data-memento-expand-notes]').click();assert.equal(await page.locator('#mementoEventNotes').inputValue(),notes);
   await page.locator('[data-memento-expand-notes]').click();
   await page.setViewportSize({width,height:430});await shot('editor-short');
   const footer=await page.locator('.life-dialog-footer').boundingBox();assert(footer.y>=0&&footer.y+footer.height<=430,'Footer reachable at keyboard-like height');
   await page.setViewportSize({width,height:852});
   await page.locator('#mementoEventEnd').fill('11:00');await page.locator('[form=mementoAppointmentForm]').click();
   assert(await page.locator('#mementoAppointmentError').isVisible());assert.equal(await page.locator('#mementoEventNotes').inputValue(),notes);
   assert.deepEqual(await stored(),original,'Invalid save is read-only');
   await page.locator('#mementoEventEnd').fill('13:15');
   // An actual localStorage failure must preserve the open editor and every draft field.
   await page.evaluate(()=>{const native=Storage.prototype.setItem;window.__restoreStorage=()=>{Storage.prototype.setItem=native};Storage.prototype.setItem=function(k,v){if(k==='compass_life_preview_v1')throw new DOMException('Fixture quota','QuotaExceededError');return native.call(this,k,v)};});
   await page.locator('[form=mementoAppointmentForm]').click();assert(await page.locator('#mementoAppointmentForm').isVisible());
   assert.equal(await page.locator('#mementoEventNotes').inputValue(),notes);assert.deepEqual(await stored(),original);
   await page.evaluate(()=>window.__restoreStorage());
   await page.locator('[form=mementoAppointmentForm]').click();await page.locator('#lifeDialog').waitFor({state:'hidden'});
   const saved=await stored(),updated=saved.life.appointments.find(a=>a.id==='v3-event');
   assert.equal(updated.time,'12:15');assert.equal(updated.notes,notes.trim());assert.equal(saved.finance,original.finance);
   for(const key of ['tasks','notes','googleAppointments','appointmentChecks'])assert.deepEqual(saved.life[key],original.life[key],key+' preserved');
   await event.locator('.memento-day-note>summary').click();
   await page.waitForFunction(()=>{const p=document.querySelector('.memento-day-note[open]>.memento-day-note-content');return p?.style.top&&p.getBoundingClientRect().top>=0&&p.getBoundingClientRect().bottom<=innerHeight;});
   await page.waitForFunction(()=>!document.querySelector('#lifeMessage').textContent);
   await contained('note-open');await shot('note');
   const nb=await event.locator('.memento-day-note-content').boundingBox();assert(nb.x>=0&&nb.x+nb.width<=width+1);
   const hit=await event.locator('.memento-day-note-content').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+10,r.y+10));});assert(hit,'Note preview must not be clipped by its carousel');
   await page.keyboard.press('Escape');
   const taskCard=page.locator('[data-life-day="2026-10-31"] .life-task').first();await taskCard.locator('.memento-v3-menu>summary').click();await contained('task-menu-open');
   await page.locator('#lifeDayTrack').evaluate(el=>el.scrollTo({left:el.clientWidth,behavior:'instant'}));await page.waitForFunction(()=>{const t=document.querySelector('#lifeDayTrack');return Math.abs(t.scrollLeft-t.clientWidth)<2});
   await page.waitForFunction(()=>document.querySelectorAll('.life-task-menu[open]').length===0,null,{timeout:3000});
    assert.equal(await page.locator('.life-task-menu[open]').count(),0);await contained('after-menu-and-swipe');await page.evaluate(()=>scrollTo(0,0));await shot('tomorrow');
   await page.locator('[data-life-day-slide="0"]').click();await page.waitForFunction(()=>document.querySelector('#lifeDayTrack').scrollLeft<2);
   await event.locator('.memento-event-complete').click();
   await page.locator('[data-life-day="2026-10-31"] .memento-day-completed>summary').click();
   await page.locator('.memento-event-complete[data-memento-complete-event="v3-event"]').click();assert.equal((await stored()).life.appointments.find(a=>a.id==='v3-event').done,false);
   await event.locator('.memento-v3-title').click();await page.locator('.memento-appt-manage>summary').click();
   page.once('dialog',d=>d.dismiss());await page.locator('[data-memento-delete-event]').click();assert(await page.locator('#mementoAppointmentForm').isVisible());
   page.once('dialog',d=>d.accept());await page.locator('[data-memento-delete-event]').click();assert.equal((await stored()).life.appointments.length,0);
   await page.locator('[data-life-action="undo"]').click();assert((await stored()).life.appointments.some(a=>a.id==='v3-event'));
   await page.reload();await require('./helpers/enter-app.cjs')(page);await goToday();assert.equal((await stored()).life.appointments.find(a=>a.id==='v3-event').notes,notes.trim());

   if(width===393&&count===3){
    // Full quick-capture journey with fictional data only.
    const capture=page.locator('#lifeQuickForm'),baseline=await stored();
    await capture.locator('[data-life-quick-kind="note"]').click();
    await capture.locator('[data-life-quick-options]').click();
    await page.locator('#lifeQuickCollection').selectOption('projects');
    await page.locator('#lifeDialog [data-life-close]').last().click();
    assert((await capture.locator('#lifeQuickCollectionLabel').innerText()).includes('Projecten'));
    await capture.locator('#lifeQuickTitle').fill('Fictieve projectnotitie');
    await capture.locator('.memento-capture-submit').click();
    const afterNote=await stored(),newNote=afterNote.life.notes.find(n=>n.body==='Fictieve projectnotitie');
    assert(newNote&&newNote.collectionId==='projects','Note stored in selected existing folder');
    assert.equal(afterNote.finance,baseline.finance,'Quick note must not alter finance');
    await capture.locator('[data-life-quick-kind="task"]').click();
    const quickGeometry=await capture.evaluate(el=>{
     const rect=s=>{const r=el.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
     const css=s=>{const e=el.querySelector(s),c=getComputedStyle(e);return {display:c.display,gridColumn:c.gridColumn,gridRow:c.gridRow,position:c.position,zIndex:c.zIndex}};
     return {card:rect('#lifeQuickTitle'),toolbar:rect('.memento-capture-toolbar'),date:rect('#lifeQuickDateField'),time:rect('#lifeQuickTime'),options:rect('[data-life-quick-options]'),dateCSS:css('#lifeQuickDateField'),optionsCSS:css('[data-life-quick-options]'),toolbarCSS:css('.memento-capture-toolbar')};
    });
    assert(quickGeometry.date.right<=quickGeometry.time.left+1&&quickGeometry.time.right<=quickGeometry.options.left+1,'Quick date/time/options must not overlap: '+JSON.stringify(quickGeometry));
     assert(quickGeometry.time.width>=96&&quickGeometry.time.height>=44,'Task time input must remain usable');
    await capture.locator('[data-life-quick-options]').click();
    await page.locator('#lifeQuickCategory').selectOption('Huishouden');
    await page.locator('#lifeQuickRoom').selectOption('Keuken');
    await page.locator('#lifeQuickPriority').check();
    await page.locator('#lifeQuickOptionsDate').fill('');
    await page.locator('#lifeDialog [data-life-close]').last().click();
    await capture.locator('#lifeQuickTitle').fill('Fictieve taak zonder datum');
    await capture.locator('.memento-capture-submit').click();
    const afterTask=await stored(),newTask=afterTask.life.tasks.find(t=>t.title==='Fictieve taak zonder datum');
    assert(newTask&&newTask.category==='Huishouden'&&newTask.room==='Keuken'&&newTask.priority&&newTask.date===''&&!newTask.daySlot,'Task options and empty date persisted');
     await capture.locator('[data-life-quick-options]').click();
     await page.locator('#lifeQuickOptionsDate').fill('2026-10-31');
     await page.locator('#lifeDialog [data-life-close]').last().click();
     await capture.locator('#lifeQuickTime').fill('15:30');
     await capture.locator('#lifeQuickTitle').fill('Fictieve taak met tijd');
     await capture.locator('.memento-capture-submit').click();
     const timedQuickTask=(await stored()).life.tasks.find(t=>t.title==='Fictieve taak met tijd');
     assert.equal(timedQuickTask.date,'2026-10-31');
     assert.deepEqual(timedQuickTask.daySlot,{date:'2026-10-31',time:'15:30',minutes:30});
     assert.equal(await page.locator('#lifeQuickTime').inputValue(),'','Successful quick task save resets time draft');
     assert(await page.locator('[data-life-day="2026-10-31"] .dr-timeline [data-order-id="'+timedQuickTask.id+'"]').isVisible());
    await capture.locator('[data-life-quick-kind="appointment"]').click();
    await capture.locator('#lifeQuickTitle').fill('Fictieve snelle afspraak');
    const beforeAppointment=await stored();
    await capture.locator('.memento-capture-submit').click();
    assert(await page.locator('#mementoAppointmentForm').isVisible(),'Appointment opens existing editor');
    assert.equal(await page.locator('#mementoEventTitle').inputValue(),'Fictieve snelle afspraak');
    assert.deepEqual(await stored(),beforeAppointment,'Opening appointment editor must not write anything');
    await page.locator('#lifeDialog [data-life-close]').last().click();
    assert.equal(await capture.locator('#lifeQuickTitle').inputValue(),'Fictieve snelle afspraak','Cancel retains quick draft');
    await capture.locator('.memento-capture-submit').click();
    await page.locator('#mementoEventTime').fill('14:30');
    await page.locator('#mementoEventEnd').fill('15:00');
    await page.locator('[form="mementoAppointmentForm"]').click();
    await page.locator('#lifeDialog').waitFor({state:'hidden'});
    const afterAppointment=await stored(),entry=afterAppointment.life.appointments.find(a=>a.title==='Fictieve snelle afspraak');
    assert(entry&&entry.time==='14:30'&&entry.endTime==='15:00','Quick appointment uses actual editor save');
    assert.equal(afterAppointment.finance,baseline.finance,'All quick changes leave finance untouched');
    assert.equal(afterAppointment.life.notes.length,baseline.life.notes.length+1);
    assert.equal(afterAppointment.life.tasks.length,baseline.life.tasks.length+2);
    assert.equal(afterAppointment.life.appointments.length,baseline.life.appointments.length+1);
    assert.equal(await capture.locator('#lifeQuickTitle').inputValue(),'','Successful save clears draft');
    await shot('quick-capture-a');
    // No free-slot buttons; scheduling remains available in the task submenu.
     assert.equal(await page.locator('[data-dr-free],.dr-move').count(),0);
     const taskSelector='[data-life-day="2026-10-31"] .life-task[data-order-id="v3-task-0"]';
     await page.locator(taskSelector+' .memento-v3-menu>summary').click();
     await page.locator('[data-dr-plan="v3-task-0"]').click();
     await page.locator('#drPlanDate').fill('2026-10-31');
     await page.locator('#drPlanTime').fill('11:00');
     await page.locator('#drPlanMinutes').fill('30');
     await page.locator('[form="drPlanForm"]').click();
     assert.deepEqual((await stored()).life.tasks.find(t=>t.id==='v3-task-0').daySlot,{date:'2026-10-31',time:'11:00',minutes:30});
     assert.equal((await stored()).life.tasks.find(t=>t.id==='v3-task-0').date,'2026-10-31');
     assert.equal(await page.locator('[data-dr-free],.dr-move').count(),0);
     const timedTask='[data-life-day="2026-10-31"] .dr-timeline .life-task[data-order-id="v3-task-0"]';
     assert(await page.locator(timedTask).isVisible(),'Planned task uses normal compact card in timeline');
     assert.equal(await page.locator(timedTask+' .memento-unified-time').innerText(),'11:00');
     await page.locator(timedTask+' .memento-v3-menu>summary').click();
     await page.locator('[data-dr-plan="v3-task-0"]').click();
     await page.locator('#drPlanTime').fill('12:00');
     await page.locator('[form="drPlanForm"]').click();
     assert.match(await page.locator('#drPlanError').innerText(),/overlapt/);
     assert.equal((await stored()).life.tasks.find(t=>t.id==='v3-task-0').daySlot.time,'11:00');
     await page.locator('[data-dr-unplan="v3-task-0"]').click();
     assert.equal((await stored()).life.tasks.find(t=>t.id==='v3-task-0').daySlot,undefined);
     await page.locator(taskSelector+' .memento-v3-menu>summary').click();
     await page.locator('[data-life-edit-task="v3-task-0"]').click();
     assert(await page.locator('#lifeTaskTime').isVisible(),'Task editor exposes time');
     assert.equal(await page.locator('#lifeTaskDate').inputValue(),'2026-10-31');
     await page.locator('#lifeTaskTime').fill('16:30');
     await page.locator('[form="lifeTaskForm"]').click();
     assert.deepEqual((await stored()).life.tasks.find(t=>t.id==='v3-task-0').daySlot,{date:'2026-10-31',time:'16:30',minutes:30});
     await page.locator(timedTask+' .life-task-title').click();
     assert.equal(await page.locator('#lifeDetailTime').inputValue(),'16:30');
     await page.locator('#lifeDetailTime').fill('17:00');
     await page.locator('#lifeTaskDetailForm [type="submit"]').click();
     assert.equal((await stored()).life.tasks.find(t=>t.id==='v3-task-0').daySlot.time,'17:00');
     await page.locator('#lifeDetailTime').fill('');
     await page.locator('#lifeTaskDetailForm [type="submit"]').click();
     assert.equal((await stored()).life.tasks.find(t=>t.id==='v3-task-0').daySlot,undefined,'Clearing time unschedules without deleting task');
     await page.locator('#lifeDialog [data-life-close]').last().click();
     await page.evaluate(()=>window.MementoNavigation.setView('checklists'));
    await page.locator('[data-dr-new]').click();
    await page.locator('#drTitle').fill('Fictieve avondzorg');
    await page.locator('#drMoment').selectOption('evening');
    await page.locator('#drPinned').check();
    await page.locator('#drSteps').fill('Water drinken\nTanden poetsen');
    await page.locator('[form="drChecklistForm"]').click();
    await page.locator('#lifeDialog').waitFor({state:'hidden'});
    await shot('checklists');
    await page.evaluate(()=>window.MementoStart.showWelcome());
    await page.locator('[data-ms-moment="evening"]').click();
    await shot('start-rhythm');
   }
   assert.deepEqual(errors,[]);console.log('PASS V3 design, menu/edit/close/swipe, V2 validation, draft retention and undo at '+width+'px');
  }catch(e){await shot('FAIL').catch(()=>{});throw e;}
  finally{await ctx.close();}
 }
 }finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(reports,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
