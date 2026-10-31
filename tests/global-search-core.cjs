'use strict';
const assert=require('node:assert/strict');
const {build,search,normalize}=require('../assets/memento-global-search-core.js');
const life={
 tasks:[{id:'t1',title:'Garage De Hout bellen',notes:'Remblokken controleren',date:'2026-10-30',done:false},{id:'t2',title:'Verwijderde taak',deletedAt:'2026-10-01'}],
 appointments:[{id:'a1',title:'Garage afspraak',date:'2026-10-31',location:'Beverwijk',notes:'Auto ophalen'}],
 notes:[{id:'n1',title:'Dagboek vrijdag',body:'Moe na de middagdienst',journal:{date:'2026-10-30'},tags:['Ploegendienst']},{id:'n2',title:'Recept',body:'Crème fraîche',kind:'recipe',deletedAt:''}],
 groceries:[{id:'g1',title:'Melk',quantity:'1 liter'}],wishes:[{id:'w1',title:'Nieuwe fiets'}],templates:[],
 fitness:{routines:[{id:'fit1',name:'Bovenlichaam'}],sessions:[],bookings:[],measurements:[]}
};
const finance={
 transactions:[{id:'tx1',description:'Garage De Hout',merchant:'De Hout',amount:570,date:'2026-10-30',category:'Auto & vervoer',notes:'Dynamo'},{id:'tx2',description:'Winkel',date:'2026-10-29',splits:[{category:'Boodschappen',subcategory:'Groente'}]}],
 receipts:[{id:'r1',store:'Supermarkt',date:'2026-10-25',structured:{producten:[{naam:'Komkommer'}]}}],
 bills:[{id:'b1',name:'Huur',nextDate:'2026-11-01'}],goals:[{id:'goal1',name:'Vakantie'}],
 categories:[],budgets:{'Auto & vervoer':150},research:[]
};
const before=JSON.stringify({life,finance}),rows=build(life,finance);
assert.equal(rows.some(r=>r.id==='t2'),false,'Deleted records are excluded');
assert.equal(search(rows,'garage').filter(r=>r.title.includes('Garage')).length,3,'Across life and finance');
assert.deepEqual(search(rows,'garage','appointments').map(r=>r.id),['a1']);
assert.deepEqual(search(rows,'dynamo','finance').map(r=>r.id),['tx1']);
assert.deepEqual(search(rows,'komkommer').map(r=>r.id),['r1'],'Receipt line items are searchable');
assert.deepEqual(search(rows,'creme').map(r=>r.id),['n2'],'Dutch diacritics are normalized');
assert.deepEqual(search(rows,'middagdienst').map(r=>r.id),['n1'],'Diary body is searchable');
assert.deepEqual(search(rows,'Bovenlichaam').map(r=>r.id),['fit1']);
assert.equal(search(rows,'garage')[0].title,'Garage afspraak','Title prefix wins over non-title content');
assert.equal(search(rows,'geen-match').length,0,'No fabricated result');
assert.equal(normalize('Crème'), 'creme');
assert.equal(JSON.stringify({life,finance}),before,'Search must not mutate stored objects');
console.log('PASS universal search: full domains, ranking, filters, content, deletes, read-only');
