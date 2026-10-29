/* Presentation only: give dialogs the visible viewport when a software keyboard opens. */
(()=>{"use strict";
  const viewport=window.visualViewport;
  function update(){
    document.documentElement.style.setProperty("--m-viewport-height",(viewport?.height||innerHeight)+"px");
    const focused=document.activeElement;
    document.body.classList.toggle("memento-editing",!!focused?.matches("input:not([type=checkbox]):not([type=radio]),textarea,[contenteditable=true]")&&!focused.closest("#pinLock"));
  }
  viewport?.addEventListener("resize",update,{passive:true});
  window.addEventListener("resize",update,{passive:true});
  document.addEventListener("focusin",update);
  document.addEventListener("focusout",()=>requestAnimationFrame(update));
  // Reserve the existing storage warning instead of allowing it to cover controls.
  // This is layout only: the guard still owns its text, dismissal and write decisions.
  let notice=null,noticeObserver=null,noticeHiddenObserver=null,noticeGap=-1;
  function reserveNotice(){
    const next=document.getElementById("mementoStorageNotice");
    if(next!==notice){
      noticeObserver?.disconnect();noticeHiddenObserver?.disconnect();notice=next;
      if(notice){
        if(window.ResizeObserver){noticeObserver=new ResizeObserver(reserveNotice);noticeObserver.observe(notice)}
        noticeHiddenObserver=new MutationObserver(reserveNotice);noticeHiddenObserver.observe(notice,{attributes:true,attributeFilter:["hidden"]});
      }
    }
    const height=notice&&!notice.hidden?notice.getBoundingClientRect().height+16:0;
    if(height!==noticeGap){noticeGap=height;document.documentElement.style.setProperty("--m-notice-gap",height+"px");}
  }
  new MutationObserver(reserveNotice).observe(document.body,{childList:true});
  const effects=new WeakMap();
  function signal(el,kind){if(!el)return;clearTimeout(effects.get(el));el.classList.remove('memento-confirmed','memento-filter-changed');void el.offsetWidth;el.classList.add(kind);effects.set(el,setTimeout(()=>el.classList.remove(kind),200));}
  window.MementoFeedback={success:el=>signal(el,'memento-confirmed'),filter:el=>signal(el,'memento-filter-changed')};
  reserveNotice();update();
})();
