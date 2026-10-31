'use strict';
// Isolated fictional fixtures. Verify visible controls and hitboxes, not just document width.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),root=path.resolve(process.env.MEMENTO_RECOVERY_ROOT||path.join(__dirname,'..'));
const out=process.env.MEMENTO_RECOVERY_OUT||'/tmp/memento-recovery';fs.mkdirSync(out,{recursive:true});
const {task}=require('./helpers/storage-fixture.cjs'),reveal=require('./helpers/reveal.cjs');
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 if(name==='/__seed__'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Isolated recovery fixture</title>');return;}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
async function settle(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function nav(page,view){
 if(page.viewportSize().width>800)await page.locator('#lifeNavigation [data-life-view="'+view+'"]').click();
 else{await page.locator('[data-memento-menu=open]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:'+view+'"]').click();}
 await settle(page);
}
async function targets(page,selector){
 const rows=await page.locator(selector).evaluateAll(nodes=>nodes.filter(n=>n.checkVisibility()).map(n=>{const r=n.getBoundingClientRect();return {label:n.getAttribute('aria-label')||n.textContent,width:r.width,height:r.height};}));
 assert(rows.length,selector+' has visible controls');for(const r of rows)assert(r.width>=43.9&&r.height>=43.9,JSON.stringify(r));return rows;
}
async function checkbox(page,selector){
 const r=await page.locator(selector).first().evaluate(n=>{const s=getComputedStyle(n),p=getComputedStyle(n,'::before'),r=n.getBoundingClientRect();return {rect:r.toJSON(),border:parseFloat(s.borderWidth),background:s.backgroundColor,visualWidth:parseFloat(p.width),visualHeight:parseFloat(p.height)};});
 assert(r.rect.width>=44&&r.rect.height>=44);assert.equal(r.border,0);assert.equal(r.background,'rgba(0, 0, 0, 0)');assert(r.visualWidth>=22&&r.visualWidth<=24);assert(r.visualHeight>=22&&r.visualHeight<=24);return r;
}
(async()=>{let browser;const checks=[],errors=[];try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
 const data=await require('./helpers/visual-fixture.cjs').fixture(),url='http://127.0.0.1:'+server.address().port;
 for(const width of [360,393,412,1280])for(const count of [0,1,43]){
  const ctx=await browser.newContext({viewport:{width,height:852},hasTouch:width<800,reducedMotion:'reduce',locale:'nl-NL',timezoneId:'Europe/Amsterdam'});await ctx.route('https://**/*',r=>r.abort());
  await ctx.addInitScript(()=>{const D=Date,t=Date.parse('2026-10-27T09:30:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});
  const page=await ctx.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  const fixture=structuredClone(data);fixture.life.tasks=Array.from({length:count},(_,i)=>({...task('recovery-'+i,i===0?'Een lange fictieve taak met meerdere woorden, subtaken en voldoende ruimte voor bediening zonder overlap':'Fictieve taak '+i),category:i===0?'Huishouden':'Persoonlijk',priority:i===0,date:i===0?'2026-10-26':'2026-10-27',steps:i===0?[{text:'Eerste stap',done:false}]:[]}));
  await page.goto(url+'/__seed__');await page.evaluate(d=>{localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));},fixture);await page.goto(url);await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await nav(page,'tasks');
  const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));const before=await stored(),financeBefore=await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1'));
  assert.equal(await page.locator('#lifeTaskResults .life-task').count(),count);assert.equal(await page.locator('.mg-task-overviews').getAttribute('open'),null);assert.equal(await page.locator('#lifeQuickTitle').isVisible(),false);
  assert.equal(await page.locator('[data-mg-save-task-filter]').isVisible(),false);assert.equal(await page.locator('#mgTaskFilterChips').isVisible(),false);
  const row={width,count};
  if(count){
   row.checkbox=await checkbox(page,'.life-complete');const title=await page.locator('.life-task-title').first().boundingBox(),control=row.checkbox.rect;assert(control.right<=title.x+1,'Checkbox does not overlap title');
   row.firstTask=await page.locator('.life-task').first().boundingBox();if(width<800){assert(row.firstTask.y<452,'First task moves above baseline y452');assert(row.firstTask.y+row.firstTask.height<=(await page.locator('#mementoQuickNav').boundingBox()).y,'Whole first task visible');}
   await page.locator('.life-task-menu>summary').first().click();await settle(page);
   const menu=page.locator('.life-task-menu[open] .life-task-actions');await menu.waitFor({state:'visible'});assert(await menu.evaluate(n=>{const r=n.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight;}));
   assert(await menu.locator('button').first().evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'Menu has an unobstructed hit target');
   await page.screenshot({path:path.join(out,width+'-'+count+'-menu.jpg'),type:'jpeg',animations:'disabled'});await page.locator('.life-task-menu[open]>summary').click();
   await page.locator('[data-life-complete="recovery-0"]').focus();await page.keyboard.press('Space');assert((await stored()).tasks.find(t=>t.id==='recovery-0').done);
   await page.locator('[data-life-task-tab=done]').click();await page.locator('[data-life-complete="recovery-0"]').click();await page.locator('[data-life-task-tab=open]').click();assert.equal((await stored()).tasks.find(t=>t.id==='recovery-0').done,false);
   await page.locator('.memento-filter-drawer>summary').click();await page.locator('#lifeTaskScopeFilter').selectOption('household');assert.equal(await page.locator('.life-task').count(),1);
   await page.locator('[data-mg-save-task-filter]').click();await page.locator('#mgTaskFilterName').fill('Fictieve selectie');await page.locator('[form=mgSavedTaskFilterForm]').click();const preset=(await stored()).uiPreferences.taskFilters.at(-1);assert(preset);
   await page.locator('[data-mg-clear-task=taskScope]').click();assert.equal(await page.locator('.life-task').count(),count);await reveal(page,'[data-mg-load-task-filter="'+preset.id+'"]');await page.locator('[data-mg-load-task-filter="'+preset.id+'"]').click();assert.equal(await page.locator('.life-task').count(),1);
   await page.locator('[data-mg-clear-task=taskScope]').click();if(await page.locator('.memento-filter-drawer').getAttribute('open')!==null)await page.locator('.memento-filter-drawer>summary').click();assert.equal(await page.locator('[data-mg-save-task-filter]').isVisible(),false);
   if(count===43){await page.locator('#lifeTaskResults .life-task').last().scrollIntoViewIfNeeded();assert(await page.locator('#lifeTaskResults .life-task').last().isVisible());await page.evaluate(()=>scrollTo(0,0));}
   for(const t of before.tasks.slice(1))assert.deepEqual((await stored()).tasks.find(x=>x.id===t.id),t);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),width);await page.screenshot({path:path.join(out,width+'-'+count+'-tasks.jpg'),type:'jpeg',animations:'disabled'});
  // Layout refresh is idempotent: no duplicate disclosures, fields or storage writes.
  const structure=await page.locator('#lifeContent').innerHTML(),raw=await page.evaluate(()=>localStorage.getItem('compass_life_preview_v1'));
  await page.evaluate(()=>{for(let i=0;i<5;i++)window.MementoLayout.refresh();});await settle(page);assert.equal(await page.locator('#lifeContent').innerHTML(),structure);assert.equal(await page.evaluate(()=>localStorage.getItem('compass_life_preview_v1')),raw);
  if(count===1){
   await nav(page,'groceries');
   const shopping=await page.locator('.shopping-row').first().evaluate(n=>({columns:getComputedStyle(n).gridTemplateColumns.split(' ').map(parseFloat),check:n.querySelector('.shopping-check').getBoundingClientRect().toJSON()}));
   assert.equal(shopping.columns[0],44,'Shopping keeps its original compact 44px column');assert(shopping.check.width>=44&&shopping.check.height>=44);row.shopping=shopping;
   await nav(page,'today');await targets(page,'.memento-event-complete,.memento-v3-menu>summary');await checkbox(page,'.memento-event-complete');
   const taskCard=page.locator('#lifeApp[data-life-view="today"] .life-overdue .memento-unified-task').first();
   assert.equal(await taskCard.count(),1,'Overdue task uses the same visual card structure as appointments');
   assert.equal(await taskCard.locator(':scope > .memento-unified-time').textContent(),'26 okt','Task date is shown instead of an invented clock time');
   const parity=await taskCard.evaluate(card=>{
    const appointment=document.querySelector('.memento-unified-event:not(.memento-unified-task)');
    const styles=[card,appointment].map(n=>getComputedStyle(n));
    const rects=n=>Array.from(n.children).map(el=>el.getBoundingClientRect().toJSON());
    const task=rects(card),event=rects(appointment);
    const rect=card.getBoundingClientRect();
    return {taskColumns:styles[0].gridTemplateColumns.split(' ').length,eventColumns:styles[1].gridTemplateColumns.split(' ').length,
      taskElements:task.length,eventElements:event.length,taskRect:rect.toJSON(),
      firstTarget:task[0],date:task[1],info:task[2],action:task[3],
      taskSurface:styles[0].backgroundColor,eventSurface:styles[1].backgroundColor,
      taskRadius:styles[0].borderRadius,eventRadius:styles[1].borderRadius,
      taskBorders:[styles[0].borderTopWidth,styles[0].borderBottomWidth],
      label:card.querySelector('.life-task-menu>summary')?.textContent?.trim()};
   });
   assert.equal(parity.taskColumns,parity.eventColumns,'Task and appointment must have equal grid structure');
   assert.equal(parity.taskElements,4);assert.equal(parity.eventElements,4);
   assert(parity.firstTarget.right<=parity.date.left+1,'Task checkbox must not overlap date');
   assert(parity.info.right<=parity.action.left+1,'Task content must not overlap edit action');
   assert.equal(parity.taskSurface,parity.eventSurface,'Matching cards must have same card background');
   assert.equal(parity.taskRadius,parity.eventRadius,'Matching cards must have same corner radius');
   assert.equal(parity.label,'⋮');
   await targets(page,'.memento-unified-task .life-complete,.memento-unified-task .memento-v3-menu>summary');
   await taskCard.locator('.memento-v3-menu>summary').click();
   const menuActions=taskCard.locator('.life-task-menu[open] .life-task-actions');await menuActions.waitFor({state:'visible'});
   assert.equal(await menuActions.locator('[data-life-duplicate]').count(),1,'Duplicate action stays accessible');
   assert.equal(await menuActions.locator('[data-life-star]').count(),1,'Priority action stays accessible');
   await menuActions.locator('[data-life-edit-task]').click();await page.locator('#lifeDialog').waitFor({state:'visible'});
   assert((await page.locator('#lifeDialogTitle').textContent()).includes('Taak bewerken'));
   await page.keyboard.press('Escape');assert.equal(await page.locator('#lifeDialog').isVisible(),false);
   await page.screenshot({path:path.join(out,width+'-day.jpg'),type:'jpeg',animations:'disabled'});
   await nav(page,'agenda');await targets(page,'.memento-event-complete,.memento-edit-event');await checkbox(page,'.memento-event-complete');
   const boxes=await page.locator('.memento-unified-event').first().evaluate(n=>[...n.children].map(c=>c.getBoundingClientRect().toJSON()));assert(boxes[0].right<=boxes[1].left+1,'Appointment hitbox stays in its grid column');
   await page.locator('.memento-event-complete').first().click();assert((await stored()).appointments.some(a=>a.done));
   await nav(page,'today');const completed=page.locator('.memento-completed-appointments .memento-event-complete');await reveal(page,completed);await completed.click();await nav(page,'agenda');
   await page.locator('.memento-edit-event').first().click();await page.locator('#lifeDialog').waitFor({state:'visible'});await page.keyboard.press('Escape');assert.equal(await page.locator('#lifeDialog').isVisible(),false);
   assert(await page.locator('.memento-agenda-month-layout').isVisible());await targets(page,'button.memento-cal-day');await page.screenshot({path:path.join(out,width+'-agenda-month.jpg'),type:'jpeg',animations:'disabled'});
   const appointments=(await stored()).appointments;assert.equal(appointments.length,before.appointments.length);for(const a of before.appointments){const actual=appointments.find(x=>x.id===a.id);assert(actual&&actual.title===a.title&&actual.date===a.date);}
  }
  assert.equal(await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1')),financeBefore);await page.reload();await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  assert.equal((await stored()).tasks.length,count);if(count)assert((await stored()).uiPreferences.taskFilters.some(f=>f.name==='Fictieve selectie'));checks.push(row);await ctx.close();
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,errors}));
}catch(e){checks.push({failure:e.stack});console.error(e);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,errors},null,2));await browser?.close();server.close();}})();
