'use strict';
/* Real Chromium smoke: universal search across Leven and Financien at mobile widths. */
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{task}=require('./helpers/storage-fixture.cjs'),enterApp=require('./helpers/enter-app.cjs');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/__seed__'){res.end('<!doctype html><title>Fixture</title>');return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
(async()=>{
 let browser;
 try{
  await new Promise((ok,no)=>{server.once('error',no);server.listen(0,'127.0.0.1',ok);});
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const fixture=await require('./helpers/visual-fixture.cjs').fixture();
  fixture.life.tasks.push({...task('gs-task','Garage remblokken checken'),date:'2026-10-27',notes:'Garage factuur controleren'});
  fixture.life.appointments.push({...fixture.life.appointments[0],id:'gs-appointment',title:'Garage De Hout afspraak'});
  fixture.life.notes.push({...fixture.life.notes[0],id:'gs-note',title:'Garage onderdelen',body:'Bandenspanning testen',deletedAt:'',archived:false});
  fixture.finance.transactions.push({...fixture.finance.transactions[0],id:'gs-fin',description:'Garage De Hout – dynamo',merchant:'Garage De Hout',amount:570,date:'2026-10-27',type:'expense'});
  const origin='http://127.0.0.1:'+server.address().port;
  for(const width of [360,393,412]){
    const context=await browser.newContext({viewport:{width,height:790},locale:'nl-NL',timezoneId:'Europe/Amsterdam',hasTouch:true,reducedMotion:'reduce'});
    await context.route('https://**/*',r=>r.abort());
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/__seed__');
    await page.evaluate(data=>{localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));localStorage.setItem('compass_life_preview_v1',JSON.stringify(data.life));},fixture);
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await enterApp(page);
    await page.waitForFunction(()=>window.MementoStorageGuard?.writable && window.MementoGlobalSearch?.mount);
    const field=page.locator('#mgsInput');
    await field.waitFor({state:'visible'});
    assert((await field.boundingBox()).height>=44,'Search input touch area');
    await field.fill('Garage');
    await page.locator('#mgsDropdown [data-mgs-result]').first().waitFor();
    assert(await page.locator('#mgsDropdown').isVisible(),'Dropdown opens');
    assert(await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage remblokken checken'}).count()===1,'Task found');
    assert(await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage De Hout – dynamo'}).count()===1,'Transaction found');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow at '+width);
    if(width===393){
      await page.screenshot({path:'/tmp/memento-global-search-393.png',animations:'disabled'});
      await page.locator('#mgsDropdown [data-mgs-filter="finance"]').click();
      assert.equal(await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage remblokken checken'}).count(),0,'Finance filter excludes tasks');
      await page.locator('#mgsDropdown [data-mgs-filter="all"]').click();
      await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage remblokken checken'}).click();
      await page.locator('#lifeDialog').waitFor({state:'visible'});
      await page.locator('[data-life-close]').first().click();
      await page.evaluate(()=>document.querySelector('#lifeNavigation [data-life-view="today"]').click());
      await field.fill('Bandenspanning');
      await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage onderdelen'}).waitFor();
      await field.fill('dynamo');
      await page.locator('#mgsDropdown [data-mgs-result]').filter({hasText:'Garage De Hout – dynamo'}).click();
      await page.waitForFunction(()=>document.body.dataset.compassArea==='finance');
      await page.locator('#modalBackdrop.open').waitFor();
      assert.match(await page.locator('#modalContent').innerText(),/Garage De Hout/);
    }
    assert.deepEqual(errors,[],'No runtime errors: '+width);
    await context.close();
  }
  console.log('PASS universal search: mobile sizes, filters, result navigation, diary body, finances');
 }finally{await browser?.close();await new Promise(ok=>server.close(ok));}
})().catch(e=>{console.error(e);process.exitCode=1;});