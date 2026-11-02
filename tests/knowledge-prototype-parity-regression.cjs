"use strict";
// Negative fixtures call the same parity assertions used by the real browser journey.
// A CI-green visual check must fail for broken width, order, content, or sheet layout.
const assert=require("node:assert/strict");
const parity=require("./helpers/knowledge-prototype-parity.cjs");
assert.equal(parity.verifyReference(),parity.REFERENCE_BLOB);
let count=0;
function check(name,fn){fn();count++;console.log("PASS "+name)}
const R=(x,y,width,height)=>({x,y,width,height,left:x,right:x+width,top:y,bottom:y+height});
const sample=()=>{
 const s={position:"middle",viewport:{width:393,height:852},scrollY:400,scrollMax:800,scrollWidth:393,
  title:"Fictieve bespreking",body:"Fictieve inhoud",topbar:R(0,0,393,73),header:R(13,73,367,60),
  nav:R(0,771,393,81),save:R(295,81,75,44),writing:R(13,151,367,480),
  organization:R(13,643,367,175),followups:R(13,830,367,150),extras:R(13,992,367,90),
  writingBackground:"rgb(20, 56, 43)",saveBackground:"rgb(197, 223, 195)"};
 return s;
};
const cloned=o=>JSON.parse(JSON.stringify(o));
check("unmodified reference and app editor fixture passes",()=>parity.assertEditor(sample(),sample(),"middle"));
check("a changed fictional body fails",()=>{const a=sample();a.body="Other content";assert.throws(()=>parity.assertEditor(sample(),a,"middle"),/Same fictional body/);});
check("80px smaller writing card fails the release comparison",()=>{const a=sample();a.writing.width-=80;assert.throws(()=>parity.assertEditor(sample(),a,"middle"),/VISUEEL AFGEKEURD/);});
check("swapped editor panels fail hierarchy",()=>{const a=sample();a.organization.top=900;assert.throws(()=>parity.assertEditor(sample(),a,"middle"),/hierarchy/);});
check("missing real controls fail",()=>{const a=sample();a.save=null;assert.throws(()=>parity.assertEditor(sample(),a,"middle"),/Missing/);});
check("missing or reordered followup option fails",()=>{const r=["Vervolgtaak","Vervolgafspraak","Vervolgnotitie"];parity.assertChoices(r,r);assert.throws(()=>parity.assertChoices(r,["Vervolgtaak","Vervolgnotitie","Vervolgafspraak"]),/AFGEKEURD/);});
const ref={viewport:{width:393,height:852},rect:{x:0,y:452,width:393,height:400,bottom:852},title:"Fictieve bespreking"};
check("safe real followup form permits existing 100px form extension",()=>parity.assertSheet(ref,{...ref,rect:{x:0,y:352,width:393,height:500,bottom:852}},"task",{form:true}));
check("large followup form displacement fails",()=>{const a=cloned(ref);a.rect.y=300;a.rect.height=552;assert.throws(()=>parity.assertSheet(ref,a,"task",{form:true}),/VISUEEL AFGEKEURD/);});
check("followup sheet floating away from bottom fails",()=>{const a=cloned(ref);a.rect.bottom=780;assert.throws(()=>parity.assertSheet(ref,a,"choices"),/VISUEEL AFGEKEURD/);});
console.log("PROTOTYPE_PARITY_REGRESSION_PASS "+count+" cases");
