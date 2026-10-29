"use strict";
const assert=require("node:assert/strict");
const C=require("../assets/memento-knowledge-core.js");
const fresh=()=>{const life={notes:[]};C.ensure(life);C.migrateHierarchy(life);return life;};
const date="2026-10-29",collectionId="kc2-levenspad-dagboek";
const care={version:1,completed:true,completedAt:"2026-10-29T08:00:00.000Z",checks:{face:true,beard:false,appearance:true},note:"Een goede start"};
const health={version:1,source:"samsung-health",measuredDate:date,importedAt:"2026-10-29T08:05:00.000Z",steps:7234,sleepMinutes:408,restingHeartRateBpm:59,exerciseMinutes:35};
const life=fresh();
const legacy=C.saveJournal(life,{date:"2026-10-28",collectionId,body:"Oud dagboek",mood:"Goed",checkin:{energy:3}});
const beforeLegacy=JSON.stringify(legacy);
const record=C.saveJournal(life,{date,collectionId,body:"",selfCare:care});
assert.equal(record.journal.selfCare.completed,true);
assert.equal(record.body,"");
assert(C.journalHasContent("",record.journal));
C.validate(life);
const id=record.id;
C.saveJournal(life,{id,date,body:"Vandaag bewust verzorgd",mood:"Neutraal",checkin:{stress:2},collectionId});
assert.equal(record.id,id);
assert.deepEqual(record.journal.selfCare,care);
assert(record.revisions.length>=1);
C.saveJournal(life,{id,date,body:"Vandaag bewust verzorgd",mood:"Neutraal",checkin:{stress:2},health,collectionId});
assert.deepEqual(record.journal.health,health);
assert.deepEqual(record.journal.selfCare,care);
assert.equal(record.journal.checkin.stress,2);
assert.equal(JSON.stringify(legacy),beforeLegacy);
const backup=JSON.parse(JSON.stringify(life));
C.validate(backup);
assert.deepEqual(C.findJournal(backup,date).journal.health,health);
assert.deepEqual(C.findJournal(backup,date).journal.selfCare,care);
assert.equal(backup.notes.length,2);
assert.throws(()=>C.saveJournal(life,{date,collectionId,body:"Dubbel"}));
for(const bad of [
 {...care,completedAt:undefined},
 {...care,checks:{face:"true"}},
 {...care,note:"a".repeat(501)},
 {...care,completed:false},
 {...care,checks:{extra:true}}
 ])assert.throws(()=>C.journalSelfCareValid(bad));
for(const bad of [
 {...health,steps:-1},
 {...health,steps:1.5},
 {...health,source:"unknown"},
 {...health,measuredDate:"2026-10-28"},
 {...health,importedAt:"gisteren"},
 {...health,extraField:"niet toegestaan"}
 ])assert.throws(()=>C.journalHealthValid(bad,date));
assert.equal(C.journalHealthValid(undefined,date),true);

// De nacht van 27 op 28 oktober staat bij 28 oktober (wakker-word-datum).
const wakeDate="2026-10-28";
const manual={version:1,sleepMinutes:320,steps:12000,sleepScore:72,restingHeartRateBpm:58,exerciseMinutes:30};
C.saveJournal(life,{id:legacy.id,date:wakeDate,collectionId,body:"Oud dagboek",mood:"Goed",
 checkin:{energy:3,sleepStart:"2026-10-27T23:00",sleepEnd:"2026-10-28T04:20"},manualHealth:manual});
assert.deepEqual(C.findJournal(life,wakeDate).journal.manualHealth,manual);
assert.equal(C.findJournal(life,date).journal.manualHealth,undefined);
assert(C.journalHasContent("",{manualHealth:manual}));
C.validate(life);
const copied=JSON.parse(JSON.stringify(life));
C.validate(copied);
assert.deepEqual(C.findJournal(copied,wakeDate).journal.manualHealth,manual);
C.saveJournal(life,{id:legacy.id,date:wakeDate,collectionId,body:"Bewerkt, zonder nieuwe handmatige meting"});
assert.deepEqual(C.findJournal(life,wakeDate).journal.manualHealth,manual);
C.saveJournal(life,{id:legacy.id,date:wakeDate,collectionId,body:"Bewerkt, waarden gewist",manualHealth:null});
assert.equal(C.findJournal(life,wakeDate).journal.manualHealth,undefined);
assert.deepEqual(C.findJournal(life,date).journal.health,health);
for(const bad of [
 {version:1,steps:-1},{version:1,steps:2.5},{version:1,sleepMinutes:2161},
 {version:1,sleepScore:101},{version:1,restingHeartRateBpm:0},
 {version:1,exerciseMinutes:1441},{version:1,steps:100,unrecognized:1},
 {version:1},{version:2,steps:20}
])assert.throws(()=>C.journalManualHealthValid(bad));
assert.equal(C.journalManualHealthValid(undefined),true);
console.log("JOURNAL_MANUAL_HEALTH_CORE_PASS wake-date mapping, preservation, clearing, backup, invalid inputs");

console.log("JOURNAL_SELFCARE_CORE_PASS legacy, check-in only, preservation, backup roundtrip, invalid values");
