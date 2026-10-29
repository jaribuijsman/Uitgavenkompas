/* Approved Memento layouts. Reuses native controls and handlers; owns no data. */
(()=>{'use strict';
 const $=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
 const states=new Map();
 function text(el,value){if(el&&el.textContent!==value)el.textContent=value;}
 function fold(nodes,title,id){
  nodes=nodes.filter(Boolean);if(!nodes.length)return null;
  const old=nodes[0].closest('details[data-ml-fold]');if(old)return old;
  const d=document.createElement('details');d.className='mg-fold ml-fold';d.dataset.mlFold=id||title;
  const s=document.createElement('summary');s.textContent=title;d.append(s);
  const b=document.createElement('div');b.className='mg-fold-body';d.append(b);nodes[0].before(d);nodes.forEach(n=>b.append(n));return d;
 }
 function once(host,key,fn){if(!host||host.dataset[key])return;host.dataset[key]='1';fn();}
 function tabs(host,key,entries,before){
  if(!host||$('#ml-'+key,host))return;
  const nav=document.createElement('nav');nav.id='ml-'+key;nav.className='ml-tabs';nav.setAttribute('aria-label',key==='planning'?'Planningweergave':'Onderzoekstap');
  (before||host.firstElementChild)?.before(nav);
  const panels=entries.map(([id,label,nodes])=>{const panel=document.createElement('section');panel.id='ml-'+key+'-'+id;panel.className='ml-panel';panel.setAttribute('aria-label',label);nodes.filter(Boolean).forEach(n=>panel.append(n));const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.mlTab=id;b.setAttribute('aria-controls',panel.id);nav.append(b);return {id,panel,b};});
  for(const p of panels)nav.after(p.panel);
  // Insert in reading order (after() otherwise reverses siblings).
  let anchor=nav;for(const p of panels){anchor.after(p.panel);anchor=p.panel;}
  function select(id){if(!panels.some(p=>p.id===id))return;states.set(key,id);for(const p of panels){p.panel.hidden=p.id!==id;p.b.setAttribute('aria-pressed',String(p.id===id));}nav.dispatchEvent(new CustomEvent('memento-layout-tab',{bubbles:true}));}
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-ml-tab]');if(b)select(b.dataset.mlTab);});nav.mlSelect=select;select(states.get(key)||entries[0][0]);
 }
 function summary(d,inputs,prefix='Filters'){if(!d)return;const labels=inputs.filter(Boolean).map(e=>e.tagName==='SELECT'?e.selectedOptions[0]?.textContent:e.value).filter(Boolean);text(d.querySelector(':scope>summary'),prefix+(labels.length?' · '+labels.join(' · '):''));}
 function finance(){
  const analysis=$('#view-analysis');if(analysis){const d=fold([$('.analysis-controls',analysis)],'Filters','analysis-filters');summary(d,[$('#analysisPeriod'),$('#analysisAccountFilter'),$('#analysisPersonFilter')]);const stats=$('#analysisStats'),cards=stats?all(':scope>.stat-card',stats):[];if(cards.length===4)fold(cards.slice(2),'Resultaat en spaarpercentage','analysis-more');const nav=$('.analysis-tabs',analysis);if(nav&&d&&nav.nextElementSibling!==d)nav.after(d);}
  const tx=$('#view-transactions');if(tx){
   once(tx,'mlTransactions',()=>{
    const filters=fold([$('.tx-filter-toolbar',tx),$('#txMoreFilters')],'Filters','transaction-filters');
    if(filters){$('.tx-search-wrap',tx)?.after(filters);}
    const sums=$('#txSummary');if(sums){const rest=all(':scope>.tx-summary-card:not(.tx-summary-net)',sums);const details=fold(rest,'Alle selectietotalen','transaction-totals');if(details)sums.append(details);}
   });
   summary($('[data-ml-fold=transaction-filters]',tx),[$('#txTypeFilter'),$('#txAccountFilter'),$('#txCategoryFilter')]);
  }
  const budgets=$('#view-budgets');if(budgets){
   const stats=$('#budgetStats'),cards=stats?all(':scope>.stat-card',stats):[];
   if(cards.length===4){stats.prepend(cards[3]);fold(cards.slice(0,3),'Meer budgetcijfers','budget-numbers');}
   const controls=fold([$('.memento-budget-toolbar',budgets)],'Budget beheren','budget-controls');
   const editor=$('#totalBudgetForm')?.closest('.card');const admin=fold([editor],'Totaalbudget instellen','budget-total');
   if(controls&&admin&&!admin.contains(controls))admin.querySelector('.mg-fold-body').prepend(controls);
   if(admin&&admin.parentElement!==budgets)budgets.append(admin);
  }
  const accounts=$('#view-accounts');if(accounts){
   const cards=$('#accountCards');if(cards&&!cards.dataset.mlFirst){cards.dataset.mlFirst='1';const context=$('.memento-finance-context',accounts)||$('.page-head',accounts);context?.after(cards);}
   fold([$('#accountOverviewStats')],'Maandcijfers','account-numbers');
   fold([$('#accountPeriodBreakdown')?.closest('.card')],'Mutaties per rekening','account-period');
   fold([$('#monthCloseContent')?.closest('.card')],'Maandafsluiting','account-close');
   for(const card of all('#accountCards>.account-card'))once(card,'mlCompact',()=>{
    card.classList.add('ml-account-row');
    const rest=all(':scope>*',card).filter(e=>!e.matches('.card-head,.balance-number,[data-account-transactions]'));
    const d=fold(rest,'Startpositie en eerdere controle','account-settings');if(d)card.append(d);
    const actual=$('[data-account-actual]',card),b=document.createElement('button');b.type='button';b.className='btn ml-account-check';b.dataset.accountCheck=actual?.dataset.accountActual||'';b.textContent='Saldo controleren';card.append(b);
   });
   fold([$('#accountReconciliation')?.closest('.card')],'Verschillen en controles','account-reconciliation');
  }
  const planning=$('#view-planning');if(planning){
   const stats=fold([$('#planningStats')],'Planningcijfers','planning-numbers');
   const bills=$('#billList')?.closest('.planner-grid'),goals=$('#goalList'),head=goals?.previousElementSibling;
   const scenario=$('#scenarioAmount')?.closest('.mg-fold')||$('#scenarioAmount')?.closest('.card');
   if(bills&&goals)tabs(planning,'planning',[['payments','Betalingen',[bills]],['goals','Spaardoelen',[head,goals,scenario]]],stats||bills);
   const extra=$('#dailyBudgetBlock');fold([extra,$('#planningNote')],'Aannames bij de raming','planning-assumptions');
  }
  const smart=$('#view-smartbuy');if(smart){
   once(smart,'mlSmart',()=>{
    fold([$('.smartbuy-intro',smart),$('.smartbuy-guide',smart)],'Over Slim Kopen','smart-help');
    const form=$('#smartBuyForm'),exclude=$('#smartBuyExclude')?.closest('.form-field');if(form&&exclude){const d=fold([exclude],'Uitsluitingen','smart-exclude');form.querySelector('.smartbuy-fields')?.append(d);}
    const steps=$('.mg-research-steps',smart);if(steps)steps.remove();
   });
   const workspace=$('#researchWorkspace');if(workspace&&!$('#ml-research',smart)){
    const question=$('#smartBuyForm')?.closest('.smartbuy-layout'),output=$('#smartBuyOutputCard');
    const answers=$('#researchAnswers')?.closest('.form-field'),approval=$('#researchApproved')?.closest('label'),result=$('#researchResult')?.closest('.form-field');
    // Keep saved dossiers and native save/new actions outside the steps.
    tabs(smart,'research',[['question','Vraag',[question]],['requirements','Eisen',[answers,approval]],['compare','Vergelijk',[output]],['choice','Keuze',[result]]],question);
    const actions=$('#researchSave')?.parentElement;if(actions)workspace.prepend(actions);
   }
   const output=$('#smartBuyOutputCard');if(output&&!output.hidden&&states.get('research')==='question')$('#ml-research')?.mlSelect?.('compare');
  }
  const coach=$('#view-moneycoach');if(coach){once(coach,'mlCoach',()=>{
   fold([$('.moneycoach-intro',coach)],'Over Geldcoach','coach-help');
   const modes=$('.moneycoach-modes',coach);if(modes){const label=document.createElement('label');label.className='ml-coach-choice';label.textContent='Onderwerp';const select=document.createElement('select');select.id='mlCoachMode';select.setAttribute('aria-label','Coachonderwerp');for(const b of all('[data-coach-mode]',modes)){const o=document.createElement('option');o.value=b.dataset.coachMode;o.textContent=$('b',b)?.textContent||b.textContent;select.append(o);}select.addEventListener('change',()=>{const b=$('[data-coach-mode="'+select.value+'"]',modes);b?.click();});label.append(select);modes.before(label);fold([modes],'Alle coachonderwerpen','coach-modes');}
   const fields=['moneyCoachPeriod','moneyCoachAccount','moneyCoachPerson'].map(id=>$('#'+id)?.closest('.form-field'));const d=fold(fields,'Periode, rekening en persoon','coach-context');if(d)$('#moneyCoachForm')?.append(d);
   const privacy=$('.moneycoach-privacy',coach);fold([privacy],'Gegevens en privacy','coach-privacy');
   const guide=$('.moneycoach-guide',coach);if(guide){const rest=all(':scope>*',guide).filter(e=>!e.matches('.card-title,#moneyCoachStats,#moneyCoachDataNote'));fold(rest,'Werkwijze','coach-guide');}
  });const selected=$('[data-coach-mode].active',coach);if(selected&&$('#mlCoachMode')?.value!==selected.dataset.coachMode)$('#mlCoachMode').value=selected.dataset.coachMode;summary($('[data-ml-fold=coach-context]',coach),[$('#moneyCoachPeriod'),$('#moneyCoachAccount'),$('#moneyCoachPerson')],'Context');}
  const receipt=$('#view-receipts');if(receipt){once(receipt,'mlReceipts',()=>{
   const steps=$('.mg-receipt-steps',receipt);if(steps)steps.remove();
   const form=$('#receiptForm'),intro=form?.closest('.card'),bundle=$('#receiptMonthStats')?.closest('.card');
   const head=$('#receiptList')?.previousElementSibling,list=$('#receiptList');
   if(intro&&form){const input=document.createElement('section');input.className='card ml-receipt-entry';input.setAttribute('aria-label','Bon invoeren');intro.before(input);for(const n of [...intro.children])if(n!==form)input.append(n);
    const check=document.createElement('div');check.className='ml-check-head';check.textContent='Controleer winkel, datum, totaal en productregels';form.prepend(check);
    tabs(receipt,'receipts',[['input','Invoer',[input]],['check','Controleren',[intro]],['link','Koppelen en beheer',[bundle,head,list]]],input);
   }
  });}
  const settings=$('#view-settings');if(settings)once(settings,'mlSettings',()=>{const b=document.createElement('button');b.type='button';b.className='btn primary';b.textContent='Volledige back-up en herstel';b.addEventListener('click',()=>window.MementoLife?.openBackup?.());const card=document.createElement('section');card.className='card ml-backup-link';const h=document.createElement('h2');h.textContent='Back-up & herstel';card.append(h,b);$('.page-head',settings)?.after(card);});
 }
 function life(){
  const app=$('#lifeApp'),view=app?.dataset.lifeView,host=$('#lifeContent');if(!app||!host)return;
  if(view==='today'){
   for(const future of all('.memento-future-day:not(.life-overdue-group)',host)){const counts=$('[data-memento-total]',future);if(counts){let badge=$(':scope>summary .ml-future-count',future);if(!badge){badge=document.createElement('span');badge.className='ml-future-count';$(':scope>summary',future)?.append(badge);}text(badge,counts.textContent);}}
   const head=$('.mg-day-head',host);if(head&&!$('.ml-day-context',head)){const line=document.createElement('p');line.className='ml-day-context';const C=window.MementoFitnessCore,today=C?.date?.();line.textContent=new Date().toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'})+(today&&C.duty?' · '+C.duty(today).label+' · '+C.duty(today).time:'');head.prepend(line);}
  }
  if(view==='agenda'){
   const panel=$('.memento-calendar-panel',host);once(panel,'mlAgenda',()=>{
    const intro=$('.memento-cal-intro',panel),tools=$('.mg-agenda-tools',panel);if(tools&&intro)intro.before(tools);
    const month=$('.memento-cal-toolbar',panel),roster=$('.mg-roster-strip',panel),detail=$('.mg-roster-detail',panel),duty=$('#mementoDutyDetail');
    fold([roster,detail,duty],'Dienstrooster · tien dagen','agenda-roster');
    const gcal=$('#memento-gcal-tools')?.closest('.mg-fold');if(gcal)panel.append(gcal);
    if(month){const actions=$('.memento-cal-actions',month),add=$('[data-memento-new-event]',month);if(add){month.before(add);add.classList.add('ml-agenda-add');}fold([month],'Maand en dag kiezen','agenda-month');}
    const day=$('.memento-gcal-day-section',panel);if(day){const switcher=$('.mg-agenda-tools',panel);switcher?.after(day);}
   });
   if(app.dataset.mgAgenda==='month'){const month=$('[data-ml-fold=agenda-month]',host);if(month&&!month.open)month.open=true;}
  }
  if(view==='wishes')for(const card of all('.mg-wish-card',host))card.classList.add('ml-wish-row');
  if(view==='backup'){
   const legacy=$('#lifeExportLegacyBackup');if(legacy){const d=fold([legacy],'Oude JSON-export zonder bijlagen','backup-legacy');const main=legacy.closest('.life-panel');if(d&&main)main.after(d);}
  }
  if(view==='fitness'){
   const fitness=$('#mementoFitness');if(fitness){const session=$('.ft-exercise-panel',fitness);if(!session){for(const card of all('.ft-panel',fitness)){const title=$('h2',card)?.textContent||'';if(/Spieropbouw · jouw huidige niveau/.test(title))fold([card],'Trainingsvoorstel','fitness-proposal');}}}
  }
 }
 function refresh(){finance();life();}
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(['addGoal','addGoalInline'].includes(b.id))$('#ml-planning')?.mlSelect?.('goals');
  if(['addBill','addBillInline'].includes(b.id))$('#ml-planning')?.mlSelect?.('payments');
  if(b.id==='receiptApplyJson')$('#ml-receipts')?.mlSelect?.('check');
  if(b.id==='researchNew')$('#ml-research')?.mlSelect?.('question');
 });
 document.addEventListener('invalid',e=>{const panel=e.target.closest('.ml-panel');if(panel?.hidden){const nav=document.querySelector('[aria-controls="'+panel.id+'"]');nav?.click();}},true);
 window.MementoLayout={refresh};
})();
