'use strict';
const assert=require('node:assert/strict');
module.exports=async(page,navigate,shot,context,url,width,checks)=>{
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')));
 const finance=await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1'));
 await navigate(page,'life','notes');await page.waitForFunction(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).knowledge?.workspace?.version===2);
 assert.deepEqual(await page.locator('.kc-local-tabs button').allTextContents(),['Overzicht','Mappen','Notities']);
 assert(await page.locator('.kc-hq-list .kc-topic-card').count()>4,'All existing categories remain visible in one vertical list');
 assert.equal(await page.locator('.kc-topic-viewport').count(),0);
 const original=await state(),before=JSON.stringify(original);
 const noteBytes=JSON.stringify(original.notes);
 await shot(page,'workspace-home');
 if(width===393){
  const viewport=page.viewportSize();
  for(const testWidth of [360,412,1280]){
   await page.setViewportSize({width:testWidth,height:852});
   const geometry=await page.locator('.kc-topic-tile').evaluateAll(rows=>rows.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}}));
   assert(geometry.every((r,i)=>r.left>=0&&r.right<=testWidth&&r.height>=100&&(i===0||r.top>=geometry[i-1].bottom)),testWidth+'px cards fit and remain vertical');
   await shot(page,'headquarters-width-'+testWidth,false);
  }
  await page.setViewportSize(viewport);
 }
 const recipe=page.locator('a.kc-topic-card').first();
 assert.equal(await recipe.getAttribute('href'),'https://www.notion.so/02f6147c45b14e00b240b02e69536903');
 const cardBoxes=await page.locator('.kc-topic-tile').evaluateAll(rows=>rows.map(r=>r.getBoundingClientRect().toJSON()));
 assert(cardBoxes.every((r,i)=>i===0||r.top>=cardBoxes[i-1].bottom),'Cards stack without overlap');
 const hit=await page.locator('.kc-topic-edit').first().boundingBox();assert(hit.width>=44&&hit.height>=44);
 const editStyle=await page.locator('.kc-topic-edit').first().evaluate(el=>({background:getComputedStyle(el).backgroundColor,border:getComputedStyle(el).borderTopWidth}));assert.equal(editStyle.border,'0px');assert.equal(editStyle.background,'rgba(0, 0, 0, 0)');
 const openOrder=async()=>{await page.locator('[data-kc=hq-sort]').click();await page.locator('.kc-hq-sort').waitFor();};
 const order=()=>page.locator('.kc-sort-row').evaluateAll(rows=>rows.map(r=>r.dataset.sortId));
 await openOrder();const ids=await order();
 // Trusted drag changes the draft, never durable data until explicit save.
 const h=page.locator('.kc-drag-handle').first();await h.scrollIntoViewIfNeeded();const a=await h.boundingBox(),b=await page.locator('.kc-sort-row').nth(2).boundingBox();
 if(width<=800){const touch=await context.newCDPSession(page);try{await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2,id:1}]});for(let step=1;step<=12;step++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+a.width/2,y:a.y+a.height/2+(b.y+b.height-5-a.y-a.height/2)*step/12,id:1}]});await page.waitForTimeout(20);}await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await touch.detach();}}
 else{await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+a.width/2,b.y+b.height-5,{steps:12});await page.mouse.up();}
 await page.waitForFunction(first=>document.querySelector('.kc-sort-row')?.dataset.sortId!==first,ids[0]);
 assert.equal(JSON.stringify(await state()),before,'Drag must not persist');await shot(page,'headquarters-order-draft');
 await page.locator('[data-kc=sort-done]').click();await openOrder();assert.deepEqual(await order(),ids,'Cancel discards draft');
 await page.locator('.kc-drag-handle').first().press('ArrowDown');let expected=await order();assert.notDeepEqual(expected,ids);assert.equal(JSON.stringify(await state()),before,'Keyboard reorder is also provisional');
 await page.locator('[data-kc=hq-save-order]').first().click();await page.locator('.kc-hq-list').waitFor();
 expected=expected.map(id=>id==='notion-recipes'?(null):id);const savedRecipe=(await state()).knowledge.collections.find(c=>c.externalUrl==='https://www.notion.so/02f6147c45b14e00b240b02e69536903');expected=expected.map(id=>id===null?savedRecipe.id:id);
 assert.equal(JSON.stringify((await state()).notes),noteBytes,'Sorting preserves all note contents');
 await page.reload();await require('./enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await navigate(page,'life','notes');await openOrder();
 assert.deepEqual(await order(),expected,'Saved order survives restart including the recipe card');
 const savedBytes=JSON.stringify(await state());await page.locator('.kc-drag-handle').first().press('ArrowDown');
 await page.evaluate(()=>{window.kcHQSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='compass_life_preview_v1')throw Error('Fictieve quota');return window.kcHQSetItem.call(this,k,v)}});
 await page.locator('[data-kc=hq-save-order]').first().click();assert.equal(JSON.stringify(await state()),savedBytes);assert.equal(await page.locator('.kc-hq-sort').count(),1,'Failure retains draft for retry');
 await page.evaluate(()=>{Storage.prototype.setItem=window.kcHQSetItem});if(await page.locator('#mementoStorageNotice:not([hidden])').count())await page.locator('[data-storage-dismiss]').click();
 await page.locator('[data-kc=sort-done]').click();
 await page.locator('[data-kc=new-hq]').click();await page.locator('[data-kc-hq-template]').selectOption('0');
 assert.equal(await page.locator('#kc-col-name').inputValue(),'Ontdekken & bewaren');
 await page.locator('[data-kc-col=externalUrl]').fill('https://example.com/invalid');await page.locator('[data-kc=save-collection]').click();assert.equal(await page.locator('#kc-collection-form').count(),1);
 const destination='https://www.notion.so/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
 await page.locator('[data-kc-col=externalUrl]').fill(destination);await page.locator('[data-kc=save-collection]').click();await page.locator('.kc-hq-list').waitFor();
 const added=(await state()).knowledge.collections.find(c=>c.externalUrl===destination);assert(added);assert.equal(added.subtitle,'Boeken, podcasts en dingen om uit te zoeken');
 assert.equal(await page.locator('a.kc-topic-card[href="'+destination+'"]').count(),1);
 await page.locator('[data-kc=edit-collection][data-id="'+added.id+'"]').click();await page.locator('[data-kc-col=subtitle]').fill('Aangepaste omschrijving');await page.locator('[data-kc=save-collection]').click();await page.locator('.kc-hq-list').waitFor();
 assert((await page.locator('a.kc-topic-card[href="'+destination+'"]').innerText()).includes('Aangepaste omschrijving'));
 await page.locator('a.kc-topic-card[href="'+destination+'"]').scrollIntoViewIfNeeded();await shot(page,'headquarters-added');
 await page.locator('[data-kc=edit-collection][data-id="'+added.id+'"]').click();await page.locator('[data-kc=archive-collection]').click();
 assert((await state()).knowledge.collections.find(c=>c.id===added.id).archived);await page.locator('.kc-compact-fold').filter({hasText:'Gearchiveerde mappen'}).locator('summary').click();await page.locator('[data-kc=restore-collection][data-id="'+added.id+'"]').click();
 assert.equal((await state()).knowledge.collections.find(c=>c.id===added.id).archived,false);assert.equal(JSON.stringify((await state()).notes),noteBytes);
 await page.locator('.kc-local-tabs [data-kc=home]').click();
 const folderCard=page.locator('button.kc-topic-card').first();await folderCard.click();await page.waitForFunction(()=>!document.querySelector('.kc-hq-list'));await page.locator('.kc-local-tabs [data-kc=home]').click();
 checks.push('Headquarters: vertical cards, compact edit targets, trusted drag, cancel, keyboard, explicit save, reload, quota failure, add/edit/archive/restore, recipe href and preserved notes');

 await page.locator('.kc-local-tabs [data-kc=collections]').click();
 assert.equal(await page.locator('.kc-tree-children').count(),0);const fold=page.locator('[data-kc=ws-fold]').first();const root=await fold.getAttribute('data-id');await fold.click();assert(await page.locator('.kc-tree-children').count()>0);
 await page.locator('.kc-local-tabs [data-kc=home]').click();await page.locator('.kc-local-tabs [data-kc=collections]').click();assert(await page.locator('.kc-tree-children').count()>0);await shot(page,'workspace-tree');
 await page.locator('.kc-local-tabs [data-kc=home]').click();await page.locator('[data-kc=new]').first().click();
 const fixtureTitle='Projectbespreking: voortgang en actiepunten';
 const fixtureBody='Besproken tijdens het overleg:\n• De voortgang van het bestaande project.\n• Openstaande vragen en aandachtspunten.\n\nResultaat van de bespreking:\n[Vul hier het ontvangen antwoord in.]\n\nVervolg:\n[Wat wil ik later nog oppakken?]';
 await page.locator('#kc-title').fill(fixtureTitle);
 await page.locator('#kc-body').fill(fixtureBody);
 assert.equal(await page.locator('.kc-v3-block-pane').count(),0,'Single text-block document uses the approved continuous editor');
 await page.locator('[data-kc=save]').first().click();
 const n=(await state()).notes.find(n=>n.title===fixtureTitle);assert(n?.document);
 assert(n.body.includes('Besproken tijdens het overleg:'),'Document text is safely stored');
 assert.equal(n.document.blocks.length,1,'Existing document shape and block ID remain intact');
 assert.equal(n.document.blocks[0].text,fixtureBody,'Textarea synchronizes the same original block');
 assert.equal(await page.locator('.kc-v3-writing-card').count(),1);
 assert.equal(await page.locator('.kc-v3-save-btn').count(),1,'Prototype save button uses independent class to avoid global kc-btn overrides');
 assert.equal(await page.locator('.kc-v3-save-btn').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(197, 223, 195)','Save button must retain approved sage fill');
 const mic=page.locator('[data-memento-dictate="kc-body"]');
 assert(await mic.isVisible(),'Existing note dictation stays reachable outside the five-action toolbar');
 const micBox=await mic.boundingBox();assert(micBox.width>=44&&micBox.height>=44,'Dictation touch target remains at least 44 CSS px');
 assert.equal(await page.locator('.kc-local-tabs').count(),0,'No redundant tabs above the editor');
 assert.equal(await page.locator('.kc-breadcrumbs').count(),0,'Editor uses exactly one prototype breadcrumb');
 assert.equal(await page.locator('.kc-v3-organization h3').innerText(),'Organiseren');
 assert.equal(await page.locator('.kc-v3-followups h3').innerText(),'Opvolging & koppelingen');
 await shot(page,'approved-editor-same-fixture');
 const actualGeometry=await require('./knowledge-prototype-geometry.cjs')(page,shot);
 assert.equal(actualGeometry.length,12,'Prototype editor: three scroll positions and four mobile viewport/height combinations');
 checks.push('Prototype parity: sticky editor, compact writing, mobile controls and bottom navigation');
 const parity=require('./knowledge-prototype-parity.cjs');
 const approved=parity.verifyReference();
 const proof=parity.evidenceRecorder(width);
 const reference=await context.newPage();await reference.goto(url+'/docs/design-review/knowledge-prototype-approved-20261102.html');
 assert.equal(await reference.locator('.editor-head').count(),1);
 assert.equal(await reference.locator('.panel').count(),4);
 assert.equal(await reference.locator('#title').inputValue(),fixtureTitle,'Reference must use the same fictional title');
 assert.equal(await reference.locator('#body').inputValue(),fixtureBody,'Reference must use the same fictional content');
 for(const position of ['top','middle','bottom']){
  const expected=await parity.captureEditor(reference,true,position);
  const actual=await parity.captureEditor(page,false,position);
  proof.check('editor-'+position,()=>parity.assertEditor(expected,actual,position));
  await shot(reference,'parity-reference-editor-'+position);
  await shot(page,'parity-app-editor-'+position);
 }
 await page.evaluate(()=>scrollTo(0,0));
 await reference.evaluate(()=>scrollTo(0,0));
 await shot(reference,'approved-prototype-reference');
 const [referenceStyle,actualStyle]=await Promise.all([
  reference.locator('.panel').first().evaluate(el=>({radius:getComputedStyle(el).borderRadius,background:getComputedStyle(el).backgroundColor})),
  page.locator('.kc-v3-writing-card').evaluate(el=>({radius:getComputedStyle(el).borderRadius,background:getComputedStyle(el).backgroundColor}))
 ]);
 assert.deepEqual(actualStyle,referenceStyle,'Writing panel token parity with approved HTML');
 const [referencePanel,actualPanel]=await Promise.all([reference.locator('.panel').first().boundingBox(),page.locator('.kc-v3-writing-card').boundingBox()]);
 assert(Math.abs(referencePanel.width-actualPanel.width)<=12,'Writing card width must match reference within 12 CSS px');
 checks.push('Approved fixture: panel geometry, colors, title/body and primary controls compared on matching viewports');
 const kinds=[['task','follow-task'],['appointment','follow-appointment'],['note','follow-note']];
 const referenceForms={};let referenceChoice=null;
 for(const [kind,action] of kinds){
  await reference.locator('[data-action=followup]').click();
  if(kind==='task'){
   referenceChoice=await parity.captureSheet(reference,'.sheet');
   const options=await reference.locator('.sheet [data-action^=follow-]').allTextContents();
   referenceChoice.labels=options;
   await shot(reference,'parity-reference-followup-choices');
  }
  await reference.locator('[data-action='+action+']').click();
  await reference.locator('#actTitle').fill(fixtureTitle);
  if(kind==='appointment')await reference.locator('#actDate').fill('2026-10-27');
  referenceForms[kind]=await parity.captureSheet(reference,'.sheet','#actTitle');
  await shot(reference,'approved-reference-followup-'+kind);
  await reference.locator('.sheet [data-action=close]').click();
 }
 await reference.close();
 for(const [kind] of kinds){
  await page.locator('[data-kc=editor-followup]').click();
  assert(await page.locator('#kc-v3-followup-sheet').evaluate(dialog=>dialog.open));
  assert.equal(await page.locator('#kc-v3-followup-sheet [data-kc=editor-followup-kind]').count(),3);
  if(kind==='task'){
   const appChoice=await parity.captureSheet(page,'#kc-v3-followup-sheet');
   const awaitedChoiceLabels=await page.locator('#kc-v3-followup-sheet [data-kc=editor-followup-kind]').allTextContents();
   proof.check('followup-options',()=>parity.assertChoices(referenceChoice.labels,awaitedChoiceLabels));
   proof.check('followup-sheet',()=>parity.assertSheet(referenceChoice,appChoice,'followup-sheet'));
   await shot(page,'approved-followup-sheet');
  }
  await page.locator('#kc-v3-followup-sheet [data-kc=editor-followup-kind][data-id='+kind+']').click();
  assert.equal(await page.locator('#followupTarget').inputValue(),kind,'Chosen follow-up type reaches the real Memento flow');
  assert(await page.locator('#mementoFollowupForm').isVisible(),'Follow-up form is connected to live UI');
  assert.equal(await page.locator('#followupTitle').inputValue(),fixtureTitle);
  const actualForm=await parity.captureSheet(page,'#lifeDialogPanel','#followupTitle');
  proof.check('followup-form-'+kind,()=>parity.assertSheet(referenceForms[kind],actualForm,'followup-form-'+kind,{form:true}));
  await shot(page,'approved-followup-form-'+kind);
  await page.locator('#followupOptionsSummary').click();
  assert(await page.locator('#followupIntent').isVisible(),'Conversion remains accessible');
  assert(await page.locator('#followupExtra').isVisible(),'Extra text remains accessible');
  if(kind==='appointment')assert(await page.locator('#followupTime').isVisible(),'Required start time remains accessible');
  if(kind==='note')assert(await page.locator('#followupFolder').isVisible(),'Folder choice remains accessible');
  if(kind==='appointment'){
   await page.setViewportSize({width:393,height:470});
   const footer=await page.locator('#lifeDialog .life-dialog-footer button').boundingBox();
   assert(footer&&footer.y+footer.height<=470,'Save action stays reachable in a short viewport');
   await shot(page,'approved-followup-short-viewport');
   await page.setViewportSize({width,height:852});
  }
  await page.locator('#lifeDialog [data-life-close]').first().click();
 }
 const parityResults=proof.finish();
 checks.push('Binding prototype parity: '+parityResults.states.length+' reference/app states, SHA '+approved.slice(0,12));
 await page.locator('[data-kc=editor-attachments]').click();
 const picker=page.locator('#kc-v3-attachments-sheet #kc-file-input');
 assert(await picker.isVisible(),'Native local file picker must remain available');
 await shot(page,'approved-attachment-sheet');
 await page.locator('#kc-v3-attachments-sheet [data-kc=editor-sheet-close]').click();
 await page.locator('[data-kc=editor-menu]').first().click();
 assert.equal(await page.locator('#kc-editor-menu').evaluate(dialog=>dialog.open),true);
 await shot(page,'approved-more-actions-sheet');
 await page.locator('#kc-editor-menu [data-kc=pin]').click();
 assert((await state()).notes.find(x=>x.id===n.id).pinned);
 assert.equal(await page.locator('#kc-editor-menu').evaluate(dialog=>dialog.open),false);
 await page.locator('[data-kc=editor-linked-folders]').first().click();
 await page.locator('[data-kc-location="'+root+'"]').check();
 await page.locator('[data-kc=editor-locations-save]').click();
 assert((await state()).notes.find(x=>x.id===n.id).collectionIds.includes(root));
 checks.push('Prototype sheets: follow-up choices, attachments, other actions, linked folders and saved note IDs');
 await page.locator('.kc-v3-editor-head [data-kc=editor-menu]').click();
 await page.locator('#kc-editor-menu [data-kc=editor-block-options]').click();
 await page.locator('#kc-v3-block-tools-sheet [data-kc=ws-block][data-id=heading]').click();
 assert(await page.locator('[data-ws-block]').count()>1,'Multi-block documents remain in their structured editor');await page.locator('[data-ws-block]').last().fill('Volgende stap');await page.locator('[data-kc=save]').first().click();
 await shot(page,'workspace-visual-editor');
 await page.locator('.kc-v3-editor-head [data-kc=back]').click();
 await page.locator('.kc-local-tabs [data-kc=home]').click();
 await page.locator('.kc-compact-fold summary').filter({hasText:'Instellingen & back-up'}).click();
 await page.locator('[data-kc=ws-background]').click();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aafkAAAAASUVORK5CYII=','base64');await page.locator('#kc-ws-background-file').setInputFiles({name:'achtergrond.png',mimeType:'image/png',buffer:png});
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).knowledge.workspace.background?.file);await page.locator('[data-kc=ws-background-save]').click();assert.equal(await page.locator('.kc-workspace-bg').count(),1);
 await page.locator('[data-kc=ws-design]').first().click();await page.locator('[data-kc=ws-widget-add]').click();await page.locator('#kc-ws-widget-type').selectOption('image');await page.locator('#kc-ws-widget-consent').check();await page.locator('[data-kc=ws-widget-confirm]').click();
 await page.locator('[data-kc=ws-widget-image]').click();await page.locator('#kc-ws-widget-file').setInputFiles({name:'widget.png',mimeType:'image/png',buffer:png});await page.waitForFunction(()=>Object.values(JSON.parse(localStorage.getItem('compass_life_preview_v1')).knowledge.workspace.dashboards).flat().some(w=>w.image));await page.locator('#kc-ws-widget-caption').fill('Eigen beeld');await page.locator('[data-kc=ws-widget-image-settings]').click();await shot(page,'workspace-images');
 assert.equal(await page.evaluate(()=>localStorage.getItem('uitgavenkompas_v1')),finance);
 checks.push('Right swipe advances four; folders collapse and remember; visual note autosave/pin/links; own background and image widget; finance unchanged');
 await page.reload({waitUntil:'domcontentloaded'});await require('./enter-app.cjs')(page);await page.waitForFunction(()=>window.MementoStorageGuard?.writable);await navigate(page,'life','notes');assert.equal((await state()).notes.find(x=>x.id===n.id).body.includes('Volgende stap'),true);assert((await state()).knowledge.workspace.background.file);await shot(page,'workspace-reopened');
 // Independently verify the ordinary textarea editor against the approved
 // prototype: the structured-document fixture above cannot establish this.
 await page.evaluate(id=>window.MementoKnowledge.showNote(id),n.id);
 await page.evaluate(id=>window.MementoLifeFlow.start('note',id),n.id);
 assert(await page.locator('#mementoFollowupForm').isVisible(),'Linked follow-up creation must be available');
 await page.locator('#followupOptionsSummary').click();
 await page.locator('#followupTarget').selectOption('note');
 await page.locator('#followupTitle').fill(fixtureTitle);
 await page.getByRole('button',{name:'Vervolg toevoegen'}).click();
 await page.waitForFunction(originId=>JSON.parse(localStorage.getItem('compass_life_preview_v1')).notes.some(x=>x.mementoFlow?.origin?.id===originId&&x.document==null),n.id);
 const plain=(await state()).notes.find(x=>x.mementoFlow?.origin?.id===n.id&&!x.document);
 assert(plain,'Follow-up note uses the original plain-text storage shape');
 await page.locator('[data-kc=edit]').first().click();
 assert.equal(await page.locator('#kc-title').inputValue(),fixtureTitle);
 assert.equal(await page.locator('#kc-body').inputValue(),(await state()).notes.find(x=>x.id===n.id).body,'Plain follow-up preserves the exact current source text, including its later added document heading');
 assert((await page.locator('#kc-body').inputValue()).includes(fixtureBody),'The approved prototype fixture content remains intact');
 assert.equal(await page.locator('.kc-v3-format>button').count(),5,'Normal editor uses the exact five prototype toolbar actions');
 assert.equal(await page.locator('.kc-v3-save-btn').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(197, 223, 195)');
 await shot(page,'approved-plain-editor-same-fixture');
 checks.push('Approved plain-text prototype compared independently from preserved visual document; exact title/body and five toolbar actions');
 for(const kind of ['task','appointment']){
  await page.locator('#lifeDialog [data-life-close]').first().waitFor({state:'hidden'});
  await navigate(page,'life','notes');
  await page.evaluate(id=>window.MementoKnowledge.showNote(id),n.id);
  if(await page.locator('[data-kc=edit]').count())await page.locator('[data-kc=edit]').first().click();
  assert(await page.locator('.kc-v3-writing-card').isVisible(),'Source editor opens before follow-up');
  await page.locator('[data-kc=editor-followup]').click();
  await page.locator('#kc-v3-followup-sheet [data-kc=editor-followup-kind][data-id='+kind+']').click();
  await page.locator('#followupOptionsSummary').click();
  await page.locator('#followupExtra').fill('Fictieve vervolginformatie voor '+kind);
  if(kind==='appointment'){
   await page.locator('#followupDate').fill('2026-10-28');
   await page.locator('#followupTime').fill('10:30');
  }
  await page.getByRole('button',{name:'Vervolg toevoegen'}).click();
  await page.waitForFunction(({id,kind})=>{
   const s=JSON.parse(localStorage.getItem('compass_life_preview_v1'));
   return s[kind==='task'?'tasks':'appointments'].some(x=>x.mementoFlow?.origin?.id===id);
  },{id:n.id,kind});
  const saved=await state(),created=saved[kind==='task'?'tasks':'appointments'].find(x=>x.mementoFlow?.origin?.id===n.id);
  assert.equal(created.mementoFlow.origin.kind,'note');
  assert(created.notes.includes('Fictieve vervolginformatie voor '+kind));
  if(kind==='appointment'){assert.equal(created.date,'2026-10-28');assert.equal(created.time,'10:30');}
  assert.equal(saved.notes.find(x=>x.id===n.id).document.blocks[0].text,fixtureBody,'Original document text remains intact');
  assert.equal(saved.notes.find(x=>x.id===n.id).document.blocks[0].id,n.document.blocks[0].id,'Original document block ID remains intact');
  await page.locator('#lifeDialog [data-life-close]').first().click();
  await navigate(page,'life','notes');
 }
 checks.push('All three follow-up kinds persisted in fictional storage with origin, extra text, appointment date/time and unchanged source document');

};

