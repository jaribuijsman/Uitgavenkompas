/* Local, lossless recipe text preview. No network, storage or catalogue matching. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoGroceryImport=api;})(typeof window==='object'?window:globalThis,()=>{
 'use strict';
 const key=s=>String(s||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('nl-NL');
 const isOneOff=g=>g?.origin==='notion-recipe'&&g?.lifecycle==='one-off';
 const quantityNumber=s=>{const t=String(s).trim().replace(',','.');if(/^\d+(?:\.\d+)?$/.test(t))return Number(t);const f=/^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(t);return f&&Number(f[3])>0?Number(f[1]||0)+Number(f[2])/Number(f[3]):null;};
 const amountPattern='(?:\\d+\\s+)?\\d+\\/\\d+|\\d+(?:[.,]\\d+)?';
 const units=/^(kg|kilo(?:gram)?|g|gr(?:am)?|mg|ml|cl|dl|l|liter|el|eetlepels?|tl|theelepels?|stuks?|teentjes?|stengels?)\b\.?\s*/i;
 function parse(text){
  if(typeof text!=='string'||text.length>20000)throw Error('Plak maximaal 20.000 tekens. Er is niets toegevoegd.');
  const lines=text.split(/\r?\n/),hasHeader=lines.some(l=>/^\s*(?:#{1,6}\s*)?(?:\*\*)?ingrediënten\s*:?(?:\*\*)?\s*$/i.test(l));
  let reading=!hasHeader,group='',rows=[];
  for(const original of lines){
   const raw=original.trim();if(!raw)continue;
   const label=raw.replace(/^#{1,6}\s*/,'').replace(/\*\*/g,'').replace(/:$/,'').trim();
   if(/^ingrediënten$/i.test(label)){if(reading&&rows.length)break;reading=true;continue;}
   if(!reading)continue;
   if(/^(bereiding|bereidingswijze|bewaren(?:,.*)?|variaties(?: en.*)?|bron(?:behoud.*)?|in het kort|praktische gegevens)\s*:?$/i.test(label)||/^<(?:toggle|database|table|callout)\b/i.test(raw))break;
   if(/^#{1,6}\s/.test(raw)||/^\*\*[^*]+\*\*:?$/.test(raw)||(!/^[-*•☐☑]/.test(raw)&&/:$/.test(raw))){group=label;continue;}
   if(/^<|^https?:\/\/|^\[.*\]\(https?:\/\//i.test(raw))throw Error('Deze invoer bevat een link of opmaak zonder ingrediënten. Plak alleen de ingrediëntenregels.');
   if(raw.length>2000)throw Error('Een ingrediëntenregel is te lang. Splits of corrigeer deze; er is niets toegevoegd.');
   let line=raw.replace(/^\s*[-*•]\s*/,'').replace(/^\[[ xX]\]\s*/,'').replace(/^[☐☑]\s*/,'').trim();
   if(!line)continue;
   let title=line,quantity='',amount=null,unit='',warnings=[];
   // Ranges, packaging and choices stay literal: their shopping amount is ambiguous.
   const ambiguous=/\d\s*(?:[-–—]|tot)\s*\d|\d\s*(?:x|×)\s*\d|\b(?:blik(?:ken)?|pak(?:ken)?|pot(?:ten)?|zak(?:ken)?)\b|\bof\b/i.test(line);
   const match=new RegExp('^('+amountPattern+')\\s+(.+)$').exec(line);
   if(match&&!ambiguous){amount=quantityNumber(match[1]);let rest=match[2];const u=units.exec(rest);if(u){unit=u[1];rest=rest.slice(u[0].length);}if(rest&&amount!==null){title=rest;quantity=[match[1],unit].filter(Boolean).join(' ');}else amount=null;}
   if(amount===null)warnings.push(ambiguous?'Keuze of hoeveelheid controleren; oorspronkelijke regel behouden.':'Hoeveelheid ontbreekt of is niet herkend.');
   const optional=/\boptioneel\b/i.test(group+' '+line);
   if(optional)warnings.push('Optioneel — standaard niet geselecteerd.');
   rows.push({rawText:raw,title,quantity,originalQuantity:quantity,amount,unit,group,optional,selected:!optional,warnings});
   if(rows.length>100)throw Error('Importeer maximaal 100 ingrediënten tegelijk. Er is niets toegevoegd.');
  }
  if(!rows.length)throw Error('Geen ingrediënten gevonden. Plak de ingrediëntenregels uit je recept.');
  const counts=new Map();for(const r of rows)counts.set(key(r.title),(counts.get(key(r.title))||0)+1);
  for(const r of rows)if(counts.get(key(r.title))>1)r.warnings.push('Komt vaker voor in deze invoer. Controleer je selectie.');
  return rows;
 }
 function scaledQuantity(row,factor){
  if(![.5,1,2,3].includes(factor))throw Error('Kies een geldige hoeveelheidfactor.');
  if(factor===1)return row.originalQuantity;
  if(row.amount===null)return row.originalQuantity;
  return [new Intl.NumberFormat('nl-NL',{maximumFractionDigits:3}).format(row.amount*factor),row.unit].filter(Boolean).join(' ');
 }
 function validateItem(g){
  if(g.origin!=='notion-recipe'&&g.lifecycle!=='one-off')return;
  if(!isOneOff(g)||g.list!=='groceries'||g.favorite!==false||g.needed!==true||g.bought!==false||g.deletedAt!==''||typeof g.quantity!=='string'||g.quantity.length>180||typeof g.category!=='string'||!g.category.trim()||g.category.length>80||!g.recipeImport||g.recipeImport.version!==1||typeof g.recipeImport.batchId!=='string'||!g.recipeImport.batchId||g.recipeImport.batchId.length>200||typeof g.recipeImport.rawText!=='string'||g.recipeImport.rawText.length>2000||typeof g.recipeImport.title!=='string'||g.recipeImport.title.length>180)throw Error('Ongeldig eenmalig receptingrediënt. De bestaande gegevens zijn behouden.');
 }
 function makeItems(draft,uid){
  const selected=draft.rows.filter(r=>r.selected);if(!selected.length)throw Error('Kies ten minste één ingrediënt.');
  if(draft.title.length>180)throw Error('De recepttitel mag maximaal 180 tekens bevatten.');
  let sourceUrl='';if(draft.sourceUrl.trim()){try{const u=new URL(draft.sourceUrl);if(u.protocol!=='https:')throw Error();sourceUrl=u.href;}catch{throw Error('Gebruik een geldige https-bronlink of laat dit veld leeg.');}if(sourceUrl.length>2000)throw Error('De bronlink is te lang.');}
  return selected.map(r=>{
   const title=r.title.trim(),quantity=r.quantity.trim(),category=r.category.trim();
   if(!title||title.length>180||quantity.length>180||!category||category.length>80)throw Error('Controleer productnaam (1–180 tekens), hoeveelheid (maximaal 180) en categorie.');
   const g={id:uid(),title,quantity,category,notes:'',sourceUrl,list:'groceries',needed:true,bought:false,favorite:false,deletedAt:'',origin:'notion-recipe',lifecycle:'one-off',recipeImport:{version:1,batchId:draft.id,title:draft.title.trim(),rawText:r.rawText}};
   validateItem(g);return g;
  });
 }
 return {parse,scaledQuantity,makeItems,isOneOff,validateItem};
});
