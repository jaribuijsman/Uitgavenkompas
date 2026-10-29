/* Memento Day Portal: no synthetic user data; existing life store + shared Open-Meteo cache. */
(()=>{'use strict';
 const lock=document.getElementById('pinLock'),forest=lock?.querySelector('.pin-forest-bg'),form=document.getElementById('pinForm');
 if(!lock||!forest||!form)return;
 const PIN_KEY='memento_manual_pin_lock_v1',LIFE_KEY='compass_life_preview_v1',WEATHER_KEY='compass_weather_beverwijk_v1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const hour=()=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',hour:'2-digit',hourCycle:'h23'}).format(new Date()));
 const isLocked=()=>{try{return localStorage.getItem(PIN_KEY)==='1'}catch{return false}};
 const root=document.createElement('section');
 root.id='mementoStart';root.setAttribute('aria-label','Memento dagoverzicht');
 root.innerHTML=`<div class="ms-shell"><div class="ms-content">
<header class="ms-brand"><img class="ms-logo" src="./assets/memento-logo-gold.png" alt="Memento — Reflect · Refine · Conquer" width="260" height="90"><div class="ms-date" id="ms-date">Vandaag</div></header>
<section class="ms-weather ms-glass" aria-label="Weersverwachting Beverwijk"><span class="ms-overline">Beverwijk · Vandaag</span><div class="ms-topweather"><div class="ms-temperature" id="ms-temp">—°</div><div class="ms-condition" id="ms-condition">Weersverwachting ophalen…</div></div><div class="ms-summary" id="ms-summary">Actuele voorspelling van Open-Meteo</div><div class="ms-hourly" id="ms-hourly" aria-label="Weer per uur"><div class="ms-hour"><time>—:—</time><b>·</b><strong>—°</strong></div></div><div class="ms-source"><span id="ms-weather-status">Weer wordt bijgewerkt</span><span><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a><button type="button" class="ms-refresh" id="ms-refresh" aria-label="Weer verversen">↻</button></span></div></section>
<section class="ms-day ms-glass" aria-label="Jouw daglijn"><div class="ms-dayhead"><button class="ms-overview" type="button" data-ms-view="today">Jouw daglijn</button><div class="ms-counts"><span id="ms-events" aria-live="polite">Agenda laden…</span><span id="ms-tasks" aria-live="polite">Taken laden…</span></div></div>
<div class="ms-timeline">
<button class="ms-cardrow" type="button" data-ms-view="agenda"><span class="ms-time" id="ms-event-first-time">Vandaag</span><span class="ms-rowtext"><strong id="ms-event-first-title">Agenda laden…</strong><small id="ms-event-first">Vandaag · Agenda</small></span><img class="ms-thumb" src="./assets/memento-start-agenda.svg" alt=""></button>
<button class="ms-cardrow" id="ms-task-row-first" type="button" data-ms-view="tasks"><span class="ms-time">Taken</span><span class="ms-rowtext"><strong id="ms-task-first-title">Taken laden…</strong><small id="ms-task-first">Vandaag · Mijn taken</small></span><img class="ms-thumb" src="./assets/memento-start-tasks.svg" alt=""></button>
<button class="ms-cardrow" type="button" data-ms-view="agenda"><span class="ms-time" id="ms-event-second-time">Morgen</span><span class="ms-rowtext"><strong id="ms-event-second-title">Agenda laden…</strong><small id="ms-event-second">Morgen · Agenda</small></span><img class="ms-thumb" src="./assets/memento-start-agenda.svg" alt=""></button>
<button class="ms-cardrow" id="ms-task-row-second" type="button" data-ms-view="tasks"><span class="ms-time">Later</span><span class="ms-rowtext"><strong id="ms-task-second-title">Taken laden…</strong><small id="ms-task-second">Komende dagen · Mijn taken</small></span><img class="ms-thumb" src="./assets/memento-start-tasks.svg" alt=""></button>
</div></section>
<nav class="ms-quick" aria-label="Snelfuncties"><button class="ms-quickbutton" type="button" data-ms-create="task"><span aria-hidden="true">＋</span>Taak</button><button class="ms-quickbutton" type="button" data-ms-create="note"><span aria-hidden="true">＋</span>Snelle notitie</button><button class="ms-quickbutton" type="button" data-ms-create="transaction"><span aria-hidden="true">＋</span>Transactie</button></nav>
</div></div><div class="ms-footer"><button class="ms-continue" id="ms-continue" type="button">Doorgaan <span aria-hidden="true">→</span></button></div>`;
 lock.insertBefore(root,form);
 const one=id=>document.getElementById(id);
 function setFocusBlocked(blocked){
  for(const el of [document.querySelector('.app'),document.getElementById('lifeApp'),document.getElementById('compassAreaBar')])if(el)el.inert=blocked;
 }
 function showWelcome(){
  if(isLocked())return showPin();
  lock.classList.add('visible','memento-welcome-mode');lock.removeAttribute('aria-labelledby');lock.setAttribute('aria-label','Memento dagoverzicht');
  document.body.classList.add('pin-locked','memento-start-open');
  setFocusBlocked(true);refreshDay();refreshWeather();illuminate();
 }
 function showPin(){
  lock.classList.add('visible');lock.classList.remove('memento-welcome-mode');
  lock.removeAttribute('aria-label');lock.setAttribute('aria-labelledby','pinTitle');
  document.body.classList.remove('memento-start-open');document.body.classList.add('pin-locked');
  setFocusBlocked(true);
 }
 function leave(){
  lock.classList.remove('visible','memento-welcome-mode');document.body.classList.remove('memento-start-open','pin-locked');setFocusBlocked(false);
 }
 function navigate(view){
  try{
   if(document.body.dataset.compassArea!=='life')document.querySelector('#compassAreaBar [data-compass-area="life"]')?.click();
   document.querySelector('#lifeNavigation [data-life-view="'+view+'"]')?.click();
   return document.body.dataset.compassArea==='life'&&document.getElementById('lifeApp')?.dataset.lifeView===view;
  }catch{}
  return false;
 }
 root.querySelector('#ms-continue').addEventListener('click',()=>{if(isLocked()){showPin();return}leave()});
 root.querySelectorAll('[data-ms-view]').forEach(btn=>btn.addEventListener('click',()=>{
  if(isLocked()){showPin();return}leave();navigate(btn.dataset.msView);
 }));
 // Reuse the real editors and their validation/storage guards; this portal never writes records.
 function create(kind){
  if(isLocked()){showPin();return}
  leave();
  if(kind==='transaction'){
   document.querySelector('#compassAreaBar [data-compass-area="finance"]')?.click();
   if(document.body.dataset.compassArea!=='finance')return;
   document.getElementById('addTransactionTop')?.click();
  }else if(kind==='task'){
   if(navigate('tasks'))document.getElementById('lifeAdd')?.click();
  }else if(kind==='note'&&navigate('notes')){
   // open() preserves a pending concept; the existing Inbox capture owns speech/save/expand.
   window.MementoKnowledge?.open?.();
   requestAnimationFrame(()=>{
    const field=document.getElementById('kc-quick-text')||document.getElementById('kc-body');
    field?.focus();field?.scrollIntoView({block:'center'});
   });
  }
 }
 root.querySelectorAll('[data-ms-create]').forEach(button=>button.addEventListener('click',()=>create(button.dataset.msCreate)));
 function illuminate(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  root.classList.remove('ms-illuminate');void root.offsetWidth;root.classList.add('ms-illuminate');
 }
 function setRow(prefix,title,detail){one(prefix+'-title').textContent=title;one(prefix).textContent=detail;}
 function refreshDay(){
  const iso=date(),tomorrow=new Date(Date.parse(iso+'T12:00:00Z')+86400000).toISOString().slice(0,10);
  const fmt=new Intl.DateTimeFormat('nl-NL',{timeZone:'Europe/Amsterdam',weekday:'long',day:'numeric',month:'long'});
  one('ms-date').textContent=fmt.format(new Date());
  let s;try{s=JSON.parse(localStorage.getItem(LIFE_KEY)||'null')}catch{}
  if(!s||!Array.isArray(s.tasks)||!Array.isArray(s.appointments)){
   one('ms-events').textContent='Agenda niet beschikbaar';one('ms-tasks').textContent='Taken niet beschikbaar';
   setRow('ms-event-first','Agenda niet beschikbaar','Vandaag · Agenda');setRow('ms-event-second','Agenda niet beschikbaar','Morgen · Agenda');one('ms-event-first-time').textContent='Vandaag';one('ms-event-second-time').textContent='Morgen';
   setRow('ms-task-first','Taken niet beschikbaar','Geen gegevens');setRow('ms-task-second','Taken niet beschikbaar','Geen gegevens');one('ms-task-row-first').removeAttribute('aria-label');
   one('ms-task-row-first').classList.remove('ms-row-overdue');return;
  }
  const taskDate=t=>/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')?t.date:/^\d{4}-\d{2}-\d{2}$/.test(t.focusDate||'')?t.focusDate:'';
  const pending=s.tasks.filter(t=>t&&!t.deletedAt&&!t.archived&&!t.done);
  const todayTasks=pending.filter(t=>taskDate(t)===iso);
  const late=pending.filter(t=>{const d=taskDate(t);return d&&d<iso}).sort((a,b)=>taskDate(a).localeCompare(taskDate(b)));
  const future=pending.filter(t=>taskDate(t)>iso).sort((a,b)=>taskDate(a).localeCompare(taskDate(b)));
  one('ms-tasks').textContent=todayTasks.length+' vandaag · '+late.length+' achterstallig';
  if(late.length){
   const t=late[0],days=Math.round((Date.parse(iso+'T12:00:00Z')-Date.parse(taskDate(t)+'T12:00:00Z'))/86400000);
   const planned=new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',timeZone:'Europe/Amsterdam'}).format(new Date(taskDate(t)+'T12:00:00Z'));
   setRow('ms-task-first',t.title||'Taak zonder titel',planned+' · '+(days===1?'1 dag te laat':days+' dagen te laat'));
   one('ms-task-row-first').classList.add('ms-row-overdue');
   one('ms-task-row-first').setAttribute('aria-label',(t.title||'Taak')+', gepland '+planned+', '+days+' '+(days===1?'dag':'dagen')+' te laat. Open taken.');
   if(todayTasks.length)setRow('ms-task-second',todayTasks[0].title||'Taak zonder titel','Vandaag · Mijn taken');
   else setRow('ms-task-second',future[0]?.title||'Geen taken gepland','Komende dagen · Mijn taken');
  }else{
   one('ms-task-row-first').classList.remove('ms-row-overdue');one('ms-task-row-first').removeAttribute('aria-label');
   setRow('ms-task-first',todayTasks[0]?.title||'Geen taken vandaag','Vandaag · Mijn taken');
   setRow('ms-task-second',future[0]?.title||'Geen taken gepland','Komende dagen · Mijn taken');
  }
  const appointmentsFor=day=>{
   const personal=s.appointments.filter(e=>e&&!e.deletedAt&&!e.cancelled&&e.date===day).map(e=>({title:e.title||'Afspraak',time:e.time||''}));
   const remote=Array.isArray(s.googleAppointments)?s.googleAppointments.filter(e=>{
    if(!e||e.status==='cancelled'||s.appointmentChecks?.['google:'+e.id]?.done)return false;
    const start=e.start?.date||e.start?.dateTime||'';
    if(start.slice(0,10)===day)return true;
    if(e.start?.dateTime){const dt=new Date(e.start.dateTime);return !Number.isNaN(dt.valueOf())&&new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam'}).format(dt)===day}
    return false;
   }).map(e=>({title:e.summary||'Afspraak',time:e.start?.dateTime?.slice(11,16)||''})):[];
   return [...personal,...remote].sort((a,b)=>String(a.time).localeCompare(String(b.time)));
  };
  const events=appointmentsFor(iso),next=appointmentsFor(tomorrow);
  one('ms-events').textContent=events.length+' '+(events.length===1?'afspraak':'afspraken')+' vandaag';
  one('ms-event-first-time').textContent=events[0]?.time||'Vandaag';one('ms-event-second-time').textContent=next[0]?.time||'Morgen';
  setRow('ms-event-first',events[0]?.title||'Geen afspraken','Vandaag · Agenda');
  setRow('ms-event-second',next[0]?.title||'Geen afspraken','Morgen · Agenda');
 }
 function weatherIcon(code,isDay){
  if(code===0||code===1)return isDay?'☀':'☾';
  if(code===2)return '⛅';if(code===3)return '☁';
  if(code===45||code===48)return '≋';
  if([71,73,75,77,85,86].includes(code))return '❄';
  if([95,96,99].includes(code))return 'ϟ';
  if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return '☂';
  return '☁';
 }
 function weatherName(code){
  if(code===0)return 'Helder';if(code<=2)return 'Wisselend bewolkt';if(code===3)return 'Bewolkt';
  if(code===45||code===48)return 'Mistig';if([71,73,75,77,85,86].includes(code))return 'Sneeuw of buien';
  if(code>=95)return 'Kans op onweer';if(code>=51&&code<=67||code>=80&&code<=82)return 'Regen of buien';
  return 'Wisselvallig';
 }
 function refreshWeather(event){
  const detail=event?.detail||window.CompassFlow?.weatherState?.()||{};
  const busy=detail.busy===true,failed=detail.failed===true;
  one('ms-refresh').disabled=busy;
  let entry=detail.cached;
  if(!entry)try{entry=JSON.parse(localStorage.getItem(WEATHER_KEY)||'null')}catch{}
  const c=entry?.data?.current,d=entry?.data?.daily,h=entry?.data?.hourly;
  const fresh=Number.isFinite(entry?.fetchedAt)&&Date.now()-entry.fetchedAt<90*60000&&Date.now()>=entry.fetchedAt-5*60000&&c?.time?.slice(0,10)===date();
  const valid=Number.isFinite(c?.temperature_2m)&&Number.isFinite(c?.weather_code);
  one('ms-temp').textContent=valid?Math.round(c.temperature_2m)+'°':'—°';
  one('ms-condition').textContent=valid?weatherIcon(c.weather_code,c.is_day!==0)+' '+weatherName(c.weather_code):'Geen actuele weersgegevens';
  const idx=d?.time?.indexOf(date())??-1,low=d?.temperature_2m_min?.[idx],high=d?.temperature_2m_max?.[idx],rain=d?.precipitation_probability_max?.[idx];
  one('ms-summary').textContent=idx>=0&&Number.isFinite(low)&&Number.isFinite(high)?Math.round(low)+'°–'+Math.round(high)+'° vandaag'+(Number.isFinite(rain)?' · '+Math.round(rain)+'% kans op neerslag':''):'Weerverwachting voor vandaag';
  one('ms-weather-status').textContent=busy?'Weer wordt bijgewerkt…':failed?(valid?'Vernieuwen mislukt · opgeslagen weer van '+c.time.replace('T',' · '):'Weer ophalen mislukt · controleer je verbinding'):fresh?'Actueel · '+c.time.slice(11,16):valid?'Opgeslagen voorspelling · mogelijk verouderd':'Geen verbinding? Probeer opnieuw';
  const today=date(),hours=[];
  if(Array.isArray(h?.time)&&Array.isArray(h?.temperature_2m)&&Array.isArray(h?.weather_code)){
   for(let i=0;i<h.time.length;i++){
    const time=h.time[i];if(time.slice(0,10)!==today)continue;
    const hh=+time.slice(11,13);if(hh%3!==0||hh<6||hh>21)continue;
    const temp=h.temperature_2m[i],code=h.weather_code[i],prob=h.precipitation_probability?.[i];
    if(Number.isFinite(temp)&&Number.isFinite(code))hours.push({time:time.slice(11,16),temp,code,prob});
   }
  }
  if(!hours.length){one('ms-hourly').innerHTML='<span style="font-size:12px;color:#ccdbcd;padding:14px 0">Uurverwachting niet beschikbaar. Vernieuw het weer.</span>';return}
  one('ms-hourly').style.setProperty('--ms-hour-count',hours.length);
  const now=hour();
  one('ms-hourly').innerHTML=hours.map(x=>{
   const hr=Number(x.time.slice(0,2)),day=hr>=7&&hr<19;
   return '<div class="ms-hour'+(Math.abs(hr-now)<=1?' now':'')+'" aria-label="'+esc(x.time+', '+Math.round(x.temp)+' graden'+(Number.isFinite(x.prob)?', '+Math.round(x.prob)+' procent kans op regen':''))+'"><time>'+esc(x.time)+'</time><b aria-hidden="true">'+weatherIcon(x.code,day)+'</b><strong>'+Math.round(x.temp)+'°</strong><small>'+ (Number.isFinite(x.prob)?Math.round(x.prob)+'%':'')+'</small></div>';
  }).join('');
 }
 root.querySelector('#ms-refresh').addEventListener('click',()=>{
  const old=root.querySelector('#ms-weather-status');old.textContent='Weer wordt bijgewerkt…';

  window.dispatchEvent(new CustomEvent('memento-start-weather-refresh'));
 });
 window.addEventListener('memento-weather-update',refreshWeather);
 window.addEventListener('storage',e=>{if(e.key===LIFE_KEY&&lock.classList.contains('memento-welcome-mode'))refreshDay();if(e.key===PIN_KEY){if(isLocked())showPin();else showWelcome()}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&lock.classList.contains('memento-welcome-mode')){refreshDay();refreshWeather()}});
 lock.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||!lock.classList.contains('visible'))return;
  const surface=lock.classList.contains('memento-welcome-mode')?root:form;
  const items=[...surface.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')].filter(x=>x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden');
  if(items.length===0)return;
  const first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 });
 window.MementoStart={showWelcome,showPin,leave,refreshDay,refreshWeather,isLocked};
 if(isLocked())showPin();else showWelcome();
})();
