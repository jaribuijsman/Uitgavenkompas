(()=>{'use strict';
 const $=s=>document.querySelector(s);
 function fold(el,title){if(!el||el.parentElement?.classList.contains('memento-disclosure'))return;const d=document.createElement('details');d.className='memento-disclosure';const summary=document.createElement('summary');summary.textContent=title;el.before(d);d.append(summary,el);return d;}
 // Move existing nodes, preserving form IDs, listeners and calculations.
 const periods=$('#accountPeriodBreakdown')?.closest('.card'),accounts=$('#accountCards');
 if(periods&&accounts){accounts.after(periods);fold(periods,'Inkomsten en uitgaven per rekening');}
 for(const id of ['accountReconciliation','monthCloseSubtitle'])fold($('#'+id)?.closest('.card'),id==='accountReconciliation'?'Saldo controleren':'Maandafsluiting');
 const planning=$('#view-planning');if(planning){const calc=[...planning.children].find(e=>e.classList.contains('section-row')&&e.textContent.includes('Wat-als-calculator'));if(calc&&calc.nextElementSibling){fold(calc.nextElementSibling,'Wat-als-calculator — bekijk een scenario');calc.hidden=true;}}
 for(const area of ['smartbuy','moneycoach']){const intro=$('#view-'+area+' .'+area+'-intro');fold(intro,area==='smartbuy'?'Hoe werkt Slim Kopen?':'Hoe werkt de Geldcoach?');}
 fold($('.smartbuy-guide'),'Onderzoeksaanpak & toelichting');
 // Data preview remains open: it is important to see what is shared with the coach.
 for(const card of document.querySelectorAll('#view-settings .settings-card')){const title=card.querySelector('h3')?.textContent;if(['Categorieën','Privacy & betrouwbaarheid'].includes(title))fold(card,title);}
 const budget=$('#view-budgets .two-col');if(budget){budget.classList.add('memento-budget-list');const total=[...budget.children].find(e=>e.textContent.includes('Totaalbudget instellen'));if(total){budget.prepend(total);total.classList.add('memento-budget-total');}}
 const receiptGuide=$('#view-receipts .report-highlight');if(receiptGuide&&receiptGuide.textContent.includes('Werkwijze'))fold(receiptGuide,'Werkwijze voor het verwerken van een bon');
 document.addEventListener('change',e=>{if(!e.target.matches('#lifeRoomFilter,#lifeRepeatFilter,#lifeCategoryFilter'))return;const d=e.target.closest('.memento-filter-drawer');if(d){const n=[...d.querySelectorAll('select')].filter(s=>s.value!=='all').length;d.querySelector('summary').textContent=n?'Filters · '+n+' actief':'Filters';}});
})();
