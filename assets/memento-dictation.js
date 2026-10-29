/* Memento - shared speech-to-text for approved free-text fields. */
(function(root){
 "use strict";
 let active=null,serial=0;
 const mic='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';
 const esc=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
 const button=id=>'<button type="button" class="memento-dictate-btn" data-memento-dictate="'+esc(id)+'" aria-label="Start transcriberen" aria-pressed="false">'+mic+'</button><span class="memento-dictate-status" role="status" aria-live="polite"></span>';
 // Chrome Android can return a growing hypothesis as several separate results.
 function merge(parts){
  let text="";
  for(const part of parts){
   const words=String(part||"").trim();
   if(!words)continue;
   if(!text){text=words;continue;}
   const prev=text.toLocaleLowerCase("nl-NL"),next=words.toLocaleLowerCase("nl-NL");
   if(next===prev)continue;
   if(next.startsWith(prev+" ")){text=words;continue;}
   text+=" "+words;
  }
  return text;
 }
 function message(job,txt){
  if(!job)return;
  job.opts.onStatus?.(txt);
  const btn=job.button;
  const status=btn?.nextElementSibling;
  if(status?.classList.contains("memento-dictate-status"))status.textContent=txt||"";
 }
 function paint(job,on){
  if(!job)return;
  if(job.button?.isConnected){
   job.button.classList.toggle("memento-dictating",on);
   job.button.setAttribute("aria-pressed",String(on));
   job.button.setAttribute("aria-label",on?"Stop transcriberen":"Start transcriberen");
   job.button.innerHTML=on?"■":mic;
  }
  job.opts.onState?.(on);
 }
 function value(job,words){
  const before=job.base;
  const join=before&&!/\s$/.test(before)?" ":"";
  const limit=job.field.maxLength>0?job.field.maxLength:20000;
  return (before+join+words).slice(0,limit);
 }
 function commit(job,words){
  if(!words||!job.field.isConnected)return;
  const next=value(job,words);
  if(job.field.value===next&&job.lastCommitted===next)return;
  job.field.value=next;
  if(job.lastCommitted!==next){
   job.lastCommitted=next;
   const event=new Event("input",{bubbles:true});
   event.mementoDictation=true;
   job.field.dispatchEvent(event);
  }
 }
 function stop({discardPreview=false,message:status=""}={}){
  const job=active;if(!job)return;
  if(!discardPreview&&job.preview)commit(job,job.preview);
  active=null;serial++;
  clearTimeout(job.timer);job.timer=0;
  const speech=job.speech;job.speech=null;
  if(speech){
   speech.onresult=null;speech.onerror=null;speech.onend=null;speech.onstart=null;
   try{speech.stop();}catch(e){}
  }
  paint(job,false);
  message(job,status);
 }
 function session(job){
  if(active!==job||!job.field.isConnected||document.visibilityState==="hidden"){stop();return;}
  const Speech=root.SpeechRecognition||root.webkitSpeechRecognition;
  let speech;
  try{speech=new Speech()}catch(e){stop({message:"Spraakherkenning kon niet starten."});return;}
  job.speech=speech;job.base=job.field.value;job.preview="";job.lastCommitted=job.base;
  speech.lang="nl-NL";speech.continuous=false;speech.interimResults=true;speech.maxAlternatives=1;
  speech.onstart=()=>{if(active===job)message(job,"Luisteren…")};
  speech.onresult=e=>{
   if(active!==job||!job.field.isConnected)return;
   const final=[],interim=[];
   for(let i=0;i<e.results.length;i++){
    const item=e.results[i],part=String(item[0]?.transcript||"").trim();
    if(part)(item.isFinal===false?interim:final).push(part);
   }
   const confirmed=merge(final);
   job.preview=merge([confirmed,merge(interim)]);
   if(confirmed)commit(job,confirmed);
   const preview=value(job,job.preview);
   if(job.field.value!==preview)job.field.value=preview;
   if(preview.length >= (job.field.maxLength>0?job.field.maxLength:20000))stop({message:"Maximale tekstlengte bereikt."});
  };
  speech.onerror=e=>{
   if(active!==job)return;
   if(e.error==="no-speech")return;
   const msg={"not-allowed":"Microfoontoegang geweigerd.","service-not-allowed":"Spraakherkenning niet toegestaan.","audio-capture":"Microfoon niet beschikbaar.","network":"Spraakherkenning tijdelijk niet bereikbaar.","language-not-supported":"Nederlands niet beschikbaar.","aborted":"Spraakherkenning onderbroken."};
   stop({message:msg[e.error]||"Spraakherkenning mislukt."});
  };
  speech.onend=()=>{
   if(active!==job)return;
   if(job.preview)commit(job,job.preview);
   job.speech=null;
   if(!job.field.isConnected||document.visibilityState==="hidden"){stop();return;}
   message(job,"Luisteren…");
   job.timer=setTimeout(()=>session(job),350);
  };
  try{speech.start()}catch(e){stop({message:"Spraakherkenning kon niet herstarten."})}
 }
 function start(field,opts={}){
  if(!field||!field.isConnected||!("value" in field))return false;
  if(active?.field===field){stop({message:"Transcriptie gestopt."});return false;}
  if(active)stop();
  if(!(root.SpeechRecognition||root.webkitSpeechRecognition)){opts.onStatus?.("Spraakherkenning niet beschikbaar.");return false;}
  if(!root.isSecureContext){opts.onStatus?.("Open Memento via HTTPS.");return false;}
  const job={field,opts,button:opts.button||null,base:field.value,preview:"",speech:null,timer:0,lastCommitted:field.value,id:++serial};
  active=job;paint(job,true);message(job,"Luisteren…");session(job);return true;
 }
 function isActive(field){return Boolean(active&&(!field||field===active.field));}
 document.addEventListener("click",e=>{
  const b=e.target.closest?.("[data-memento-dictate]");
  if(b){
   e.preventDefault();
   const field=document.getElementById(b.dataset.mementoDictate);
   start(field,{button:b});return;
  }
  // Finish any draft before a form is saved, closed or another action re-renders it.
  if(active&&e.target.closest?.("button, a, summary")&&!e.target.closest?.("#mementoVoiceButton,#kc-quick-mic,[data-kc=journal-speech]"))stop();
 },true);
 document.addEventListener("input",e=>{if(active?.field===e.target&&!e.mementoDictation)stop({discardPreview:true});},true);
 document.addEventListener("focusin",e=>{if(active&&e.target!==active.field&&e.target.matches?.("input,textarea,[contenteditable=true]"))stop();},true);
 document.addEventListener("submit",()=>{if(active)stop();},true);
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")stop()});
 root.MementoDictation={button,start,stop,isActive,merge};
})(window);
