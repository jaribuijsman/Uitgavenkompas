"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const base=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(base,"assets/memento-dictation.js"),"utf8");
// Retain the original target coverage across HTML and its extracted executable entrypoints.
const main=["index.html","assets/memento-finance-app.js","assets/memento-life-app.js"].map(file=>fs.readFileSync(path.join(base,file),"utf8")).join("\n");
const knowledge=fs.readFileSync(path.join(base,"assets/memento-knowledge.js"),"utf8");
const fitness=fs.readFileSync(path.join(base,"assets/memento-fitness.js"),"utf8");
const check=(s,key)=>assert(s.includes(key),"Missing dictation target "+key);
for(const id of ["lifeTaskTitle","lifeTaskNotes","mementoEventTitle","mementoEventNotes","lifeWishTitle","lifeWishNotes","lifeProductNotes","smartBuyPreferences","smartBuyExclude","moneyCoachQuestion"])check(main,id);
for(const id of ["ft-session-note","data-session-note"])check(fitness,id);
for(const id of ["quickToggleSpeech","toggleDiaryDictation","root.MementoDictation?.button?.(\"kc-body\")"])check(knowledge,id);
assert(!main.includes('data-memento-dictate="txNote"'),"Transaction notes are out of scope");
assert(!fitness.includes('data-memento-dictate="ft-note"'),"Other Fitness notes are out of scope");
const handlers={},created=[],tasks=[],edits=[];
const field=(value,maxLength=20000)=>({value,maxLength,isConnected:true,dispatchEvent(e){edits.push({value:this.value,dictation:e.mementoDictation});handlers.input?.(e)}});
const first=field("Mijn tekst"),second=field("Ander veld");
const ctrl=()=>({isConnected:true,classList:{toggle(){}},setAttribute(){},set innerHTML(x){this.html=x},nextElementSibling:null});
const window={
 isSecureContext:true,
 SpeechRecognition:class{
  constructor(){created.push(this);}
  start(){this.onstart?.();}
  stop(){this.stopped=true;}
 },
};
const document={visibilityState:"visible",addEventListener(name,handler){handlers[name]=handler}};
const fakeTimeout=fn=>{tasks.push(fn);return tasks.length};
function FakeEvent(type,opts){this.type=type;this.bubbles=opts.bubbles;this.target=first}
vm.runInNewContext(source,{window,document,Event:FakeEvent,setTimeout:fakeTimeout,clearTimeout(){}});
const api=window.MementoDictation;
const emit=(n,parts,final=true)=>created[n].onresult?.({results:parts.map(t=>({0:{transcript:t},isFinal:final}))});
assert(api.start(first,{button:ctrl()}));
assert.equal(created[0].continuous,false);
emit(0,["mag","mag je","mag je wel","mag je wel goed"],false);
assert.equal(first.value,"Mijn tekst mag je wel goed");
assert.equal(edits.length,0,"Interim remains visual until confirmed");
emit(0,["mag","mag je","mag je wel","mag je wel goed"]);
assert.equal(first.value,"Mijn tekst mag je wel goed");
assert.equal(edits.length,1);
created[0].onend();assert.equal(tasks.length,1);
tasks.shift()();emit(1,["en later","en later meer"]);
assert.equal(first.value,"Mijn tekst mag je wel goed en later meer");
api.stop();assert(!api.isActive());assert.equal(edits.at(-1).value,first.value);
assert(api.start(first,{button:ctrl()}));emit(2,["niet","niet behouden"],false);
first.value="Mijn handmatige correctie";const e={target:first};handlers.input(e);
assert.equal(first.value,"Mijn handmatige correctie");
assert(!api.isActive(),"Manual editing cancels without restoring interim");
assert(api.start(first,{button:ctrl()}));
assert(api.start(second,{button:ctrl()}),"Switching fields stops previous");
emit(4,["andere tekst"]);
assert.equal(first.value,"Mijn handmatige correctie");
assert.equal(second.value,"Ander veld andere tekst");
api.stop();
console.log("PASS shared dictation: progressive hypotheses, interim, pause restart, manual edit, stop, field isolation and approved targets");
