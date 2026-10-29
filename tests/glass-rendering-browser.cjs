'use strict';
// Actual app surfaces must scroll without live backdrop-blur; no device FPS claim.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(process.env.MEMENTO_GLASS_ROOT||path.join(__dirname,'..'));
const out=process.env.MEMENTO_GLASS_OUT||'/tmp/memento-glass-rendering';fs.mkdirSync(out,{recursive:true});
const routes=[['day','life','today'],['tasks','life','tasks'],['groceries','life','groceries'],['wishes','life','wishes'],['agenda','life','agenda'],['knowledge','life','notes'],['fitness','life','fitness'],['settings','life','backup'],['finance','finance','dashboard'],['transactions','finance','transactions'],['analysis','finance','analysis'],['accounts','finance','accounts'],['budgets','finance','budgets'],['planning','finance','planning'],['smartbuy','finance','smartbuy'],['moneycoach','finance','moneycoach'],['receipts','finance','receipts'],['finance-settings','finance','settings']];
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 if(name==='/__seed__'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Isolated release acceptance</title>');return;}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
});
async function settle(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function nav(page,area,view){
 if(page.viewportSize().width>800){if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('#compassAreaBar [data-compass-area="'+area+'"]').click();await page.locator(area==='life'?'#lifeNavigation [data-life-view="'+view+'"]':'#sideNav [data-view="'+view+'"]').click();}
 else{await page.locator('[data-memento-menu=open]').click();if(await page.evaluate(()=>document.body.dataset.compassArea)!==area)await page.locator('[data-memento-switch="'+area+'"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="'+area+':'+view+'"]').click();}
 await page.evaluate(()=>scrollTo(0,0));await settle(page);
}

async function inspect(page,screen,width,report){
 const metrics=await page.evaluate(()=>{
  const shown=[...document.querySelectorAll('body *')].filter(n=>!n.closest('#pinLock,#mementoStart')&&n.checkVisibility({opacityProperty:true,visibilityProperty:true})&&n.getBoundingClientRect().width>0&&n.getBoundingClientRect().height>0);
  const blur=shown.filter(n=>getComputedStyle(n).backdropFilter!=='none').map(n=>({tag:n.tagName,id:n.id,classes:n.className,value:getComputedStyle(n).backdropFilter}));
  return {blur,background:getComputedStyle(document.querySelector(document.body.dataset.compassArea==='life'?'#lifeApp':'body>.app')).backgroundAttachment,clientWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth};
 });report.push({width,screen,...metrics});
 await page.screenshot({path:path.join(out,width+'-'+screen+'.jpg'),type:'jpeg',quality:75,animations:'disabled'});
 assert.deepEqual(metrics.blur,[],screen+' must not create live backdrop surfaces');
 if(width<800)assert(!metrics.background.split(',').some(v=>v.trim()==='fixed'),screen+' mobile background must scroll with the page');
 assert(metrics.scrollWidth<=width+1,screen+' horizontal overflow');
}
(async()=>{let browser;const report=[],errors=[];try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});const data=await require('./helpers/visual-fixture.cjs').fixture(),url='http://127.0.0.1:'+server.address().port;
 for(const width of [360,393,412,1280]){
  // Exercise normal motion as well as the reduced-motion accessibility suite.
  const ctx=await browser.newContext({viewport:{width,height:width>800?900:852},hasTouch:width<800,locale:'nl-NL',timezoneId:'Europe/Amsterdam',reducedMotion:'no-preference',serviceWorkers:'block'});await ctx.route('https://**/*',r=>r.abort());
  await ctx.addInitScript(()=>{const D=Date,t=Date.parse('2026-10-27T09:30:00+01:00');window.Date=class extends D{constructor(...a){super(...(a.length?a:[t]));}static now(){return t;}};});
  const page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto(url+'/__seed__');await page.evaluate(d=>{
   localStorage.setItem('uitgavenkompas_v1',JSON.stringify(d.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(d.life));localStorage.setItem('uitgavenkompas_pin_config_v1',JSON.stringify(d.pin));
  },data);
  await page.goto(url);await require('./helpers/enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  await nav(page,'life','notes');
  const stored=()=>page.evaluate(()=>({finance:localStorage.getItem('uitgavenkompas_v1'),life:localStorage.getItem('compass_life_preview_v1'),pin:localStorage.getItem('uitgavenkompas_pin_config_v1')})),before=await stored();
  for(const [name,area,view]of routes){await nav(page,area,view);await inspect(page,name,width,report);}
  if(width<800){await page.locator('[data-memento-menu=open]').click();await inspect(page,'navigation-open',width,report);await page.locator('#mementoMenuClose').first().click();}
  await nav(page,'finance','dashboard');await page.locator('#m9-accounts').click();await inspect(page,'account-sheet-open',width,report);await page.locator('.m9-sheet-head [data-m9-close]').click();
  await nav(page,'finance','analysis');await page.locator('.analysis-tab').nth(1).click();await inspect(page,'analysis-second-tab',width,report);
  await nav(page,'finance','transactions');await page.locator('#addTransaction').click();await inspect(page,'transaction-dialog',width,report);await page.locator('#txDescription').focus();await page.keyboard.press('Escape');await page.locator('#modalBackdrop.open').waitFor({state:'hidden'});
  await nav(page,'life','tasks');await page.locator('#lifeAdd').click();await inspect(page,'task-dialog',width,report);await page.locator('#lifeTaskTitle').focus();await page.keyboard.press('Escape');await page.locator('#lifeDialog').waitFor({state:'hidden'});
  const last=page.locator('.life-task').last();await last.scrollIntoViewIfNeeded();assert(await last.isVisible());await page.evaluate(()=>scrollTo(0,0));
  assert.deepEqual(await stored(),before,'Read-only rendering and scrolling preserve Life/Finance/PIN');await ctx.close();console.log('PASS glass rendering '+width);
 }
 assert.deepEqual(errors,[]);
}catch(e){report.push({failure:e.stack});console.error(e);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,errors},null,2));await browser?.close();server.close();}})();
