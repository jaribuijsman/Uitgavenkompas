'use strict';
const assert=require('node:assert/strict'),C=require('../assets/memento-grocery-import.js');
const source='## Ingrediënten\n- [ ] 1,5 liter bouillon\n- [x] 2 tomaten\n- [ ] Zout naar smaak\n**Optioneel**\n- [ ] 100 ml room\n## Bereiding\nBak de tomaten\n## Bronbehoud\n- [ ] 1,5 liter bouillon';
const rows=C.parse(source);assert.equal(rows.length,4);assert.equal(rows[0].quantity,'1,5 liter');assert.equal(rows[1].title,'tomaten');assert.equal(rows[1].selected,true,'A cooking check is not a shopping selection');assert.equal(rows[2].amount,null);assert.equal(rows[3].selected,false);assert.equal(C.scaledQuantity(rows[0],2),'3 liter');
for(const raw of ['1–2 tomaten','1 blik van 400 g tomaten','Garnalen of Kip','600 - 700 ML volle melk','Olijfolie naar smaak']){const row=C.parse(raw)[0];assert.equal(row.title,raw);assert.equal(row.amount,null);assert.equal(C.scaledQuantity(row,2),'');assert(row.warnings.length);}
assert.equal(C.scaledQuantity(C.parse('1 1/2 el olie')[0],2),'3 el');assert.equal(C.scaledQuantity(C.parse('1/0 el olie')[0],2),'');
assert.equal(C.parse('9'.repeat(400)+' g bloem')[0].amount,null,'Overflow must stay literal, never become infinity');
assert(C.parse('2 tomaten\n2 tomaten').every(r=>r.warnings.some(w=>w.includes('vaker'))));
assert.throws(()=>C.parse('https://notion.so/private'));assert.throws(()=>C.parse('x'.repeat(20001)));assert.throws(()=>C.parse(Array(101).fill('Tomaat').join('\n')));
let n=0;const draft={id:'batch',title:'Fictieve soep',sourceUrl:'https://example.test/recept',rows:rows.map(r=>({...r,category:'Overig'}))};
const items=C.makeItems(draft,()=>String(++n));assert.equal(items.length,3);assert(items.every(C.isOneOff));assert.equal(items[0].recipeImport.rawText,'- [ ] 1,5 liter bouillon');assert.equal(items[0].sourceUrl,draft.sourceUrl);items.forEach(C.validateItem);
const ordinary={id:'ordinary',title:'Tomaat',list:'groceries',favorite:true};C.validateItem(ordinary);assert.equal(C.isOneOff(ordinary),false);
for(const patch of [{lifecycle:'saved'},{list:'purchases'},{favorite:true},{needed:false},{deletedAt:'2026-11-03'},{quantity:'x'.repeat(181)}])assert.throws(()=>C.validateItem({...items[0],...patch}));
assert.throws(()=>C.makeItems({...draft,sourceUrl:'javascript:alert(1)'},()=>String(++n)));assert.throws(()=>C.makeItems({...draft,rows:[{...draft.rows[0],title:'x'.repeat(181)}]},()=>String(++n)));assert.throws(()=>C.makeItems({...draft,rows:[]},()=>String(++n)));
console.log('PASS recipe boundaries, literal uncertainty, scaling, repeated rows, one-off lifecycle and validation');
