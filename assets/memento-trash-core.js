/* Memento Trash: pure, conservative purge rules. This module never writes storage. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoTrashCore=api;})(globalThis,()=>{
"use strict";
const copy=value=>JSON.parse(JSON.stringify(value));
const lifeKinds={tasks:"Taken",notes:"Notities",groceries:"Boodschappen",wishes:"Aankoopwensen",templates:"Bewaarde taken"};
const financeKinds={transactions:"Transacties",bills:"Vaste lasten",goals:"Spaardoelen",receipts:"Bonnen",research:"Onderzoeksdossiers"};
const isTrashed=item=>Boolean(item&&typeof item==="object"&&item.deletedAt);
function summary(life,finance){
 if(!life||!finance||!Array.isArray(life.notes)||!Array.isArray(finance.transactions)||!Array.isArray(finance.categories))throw Error("Leven of Financiën is niet veilig leesbaar.");
 const counts={},liveFiles=new Set(),oldFiles=new Set();
 for(const [key,label] of Object.entries(lifeKinds)){
  if(!Array.isArray(life[key]))throw Error("De lijst "+label+" kan niet veilig worden gelezen.");
  counts[label]=life[key].filter(isTrashed).length;
 }
 for(const n of life.notes){
  for(const a of n.attachments||[]){
   if(!a||typeof a.id!=="string"||!/^[a-z0-9-]{8,120}$/i.test(a.id))throw Error("Ongeldige bijlageverwijzing.");
   (isTrashed(n)?oldFiles:liveFiles).add(a.id);
  }
 }
 if(life.fitness!==undefined){
  if(!life.fitness||!Array.isArray(life.fitness.sessions))throw Error("De Fitness-geschiedenis kan niet veilig worden gelezen.");
  counts["Fitness-trainingen"]=life.fitness.sessions.filter(isTrashed).length;
 }
 if(finance.trash!==undefined&&(!finance.trash||typeof finance.trash!=="object"||Array.isArray(finance.trash)))throw Error("Financiële prullenbak heeft een ongeldig formaat.");
 for(const [key,items] of Object.entries(finance.trash||{})){
  if(!Array.isArray(items))throw Error("De financiële prullenbak bevat ongeldige gegevens.");
  const label=financeKinds[key]||("Financiën: "+key);
  counts[label]=(counts[label]||0)+items.length;
 }
 const attachmentIds=[...oldFiles].filter(id=>!liveFiles.has(id));
 const total=Object.values(counts).reduce((sum,n)=>sum+n,0);
 return {counts,total,lifeTotal:Object.keys(lifeKinds).reduce((sum,key)=>sum+counts[lifeKinds[key]],0)+(counts["Fitness-trainingen"]||0),financeTotal:total-(Object.keys(lifeKinds).reduce((sum,key)=>sum+counts[lifeKinds[key]],0)+(counts["Fitness-trainingen"]||0)),attachmentIds};
}
function purge(life,finance){
 const overview=summary(life,finance),nextLife=copy(life),nextFinance=copy(finance);
 for(const key of Object.keys(lifeKinds))nextLife[key]=nextLife[key].filter(x=>!isTrashed(x));
 if(nextLife.fitness)nextLife.fitness.sessions=nextLife.fitness.sessions.filter(x=>!isTrashed(x));
 if(nextFinance.trash)for(const key of Object.keys(nextFinance.trash))nextFinance.trash[key]=[];
 // Do not modify active transactions, receipts, tasks, linked entries, historical sessions or IDs.
 return {life:nextLife,finance:nextFinance,overview};
}
return {summary,purge};
});