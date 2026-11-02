const assert=require('node:assert/strict'),p=require('../assets/memento-finance-period-core.js');
const dates=['2026-09-25','2026-10-24','2026-11-25'],r=p.range({mode:'salary',key:'2026-10',payday:25,dates,today:'2026-11-01'});
assert.equal(r.start,'2026-10-24');assert.equal(r.end,'2026-11-24');assert.equal(r.observedEnd,'2026-11-01');assert.equal(r.status,'confirmed');
assert.equal(p.range({mode:'salary',key:'2026-09',payday:25,dates,today:'2026-11-01'}).end,'2026-10-23');
assert.equal(p.currentSalaryKey({payday:25,dates,today:'2026-11-01'}),'2026-10');
assert.equal(p.range({mode:'salary',key:'2027-02',payday:31,dates:[],today:'2027-02-20'}).start,'2027-02-28');
assert.equal(p.range({mode:'salary',key:'2026-10',payday:25,dates:[],today:'2026-11-01'}).status,'provisional');
assert.equal(p.range({mode:'month',key:'2026-10',today:'2026-11-01'}).end,'2026-10-31');
assert.equal(p.valid('2026-02-30'),false);
console.log('salary period core: PASS');

// Visible period/filter labels share the same pure interface as the live Finance views.
const presentation=require('../assets/memento-finance-presentation.js');
const date=s=>s,context=Object.freeze({view:'dashboard',mode:'salary',scope:'personal',from:'2026-10-25',to:'2026-11-01',account:'Persoonlijk + creditcard',custom:false,extra:Object.freeze([]),query:''});
assert.equal(presentation.periodContext(context,date),'Loonperiode · 2026-10-25 t/m 2026-11-01 · Persoonlijk + creditcard');
assert.equal(presentation.periodContext({...context,mode:'month'},date),'Kalenderperiode · 2026-10-25 t/m 2026-11-01 · Persoonlijk + creditcard');
for(const view of ['analysis','budgets','moneycoach','accounts']){
 const label=presentation.periodContext({...context,view},date);assert(label.endsWith(' · Eigen filters (dashboard heeft een loonperiode)'));
 assert(!presentation.periodContext({...context,view,scope:'joint'},date).includes('(dashboard heeft een loonperiode)'));
}
const filtered=Object.freeze({...context,view:'transactions',mode:'month',custom:'2026-10-25',extra:Object.freeze(['Uitgave','Boodschappen']),query:'<fictieve zoekterm> & tekst'}),before=JSON.stringify(filtered);
assert.equal(presentation.periodContext(filtered,date),'Eigen datumbereik · 2026-10-25 t/m 2026-11-01 · Persoonlijk + creditcard · Uitgave · Boodschappen · Zoekterm: <fictieve zoekterm> & tekst');
assert.equal(JSON.stringify(filtered),before);
assert(presentation.periodContext({...context,view:'transactions',extra:[],query:''},date).endsWith(' · Eigen filters (dashboard heeft een loonperiode)'));
console.log('PASS pure Finance period labels: scope, calendar/salary/custom ranges, exact filters/search text and immutable input');
