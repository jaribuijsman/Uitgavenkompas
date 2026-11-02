"use strict";
// Prototype-specific mobile geometry; the generic V2 attachment/toolbar geometry
// assumed an always-open file panel and is intentionally not reused here.
const assert=require("node:assert/strict");
module.exports=async function knowledgePrototypeGeometry(page,shot){
 const initial=page.viewportSize(),evidence=[];
 try{
  for(const [width,height] of [[360,852],[393,852],[412,852],[393,470]]){
   await page.setViewportSize({width,height});
   for(const position of ["top","middle","bottom"]){
    await page.evaluate(position=>{
     const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);
     scrollTo(0,position==="top"?0:position==="middle"?max/2:max);
    },position);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    const m=await page.evaluate(()=>{
     const rect=s=>{
      const el=document.querySelector(s);if(!el)return null;
      const r=el.getBoundingClientRect(),css=getComputedStyle(el);
      return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height,bg:css.backgroundColor};
     };
     return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scroll:scrollY,
       remaining:Math.max(0,document.documentElement.scrollHeight-innerHeight-scrollY),
       header:rect(".kc-v3-editor-head"),followup:rect(".kc-v3-primary-action"),
       last:rect(".kc-v3-extras"),topbar:rect("#compassAreaBar"),nav:rect("#mementoQuickNav"),
       writing:rect(".kc-v3-writing-card"),organization:rect(".kc-v3-organization")};
    });
    assert(m.header&&m.topbar&&m.nav&&m.followup&&m.last&&m.writing&&m.organization,
      "Prototype editor surface missing: "+JSON.stringify(m));
    assert(m.scrollWidth<=width+1,"Horizontal overflow: "+JSON.stringify(m));
    assert(m.followup.height>=44&&m.followup.width>=44,"Followup action too small: "+JSON.stringify(m));
    assert(m.followup.left>=0&&m.followup.right<=width+1,"Followup action off-screen");
    if(position!=="top"&&m.scroll>100){
     assert(m.header.top>=m.topbar.bottom-8&&m.header.top<=m.topbar.bottom+29,
       "Sticky editor header overlaps app header: "+JSON.stringify(m));
    }
    if(position==="bottom"){
     assert(m.remaining<4,"Did not scroll to last editor controls");
     assert(m.last.bottom<=m.nav.top-8,"Editor footer hidden under bottom nav: "+JSON.stringify(m));
    }
    evidence.push({width,height,position,scroll:Math.round(m.scroll)});
    if(shot&&position==="middle")await shot(page,"approved-editor-"+width+"x"+height+"-middle");
    if(shot&&position==="bottom")await shot(page,"approved-editor-"+width+"x"+height+"-bottom");
   }
  }
 }finally{await page.setViewportSize(initial);await page.evaluate(()=>scrollTo(0,0));}
 return evidence;
};
