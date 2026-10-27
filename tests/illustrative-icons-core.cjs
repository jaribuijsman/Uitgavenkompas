"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const I=require("../assets/memento-illustrative-icons.js");
const K=require("../assets/memento-knowledge-core.js");
const ksrc=fs.readFileSync(path.join(__dirname,"../assets/memento-knowledge.js"),"utf8");
const index=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"../assets/memento-illustrative-icons.css"),"utf8");
const sw=fs.readFileSync(path.join(__dirname,"../sw.js"),"utf8");
const headings=["levenspad","huis-wonen","recepten-creaties","projecten-onderzoek","ideeen-inspiratie"];
assert.equal(I.available.length,66);
assert.equal(new Set(I.available).size,66);
assert.equal(Object.keys(I.categoryDefaults).length,23);
const groups={};
for(const key of I.available){
 const mark=I.svg(key);
 assert(mark.startsWith('<svg '),"Missing svg "+key);
 assert(mark.endsWith("</svg>"),"Unclosed svg "+key);
 assert(mark.includes('viewBox="0 0 64 64"'),"Wrong viewBox "+key);
 assert(!/<(?:text|foreignObject|script|image|animate|style)\b/i.test(mark),"Disallowed node "+key);
 assert(!/\b(?:https?:|javascript:|xlink:)/i.test(mark.replace('xmlns="http://www.w3.org/2000/svg"', "")),"External URL "+key);
 assert(mark.includes("<path")||mark.includes("<circle"),"Empty symbol "+key);
 assert(mark.length<4500,"Overlarge symbol "+key);
 const tag=[...mark.matchAll(/<[^>]+>/g)].map(m=>m[0]);
 const bad=tag.filter(t=>/^<(?:path|circle|rect|ellipse)/.test(t) && !/\b(?:fill|stroke)=/.test(t));
 assert.equal(bad.length,0,"Unpainted shapes "+key+": "+bad[0]);
 groups[key]=mark;
}
const testLife={notes:[],tasks:[]};K.ensure(testLife);K.migrateHierarchy(testLife);K.validate(testLife);
const builtins=testLife.knowledge.collections.filter(c=>c.id.startsWith("kc2-"));
assert.equal(builtins.length,23);
for(const c of builtins){
 assert(I.categoryDefaults[c.id], "Default icon not mapped: "+c.id);
 assert.equal(c.icon,I.sourceDefaults[c.id],"Default icon ID mismatch: "+c.id);
 assert(I.available.includes(I.collection(c)),"Missing art: "+c.name);
 assert(I.forCollection(c).includes("<svg"),"Missing icon: "+c.name);
}
const uniqueArt=new Set(builtins.map(c=>I.collection(c)));
assert(uniqueArt.size===23,"Too many visually identical standard category icons");
for(const key of ["arrow-left","close","edit","trash","menu","plus","check","filter","download","upload","link","transactions"]){
 const mark=I.svg(key);assert(mark.includes('stroke="currentColor"'));assert(!mark.includes('<defs>'));assert(!mark.includes('<ellipse'));
}
const repeated=I.svg('journal')+I.svg('journal');
const ids=[...repeated.matchAll(/ id="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
// Every picker choice must remain valid through collection save and JSON backup validation.
for(const key of K.iconIds){
 assert(I.available.includes(I.resolve(key)));const c=K.saveCollection(testLife,{name:'Keuze '+key,icon:key,view:'list',parentId:null});
 assert.equal(c.icon,key);K.validate(JSON.parse(JSON.stringify(testLife)));
}
const changed={...builtins.find(c=>c.id==="kc2-levenspad-leren"),icon:"camera"};
assert.equal(I.collection(changed),"camera","User-selected icon must override default category visual");
assert.equal(I.fromGlyph('↘'),'shopping');assert.equal(I.fromGlyph('✈️'),'travel');
const financeDefaults=JSON.parse(index.match(/const DEFAULT_CATEGORIES=(\[.*?\]);/)[1]);
for(const c of financeDefaults)assert.notEqual(I.financeCategory(c.name),'folder',c.name);
for(const [name,key] of [['Vaste lasten','house'],['Cadeaus & donaties','star'],['Huis & inrichting','sofa'],['Financiën','accounts'],['Vakantie & reizen','compass']])assert.equal(I.financeCategory(name),key);
for(const name of ["Dagboek","Reizen en vakanties","Auto & vervoer","Gezondheid","Boodschappen","Wonen"]){
 assert(I.available.includes(I.financeCategory(name)));
}
for(const name of ["today","tasks","notes","groceries","agenda","fitness","settings","smartbuy","moneycoach","accounts","transactions","analysis","budgets","planning","receipts","menu"]){
 assert(I.svg(name).includes("<svg"),"Navigation icon missing "+name);
}
assert(I.svg("<script>alert(1)</script>").includes("<svg"));
assert(!I.svg("<script>").includes("<script>"));
assert(ksrc.includes("MementoIllustratedIcons?.forCollection(c)"),"Knowledge icons not wired");
assert(ksrc.includes("MementoIllustratedIcons?.svg(key)"),"Knowledge picker not wired");
assert(index.includes("memento-illustrative-icons.js?v=20261027-iconset-v2"),"Missing shared module");
assert(index.includes("memento-illustrative-icons.css?v=20261027-iconset-v2"),"Missing CSS");
assert(index.includes("MementoIllustratedIcons?.svg(name)"),"Unified navigation not using icons");
assert(index.includes("transactionArt(t)"),"Financial transactions not using icons");
assert(index.includes("categoryArt(c.name)"),"Budgets not using icons");
assert(sw.includes("memento-pwa-v33-20261027-illustrative-icons-v2"),"Cache version incorrect");
assert(sw.includes("./assets/memento-illustrative-icons.js?v=20261027-iconset-v2"));
assert(sw.includes("./assets/memento-illustrative-icons.css?v=20261027-iconset-v2"));
for(const token of [".kc-collection-icon",".kc-icon-picker","#mementoQuickNav","#mementoMenuGrid",".stat-icon",".ft-tabs"]){
 assert(css.includes(token),"Missing icon sizing for "+token);
}
console.log(JSON.stringify({result:"PASS",uniqueIllustrations:I.available.length,defaultCategories:builtins.length,distinctDefaults:uniqueArt.size,individualShapeTests:Object.keys(groups).length,navigationMapped:true,storageSchemaUnchanged:true,serviceWorkerCache:true}));
