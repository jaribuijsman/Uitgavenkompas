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
  const app=getComputedStyle(document.querySelector(document.body.dataset.compassArea==='life'?'#lifeApp':'body>.app'));
  const token=getComputedStyle(document.documentElement);
  const dayMarker=document.querySelector('#lifeApp .dr-marker');
  const fitness=document.querySelector('#mementoFitness');
  const dashboard=document.querySelector('#view-dashboard .dashboard-core-stats>.stat-card');
  return {blur,theme:document.documentElement.dataset.mementoTheme,bodyColor:getComputedStyle(document.body).backgroundColor,appArt:app.backgroundImage,sceneSize:app.backgroundSize,scenePosition:app.backgroundPosition,background:app.backgroundAttachment,nightCard:token.getPropertyValue('--mg-night-card').trim(),checklistToken:token.getPropertyValue('--mg-checklist-bg').trim(),dayMarkerBg:dayMarker?getComputedStyle(dayMarker).backgroundColor:null,fitnessSurface:fitness?getComputedStyle(fitness).getPropertyValue('--ft-surface').trim():null,dashboardCard:dashboard?getComputedStyle(dashboard).backgroundColor:null,clientWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth};
 });report.push({width,screen,...metrics});
 await page.screenshot({path:path.join(out,width+'-'+screen+'.jpg'),type:'jpeg',quality:75,animations:'disabled'});
 assert.deepEqual(metrics.blur,[],screen+' must not create live backdrop surfaces');
 if(width<800)assert(!metrics.background.split(',').some(v=>v.trim()==='fixed'),screen+' mobile background must scroll with the page');
 assert(metrics.scrollWidth<=width+1,screen+' horizontal overflow');
 if(width===393){
  assert.equal(metrics.theme,'superdark',screen+' retains the selected night theme');
  assert.equal(metrics.bodyColor,'rgb(7, 11, 9)',screen+' uses the night shell');
  assert.match(metrics.appArt,/maanmeer\.webp/,screen+' uses existing moonlit pixel-art in Super Dark');
  assert.match(metrics.scenePosition,/145px/,screen+' positions moonlit scenery independently of document height');
  assert(!/cover/.test(metrics.sceneSize),screen+' portrait artwork must not scale to the full document');
  assert.equal(metrics.nightCard,'#121f19',screen+' uses consistent dark card token');
  assert.equal(metrics.checklistToken,'#17291f',screen+' uses a subdued checklist material');
  if(screen==='fitness')assert.equal(metrics.fitnessSurface,'#14231c','Fitness shares night surfaces');
 }else{
  assert.match(metrics.appArt,/bosruines\.webp/,screen+' retains original daylight forest outside Super Dark');
 }
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
  // Full-screen visual matrix in Super Dark at the target 393px width.
  // Other widths retain the baseline forest-theme regression coverage.
  if(width===393)await page.evaluate(()=>window.MementoTheme.set('superdark'));
  for(const [name,area,view]of routes){await nav(page,area,view);await inspect(page,name,width,report);}
  if(width<800){await page.locator('[data-memento-menu=open]').click();await inspect(page,'navigation-open',width,report);await page.locator('#mementoMenuClose').first().click();}
  await nav(page,'finance','dashboard');await page.locator('#m9-accounts').click();await inspect(page,'account-sheet-open',width,report);await page.locator('.m9-sheet-head [data-m9-close]').click();
  await nav(page,'finance','analysis');await page.locator('.analysis-tab').nth(1).click();await inspect(page,'analysis-second-tab',width,report);
  await nav(page,'finance','transactions');
  const hit=await page.evaluate(()=>{
    const rect=id=>{const el=document.querySelector(id);if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,bottom:r.bottom};};
    const r=rect('#addTransaction'),x=r.x+r.width/2,y=r.y+r.height/2,h=document.elementFromPoint(x,y);
    return {scrollY,htmlScrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,button:r,header:rect('.app .topbar'),headerPosition:getComputedStyle(document.querySelector('.app .topbar')).position,content:rect('.app .content'),view:rect('#view-transactions'),pageHead:rect('#view-transactions .tx-page-head'),mainHeader:rect('#compassAreaBar'),pointTarget:h?.id||h?.outerHTML?.slice(0,150)||null};
  });
  console.log('FINANCE_NAV_HIT_TEST '+JSON.stringify(hit));
  if(width<700){
    assert.equal(hit.headerPosition,'relative','Finance header should be in normal flow on compact mobile');
    assert(hit.header.bottom<=hit.content.top+1,'Finance topbar overlaps mobile content: '+JSON.stringify(hit));
    assert(hit.button.top>=hit.header.bottom+6,'Add transaction action overlaps mobile topbar: '+JSON.stringify(hit));
  }
  assert.equal(hit.pointTarget,'addTransaction','Add transaction is not topmost clickable target: '+JSON.stringify(hit));
  await page.locator('#addTransaction').click();await inspect(page,'transaction-dialog',width,report);await page.locator('#txDescription').focus();await page.keyboard.press('Escape');await page.locator('#modalBackdrop.open').waitFor({state:'hidden'});
  await nav(page,'life','tasks');await page.locator('#lifeAdd').click();await inspect(page,'task-dialog',width,report);await page.locator('#lifeTaskTitle').focus();await page.keyboard.press('Escape');await page.locator('#lifeDialog').waitFor({state:'hidden'});
  const lastId=await page.locator('.life-task').last().getAttribute('data-order-id');await require('./helpers/expand-task-group.cjs')(page,'[data-order-id="'+lastId+'"]');const last=page.locator('.life-task').last();await last.scrollIntoViewIfNeeded();assert(await last.isVisible());await page.evaluate(()=>scrollTo(0,0));
  assert.deepEqual(await stored(),before,'Read-only rendering and scrolling preserve Life/Finance/PIN');await ctx.close();console.log('PASS glass rendering '+width);
 }
 assert.deepEqual(errors,[]);
}catch(e){report.push({failure:e.stack});console.error(e);process.exitCode=1;}finally{fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({report,errors},null,2));await browser?.close();server.close();}})();
