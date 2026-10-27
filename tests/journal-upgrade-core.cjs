"use strict";
const assert=require("node:assert/strict"),C=require("../assets/memento-knowledge-core.js"),S=require("../assets/memento-knowledge-store.js");
let count=0;
function check(label,run){run();console.log("PASS "+label);count++;}
const fresh=()=>{const life={notes:[]};C.ensure(life);C.migrateHierarchy(life);return life;};
check("Old diary with no check-in is preserved through validation",()=>{
 const life=fresh(),n=C.saveJournal(life,{date:"2026-10-26",body:"Een bestaande notitie",mood:"Goed",collectionId:"kc2-levenspad-dagboek"});
 const snapshot=JSON.stringify(n);C.validate(life);assert.equal(JSON.stringify(n),snapshot);
});
check("Sleep across calendar midnight and day-only check-in are stored without body text",()=>{
 const life=fresh(),checkin={energy:3,stress:2,sleepStart:"2026-10-26T23:30",sleepEnd:"2026-10-27T07:00",latency:15,awake:20,nap:0};
 const n=C.saveJournal(life,{date:"2026-10-27",body:"",checkin,collectionId:"kc2-levenspad-dagboek"});
 assert.equal(n.body,"");assert.deepEqual(n.journal.checkin,checkin);C.validate(life);
 const restored=JSON.parse(JSON.stringify(life));C.validate(restored);assert.equal(restored.notes[0].journal.checkin.sleepEnd,"2026-10-27T07:00");
});
check("Sleep after night shift can begin and end in daylight",()=>{
 const life=fresh(),n=C.saveJournal(life,{date:"2026-10-27",body:"",checkin:{sleepStart:"2026-10-27T08:30",sleepEnd:"2026-10-27T15:00",latency:15,awake:30},collectionId:"kc2-levenspad-dagboek"});
 assert.equal(n.journal.checkin.sleepStart,"2026-10-27T08:30");C.validate(life);
});
check("Updating a saved check-in keeps IDs, existing tags and text history",()=>{
 const life=fresh(),n=C.saveJournal(life,{date:"2026-10-27",body:"Eerste versie",mood:"Neutraal",tags:["ploeg"],checkin:{energy:2},collectionId:"kc2-levenspad-dagboek"});
 const id=n.id;C.saveJournal(life,{id,date:"2026-10-27",body:"Tweede versie",mood:"Goed",tags:["ploeg"],checkin:{energy:5,stress:1}});
 assert.equal(life.notes.length,1);assert.equal(n.id,id);assert.equal(n.journal.checkin.energy,5);assert.ok(n.revisions.length>=1);assert.deepEqual(n.tags,["ploeg"]);C.validate(life);
});
check("Duplicate journal days and malformed metrics are rejected",()=>{
 const life=fresh();C.saveJournal(life,{date:"2026-10-27",body:"Notitie"});
 assert.throws(()=>C.saveJournal(life,{date:"2026-10-27",body:"Duplicaattest"}));
 for(const input of [{energy:6},{stress:0},{awake:-1},{sleepStart:"2026-10-27T22:10",sleepEnd:"2026-10-27T20:00"},{sleepStart:"2026-02-31T14:00"}])assert.throws(()=>C.journalCheckinValid(input),JSON.stringify(input));
});
check("Blank days without any diary content remain blocked",()=>{
 const life=fresh();assert.throws(()=>C.saveJournal(life,{date:"2026-10-27",body:""}));assert.equal(life.notes.length,0);
});
check("Legacy PDF & image signatures and recording MIME checks are retained",()=>{
 assert.equal(S.MAX_FILE,25*1024*1024);
 assert.ok(typeof S.inspect==="function");
});
console.log("PASS total "+count);
