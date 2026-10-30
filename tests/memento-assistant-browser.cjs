/* Focused mobile smoke: assistant export, preview, batch apply and undo. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{task}=require('./helpers/storage-fixture.cjs');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/__seed__'){res.end('<!doctype html><title>Fixture</title>');return;}
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
(async()=>{
 let browser;
 try{
  await new Promise((done,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',done);});
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  const fixture=await require('./helpers/visual-fixture.cjs').fixture();
  fixture.life.tasks=[{...task('assistant-t1','Kattenbak schoonmaken'),category:'Persoonlijk',room:'Hele huis',kind:'task',repeat:'none',repeatDays:4,date:'2026-10-30',priority:false}];
  const port=server.address().port,origin='http://127.0.0.1:'+port;
  for(const width of [360,393,412]){
   const context=await browser.newContext({viewport:{width,height:800},acceptDownloads:true,hasTouch:true,reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   await page.goto(origin+'/__seed__');
   await page.evaluate(data=>{localStorage.setItem('compass_life_preview_v1',JSON.stringify(data.life));localStorage.setItem('uitgavenkompas_v1',JSON.stringify(data.finance));},fixture);
   await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
   await page.evaluate(()=>{document.querySelector('#ms-continue')?.click();window.MementoLife.openBackup();});
   await page.locator('#mementoAssistant').waitFor();
   assert.equal(await page.locator('#mementoAssistant').count(),1);
   await page.locator('[data-ma="export"]').click();
   assert.match(await page.locator('#ma-status').innerText(),/Bevestig eerst/);
   await page.locator('#ma-consent').check();
   const download=page.waitForEvent('download');
   await page.locator('[data-ma="export"]').click();
   assert.match((await download).suggestedFilename(),/memento-leven-analyse/);
   const proposal={format:'memento-life-assistant-proposal',version:1,changes:[{type:'task',id:'assistant-t1',set:{category:'Huishouden',kind:'routine',repeat:'weekly'},expected:{category:'Persoonlijk',kind:'task',repeat:'none'},reason:'Regelmatig onderhoud'}]};
   await page.locator('#ma-file').setInputFiles({name:'advies.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(proposal))});
   await page.getByRole('button',{name:/Geselecteerde wijzigingen verwerken/}).click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).tasks[0].category==='Huishouden');
   assert.equal(await page.locator('#mementoAssistant').count(),1);
   await page.locator('#ma-undo').click();
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).tasks[0].category==='Persoonlijk');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   await page.locator('#mementoAssistant').screenshot({path:'/tmp/memento-assistant-'+width+'.png'});
   assert.equal(errors.length,0,'browser errors: '+errors.join('; '));
   await context.close();
   console.log('PASS assistant at '+width+'px');
  }
 }finally{await browser?.close();await new Promise(done=>server.close(done));}
})().catch(e=>{console.error(e);process.exitCode=1;});
