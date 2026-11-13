/* Memento Day Portal: no synthetic user data; existing life store + shared Open-Meteo cache. */
(()=>{'use strict';
 const lock=document.getElementById('pinLock'),forest=lock?.querySelector('.pin-forest-bg'),form=document.getElementById('pinForm');
 if(!lock||!forest||!form)return;
 const PIN_KEY='memento_manual_pin_lock_v1',WEATHER_KEY='compass_weather_beverwijk_v1';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const date=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const hour=()=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',hour:'2-digit',hourCycle:'h23'}).format(new Date()));
 const isLocked=()=>{try{return localStorage.getItem(PIN_KEY)==='1'}catch{return false}};
 const root=document.createElement('section');
 root.id='mementoStart';root.setAttribute('aria-label','Memento dagoverzicht');
 root.innerHTML=`<div class="ms-shell"><div class="ms-content">
<header class="ms-brand"><img class="ms-logo" src="./assets/memento-logo-gold.png" alt="Memento — Reflect · Refine · Conquer" width="260" height="90"><div class="ms-date" id="ms-date">Vandaag</div></header>
<div class="ms-feature">
<div class="ms-weather-slider" id="ms-weather-slider" role="region" aria-label="Weer voor vandaag en komende vijf dagen">
<section class="ms-weather ms-glass" aria-label="Weer in Beverwijk"><span class="ms-overline">Beverwijk · Vandaag</span><div class="ms-topweather"><div class="ms-temperature" id="ms-temp">—°</div><div class="ms-condition" id="ms-condition">Weersverwachting ophalen…</div></div><div class="ms-summary" id="ms-summary">Actuele voorspelling van Open-Meteo</div><div class="ms-hourly" id="ms-hourly" aria-label="Weer per uur"><div class="ms-hour"><time>—:—</time><b>·</b><strong>—°</strong></div></div><div class="ms-source"><span id="ms-weather-status">Weer wordt bijgewerkt</span><span><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a><button type="button" class="ms-refresh" id="ms-refresh" aria-label="Weer verversen">↻</button></span></div></section>
<section class="ms-weather ms-weather-forecast ms-glass" aria-label="Weer komende vijf dagen">
<span class="ms-overline">Beverwijk · Komende 5 dagen</span>
<div class="ms-forecast-heading">Vooruitblik</div>
<div class="ms-forecast-days" id="ms-forecast-days" aria-label="Verwachting per dag"><span class="ms-forecast-empty">Vijfdaagse voorspelling ophalen…</span></div>
<div class="ms-forecast-caption">Dagmaximum · nachtminimum · neerslagkans</div>
<div class="ms-forecast-source"><span id="ms-forecast-status">Open-Meteo · Voorspelling</span></div>
</section>
</div>
<nav class="ms-weather-pages" aria-label="Wissel weerkaart">
<button type="button" data-ms-weather-page="0" aria-label="Weer vandaag tonen" aria-pressed="true"><span aria-hidden="true"></span></button>
<button type="button" data-ms-weather-page="1" aria-label="Weer komende vijf dagen tonen" aria-pressed="false"><span aria-hidden="true"></span></button>
</nav>
</div>
<section class="ms-thought ms-quote ms-glass" aria-label="Quote van de dag"><div id="ms-quote-host"><div class="flow-hero"><div class="flow-eyebrow">Quote van de dag</div><p>Quote laden…</p></div></div></section>
<nav class="ms-quick" aria-label="Snelfuncties"><button class="ms-quickbutton" type="button" data-ms-create="task"><span aria-hidden="true">＋</span>Taak</button><button class="ms-quickbutton" type="button" data-ms-create="note"><span aria-hidden="true">＋</span>Snelle notitie</button><button class="ms-quickbutton" type="button" data-ms-create="transaction"><span aria-hidden="true">＋</span>Transactie</button></nav>
</div></div><div class="ms-footer"><button class="ms-continue" id="ms-continue" type="button">Doorgaan <span aria-hidden="true">→</span></button></div>`;
 lock.insertBefore(root,form);
 const one=id=>document.getElementById(id);
 const weatherSlider=one('ms-weather-slider'),weatherPages=[...root.querySelectorAll('[data-ms-weather-page]')];
 let activeWeatherPage=0,weatherScrollPending=false;
 function setWeatherPage(index,move=false){
  activeWeatherPage=index===1?1:0;
  weatherPages.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===activeWeatherPage)));
  [...weatherSlider.querySelectorAll('.ms-weather')].forEach((panel,i)=>{
   panel.toggleAttribute('inert',i!==activeWeatherPage);
   panel.setAttribute('aria-hidden',String(i!==activeWeatherPage));
  });
  if(move)weatherSlider.scrollTo({left:weatherSlider.clientWidth*activeWeatherPage,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 weatherPages.forEach(button=>button.addEventListener('click',()=>setWeatherPage(Number(button.dataset.msWeatherPage),true)));
 weatherSlider.addEventListener('scroll',()=>{
  if(weatherScrollPending)return;weatherScrollPending=true;
  requestAnimationFrame(()=>{weatherScrollPending=false;setWeatherPage(weatherSlider.scrollLeft>=weatherSlider.clientWidth/2?1:0)});
 },{passive:true});
 window.addEventListener('resize',()=>{weatherSlider.scrollLeft=activeWeatherPage*weatherSlider.clientWidth});
 setWeatherPage(0);

 let quoteTimer;
 function refreshThought(now){
  const host=one('ms-quote-host');
  const year=now.getFullYear(),month=now.getMonth(),day=now.getDate();
  const dateKey=[month+1,day].map(part=>String(part).padStart(2,'0')).join('-');
  const today=year+'-'+dateKey;
  if(host.dataset.date===today)return;
  const hadFocus=host.contains(document.activeElement);
  const q=window.MementoStoicDays?.[dateKey];
  const label=now.toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
  const heading=`<span class="flow-eyebrow">Quote van de dag</span><time class="flow-date" datetime="${today}">${esc(label)}</time>`;
  host.innerHTML=q?.thoughtNl&&q.explanationNl&&q.reflectionNl?`
   <details class="flow-hero ms-quote-disclosure">
    <summary class="ms-quote-summary">
     <span class="flow-hero-top"><span>${heading}</span><img class="flow-avatar" src="./assets/memento-avatar.png" alt="" width="40" height="40"></span>
     <span class="ms-quote-thought">${esc(q.thoughtNl)}</span>
     <span class="ms-quote-meta"><span class="flow-citation">${esc(q.thinker)}</span><span class="ms-quote-chevron" aria-hidden="true"></span></span>
    </summary>
    <div class="ms-quote-detail">
     <h3>De gedachte uitgelegd</h3>
     <p>${esc(q.explanationNl)}</p>
     <div class="flow-citation ms-quote-source">${esc(q.bookAttribution)}<br><cite lang="en">${esc(q.sourceTitle)}</cite></div>
     <h3>Sta vandaag stil bij</h3>
     <p>${esc(q.reflectionNl)}</p>
     ${q.exerciseNl?`<h3>Kleine oefening</h3><p>${esc(q.exerciseNl)}</p>`:''}
    </div>
   </details>`:`<div class="flow-hero ms-quote-unavailable">${heading}<p>Quote tijdelijk niet beschikbaar.</p></div>`;
  host.dataset.date=today;
  if(hadFocus)host.querySelector('summary')?.focus({preventScroll:true});
 }
 function stopQuoteClock(){
  clearTimeout(quoteTimer);
 }
 function syncQuoteClock(){
  stopQuoteClock();
  if(document.hidden||!lock.classList.contains('memento-welcome-mode'))return;
  const now=new Date();
  refreshThought(now);
  const midnight=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  quoteTimer=setTimeout(syncQuoteClock,Math.max(0,midnight-Date.now()));
 }
 function removeLegacyTodayQuote(){
  // An already-open PWA can combine an older HTML document with newer assets.
  // Disable the old Mijn dag renderer and clear any quote it already inserted.
  if(window.CompassFlow&&typeof window.CompassFlow.home==='function')window.CompassFlow.home=()=> '';
  const today=document.querySelector('#lifeApp[data-life-view="today"] #lifeContent');
  const old=today?.querySelector('.flow-home');
  if(old)(old.closest('.mg-fold')||old).remove();
 }
 function setFocusBlocked(blocked){
  for(const el of [document.querySelector('.app'),document.getElementById('lifeApp'),document.getElementById('compassAreaBar')])if(el)el.inert=blocked;
 }
 function showWelcome(){
  if(isLocked())return showPin();
  lock.classList.add('visible','memento-welcome-mode');lock.removeAttribute('aria-labelledby');lock.setAttribute('aria-label','Memento dagoverzicht');
  document.body.classList.add('pin-locked','memento-start-open');
  setFocusBlocked(true);removeLegacyTodayQuote();refreshDay();refreshWeather();syncQuoteClock();illuminate();
 }
 function showPin(){
  stopQuoteClock();
  lock.classList.add('visible');lock.classList.remove('memento-welcome-mode');
  lock.removeAttribute('aria-label');lock.setAttribute('aria-labelledby','pinTitle');
  document.body.classList.remove('memento-start-open');document.body.classList.add('pin-locked');
  setFocusBlocked(true);
 }
 function leave(){
  stopQuoteClock();
  lock.classList.remove('visible','memento-welcome-mode');document.body.classList.remove('memento-start-open','pin-locked');setFocusBlocked(false);removeLegacyTodayQuote();
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
    const field=document.getElementById('kc-capture')||document.getElementById('kc-quick-text')||document.getElementById('kc-body');
    for(let n=field?.parentElement;n;n=n.parentElement)if(n.tagName==='DETAILS')n.open=true;
    field?.focus();field?.scrollIntoView({block:'center'});
   });
  }
 }
 root.querySelectorAll('[data-ms-create]').forEach(button=>button.addEventListener('click',()=>create(button.dataset.msCreate)));
 function illuminate(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  root.classList.remove('ms-illuminate');void root.offsetWidth;root.classList.add('ms-illuminate');
 }
 function refreshDay(){
  one('ms-date').textContent=new Intl.DateTimeFormat('nl-NL',{timeZone:'Europe/Amsterdam',weekday:'long',day:'numeric',month:'long'}).format(new Date());
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
  const forecastHost=one('ms-forecast-days'),forecastStatus=one('ms-forecast-status');
  const nextDays=idx>=0&&Array.isArray(d?.time)?d.time.slice(idx+1,idx+6):[];
  const complete=nextDays.length===5&&nextDays.every((stamp,offset)=>{
   const pos=idx+offset+1;
   return /^\d{4}-\d{2}-\d{2}$/.test(stamp)&&Number.isFinite(d?.weather_code?.[pos])&&
    Number.isFinite(d?.temperature_2m_max?.[pos])&&Number.isFinite(d?.temperature_2m_min?.[pos]);
  });
  if(complete){
   const dayFormat=new Intl.DateTimeFormat('nl-NL',{weekday:'short',day:'numeric',timeZone:'UTC'});
   forecastHost.innerHTML=nextDays.map((stamp,offset)=>{
    const pos=idx+offset+1,code=d.weather_code[pos],high=Math.round(d.temperature_2m_max[pos]),low=Math.round(d.temperature_2m_min[pos]),rain=d.precipitation_probability_max?.[pos];
    const dayLabel=dayFormat.format(new Date(stamp+'T12:00:00Z')).replace('.','');
    const rainLabel=Number.isFinite(rain)?Math.round(rain)+'%':'—%';
    return '<div class="ms-forecast-day" aria-label="'+esc(dayLabel+', '+weatherName(code)+', maximum '+high+' graden, minimum '+low+' graden, maximale neerslagkans '+rainLabel)+'">'+
     '<time datetime="'+esc(stamp)+'">'+esc(dayLabel)+'</time>'+
     '<span class="ms-forecast-icon" aria-hidden="true">'+weatherIcon(code,true)+'</span>'+
     '<strong>'+high+'°</strong><small>'+low+'°</small>'+
     '<span class="ms-forecast-rain"><span aria-hidden="true">💧</span>'+rainLabel+'</span></div>';
   }).join('');
  }else{
   forecastHost.innerHTML='<span class="ms-forecast-empty">Vijfdaagse voorspelling niet beschikbaar. Vernieuw het weer.</span>';
  }
  forecastStatus.textContent=busy?'Open-Meteo · Bijwerken…':failed||!fresh?'Open-Meteo · Opgeslagen of verouderde voorspelling':'Open-Meteo · Actuele voorspelling';
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
 window.addEventListener('storage',e=>{if(e.key===PIN_KEY){if(isLocked())showPin();else showWelcome()}});
 document.addEventListener('visibilitychange',()=>{
  syncQuoteClock();
  if(!document.hidden&&lock.classList.contains('memento-welcome-mode')){refreshDay();refreshWeather()}
 });
 window.addEventListener('pageshow',syncQuoteClock);
 window.addEventListener('focus',syncQuoteClock);
 lock.addEventListener('keydown',e=>{
  if(e.key!=='Tab'||!lock.classList.contains('visible'))return;
  const surface=lock.classList.contains('memento-welcome-mode')?root:form;
  const items=[...surface.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href],summary')].filter(x=>x.getClientRects().length&&getComputedStyle(x).visibility!=='hidden');
  if(items.length===0)return;
  const first=items[0],last=items.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 });
 window.MementoStart={showWelcome,showPin,leave,refreshDay,refreshWeather,isLocked};
 if(isLocked())showPin();else showWelcome();
})();
