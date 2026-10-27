/* Memento PIN scenery v4: six pixel-art forests, hourly Amsterdam rotation, existing Beverwijk weather effects. */
(()=>{'use strict';
const lock=document.getElementById('pinLock'),bg=lock?.querySelector('.pin-forest-bg'),canvas=document.getElementById('mementoWeatherCanvas'),status=document.getElementById('mementoSceneStatus'),pauseButton=document.getElementById('mementoSceneToggle');
if(!lock||!bg||!canvas||!status||!pauseButton)return;
const ctx=canvas.getContext('2d');if(!ctx)return;
const artworks=window.MementoForestArt||{};
const scenes=Object.fromEntries(Object.entries(artworks.scenes||{}).map(([id,info])=>[id,info.name]));
const artwork=id=>artworks.asset?.(id)||'./assets/memento-cozy-background.png';
const label={sun:'Zonnig',rain:'Regen',storm:'Onweer',snow:'Sneeuw',fog:'Mist',clouds:'Bewolkt'};
const WEATHER_KEY='compass_weather_beverwijk_v1',PREF_KEY='memento_forest_choice_v1';
let theme='auto';try{const stored=localStorage.getItem(PREF_KEY);if(stored==='auto'||Object.hasOwn(scenes,stored))theme=stored}catch{}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const layers=[document.createElement('div'),document.createElement('div')];let front=0,imageVersion=0;
for(const el of layers){el.className='mf-image';bg.prepend(el)}
const add=(className)=>{const el=document.createElement('div');el.className=className;bg.insertBefore(el,canvas);return el};
const rays=add('mf-rays'),clouds=add('mf-clouds'),tint=add('mf-tint'),fog1=add('mf-fog'),fog2=add('mf-fog mf-fog-two'),flash=add('mf-flash');
const decoration=add('mf-christmas');decoration.setAttribute('aria-hidden','true');
const garland=document.createElement('div');garland.className='mf-garland';decoration.append(garland);
const strand=document.createElement('div');strand.className='mf-string';decoration.append(strand);
for(let i=0;i<17;i++){const bulb=document.createElement('span');bulb.className='mf-bulb';bulb.style.setProperty('--n',String(i%5*3));bulb.style.setProperty('--light',i%3===0?'#f4bd72':i%3===1?'#d3e6a4':'#f7e1a4');bulb.style.setProperty('--light-glow',i%3===0?'#f0b06461':i%3===1?'#bfdb9166':'#fbe0a16b');strand.append(bulb)}
const greeting=document.createElement('div');greeting.className='mf-holiday-caption';greeting.textContent='FIJNE FEESTDAGEN';decoration.append(greeting);
const controls=document.createElement('div');controls.className='mf-control-row';
const choiceButton=document.createElement('button');choiceButton.type='button';choiceButton.textContent='Kies bos';choiceButton.setAttribute('aria-haspopup','dialog');
pauseButton.replaceWith(controls);controls.append(pauseButton,choiceButton);
const picker=document.createElement('dialog');picker.id='mfPicker';picker.setAttribute('aria-label','Kies een bosachtergrond');
const h=document.createElement('h2');h.textContent='Jouw Memento-bos';
const p=document.createElement('p');p.textContent='Automatisch wisselt ieder uur tussen passende pixelbossen. Het weer in Beverwijk blijft erboven bewegen. Je kunt ook een bos vastzetten.';
const choices=document.createElement('div');choices.className='mf-choices';
const close=document.createElement('button');close.className='mf-close';close.type='button';close.textContent='Sluiten';
picker.append(h,p,choices,close);document.body.append(picker);
for(const [id,name] of [['auto','Automatisch · ieder uur'],...Object.entries(scenes)]){const button=document.createElement('button');button.type='button';button.className='mf-choice';button.dataset.scene=id;button.setAttribute('aria-pressed',String(id===theme));const img=new Image();img.src=artwork(id==='auto'?(artworks.sceneForHour?.(new Date())||'ochtendmist'):id);img.alt='';img.loading='lazy';const caption=document.createElement('span');caption.textContent=name;button.append(img,caption);choices.append(button);button.addEventListener('click',()=>{theme=id;try{localStorage.setItem(PREF_KEY,theme)}catch{}updateScene();picker.close();choiceButton.focus()})}
choiceButton.addEventListener('click',()=>{if(!picker.open)picker.showModal()});close.addEventListener('click',()=>picker.close());picker.addEventListener('click',e=>{if(e.target===picker)picker.close()});
let weather=null,paused=false,kind='sun',night=false,wind=0,lastWeatherText='',w=0,height=0,particles=[],raf=0,lastFrame=0,nextLightning=0,alive=true;
function dateAmsterdam(){return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',month:'numeric'}).format(new Date())}
function holiday(){lock.dataset.mfChristmas=String(dateAmsterdam()==='12')}
function localNow(){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());const a=Object.fromEntries(parts.map(p=>[p.type,p.value]));return Date.UTC(+a.year,+a.month-1,+a.day,+a.hour,+a.minute)}
function age(time){const a=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(time||'');return a?localNow()-Date.UTC(+a[1],+a[2]-1,+a[3],+a[4],+a[5]):Infinity}
function currentValid(entry){const c=entry?.data?.current,elapsed=Date.now()-entry?.fetchedAt,lag=age(c?.time);return c&&Number.isFinite(c.weather_code)&&[0,1].includes(c.is_day)&&Number.isFinite(entry.fetchedAt)&&elapsed>=-300000&&elapsed<=90*60000&&lag>=-20*60000&&lag<=90*60000}
function weatherKind(code){if(code===0||code===1||code===2)return 'sun';if(code===3)return 'clouds';if([45,48].includes(code))return 'fog';if([71,73,75,77,85,86].includes(code))return 'snow';if([95,96,97,99].includes(code))return 'storm';if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return 'rain';return 'clouds'}
function weatherFromStorage(){try{return JSON.parse(localStorage.getItem(WEATHER_KEY))}catch{return null}}
function applyWeather(){let entry=weather?.cached||weatherFromStorage();const fresh=currentValid(entry),current=entry?.data?.current;
const previousKind=kind;kind=fresh?weatherKind(current.weather_code):'sun';night=fresh?current.is_day===0:false;wind=fresh&&Number.isFinite(current.wind_speed_10m)?Math.min(80,Math.max(0,current.wind_speed_10m)):0;
lastWeatherText=fresh?`Beverwijk · ${label[kind]} · ${current.time.slice(11,16)}${weather?.failed?' · Opgeslagen weer':''}`:'Beverwijk · Weer niet beschikbaar · Rustige achtergrond';
status.textContent=lastWeatherText;status.title=fresh?'Weer van Open-Meteo · '+current.time:'Geen betrouwbare actuele weersgegevens beschikbaar';
if(previousKind!==kind)seed();updateScene();holiday();}
function selectedScene(){return theme==='auto'?(artworks.sceneForHour?.(new Date())||'ochtendmist'):theme}
function imagePath(){return artwork(selectedScene())}
function updateScene(){lock.dataset.mfKind=kind;lock.dataset.mfNight=String(night);lock.dataset.mfScene=selectedScene();for(const b of choices.querySelectorAll('button')){b.setAttribute('aria-pressed',String(b.dataset.scene===theme));if(b.dataset.scene==='auto'){const preview=b.querySelector('img');if(preview)preview.src=artwork(selectedScene())}}
const url=imagePath();if(layers[front].dataset.src===url){sync();return}
const token=++imageVersion,loader=new Image();loader.onload=()=>{if(token!==imageVersion)return;const back=1-front;layers[back].style.backgroundImage=`url("${url}")`;layers[back].dataset.src=url;layers[back].classList.add('mf-active');layers[front].classList.remove('mf-active');front=back};loader.onerror=()=>{if(token===imageVersion&&layers[front].dataset.src!==url)status.textContent=lastWeatherText+' · Afbeelding niet geladen'};loader.src=url;sync()}
function seed(){const n=kind==='storm'?145:kind==='rain'?118:kind==='snow'?74:kind==='sun'?24:0;particles=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*height,z:.35+Math.random()*.95,t:Math.random()*6.28}));ctx.clearRect(0,0,w,height)}
function resize(){const rect=lock.getBoundingClientRect();w=rect.width||innerWidth;height=rect.height||innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=w+'px';canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);seed();sync()}
function running(){return !paused&&!reduced.matches&&!document.hidden&&lock.classList.contains('visible')}
function paint(now){raf=0;if(!running())return;const dt=Math.min(.065,(now-lastFrame||33)/1000);lastFrame=now;ctx.clearRect(0,0,w,height);
for(const pt of particles){if(kind==='rain'||kind==='storm'){const s=(kind==='storm'?800:535)*pt.z;pt.y+=dt*s;pt.x-=dt*(80+wind*2.2)*pt.z;ctx.beginPath();ctx.strokeStyle=`rgba(227,240,255,${Math.min(.8,(kind==='storm'?.55:.4)*pt.z)})`;ctx.lineWidth=.6+.8*pt.z;ctx.moveTo(pt.x,pt.y);ctx.lineTo(pt.x-4*pt.z,pt.y+13*pt.z);ctx.stroke()}
else if(kind==='snow'){pt.y+=dt*(20+35*pt.z);pt.x+=dt*(wind*.35+12*Math.sin(now/1100+pt.t));ctx.beginPath();ctx.fillStyle=`rgba(249,252,255,${.5+.4*pt.z})`;ctx.arc(pt.x,pt.y,.8+2*pt.z,0,Math.PI*2);ctx.fill()}
else if(kind==='sun'){pt.y-=dt*(4+10*pt.z);pt.x+=dt*(3+5*Math.sin(now/1500+pt.t));ctx.beginPath();ctx.fillStyle=`rgba(255,225,154,${.21+.18*Math.sin(now/650+pt.t)**2})`;ctx.shadowColor='#f9da94';ctx.shadowBlur=7;ctx.arc(pt.x,pt.y,.8+1.4*pt.z,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
if(pt.y>height+22){pt.y=-20;pt.x=Math.random()*w}if(pt.y< -22){pt.y=height+10;pt.x=Math.random()*w}if(pt.x< -24)pt.x=w+15;if(pt.x>w+24)pt.x=-15}
if(kind==='storm'&&now>nextLightning){flash.classList.remove('mf-flashing');void flash.offsetWidth;flash.classList.add('mf-flashing');nextLightning=now+3700+Math.random()*6500}
raf=requestAnimationFrame(paint)}
function sync(){const active=running();pauseButton.disabled=reduced.matches;pauseButton.textContent=reduced.matches?'Beweging uit':paused?'Animatie aan':'Animatie pauzeren';pauseButton.setAttribute('aria-pressed',String(paused||reduced.matches));lock.dataset.sceneRunning=String(active);if(!active&&raf){cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,w,height)}if(active&&!raf){lastFrame=0;nextLightning=performance.now()+900;raf=requestAnimationFrame(paint)}}
pauseButton.addEventListener('click',()=>{paused=!paused;sync()});
window.addEventListener('memento-weather-update',e=>{weather=e.detail;applyWeather()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){applyWeather();holiday()}sync()});
window.addEventListener('resize',resize);reduced.addEventListener('change',sync);new MutationObserver(sync).observe(lock,{attributes:true,attributeFilter:['class']});
resize();holiday();applyWeather();setInterval(()=>{applyWeather();holiday()},60000);
})();
