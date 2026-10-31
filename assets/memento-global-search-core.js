/* Memento global search: read-only index over canonical in-memory stores. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MementoGlobalSearchCore = api;
})(typeof window === 'object' ? window : globalThis, () => {
  'use strict';
  const str = v => v == null ? '' : String(v);
  const normalize = v => str(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('nl-NL').trim();
  const text = (...parts) => parts.flat(Infinity).filter(x => x != null && typeof x !== 'object').map(str).join(' ');
  const label = (v, fallback) => str(v).trim() || fallback;
  function build(life = {}, finance = {}) {
    const rows = [];
    const put = (kind, id, title, description, date, area, view, extra = {}) => {
      if (id == null || extra.deletedAt || extra.trash) return;
      rows.push({ kind, id: str(id), title: label(title, 'Zonder titel'),
        description: text(description).slice(0, 12000), date: str(date || ''),
        area, view, status: str(extra.status || ''), source: str(extra.source || '') });
    };
    const active = x => x && !x.deletedAt;
    for (const t of life.tasks || []) if (active(t)) put('tasks', t.id, t.title, [t.notes, t.category, t.room, (t.steps || []).map(s => s.text)], t.date || t.focusDate, 'life', 'tasks', { status: t.archived ? 'Archief' : t.done ? 'Afgerond' : 'Open' });
    for (const a of life.appointments || []) if (active(a)) put('appointments', a.id, a.title, [a.notes, a.location], a.date, 'life', 'agenda', { status: a.done ? 'Afgerond' : 'Afspraak' });
    for (const a of life.googleAppointments || []) if (active(a)) put('appointments', a.id, a.summary, [a.description, a.location], a.start?.date || a.start?.dateTime, 'life', 'agenda', { source: 'google' });
    for (const n of life.notes || []) if (active(n)) put('notes', n.id, n.title, [n.body, n.category, n.kind, n.tags, n.recipe?.ingredients?.map(i => text(i.name, i.amount, i.unit)), n.items?.map(i => i.text)], n.journal?.date || n.updatedAt || n.createdAt, 'life', 'notes', { status: n.archived ? 'Archief' : n.journal ? 'Dagboek' : n.kind === 'recipe' ? 'Recept' : 'Notitie' });
    for (const g of life.groceries || []) if (active(g)) put('groceries', g.id, g.title, [g.notes, g.quantity, g.category, g.list, g.researchSummary], g.date || g.updatedAt, 'life', 'groceries', { status: g.bought ? 'Gekocht' : 'Product' });
    for (const w of life.wishes || []) if (active(w)) put('wishes', w.id, w.title, [w.notes, w.url, w.status], w.updatedAt || w.createdAt, 'life', 'wishes');
    for (const t of life.templates || []) if (active(t)) put('templates', t.id, t.title, [t.notes, t.category, (t.steps || []).map(s => s.text)], t.updatedAt, 'life', 'tasks');
    const fitness = life.fitness || {};
    for (const r of fitness.routines || []) if (active(r)) put('fitness', r.id, r.name || r.title, [r.notes, r.description, r.exercises?.map(e => text(e.name, e.notes))], r.updatedAt, 'life', 'fitness', { status: 'Trainingsschema' });
    for (const s of fitness.sessions || []) if (active(s)) put('fitness', s.id, s.name || s.title || 'Training', [s.notes, s.exercises?.map(e => text(e.name, e.notes))], s.date || s.startedAt, 'life', 'fitness', { status: 'Training' });
    for (const b of fitness.bookings || []) if (active(b)) put('fitness', b.id, b.title || b.name || 'Geplande training', [b.notes, b.location], b.date, 'life', 'fitness', { status: 'Gepland' });
    for (const m of fitness.measurements || []) if (active(m)) put('fitness', m.id, 'Lichaamsmeting', [m.note, m.notes, m.weight, m.waist], m.date, 'life', 'fitness');
    for (const t of finance.transactions || []) if (active(t)) put('transactions', t.id, t.description || t.merchant, [t.merchant, t.category, t.subcategory, t.note, t.notes, t.person, t.account, t.type, t.amount, (t.splits || []).map(s => text(s.category, s.subcategory, s.description))], t.date, 'finance', 'transactions', { status: t.type === 'income' ? 'Inkomst' : t.type === 'transfer' ? 'Overboeking' : 'Uitgave' });
    for (const r of finance.receipts || []) if (active(r)) put('receipts', r.id, r.store || r.winkel, [r.text, r.number, r.total, r.structured?.producten?.map(p => p.naam), r.notes], r.date, 'finance', 'receipts', { status: 'Bon' });
    for (const b of finance.bills || []) if (active(b)) put('bills', b.id, b.name, [b.note, b.category, b.amount, b.frequency], b.nextDate, 'finance', 'planning', { status: 'Vaste last' });
    for (const g of finance.goals || []) if (active(g)) put('goals', g.id, g.name, [g.note, g.target, g.saved], g.deadline, 'finance', 'planning', { status: 'Spaardoel' });
    for (const r of finance.research || []) if (active(r)) put('research', r.id, r.title || r.name || r.productName, [r.notes, r.summary, r.product, r.brand, r.category, r.result], r.updatedAt || r.createdAt, 'finance', 'smartbuy', { status: 'Onderzoek' });
    for (const [name, value] of Object.entries(finance.budgets || {})) {
      if (value && typeof value === 'object') continue;
      put('budgets', name, name, text('Budget', value), '', 'finance', 'budgets');
    }
    for (const c of finance.categories || []) if (c?.name) put('categories', c.name, c.name, c.subcategories || [], '', 'finance', 'transactions', { status: 'Categorie' });
    return rows;
  }
  function rank(row, q) {
    const title = normalize(row.title), description = normalize(row.description);
    if (title === q) return 100;
    if (title.startsWith(q)) return 80;
    if (title.includes(q)) return 60;
    if (description.includes(q)) return 20;
    return 0;
  }
  function search(rows, query = '', scope = 'all', limit = 100) {
    const q = normalize(query).slice(0, 120);
    const filtered = rows.filter(r => {
      if (scope === 'finance') return r.area === 'finance';
      if (scope === 'life') return r.area === 'life';
      return scope === 'all' || r.kind === scope;
    });
    return filtered.map(r => ({ row: r, score: q ? rank(r, q) : 1 }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || str(b.row.date).localeCompare(str(a.row.date)) || a.row.title.localeCompare(b.row.title, 'nl'))
      .slice(0, Math.max(0, limit)).map(x => x.row);
  }
  return { build, search, normalize };
});