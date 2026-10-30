'use strict';
// Real layout bounds catch the tall-but-not-wide regression reported on Android.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),out='/tmp/memento-visual-layout';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname;if(name==='/__seed__'){res.end('<!doctype html><title>Isolated layout QA</title>');return;}const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
async function nav(page,area,view){if(await page.locator('#ms-continue').isVisible())await page.locator('#ms-continue').click();await page.locator('[data-memento-menu=open]').click();if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('[data-memento-switch="'+area+'"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="'+area+':'+view+'"]').click();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
(async()=>{let browser;const report=[],errors=[];try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});const origin='http://127.0.0.1:'+server.address().port,data=await require('./helpers/visual-fixture.cjs').fixture();
 for(const reducedMotion of ['no-preference','reduce'])for(const width of [360,393,412]){
 const ctx=await browser.newContext({viewport:{width,height:852},locale:'nl-NL',timezoneId:'Europe/Amsterdam',hasTouch:true,reducedMotion});await ctx.route('https://**/*',r=>r.abort());
 await ctx.addInitScript(()=>{window.__layoutQueries=0;for(const name of ['querySelector','querySelectorAll']){const orig=Document.prototype[name];Document.prototype[name]=function(...args){window.__layoutQueries++;return orig.apply(this,args);};}});
 const page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/__seed__');await page.evaluate(d=>{localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));},data);await page.goto(origin);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
 await nav(page,'life','tasks');await page.locator('.mg-task-overviews').waitFor();
 async function bounds(){return page.locator('.memento-task-tabs').evaluate(e=>({height:e.getBoundingClientRect().height,items:[...e.children].map(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}))}));}
 const compact=await bounds();assert(compact.height<=100,JSON.stringify(compact));assert(compact.items.every(r=>r.height>=44&&r.height<=64&&r.width>=64),JSON.stringify(compact));
 assert.equal(await page.locator('#lifeQuickTitle').isVisible(),false);const quick=page.locator('.mg-fold').filter({has:page.locator('#lifeQuickForm')});await quick.locator('summary').click();assert(await page.locator('#lifeQuickTitle').isVisible());await quick.locator('summary').click();
 assert.equal(await page.locator('#lifeTaskSort').isVisible(),false);await page.locator('.memento-filter-drawer>summary').click();assert(await page.locator('#lifeTaskSort').isVisible());await page.locator('#lifeTaskSort').selectOption('title');await page.locator('.memento-filter-drawer>summary').click();
 assert.equal(await page.locator('[data-mg-save-task-filter]').evaluate(e=>getComputedStyle(e,'::after').content),'none');
 for(const status of ['archived','saved','trash']){await page.locator('.mg-task-overviews>summary').click();await page.locator('[data-life-task-tab="'+status+'"]').click();await page.locator('.mg-task-overviews').waitFor();assert.equal(await page.locator('[data-life-task-tab="'+status+'"]').getAttribute('aria-pressed'),'true');await page.locator('[data-life-task-tab=open]').click();}
 const first=await page.locator('#lifeTaskResults .life-task').first().boundingBox();const navTop=await page.locator('#mementoQuickNav').evaluate(e=>e.getBoundingClientRect().top);assert(first&&first.y+44<navTop,'First task must be visible above navigation');
 // Plain text changes must not trigger document-wide decoration or notice layout.
 const queries=await page.evaluate(async()=>{const probe=document.createElement('span');probe.hidden=true;document.getElementById('lifeContent').append(probe);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const a=window.__layoutQueries;for(let i=0;i<60;i++){probe.textContent=String(i);await new Promise(r=>requestAnimationFrame(r));}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const n=window.__layoutQueries-a;probe.remove();return n;});assert(queries<100,'60 text updates caused '+queries+' global queries');
 await page.addStyleTag({content:'body #lifeApp .memento-task-tabs :is(button,summary){font-size:16.25px!important}'});const large=await bounds();assert(large.height<=150&&large.items.every(r=>r.height<=80&&r.width>=64),JSON.stringify(large));
 await page.screenshot({path:path.join(out,width+'-'+reducedMotion+'-tasks.jpg'),type:'jpeg',animations:'disabled'});
 await nav(page,'life','wishes');const heading=await page.locator('#lifeTitle').boundingBox();assert(heading&&heading.height<70,'Wish title broke into fragments');
 await nav(page,'life','agenda');
 const agenda=page.locator('.memento-agenda-month-layout');assert(await agenda.isVisible(),'Month calendar is default');
 assert.equal(await agenda.locator('.mg-agenda-tools,.mg-roster-strip,[data-ml-fold=agenda-month]').count(),0,'Old mode/roster/fold removed');
 const days=agenda.locator('button[data-gcal-day]');const count=await days.count();assert(count>=28&&count<=31,'Calendar renders actual month days');
 const calIcon=page.locator('#lifeContent .memento-gcal-menu>summary'),add=page.locator('#lifeContent .memento-agenda-add');
 const iconBox=await calIcon.boundingBox(),addBox=await add.boundingBox();
 assert(iconBox&&addBox&&iconBox.width>=44&&iconBox.height>=44&&addBox.height>=44,'Accessible agenda actions');
 assert(Math.abs(iconBox.y-addBox.y)<2,'Google action and New appointment share a row');
 await calIcon.click();assert(await page.getByRole('button',{name:'Google Agenda verbinden'}).isVisible(),'Live connection action reachable');
 await calIcon.click();
 const chosen=days.nth(10),iso=await chosen.getAttribute('data-gcal-day');await chosen.click();
 assert.equal(await chosen.getAttribute('aria-pressed'),'true','Selected day announced');
 await add.click();assert.equal(await page.locator('#mementoEventDate').inputValue(),iso,'New appointment uses selected date');
 await page.locator('[data-life-close]').last().click();
 const month=await agenda.getAttribute('data-gcal-month');
 await agenda.locator('[data-memento-agenda-shift="1"]').click();
 assert.notEqual(await page.locator('.memento-agenda-month-layout').getAttribute('data-gcal-month'),month,'Next month works');
 await page.locator('[data-memento-agenda-shift="0"]').click();
 assert.equal(await page.locator('.memento-agenda-month-layout').getAttribute('data-gcal-month'),String(new Date().getMonth()),'Today resets the month');
 await page.screenshot({path:path.join(out,width+'-'+reducedMotion+'-agenda.jpg'),type:'jpeg',animations:'disabled'});
 const horizontal=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('#lifeApp *')].map(e=>({tag:e.tagName,cls:String(e.className?.baseVal??e.className??'').slice(0,90),id:e.id,box:e.getBoundingClientRect().toJSON()})).filter(x=>x.box.right>innerWidth+1||x.box.left< -1).slice(0,18)}));
 assert(horizontal.scroll<=width+1,JSON.stringify(horizontal));report.push({width,reducedMotion,compact,large,textUpdates:60,documentQueries:queries,allTaskStatusesReachable:true});await ctx.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,errors},null,2));console.log(JSON.stringify({PASS:report,errors}));
}catch(e){console.error(e.stack);process.exitCode=1;}finally{await browser?.close();server.close();}})();
