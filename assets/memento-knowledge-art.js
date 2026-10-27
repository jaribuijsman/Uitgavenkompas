/* Memento collection art: self-contained, deterministic, offline. No image API or personal data. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.MementoKnowledgeArt=api;})(globalThis,()=>{
"use strict";
const names=[
["dagboek","Dagboek · maanmeer","journal dagboek schrijven herinneringen diary","cabin",0],
["reflecties","Reflecties · lantaarnboom","reflectie inzicht mindfulness gevoelens gedachten","lantern",1],
["leren","Leren · bosbibliotheek","leren boek studie ontwikkeling kennis lezen","books",2],
["reizen","Reizen · bergpas","reis vakantie buitenland avontuur route","mountain",3],
["naslag","Naslag · oude kaarten","naslag document informatie gids archief","map",4],
["huis","Thuis · boshuis","huis wonen verhuizing kamer interieur","cabin",5],
["apparaten","Apparaten · werkbank","apparaten elektronica telefoon computer tv handleiding","device",6],
["onderhoud","Onderhoud · gereedschap","onderhoud reparatie klussen werkplaats gereedschap","tools",7],
["woning","Woning · vensterlicht","woning inrichting meubels decoratie","window",8],
["huisdieren","Huisdieren · bospad","huisdier kat hond dier","pet",9],
["recepten","Recepten · vuurplaats","recept eten keuken koken maaltijd","pot",10],
["koken","Koken · buitenkeuken","koken maaltijd eten voedsel","pot",11],
["dranken","Dranken · kruidentafel","drank cocktail thee koffie drinken","drink",12],
["zelfmaken","Zelf maken · alchemietafel","zelf maken diy mengen experiment creatie","flask",13],
["projecten","Projecten · houten brug","project plan uitvoering bouwen initiatief","bridge",14],
["dossiers","Dossiers · onderzoekshut","dossier dossiermap document mappen","folders",15],
["producten","Productonderzoek · marktkraam","product koop vergelijking onderzoek winkel","package",16],
["bronnen","Bronnen · sterrenobservatorium","bron artikel onderzoek informatie zoeken","telescope",17],
["ideeen","Ideeën · vuurvliegjes","idee inspiratie creativiteit gedachte","bulb",18],
["inspiratie","Inspiratie · bloemenweide","inspiratie visueel moodboard plaatjes","flowers",19],
["later","Later lezen · leesbank","later bekijken bookmark bewaren leeslijst","books",20],
["financien","Geld · oud telhuis","financien budget sparen kosten geld","coins",21],
["fitness","Fitness · trainingspad","fitness trainen sport training kracht","dumbbell",22],
["muziek","Muziek · kampvuur","muziek luisteren instrument gitaar","notes",23],
["gezondheid","Gezondheid · kruidenhut","gezondheid welzijn slaap herstel","herbs",24],
["natuur","Natuur · ochtendmist","natuur buiten bos wandeling planten","forest",25],
["fotografie","Foto's · bosuitzicht","foto camera fotografie galerij","camera",26],
["werk","Werk · boswerkplaats","werk beroep kantoor bedrijf taken","tools",27],
["plannen","Planning · wegwijzer","planning agenda afspraken doelen","sign",28],
["vrij","Vrije tijd · sterrenhemel","vrij ontspanning hobby plezier games","stars",29]
];
const SCENES=names.map(([id,title,keywords,motif,seed])=>Object.freeze({id,title,keywords,motif,seed}));
const ids=new Set(SCENES.map(s=>s.id));const memo=new Map();
function valid(id){return typeof id==="string"&&ids.has(id);}
function choose(name="",icon="",parent=""){
 const joined=(String(name)+" "+String(parent)).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 const synonyms={journal:"dagboek",heart:"reflecties","book-open":"leren",travel:"reizen",document:"naslag",house:"huis",devices:"apparaten",tools:"onderhoud",pet:"huisdieren",recipe:"recepten",drink:"dranken",leaf:"natuur","folder-kanban":"projecten",search:"bronnen",lightbulb:"ideeen",camera:"fotografie",fitness:"fitness"};
 const tokens=joined.split(/[^a-z0-9]+/).filter(x=>x.length>2);
 let best=null,score=0;
 for(const scene of SCENES){let match=0;const words=scene.keywords.split(" ");for(const token of tokens){if(words.includes(token))match+=5;else if(words.some(w=>w.length>4&&(w.startsWith(token)||token.startsWith(w))))match+=2;}if(scene.id===joined.trim())match+=12;if(match>score){score=match;best=scene.id;}}
 if(score>0)return best;
 return synonyms[icon]&&ids.has(synonyms[icon])?synonyms[icon]:"natuur";
}
function rand(seed){let x=(seed+45681)>>>0;return()=>{x=(Math.imul(1664525,x)+1013904223)>>>0;return x/4294967296;};}
function pixels(x,y,w,h,color){return '<rect x="'+Math.round(x)+'" y="'+Math.round(y)+'" width="'+Math.round(w)+'" height="'+Math.round(h)+'" fill="'+color+'"/>';}
function sceneSVG(id){
 const cfg=SCENES.find(s=>s.id===id)||SCENES[25],r=rand(cfg.seed*173+17);
 const palettes=[
 ["#101f2c","#6a6672","#ecb278","#0f3938","#214d45","#35644e","#fbc57d"],
 ["#071d1c","#234e43","#8b775a","#0e352b","#245441","#3c6447","#ffbd6d"],
 ["#142322","#687c76","#d3b998","#103b34","#2b5c49","#557154","#f5d19c"],
 ["#142330","#526e7b","#b4a489","#143b43","#235456","#47766a","#e8c391"],
 ["#1d202b","#6c5c71","#bc846c","#263e42","#365f55","#6c7954","#ffd48a"],
 ["#0d1d23","#43605f","#d4a276","#173b37","#385e47","#6b7d5c","#efb965"]
 ];
 const p=palettes[cfg.seed%palettes.length];
 let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 280" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">'+
 '<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".7" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient>'+
 '<linearGradient id="lake" x2="0" y2="1"><stop stop-color="'+p[3]+'"/><stop offset="1" stop-color="'+p[0]+'"/></linearGradient></defs>'+
 '<path fill="url(#sky)" d="M0 0h900v280H0z"/>';
 const sunX=710+Math.floor(r()*120),sunY=40+Math.floor(r()*35);
 s+=pixels(sunX,sunY,38,31,p[6])+pixels(sunX+7,sunY-6,24,43,p[6])+pixels(sunX-6,sunY+7,50,18,p[6]);
 for(let i=0;i<35;i++){const x=Math.floor(r()*900),y=Math.floor(r()*120);s+=pixels(x,y,2+r()*3,2+r()*3,i%3===0?p[6]:"#d4c6a5");}
 const mountains=[];for(let j=0;j<10;j++){const x=j*115-120,top=95+r()*58;mountains.push(x+","+(205),(x+35)+","+(top+32),(x+59)+","+top,(x+73)+","+(top+22),(x+122)+",205");}
 s+='<path fill="'+p[3]+'" d="M0 202L'+mountains.join(" ")+'L900 280H0z"/>';
 s+='<path fill="url(#lake)" d="M0 220h900v60H0z"/>';
 for(let i=0;i<26;i++){const x=140+r()*760,y=220+r()*53;s+=pixels(x,y,7+r()*45,2,r()>0.6?p[6]:p[4]);}
 for(let layer=0;layer<3;layer++){
  const count=layer===0?17:layer===1?12:8;
  for(let i=0;i<count;i++){
   const x=390+r()*560,base=213+layer*20+r()*25,h=50+r()*58+layer*9,w=10+layer*5+r()*7;
   s+=pixels(x-2,base-h/3,5,h/3+5,"#1a2c25");
   for(let a=0;a<4;a++){s+=pixels(x-w*(1-a*.13),base-h+a*h*.18,w*2*(1-a*.13),h*.14,a%2?p[4]:p[3]);}
  }
 }
 // Floating fireflies and undergrowth.
 for(let i=0;i<38;i++){const x=520+r()*370,y=165+r()*110;if(i%4===0)s+=pixels(x,y,2,2,p[6]);else s+=pixels(x,y,4+r()*13,3+r()*6,i%3?p[4]:p[5]);}
 const motif=cfg.motif,cx=726,cy=189;
 const gold=p[6],wood="#563d2b",woodlight="#96714b",dark=p[0];
 const R=(x,y,w,h,c)=>pixels(cx+x,cy+y,w,h,c);
 const stack=(blocks)=>blocks.map(q=>R(...q)).join("");
 if(motif==="cabin"||motif==="window"){
  s+=stack([[-58,2,118,62,wood],[-67,-10,136,14,dark],[-48,-19,96,14,wood],[-32,15,35,34,gold],[13,17,30,30,gold],[-27,20,5,26,wood],[22,20,5,26,wood],[-54,52,112,5,woodlight]]);
 }else if(["books","folders"].includes(motif)){
  for(let i=0;i<5;i++){let yy=45-i*17,ww=104-i*7;s+=R(-52,yy,ww,13,i%2?woodlight:dark)+R(-48,yy+2,ww-8,8,i%2?gold:p[5]);}
  s+=R(-62,-27,8,105,wood)+R(60,-27,8,105,wood);
 }else if(motif==="mountain"||motif==="forest"){
  s+='<path d="M645 210l65-105 25 39 35-65 104 145Z" fill="'+p[5]+'"/><path d="M710 105l25 39 35-65 35 53-37-17-32 39-14-19Z" fill="#c3cbaf"/>';
 }else if(["map","sign","telescope"].includes(motif)){
  s+=stack([[-57,-30,120,77,wood],[-49,-23,104,61,"#b19b6e"],[-33,-8,36,7,wood],[-19,8,58,5,p[5]],[-5,-17,7,60,wood],[0,-4,42,5,wood]]);
 }else if(["lantern","bulb","stars"].includes(motif)){
  s+=stack([[-26,-43,53,14,wood],[-21,-28,44,68,wood],[-16,-23,34,51,gold],[-5,-42,12,7,wood],[-14,31,31,8,woodlight]]);
  for(let i=0;i<10;i++){const x=r()*110-60,y=r()*85-25;s+=R(x,y,3,3,gold);}
 }else if(["pet","flowers","herbs"].includes(motif)){
  s+=stack([[-38,6,76,45,p[4]],[-46,-7,15,26,p[5]],[31,-7,15,26,p[5]],[-20,17,6,6,gold],[12,17,6,6,gold],[-7,30,16,5,wood]]);
 }else if(["pot","drink","flask"].includes(motif)){
  s+=stack([[-38,7,78,49,woodlight],[-30,-22,61,34,"#6c926d"],[-19,-35,42,16,gold],[-52,13,13,25,gold],[43,13,13,25,gold]]);
 }else if(["device","camera"].includes(motif)){
  s+=stack([[-48,-18,98,74,wood],[-39,-10,80,51,p[5]],[-14,4,27,27,gold],[-23,47,46,7,dark]]);
 }else if(["bridge","tools","dumbbell"].includes(motif)){
  s+=stack([[-73,25,155,12,woodlight],[-65,14,10,60,wood],[-11,14,10,60,wood],[56,14,10,60,wood],[-62,10,120,6,gold]]);
 }else{
  s+=stack([[-48,-27,96,84,wood],[-42,-21,84,72,woodlight],[-22,-12,44,47,gold]]);
 }
 s+='<path fill="'+p[3]+'" opacity=".18" d="M0 255h900v25H0z"/>';
 s+='</svg>';return s;
}
function url(id){const key=valid(id)?id:"natuur";if(!memo.has(key))memo.set(key,"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(sceneSVG(key)));return memo.get(key);}
function prompt({name="",parent="",scene="",variant=0}={}){
 const selected=SCENES.find(s=>s.id===scene)||SCENES.find(s=>s.id===choose(name))||SCENES[25];
 const variants=[
 "zacht avondlicht en warme lantaarns","ochtendmist met zonnestralen","maanlicht en een stille vijver",
 "herfstkleuren en gouden bladeren","winterse stilte met lichte sneeuw","regenachtige schemering met weerspiegelingen"
 ];
 return [
 "Maak ÉÉN originele, losse horizontale pixel-artachtergrond voor een kaart in de persoonlijke webapp Memento.",
 "Categorie: "+String(name).slice(0,80)+(parent?" (onder "+String(parent).slice(0,80)+")":"")+".",
 "Beeldrichting: "+selected.title+". Thema: "+selected.keywords.split(" ").slice(0,5).join(", ")+".",
 "Sfeer: "+variants[((Number(variant)||0)%variants.length+variants.length)%variants.length]+".",
 "Compositie: extra breed 3:1 landschap (bijvoorbeeld 1536 × 512 pixels), een interessant gedetailleerd onderwerp in de RECHTER HELFT, links voornamelijk een rustig donker bosgedeelte dat vrij blijft voor een titel en subtitel.",
 "Visuele stijl: hoogwaardige handgetekende 2D pixel art zoals een verfijnde indiegame; scherpe zichtbare pixels, meerdere boslagen, diepgroen, salie, teal, warme amberaccenten en filmisch licht. Rijke kleine omgevingsdetails, geen rommel.",
 "BELANGRIJK: de afbeelding zelf bevat GEEN tekst, letters, nummers, logo's, kaartenranden, UI-elementen of watermerken. Geen telefoonmockup en geen screenshot. Lever alleen de illustratie zelf, geen toelichting.",
 "Zorg dat links de achtergrond donker genoeg is voor wit geschreven UI-tekst en dat het onderwerp na uitsnijden tot een 3:1-banner volledig herkenbaar blijft."
 ].join("\n");
}
return Object.freeze({SCENES,valid,choose,sceneSVG,url,prompt});
});
