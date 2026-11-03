'use strict';
const assert=require('node:assert/strict');
module.exports=async(page,navigate,shot,context,url,width,checks)=>{
 await navigate(page,'life','notes');await page.locator('#memento-hq-preview').waitFor();
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));
 const original=await read(),notes=JSON.stringify(original.notes),finance=await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1'));
 assert.equal(await page.locator('.kc-local-tabs,.kc-workspace-shortcuts,.kc-workspace-widgets,.kc-capture,.kc-compact-fold').count(),0,'No retired Notes UI');
 const titles=await page.locator('.mm-open strong').allTextContents();assert.equal(titles.length,10);assert.equal(titles[0],'Ontdekken & bewaren');assert.equal(titles[9],'Persoonlijk & groei');
 assert.equal(await page.locator('[data-action=inbox]').count(),2);await shot(page,'portal-overview');
 // Compare real content geometry with the exact approved prototype. Only the
 // mock phone chrome is removed; production retains the real app chrome.
 const ref=await context.newPage();await ref.goto(url+'/docs/design-review/headquarters-approved-20261103.html');
 const actualWidth=await page.locator('.mm-phone').evaluate(e=>e.getBoundingClientRect().width);
 await ref.addStyleTag({content:`body{margin:0}#memento-hq-preview{padding:0;width:${actualWidth}px}#memento-hq-preview .mm-phone{padding:0!important;border-radius:0;box-shadow:none}#memento-hq-preview .mm-top{display:none}`});
 const geometry=async p=>p.locator('#mm-screen').evaluate(el=>{const top=el.querySelector('h2').getBoundingClientRect().top;return [...el.querySelectorAll('h2,p,.mm-inbox,.mm-row,.mm-hq,.mm-open strong,.mm-more')].map(x=>{const r=x.getBoundingClientRect(),s=getComputedStyle(x);return {text:x.matches('.mm-open strong')?x.textContent:null,w:r.width,h:r.height,y:r.top-top,font:s.fontSize}})});
 const expected=await geometry(ref),actual=await geometry(page);assert.equal(actual.length,expected.length);
 for(let i=0;i<expected.length;i++){assert.equal(actual[i].text,expected[i].text);assert.equal(actual[i].font,expected[i].font);for(const k of ['w','h','y'])assert(Math.abs(actual[i][k]-expected[i][k])<3,`Prototype geometry ${i} ${k}: ${actual[i][k]} vs ${expected[i][k]}`);}
 await ref.close();checks.push('Exact approved portal reference: ten titles, hierarchy, typography and relative geometry');
 for(const testWidth of [360,412,1280]){await page.setViewportSize({width:testWidth,height:852});await shot(page,'portal-width-'+testWidth,false);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}await page.setViewportSize({width,height:852});
 await page.locator('[data-action=manage]').click();const ids=()=>page.locator('[data-order-id]').evaluateAll(xs=>xs.map(x=>x.dataset.orderId));const before=await ids();
 const a=await page.locator('.mm-drag').first().boundingBox(),b=await page.locator('[data-order-id]').nth(2).boundingBox(),touch=await context.newCDPSession(page);
 try{await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2,id:1}]});for(let step=1;step<=12;step++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2+(b.y+b.height-5-a.y-a.height/2)*step/12,id:1}]});await page.waitForTimeout(20);}await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await touch.detach();}
 assert.notDeepEqual(await ids(),before,'Trusted touch drag moves a card');assert.deepEqual(await read(),original,'Draft drag never writes');await page.locator('[data-action=home]').click();await page.locator('[data-action=manage]').click();assert.deepEqual(await ids(),before);
 await page.locator('.mm-drag').first().press('ArrowDown');assert.notDeepEqual(await ids(),before);assert.deepEqual(await read(),original,'Draft sort never writes');await shot(page,'portal-sort');await page.locator('[data-action=home]').click();
 await page.locator('[data-action=manage]').click();assert.deepEqual(await ids(),before);await page.locator('.mm-drag').first().press('ArrowDown');const ordered=await ids();await page.locator('[data-action=save-order]').click();assert.deepEqual((await read()).knowledge.portal.cards.map(c=>String(c.id)),ordered);
 await page.locator('[data-edit="1"]').click();await shot(page,'portal-edit');await page.locator('[name=link]').fill('https://www.notion.so/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');await page.locator('#mm-form [type=submit]').click();assert.equal(await page.locator('a.mm-open[href="https://www.notion.so/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"]').count(),1);
 await page.locator('[data-action=inbox]').first().click();await page.locator('[name=note]').fill('Fictieve snelle inboxnotitie');await page.locator('#mm-note-form button').click();assert((await read()).notes.some(n=>n.body==='Fictieve snelle inboxnotitie'));await page.locator('[data-action=home]').click();
 await page.reload();await require('./enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await navigate(page,'life','notes');assert.equal((await read()).knowledge.portal.cards[0].id,Number(ordered[0]));
 const final=await read();assert.equal(JSON.stringify(final.notes.filter(n=>n.body!=='Fictieve snelle inboxnotitie')),notes);assert.equal(await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1')),finance);assert.deepEqual(final.knowledge.collections,original.knowledge.collections,'Legacy artwork and collections are untouched');checks.push('Portal: isolated config, staged order, cancel/save/restart, real Notion href, Inbox persistence and legacy data preservation');
};
