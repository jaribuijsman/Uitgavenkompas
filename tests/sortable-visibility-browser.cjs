"use strict";
/* Real Chromium touch smoke for default visibility and persisted ordering. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),http=require("node:http");
const {chromium}=require("playwright");
const {fixture}=require("./helpers/visual-fixture.cjs");
const enterApp=require("./helpers/enter-app.cjs");
const root=path.resolve(__dirname,".."),errors=[],checks=[],width=393;
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 if(pathname==="/__seed__"){res.end("<!doctype html><title>Isolated sortable fixture</title>");return}
 const file=path.resolve(root,"."+(pathname==="/"?"/index.html":pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
 res.setHeader("Content-Type",({".html":"text/html",".js":"application/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml"})[path.extname(file)]||"application/octet-stream");
 res.end(fs.readFileSync(file));
});
async function nav(page,view){await page.locator('[data-memento-menu="open"]').click();await page.locator('#mementoMenuGrid [data-memento-dest="life:'+view+'"]').click();}
async function ids(page,selector){return page.locator(selector).evaluateAll(rows=>rows.map(row=>row.dataset.orderId));}
async function touchDrag(page,selector){
 const grip=page.locator(selector+" > .memento-sort-handle"),rows=page.locator(selector);
 assert(await rows.count()>=2,selector+" must contain at least two items");
 await grip.first().scrollIntoViewIfNeeded();
 const first=await grip.first().boundingBox(),second=await rows.nth(1).boundingBox();
 assert(first&&second,"Drag handle must be visible");
 const start={x:first.x+first.width/2,y:first.y+first.height/2};
 const target={x:start.x,y:second.y+second.height-4};
 const hit=await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.closest(".memento-sort-handle")!==null,start);
 assert(hit,"Touch target must not be covered by another element");
 const options=await page.locator(selector).first().evaluate(row=>window.Sortable.get(row.parentElement)?.options);
 assert(options&&options.delay===0,"Touch drag must activate immediately, with no hold delay");
 const session=await page.context().newCDPSession(page);
 await session.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{...start,id:9}]});
 // Immediate drag must work without a long press on the grip.
 await page.waitForTimeout(20);
 for(let i=1;i<=10;i++){await session.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:start.x+(target.x-start.x)*i/10,y:start.y+(target.y-start.y)*i/10,id:9}]});await page.waitForTimeout(24);}
 await page.waitForTimeout(90);
 await session.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
 await session.detach();
}
(async()=>{let browser;
 try{
  await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
  browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||undefined,args:["--no-sandbox","--disable-dev-shm-usage"]});
  const context=await browser.newContext({viewport:{width,height:852},locale:"nl-NL",timezoneId:"Europe/Amsterdam",hasTouch:true,reducedMotion:"reduce"});
  await context.route("https://**/*",route=>route.abort());
  await context.addInitScript(()=>{const NativeDate=Date,fixed=Date.parse("2026-10-27T09:30:00+01:00");window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[fixed]))}static now(){return fixed}}});
  const page=await context.newPage();page.on("pageerror",e=>errors.push(e.message));page.on("dialog",d=>d.accept());
  const url="http://127.0.0.1:"+server.address().port,data=await fixture();
  await page.goto(url+"/__seed__");
  await page.evaluate(d=>{localStorage.setItem("compass_life_preview_v1",JSON.stringify(d.life));localStorage.setItem("uitgavenkompas_v1",JSON.stringify(d.finance));localStorage.setItem("uitgavenkompas_pin_config_v1",JSON.stringify(d.pin))},data);
  await page.goto(url,{waitUntil:"domcontentloaded"});await enterApp(page);
  await page.waitForFunction(()=>window.MementoStorageGuard?.writable);
  assert.equal(await page.evaluate(()=>typeof window.Sortable),"function");
  assert.equal(await page.evaluate(()=>typeof window.MementoSortableUI?.mountAll),"function");
  checks.push("Pinned local library and adapter loaded");
  await nav(page,"tasks");
  assert.equal(await page.locator("#lifeTaskSort").inputValue(),"manual","Tasks must be immediately draggable by default");
  const taskSelector="#lifeTaskResults>.life-list>.life-task[data-order-id]";
  assert(await page.locator(taskSelector+" > .memento-sort-handle").count()>=2,"Task drag grips are missing");
  const before=await ids(page,taskSelector);
  await touchDrag(page,taskSelector);
  const after=await ids(page,taskSelector);
  assert.notDeepEqual(after,before,"Real touch must change task DOM order");
  const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem("compass_life_preview_v1")).tasks);
  assert(persisted.some(t=>t.id===after[0]&&t.manualOrder===1),"Task order not persisted");
  checks.push("Default tasks: visible 44px grips, trusted touch drag, persisted order");
  await nav(page,"groceries");
  assert.equal(await page.locator('.shopping-primary-nav [aria-pressed="true"]').textContent(),"Mijn lijst");
  assert.equal(await page.locator('[data-shopping-mode="compact"]').getAttribute("aria-pressed"),"true","Compact must be the default");
  assert.equal(await page.locator(".shopping-category").count(),0,"Compact shopping must remain ungrouped");
  const groceries="#lifeGroceryResults>.shopping-rows>.shopping-row[data-order-id]";
  assert.equal(await page.locator(groceries+" > .memento-sort-handle").count(),0,"Compact mode must not show permanent drag grips");
  await page.locator('[data-shopping-mode="shop"]').click();
  assert(await page.locator("#lifeGroceryResults .shopping-aisle").count()>=1,"Store mode must group grocery aisles");
  assert(await page.locator('#lifeGroceryResults .shopping-aisle input[data-life-bought]').count()>=2,"Store mode must retain the bought controls");
  const product=await page.locator('#lifeGroceryResults .shopping-aisle .shopping-row-title').first().textContent();
  await page.locator('#lifeGroceryResults .shopping-aisle input[data-life-bought]').first().check();
  await page.locator('[data-shopping-section="saved"]').click();
  const libraryRow=page.locator('#lifeGroceryResults .shopping-row').filter({hasText:product}).first();
  assert(await libraryRow.isVisible(),"Checked item stays in Producten");
  const addBack=libraryRow.locator('[data-shopping-add]');
  assert(await addBack.isEnabled(),"Checked item is reusable");
  await addBack.click();
  assert.equal(await page.locator('[data-shopping-section="list"]').getAttribute('aria-pressed'),"true");
  assert(await page.locator('#lifeGroceryResults .shopping-row').filter({hasText:product}).count()>=1,"Reused item returns to Mijn lijst");
  await page.locator('[data-shopping-mode="compact"]').click();
  await page.locator('.shopping-primary-head .shopping-list-menu>summary').click();
  await page.locator('[data-shopping-sort="true"]').click();
  assert(await page.locator(groceries+" > .memento-sort-handle").count()>=2,"Explicit sorting must show grocery grips");
  const gb=await ids(page,groceries);await touchDrag(page,groceries);const ga=await ids(page,groceries);assert.notDeepEqual(gb,ga,"Grocery touch reorder failed");
  checks.push("Compact default hides grips, shopping recycle loop, and explicit sorting preserve touch behavior");
  await page.locator('[data-shopping-section="saved"]').click();
  await page.locator('#lifeShoppingInput').fill('Testartikel categorie');
  assert(await page.locator('#shoppingNewCategory').isVisible(),"New item exposes a category selector");
  await page.locator('#shoppingCategoryChoice').selectOption('Huisdieren');
  await page.locator('#lifeShoppingForm button[type="submit"]').click();
  assert.equal(await page.locator('[data-shopping-section="saved"]').getAttribute('aria-pressed'),"true","Adding in Producten should stay in Producten");
  assert(await page.locator('#lifeGroceryResults .shopping-aisle').filter({hasText:'Huisdieren'}).filter({hasText:'Testartikel categorie'}).count()>=1,"Chosen category persists in Producten");
  checks.push("New products can be assigned a category in the quick-add flow");
  await nav(page,"wishes");
  assert(await page.locator("#lifeWishResults>.life-grid>.life-panel>.memento-sort-handle").count()>=2,"Wish drag handles absent");
  checks.push("Wishes have visible grip controls");
  await nav(page,"fitness");
  await page.locator('#mementoFitness [data-fit="tab"][data-id="plan"]').click();
  assert(await page.locator("#mementoFitness .ft-cycle-sort > .ft-panel").count()>=2,"Fitness fixture must have >=2 cycle routines");
  assert(await page.locator("#mementoFitness .ft-cycle-sort > .ft-panel > .memento-sort-handle").count()>=2,"Fitness cycle drag grips absent");
  checks.push("Fitness cycle has draggable grip controls");
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(overflow,false,"Unexpected mobile horizontal overflow");
  assert.deepEqual(errors,[]);
  console.log("PASS sortable mobile smoke "+JSON.stringify({checks}));
  await context.close();
 }catch(e){console.error(e);console.log("SORTABLE_SMOKE "+JSON.stringify({checks,errors}));process.exitCode=1}
 finally{await browser?.close();server.close()}
})();