/* UI integration for the approved review. Moves existing controls; owns no data. */
(()=>{'use strict';
 const $=s=>document.querySelector(s);
 const openedExercises=new Set();let frame=0;
 function fold(nodes,title,open=false){
  nodes=nodes.filter(Boolean);if(!nodes.length)return null;
  const d=document.createElement('details');d.className='mg-fold';d.open=open;
  const summary=document.createElement('summary');summary.textContent=title;d.append(summary);
  const body=document.createElement('div');body.className='mg-fold-body';d.append(body);
  nodes[0].before(d);nodes.forEach(n=>body.append(n));return d;
 }
 function field(form,id){const el=form.querySelector('#'+id);return el?.closest('.form-field,.life-form-field')||el?.closest('label');}
 function markForm(form){
  if(form.dataset.mgReady)return;form.dataset.mgReady='1';
  const grid=form.querySelector('.form-grid,.life-form-grid');
  if(form.id==='lifeTaskForm'&&grid){
   for(const id of ['lifeTaskTitle','lifeTaskDate','lifeTaskSteps']){const n=field(form,id);if(n)grid.append(n);}
   const nodes=['lifeTaskKind','lifeTaskCategory','lifeTaskRepeat','lifeTaskRepeatDays','lifeTaskRoom','lifeTaskPriority','lifeTaskNotes'].map(id=>field(form,id));
   const summary=['lifeTaskKind','lifeTaskCategory','lifeTaskRoom'].map(id=>form.querySelector('#'+id)?.selectedOptions[0]?.textContent).filter(Boolean).join(' · ');
   const d=fold(nodes,'Eigenschappen · '+summary);if(d){d.dataset.mgTaskProperties='1';d.classList.add('wide');grid.append(d);}
  }
  if(form.id==='txForm'&&grid&&!form.querySelector('.memento-payment-details')){
   const primary=['txDescription','txAmount','txDate','txAccount','txCategory','txSubcategory','txPerson'];primary.forEach(id=>{const n=field(form,id);if(n)grid.append(n);});
   const d=fold(['txMerchant','txPaymentMethod','txNote'].map(id=>field(form,id)),'Meer details · betaling, winkel en notitie');if(d){d.classList.add('wide');grid.append(d);}
   // The existing split editor remains independently available, including legacy split metadata.
  }
 }
 function decorate(){
  frame=0;
  for(const form of document.querySelectorAll('#lifeTaskForm,#txForm'))markForm(form);
  const taskProps=$('#lifeTaskForm [data-mg-task-properties]>summary');if(taskProps){const text=['lifeTaskKind','lifeTaskCategory','lifeTaskRoom','lifeTaskRepeat','lifeTaskPriority'].map(id=>$('#'+id)?.selectedOptions[0]?.textContent).filter(Boolean).join(' · ');if(taskProps.textContent!=='Eigenschappen · '+text)taskProps.textContent='Eigenschappen · '+text;}
  const today=$('#lifeApp[data-life-view=today] #lifeContent');
  if(today&&!today.querySelector('.mg-day-head')){
   const h=document.createElement('div');h.className='mg-day-head';
   const title=document.createElement('h2');title.textContent='Mijn dag';h.append(title);
   const button=document.createElement('button');button.type='button';button.className='life-btn';button.dataset.lifeJournal='';button.textContent='Schrijf in dagboek';h.append(button);today.prepend(h);
  }
  const hero=today?.querySelector('.flow-hero');if(hero&&!hero.closest('.mg-fold'))fold([hero],'Gedachte voor vandaag');
  const tabs=$('#lifeApp .memento-task-tabs');
  const tasks=$('#lifeApp[data-life-view=tasks] #lifeContent');
  if(tasks){
   const capture=tasks.querySelector('.memento-capture-card');
   if(capture&&!capture.closest('.mg-fold'))fold([capture],'Snelle invoer · taak, notitie of dagboek');
   const sort=tasks.querySelector('.memento-task-sort'),filters=tasks.querySelector('.memento-filter-fields');
   if(sort&&filters&&!filters.contains(sort))filters.append(sort);
  }
  if(tabs&&!tabs.dataset.mgReady){
   tabs.dataset.mgReady='1';const rest=[...tabs.children].filter(b=>!['open','done'].includes(b.dataset.lifeTaskTab));
   const selected=rest.find(b=>b.getAttribute('aria-pressed')==='true');
   const d=fold(rest,selected?.textContent||'Overzichten');if(d){d.classList.add('mg-task-overviews');tabs.append(d);}
  }
  const agenda=$('#lifeApp[data-life-view=agenda] .memento-calendar-panel');
  if(agenda&&!agenda.querySelector('.mg-agenda-tools')){
   $('#lifeApp').dataset.mgAgenda||($('#lifeApp').dataset.mgAgenda='list');
   const row=document.createElement('div');row.className='mg-agenda-tools';row.setAttribute('aria-label','Agendaweergave');
   for(const [mode,label]of [['list','Daglijst'],['month','Maand']]){const b=document.createElement('button');b.type='button';b.dataset.mgAgenda=mode;b.textContent=label;b.setAttribute('aria-pressed',String(($('#lifeApp').dataset.mgAgenda||'list')===mode));row.append(b);}
   agenda.querySelector('.memento-cal-toolbar')?.before(row);
   const tools=agenda.querySelector('#memento-gcal-tools');if(tools&&!tools.closest('.mg-fold'))fold([tools],'Google Calendar · verbinding');
  }
  if(agenda&&!agenda.querySelector('.mg-roster-strip')&&window.MementoFitnessCore){
   const C=window.MementoFitnessCore,strip=document.createElement('div');strip.className='mg-roster-strip';strip.setAttribute('aria-label','Dienstrooster komende tien dagen');
   const detail=document.createElement('p');detail.className='mg-roster-detail';detail.setAttribute('aria-live','polite');
   for(let i=0;i<10;i++){const d=new Date(C.date()+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);const iso=d.toISOString().slice(0,10),duty=C.duty(iso),b=document.createElement('button');b.type='button';b.dataset.mgDuty=iso;b.textContent=String(d.getUTCDate());const code=document.createElement('span');code.textContent=duty.code;b.append(code);b.setAttribute('aria-pressed',String(i===0));b.setAttribute('aria-label',iso+' · '+duty.label+' · '+duty.time);strip.append(b);if(i===0)detail.textContent=duty.label+' · '+duty.time+(duty.carryUntil?' · vorige nachtdienst tot '+duty.carryUntil:'');}
   const tools=agenda.querySelector('.mg-agenda-tools');tools?.after(strip,detail);
  }
  for(const card of document.querySelectorAll('#lifeWishResults .life-panel')){if(card.dataset.mgWish)continue;card.dataset.mgWish='1';card.classList.add('mg-wish-card');const actions=card.querySelector('.life-card-actions');if(actions){const manage=[...actions.querySelectorAll('[data-life-wish-edit],[data-life-wish-delete]')];const d=fold(manage,'Beheer');if(d)actions.append(d);}const ps=[...card.querySelectorAll(':scope>p')].filter(p=>!p.textContent.startsWith('Budget:'));if(ps.length)fold(ps,'Notitie');}
  // Context and chips expose the real native financial filters; clicking clears that control.
  const tx=$('#view-transactions');if(tx){
   let chips=tx.querySelector('.mg-filter-chips');if(!chips){chips=document.createElement('div');chips.className='mg-filter-chips';chips.setAttribute('aria-label','Actieve transactiefilters');tx.querySelector('#txList')?.before(chips);if(!chips.isConnected)tx.querySelector('.tx-filter-bar,.tx-toolbar')?.after(chips);}
   if(chips.isConnected){const controls=['txTypeFilter','txAccountFilter','txCategoryFilter','txSubcategoryFilter','txPersonFilter','txFrom','txTo'];
    const key=controls.map(id=>$("#"+id)?.value||'').join('|');if(chips.dataset.mgValue!==key){chips.dataset.mgValue=key;chips.replaceChildren();for(const id of controls){const input=$("#"+id);if(!input||!input.value||input.value==='all')continue;const b=document.createElement('button');b.type='button';b.dataset.mgClearFinance=id;b.textContent=input.selectedOptions?.[0]?.textContent||input.value;b.setAttribute('aria-label',b.textContent+' wissen');chips.append(b);}}
   }
  }
  for(const input of document.querySelectorAll('[data-account-actual]')){
   if(input.dataset.mgExplicit)continue;input.dataset.mgExplicit='1';const b=document.createElement('button');b.type='button';b.className='btn primary';b.dataset.mgConfirmBalance=input.id;b.textContent='Saldo controleren';input.after(b);
   const opening=input.closest('.account-card')?.querySelector('[data-account-opening]');if(opening){const n=opening.closest('.form-field');if(n&&!n.closest('.mg-fold'))fold([n],'Startpositie instellen');}
  }
  for(const editor of document.querySelectorAll('.kc-direct-editor,.kc-diary-write')){if(editor.dataset.mgReady)continue;editor.dataset.mgReady='1';const nodes=[editor.querySelector('#kc-title')?.closest('label'),editor.querySelector('[data-kc-edit="tags"]')?.closest('label')].filter(Boolean);const d=fold(nodes,'Titel en tags · optioneel');if(d)editor.append(d);}
  const cooking=$('.kc-recipe');if(cooking&&!cooking.querySelector('[data-mg-cooking]')){const b=document.createElement('button');b.type='button';b.className='kc-btn';b.dataset.mgCooking='';b.textContent='Kookstand';cooking.append(b);}
  const fitness=$('#mementoFitness');
  if(fitness){const panels=[...fitness.querySelectorAll('.ft-exercise-panel')];panels.forEach((panel,i)=>{if(panel.closest('.mg-exercise-fold'))return;const d=document.createElement('details');d.className='life-panel ft-panel mg-exercise-fold';d.open=openedExercises.has(panel.id)||(!openedExercises.size&&i===0);const head=document.createElement('summary');head.textContent=panel.querySelector('h2')?.textContent||'Oefening '+(i+1);d.append(head);panel.before(d);d.append(panel);d.addEventListener('toggle',()=>{if(d.open)openedExercises.add(panel.id);else openedExercises.delete(panel.id);});});
   const routines=[...fitness.querySelectorAll('.ft-routine-heading')].filter(h=>h.querySelector('.ft-cycle-label'));if(routines.length&&!fitness.querySelector('.mg-cycle-strip')){const strip=document.createElement('nav');strip.className='mg-cycle-strip';strip.setAttribute('aria-label','Actieve trainingscyclus');routines.forEach((head,i)=>{head.closest('.ft-panel').dataset.mgRoutine=String(i);const b=document.createElement('button');b.type='button';b.dataset.mgRoutineJump=String(i);b.textContent=head.textContent;strip.append(b);});fitness.querySelector('.ft-toolbar')?.after(strip);}
   for(const card of fitness.querySelectorAll('.ft-panel')){const title=card.querySelector('h2')?.textContent;if(title==='Spieropbouw · jouw huidige niveau'&&!card.closest('.mg-fold'))fold([card],'Voorstel vergelijken en toepassen');}
   const progress=fitness.querySelector('#ft-progress-select');if(progress){const main=progress.closest('.ft-panel');if(main&&!main.dataset.mgOrdered){main.dataset.mgOrdered='1';fitness.querySelector('.ft-stats')?.after(main);}for(const card of fitness.querySelectorAll('.ft-panel')){const title=card.querySelector('h2')?.textContent||'';if(['Trainingsfrequentie','Werksets per hoofdspiergroep · 7 dagen','Spieropbouw · voeding en gewicht','Lichaamsmetingen'].includes(title)&&!card.closest('.mg-fold'))fold([card],title);}}
  }
  // Finances/settings retain native controls and handlers, with contextual administration.
  for(const card of document.querySelectorAll('#view-settings .settings-card')){if(card.closest('.mg-fold'))continue;const h=card.querySelector('h3');if(h){const d=fold([card],h.textContent);d.dataset.mgSetting='1';}}
  const budget=$('#totalBudgetForm');if(budget&&!budget.closest('.mg-fold'))fold([budget],'Totaalbudget instellen');
  const backup=$('#lifeApp[data-life-view=backup] #lifeContent');if(backup){for(const card of backup.querySelectorAll('.life-panel')){const title=card.querySelector('h2')?.textContent;if(title&&title!=='Volledige Memento-back-up'&&!card.closest('.mg-fold'))fold([card],title);}}
  const scenario=$('#scenarioAmount')?.closest('.card');if(scenario&&!scenario.closest('.mg-fold')){const heading=scenario.previousElementSibling;const nodes=heading?.classList.contains('section-row')?[heading,scenario]:[scenario];fold(nodes,'Scenario berekenen · verandert je gegevens niet');}
  const receipt=$('#receiptImportJson');if(receipt&&!receipt.closest('.mg-fold')){const nodes=[receipt.closest('.form-field')||receipt.parentElement,$('#receiptApplyJson')].filter(Boolean);fold(nodes,'JSON van ChatGPT invoeren');}
  for(const host of document.querySelectorAll('#view-smartbuy,#view-receipts')){if(host.querySelector('.mg-research-steps,.mg-receipt-steps'))continue;const steps=document.createElement('div');steps.className=host.id==='view-smartbuy'?'mg-research-steps':'mg-receipt-steps';for(const label of host.id==='view-smartbuy'?['Vraag','Eisen','Vergelijk','Keuze']:['Invoer','Controleren','Koppelen']){const s=document.createElement('span');s.textContent=label;steps.append(s);}host.querySelector('.page-head')?.after(steps);}
  for(const card of document.querySelectorAll('#lifeContent>.life-panel,#lifeContent .ft-panel,#mementoFinanceV9 .m9-card,.kc-inbox')){
   if(card.dataset.mgLight)continue;card.dataset.mgLight='1';card.classList.add('mg-light','mg-lightfall');
  }
  window.MementoLayout?.refresh();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(decorate);}
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.mgCooking!==undefined){const readable=$('.kc-readable');if(readable){const on=readable.classList.toggle('mg-cooking');b.textContent=on?'Normale weergave':'Kookstand';if(on&&!readable.querySelector('[data-mg-next-step]')){const next=document.createElement('button');next.type='button';next.className='kc-btn';next.dataset.mgNextStep='0';next.textContent='Volgende stap';readable.append(next);}}return;}
  if(b.dataset.mgNextStep!==undefined){const items=[...b.parentElement.querySelectorAll('p,li')];if(items.length){items.forEach(x=>x.classList.remove('mg-current-step'));const i=Number(b.dataset.mgNextStep)%items.length;items[i].classList.add('mg-current-step');items[i].scrollIntoView({block:'nearest'});b.dataset.mgNextStep=String(i+1);}return;}
  if(b.dataset.mgRoutineJump!==undefined){const card=$('#mementoFitness [data-mg-routine="'+b.dataset.mgRoutineJump+'"]');if(card){card.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});const first=card.querySelector('button');first?.focus({preventScroll:true});}return;}
  if(b.dataset.mgDuty){const C=window.MementoFitnessCore,duty=C.duty(b.dataset.mgDuty),host=b.closest('.memento-calendar-panel');host.querySelectorAll('[data-mg-duty]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));host.querySelector('.mg-roster-detail').textContent=new Date(duty.date+'T12:00:00Z').toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'short'})+' · '+duty.label+' · '+duty.time+(duty.carryUntil?' · vorige nachtdienst tot '+duty.carryUntil:'');return;}
  if(b.dataset.mgAgenda){const app=$('#lifeApp');app.dataset.mgAgenda=b.dataset.mgAgenda;app.querySelectorAll('[data-mg-agenda]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));window.MementoLayout?.refresh();return;}
  if(b.dataset.mgClearFinance){const input=$('#'+b.dataset.mgClearFinance);if(input){input.value=input.tagName==='SELECT'?'all':'';input.dispatchEvent(new Event('change',{bubbles:true}));schedule();}return;}
  if(b.dataset.mgConfirmBalance){const input=$('#'+b.dataset.mgConfirmBalance);if(input){input.dataset.mgConfirm='1';input.dispatchEvent(new Event('change',{bubbles:true}));delete input.dataset.mgConfirm;}return;}
 });
 document.addEventListener('invalid',e=>{let n=e.target.parentElement;while(n){if(n.tagName==='DETAILS')n.open=true;n=n.parentElement;}},true);
 document.addEventListener('change',schedule);document.addEventListener('input',e=>{if(e.target.id==='txSearch')schedule();});
 // Text updates (including the training clock) do not change the control structure.
 // Observe app/modal roots, and synchronously prepare only newly inserted forms.
 const observer=new MutationObserver(records=>{
  let structure=false;
  for(const record of records){
   for(const node of [...record.addedNodes,...record.removedNodes])if(node.nodeType===1)structure=true;
   for(const node of record.addedNodes){if(node.nodeType!==1)continue;
    if(node.matches('#lifeTaskForm,#txForm'))markForm(node);
    for(const form of node.querySelectorAll('#lifeTaskForm,#txForm'))markForm(form);
   }
  }
  if(structure){releaseMenus();schedule();}
 });
 for(const root of document.querySelectorAll('#lifeApp,body>.app,#lifeDialog,#modalBackdrop'))observer.observe(root,{subtree:true,childList:true});
 // Only ancestors of an open menu need to release their glass containing block.
 const menuAncestors=new Set();
 function releaseMenus(){
  const next=new Set();
  for(const menu of document.querySelectorAll('#lifeApp .life-task-menu[open]')){
   for(let n=menu.parentElement;n&&n!==document.body;n=n.parentElement)next.add(n);
  }
  for(const n of menuAncestors)if(!next.has(n))n.classList.remove('mg-menu-ancestor');
  for(const n of next)n.classList.add('mg-menu-ancestor');
  menuAncestors.clear();for(const n of next)menuAncestors.add(n);
 }
 document.addEventListener('toggle',e=>{if(e.target.matches('.life-task-menu'))releaseMenus();},true);
 schedule();
})();
