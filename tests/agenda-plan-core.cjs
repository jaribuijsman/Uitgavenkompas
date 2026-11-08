'use strict';
const assert=require('node:assert/strict'),R=require('../assets/memento-appointment-recurrence.js');
const base={id:'series',title:'Fictieve verjaardag',date:'2024-02-29',allDay:true,time:'',recurrence:'yearly',notes:'behouden',done:false};
const frozen=JSON.stringify(base);
assert.equal(R.forDay([base],'2025-02-28').length,0);
assert.equal(R.forDay([base],'2028-02-29').length,1);
assert.equal(R.forDay([base],'2020-02-29').length,0);
assert.equal(JSON.stringify(base),frozen,'Read-only expansion never materializes future records');
for(const date of ['2026-03-29','2026-10-25']){
 const a={...base,date,recurrence:'weekly'};
 const next=new Date(date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+7);
 assert.equal(R.forDay([a],next.toISOString().slice(0,10)).length,1,'DST does not change weekly calendar dates');
}
const monthly={...base,date:'2026-01-31',recurrence:'monthly'};
assert.equal(R.forDay([monthly],'2026-02-28').length,0);assert.equal(R.forDay([monthly],'2026-03-31').length,1);
const weekly={...base,date:'2026-11-08',recurrence:'weekly',exceptions:{'2026-11-15':{date:'2026-11-16',title:'Verplaatst'},'2026-11-22':{cancelled:true},'2026-11-29':{done:true,completedAt:'2026-11-29T10:00:00Z'}}};
assert.equal(R.forDay([weekly],'2026-11-15').length,0);assert.equal(R.forDay([weekly],'2026-11-16')[0].title,'Verplaatst');
assert.equal(R.forDay([weekly],'2026-11-22').length,0);assert.equal(R.forDay([weekly],'2026-11-29')[0].done,true);assert.equal(R.forDay([weekly],'2026-12-06')[0].done,false);
assert.equal(R.resolve([weekly],'series::2026-11-16'),null,'A moved occurrence keeps its original identity');
assert.equal(R.resolve([weekly],'series::2026-11-15').event.date,'2026-11-16');
assert.deepEqual(R.forDay(JSON.parse(JSON.stringify([weekly])),'2026-11-16'),R.forDay([weekly],'2026-11-16'),'Backup roundtrip retains exceptions');
assert.deepEqual(R.forDay([{...base,recurrence:undefined,date:'2026-11-08'}],'2026-11-08')[0].id,'series');
for(const patch of [{recurrence:'daily'},{exceptions:[]},{exceptions:{'2026-02-30':{done:true}}},{exceptions:{'2026-11-08':{date:'2026-02-30'}}},{exceptions:{'2026-11-08':{time:'29:00'}}},{exceptions:{'2026-11-08':{done:'yes'}}}])assert.throws(()=>R.validate({...base,...patch}));
(async()=>{
 const {tab,emptyLife,clone}=require('./helpers/storage-fixture.cjs');const t=await tab(),initial=emptyLife();initial.appointments=[weekly];t.life.state=t.life.validate(clone(initial));assert(t.life.save());
 const before=clone(t.life.state);assert(t.life.toggleAppointmentCompletion('local','series::2026-12-06'));assert.equal(t.life.localAppointmentsForDay('2026-12-06')[0].done,true);assert.equal(t.life.localAppointmentsForDay('2026-12-13')[0].done,false);
 assert.deepEqual(t.life.state.tasks,before.tasks);assert.deepEqual(t.life.state.notes,before.notes);assert.equal(t.life.state.appointments.length,1);
 t.life.state=t.life.validate(JSON.parse(t.storage.get('compass_life_preview_v1')));assert.equal(t.life.localAppointmentsForDay('2026-12-06')[0].done,true);
 const completion=t.life.localAppointmentsForDay('2026-12-06')[0].completedAt;t.life.editAppointment('series::2026-12-06');for(const [id,value] of Object.entries({mementoEventTitle:'Bewerk afgerond voorkomen',mementoEventDate:'2026-12-06',mementoEventTime:'',mementoEventEnd:'',mementoEventScope:'occurrence',mementoEventRecurrence:'weekly',mementoEventLocation:'',mementoEventNotes:'Behoud de voltooiingsdatum'}))t.get(id).value=value;t.get('mementoEventAllDay').checked=true;t.get('mementoEventDone').checked=true;t.life.saveAppointment('series::2026-12-06');assert.equal(t.life.localAppointmentsForDay('2026-12-06')[0].completedAt,completion,'Editing a completed occurrence preserves its original timestamp');
 const saved=JSON.stringify(t.life.state);const set=t.localStorage.setItem;t.localStorage.setItem=()=>{throw Error('quota')};assert.equal(t.life.toggleAppointmentCompletion('local','series::2026-12-13'),false);t.localStorage.setItem=set;assert.equal(JSON.stringify(t.life.state),saved,'Failed write rolls memory back without losing exceptions');
 t.MementoStorageGuard.close();console.log('PASS recurring calendar dates, exceptions, completion isolation, backup roundtrip, validation and failed-write rollback');
})().catch(e=>{console.error(e);process.exitCode=1});
