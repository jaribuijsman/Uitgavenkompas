/* Pure task presentation: no DOM, clocks, stored state or writes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoLifePresentation=api;})(globalThis,()=>{
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function timerCard(t){
 if(!t?.id)return '<p class="life-footnote">Sla de taak op om optioneel tijd te meten.</p>';
 return '<details class="memento-task-timer"><summary>Tijd meten (optioneel)</summary><div id="lifeTaskTimer" aria-live="polite"></div></details>';
}
function timerControls(t,clockId){
 const s=t.timing?.session,last=t.timing?.measurements.at(-1);
 const button=(action,text)=>'<button type="button" class="life-btn" data-task-timer="'+action+'">'+text+'</button>';
 if(!s){return (last?'<p>Gemeten: '+Math.round(last.activeSeconds/60*100)/100+' min</p>':'')+button('start',last?'Opnieuw meten':'Start meting');}
 const live=s.status==='running'&&clockId===s.id;
 const review=s.status==='needsReview'||(s.status==='running'&&!live);
 return '<p>'+esc(review?'Controle nodig':live?'Timer loopt':s.status==='paused'?'Gepauzeerd':'Meting gestopt')+' · '+Math.floor(s.activeSeconds/60)+' min '+Math.floor(s.activeSeconds%60)+' sec vastgelegd</p>'+
 (live?button('pause','Pauzeren'):(s.status==='paused'?button('resume','Hervatten'):''))+
 (live||s.status==='paused'?button('stop','Stoppen'):'')+
 (!live&&s.status!=='paused'?'<label class="life-form-field">Actieve minuten controleren<input id="lifeMeasuredMinutes" type="number" min="0" max="1440" step="0.01" value="'+(Math.round(s.activeSeconds/60*100)/100)+'"></label>'+button('confirm','Meting bevestigen'):'')+
 button('discard','Meting verwerpen');
}
function taskSteps(steps){
 return steps.map((s,i)=>'<div class="memento-step-order"><label><input type="checkbox" data-task-step-check="'+i+'"'+(s.done?' checked':'')+'><span>'+esc(s.text)+'</span></label><button type="button" class="life-btn" data-task-step-move="'+i+'" data-direction="-1" aria-label="Stap '+(i+1)+' omhoog"'+(i===0?' disabled':'')+'>↑</button><button type="button" class="life-btn" data-task-step-move="'+i+'" data-direction="1" aria-label="Stap '+(i+1)+' omlaag"'+(i===steps.length-1?' disabled':'')+'>↓</button></div>').join('');
}
return {timerCard,timerControls,taskSteps};
});
