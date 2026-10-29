/* Shared presentation primitive. Moves existing nodes, preserving native handlers and data.
   Callers own component selection and open state; keyed layout folds are idempotent. */
(()=>{'use strict';
 function fold(nodes,title,{open=false,key}={}){
  nodes=nodes.filter(Boolean);if(!nodes.length)return null;
  if(key){const existing=nodes[0].closest('details[data-ml-fold]');if(existing)return existing;}
  const details=document.createElement('details');details.className='mg-fold';details.open=open;
  if(key){details.classList.add('ml-fold');details.dataset.mlFold=key;}
  const summary=document.createElement('summary');summary.textContent=title;details.append(summary);
  const body=document.createElement('div');body.className='mg-fold-body';details.append(body);
  nodes[0].before(details);nodes.forEach(node=>body.append(node));return details;
 }
 window.MementoDisclosure=Object.freeze({fold});
})();
