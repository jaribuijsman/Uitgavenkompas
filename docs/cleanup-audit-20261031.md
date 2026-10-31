# Memento — technische cleanup-inventarisatie (31 oktober 2026)

> Status: verkennende audit + één geïsoleerde correctie in concept-PR. **Geen claim dat de volledige applicatie al opgeschoond is.** Alleen de genoemde bevindingen zijn geverifieerd tegen de huidige GitHub-branch.

## Uitgangspunt

- Repository: `jaribuijsman/Uitgavenkompas`.
- Gecontroleerde `main`-commit vóór deze PR: `54fee3f6739c63225aa6e834537bfd42260691cf`.
- De bestaande app is local-first. Persoonlijke gegevens zitten primair in browseropslag; broncode-/testwijzigingen mogen keys, ids, opslagformaten, PIN, back-ups en herstelpaden niet onbedoeld veranderen.
- Projectafspraken en testniveaus: `AGENTS.md`; centrale GitHub CI: `.github/workflows/app-review.yml`.

## Bevestigde bevindingen

### 1. Archief- en prullenbakzoekfilters in Kenniscentrum (verholpen in deze PR)

**Bestand:** `assets/memento-knowledge-core.js`, functie `search()`.

De `archive`- en `trash`-paden retourneerden direct een booleaanse statusmatch. Daardoor werden onderliggende query-, verzamelings-, type- en tagfilters bij die statussen nooit toegepast. De correctie behoudt de statusselectie en voert de overige filters daarna altijd uit. `tests/knowledge-regression.cjs` bevat nieuwe regressiedekking. De versieparameter in `index.html` en de precache in `sw.js` zijn gelijkgetrokken.

### 2. Grote inline-monoliet

**Bestand:** `index.html`.

Op de gecontroleerde `main`:
- circa 674.023 tekens, 4.295 regels;
- 28 inline `<style>`-blokken, samen circa 210.620 tekens;
- 13 inline `<script>`-blokken, samen circa 403.529 tekens;
- daarnaast 25 externe scriptverwijzingen en 11 stylesheetverwijzingen.

**Risico:** hoge cognitieve complexiteit, onverwachte CSS-cascade en moeilijker geïsoleerd testen. **Niet zonder gedragstests naar modules verplaatsen:** inline initialisatievolgorde, globals, service-worker-cache en opslag zijn onderling afhankelijk. Eerst eigenaren en runtimecontracten documenteren.

### 3. Overlappende CSS-regels

Verkennende telling met een eenvoudige selector-parser (niet hetzelfde als aantoonbaar conflicterende cascade):
- `assets/memento-ui.css`: 245 CSS-regels; 23 selectors meerdere keren; 38 `!important`;
- `assets/memento-glass.css`: 155 regels; 8 selectors meerdere keren; 118 `!important`;
- `assets/memento-layout.css`: 169 regels; 10 selectors meerdere keren; 108 `!important`;
- `assets/memento-knowledge.css`: 376 regels; 28 selectors meerdere keren; 17 `!important`;
- `assets/memento-start.css`: 114 regels; 19 selectors meerdere keren; 10 `!important`.

Deze telling omvat bewust herhaalde selectors in mediaqueries en is **geen bugtelling**. Verwijder alleen bewezen overbodige of conflicterende definities, na vergelijking van de uiteindelijke computed styles voor onder meer 360/393/412 px.

### 4. Bestaande rode CI op `main` (nog niet verholpen)

De `main`-workflow van 30 oktober 2026, run `41135579986`, had:
- `core`, `browser (interface)`, `browser (data)` en `upgrade`: geslaagd;
- `browser (life)`: mislukt.

In `tests/notes-direction-c-browser.cjs:76` ontstond een assertion `1 !== 3` direct na het leegmaken van het zoekveld. Dat is **nog geen bewezen appbug**: oorzaak kan een timing-/weergaveprobleem in de test of een werkelijke fout in de notitie-UI zijn. **Niet** de verwachting verlagen of de suite uitschakelen; reproduceer, meet de UI-state en herstel de oorzaak.

Daarnaast meldden de diagnoserapporten van `knowledge-v2-browser` enkele buiten de viewport vallende childcontrols en enkele kleine aanraakdoelen, terwijl `document.scrollWidth` binnen 393 px bleef. Hier is gerichte visuele diagnose nodig; niet op basis van dit log alle schermen als defect classificeren.

## Gefaseerde vervolgvolgorde

1. **P0 — CI weer betrouwbaar groen.** Reproduceer de fout van `notes-direction-c-browser.cjs:76`, controleer search-state, filter-state en rendered lijst vóór/na `fill('')`; maak alleen gerichte reparaties met bewijs.
2. **P1 — Concrete functionele bugs.** Eén domein per PR; voor elke bug eerst falende gerichte regressie, dan kleinste correctie. Extra aandacht voor taken/datumlogica, financiële categorieën/overboekingen, document- en back-upherstel, Android-formulieren.
3. **P1 — CSS-eigenaarschap.** Definieer in bestaande bestanden één eigenaar voor tokens, glaslaag, layout en componentspecifieke stijl. Maak per getroffen selector de echte cascade en media-context inzichtelijk. Verwijder pas dan redundantie.
4. **P2 — Grote `index.html` opdelen.** Begin met één aantoonbaar zelfstandige module zonder state-/opslagwijzigingen. Behoud oude publieke interface en volgorde, update `sw.js`, voer browser- en PWA-upgradetests uit.
5. **P2 — Onderhoudbaarheid.** Verwijder pas na referentiecontrole ongebruikte code/assets en actualiseer documentatie/tests. Behoud backward compatibility van lokale gegevens en back-ups.

## Controles vóór enige merge

- Vergelijk met dan-actuele `main`, bekijk alle diffhunks en beperk scope.
- Volg `AGENTS.md` risiconiveau 1/2/3; `index.html`/`sw.js` zijn niveau 3.
- Test data integrity, PIN, ZIP/back-up en offline upgrade wanneer deze paden worden geraakt.
- Controleer actieve mobiele schermen en echte touchinteracties; browseremulatie is geen fysieke Android-test.
- **Niet mergen bij een relevante rode test.** Een vooraf bestaande rode test apart verklaren én herstellen voordat het release-gate groen is.

## Afbakening van dit rapport

Dit is een geprioriteerde codebase-inventarisatie op basis van GitHub-structuur, kernbestanden en CI-logs, **geen volledige dynamische inspectie van iedere functie, branch of oude codevariant**. Geen persoonlijke gebruikersdata is geladen of gewijzigd. Na deze PR blijven meerdere cleanupfasen noodzakelijk.
