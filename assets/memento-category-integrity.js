/* Category integrity: pure checks, never mutates old transactions or backups. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.MementoCategoryIntegrity=api;
})(globalThis,function(){
 "use strict";
 const list=x=>Array.isArray(x)?x:[];
 const category=(categories,name)=>list(categories).find(c=>c&&c.name===name)||null;
 const owners=(categories,sub)=>sub?list(categories).filter(c=>list(c?.subcategories).includes(sub)).map(c=>c.name):[];
 function inspect(categories,name,sub){
  const item=category(categories,name);
  if(!item)return {valid:false,reason:"category",owners:owners(categories,sub)};
  if(sub&&!list(item.subcategories).includes(sub))return {valid:false,reason:"subcategory",owners:owners(categories,sub)};
  return {valid:true,reason:"",owners:[]};
 }
 function canSave(categories,next,original){
  const oldInvalid=original&&!inspect(categories,original.category,original.subcategory||"").valid;
  if(oldInvalid&&original.type===next.type&&original.category===next.category
    &&original.subcategory&&next.subcategory===""&&next.allowClear!==true)return false;
  if(inspect(categories,next.category,next.subcategory||"").valid)return true;
  return !!original&&original.type===next.type&&original.category===next.category
   &&(original.subcategory||"")===(next.subcategory||"");
 }
 function affectedByRemoval(transactions,cat,removed){
  const names=new Set(list(removed));
  return names.size?list(transactions).filter(t=>t&&t.category===cat&&names.has(t.subcategory)).length:0;
 }
 return Object.freeze({category,owners,inspect,canSave,affectedByRemoval});
});
