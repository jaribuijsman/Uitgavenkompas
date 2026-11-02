// Supplemental reproduction; requires the pinned baseline commit in Git history.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const old=cp.execFileSync('git',['show','5a8b4a34fd88a64c8bdbb88efd0df4fbe519ee8f:assets/memento-finance-app.js'],{encoding:'utf8'}),start=old.indexOf(" const custom=view==='transactions'",old.indexOf('function financeContext(view){')),source=old.slice(start,old.indexOf('\n}',start));
const p=require(process.cwd()+'/assets/memento-finance-presentation.js'),formatDate=s=>s?'datum '+s:'—';let count=0;
for(const view of ['dashboard','transactions','analysis','budgets','moneycoach','accounts'])for(const mode of ['salary','month'])for(const scope of ['personal','joint'])for(const custom of [false,true])for(const q of ['','<img src=x> & vrije tekst'])for(const extra of [[],['Uitgave','Boodschappen']]){
 const from='2026-10-25',to='2026-10-27',account='Voorbeeldrekening',line={textContent:''};const document={getElementById:id=>{if(id==='txFrom')return {value:custom?from:''};if(id==='txTo')return {value:''};if(id==='txSearch')return {value:q};return {value:extra.length?'expense':'all',selectedOptions:[{textContent:extra[id==='txTypeFilter'?0:1]}]}}};
 const sandbox={view,dashboardPeriodMode:mode,dashboardScope:scope,from,to,account,line,document,formatDate};vm.runInNewContext(source,sandbox);
 const picked=view==='transactions'?['txTypeFilter','txCategoryFilter','txSubcategoryFilter','txPersonFilter'].map(id=>document.getElementById(id)).filter(el=>el.value!=='all').map(el=>el.selectedOptions[0]?.textContent).filter(Boolean):[];
 const input={view,mode,scope,from,to,account,custom:view==='transactions'&&custom,extra:picked,query:view==='transactions'?q:''},before=JSON.stringify(input);assert.equal(p.periodContext(input,formatDate),line.textContent);assert.equal(JSON.stringify(input),before);count++;
}
console.log('PASS differential Finance context: '+count+' old/new view/period/account/custom/filter/query cases with exact text and no mutations');
