"use strict";
/* Fictional review data only. Never loaded by the application. */
const { tab, emptyLife, task, K, F, clone, sha256 } = require("./storage-fixture.cjs");
const at = "2026-10-27T08:30:00.000Z", today = "2026-10-27";
function pdf() {
  const text = "BT /F1 16 Tf 60 740 Td (Memento - fictieve testbijlage) Tj ET";
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>", `<< /Length ${text.length} >>\nstream\n${text}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let result = "%PDF-1.4\n", offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(result)); result += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`; }
  const start = Buffer.byteLength(result); result += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n => String(n).padStart(10, "0") + " 00000 n \n").join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return Buffer.from(result);
}
async function fixture() {
  const source = await tab(), finance = clone(source.fin.state); source.MementoStorageGuard.close();
  finance.createdAt = at; Object.assign(finance.settings, { salaryPeriodStart: "2026-10-24", monthlyIncomeTarget: 3200, accountOpening: { personal: 1250, joint: 450, creditcard: 0 }, actualBalances: { personal: "", joint: "", creditcard: "" } });
  const tx = (id, date, description, amount, category, extra = {}) => ({ id, date, description, merchant: "", amount, category, type: "expense", account: "personal", person: "Jari", createdAt: at, updatedAt: at, note: "Fictieve gegevens voor een visuele test", ...extra });
  finance.transactions = [
    tx("salary", "2026-10-24", "Salaris oktober", 3200, "Salaris", { type: "income", merchant: "Voorbeeld Werkgever" }),
    tx("market", today, "Boodschappen voor de hele week en het etentje op zaterdag", 67.84, "Boodschappen", { merchant: "De Buurtwinkel" }),
    tx("train", today, "Treinreis naar een afspraak", 14.2, "Auto & vervoer", { merchant: "Voorbeeld Vervoer" }),
    tx("coffee", "2026-10-26", "Koffie met Noor", 8.5, "Horeca & uit eten", { merchant: "Koffie aan het plein" }),
    tx("rent", "2026-10-01", "Huur oktober", 1120, "Vaste lasten", { billId: "rent", billOccurrenceDate: "2026-10-01" }),
    tx("books", "2026-10-25", "Een boek over fotografie en een notitieboek", 39.95, "Vrije tijd & entertainment"),
    tx("refund", "2026-10-23", "Terugbetaling retourzending", 24.5, "Winkelen & persoonlijke aankopen", { type: "refund" }),
    tx("joint", "2026-10-22", "Gezamenlijke boodschappen", 53.5, "Boodschappen", { account: "joint", person: "Daisy" })
  ];
  finance.budgetMonths = { "2026-10": { all: { total: 2000, categories: { "Boodschappen": 350, "Vaste lasten": 1400, "Horeca & uit eten": 120, "Vrije tijd & entertainment": 100 } }, personalBundle: { total: 1800, categories: { "Boodschappen": 300, "Vaste lasten": 1400 } } } };
  finance.bills = [{ id: "rent", name: "Huur", amount: 1120, category: "Vaste lasten", account: "personal", nextDate: "2026-10-01", frequency: "monthly", paidMonth: "" }, { id: "energy", name: "Energie & water", amount: 145, category: "Vaste lasten", nextDate: "2026-10-28", frequency: "monthly" }, { id: "gym", name: "Sportschool", amount: 29.95, category: "Gezondheid", nextDate: "2026-10-29", frequency: "monthly" }];
  finance.goals = [{ id: "buffer", name: "Een rustige buffer", target: 6000, saved: 2450, deadline: "2027-06-01", icon: "✚", contributions: [] }];
  finance.receipts = [{ id: "receipt-market", transactionId: "market", store: "De Buurtwinkel", date: today, total: 67.84, text: "Groente, fruit en boodschappen voor de komende week. Fictieve bon.", number: "TEST-001", createdAt: at, updatedAt: at, products: [] }];
  const life = emptyLife();
  life.tasks = [task("album", "De foto’s uitzoeken en een klein album maken voor het familie-weekend"), { ...task("kitchen", "Keuken opfrissen"), kind: "routine", repeat: "weekly", room: "Keuken", category: "Huishouden", date: today, steps: [{ text: "Aanrecht vrijmaken", done: true }, { text: "Keukenkastjes afnemen", done: false }] }, { ...task("appointment", "Afspraak voor de fiets bevestigen"), date: "2026-10-26", priority: true }, { ...task("walk", "Een halfuur naar buiten"), date: today }, { ...task("done", "Post en administratie bijwerken"), done: true, date: today }];
  life.tasks[0].date = today;
  const grocery = (id, title, quantity, category, extra = {}) => ({ id, title, quantity, category, list: "groceries", favorite: false, needed: true, bought: false, deletedAt: "", notes: "", ...extra });
  life.groceries = [grocery("apples", "Appels van de markt", "1 kg", "Groente & fruit", { favorite: true }), grocery("bread", "Volkorenbrood met zaden voor de komende dagen", "2 broden", "Brood"), grocery("oats", "Havermelk", "2 pakken", "Zuivel & plantaardig", { favorite: true }), grocery("tomato", "Tomaten", "500 g", "Groente & fruit", { bought: true }), grocery("lamp", "Een kleine bureaulamp met warm, dimbaar licht", "1", "Huis", { list: "purchases", budget: 85 })];
  life.wishes = [{ id: "headphones", title: "Comfortabele koptelefoon voor onderweg", url: "https://example.com/fictief", notes: "Rustig vergelijken: comfort en een vervangbare batterij zijn belangrijk.", status: "research", budget: 180, deletedAt: "" }, { id: "weekend", title: "Een weekend in een huisje aan het bos", url: "", notes: "Een plek om te wandelen en te lezen.", status: "idea", budget: 350, deletedAt: "" }];
  life.appointments = [{ id: "bike", title: "Fiets ophalen bij de werkplaats", date: today, time: "10:30", endTime: "11:00", allDay: false, location: "Het centrum", notes: "Fictieve afspraak", done: false, completedAt: "", createdAt: at }, { id: "noor", title: "Wandelen en bijpraten met Noor", date: today, time: "15:30", endTime: "16:30", allDay: false, location: "Het park", notes: "", done: false, completedAt: "", createdAt: at }];
  K.ensure(life);
  const note = K.makeNote({ title: "Ruimte voor een rustige week", body: "# Minder moeten, meer aandacht\n\nDeze week wil ik ruimte houden voor wat belangrijk is.\n\n- Elke dag even naar buiten\n- Tijd om een goed boek te lezen\n- Eén kleine stap voor het fotoproject\n\n> Een rustig ritme begint met één bewuste keuze.", collectionId: "projects" }, life);
  note.id = "visual-note"; note.tags = ["Rust", "Weekplanning"]; note.pinned = true;
  const check = K.makeNote({ title: "Voor de wandeling", body: "Waterfles vullen\nRegenjas meenemen\nRoute bewaren", kind: "checklist", collectionId: "home" }, life); check.id = "visual-checklist"; check.items[0].done = true;
  const recipe = K.makeNote({ title: "Ovenaardappels met citroen & tijm", body: "Verwarm de oven voor op 200 °C. Meng alles en rooster in 35 minuten goudbruin.", kind: "recipe", collectionId: "recipes" }, life); recipe.id = "visual-recipe"; recipe.recipe = { status: "definitief", version: 2, rating: 4, notes: "Lekker met een frisse salade.", ingredients: [{ name: "Aardappels", amount: "600", unit: "g" }, { name: "Citroen", amount: "1", unit: "stuk" }, { name: "Tijm", amount: "2", unit: "takjes" }] };
  const document = K.makeNote({ title: "Notities voor het weekend", body: "Praktische informatie op één plek, ook zonder internet.", collectionId: "documents" }, life); document.id = "visual-document";
  const bytes = pdf(), blob = new Blob([bytes], { type: "application/pdf" });
  const file = { id: "11111111-1111-4111-8111-111111111111", noteId: document.id, name: "Notities voor het weekend.pdf", size: bytes.length, type: "application/pdf", hash: await sha256(blob), createdAt: at }; document.attachments = [file];
  life.notes = [note, check, recipe, document]; life.notes.forEach(n => { n.createdAt = at; n.updatedAt = at; });
  life.fitness.routines = F.starter(); life.fitness.routineCycle = life.fitness.routines.map(r => r.id); life.fitness.setup = true; life.fitness.profile.goal = "muscle"; life.fitness.profile.target = 4;
  for (let i = 0; i < 2; i++) { F.start(life.fitness, life.fitness.routines[i].id, 45); life.fitness.active.exercises.forEach(e => e.logs.forEach(l => Object.assign(l, { done: true, weight: 25 + i * 2.5, reps: 10, rir: 2 }))); F.finish(life.fitness); life.fitness.sessions.at(-1).date = "2026-10-" + (22 + i * 2); }
  F.start(life.fitness, life.fitness.routines[0].id, 45); life.fitness.active.date = today; life.fitness.active.exercises[0].logs[0] = { ...life.fitness.active.exercises[0].logs[0], done: true, weight: 27.5, reps: 10, rir: 2 };
  life.fitness.measurements = [{ id: "measurement-1", date: "2026-10-20", weight: 70.2, waist: null }, { id: "measurement-2", date: today, weight: 70.4, waist: null }];
  source.life.validate(clone(life)); K.validate(life); F.validate(life.fitness);
  return { finance, life, files: [{ ...file, base64: bytes.toString("base64") }], pin: { salt: "memento-visual-fixture", hash: require("node:crypto").createHash("sha256").update("memento-visual-fixture:123456").digest("hex"), version: 1 } };
}
if (require.main === module) fixture().then(f => process.stdout.write(JSON.stringify(f))).catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { fixture };
