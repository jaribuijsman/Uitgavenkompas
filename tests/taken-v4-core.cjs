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
const renderToday=source=>source.slice(source.indexOf('function renderToday('),source.indexOf('function renderToday(')+source.slice(source.indexOf('function renderToday(')).indexOf('\nfunction '));
// Baseline 11a70931c13ae36ec89628e7a6794fadf5c000cd. No Git history is
// required in a shallow CI checkout to enforce this task's unchanged-day contract.
assert(renderToday(code).length>100);assert.equal(require('node:crypto').createHash('sha256').update(renderToday(code)).digest('hex'),'cd5e439adf08bae46ffa4d51c845676d8adf5243c6925a14dcc66f2e6faf510c');
console.log('PASS Taken v4 metadata validation, invalid imports, reusable copies and unchanged renderToday');
