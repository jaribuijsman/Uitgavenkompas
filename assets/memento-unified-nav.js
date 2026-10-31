
(()=>{'use strict';
 const quick=document.getElementById('mementoQuickNav');
 const layer=document.getElementById('mementoMenuLayer');
 const grid=document.getElementById('mementoMenuGrid');
 const closeButton=document.getElementById('mementoMenuClose');
 const icons={
  fitness:'<path d="m6 4-2 2m4 0-4 4m6-2 6 6m0 2 4-4m-2 6 2-2M3 7l4-4m10 18 4-4"/>',
  day:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  tasks:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m7 12 3 3 6-7"/>',
  library:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  household:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z"/><path d="M9 21v-7h6v7"/>',
  groceries:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
  wishes:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  notes:'<path d="M8 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M10 8h7m-7 4h7m-7 4h4M3 7v10"/>',
  agenda:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  backup:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/>',
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  transactions:'<path d="M7 7h14m0 0-4-4m4 4-4 4M17 17H3m0 0 4-4m-4 4 4 4"/>',
  analysis:'<path d="M3 21h18M6 17V9m6 8V3m6 14v-6"/>',
  accounts:'<rect x="2" y="5" width="20" height="15" rx="3"/><path d="M2 10h20m-5 5h2"/>',
  budgets:'<circle cx="12" cy="12" r="9"/><path d="M12 3v18m6-9H6"/>',
  planning:'<path d="M4 3h16v18H4zM8 7h8m-8 5h8m-8 5h5"/>',
  smartbuy:'<path d="m12 3 2.8 5.8 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.7l6.2-.9z"/>',
  moneycoach:'<path d="M12 3 3 7v5c0 5 3.4 8.7 9 10 5.6-1.3 9-5 9-10V7l-9-4Z"/><path d="m9 12 2 2 4-5"/>',
  receipts:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M8 8h8m-8 4h8m-8 4h4"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
 };
 const life=[['fitness','Fitness','fitness'],['today','Mijn dag','day'],['tasks','Taken','tasks'],['agenda','Agenda','agenda'],['notes','Notities','notes'],['groceries','Boodschappen','groceries'],['wishes','Wensen','wishes'],['backup','Instellingen','backup']];
 const finance=[['dashboard','Overzicht','dashboard'],['transactions','Transacties','transactions'],['analysis','Analyse','analysis'],['budgets','Budgetten','budgets'],['accounts','Rekeningen','accounts'],['planning','Planning','planning'],['smartbuy','Slim Kopen','smartbuy'],['moneycoach','Geldcoach','moneycoach'],['receipts','Bonnetjes','receipts'],['settings','Instellingen','settings']];
 const sets={life,finance};
 const fav={life:['today','tasks','agenda','notes'],finance:['dashboard','transactions','analysis','budgets']};
 let lastFocus=null;
 const area=()=>document.body.dataset.compassArea==='finance'?'finance':'life';
 const active=a=>{
   if(a==='life')return document.querySelector('#lifeNavigation button[aria-current="page"]')?.dataset.lifeView||'today';
   return document.querySelector('#sideNav button.active')?.dataset.view||'dashboard'
 };
 const icon=name=>window.MementoIllustratedIcons?.svg(name)||'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+icons[name]+'</svg>';
 function sync(){
  const a=area(),v=active(a),items=sets[a];
  for(const [key,,symbol]of life){const span=document.querySelector('#lifeNavigation [data-life-view="'+key+'"] .life-nav-icon');if(span)span.innerHTML=icon(symbol)}
  for(const [key,,symbol]of finance){const span=document.querySelector('#sideNav [data-view="'+key+'"] .ico');if(span)span.innerHTML=icon(symbol)}
  quick.innerHTML=fav[a].map(id=>{
   const item=items.find(x=>x[0]===id);const current=id===v;
   return '<button type="button" data-memento-dest="'+a+':'+id+'"'+(current?' aria-current="page"':'')+'>'+icon(item[2])+'<span>'+item[1]+'</span></button>';
  }).join('')+'<button type="button" data-memento-menu="open" aria-label="Alle onderdelen" aria-haspopup="dialog">'+icon('menu')+'<span>Meer</span></button>';
  if(!layer.hidden)paintMenu()
 }
 function paintMenu(){const a=area(),v=active(a);document.getElementById('mementoMenuTitle').textContent=a==='life'?'Leven — alle onderdelen':'Financiën — alle onderdelen';
  layer.querySelectorAll('[data-memento-switch]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mementoSwitch===a)));
  const groups=a==='life'?[['Dagelijks',['today','tasks','agenda','groceries','wishes']],['Notities',['notes']],['Fitness',['fitness']],['Instellingen',['backup']]]:[['Financiën',finance.map(x=>x[0])]];grid.innerHTML=groups.map(([name,ids])=>'<h3 class="ml-menu-label">'+name+'</h3>'+ids.map(id=>{const [,label,symbol]=sets[a].find(x=>x[0]===id);return '<button type="button" data-memento-dest="'+a+':'+id+'"'+(v===id?' class="active" aria-current="page"':'')+'>'+icon(symbol)+'<span>'+label+'</span></button>';}).join('')).join('');
 }
 function close(){if(layer.hidden)return;layer.hidden=true;document.body.classList.remove('memento-menu-open');lastFocus?.focus?.();lastFocus=null}
 function open(){if(document.body.classList.contains('pin-locked'))return;lastFocus=document.activeElement;paintMenu();layer.hidden=false;document.body.classList.add('memento-menu-open');closeButton.focus()}
 function goto(target){const [a,id]=target.split(':');if(!sets[a]?.some(x=>x[0]===id))return;
  close();if(a!==area())document.querySelector('#compassAreaBar [data-compass-area="'+a+'"]').click();
  const b=a==='life'?document.querySelector('#lifeNavigation [data-life-view="'+id+'"]'):document.querySelector('#sideNav [data-view="'+id+'"]');
  b?.click();sync()
 }
 function onClick(e){const b=e.target.closest('[data-memento-dest],[data-memento-menu],[data-memento-switch],#mementoMenuClose,#mementoMenuBackdrop');if(!b)return;
  if(b.dataset.mementoDest){goto(b.dataset.mementoDest);return}
  if(b.dataset.mementoMenu==='open'){open();return}
  if(b.dataset.mementoSwitch){const a=b.dataset.mementoSwitch;if(a!==area())document.querySelector('#compassAreaBar [data-compass-area="'+a+'"]').click();paintMenu();sync();return}
  if(b.id==='mementoMenuClose'||b.id==='mementoMenuBackdrop')close()
 }
 document.addEventListener('click',onClick);
 document.addEventListener('keydown',e=>{if(layer.hidden)return;if(e.key==='Escape'){e.preventDefault();close()}if(e.key==='Tab'){const buttons=[...layer.querySelectorAll('button:not([disabled])')];const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 // The original app performs all navigation and data mutations; this layer only routes clicks.
 window.MementoSyncNav=sync;
 window.MementoIconDecorate=()=>{
  const I=window.MementoIllustratedIcons;if(!I)return;
  const staticTargets=[["#mobileMenu","settings"],["#quickSearch","search"],[".dashboard-card-icon","time"],[".smartbuy-intro-icon","smartbuy"],[".moneycoach-intro-icon","moneycoach"]];
  for(const [selector,name] of staticTargets)for(const el of document.querySelectorAll(selector))if(!el.querySelector(".memento-illustrative-icon"))el.innerHTML=I.svg(name);
  const modes={monthcheck:"planning",spending:"analysis",budget:"budgets",goals:"star"};
  for(const [key,name] of Object.entries(modes)){const el=document.querySelector('[data-coach-mode="'+key+'"] .mode-icon');if(el&&!el.querySelector(".memento-illustrative-icon"))el.innerHTML=I.svg(name);}
  for(const el of document.querySelectorAll(".mini-icon-btn"))if(el.textContent.trim()==="✎")el.innerHTML=I.svg("edit",{quiet:true});
  const tabs={overview:"dashboard",categories:"budgets",trends:"analysis"};
  for(const [key,name] of Object.entries(tabs)){
   const tab=document.querySelector('[data-analysis-tab="'+key+'"]');
   if(!tab||tab.querySelector(".memento-illustrative-icon"))continue;
   for(const node of [...tab.childNodes])if(node.nodeType===3){node.textContent=node.textContent.replace(/^[\\s◫◉↗]+/u,"");break;}
   tab.insertAdjacentHTML("afterbegin",I.svg(name));
  }
 };
 window.MementoIconDecorate();
 sync();
})();
