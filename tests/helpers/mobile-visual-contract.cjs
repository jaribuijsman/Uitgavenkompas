"use strict";
const assert=require("node:assert/strict");

// Reusable Playwright geometry contract for the ACTUAL affected screen.
// A passing geometry contract is not design approval or a physical Android test.
module.exports=async function checkMobileVisualContract(page,options){
 const {header,action,fileLabel,fileInput,lastAction,shot}=options;
 const initial=page.viewportSize(),evidence=[];
 try{
  if(options.expandSelector){
   const folder=page.locator(options.expandSelector);
   if(await folder.count()&&!await folder.evaluate(e=>e.open))await folder.locator("summary").click();
  }
  for(const [width,height] of [[360,852],[393,852],[412,852],[393,470]]){
   await page.setViewportSize({width,height});
   for(const position of ["top","middle","bottom"]){
    await page.evaluate(position=>{
     const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
     scrollTo(0,position==="top"?0:position==="middle"?max/2:max);
    },position);
    await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
    const m=await page.evaluate(({header,action,fileLabel,fileInput,lastAction})=>{
     const rect=selector=>{
      const e=document.querySelector(selector);if(!e)return null;
      const r=e.getBoundingClientRect(),style=getComputedStyle(e);
      return {top:r.top,bottom:r.bottom,width:r.width,height:r.height,opacity:style.opacity,bg:style.backgroundColor};
     };
     return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scroll:scrollY,
       remaining:Math.max(0,document.documentElement.scrollHeight-innerHeight-scrollY),
       head:rect(header),action:rect(action),upload:rect(fileLabel),file:rect(fileInput),
       last:rect(lastAction),nav:rect("#mementoQuickNav"),topbar:rect("#compassAreaBar")};
    },{header,action,fileLabel,fileInput,lastAction});
    assert(m.scrollWidth<=width+1,"Horizontal overflow: "+JSON.stringify(m));
    assert(m.head&&m.action&&m.upload&&m.file&&m.nav&&m.topbar&&m.last,"Missing real editor surface: "+JSON.stringify(m));
    assert(m.action.height>=44&&m.action.width>=44,"Inaccessible note action: "+JSON.stringify(m.action));
    assert(m.action.width<=Math.min(265,width*.82),"Full-width note action regresssion: "+JSON.stringify(m.action));
    assert(m.upload.width>=44&&m.upload.height>=44,"Attachment trigger too small");
    assert(Number(m.file.opacity)<0.1&&m.file.width<=2&&m.file.height<=2,"Native file control overlaps styled action: "+JSON.stringify(m.file));
    const rgba=m.head.bg.match(/^rgba?\(([^)]+)\)$/);
    assert(rgba&&(!m.head.bg.startsWith("rgba(")||Number(rgba[1].split(",").at(-1).trim())>=.99),"Translucent sticky header: "+m.head.bg);
    const opaque=background=>{
     const match=String(background||"").match(/^rgba?\(([^)]+)\)$/);
     return Boolean(match)&&(!String(background).startsWith("rgba(")||Number(match[1].split(",").at(-1).trim())>=.99);
    };
    assert(opaque(m.topbar.bg),"Main Memento header is translucent over content: "+m.topbar.bg);
    assert(opaque(m.nav.bg),"Bottom navigation is translucent over content: "+m.nav.bg);
    if(position!=="top"&&m.scroll>100){
     assert(m.head.top>=m.topbar.bottom-8&&m.head.top<=m.topbar.bottom+29,
      "Sticky header misaligned with top bar: "+JSON.stringify(m));
    }
    if(position==="bottom")assert(m.remaining<4&&m.last.bottom<=m.nav.top-8,
      "Bottom controls hidden under fixed navigator: "+JSON.stringify(m));
    evidence.push({width,height,position,scroll:Math.round(m.scroll),actionWidth:Math.round(m.action.width)});
    if(shot&&position!=="top")await shot(page,"editor-"+width+"x"+height+"-"+position);
   }
  }
 }finally{
  await page.setViewportSize(initial);
  await page.evaluate(()=>scrollTo(0,0));
 }
 return evidence;
};
