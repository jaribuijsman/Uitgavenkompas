/* Memento Life Assistant — explicit export, audited batch import and undo. */
(()=>{"use strict";
const Core=window.MementoAssistantCore;
if(!Core)return;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PROMPT=[
"Analyseer deze Memento-export zorgvuldig. Maak een JSON-bestand als antwoord, zonder markdown:",
'{"format":"memento-life-assistant-proposal","version":1,"changes":[{"type":"task","id":"EXACT_ID","expected":{"category":"HUIDIGE_CATEGORIE","kind":"task","repeat":"none"},"set":{"category":"Huishouden","kind":"routine","repeat":"weekly"},"reason":"Korte onderbouwing"}]}',
"Gebruik uitsluitend bestaande id's, en uitsluitend velden uit de export. Vul bij ieder gewijzigd veld expected in met exact de huidige waarde. Maak alleen inhoudelijk goed onderbouwde voorstellen, geen fictieve taken.",
"Taakvelden: category (Huishouden, Huis & klussen, Administratie, Persoonlijk, Samen, Gezondheid, Werk), room (Keuken, Badkamer & toilet, Slaapkamer, Wasruimte, Hele huis), kind (task of routine), repeat (none, daily, weekly, monthly, quarterly, yearly, custom), repeatDays (1-3650), priority (boolean). Zet bij herhaling ook kind op routine.",
"Notities: type note, set uitsluitend collectionId op een bestaande verzameling-id uit de export, expected collectionId op huidige waarde. Bijlagen en dagboeken niet bewerken.",
"Boodschappen: type grocery, uitsluitend category; aankoopwensen alleen adviseren in je toelichting, nog niet automatisch bewerken.",
"Geen verwijderingen, samenvoegingen, nieuwe records of wijzigingen in data/afrondingsstatus. Bij twijfel overslaan. Vermeld reden per wijziging. Lever een te downloaden JSON-voorstel zodat ik dat in Memento kan importeren."
].join("\n\n");
let proposal=null, chosen=new Set();
function download(name,content){const url=URL.createObjectURL(new Blob([content],{type:"application/json;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function feedback(box,msg,error=false){box.textContent=msg;box.dataset.error=String(error);box.setAttribute("role",error?"alert":"status");}
function labelValue(v){return typeof v==="string"?v:JSON.stringify(v);}
function mount(host,bridge){
 if(!host||!bridge)return;
 const section=document.createElement("section");section.id="mementoAssistant";section.className="life-panel ma-panel";
 section.innerHTML='<h2>Memento-assistent</h2><p>Organiseer je Leven-gegevens in één keer, zonder opnieuw invoeren. Alleen een expliciete export deelt gegevens; Memento verstuurt niets automatisch naar ChatGPT.</p>'+
 '<div class="ma-prefs" role="group" aria-label="Gegevens voor analyse"><label><input type="checkbox" data-ma-part="tasks" checked> Taken en routines</label><label><input type="checkbox" data-ma-part="notes" checked> Gewone notities en verzamelingen</label><label><input type="checkbox" data-ma-part="groceries"> Boodschappen en huishoudartikelen</label><label><input type="checkbox" data-ma-part="wishes"> Aankoopwensen (alleen advies)</label></div>'+
 '<p class="ma-hint">Uitgesloten: dagboeken, notities met bijlagen, losse bijlagen, financiën en prullenbak. De export bevat wel inhoud van geselecteerde gewone notities.</p>'+
 '<label class="ma-consent"><input type="checkbox" id="ma-consent"> Ik heb gecontroleerd dat de geselecteerde gegevens met ChatGPT gedeeld mogen worden.</label>'+
 '<div class="ma-actions"><button type="button" class="life-btn" data-ma="export">Download analysebestand</button><button type="button" class="life-btn" data-ma="prompt">Kopieer analyse-instructie</button></div>'+
 '<p class="ma-hint">Upload het gedownloade JSON-bestand in ChatGPT samen met de analyse-instructie. Download daarna het door ChatGPT gemaakte voorstel en kies dat hieronder. Dit is geen live koppeling.</p>'+
 '<label class="ma-import">Voorstelbestand kiezen (.json)<input type="file" id="ma-file" accept=".json,application/json"></label><div id="ma-review" class="ma-review" aria-live="polite"></div>'+
 '<button type="button" class="life-btn" id="ma-undo" hidden>Laatste bulkbewerking herstellen</button><p id="ma-status" class="ma-status" role="status"></p>';
 host.prepend(section);
 const $=s=>section.querySelector(s),notice=$("#ma-status"),review=$("#ma-review");
 const undoInfo=()=>{const u=bridge.undoInfo();$("#ma-undo").hidden=!u;$("#ma-undo").textContent=u?"Laatste bulkbewerking herstellen ("+u.changes.length+" items)":"Laatste bulkbewerking herstellen";};
 function renderReview(){
  review.replaceChildren();
  if(!proposal)return;
  let info;
  try{info=Core.prepare(bridge.read(),proposal)}catch(err){feedback(notice,err.message,true);return;}
  chosen=new Set(info.changes.map(c=>c.key));
  const head=document.createElement("p");head.className="ma-hint";head.textContent=info.total+" bruikbare voorstellen. Controleer hieronder, vink uitzonderingen uit en verwerk de rest in één keer.";review.append(head);
  if(!info.total){feedback(notice,"Dit bestand bevat geen veranderingen voor de huidige gegevens.");return;}
  const list=document.createElement("div");list.className="ma-review-list";
  for(const change of info.changes){
   const label=document.createElement("label");label.className="ma-change";
   const check=document.createElement("input");check.type="checkbox";check.checked=true;check.setAttribute("aria-label","Overnemen: "+change.label);
   check.addEventListener("change",()=>{if(check.checked)chosen.add(change.key);else chosen.delete(change.key);applyButton.disabled=!chosen.size;applyButton.textContent="Geselecteerde wijzigingen verwerken ("+chosen.size+")";});
   const detail=document.createElement("span");const title=document.createElement("strong");title.textContent=change.label+" · "+({task:"Taak",note:"Notitie",grocery:"Boodschap",wish:"Wens"}[change.type]||"");
   const fields=document.createElement("small");fields.textContent=Object.keys(change.after).map(k=>k+": "+labelValue(change.before[k])+" → "+labelValue(change.after[k])).join(" · ");
   const reason=document.createElement("small");reason.textContent=change.reason;
   detail.append(title,fields,reason);label.append(check,detail);list.append(label);
  }
  review.append(list);
  const applyButton=document.createElement("button");applyButton.type="button";applyButton.className="life-btn life-btn-primary ma-apply";applyButton.textContent="Geselecteerde wijzigingen verwerken ("+chosen.size+")";
  applyButton.addEventListener("click",()=>{
   if(!chosen.size)return;
   if(!confirm(chosen.size+" geselecteerde wijzigingen toepassen? Gegevens blijven bestaan. Je kunt deze bulkbewerking herstellen."))return;
   try{
    const n=bridge.apply(proposal,[...chosen]);
    proposal=null;chosen.clear();
    const current=document.querySelector("#mementoAssistant");
    if(current)window.MementoAssistant.mount(current.parentElement,bridge);
    feedback(document.querySelector("#ma-status"),n+" wijzigingen verwerkt. Je kunt alle items later afzonderlijk aanpassen.");
   }catch(e){feedback(notice,e.message,true);}
  });
  review.append(applyButton);
 }
 $("[data-ma='export']").addEventListener("click",()=>{
  try{
   if(!$("#ma-consent").checked)throw Error("Bevestig eerst dat je de geselecteerde inhoud wilt delen.");
   const parts={};for(const box of section.querySelectorAll("[data-ma-part]"))parts[box.dataset.maPart]=box.checked;
   if(!Object.values(parts).some(Boolean))throw Error("Selecteer minstens één onderdeel.");
   const data=Core.snapshot(bridge.read(),parts);
   download("memento-leven-analyse-"+new Date().toISOString().slice(0,10)+".json",JSON.stringify(data,null,2));
   feedback(notice,"Analysebestand gedownload. Controleer de inhoud voordat je deze in ChatGPT uploadt.");
  }catch(e){feedback(notice,e.message,true);}
 });
 $("[data-ma='prompt']").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(PROMPT);feedback(notice,"Analyse-instructie gekopieerd. Plak die bij het bestand in ChatGPT.");}
  catch{feedback(notice,"Kopiëren is niet toegestaan. Gebruik een beveiligde browseromgeving.",true);}
 });
 $("#ma-file").addEventListener("change",async e=>{
  try{
   const file=e.target.files?.[0];if(!file)return;
   if(file.size>2000000||!file.size)throw Error("Kies een JSON-voorstel van maximaal 2 MB.");
   const data=JSON.parse(await file.text());
   proposal=data;feedback(notice,"Voorstel ingelezen; nog niets gewijzigd.");renderReview();
  }catch(err){proposal=null;review.replaceChildren();feedback(notice,"Voorstel geweigerd: "+err.message,true);}
 });
 $("#ma-undo").addEventListener("click",()=>{
  const u=bridge.undoInfo();if(!u)return;
  if(!confirm("De laatste bulkbewerking terugdraaien? Alleen de aangepaste velden worden hersteld; andere wijzigingen blijven behouden."))return;
  try{
   const n=bridge.undo();
   proposal=null;
   const current=document.querySelector("#mementoAssistant");
   if(current)window.MementoAssistant.mount(current.parentElement,bridge);
   feedback(document.querySelector("#ma-status"),n+" wijzigingen hersteld.");
  }catch(e){feedback(notice,e.message,true);}
 });
 undoInfo();
}
window.MementoAssistant=Object.freeze({mount});
})();