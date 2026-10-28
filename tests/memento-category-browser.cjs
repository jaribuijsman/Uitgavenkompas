/* Browser regression: preserve historical category/subcategory pairs and prevent new mismatches.
   Isolated localhost + in-memory synthetic finance only; never touches a personal browser. */
'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname;
 if(name==='/__seed__'){res.end('<!doctype html><title>Fixture</title>');return}
 const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
 res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');
 res.end(fs.readFileSync(file));
});
async function nav(page){
 if(!await page.locator('[data-memento-menu=open]').isVisible()){
  await page.locator('#sideNav [data-view="transactions"]').click();return;
 }
 await page.locator('[data-memento-menu=open]').click();
 if(await page.evaluate(()=>document.body.dataset.compassArea)!=='finance')await page.locator('[data-memento-switch="finance"]').click();
 await page.locator('#mementoMenuGrid [data-memento-dest="finance:transactions"]').click();
}
(async()=>{
 let browser;const errors=[];
 try{
  await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok)});
  browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']});
  for(const width of [360,393,412]){
   const context=await browser.newContext({viewport:{width,height:860},locale:'nl-NL',timezoneId:'Europe/Amsterdam',hasTouch:true,reducedMotion:'reduce'});
   const page=await context.newPage();page.on('dialog',d=>d.accept());page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{const RealDate=Date,now=Date.parse('2026-10-28T12:00:00+01:00');
    window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[now]))}static now(){return now}};
   });
   const origin='http://127.0.0.1:'+server.address().port;
   await page.goto(origin+'/__seed__');
   await page.evaluate(()=>localStorage.setItem('uitgavenkompas_v1',JSON.stringify({
    version:3,categories:[],transactions:[{id:'legacy-tax',date:'2026-10-27',type:'expense',category:'Boodschappen',subcategory:'Wegenbelasting',amount:49,description:'Wegenbelasting',merchant:'Belastingdienst',account:'personal',person:'Jari',splits:null}],receipts:[],bills:[],goals:[],settings:{accountOpening:{personal:0,joint:0,creditcard:0}}
   })));
   await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
   const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('uitgavenkompas_v1')));
   await nav(page);
   await page.locator('[data-edit-tx="legacy-tax"]').click();
   assert.equal(await page.locator('#txCategory').inputValue(),'Boodschappen');
   assert.equal(await page.locator('#txSubcategory').inputValue(),'Wegenbelasting');
   assert.match(await page.locator('#txSubcategoryNotice').innerText(),/Vaste lasten/);
   assert.equal(await page.locator('#splitSection').isVisible(),false);
   await page.locator('#txAmount').fill('49.50');
   await page.locator('[form=txForm][type=submit]').click();
   let tx=(await state()).transactions.find(t=>t.id==='legacy-tax');
   assert.equal(tx.subcategory,'Wegenbelasting');
   assert.equal(tx.category,'Boodschappen');
   assert.equal(tx.amount,49.50);
   await page.locator('[data-edit-tx="legacy-tax"]').click();
   await page.locator('#txCategory').selectOption('Vaste lasten');
   assert.equal(await page.locator('#txSubcategory').inputValue(),'Wegenbelasting');
   await page.locator('[form=txForm][type=submit]').click();
   tx=(await state()).transactions.find(t=>t.id==='legacy-tax');
   assert.equal(tx.category,'Vaste lasten');assert.equal(tx.subcategory,'Wegenbelasting');
   // A new unsplit transaction must use its main category, never an orphan first split row.
   await page.locator('#addTransaction').click();
   await page.locator('#txDescription').fill('Nieuwe wegenbelasting');
   await page.locator('#txAmount').fill('25');
   await page.locator('#txCategory').selectOption('Vaste lasten');
   await page.locator('#txSubcategory').selectOption('Wegenbelasting');
   assert.equal(await page.locator('#splitSection').isVisible(),false);
   await page.locator('[form=txForm][type=submit]').click();
   const all=(await state()).transactions,added=all.find(t=>t.description==='Nieuwe wegenbelasting');
   assert(added,'New transaction persisted');
   assert.equal(added.category,'Vaste lasten');assert.equal(added.subcategory,'Wegenbelasting');
   assert.equal(all.length,2);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   console.log('PASS Memento category edit/new at',width,'px');
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS category editing, historic preservation, correct categorization and mobile overflow');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(e=>{console.error(e);process.exitCode=1});
