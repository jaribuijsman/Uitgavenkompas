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
  update();
})();
