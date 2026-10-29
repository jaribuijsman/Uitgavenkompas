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
console.log("JOURNAL_SELFCARE_CORE_PASS legacy, check-in only, preservation, backup roundtrip, invalid values");
