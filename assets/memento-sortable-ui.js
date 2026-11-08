/* Memento Leven: one local SortableJS lifecycle and order contract. */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoSortableUI=api;})(typeof window==="object"?window:globalThis,function(root){
 "use strict";
 const instances=new Map();
 function sameMembers(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every(x=>typeof x==="string"&&x.length>0)&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));}
 function orderedByIds(items,ids){if(!Array.isArray(items)||!sameMembers(items.map(x=>x?.id),ids))throw Error("De lijst is ondertussen gewijzigd. Probeer opnieuw.");const map=new Map(items.map(x=>[x.id,x]));return ids.map(id=>map.get(id));}
 function rankByIds(items,ids){orderedByIds(items,ids).forEach((x,i)=>{x.manualOrder=i+1;});}
 function clear(scope){for(const [el,entry] of instances)if(!el.isConnected||scope===el||scope?.contains?.(el)){entry.cleanup?.();entry.sortable.destroy();el.removeEventListener("keydown",entry.onKey);instances.delete(el);}}
 function mountAll(scope,definitions){
  clear(scope);
  if(typeof root.Sortable!=="function")return false;
  for(const d of definitions||[]){
   const el=d.element,selector=d.itemSelector||"[data-order-id]",attr=d.idAttr||"data-order-id";
   if(!el?.isConnected)continue;
   const rows=[...el.children].filter(x=>x.matches(selector)),initial=rows.map(x=>x.getAttribute(attr));
   if(rows.length<2||!sameMembers(initial,initial))continue;
   const handle=d.handleSelector||".memento-sort-handle";
   if(d.injectHandle!==false)rows.forEach(row=>{if(row.querySelector(":scope > .memento-sort-handle"))return;const b=document.createElement("button");b.type="button";b.className="memento-sort-handle";b.textContent="⠿";b.title="Volgorde wijzigen";b.setAttribute("aria-label","Versleep om te sorteren; gebruik de pijltjestoetsen voor toetsenbordbediening");row.append(b);});
   const ids=()=>[...el.children].filter(x=>x.matches(selector)).map(x=>x.getAttribute(attr));
   let before=initial;
   const commit=order=>{if(!sameMembers(before,order))return false;try{return d.onOrder(order,el)!==false;}catch(e){console.error("Sorteren niet opgeslagen",e);return false;}};
   const onKey=e=>{
    const target=e.target.closest?.(d.keyboardSelector||handle);
    if(!target||!el.contains(target)||!["ArrowUp","ArrowDown"].includes(e.key))return;
    if(d.keyboardSelector&&!e.altKey)return;
    const row=target.closest(selector),order=ids(),pos=order.indexOf(row?.getAttribute(attr)),other=pos+(e.key==="ArrowUp"?-1:1);
    if(pos<0||other<0||other>=order.length)return;
    e.preventDefault();e.stopPropagation();before=order.slice();[order[pos],order[other]]=[order[other],order[pos]];commit(order);
   };
   el.addEventListener("keydown",onKey);
   // SortableJS owns drag/drop. A tiny viewport-edge scroll helper keeps long
   // Memento lists reachable even when an Android touch stays near the bottom.
   let tracking=false,lastY=null,frame=0;
   const track=e=>{
    if(!tracking)return;
    const point=e.changedTouches?.[0]||e.touches?.[0]||e;
    if(Number.isFinite(point.clientY))lastY=point.clientY;
   };
   function tick(){
    if(!tracking)return;
    if(!el.isConnected){stopTracking();return;}
    if(lastY!==null){
     const nav=root.document?.getElementById("mementoQuickNav")?.getBoundingClientRect();
     const header=root.document?.getElementById("compassAreaBar")?.getBoundingClientRect();
     const top=Math.max(75,(header?.bottom||0)+55);
     const bottom=Math.min(root.innerHeight-140,nav?.height?nav.top-80:Infinity);
     const dy=lastY<top?-Math.min(14,4+(top-lastY)/4):lastY>bottom?Math.min(14,4+(lastY-bottom)/4):0;
     if(dy)root.scrollBy(0,dy);
    }
    frame=root.requestAnimationFrame(tick);
   }
   function startTracking(){
    stopTracking();tracking=true;
    root.document.addEventListener("touchmove",track,{capture:true,passive:true});
    root.document.addEventListener("mousemove",track,true);
    frame=root.requestAnimationFrame(tick);
   }
   function stopTracking(){
    tracking=false;lastY=null;if(frame)root.cancelAnimationFrame(frame);frame=0;
    root.document.removeEventListener("touchmove",track,true);
    root.document.removeEventListener("mousemove",track,true);
   }
   // Task lists share the same handle-only Android long press.
   const dayTaskDragDelay=el.matches(".life-day-column .life-list, #lifeTaskResults .life-list")?500:0;
   const sortable=new root.Sortable(el,{
    draggable:selector,handle,sort:true,animation:150,
    delay:dayTaskDragDelay,delayOnTouchOnly:dayTaskDragDelay>0,touchStartThreshold:4,
    forceFallback:true,fallbackOnBody:true,fallbackTolerance:2,
    scroll:false,
    chosenClass:"memento-sort-chosen",ghostClass:"memento-sort-ghost",
    onStart(){before=ids();startTracking();},
    onUnchoose(){stopTracking();},
    onEnd(evt){
      stopTracking();
      const after=ids();
      if(after.join("\u0000")===before.join("\u0000"))return;
      const original=evt.originalEvent||{},point=original.changedTouches?.[0]||original.touches?.[0]||original;
      const bounds=el.getBoundingClientRect();
      const outside=Number.isFinite(point.clientX)&&Number.isFinite(point.clientY)
        &&(point.clientX<bounds.left-25||point.clientX>bounds.right+25
          ||point.clientY<Math.max(0,bounds.top-25)||point.clientY>Math.min(root.innerHeight,bounds.bottom+25));
      if(outside||!commit(after)){if(el.isConnected)sortable.sort(before);}
    }
   });
   instances.set(el,{sortable,onKey,cleanup:stopTracking});
  }
  return true;
 }
 return {clear,mountAll,sameMembers,orderedByIds,rankByIds};
});