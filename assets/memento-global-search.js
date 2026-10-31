/* Memento global search: one bar in Mijn dag, contextual read-only dropdown. */
(() => {
 'use strict';
 const Core=window.MementoGlobalSearchCore;
 if (!Core) return;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ICON='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/></svg>';
 const labels={all:'Alles',tasks:'Taken',appointments:'Afspraken',notes:'Notities',finance:'Financiën',life:'Leven',fitness:'Fitness',transactions:'Transacties',receipts:'Bonnetjes',bills:'Vaste lasten',goals:'Spaardoelen',groceries:'Boodschappen',wishes:'Wensen',templates:'Sjablonen',research:'Onderzoek',budgets:'Budgetten',categories:'Categorieën'};
 const glyphs={tasks:'☑',appointments:'▦',notes:'▤',transactions:'€',receipts:'▤',bills:'€',goals:'◎',groceries:'□',wishes:'✧',templates:'☑',fitness:'♡',research:'⌕',budgets:'€',categories:'▦'};
 let host=null, query='',scope='all',expanded=false,opened=false,results=[],records=[],timer=0,selected=-1;
 const canShow=()=>!document.body.classList.contains('pin-locked') && document.body.dataset.compassArea==='life' && document.getElementById('lifeApp')?.dataset.lifeView==='today';
 function data(){
   let life={},finance={};
   try {life=window.MementoKnowledgeBridge?.read?.()||{};}catch{}
   try {finance=window.MementoFinanceBridgeV9?.state?.()||{};}catch{}
   return Core.build(life,finance);
 }
 const meta=r=>[labels[r.kind]||'Item',r.status,r.date ? r.date.slice(0,16).replace('T',' · ') : ''].filter(Boolean).join(' · ');
 function labelGroups(list) {
   const groups=new Map();
   for(const r of list){const k=r.kind;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)}
   return [...groups].map(([kind,rs])=>'<div class="mgs-section"><h3>'+esc(labels[kind]||'Overig')+' <span>'+rs.length+'</span></h3>'+rs.map(row).join('')+'</div>').join('');
 }
 function row(r){
   const i=results.indexOf(r);
   return '<button type="button" class="mgs-result" data-mgs-result="'+i+'" role="option" id="mgs-item-'+i+'" aria-selected="'+(selected===i)+'"><span class="mgs-icon" aria-hidden="true">'+esc(glyphs[r.kind]||'•')+'</span><span class="mgs-result-copy"><strong>'+esc(r.title)+'</strong><small>'+esc(meta(r))+'</small></span><span class="mgs-chevron" aria-hidden="true">›</span></button>';
 }
 function render(){
   if(!host?.isConnected)return;
   const panel=host.querySelector('#mgsDropdown'),input=host.querySelector('#mgsInput'),clear=host.querySelector('#mgsClear');
   if(!panel||!input)return;
   panel.hidden=!opened;input.setAttribute('aria-expanded',String(opened));
   clear.hidden=!query;
   if(!opened)return;
   records=data();
   const q=query.trim(),all=Core.search(records,q,scope,10001);
   results=all.slice(0,expanded?120:6);
   const filters=[['all','Alles'],['tasks','Taken'],['appointments','Afspraken'],['notes','Notities'],['finance','Financiën'],['life','Leven'],['fitness','Fitness']];
   const chips='<div class="mgs-chips" role="group" aria-label="Zoekfilter">'+filters.map(([key,title])=>{
      const count=Core.search(records,q,key,10001).length;
      return '<button type="button" data-mgs-filter="'+key+'" aria-pressed="'+(scope===key)+'">'+title+' <span>'+count+'</span></button>';
   }).join('')+'</div>';
   const header='<div class="mgs-section-label">'+(q?'Resultaten voor <strong>'+esc(q)+'</strong>':'Recent in Memento')+'</div>';
   const items=results.length?(expanded?labelGroups(results):results.map(row).join('')):'<p class="mgs-empty">'+(q?'Geen resultaten gevonden. Probeer een ander zoekwoord of filter.':'Er staan nog geen doorzoekbare items in deze selectie.')+'</p>';
   const more=all.length>6?'<button type="button" class="mgs-more" data-mgs-more="1">'+(expanded?'Minder resultaten tonen':'Alle '+all.length+' resultaten bekijken')+' <span aria-hidden="true">'+(expanded?'↑':'→')+'</span></button>':'';
   panel.innerHTML=chips+header+'<div class="mgs-list" role="listbox" aria-label="Zoekresultaten">'+items+'</div>'+more;
   if(selected>=results.length)selected=-1;
   input.setAttribute('aria-activedescendant',selected>=0?'mgs-item-'+selected:'');
 }
 function open(){
   if(!canShow())return;
   // Regaining input focus after clicking a filter or "show all" must not collapse results.
   if(!opened){expanded=false;selected=-1;}
   opened=true;render();
 }
 function close(){
   opened=false;selected=-1;render();
 }
 function go(r){
   if(!r)return false;
   if(r.area==='finance'){
     if(window.MementoNavigation?.setArea('finance')!==true)return false;
     const bridge=window.MementoFinanceBridgeV9;if(!bridge)return false;
     if(r.kind==='transactions'){bridge.changeView('transactions');bridge.edit(r.id);}
     else if(r.kind==='receipts')bridge.openReceipt(r.id);
     else if(r.kind==='bills')bridge.openBill(r.id);
     else if(r.kind==='goals')bridge.openGoal(r.id);
     else bridge.changeView(r.view);
     close();return true;
   }
   let accepted;
   if(r.kind==='appointments'&&r.source==='google')accepted=window.MementoGlobalSearchLifeOpen?.('appointments-google',r.id,r.date);
   else if(r.kind==='notes'||r.kind==='tasks'||r.kind==='wishes'||r.kind==='appointments'){
     accepted=window.MementoKnowledgeBridge?.openRelated?.(r.kind==='wishes'?'wish':r.kind==='appointments'?'appointment':r.kind==='tasks'?'task':'note',r.id);
   }else accepted=window.MementoGlobalSearchLifeOpen?.(r.kind,r.id,r.date);
   if(accepted===true)close();
   return accepted===true;
 }
 function mount(){
   const next=document.getElementById('mementoUniversalSearchHost');
   if(!next||next===host&&next.querySelector('#mgsInput'))return;
   host=next;query='';scope='all';expanded=false;opened=false;
   host.classList.add('mgs-host');
   host.innerHTML='<div class="mgs-bar">'+ICON+'<input type="search" id="mgsInput" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="mgsDropdown" aria-label="Zoek in heel Memento" placeholder="Zoek in heel Memento…" autocomplete="off" spellcheck="false" maxlength="120"><button type="button" id="mgsClear" aria-label="Zoekopdracht wissen" hidden>×</button></div><div id="mgsDropdown" class="mgs-dropdown" hidden></div>';
   const input=host.querySelector('#mgsInput');
   input.addEventListener('focus',open);
   input.addEventListener('input',()=>{
     query=input.value;opened=true;expanded=false;selected=-1;clearTimeout(timer);timer=setTimeout(render,90);
   });
   input.addEventListener('keydown',e=>{
     if(e.key==='Escape'){e.preventDefault();close();input.blur();return;}
     if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!opened)open();selected=Math.max(0,Math.min(results.length-1,selected+(e.key==='ArrowDown'?1:-1)));render();return;}
     if(e.key==='Enter'&&opened&&results.length){e.preventDefault();go(results[Math.max(0,selected)]);}
   });
   host.addEventListener('click',e=>{
     const filter=e.target.closest('[data-mgs-filter]'),result=e.target.closest('[data-mgs-result]'),more=e.target.closest('[data-mgs-more]');
     if(filter){scope=filter.dataset.mgsFilter;expanded=false;selected=-1;render();input.focus({preventScroll:true});return;}
     if(result){go(results[Number(result.dataset.mgsResult)]);return;}
     if(more){expanded=!expanded;selected=-1;render();input.focus({preventScroll:true});return;}
     if(e.target.closest('#mgsClear')){input.value='';query='';expanded=false;scope='all';opened=true;render();input.focus({preventScroll:true});}
   });
 }
 document.addEventListener('pointerdown',e=>{if(opened&&host&&!host.contains(e.target))close();});
 document.addEventListener('keydown',e=>{
   if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&!e.altKey&&canShow()){
     e.preventDefault();document.querySelector('#mgsInput')?.focus();
   }
   if(e.key==='Escape'&&opened&&document.activeElement?.id!=='mgsInput')close();
 });
 window.MementoGlobalSearch={mount};
 mount();
})();