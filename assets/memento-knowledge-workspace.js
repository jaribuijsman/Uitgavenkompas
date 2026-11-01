/* Declarative Kenniscentrum workspace. No network access, executable templates or finance access. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./memento-knowledge-core.js'):root.MementoKnowledgeCore);if(typeof module==='object'&&module.exports)module.exports=api;else root.MementoKnowledgeWorkspace=api;})(globalThis,C=>{
'use strict';
const clone=C.clone,record=x=>!!x&&typeof x==='object'&&!Array.isArray(x),safeKey=x=>typeof x==='string'&&!['__proto__','constructor','prototype'].includes(x);
function validateImage(f){if(!record(f)||!/^[a-z0-9-]{8,120}$/i.test(f.id)||!['image/png','image/jpeg','image/webp'].includes(f.type)||typeof f.name!=='string'||f.name.length>200||!Number.isSafeInteger(f.size)||f.size<=0||f.size>8*1024*1024||!/^[a-f0-9]{64}$/.test(f.hash))throw Error('Ongeldige eigen afbeelding');}
const presets=[
 {id:'blank',name:'Lege notitie',blocks:[{type:'text',text:''}]},
 {id:'recipe',name:'Recept',kind:'recipe',blocks:[{type:'heading',text:'Ingrediënten'},{type:'text',text:''},{type:'heading',text:'Bereiding'},{type:'text',text:''},{type:'heading',text:'Bewaren'},{type:'text',text:''}]},
 {id:'project',name:'Projectnotitie',blocks:[{type:'heading',text:'Doel'},{type:'text',text:''},{type:'heading',text:'Aantekeningen'},{type:'text',text:''},{type:'heading',text:'Volgende stap'},{type:'check',text:''}]},
 {id:'reflection',name:'Reflectie',blocks:[{type:'heading',text:'Wat ging goed?'},{type:'text',text:''},{type:'heading',text:'Wat wil ik onthouden?'},{type:'text',text:''}]}
];
function document(blocks){return {version:1,blocks:blocks.map(b=>({...clone(b),id:C.uid()}))};}
function migrate(life){
 if(life.knowledge?.workspace?.version===2){validate(life);return false;}
 if(life.knowledge?.workspace)throw Error('Onbekende werkruimteversie');
 const next=clone(life);C.ensure(next);C.migrateHierarchy(next);
 // Migration is additive: old Markdown, IDs, checklists and recipe fields are not converted.
 next.knowledge.workspace={version:2,templates:presets.map(t=>({...t,document:document(t.blocks)})),preferences:{},expanded:[],dashboards:{},background:null,updatedAt:C.timestamp()};
 validate(next);life.knowledge=next.knowledge;return true;
}
function workspace(life){const w=life.knowledge?.workspace;if(w?.version!==2)throw Error('Kenniscentrum V2 is nog niet veilig geactiveerd');return w;}
function validateTemplate(t){
 if(!t||typeof t.id!=='string'||!t.id||t.id.length>120||typeof t.name!=='string'||!t.name.trim()||t.name.length>80||t.kind!==undefined&&!['note','recipe'].includes(t.kind))throw Error('Ongeldig sjabloon');C.validateDocument(t.document);if(t.fields!==undefined&&(!Array.isArray(t.fields)||t.fields.length>30||new Set(t.fields.map(f=>f.key)).size!==t.fields.length||t.fields.some(f=>!record(f)||!safeKey(f.key)||!/^[a-z][a-z0-9_]{0,39}$/.test(f.key)||typeof f.label!=='string'||!f.label||f.label.length>80||!['text','number','date'].includes(f.type))))throw Error('Ongeldige sjabloonvelden');
 // Imported templates cannot smuggle arbitrary data, files, URLs or executable code.
 if(t.document.blocks.some(b=>['image','pdf'].includes(b.type)))throw Error('Sjabloonbestanden mogen geen apparaatgebonden bijlagen bevatten');return t;
}
function validate(life){
 C.validate(life);const w=life.knowledge.workspace;if(!w)return true;
 if(w.version!==2||!Array.isArray(w.templates)||w.templates.length>200||!record(w.preferences)||!record(w.dashboards)||!Array.isArray(w.expanded))throw Error('Ongeldige werkruimte');
 for(const t of w.templates)validateTemplate(t);if(new Set(w.templates.map(t=>t.id)).size!==w.templates.length)throw Error('Dubbel sjabloon');
 for(const [key,widgets] of Object.entries(w.dashboards)){if(key!=='overview'&&!life.knowledge.collections.some(c=>c.id===key))throw Error('Dashboardmap ontbreekt');if(!Array.isArray(widgets)||widgets.length>20)throw Error('Maximaal twintig widgets');for(const item of widgets)validateWidget(life,item);if(new Set(widgets.map(x=>x.id)).size!==widgets.length)throw Error('Dubbele widget');}
 if(w.background){if(!record(w.background)||!Number.isInteger(w.background.dim)||w.background.dim<55||w.background.dim>90||!Number.isInteger(w.background.focus)||w.background.focus<0||w.background.focus>100)throw Error('Ongeldige achtergrondinstellingen');validateImage(w.background.file);}
 for(const [id,p] of Object.entries(w.preferences)){if(!safeKey(id)||!record(p)||p.view!==undefined&&!['list','gallery','table'].includes(p.view)||p.sort!==undefined&&!['recent','title','old','manual'].includes(p.sort)||p.kind!==undefined&&!['',...C.validKind].includes(p.kind)||p.tag!==undefined&&typeof p.tag!=='string'||p.template!==undefined&&!w.templates.some(t=>t.id===p.template))throw Error('Ongeldige mapvoorkeuren');}
 for(const n of life.notes)if(n.properties!==undefined&&(!record(n.properties)||Object.entries(n.properties).some(([k,v])=>!safeKey(k)||typeof v!=='string'||v.length>2000)))throw Error('Ongeldige sjabloonwaarden');
 for(const id of w.expanded)if(typeof id!=='string')throw Error('Ongeldige uitklapstand');
 return true;
}
function setLocations(life,noteId,ids,primary){
 const n=life.notes.find(n=>n.id===noteId);if(!n)throw Error('Notitie ontbreekt');
 const valid=[...new Set(ids)].filter(id=>id==='inbox'||life.knowledge.collections.some(c=>c.id===id));
 if(!valid.length)valid.push('inbox');
 const next=valid.includes(primary)?primary:valid.includes(n.collectionId)?n.collectionId:valid.filter(id=>C.activeCollection(life,id)).sort()[0]||'inbox';
 if(!valid.includes(next))valid.push(next);return C.updateNote(life,noteId,{collectionId:next,collectionIds:valid});
}
function deletionPreview(life,id){
 if(!life.knowledge.collections.some(c=>c.id===id))throw Error('Map ontbreekt');
 const ids=C.descendants(life,id),notes=life.notes.filter(n=>C.memberships(life,n).some(x=>ids.has(x)));
 return {ids:[...ids],widgets:Object.values(life.knowledge.workspace?.dashboards||{}).flat().filter(w=>ids.has(w.collectionId)).map(w=>w.id),notes:notes.map(n=>({id:n.id,title:n.title,remaining:C.memberships(life,n).filter(x=>!ids.has(x))}))};
}
function deleteFolder(life,id){
 const p=deletionPreview(life,id),ids=new Set(p.ids);
 for(const x of p.notes){const n=life.notes.find(n=>n.id===x.id),remaining=x.remaining.length?x.remaining:['inbox'];let primary=remaining.includes(C.collectionOf(life,n))?C.collectionOf(life,n):remaining.filter(k=>C.activeCollection(life,k)).sort()[0]||'inbox';if(!remaining.includes(primary))remaining.push(primary);Object.assign(n,{collectionId:primary,collectionIds:remaining,category:C.collectionName(life,primary),revision:(n.revision||0)+1,updatedAt:C.timestamp()});}
 for(const widgets of Object.values(workspace(life).dashboards))for(const widget of widgets)if(ids.has(widget.collectionId)){widget.collectionId='';widget.granted=false;}
 life.knowledge.collections=life.knowledge.collections.filter(c=>!ids.has(c.id));const w=workspace(life);for(const key of ids){delete w.preferences[key];delete w.dashboards[key];}w.expanded=w.expanded.filter(x=>!ids.has(x));validate(life);return p;
}
function importTemplate(life,payload,replaceId=''){
 if(!payload||payload.format!=='memento-template'||payload.version!==1)throw Error('Onbekend sjabloonformaat');
 const raw=payload.template;if(!raw||!raw.document)throw Error('Sjabloon ontbreekt');
 const previous=replaceId?workspace(life).templates.find(t=>t.id===replaceId):null;if(replaceId&&!previous)throw Error('Bij te werken sjabloon ontbreekt');
 const clean={id:previous?.id||C.uid(),version:(previous?.version||0)+1,fields:clone(raw.fields||[]),name:String(raw.name||''),kind:raw.kind||'note',document:{version:1,blocks:raw.document.blocks?.map(b=>({id:C.uid(),type:b.type,text:b.text,marks:b.marks||[]}))}};
 validateTemplate(clean);const w=workspace(life);if(w.templates.length>=200)throw Error('Maximaal 200 sjablonen');if(previous)w.templates[w.templates.indexOf(previous)]=clean;else w.templates.push(clean);return clean;
}
function newFromTemplate(life,id,cid='inbox'){
 const t=workspace(life).templates.find(t=>t.id===id);if(!t)throw Error('Sjabloon ontbreekt');
 const n=C.makeNote({collectionId:cid,title:t.name,kind:t.kind||'note'},life);n.document=document(t.document.blocks);n.body=C.documentText(n.document);n.templateId=t.id;n.templateVersion=t.version||1;n.properties=Object.fromEntries((t.fields||[]).map(f=>[f.key,'']));return n;
}
function missingFields(life,noteId){const n=life.notes.find(n=>n.id===noteId),t=workspace(life).templates.find(t=>t.id===n?.templateId);return (t?.fields||[]).filter(f=>!Object.hasOwn(n.properties||{},f.key));}
function addTemplateFields(life,noteId){const n=life.notes.find(n=>n.id===noteId);if(!n)throw Error('Notitie ontbreekt');n.properties||={};for(const f of missingFields(life,noteId))n.properties[f.key]='';n.templateVersion=workspace(life).templates.find(t=>t.id===n.templateId)?.version||1;n.revision=(n.revision||0)+1;n.updatedAt=C.timestamp();}
function suggestions(life,n){
 const text=(n.title+' '+n.body).toLocaleLowerCase('nl'),existing=new Set(n.tags||[]),tags=new Set();
 for(const other of life.notes)for(const tag of other.tags||[])if(tag.length>=3&&text.includes(tag.toLocaleLowerCase('nl'))&&!existing.has(tag))tags.add(tag);
 for(const [re,tag] of [[/recept|ingrediënt|bereiding/,'recept'],[/wandelen|rust|slaap/,'welzijn'],[/project|volgende stap/,'project'],[/leren|uitleg|kennis/,'leren']])if(re.test(text)&&!existing.has(tag))tags.add(tag);
 return [...tags].slice(0,5);
}
function related(life,n){const words=new Set((n.title+' '+(n.tags||[]).join(' ')).toLocaleLowerCase('nl').split(/\W+/).filter(x=>x.length>3));return life.notes.filter(x=>x.id!==n.id&&!x.deletedAt&&!x.archived&&!n.links?.some(l=>l.kind==='note'&&l.id===x.id)).map(x=>({note:x,score:(x.title+' '+(x.tags||[]).join(' ')).toLocaleLowerCase('nl').split(/\W+/).filter(w=>words.has(w)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.note);}
function validateWidget(life,w){
 if(!w||typeof w.id!=='string'||!['recent','pinned','journal','image','collection','tasks','appointments','finance'].includes(w.type)||!['small','wide'].includes(w.size)||!['knowledge','tasks','appointments','finance'].includes(w.source))throw Error('Widgetbron of formaat niet toegestaan');
 if(w.source!=='knowledge'&&(w.source!==w.type||typeof w.granted!=='boolean'))throw Error('Ongeldige brontoestemming');
 if(w.collectionId&&w.collectionId!=='inbox'&&!life.knowledge.collections.some(c=>c.id===w.collectionId))throw Error('Widgetmap ontbreekt');
 if(w.type==='image'&&w.image)validateImage(w.image);if(w.focus!==undefined&&(!Number.isInteger(w.focus)||w.focus<0||w.focus>100)||w.caption!==undefined&&(typeof w.caption!=='string'||w.caption.length>300))throw Error('Ongeldige afbeeldinginstellingen');if(w.column!==undefined&&![1,2].includes(w.column)||w.row!==undefined&&(!Number.isInteger(w.row)||w.row<1||w.row>20))throw Error('Ongeldige widgetpositie');return true;
}
function widgets(life,context='overview'){const w=workspace(life);return w.dashboards[context]||[{id:'recent',type:'recent',size:'wide',source:'knowledge'}];}
function projectWidget(life,w,context='overview',finance=null){
 validateWidget(life,w);if(w.granted===false)return []; // Enforced projection: no finance/task/fitness fields are ever returned.
 if(w.source!=='knowledge'){if(!w.granted)return [];if(w.source==='finance'){if(!finance||!Array.isArray(finance.transactions))return [];return finance.transactions.filter(t=>!t.deletedAt).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,3).map(t=>({id:t.id,title:String(t.description||t.category||'Transactie'),date:t.date,amount:t.amount}));}return (life[w.source]||[]).filter(t=>!t.deletedAt&&!t.archived).slice(0,3).map(t=>({id:t.id,title:t.title,date:t.date}));}
 const cid=w.collectionId|| (context==='overview'?'':context);
 let ns=C.search(life,{collectionId:cid,status:w.type==='pinned'?'pinned':'active'});
 return ns.slice(0,Math.min(8,w.limit||3)).map(n=>({id:n.id,title:n.title,updatedAt:n.updatedAt,collectionId:C.collectionOf(life,n)}));
}
function fileReferences(life){const refs=new Map();for(const n of life.notes||[])for(const a of n.attachments||[])refs.set(a.id,a);for(const c of life.knowledge?.collections||[])if(c.coverFile?.id)refs.set(c.coverFile.id,c.coverFile);const w=life.knowledge?.workspace;if(w?.background?.file)refs.set(w.background.file.id,w.background.file);for(const widgets of Object.values(w?.dashboards||{}))for(const widget of widgets)if(widget.image?.id)refs.set(widget.image.id,widget.image);return refs;}
function projection(life){validate(life);return {notes:clone(life.notes),knowledge:clone(life.knowledge)};}
function replaceProjection(life,incoming){const next=clone(life);next.notes=clone(incoming.notes);next.knowledge=clone(incoming.knowledge);validate(next);for(const widgets of Object.values(next.knowledge.workspace?.dashboards||{}))for(const widget of widgets)if(widget.source!=='knowledge')widget.granted=false;life.notes=next.notes;life.knowledge=next.knowledge;}
return {missingFields,addTemplateFields,validateImage,presets,document,migrate,workspace,validate,validateTemplate,setLocations,deletionPreview,deleteFolder,importTemplate,newFromTemplate,suggestions,related,validateWidget,widgets,projectWidget,fileReferences,projection,replaceProjection};
});
