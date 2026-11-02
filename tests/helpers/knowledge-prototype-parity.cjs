"use strict";
// F3-A: strict, DOM-based parity of the explicitly approved 2026-11-02 prototype.
// Differences in protected MementoLifeFlow fields are intentional; compare their
// bottom-anchored form shell and required shared fields, not deleted feature fields.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const REFERENCE_BLOB="193a7573ec6aedebb8aaba9cd07af29e5d512410";
const REFERENCE_PATH=path.join(__dirname,"../../docs/design-review/knowledge-prototype-approved-20261102.html");
function verifyReference(){
 const b=fs.readFileSync(REFERENCE_PATH);
 const actual=crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
 assert.equal(actual,REFERENCE_BLOB,"Approved prototype changed: freeze new reference only after explicit user approval");
 return actual;
}
function near(a,b,limit,what){
 assert(Number.isFinite(a)&&Number.isFinite(b),what+" has invalid geometry");
 assert(Math.abs(a-b)<=limit,"VISUEEL AFGEKEURD: "+what+" delta "+Math.abs(a-b).toFixed(1)+"px exceeds "+limit+"px");
}
function rect(el){
 if(!el)return null;
 const r=el.getBoundingClientRect();
 return {x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,bottom:r.bottom,left:r.left,right:r.right};
}
async function captureEditor(page,prototype,position){
 const cfg=prototype?{
  header:".editor-head",topbar:".app-top",writing:'.panel[aria-label="Notitie schrijven"]',
  organization:'.panel[aria-label="Organiseren"]',followups:'.panel[aria-label="Opvolging en koppelingen"]',
  extras:'.panel[aria-label="Extra mogelijkheden"]',title:"#title",body:"#body",save:".editor-head .save-btn",nav:".bottom-nav"
 }:{
  header:".kc-v3-editor-head",topbar:"#compassAreaBar",writing:".kc-v3-writing-card",
  organization:".kc-v3-organization",followups:".kc-v3-followups",
  extras:".kc-v3-extras",title:"#kc-title",body:"#kc-body",save:".kc-v3-save-btn",nav:"#mementoQuickNav"
 };
 await page.evaluate(p=>{
  const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  scrollTo(0,p==="top"?0:p==="middle"?max/2:max);
 },position);
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return page.evaluate(({cfg,position})=>{
  const box=s=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
  const val=s=>document.querySelector(s)?.value??null;
  const bg=s=>{const el=document.querySelector(s);return el?getComputedStyle(el).backgroundColor:null;};
  const scrollMax=Math.max(0,document.documentElement.scrollHeight-innerHeight);
  return {position,viewport:{width:innerWidth,height:innerHeight},scrollY,scrollMax,
   scrollWidth:document.documentElement.scrollWidth,
   title:val(cfg.title),body:val(cfg.body),
   header:box(cfg.header),topbar:box(cfg.topbar),nav:box(cfg.nav),save:box(cfg.save),
   writing:box(cfg.writing),organization:box(cfg.organization),followups:box(cfg.followups),extras:box(cfg.extras),
   writingBackground:bg(cfg.writing),saveBackground:bg(cfg.save)
  };
 },{cfg,position});
}
function assertEditor(reference,actual,position){
 assert.equal(reference.position,position);assert.equal(actual.position,position);
 assert.deepEqual(actual.viewport,reference.viewport,"Reference and app must share a viewport");
 assert.equal(reference.viewport.width,393,"Mobile acceptance reference must stay at 393 CSS px");
 assert.equal(reference.title,actual.title,"Same fictional title must be rendered on both sides");
 assert.equal(reference.body,actual.body,"Same fictional body must be rendered on both sides");
 assert(reference.title?.trim()&&reference.body?.trim(),"Blank fixture cannot prove design fidelity");
 for(const [side,s] of [["reference",reference],["app",actual]]){
  assert(s.header&&s.topbar&&s.nav&&s.save,"Missing "+side+" editor header/navigation/save");
  assert(s.writing&&s.organization&&s.followups&&s.extras,"Missing "+side+" four-card hierarchy");
  assert(s.scrollWidth<=s.viewport.width+1,side+" horizontal overflow");
  const cards=["writing","organization","followups","extras"];
  for(let i=1;i<cards.length;i++){
   assert(s[cards[i]].top>=s[cards[i-1]].top+s[cards[i-1]].height-2,
    "VISUEEL AFGEKEURD: "+side+" card hierarchy/order changed at "+position);
  }
  assert(s.save.width>=44&&s.save.height>=44,"Save touch target below 44px on "+side);
  const target=position==="top"?0:position==="middle"?0.5:1;
  if(s.scrollMax>4)near(s.scrollY/s.scrollMax,target,0.04,side+" "+position+" scroll position");
 }
 for(const name of ["header","writing","organization","followups","extras"]){
  near(actual[name].width,reference[name].width,name==="header"?20:16,name+" width at "+position);
  near(actual[name].left,reference[name].left,20,name+" left edge at "+position);
 }
 assert.equal(actual.writingBackground,reference.writingBackground,"VISUEEL AFGEKEURD: writing-card background");
 assert.equal(actual.saveBackground,reference.saveBackground,"VISUEEL AFGEKEURD: save-button background");
 if(position!=="top"){
  // The approved header is sticky below its own app header; Memento follows the same relative rule.
  near(actual.header.top-actual.topbar.bottom,reference.header.top-reference.topbar.bottom,32,"sticky header offset "+position);
 }
 return {state:"editor-"+position,viewport:actual.viewport,reference:REFERENCE_BLOB};
}
async function captureSheet(page,selector,titleSelector){
 return page.evaluate(({selector,titleSelector})=>{
  const el=document.querySelector(selector),r=el?.getBoundingClientRect();
  const title=titleSelector?document.querySelector(titleSelector)?.value??null:null;
  return {viewport:{width:innerWidth,height:innerHeight},rect:r?{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}:null,title};
 },{selector,titleSelector});
}
function assertSheet(reference,actual,state,{form=false}={}){
 assert.deepEqual(actual.viewport,reference.viewport,"Sheet viewport differs: "+state);
 assert(reference.rect&&actual.rect,"VISUEEL AFGEKEURD: missing sheet "+state);
 const w=reference.viewport.width,h=reference.viewport.height;
 for(const [side,s] of [["reference",reference],["app",actual]]){
  assert(s.rect.width>=w-64&&s.rect.width<=w+1,"VISUEEL AFGEKEURD: "+side+" sheet not mobile-width: "+state);
  assert(s.rect.x>=-2&&s.rect.x+s.rect.width<=w+2,"VISUEEL AFGEKEURD: "+side+" sheet clipped: "+state);
  near(s.rect.bottom,h,4,side+" bottom anchored "+state);
 }
 near(actual.rect.width,reference.rect.width,32,"sheet width "+state);
 near(actual.rect.y,reference.rect.y,form?125:90,"sheet top "+state);
 if(form)assert.equal(actual.title,reference.title,"Follow-up form must carry the same fictional title: "+state);
 return {state,viewport:actual.viewport,reference:REFERENCE_BLOB};
}
function assertChoices(referenceLabels,actualLabels){
 const labels=["Vervolgtaak","Vervolgafspraak","Vervolgnotitie"];
 assert.equal(referenceLabels.length,3,"Approved reference choices changed");
 assert.equal(actualLabels.length,3,"VISUEEL AFGEKEURD: follow-up options not complete");
 for(let i=0;i<3;i++){
  assert(referenceLabels[i].includes(labels[i]),"Reference option order changed: "+labels[i]);
  assert(actualLabels[i].includes(labels[i]),"VISUEEL AFGEKEURD: app option missing/reordered "+labels[i]);
 }
 return {state:"followup-options",choices:labels};
}
function evidenceRecorder(width){
 const file=path.join(process.env.MEMENTO_VISUAL_OUT||"/tmp/memento-workspace-visual",
  process.env.MEMENTO_VISUAL_PHASE||"after",String(width),"prototype-parity.json");
 const report={status:"NIET GEVERIFIEERD",referenceBlob:REFERENCE_BLOB,
  prHead:process.env.MEMENTO_PROTOTYPE_PR_HEAD||null,states:[]};
 fs.mkdirSync(path.dirname(file),{recursive:true});
 function save(){fs.writeFileSync(file,JSON.stringify(report,null,2));}
 save();
 return {
  check(name,fn){
   try{const result=fn();report.states.push({name,status:"GESLAAGD",result});save();return result;}
   catch(e){report.states.push({name,status:"AFGEKEURD",reason:String(e)});report.status="AFGEKEURD";save();throw e;}
  },
  finish(){
   assert(report.states.length>=8,"VISUEEL NIET GEVERIFIEERD: editor and three follow-up forms not captured");
   assert(report.states.every(s=>s.status==="GESLAAGD"));
   report.status="GESLAAGD";save();
   return report;
  }
 };
}
module.exports={REFERENCE_BLOB,verifyReference,captureEditor,assertEditor,captureSheet,assertSheet,assertChoices,evidenceRecorder};
