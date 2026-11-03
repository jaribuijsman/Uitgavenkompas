'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync(require('node:path').join(__dirname,'..','assets/memento-life-app.js'),'utf8');
const start=code.indexOf('// Optional task metadata'),end=code.indexOf('function validate(s){',start);
const sandbox={window:{addEventListener(){}},document:{addEventListener(){}},dialog:{addEventListener(){}},clone:x=>JSON.parse(JSON.stringify(x))};
vm.createContext(sandbox);vm.runInContext(code.slice(start,end)+';globalThis.api={validateTaskPlanning,reusablePlanning,timerCheckpoint};',sandbox);
const {validateTaskPlanning:validate,reusablePlanning}=sandbox.api;
vm.runInContext('const uid=()=>"template-copy";'+code.slice(code.indexOf('function templateOf('),code.indexOf('\nfunction storeTemplate('))+';globalThis.templateOf=templateOf;',sandbox);
const task={id:'original',title:'Existing',unknown:{retained:true}};
validate(task);assert.equal(task.planning,undefined);
for(const estimateMinutes of [null,1,12,1440])validate({...task,planning:{schemaVersion:1,estimateMinutes}});
for(const estimateMinutes of [0,-1,1441,1.1,'12',NaN])assert.throws(()=>validate({...task,planning:{schemaVersion:1,estimateMinutes}}));
for(const planning of [[],null,{}, {schemaVersion:2,estimateMinutes:12}])assert.throws(()=>validate({...task,planning}));
const measured={...task,planning:{schemaVersion:1,estimateMinutes:12},timing:{schemaVersion:1,occurrenceId:'next',measurements:[{id:'one',taskId:'original',occurrenceId:'previous',source:'timer',activeSeconds:720,confirmedAt:'2026-11-01T12:00:00.000Z',needsReview:false}],session:{id:'two',occurrenceId:'next',status:'needsReview',activeSeconds:30}}};
validate(measured);assert.throws(()=>validate(measured,true));
for(const delta of [{taskId:'wrong'},{activeSeconds:-1},{activeSeconds:86401},{needsReview:true},{confirmedAt:'bad'},{occurrenceId:''},{source:'estimate'}]){const copy=structuredClone(measured);Object.assign(copy.timing.measurements[0],delta);assert.throws(()=>validate(copy))}
for(const delta of [{id:'one'},{status:'confirmed'},{occurrenceId:'wrong'},{activeSeconds:Infinity}]){const copy=structuredClone(measured);Object.assign(copy.timing.session,delta);assert.throws(()=>validate(copy))}
const duplicate=structuredClone(measured);duplicate.timing.measurements.push({...duplicate.timing.measurements[0]});assert.throws(()=>validate(duplicate));
const reusable=reusablePlanning(measured);assert.equal(reusable.timing,undefined);assert.equal(reusable.planning.estimateMinutes,12);reusable.planning.estimateMinutes=5;assert.equal(measured.planning.estimateMinutes,12);
const template=sandbox.templateOf({...measured,steps:[{text:'Stap',done:true}],history:[{date:'2026-10-28'}]});assert.equal(template.timing,undefined);assert.equal(template.history,undefined);assert.equal(template.planning.estimateMinutes,12);assert.equal(template.steps[0].done,false);
// Suspension or a clock jump preserves the last trusted foreground interval,
// and never counts the uncertain gap as active time.
sandbox.state={tasks:[structuredClone(measured)]};sandbox.state.tasks[0].timing.session.status='running';
sandbox.save=()=>true;sandbox.$=()=>null;sandbox.status=()=>{};sandbox.performance={now:()=>100000};
vm.runInContext('taskClock={id:"two",base:720,started:0,wall:Date.now()-100000};',sandbox);
assert.equal(sandbox.api.timerCheckpoint('paused'),true);assert.equal(sandbox.state.tasks[0].timing.session.status,'needsReview');assert.equal(sandbox.state.tasks[0].timing.session.activeSeconds,720);
const beforeFailure=JSON.stringify(sandbox.state);sandbox.save=()=>false;assert.equal(sandbox.api.timerCheckpoint('stopped'),false);assert.equal(JSON.stringify(sandbox.state),beforeFailure);
// Task/day presentation remains scoped: no duration or timer is added to Mijn dag.
const renderToday=source=>{const start=source.indexOf('function renderToday('),end=source.indexOf('\nconst shoppingListOf=',start);assert(start>=0&&end>start,'Day and grocery boundaries must exist');return source.slice(start,end);};
// Exact unchanged day renderer from main 6f20b2621b92502cead53b77f85a8bfb6b8b4766.
// End before grocery declarations: the old boundary accidentally hashed them too.
assert(renderToday(code).length>100);assert.equal(require('node:crypto').createHash('sha256').update(renderToday(code)).digest('hex'),'b3b994651d121e1844b48540aea541ff37e510f9a6d44b903befd2b6d14e3c7b');
console.log('PASS Taken v4 metadata validation, invalid imports, reusable copies and unchanged renderToday');

// The same presentation interface used by the live editor works without a DOM or storage.
const presentation=require('../assets/memento-life-presentation.js');
assert.match(presentation.timerCard(null),/Sla de taak op/);
assert.match(presentation.timerCard({id:'existing'}),/id="lifeTaskTimer"/);
const steps=Object.freeze([Object.freeze({text:'<img src=x onerror=alert(1)>',done:true,custom:'preserved'}),Object.freeze({text:'<img src=x onerror=alert(1)>',done:false})]);
const stepsBefore=JSON.stringify(steps),markup=presentation.taskSteps(steps);
assert(!markup.includes('<img'));assert(markup.includes('&lt;img'));
assert.equal((markup.match(/data-task-step-check=/g)||[]).length,2);assert.equal((markup.match(/ checked/g)||[]).length,1);
assert(markup.includes('data-task-step-move="0" data-direction="-1" aria-label="Stap 1 omhoog" disabled'));
assert(markup.includes('data-task-step-move="1" data-direction="1" aria-label="Stap 2 omlaag" disabled'));
assert.equal(JSON.stringify(steps),stepsBefore);
for(const status of ['running','paused','stopped','needsReview']){
 const task=Object.freeze({id:'existing',timing:Object.freeze({measurements:Object.freeze([Object.freeze({activeSeconds:120})]),session:Object.freeze({id:'clock',status,activeSeconds:91.5})})});
 const before=JSON.stringify(task),html=presentation.timerControls(task,'clock');
 assert(html.includes('data-task-timer="discard"'));
 assert.equal(html.includes('data-task-timer="pause"'),status==='running');
 assert.equal(html.includes('data-task-timer="resume"'),status==='paused');
 assert.equal(html.includes('id="lifeMeasuredMinutes"'),['stopped','needsReview'].includes(status));
 if(status==='running')assert(presentation.timerControls(task,'other-clock').includes('Controle nodig'));
 assert.equal(JSON.stringify(task),before);
}
console.log('PASS pure Life presentation: escaped duplicate steps, boundary actions, timer lifecycle states and immutable inputs');
