/* Memento settings navigation: presentation only. Existing controls keep their original event handlers. */
(()=>{'use strict';
 const $=(s,r=document)=>r.querySelector(s);
 const selected={life:null,finance:null};
 const pages=['appearance','personal','assistant','backup','privacy','trash','life','finance'];
 const labels={appearance:'Weergave',personal:'Persoonlijke instellingen',assistant:'Memento-assistent',backup:'Back-up en herstel',privacy:'Privacy en beveiliging',trash:'Prullenbak',life:'Leven',finance:'Financiën'};
 const descriptions={appearance:'Achtergrond en vormgeving',personal:'Voorkeuren en standaardwaarden',assistant:'Gegevens analyseren en organiseren',backup:'Volledige Memento-back-up',privacy:'Vergrendeling en lokale opslag',trash:'Verwijderde gegevens beheren',life:'Taken, agenda en notities',finance:'Categorieën en financiële voorkeuren'};
 const symbols={
  appearance:'<circle cx="12" cy="12" r="9"/><path d="M12 3a3 3 0 0 0 0 6h2a2.5 2.5 0 0 1 0 5h-1a2 2 0 0 0-2 2v1"/>',
  personal:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
  assistant:'<rect x="5" y="6" width="14" height="13" rx="3"/><path d="M12 2v4M8 12h.01M16 12h.01M9 16h6"/>',
  backup:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 7v9m-4-4 4 4 4-4M8 20h8"/>',
  privacy:'<path d="M12 2 4 6v6c0 5 4 8 8 10 4-2 8-5 8-10V6L12 2Z"/><path d="m9 12 2 2 4-4"/>',
  trash:'<path d="M4 6h16M9 6V4h6v2M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  life:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2"/>',
  finance:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M3 10h18M7 3h10"/>'
 };
 const svg=id=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+symbols[id]+'</svg>';
 function section(title,ids,area){
  return '<section class="ms-group" aria-label="'+title+'"><h2>'+title+'</h2><div class="ms-list">'+ids.map(id=>'<button type="button" class="ms-row" data-ms-target="'+id+'" aria-controls="ms-'+area+'-'+id+'"><span class="ms-icon">'+svg(id)+'</span><span class="ms-copy"><strong>'+labels[id]+'</strong><small>'+descriptions[id]+'</small></span><span class="ms-chevron" aria-hidden="true">›</span></button>').join('')+'</div></section>';
 }
 function create(area,host){
  const shell=document.createElement('section');shell.className='ms-shell';shell.id='mementoSettings'+(area==='life'?'Life':'Finance');shell.dataset.msArea=area;
  shell.innerHTML='<div class="ms-home"><header class="ms-heading"><p class="ms-eyebrow">MEMENTO</p><h1>Instellingen</h1><p>Beheer Memento op één plek.</p></header>'+
   section('Algemeen',['appearance','personal','assistant'],area)+section('Gegevens en veiligheid',['backup','privacy','trash'],area)+section('Onderdelen',['life','finance'],area)+
   '<p class="ms-footnote">Bewaar een volledige back-up buiten je telefoon. Lokale browsergegevens kunnen verdwijnen.</p></div>'+
   pages.map(id=>'<section class="ms-page" data-ms-page="'+id+'" id="ms-'+area+'-'+id+'" aria-label="'+labels[id]+'" hidden><header class="ms-detail-head"><button type="button" class="ms-back" data-ms-back aria-label="Terug naar instellingen"><span aria-hidden="true">‹</span> Terug</button><h2 tabindex="-1">'+labels[id]+'</h2></header><div class="ms-page-body"></div></section>').join('');
  const body=id=>$('.ms-page[data-ms-page="'+id+'"] .ms-page-body',shell);
  const message=(id,title,text)=>{const node=document.createElement('div');node.className='ms-info';node.innerHTML='<strong>'+title+'</strong><p>'+text+'</p>';body(id).append(node);};
  message('appearance','Bos-thema','Memento gebruikt momenteel de bestaande bosachtergrond. De instellingenlijsten zijn bewust rustiger en beter leesbaar gemaakt. Andere app-thema’s zijn nog niet beschikbaar.');
  message('life','Jouw Leven-onderdelen','Open een onderdeel direct via de bestaande navigatie. Je gegevens en instellingen blijven behouden.');
  message('finance','Financiële instellingen','Beheer je categorieën en financiële standaardwaarden, zonder nieuwe gegevensopslag.');
  if(area==='life'){
   message('personal','Financiële voorkeuren','Valuta, standaardperiode en salarisdag zijn te beheren onder Financiën.');
  }else{
   message('assistant','Assistent voor Leven','De bestaande Memento-assistent is beschikbaar bij Leven.');
  }
  const appendLinks=(id,arr)=>{const nav=document.createElement('nav');nav.className='ms-shortcuts';nav.setAttribute('aria-label','Gerelateerde onderdelen');nav.innerHTML=arr.map(([label,to])=>'<button type="button" class="ms-shortcut" data-ms-go="'+to+'">'+label+'<span aria-hidden="true">›</span></button>').join('');body(id).append(nav);};
  appendLinks('life',[['Mijn dag','life:today'],['Taken','life:tasks'],['Agenda','life:agenda'],['Notities','life:notes']]);
  if(area==='life'){appendLinks('personal',[['Open financiële voorkeuren','finance:personal']]);appendLinks('finance',[['Open financiële instellingen','finance:finance']]);}
  else{appendLinks('assistant',[['Open Memento-assistent','life:assistant']]);appendLinks('life',[['Open Leven','life:life']]);appendLinks('finance',[['Persoonlijke instellingen','finance:personal'],['Back-up en herstel','finance:backup']]);}
  shell.addEventListener('click',e=>{
   const target=e.target.closest('[data-ms-target],[data-ms-back],[data-ms-go]');
   if(!target)return;
   if(target.hasAttribute('data-ms-back')){openPage(shell,null);return;}
   if(target.dataset.msGo){navigate(target.dataset.msGo);return;}
   const id=target.dataset.msTarget;
   if(area==='life'&&id==='personal'){navigate('finance:personal');return;}
   if(area==='life'&&id==='finance'){navigate('finance:finance');return;}
   if(area==='finance'&&id==='assistant'){navigate('life:assistant');return;}
   if(area==='finance'&&id==='life'){navigate('life:life');return;}
   openPage(shell,id);
  });
  host.prepend(shell);
  return {shell,body};
 }
 function openPage(shell,id){
  selected[shell.dataset.msArea]=id||null;
  const home=$('.ms-home',shell);home.hidden=!!id;
  shell.querySelectorAll('.ms-page').forEach(p=>p.hidden=p.dataset.msPage!==id);
  if(id){$('.ms-page[data-ms-page="'+id+'"] h2',shell)?.focus({preventScroll:true});}
  else $('.ms-heading h1',shell)?.setAttribute('tabindex','-1');
  if(!id)$('.ms-heading h1',shell)?.focus({preventScroll:true});
  const container=shell.closest('.life-main,.content')||document.scrollingElement;
  container?.scrollTo?.({top:0,behavior:'instant'});
 }
 function navigate(target){
  const [area,id]=target.split(':');
  if(area==='life'){
   if(window.MementoNavigation?.setArea('life')===false)return;
   if(id==='life'){window.MementoNavigation?.setView('backup');}
   else if(['today','tasks','agenda','notes'].includes(id)){window.MementoNavigation?.setView(id);return;}
   else window.MementoNavigation?.setView('backup');
   if(id==='assistant')requestAnimationFrame(()=>requestAnimationFrame(()=>open('life','assistant')));
  }else{
   if(window.MementoNavigation?.setArea('finance')===false)return;
   $('#sideNav [data-view="settings"]')?.click();
   requestAnimationFrame(()=>open('finance',id));
  }
 }
 function open(area,id){
  const shell=$('#mementoSettings'+(area==='life'?'Life':'Finance'));
  if(shell)openPage(shell,id);
 }
 function move(node,container){if(node&&container&&!container.contains(node))container.append(node);}
 function mountLife(){
  const app=$('#lifeApp'),host=$('#lifeContent');
  if(!app||app.dataset.lifeView!=='backup'||!host||host.querySelector(':scope > .ms-shell')||!$('#mementoAssistant',host)||!$('#lifeExportBackup',host))return;
  const {shell,body}=create('life',host);
  const panel=id=>$('#'+id,host)?.closest('.life-panel');
  move(panel('lifeExportBackup'),body('backup'));
  move(panel('lifeImportFile'),body('backup'));
  move($('#mementoAssistant',host),body('assistant'));
  move($('[data-memento-pin-lock-now]',host)?.closest('.life-panel'),body('privacy'));
  move(panel('lifeStorageStatus'),body('privacy'));
  move(panel('lifeOpenPurgeTrash'),body('trash'));
  host.querySelector('.life-grid:empty')?.remove();
  if(selected.life)openPage(shell,selected.life);
 }
 function refreshFinanceTrash(){
  const shell=$('#mementoSettingsFinance'),trash=$('#mementoFinanceTrash');
  if(shell&&trash)move(trash,$('[data-ms-page="trash"] .ms-page-body',shell));
 }
 function mountFinance(){
  const host=$('#view-settings'),grid=$('.settings-grid',host);
  if(!host||!grid||host.querySelector(':scope > .ms-shell'))return;
  // Existing glass/layout decorators may wrap original cards in <details> before
  // this script loads. Locate cards by their native controls, never wrapper order.
  const cards=[
   $('#settingsForm')?.closest('.settings-card'),
   $('#exportBackup')?.closest('.settings-card'),
   $('#categorySettingsList')?.closest('.settings-card'),
   $('#clearAllData')?.closest('.settings-card'),
   $('#view-settings [data-memento-pin-lock-now]')?.closest('.settings-card')
  ];
  if(cards.some(card=>!card))return;
  const {body}=create('finance',host);
  move(cards[0],body('personal'));
  move(cards[1],body('backup'));
  move(cards[2],body('finance'));
  move(cards[3],body('privacy'));
  move(cards[4],body('privacy'));
  refreshFinanceTrash();
 }
 const life=$('#lifeContent'),finance=$('#view-settings');
 if(life)new MutationObserver(mountLife).observe(life,{childList:true});
 if(finance)new MutationObserver(()=>{if(!$('#mementoSettingsFinance'))mountFinance();refreshFinanceTrash();}).observe(finance,{childList:true,subtree:true});
 mountFinance();mountLife();
 window.MementoSettings={open,mountLife,mountFinance,refreshFinanceTrash};
})();