/* Transaction/category invariants including historical mismatches. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../assets/memento-category-integrity.js');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const cats=[{name:'Boodschappen',subcategories:['Supermarkt']},{name:'Vaste lasten',subcategories:['Wegenbelasting']},{name:'Huis & inrichting',subcategories:['Keuken & huishoudelijke spullen']}];
const old={type:'expense',category:'Boodschappen',subcategory:'Wegenbelasting'};
let passed=0;const check=(n,fn)=>{fn();passed++;console.log('PASS',n)};
check('detect wrong parent',()=>assert.deepEqual(C.inspect(cats,old.category,old.subcategory).owners,['Vaste lasten']));
check('edit unrelated field keeps old value',()=>assert(C.canSave(cats,old,old)));
check('do not erase unmatched subcategory on save',()=>assert(!C.canSave(cats,{...old,subcategory:''},old)));
check('allow explicit clear',()=>assert(C.canSave(cats,{...old,subcategory:'',allowClear:true},old)));
check('correct to valid parent',()=>assert(C.canSave(cats,{...old,category:'Vaste lasten'},old)));
check('reject new incorrect combination',()=>assert(!C.canSave(cats,old,null)));
check('reject newly unknown categories',()=>assert(!C.canSave(cats,{type:'expense',category:'Other',subcategory:''},null)));
check('preserve historical unknown category',()=>{const o={type:'expense',category:'Legacy',subcategory:''};assert(C.canSave(cats,o,o))});
check('prevent removal of in-use subcategory',()=>assert.equal(C.affectedByRemoval([{category:'Vaste lasten',subcategory:'Wegenbelasting'}],'Vaste lasten',['Wegenbelasting']),1));
check('form retains old, validates on save and warns',()=>{assert.match(html,/setType\(t\.type,true\)/);assert.match(html,/id="txSubcategoryNotice"/);assert.match(html,/categoryIntegrity\.canSave\(state\.categories/);assert.match(html,/affectedByRemoval\(state\.transactions/);});
check('one split row never overwrites the primary category',()=>{
 assert.match(html,/let splitActive=splits\.length>1/);
 assert.match(html,/if\(type==='expense'&&splitActive\)\{splitData=/);
 assert.doesNotMatch(html,/if\(type==='expense'&&!document\.getElementById\('splitSection'\)\.classList\.contains/);
});
check('split removal is explicit and cannot silently discard split records',()=>{
 assert.match(html,/Splitsing opheffen\?/);
 assert.match(html,/splitData\.length<2/);
});
console.log('PASS',passed,'category integrity cases');
