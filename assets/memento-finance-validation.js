/* Read-only financial boundary validation. Missing legacy fields are not corruption;
   present fields are never coerced, repaired or removed. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoFinanceValidation=api;})(globalThis,()=>{
'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const accounts=['personal','joint','creditcard'];
function fail(path){throw Error('Ongeldige financiële gegevens bij '+path+'. De bron blijft behouden.');}
function check(ok,path){if(!ok)fail(path);}
function text(v,path){check(typeof v==='string',path);}
function id(v,path){check(typeof v==='string'&&v.trim().length>0,path);}
function number(v,path,min=-Infinity){check(typeof v==='number'&&Number.isFinite(v)&&v>=min,path);}
function date(v,path){check(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v,path);}
function month(v,path){check(/^\d{4}-(0[1-9]|1[0-2])$/.test(v),path);}
function optional(o,k,fn,path){if(own(o,k))fn(o[k],path+'.'+k);}
function record(v,path){check(object(v),path);}
function list(v,path){check(Array.isArray(v),path);}
function account(v,path){check(accounts.includes(v),path);}
function amounts(v,path){record(v,path);for(const [k,n] of Object.entries(v))number(n,path+'.'+k,0);}
function validate(s){
 record(s,'financiën');
 optional(s,'version',(v,p)=>check([1,2,3].includes(v),p),'financiën');
 list(s.transactions,'transactions');list(s.categories,'categories');
 const categoryNames=new Set();
 for(const [i,c] of s.categories.entries()){
  const p='categories['+i+']';record(c,p);id(c.name,p+'.name');check(!categoryNames.has(c.name),p+'.name');categoryNames.add(c.name);
  optional(c,'kind',(v,q)=>check(['expense','income'].includes(v),q),p);
  optional(c,'subcategories',(v,q)=>{list(v,q);v.forEach((x,i)=>text(x,q+'['+i+']'));},p);
  for(const k of ['icon','color'])optional(c,k,text,p);
 }
 function transaction(t,p){
  record(t,p);id(t.id,p+'.id');number(t.amount,p+'.amount',0);date(t.date,p+'.date');check(['expense','income','refund','transfer'].includes(t.type),p+'.type');
  optional(t,'account',account,p);
  // Missing account is the supported personal-account legacy format.
  if(t.type==='transfer'){account(t.transferToAccount,p+'.transferToAccount');check(t.transferToAccount!==(t.account||'personal'),p+'.transferToAccount');}
  else optional(t,'transferToAccount',(v,q)=>{if(v!==null&&v!=='')account(v,q);},p);
  for(const k of ['description','merchant','category','subcategory','note','person'])optional(t,k,text,p);
  for(const k of ['billId','receiptId'])optional(t,k,(v,q)=>{if(v!==null)text(v,q);},p);
  optional(t,'billOccurrenceDate',(v,q)=>{if(v!==null)date(v,q);},p);
  optional(t,'splits',(v,q)=>{
   if(v===null)return;list(v,q);let total=0;
   v.forEach((part,i)=>{const r=q+'['+i+']';record(part,r);id(part.category,r+'.category');number(part.amount,r+'.amount',0);total+=part.amount;for(const k of ['subcategory','note'])optional(part,k,text,r);});
   if(v.length)check(Math.abs(total-t.amount)<=.009,q+'.amount');
  },p);
 }
 function bill(b,p){record(b,p);id(b.id,p+'.id');id(b.name,p+'.name');number(b.amount,p+'.amount',0);date(b.nextDate,p+'.nextDate');check(['weekly','monthly','quarterly','yearly'].includes(b.frequency),p+'.frequency');optional(b,'account',account,p);for(const k of ['category','note','paidMonth'])optional(b,k,text,p);}
 function goal(g,p){record(g,p);id(g.id,p+'.id');id(g.name,p+'.name');number(g.target,p+'.target',0);number(g.saved,p+'.saved',0);optional(g,'deadline',(v,q)=>{if(v!=='')date(v,q);},p);optional(g,'contributions',(v,q)=>{list(v,q);const ids=new Set();v.forEach((c,i)=>{const r=q+'['+i+']';record(c,r);id(c.id,r+'.id');check(!ids.has(c.id),r+'.id');ids.add(c.id);date(c.date,r+'.date');number(c.amount,r+'.amount',0);});},p);}
 function receipt(r,p){record(r,p);id(r.id,p+'.id');optional(r,'date',date,p);optional(r,'total',(v,q)=>{if(v!==null)number(v,q,0);},p);optional(r,'transactionId',(v,q)=>{if(v!==null)text(v,q);},p);optional(r,'products',list,p);for(const k of ['store','text','number'])optional(r,k,text,p);}
 function research(r,p){record(r,p);id(r.id,p+'.id');for(const k of ['product','result','answers','wishId','purchaseId'])optional(r,k,text,p);}
 const validators={transactions:transaction,bills:bill,goals:goal,receipts:receipt,research};
 const itemIds={};
 for(const [kind,fn] of Object.entries(validators)){
  const ids=itemIds[kind]=new Set();
  if(!own(s,kind))continue;list(s[kind],kind);
  s[kind].forEach((item,i)=>{const p=kind+'['+i+']';fn(item,p);check(!ids.has(item.id),p+'.id');ids.add(item.id);});
 }
 optional(s,'trash',(trash,p)=>{
  record(trash,p);
  for(const [kind,entries] of Object.entries(trash)){
   check(own(validators,kind),p+'.'+kind);list(entries,p+'.'+kind);const ids=new Set();
   entries.forEach((e,i)=>{const q=p+'.'+kind+'['+i+']';record(e,q);id(e.id,q+'.id');check(!ids.has(e.id),q+'.id');ids.add(e.id);text(e.deletedAt,q+'.deletedAt');validators[kind](e.item,q+'.item');check(!itemIds[kind].has(e.item.id),q+'.item.id');itemIds[kind].add(e.item.id);optional(e,'receiptIds',(v,r)=>{list(v,r);v.forEach(x=>id(x,r));},q);});
  }
 },'financiën');
 optional(s,'budgets',amounts,'financiën');optional(s,'totalBudget',(v,p)=>number(v,p,0),'financiën');
 optional(s,'budgetMonths',(months,p)=>{record(months,p);for(const [m,scopes] of Object.entries(months)){month(m,p);record(scopes,p+'.'+m);for(const [scope,b] of Object.entries(scopes)){check(['all','personalBundle',...accounts].includes(scope),p+'.'+m);record(b,p);optional(b,'total',(v,q)=>number(v,q,0),p);optional(b,'categories',amounts,p);}}},'financiën');
 function totals(v,p){record(v,p);for(const k of ['income','expense','net'])optional(v,k,number,p);optional(v,'count',(n,q)=>check(Number.isInteger(n)&&n>=0,q),p);optional(v,'byAccount',(a,q)=>{record(a,q);for(const [key,t] of Object.entries(a)){account(key,q);totals(t,q+'.'+key);}},p);}
 optional(s,'monthClosures',(v,p)=>{record(v,p);for(const [m,r] of Object.entries(v)){month(m,p);totals(r,p+'.'+m);optional(r,'signature',text,p);optional(r,'closedAt',text,p);}},'financiën');
 optional(s,'settings',(v,p)=>{
  record(v,p);
  for(const k of ['startBalance','monthlyIncomeTarget'])optional(v,k,number,p);
  optional(v,'payday',(n,q)=>check(Number.isInteger(n)&&n>=1&&n<=31,q),p);
  for(const k of ['accountOpening','actualBalances'])optional(v,k,(balances,q)=>{record(balances,q);for(const [a,n] of Object.entries(balances)){account(a,q+'.'+a);if(k==='actualBalances'&&n==='')continue;number(n,q+'.'+a);}},p);
  optional(v,'salaryPeriodStart',(d,q)=>{if(d!=='')date(d,q);},p);
  optional(v,'salaryPeriods',(periods,q)=>{list(periods,q);periods.forEach((r,i)=>{const at=q+'['+i+']';totals(r,at);date(r.from,at+'.from');date(r.to,at+'.to');check(r.from<=r.to,at);});},p);
  optional(v,'balanceCheckedAt',(a,q)=>{record(a,q);for(const [key,d] of Object.entries(a)){account(key,q);text(d,q+'.'+key);}},p);
 },'financiën');
 // Categories and bill/receipt links may outlive a deletion. Preserve historical
 // names and references verbatim rather than inventing replacements.
 return s;
}
return {validate};
});
