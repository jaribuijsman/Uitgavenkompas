# Memento — technische roadmap voor stabilisatie en sneller ontwikkelen

**Versie:** 1.0 · 2 november 2026
**Repository:** `jaribuijsman/Uitgavenkompas`
**Beoogde vaste locatie in GitHub:** `docs/TECHNISCHE_ROADMAP.md`
**Gecontroleerde uitgangscommit:** `248a5dd811b90b293aebda134e67c32338563e86` (`main`, na merge van PR #66)
**Status van dit bestand:** uitvoeringsplan, **geen bewijs van uitgevoerde wijzigingen**. GitHub is voor het opstellen uitsluitend gelezen; dit bestand is nog niet in de repository opgenomen.

> **Doel:** Memento stapsgewijs technisch vereenvoudigen, de ontwikkeling via GPT/Codex/Work versnellen, de prototypefideliteit verhogen en de Android-PWA veiliger en overzichtelijker maken. **Geen herbouw van `main` en geen grootschalige automatische cleanup.** Dit is het **enige voortgangs- en overdrachtsbestand** voor deze roadmap. Het verwijst naar bestaande bronbestanden, maar creëert geen parallelle procesdocumentatie.

## 1. Werking van dit ene bestand

### Bronhiërarchie en gebruik

1. Controleer bij **iedere uitvoering** eerst de dan actuele `main` en `AGENTS.md`. De commit hierboven is uitsluitend een startreferentie, geen blijvend vastgepinde ontwikkelbasis. Gebruik daarnaast alleen de voor dat werkpakket relevante `.agents/skills/` en passages uit `docs/product/01_MASTERPLAN.md`, `02_DESIGN_SYSTEM.md` en `03_BESLUITEN_EN_ROADMAP.md`; `04_HISTORISCHE_BESLUITENAUDIT.md` is historisch.
2. Selecteer **exact één eerstvolgend werkpakket** met status `OPEN`. Onderzoek alleen de daarin genoemde bronbestanden plus direct aantoonbaar afhankelijke code. Alle PR's beginnen vanaf de dan actuele `main`; laat andere branches en werk ongemoeid.
3. Statussen: `OPEN` (nog niet onderzocht/uitgevoerd), `IN UITVOERING`, `GEBLOKKEERD`, `GESLAAGD` (alle relevante controles aantoonbaar uitgevoerd), `AFGEKEURD` (reëel niet-verholpen defect) en `NIET GEVERIFIEERD`. Sluit een werkpakket pas als `GESLAAGD` af met **PR-URL, merge-SHA, exact CI-run-ID, relevante screenshots/tests en restrisico**. Noteer een afgesproken noodzakelijke afwijking met reden én gebruikersakkoord.
4. Werk na elke afgeronde PR **alleen de statusrij en het korte uitvoerlog in ditzelfde bestand** bij. Geen aparte voortgangsrapporten, nieuwe globale checklisten of herhalende audits. Bestaande productdocumenten worden alleen gewijzigd als een nieuw werkelijk productbesluit dat vraagt.
5. **Een plan is geen implementatieautorisatie.** Uitvoering van een werkpakket, PR, merge en productiepublicatie vereisen de passende expliciete opdracht. Laat volgende fasen niet automatisch meelopen. Laat geen groen CI-resultaat een bewezen visuele afwijking goedkeuren.
6. Gebruik `tests/ci-plan.cjs` als huidige technische testplanner; pas risicoklassen niet op gevoel aan. Houd gebruiksgegevens, notities, transacties, afspraken, IDs, bijlagen, PIN, ZIP-herstel en offline opslag intact. Alleen geïsoleerde fictieve testfixtures. Geen echte medische/financiële gegevens in de publieke repository.

### Altijd toepassen bij een implementatie-PR

- Lees eenmaal: actuele `main`-SHA, betrokken component/eigenaar, bestaande handlers, werkelijk diffbereik en toepasselijke skill. Geen brede herinventarisatie per PR.
- Korte acceptatielijst, maximaal acht criteria; voor prototypes ook relevante **schermtoestanden na interactie** en het exact goedgekeurde referentiebestand.
- Voer de kleinst passende lokale controles uit; één samenhangende push na voorafgaande verificatie. Vermijd een commit/CI-run per CSS-selectorfout. Geen `force`-clicks, uitgeschakelde tests of gewijzigde verwachtingen om rood groen te maken.
- Gebruik voor de finale PR de centrale `.github/workflows/app-review.yml` en de **werkelijke** selectie door `tests/ci-plan.cjs`. Geen dubbel gestarte gespecialiseerde workflows. Veld `geslaagd` betekent exact groen PR-head-bewijs, niet alleen een oude run.
- Bij relevante UI-wijzigingen: inspecteer bestaande domeinjourney en screenshots op **393px** met dezelfde fixture, interactiestaat en scrollpositie als het prototype. Extra **360/412px, korte viewport, open keyboard of A54** alleen wanneer het aantoonbare risico daarom vraagt. Chromium-emulatie is geen fysieke A54-test.
- Controleer bij gewijzigde offline-assets `index.html`-versieparameters en `sw.js`-precache/cacheversie; wijzig geen serviceworker-lifecycle om puur CSS-onderhoud te doen.
- Merge uitsluitend met autorisatie, passende groene checks én ontwerpacceptatie. Controleer na merge echte GitHub-status/deployment. **Geen ongeteste opslagmigratie, geen reset van lokale PWA-gegevens.**

### Voortgangsoverzicht — enige operationele lijst

| ID | Werkpakket | Prioriteit | Technisch risico (vooraf) | Status | PR / bewijs |
|---|---|---|---|---|---|
| F0-A | Afwijking na PR #66 vaststellen en herstellen | P0 | Hoog als `memento-life-app.js` geraakt wordt | GESLAAGD | [PR #67](https://github.com/jaribuijsman/Uitgavenkompas/pull/67) · merge `e638d94e7759a5ada5113e1cf714f1e6cbb6b14b` · [PR-head-run 41453028522](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522) · [beelden](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522/artifacts/13146400500) |
| F1-A | `AGENTS.md` en efficiencyregels consolideren | P1 | Laag, documentatie | GESLAAGD | [PR #69](https://github.com/jaribuijsman/Uitgavenkompas/pull/69) · merge `99b78c04183cbf012b050a8bf61c99bb7382094b` · [PR-head CI 41456245800](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456245800) |
| F2-A | Dubbele browserjourney in volledige CI oplossen | P1 | Hoog: CI-planner/groepen | GESLAAGD | [PR #70](https://github.com/jaribuijsman/Uitgavenkompas/pull/70) · merge `86460f546b258cf70ebd1683c2a1a2d617954e6b` · [CI 41456791941](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456791941) |
| F2-B | Historische handmatige workflows en tests corrigeren | P1 | Hoog: workflows; veiligheidsdekking behouden | GESLAAGD (centrale CI) | [PR #71](https://github.com/jaribuijsman/Uitgavenkompas/pull/71) · merge `55ac17b798a4d54c68a8d4536cb8fa6ef56b89be` · [CI 41475455926](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41475455926); handmatige dispatch NIET GEVERIFIEERD |
| F3-A | Prototypevergelijking in bestaande domein-CI afdwingbaar maken | P1 | Hoog bij workflowaanpassing | GESLAAGD (Kenniscentrum-editor) | [PR #72](https://github.com/jaribuijsman/Uitgavenkompas/pull/72) · merge `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3` · [groene CI 41498366958](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958); overige schermen NIET GEVERIFIEERD |
| F3-B | Prototypepoort uitbreiden naar de **hele app** (per betrokken route) | P1 | Hoog bij test-/workflowintegratie | OPEN; implementatie nog niet gestart | 18 hoofdschermen plus openingsscherm geïnventariseerd; vereiste goedgekeurde referenties buiten Kenniscentrum nog niet vastgezet |
| F4-A | Per tabblad UX/tekst/knoppen-audit, read-only | P1 | Geen codewijziging | IN UITVOERING; bron- en testinventaris gereed | Branch `docs/f4a-appwide-ux-audit-and-parity-plan`; visuele beoordeling nog NIET GEVERIFIEERD |
| F4-B | Eerste goedgekeurde UI-vereenvoudiging uitvoeren | P2 | Laag/middel afhankelijk van diff | OPEN, afhankelijk van F4-A en gebruikersgoedkeuring | — |
| F5-A | Kenniscentrum-CSS-cascade consolideren | P2 | Laag/middel, werkelijk effect verifiëren | OPEN | — |
| F5-B | Gedeelde/taken-CSS alleen bij bewezen duplicatie opschonen | P2 | Middel bij gedeelde CSS | OPEN | — |
| F6-A | Leven: één UI-verantwoordelijkheid losmaken van persistentie | P2 | Hoog, opslag-/upgradecontract | OPEN | — |
| F6-B | Financiën: één modulegrens vereenvoudigen | P3 | Hoog, financiële integriteit | OPEN | — |
| F7-A | Effectmeting en afsluitende herprioritering | P2 | Documentatie-only tenzij code nodig is | OPEN | — |

**Afhankelijkheden:** F0-A is de bekende kwaliteitsschuld; F1-A en F2-A/B kunnen daarna volgen. F3-A bouwt voort op F2-A/B en de bestaand werkende prototypejourney. **F3-B breidt de bindende prototypepoort gefaseerd uit tot alle geraakte schermen en toestanden; F3-A bewijst dit nog niet.** F4-A gaat vóór F4-B. F5/F6 voeren alleen bewezen verbeteringen uit, niet automatisch alle vermeende overtollige code. F7-A sluit af op basis van daadwerkelijk verzameld bewijs.

---

## 2. Technische fasen en uitvoercontracten

### Fase 0 — Productkwaliteit na PR #66

**F0-A — Slim opvolgen: prototypeafwijking opheffen.**

- **Aangetoonde aanleiding:** PR #66 is gemerged in `248a5dd8`; in het bestaande bindende contract `docs/design-review/knowledge-prototype-parity-20261102.md` staat dat de tweede stap na een vervolgkeuze via `MementoLifeFlow` *niet bewezen visueel 1-op-1* overeenkomt. Dit blijft na de merge een open acceptatiepunt, geen bewezen actuele regressie in opslag.
- **Eerst reproduceren:** vergelijk het geanonimiseerde referentieprototype `docs/design-review/knowledge-prototype-approved-20261102.html` met de echt gerenderde stappen *Nieuw vervolg → Vervolgtaak / Vervolgafspraak / Vervolgnotitie → vervolgformulier*. Zelfde viewport (393px), inhoud, scroll en open sheet; leg afwijking per stap vast. Controleer ook de bestaande normale-tekst- en gestructureerde-documentvariant.
- **Eigenaren/ingangen:** `assets/memento-knowledge.js`, `assets/memento-knowledge.css`, de bestaande `MementoLifeFlow.start`-route in `assets/memento-life-app.js`, `tests/knowledge-workspace-browser.cjs`, `tests/helpers/knowledge-workspace-browser-checks.cjs` en `tests/helpers/knowledge-prototype-geometry.cjs`. Volg de concrete handlerketen; geen tweede flow bouwen.
- **Wijziging:** herstel de visuele mismatch met de kleinste presentatiewijziging, bijvoorbeeld compacte/progressief ontvouwde bestaande velden **alleen indien** bronvalidatie, notitiekoppeling, taak-/afspraakvelden en opslaan volledig behouden blijven. Verander geen opslagcontract; geen noodzakelijke velden stilzwijgend verwijderen. Een wezenlijk onvermijdelijke afwijking **blijft geblokkeerd** tot expliciete ontwerpgoedkeuring.
- **Risico en test:** wijziging in `memento-life-app.js` => huidige CI-planner klasse **hoog**, toepasselijke upgrade-/gegevensveiligheidschecks blijven verplicht. Uitsluitend knowledge CSS/JS kan smaller zijn indien werkelijk geïsoleerd. Verifieer alle drie vervolgvormen met opslag in fictieve fixture, source-link, veldbehoud en prototypevergelijking.
- **Gereed wanneer:** de volledige vervolgroute visueel en functioneel beoordeeld is; prototypeafwijking hersteld of expliciet goedgekeurd, en exacte PR-head-bewijs beschikbaar. Fysieke A54 blijft `NIET GEVERIFIEERD` tot werkelijk getest.

### Fase 1 — Één compacte set agentinstructies

**F1-A — Instructieconsolidatie zonder veiligheidsverlies.**

- **Bronnen:** `AGENTS.md` (actueel circa 22 KB), `docs/agent-efficiency.md`, `docs/product/README.md`, relevante zes `.agents/skills/*/SKILL.md`; historische bron `docs/cleanup-audit-20261031.md` alleen voor context. Lees alleen noodzakelijke passages.
- **Wijziging:** maak `AGENTS.md` een compacte router voor bronhiërarchie, prototypeplicht, risicoklasse, gegevensveiligheid, PR-/merge-autorisatie, A54 en skillselectie. Richtgetal **100–150 leesbare regels** is een doel, geen harde limiet. Verplaats unieke verdieping naar **bestaande** relevante skills; vermijd een extra instructiebestand. Schrap dubbele normatieve inhoud uit `docs/agent-efficiency.md` door die te consolideren of dat document als niet-normatieve toelichting te markeren. Historische audit niet herschrijven.
- **Bewaking:** maak een kleine verantwoordelijkhedenmatrix: iedere regel heeft één primaire bron. Behoud expliciet de harde visuele prototype-gate, niveau-3 opslagchecks, postmerge-tree-verificatie en privacyregels. Geen herformulering die deze voorschriften afzwakt.
- **Test en gereed:** documentatie-diff, verwijzingen/paden geldig, geen tegenstrijdige regels of verplichte dubbele leesronde. **Geen browsertests** bij uitsluitend documentatie. `AGENTS.md` kan wel een CI-trigger zijn, maar de planner mag docs-only herkennen. Toon de oude→nieuwe vindplaats voor de belangrijkste zeven veiligheidsregels.

### Fase 2 — CI vereenvoudigen zonder regressieverlies

**F2-A — Dubbele kennisjourney uit de hoge-risicomatrix.**

- **Aangetoond:** `tests/ci-groups.cjs` bevat `knowledge-workspace-browser` zowel in `interface-visual` als `life-full`. Bij hoge risicoselectie worden beide groepen gepland. Ook meerdere kleinere testgroepen gebruiken bewust dezelfde suite voor smalle wijzigingen; dat hoeft geen fout te zijn.
- **Wijziging:** wijs in de **volledige** matrix één eigenaar voor de Kenniscentrum-journey aan. Haal uitsluitend de onnodige duplicatie tussen gelijktijdige zware shards weg; behoud `life-knowledge` voor domeinchanges en behoud screenshots/artifacts ook na groen. Actualiseer waar nodig `.github/workflows/app-review.yml` artifactvoorwaarden en bestaande regression assertions. Controleer voor/na welk gedrag elke groep daadwerkelijk afdekt.
- **Tests:** `node tests/ci-plan-regression.cjs`, `node --check tests/ci-groups.cjs`, relevante browserjourney, negatieve test dat hoog risico nog steeds zes benodigde domeinsoorten/safetydekking behoudt. De centrale PR-gate van deze infrastructuurwijziging is **hoog**. Meet en rapporteer suite-aantallen en CI-duur vóór/na; geen tijdwinst claimen zonder meting.
- **Gereed:** geen overbodige dubbele uitvoer in dezelfde full run; artefacten en echte safetydekking ongewijzigd of verbeterd.

**F2-B — Handmatige legacy-workflows opruimen.**

- **Aangetoond:** `.github/workflows/masterplan.yml` noemt `tests/masterplan-browser.cjs`, terwijl de centrale groepen deze V1-journey bewust uitsluiten; `.github/workflows/knowledge-v2.yml` noemt `tests/knowledge-v2-browser.cjs`, eveneens bewust uitgesloten in `tests/ci-groups.cjs`. De workflows zijn handmatig, **niet** automatisch een dubbele PR-gate.
- **Wijziging:** verifieer eerst of deze handmatige routes nog actief nodig zijn. Vervang alleen niet-actuele assertions/routes door de bestaande moderne domeinjourneys of archiveer/verwijder **uitsluitend aantoonbaar ongebruikte handmatige workflowingangen**. Bewaar bewezen unieke safetytests. Verwijder historische testbestanden pas na referentieanalyse inclusief workflow-, documentatie- en downgradepaden; geen bulkverwijdering.
- **Test:** YAML/workflowsyntax, directe moderne suite, relevante plannerregressie; centrale PR-gate voor `.github/workflows` blijft hoog. Leg vast welke controles behouden blijven en welke handmatige knop vervalt.
- **Gereed:** geen uitvoerbare legacy-journeys met bewust vervallen DOM-contracten; geen veiligheidsverlies of nieuwe dubbele PR-run.

### Fase 3 — Prototypefideliteit als toetsbare acceptatie

**F3-A — Automatische vergelijking met getoetste referentie.**

- **Bestaande basis:** goedgekeurd prototype en mapping in `docs/design-review/knowledge-prototype-*.html/.md`, geïsoleerde fixture in `tests/helpers/visual-fixture.cjs`, domeinjourney `tests/knowledge-workspace-browser.cjs` en `knowledge-prototype-geometry.cjs` plus screenshots via `.github/workflows/app-review.yml`.
- **Wijziging:** bouw op de **bestaande** knowledge-journey één versievaste vergelijking van belangrijke referentie- en appschermen (editor boven/midden/onder, vervolgsheet en daadwerkelijke vervolgformulierstap). Vergelijk met identieke fictieve inhoud, viewport en interactiestaat. Gebruik eerst DOM-geometrie, hiërarchie, zichtbare controls en bestaande screenshotartifacts; voeg pixel-/regioverschil alleen toe als het reproduceerbaar en onderhoudsarm is. Geen nieuwe frameworkinstallatie of universele screenshotmatrix.
- **Poorten:** materieel layoutverschil => visueel `AFGEKEURD`; ontbrekende referentie of niet gemaakte vergelijking => `NIET GEVERIFIEERD`; alleen toegelaten raster-/fontsmoothingtolerantie mag passeren. Statische afbeeldingsdifferences **vervangen geen menselijke visuele check** bij wezenlijke nieuwe UI's. Een geconstateerde afwijking kan in PR worden beschreven maar is niet daardoor goedgekeurd.
- **Test:** bewuste negatieve fixture/screenshot-afwijking moet de relevante gate laten falen, correcte huidige referentiestaat moet slagen. Integreer in huidige centrale gate, niet als permanente tweede workflow. Houd privacy en 7-daagse artifacts-retentie in acht.
- **Gereed:** een volgende implementerende agent krijgt aantoonbaar automatisch rood bij een materiële afwijking binnen de benoemde scope; screenshots zijn herleidbaar tot exact PR-head-SHA.

**F3-B — Appbrede prototypepoort, zonder fictieve referenties of onnodige full runs.**

**Gebruikersbesluit:** volgens `docs/product/03_BESLUITEN_EN_ROADMAP.md` geldt een expliciet goedgekeurd interactief HTML-prototype als bindende referentie voor **ieder Memento-tabblad**, niet alleen voor editors. De F3-A-poort is technisch slechts voor de Kenniscentrum-editor en haar vervolgformulieren aangetoond. Het is onjuist te claimen dat F3-A de volledige app een-op-een met prototypes vergelijkt.

**Huidige inventaris:** `tests/release-acceptance-browser.cjs` en `tests/glass-rendering-browser.cjs` lopen langs **18 feitelijke hoofdschermroutes**: Leven `today`, `tasks`, `groceries`, `wishes`, `agenda`, `notes`, `fitness`, `backup`; Financiën `dashboard`, `transactions`, `analysis`, `accounts`, `budgets`, `planning`, `smartbuy`, `moneycoach`, `receipts`, `settings`. `#mementoStart` is een apart openingsscherm; het totaal is dus **19 primaire ingangen**. De bestaande routes hebben algemene accessibility/overflow/browserdekking, maar **geen 19 goedgekeurde versievastgelegde prototypes**. Eén reeds vastgelegde HTML-referentie bewijst alleen de editor in `notes`. Het contract `docs/mijn-dag-v3-acceptance.md` is aanvullend tekstueel ontwerp-/gedragsbewijs, geen exact versiegefixeerd HTML-prototype.

**Veilig gefaseerd implementatiecontract voor F3-B:**
1. **Route-/staatregister hergebruiken:** registreer 19 ingangen via de bestaande route- en domeintests, inclusief dialogs, filters, menu's, tabbladen, lege/lange staten, boven/midden/onder, waar relevant. Registreer per goedgekeurde referentie: `screen-id`, eigenaars van UI/CSS, exacte HTML-/artefact-hash, expliciet goedkeuringsbesluit, fictieve fixture, scenario's, exacte bestaande domeinjourney en acceptatiebereik. Zonder goedkeuring nooit de **huidige app** als zogenaamd goedgekeurde referentie vastpinnen.
2. **Eén herbruikbare vergelijker:** extraheer bestaande F3-A-geometrie/labels/hiërarchie/actiecontrols naar een kleine generieke adapter; houd de specifieke Kenniscentrum-invarianten in hun huidige eigenaar. Geen universele pixelverschilengine of nieuw framework. Normeer per scenario gelijke fictieve content, viewport, scroll en interactiestaat; bewaar beelden en meetrapport met PR-head SHA.
3. **Risicogestuurd per gewijzigd scherm:** verbind een prototypecheck aan de **bestaande** relevante browserjourney (bijv. `day-v3-browser`, `taken-v4-browser`, `app-review-browser`, `fitness-browser`) wanneer die route of gedeelde UI werkelijk wijzigt. Laat een kleine lokale wijziging niet standaard alle 19 schermen en zes zware groepen draaien; gedeelde UI en opslag blijven volgens `tests/ci-plan.cjs` op hun vereiste niveau.
4. **Onvolledige referenties expliciet afkeuren voor ontwerpclaim:** een inhoudelijke UI-implementatie zonder aantoonbaar goedgekeurde versie is visueel **NIET GEVERIFIEERD**, ook bij groene functionele CI; niet stilzwijgend een oude mockup, current screenshots of het Design System als 1:1-prototype gebruiken. Een materieel gemeten verschil binnen vastgezette scope is **AFGEKEURD**. Bestaande softwarebugfixes kunnen wel met beperkte doelgerichte tests worden uitgevoerd zonder fictieve ontwerpgoedkeuring te claimen.
5. **Prioriteit:** eerst de actieve geautoriseerde schermprototypes koppelen waar ze werkelijk bestaan, daarna per nieuw goedgekeurd ontwerp de betreffende route aansluiten; start bij Mijn dag/Taken, Agenda, Financieel overzicht/Transacties en Instellingen, vervolgens overige 19 ingangen. Per aansluit-PR een negatieve visuele afwijkingsfixture, geslaagde actuele render, veilige opslag en exact PR-head screenshotartifact. Bewaak privacy en de bestaande 7-daagse retentie.

**Gereed pas wanneer:** alle **19 primaire ingangen** een expliciete dekkingstatus hebben, iedere relevante **goedgekeurde** scherm-/toestandreferentie een afdwingbare routecheck heeft, en geen materiële nieuwe UI-PR zonder zijn vereiste visuele vergelijking als 'prototypegetrouw' kan worden gemerged. De dekking groeit per bewezen referentie; **19/19 prototypepariteit is vandaag NIET GEVERIFIEERD**.

### Fase 4 — UX-jungle: eerst inventariseren, dan gericht verbeteren

**F4-A — Read-only scherminventarisatie.**

- **Onderzoek:** werk per daadwerkelijk gebruikte tabbladroute, gericht op Android 393px: kleine/lichtgrijze tekst en contrast, herhaalde uitleg, dubbele knoppen of verschillende labels met dezelfde handler, overvolle kaarten, diepte van menu's, lege staten en bereikbaarheid bij scroll/keyboard. Begin met Kenniscentrum/Leven, daarna Financiën, Agenda, Fitness, Instellingen; uitbreiden alleen als relevant.
- **Bewijs:** leg per kandidaat vast: scherm en staat, selector/handler, bestaande gebruikersfunctie, beeld/geometry en voorstel (`behouden`, `hernoemen`, `verplaatsen`, `samenvoegen`, `verwijderen`). Markeer vermoedens. Twee knoppen met een soortgelijk label zijn **niet** automatisch functioneel identiek; test de handler en effecten. Geen nieuwe mockdata in echte opslag.
- **Oplevering binnen dit bestand:** voeg onderaan maximaal tien **geprioriteerde bewezen kandidaten** toe als korte regels; geen apart omvangrijk inventarisatiedocument. Dit werkpakket is **alleen analyse**, geen UI-wijziging.
- **Gereed:** eerste kleine voorstel met referentie-/acceptatiecriteria gereed voor expliciete gebruikersgoedkeuring.

**F4-B — Eén goedgekeurde UI-vereenvoudiging.**

- **Wijziging:** kies uitsluitend de hoogst geprioriteerde door gebruiker goedgekeurde wijziging uit F4-A. Hergebruik de bestaande CSS-/JS-eigenaar, geen nieuwe overrides of parallelle handler. Geen andere schermen in dezelfde PR.
- **Test:** gerichte 393px domeinjourney; vergelijk vóór/na screenshots en open menu/scroll waar relevant; extra mobiele toestanden alleen bij echt risico. Functioneel gelijk gedrag en toegankelijkheid (minimaal 44×44 px; streef 48×48 bij nieuwe primaire bediening).
- **Gereed:** minder herhaalde UI zonder functieverlies; expliciete visuele goedkeuring, PR-evidence en bijgewerkte status. Herhaal later per door gebruiker gewenst afzonderlijk UX-pakket, niet als automatische bulkcleanup.

### Fase 5 — CSS-eigenaren herstellen en overtollige regels verwijderen

**F5-A — Kenniscentrum-scope.**

- **Bestanden:** `assets/memento-knowledge.css`, relevante selectors uit `assets/memento-base-app.css`, `assets/memento-ui.css` en gerelateerde renderstructuur in `assets/memento-knowledge.js`. Geen globale styles zonder cascadebewijs wijzigen.
- **Methode:** inventariseer per werkelijk geraakte component de CSS-source order, specificity, mediaquery, pseudo-state en computed style. Vind aantoonbaar volledig overschreven regels en selectors zonder runtime- of documentreferentie. Check dynamische classes en alternatieve notitievormen vóór verwijderen.
- **Wijziging:** maximaal één samenhangend style-eigenaarschap per PR; verwijder bewezen overtollige declaraties in bestaande eigenaar in plaats van `!important`-appendices. Verander uiterlijk niet behalve bij een expliciet goedgekeurde reparatie.
- **Tests:** parse/syntax, diff, dezelfde knowledge-journey en matched screenshots; 360/412 en korte viewport wanneer cascade/touch daarvan afhankelijk is; asset/cachecontract wanneer URLs gewijzigd zijn.
- **Gereed:** gedocumenteerde exacte duplicaten verwijderd, uiterlijk en bestaande handlers ongewijzigd, meetbaar minder conflicterende declaraties. CSS-regel-aantal alleen is geen kwaliteitsbewijs.

**F5-B — Gedeelde CSS en taken.**

- **Begin met bewijs:** PR #64 heeft de 44×44px-takenmenuknop al geconsolideerd; **datzelfde werk niet opnieuw doen**. Onderzoek uitsluitend nieuw gevonden conflicten in `memento-base-app.css`, `memento-ui.css`, `memento-layout.css` en de relevante inline `index.html`-styles.
- **Wijziging:** één bewezen duplicatiecluster per PR, behoud de bestaande visuele hiërarchie en dynamische mediaqueries. Gedeelde CSS raakt meerdere schermen; gebruik de door de planner gekozen relevante layout-/domeinroutes.
- **Gereed:** geen regressie op taken, afspraken, Mijn dag, menu/scroll en Financiën waar door de betreffende selectors geraakt.

### Fase 6 — JS modulariseren zonder opslagrisico

**F6-A — Leven: presentatie scheiden van opslag.**

- **Aanleiding:** `assets/memento-life-app.js` (circa 181 KB op gecontroleerde `main`) is gemengd UI/persistentie en staat expliciet in de `HIGH`-lijst van `tests/ci-plan.cjs`. Dat is een terechte grens zolang de code verweven is.
- **Eerste PR:** breng één kleine verantwoordelijkheid en haar callsites in kaart (bij voorkeur een pure UI-render/helper zonder storage-mutatie) en extraheer **alleen dat stuk** naar een logische bestaande module of een nieuw goed afgebakend presentatiemodulebestand indien nodig. Maak geen dubbele statekeeper. Behoud exacte runtimevolgorde, publieke calls, eventhandlers en serviceworker assetversies.
- **Verplicht:** negatieve opslagveiligheidschecks voor lokale taken/afspraken/IDs, herstel en offline herstart waar toepasselijk; bestaande Leven-/followup browserjourney; volledige bestaande high-risk PR-gate inclusief upgrade wanneer `life-app.js` geraakt is. Geen risicodowngrade op basis van een tekstmarker.
- **Gereed:** één verantwoordelijkheidsgrens aantoonbaar verbeterd met ongewijzigde gegevenscontracten. Pas **na bewezen scheiding** kan een latere afzonderlijke PR veilig een fijnmazigere risicoclassificatie voorstellen met plannerregressie en negatieve tests.

**F6-B — Financiën: bewezen duplicatie of verantwoordelijkheidsgrens.**

- **Bestanden:** `assets/memento-finance-app.js`, `assets/memento-finance-dashboard-v9.js` en relevante bestaande `*-core.js`-modules/testcontracten; start met alleen de daadwerkelijk gevonden eigenaar.
- **Wijziging:** één kleine pure helper of dubbele codepad verbeteren, zonder veranderingen in bedragen, overboekingen, validatie, rekeningmutaties of opslagkeys. Geen onnodige herberekening of migration.
- **Tests:** integriteits- en negatieve tests voor bedragen, interne overboekingen, categorisering, budgetten, restore/offline; volledige toepasselijke hoge-risico releasegate.
- **Gereed:** aantoonbare afname van onderhoudscomplexiteit zonder gewijzigde financiële resultaten.

### Fase 7 — Meten, leren en vervolg kiezen

**F7-A — Werkelijke prestatie- en kwaliteitswinst vastleggen.**

- **Bestaande metingen:** `CI_SUITE_DURATION` per suite uit `tests/ci-groups.cjs`, GitHub Actions-jobduur, aantallen herhaalde uitvoeringen op dezelfde PR, tijd tussen eerste PR-head en merge, aantal afwijkingen prototype↔app. Verzamel alleen voor relevante vergelijkbare PR's; schat ontbrekende data niet.
- **Vergelijk:** duur van geselecteerde groepen, duplicatieaantal, aantal CI-herstarts, aantal gewijzigde bestanden/commits per kleine taak, en aantal na merge gemelde UX-problemen. Houd onderscheid tussen agenttijd, GitHub Actions-tijd en ChatGPT-gebruiks-/rate-limit: deze zijn **niet hetzelfde**.
- **Afsluitcriteria:** benoem meetbaar verbeterde punten én onopgeloste risico's, werk de statusrijen in dit bestand bij en kies maximaal drie nieuwe onderhoudskandidaten. **Geen nieuwe grote roadmap of nieuwe `main`.**

---

## 3. Vaste overdracht naar een nieuwe GPT-, Codex- of Work-chat

Kopieer onderstaande opdracht en vervang uitsluitend de werkpakket-ID. Wanneer dit bestand in GitHub staat, is `docs/TECHNISCHE_ROADMAP.md` de live bron; vóór opname moet het Markdown-bestand in de chat worden toegevoegd.

```text
Memento — voer uitsluitend werkpakket [ID] uit vanuit
`docs/TECHNISCHE_ROADMAP.md` in `jaribuijsman/Uitgavenkompas`.

Lees de actuele main, AGENTS.md en uitsluitend de voor dit werkpakket
relevante skill/code. Check eerdere status en afhankelijkheden. Volg
alle veiligheids-, prototype-, test- en publicatieregels van de roadmap.
Voer de gerichte wijziging volledig uit op een aparte branch en maak een PR.
Doe geen volgende fases en geen brede cleanup. Update in hetzelfde
roadmapbestand alleen de status en echte PR/CI/bewijsgegevens.
Bij een echte afwijking of falende gate: herstel gericht; meld blokkade,
forceer geen merge. Merge uitsluitend als ik dat expliciet autoriseer.
Rapporteer PR-link, SHA, geslaagde/niet geverifieerde tests, gegevensveiligheid,
visuele status, resterende afwijkingen en deploymentstatus.
```

**Eerste uitvoeropdracht (aanbevolen):** `Voer uitsluitend werkpakket F0-A uit volgens Memento_Technische_Roadmap.md. Herstel de bestaande visuele afwijking van de tweede Slim-opvolgen-stap van PR #66 zonder bronrelaties of opslagvelden te verliezen. Maak een PR en stop vóór merge zodat ik de beelden en verschillen kan beoordelen.`

## 4. Uitvoerlog — na iedere PR aanvullen, niet vooruit invullen

| Datum | Werkpakket | PR / finale SHA | Test / artifact / CI-run | Visuele/gegevensstatus | Besluit en resterend risico |
|---|---|---|---|---|---|
| 2026-11-02 | Roadmap opgesteld | Geen GitHub-mutatie | Repository read-only: `main` `248a5dd8` | Implementatie NIET GEVERIFIEERD | Startpunt; alle werkpakketten OPEN |
| 2026-11-02 | F0-A | [PR #67](https://github.com/jaribuijsman/Uitgavenkompas/pull/67) · head `cf57b02c2d85c58d91d1d1c3f5612cc7b863a7ac` · merge `e638d94e7759a5ada5113e1cf714f1e6cbb6b14b` | [PR-head CI 41453028522](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522) alle checks groen; [393px prototype/app-screenshots](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522/artifacts/13146400500); lokaal 360/393/412px en korte viewport; [postmerge 41453744164](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453744164) groen | Drie vervolgvormen, bronrelatie, afspraakdatum/-tijd, gewone en gestructureerde notities en opslagbehoud GESLAAGD; fysieke A54 NIET GEVERIFIEERD | Gemerged door gebruiker; identieke geteste Git-tree; live HTML-assetversies en `sw.js`-cache `v120` gecontroleerd. Restrisico: reeds geïnstalleerde clients en fysieke A54 niet individueel gecontroleerd. |

| 2026-11-02 | F1-A | [PR #69](https://github.com/jaribuijsman/Uitgavenkompas/pull/69) · head `798af6df28e1942897e1fb52da895d7ad44058bf` · merge `99b78c04183cbf012b050a8bf61c99bb7382094b` | [PR-head CI 41456245800](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456245800): plan en releasegate groen; browser/core/upgrade correct overgeslagen voor docs-only | Geen runtime-/opslagwijzigingen; documentatie-diff vergeleken; fysieke A54 niet van toepassing | Compacte AGENTS-router en niet-normatieve efficiencyhistorie gemerged na behoud van F0-A; tijdwinst nog niet gemeten. |

| 2026-11-02 | F2-A | [PR #70](https://github.com/jaribuijsman/Uitgavenkompas/pull/70) · head `e98590256aac1422916eca971c057e7d8737fd67` · merge `86460f546b258cf70ebd1683c2a1a2d617954e6b` | [CI 41456791941](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456791941): zes shards en 30 plannerchecks groen; [kennisartifact](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456791941/artifacts/13147900660) | Knowledge-journey in full-run 2×→1×; 22→21 browseruitvoeringen; gegevenscode ongewijzigd | `interface-visual` 51→36 s, totale CI 176→208 s in twee verschillende runs: **geen aangetoonde totale versnelling**; fysieke A54 niet van toepassing. |

| 2026-11-02 | F2-B | [PR #71](https://github.com/jaribuijsman/Uitgavenkompas/pull/71) · head `d78d8f88ad246687fe32406a2d902a03ab43f7d1` · merge `55ac17b798a4d54c68a8d4536cb8fa6ef56b89be` | [CI 41475455926](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41475455926): 31 plannerchecks, zes browserversnipperingen, releasegate groen | Verouderde handmatige V1-routes vervangen, originele tests behouden; applicatiecode ongewijzigd | Afzonderlijke nieuwe handmatige dispatchruns niet uitgevoerd, dus die uitvoerbaarheid NIET GEVERIFIEERD. |

| 2026-11-02 | F3-A | [PR #72](https://github.com/jaribuijsman/Uitgavenkompas/pull/72) · head `1bbc4a9723f1f3f62ad852b1fc98bbb85297a4f1` · merge `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3` | [Finale CI 41498366958](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958): 9 parityregressies, 31 plannerchecks, alle zes browsershards en releasegate groen; [prototype-/appscreenshots](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958/artifacts/13168131309) | Scope alleen Kenniscentrum-editor: acht gereproduceerde states; ander UI NIET GEVERIFIEERD | Postmerge [run 41499328108](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41499328108) groen, [Pages 41499326013](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41499326013) groen; fysieke A54 niet getest. |

## 5. Kandidatenlijst voor UX-audit (vullen bij F4-A, maximaal tien)

**F4-A — read-only code-/testinventaris op `main` `eca16e1bf59b` (2 november 2026).** De hieronder genoemde schermen en selectors zijn daadwerkelijk teruggevonden in bestaande producttests. 'Kandidaat' betekent *gericht visueel beoordelen of compacter maken wenselijk is*, **geen bewezen actuele UX-fout**. Er zijn in deze fase geen nieuwe browsermetingen of echte toesteltests uitgevoerd. Geen knop of functie verwijderen zonder de handler en opgeslagen effecten te verifiëren.

| Prioriteit | Scherm en concrete code-/testsporen | Wat beoordeeld moet worden / voorstel | Beoordeling |
|---|---|---|---|
| P1 | **Mijn dag:** `#lifeDayTrack`, `.mg-day-head`, `#lifeQuickForm`; `tests/day-v3-browser.cjs`, `docs/mijn-dag-v3-acceptance.md` | `behouden` functionele snelle invoer/dagwissel; controleer de goedgekeurde hiërarchie van datumkop, taak-/afspraakrij en open menu bij 393px; prototypeversie voor huidige route expliciet koppelen | Browsercontract bestaat; prototype-1:1 NIET GEVERIFIEERD |
| P1 | **Taken:** `.memento-task-tabs`, `.memento-filter-drawer`, `.life-task-menu`, `#lifeTaskForm`; `tests/visual-layout-browser.cjs`, `tests/taken-v4-browser.cjs` | `behouden` filters en complete taakvelden; onderzoek of tabs/filters/kaartopties compacter kunnen; controleer 44px hitbox bij open menu en lange titel | Tests bestaan; nieuwe visuele wijziging eerst goedkeuren |
| P1 | **Kenniscentrum overzicht/mappen:** `.kc-local-tabs`, `.kc-topic-viewport`, `.kc-tree-children`; `tests/knowledge-workspace-browser.cjs` | `behouden` map- en scrollgedrag; beoordeel compacte Overzicht/Mappen/Notities-tablijn en ingeklapte folders. **F3-A dekt alleen de editor, niet het overzicht** | Expliciet **prototypegat** aangetoond, UI-afwijking niet bewezen |
| P1 | **Agenda:** `.memento-agenda-month-layout`, `.memento-gcal-menu`, `.memento-agenda-add`; `tests/visual-layout-browser.cjs`, `tests/calendar-header-browser.cjs` | `behouden` Google-read-only en maand-/datumkeuze; toets de visuele hiërarchie en open kalender/afspraakkaart met goedgekeurde referentie | 44px-/layoutchecks, geen bindende HTML-pariteit |
| P1 | **Financiën overzicht/analyse:** `[data-m9-dot]`, `#m9-accounts`, `.analysis-tab`; `tests/app-review-browser.cjs`, `tests/glass-rendering-browser.cjs` | `behouden` saldi, categorie-/rekeningkeuze en grafiekfunctionaliteit; vergelijk bedragen, grafieken en uitgeklapt rekeningmenu; geen financiële logica aanpassen | Actuele browserinteractie, visueel NIET GEVERIFIEERD tegen goedkeuring |
| P1 | **Transacties / Bonnen:** `#addTransaction`, `#txForm`, `#ml-receipts [data-ml-tab]`; `tests/app-review-browser.cjs`, `tests/release-acceptance-browser.cjs` | `behouden` invoervelden en bewaarroute; beoordeel compacte filters, echte dialogs en ontvangstbonstappen, ook bij keyboard en lange invoer | Accessibility-/dialogtests, geen 1:1-prototypepoort |
| P2 | **Fitness:** `#fitnessDialog`, `#lifeContent [data-fit]`, `.mg-exercise-fold`; `tests/fitness-browser.cjs`, `tests/app-review-browser.cjs` | `behouden` set-/rust-/planlogica; beoordeel open planning en actief trainingsformulier op 393px i.p.v. alleen bestaande 390px fitnessroute | Functionele suite bestaat; pariteit NIET GEVERIFIEERD |
| P2 | **Instellingen Leven/Financiën:** `#mementoSettingsLife .ms-row`, `[data-ms-target=backup]`; `tests/app-review-browser.cjs`, `tests/release-acceptance-browser.cjs` | `behouden` back-up/herstel/PIN; beoordeel hiërarchie van groep/expand/call-to-action en onderkant scherm; beide instellingenroutes afzonderlijk vastleggen | Bestaande knop-/a11ytests; geen vastgezette HTML-pariteit |
| P2 | **Boodschappen/Aankoopwensen + Budgetten/Plannen:** routes `life:groceries`, `life:wishes`, `finance:budgets`, `finance:planning` in `tests/release-acceptance-browser.cjs` | `behouden` afzonderlijke doelen en inhoud; onderzoek compacte rijhoogte, menu's en acties per route; voorkom één generiek prototype voor verschillende schermen | Route-/overflow-bewijs; individuele referenties ontbreken |
| P2 | **Openingsscherm en globale navigatie:** `#mementoStart`, `#ms-task-row-second`, `#mementoMenuGrid`; `tests/memento-start-browser.cjs`, `tests/global-search-browser.cjs` | `behouden` PIN en herstel van concepten bij navigatiewissel; controleer korte viewport, toetsenbord en menuopen-toestand; startscherm als **19e ingang** registreren | Bestaande functionele tests; bindende prototypeversie NIET GEVERIFIEERD |

**Kleine eerste F4-B-kandidaat (nog niet goedgekeurd):** inspecteer uitsluitend het Kenniscentrum-tabblad **Mappen** op 393px met een ingeklapte en uitgeklapte map. Vergelijk een door de gebruiker goedgekeurd compact ontwerp met `.kc-local-tabs`, `.kc-tree-children` en de bestaande mapuitklaphandler. Acceptatie: tabvolgorde/labels en alle map-ID's behouden, 44×44 hitbox, geen horizontale overflow, dezelfde mapuitklap-/terugkeerroute, voor/na-screenshot exact dezelfde fixture. Zonder ontwerpgoedkeuring **geen UI-wijziging**.

**Appbrede dekkingsconclusie:** bestaande algemene browser-/accessibilitychecks voor 18 hoofdschermen plus een afzonderlijke startschermtest zijn **niet** equivalent aan 19 vastgezette prototypevergelijkingen; de nu geautomatiseerde F3-A-referentie betreft alleen de Kenniscentrum-editor en haar vervolgstappen. Zie F3-B hierboven.

