# Memento — technische roadmap voor stabilisatie en sneller ontwikkelen

**Versie:** 1.1 · 2 november 2026
**Repository:** `jaribuijsman/Uitgavenkompas`
**Vaste locatie in GitHub:** `docs/TECHNISCHE_ROADMAP.md`
**Gecontroleerde uitgangscommit:** `248a5dd811b90b293aebda134e67c32338563e86` (`main`, na merge van PR #66)
**Status van dit bestand:** opgenomen in de repository en de enige operationele voortgangsbron. De statusrijen en het uitvoerlog onderscheiden bewezen uitvoering van open werk. Het oorspronkelijke uitgangspunt hierboven blijft historisch; opnieuw gecontroleerde `main` bij G0: `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3`. Het lokale actieplan van 2 november is een overdracht, geen tweede roadmap.

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
| G0 | PR #73/#74 consolideren en roadmap corrigeren | P0 | Laag, documentatie | GESLAAGD (documentatie) | Canoniek: [PR #74](https://github.com/jaribuijsman/Uitgavenkompas/pull/74); #73 gesloten; merge `1b5de33824a41fa56109ea46b7469870e4297185` |
| G1 | Centrale CI-status ook voor documentatie-PR's beschikbaar maken | P0 | Hoog, workflow/planner | GESLAAGD (code-PR) | [PR #75](https://github.com/jaribuijsman/Uitgavenkompas/pull/75), head `b833bd304b6534fb5080f10c26217c39465a9738`, merge `9a78cdb00863ca8caab9a5ac934edbe5a07ca592`, [CI 41504372835](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504372835); docs-only bewijs volgt in G2 |
| G2 | `main` effectief beschermen | P0 | GitHub-beheerinstellingen | GEBLOKKEERD — NIET GEVERIFIEERD | GET protection en POST ruleset: HTTP 403 `Resource not accessible by integration`; regels `[]`, `protected:false` na poging op `9a78cdb` |
| F0-A | Afwijking na PR #66 vaststellen en herstellen | P0 | Hoog als `memento-life-app.js` geraakt wordt | GESLAAGD | [PR #67](https://github.com/jaribuijsman/Uitgavenkompas/pull/67) · merge `e638d94e7759a5ada5113e1cf714f1e6cbb6b14b` · [PR-head-run 41453028522](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522) · [beelden](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522/artifacts/13146400500) |
| F1-A | `AGENTS.md` en efficiencyregels consolideren | P1 | Laag, documentatie | GESLAAGD | [PR #69](https://github.com/jaribuijsman/Uitgavenkompas/pull/69) · merge `99b78c04183cbf012b050a8bf61c99bb7382094b` · [PR-head CI 41456245800](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456245800) |
| F2-A | Dubbele browserjourney in volledige CI oplossen | P1 | Hoog: CI-planner/groepen | GESLAAGD | [PR #70](https://github.com/jaribuijsman/Uitgavenkompas/pull/70) · merge `86460f546b258cf70ebd1683c2a1a2d617954e6b` · [CI 41456791941](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456791941) |
| F2-B | Historische handmatige workflows en tests corrigeren | P1 | Hoog: workflows; veiligheidsdekking behouden | GESLAAGD (centrale CI) | [PR #71](https://github.com/jaribuijsman/Uitgavenkompas/pull/71) · merge `55ac17b798a4d54c68a8d4536cb8fa6ef56b89be` · [CI 41475455926](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41475455926); handmatige dispatch NIET GEVERIFIEERD |
| F3-A | Prototypevergelijking in bestaande domein-CI afdwingbaar maken | P1 | Hoog bij workflowaanpassing | GESLAAGD (Kenniscentrum-scope) | [PR #72](https://github.com/jaribuijsman/Uitgavenkompas/pull/72) · merge `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3` · [head-CI 41498366958](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958) · alleen Kenniscentrum-editor/vervolg, **niet appbreed** |
| F3-B1 | Appbreed register van goedgekeurde referenties en staten | P1 | Laag/middel | OPEN — na F4-A | Alle 19 ingangen registreren; ontbrekende goedkeuring blijft NIET GEVERIFIEERD |
| F3-B2 | Eerste niet-Kenniscentrum-prototype afdwingbaar vergelijken | P1 | Middel/hoog | OPEN — na G1, F3-B1 en goedgekeurde referentie | Positieve en negatieve proef vereist |
| F3-B3 | Poort uitbreiden naar overige goedgekeurde routes | P1 | Per deel-PR volgens planner | OPEN — na F3-B2 en referentie per route | F3-B is de overkoepelende scope; geen appbrede implementatieclaim |
| F4-A | Per tabblad UX/tekst/knoppen-audit, read-only | P1 | Geen codewijziging | IN UITVOERING (code/testroutes; actuele visuele audit nog niet geverifieerd) | Branch `docs/f4a-screen-audit-and-global-parity-scope`; bewijzen in §5 |
| F4-B | Eerste goedgekeurde UI-vereenvoudiging uitvoeren | P2 | Laag/middel afhankelijk van diff | OPEN, afhankelijk van F4-A en gebruikersgoedkeuring | — |
| F5-A | Kenniscentrum-CSS-cascade consolideren | P2 | Laag/middel, werkelijk effect verifiëren | OPEN | — |
| F5-B | Gedeelde/taken-CSS alleen bij bewezen duplicatie opschonen | P2 | Middel bij gedeelde CSS | OPEN | — |
| F6-A | Leven: één UI-verantwoordelijkheid losmaken van persistentie | P2 | Hoog, opslag-/upgradecontract | OPEN | — |
| F6-B | Financiën: één modulegrens vereenvoudigen | P3 | Hoog, financiële integriteit | OPEN | — |
| D1 | Historische documentatie en bewijsbronnen ordenen | P2 | Laag, tenzij scripts/tests geraakt | OPEN — na G0 | Referentiebewijs behouden; bestaande router gebruiken |
| F7-A | Effectmeting, device- en productiecontrole | P1 | Read-only en gerichte releasecontrole | OPEN — na voltooiing of expliciete behoud-/uitstelbesluiten | Fysieke A54, agenttijd en niet gemeten winst NIET GEVERIFIEERD |

**Uitvoervolgorde volgens de opdracht:** (1) G0; (2) G1–G2; (3) F4-A; (4) F3-B1 t/m B3; (5) F4-B; (6) F5-A/F5-B; (7) F6-A/F6-B; (8) D1; (9) F7-A. Eén samenhangend werkpakket per PR; geen bulkmerge. Een echte blokkade wordt vastgelegd en niet als voltooiing geteld.

**Afhankelijkheden:** G0 → G1 → G2. G0 → F4-A → F3-B1 → F3-B2 → F3-B3; F3-B2 vereist ook G1. F4-A → F4-B en F5-B. G0 → F5-A en D1. G1 → F6-A/F6-B. F3-B2/B3 vereisen per route een daadwerkelijk goedgekeurde referentie; F4-B vereist goedkeuring van de concrete ontwerpwijziging. F5-A/B mogen alleen parallel zonder overlappende eigenaren. F7-A volgt na bewezen uitvoering of expliciete behoud-/uitstelbesluiten voor alle voorgaande pakketten. F0-A t/m F3-A blijven historisch bewezen binnen hun vermelde scope.

---

## 2. Technische fasen en uitvoercontracten

### Governance — canonieke roadmap, CI-contract en bescherming

### G0 — Eén canonieke F4-A/roadmap-PR uit #73/#74 kiezen en actualiseren

**Prioriteit:** P0 · **Risico:** laag, documentatie · **Blokkades:** geen.

**Gebruikersresultaat:** er is precies één actuele, betrouwbare voortgangslijst in de bestaande roadmap.

**Uitvoering:** vergelijk de volledige inhoud van beide PR's met de dan actuele `main`; neem de beste onderbouwde onderdelen samen op één branch. Laat de andere PR vervallen na bevoegd besluit; merge niet beide. Herstel de aantoonbaar onjuiste roadmapinleiding; sluit F3-A met echte PR-head-/merge-/postmergegegevens; label F4-A als *broninventaris* zolang niet alle mobiele schermtoestanden visueel zijn bekeken. Voeg F3-B en de aanvullende governance-tickets aan dezelfde roadmap toe, zonder een nieuw permanent planbestand.

**Acceptatie:** (a) één canonieke PR; (b) geen verloren gebruikersbesluiten; (c) geen onjuiste 'GESLAAGD'-claim; (d) uitsluitend docdiff; (e) geen dubbele issues of roadmapbronnen.

### G1 — CI-contract voorbereiden op een verplichte mergecheck

**Prioriteit:** P0 · **Risico:** hoog als workflow/planner aangepast · **Blokkades:** G0.

**Gebruikersresultaat:** iedere merge heeft een bruikbare en passende verplicht te controleren status zonder onnodige browsermatrix.

**Uitvoering:** onderzoek de statuschecknaam, `pull_request.paths`, docs-only gedrag en releasegate. Zorg dat een uitsluitend documentatie-PR een lichte consistente verificatie doorloopt **als** diezelfde status later verplicht wordt gesteld; PWA/opslag/financiële wijzigingen behouden hun zware controles. Gebruik de huidige planner, géén tweede workflow. Test wijzigingen in planner/CI met regressiefixtures voor docs-only, CSS, medium, high, PR/postmerge, mislukte/ontbrekende check en de geselecteerde suite.

**Acceptatie:** (a) niet ontbrekende check bij docs-only PR; (b) geen afwaardering van safety-risico; (c) centrale gate groen op exacte PR-head; (d) niet-verifieerbare runs blijven geblokkeerd.

### G2 — `main` effectief beschermen

**Prioriteit:** P0 · **Risico:** operationele GitHub-instellingen · **Blokkades:** G1.

**Gebruikersresultaat:** ongeteste of niet-goedgekeurde wijzigingen kunnen `main` niet ongemerkt vervangen.

**Uitvoering:** controleer met bevoegde eigenaar repo-regels en permissies. Richt een passende branch protection/ruleset in: geen gewone directe pushes, geen force-push/deletion, PR als normale ingang, vereiste centrale releasegate, up-to-date branch/head-controle en behoud van beheerherstelmogelijkheden. Houd rekening met GitHub-plan- en accountbeperkingen en de benodigde toestemming voor admin-instellingen. Geen experimentele force-push op `main`.

**Acceptatie:** (a) beleid is aantoonbaar actief via GitHub; (b) docs-only en code-PR zijn niet onterecht geblokkeerd; (c) falende of ontbrekende gate blokkeert merge; (d) rollbackroute beschreven. Bij ontoegankelijke instellingen: `NIET GEVERIFIEERD`, met exacte eigenaarshandeling.

**G2 — daadwerkelijk resultaat, 2 november 2026:** G1 is groen gemerged; vervolgens gaf zowel `GET /repos/jaribuijsman/Uitgavenkompas/branches/main/protection` als `POST /repos/jaribuijsman/Uitgavenkompas/rulesets` HTTP 403 `Resource not accessible by integration`. Het account heeft volgens repositorymetadata `admin:true`, maar de gekoppelde integratie kan deze beheerhandeling niet uitvoeren. Nacontrole: rulesets `[]`, `main.protected:false`. Geen beschermingsbeleid aangemaakt en geen force-push of deletie uitgeprobeerd. Deze beperking blokkeert de beveiligingsclaim, niet de onafhankelijke read-only audit of afzonderlijk gecontroleerde PR's.

**Exacte eigenaarshandeling voor G2:** open repository **Settings → Rules → Rulesets → New branch ruleset**, naam `Memento main release gate`, target `refs/heads/main`, enforcement **Active**. Vereis een pull request, opgeloste reviewgesprekken en de GitHub Actions-status `Memento release gate`; zet **Require branches to be up to date before merging** aan en blokkeer deletie en force-push. Bewaar alleen een expliciete repository-adminherstelroute als bypass, uitsluitend voor beheersherstel; gewone merges blijven via een groene PR lopen. Dit is instructie voor de ontbrekende instelling, geen bewijs dat zij actief is. Nacontrole via GitHub moet docs-only/code-PR toelaten en falende/ontbrekende gate blokkeren, zonder destructieve proef op main. Rollback/herstel: beheerder past dezelfde ruleset gericht aan; verwijder een vereiste status pas nadat de vervangende workflowstatus bewezen beschikbaar is.

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

### Fase 3B — Appbrede prototypepariteit, voortbouwend op F3-A

De bindende bronhiërarchie blijft `docs/product/README.md`. F3-A betreft alleen de Kenniscentrum-editor en drie vervolgformulieren. Algemene browserdekking of historische screenshots bewijzen geen goedgekeurde appbrede prototypepariteit. De bestaande `tests/helpers/mobile-visual-contract.cjs`, `knowledge-prototype-parity.cjs`, domeinjourneys en CI-planner blijven eigenaar; extraheer alleen aantoonbaar gedeelde primitives. Het kleine contract bevat route, referentiehash, fixture, viewport, interactiestaat, selectors/hiërarchie, toleranties, browserjourney en artifact. Geen tweede browserframework of mondiale pixelbaseline. Bewaar uitsluitend fictief bewijs op exacte PR-head, met de bestaande retentie van zeven dagen; automatische vergelijking vervangt de menselijke visuele acceptatie niet. Selecteer alleen relevante goedgekeurde routecontracten, behoud de brede safetycontrole bij gedeelde UI/opslagrisico en maak ongewijzigde schermen zonder referentie niet kunstmatig rood.

### F3-B1 — Appbreed register van goedgekeurde prototypes en staten

**Prioriteit:** P1 · **Risico:** laag voor registratie, middel voor testhulpmiddelen · **Blokkades:** F4-A.

**Gebruikersresultaat:** per route is zichtbaar welk ontwerp daadwerkelijk is goedgekeurd, wat ontbreekt en wat getest moet worden.

**Uitvoering:** registreer voor alle 19 primaire ingangen plus relevante sheets/dialogen: route, UI-eigenaar, indien aanwezig expliciet goedgekeurde referentiehash, fictieve fixture, viewport, interactiestaten, bestaande domeintest, te meten eigenschappen, bewijslocatie en status. Historische screenshots of toevallige actuele UI zijn niet automatisch een goedgekeurd prototype. Geen nieuwe referentie verzinnen.

**Acceptatie:** (a) register is volledig; (b) geen fictieve goedkeuring; (c) bestaande KC-gate behouden; (d) iedere route heeft `GESLAAGD`, `NIET GEVERIFIEERD` of `AFGEKEURD` uitsluitend op basis van werkelijk bewijs.

### F3-B2 — Eerste niet-Kenniscentrum-prototype betrouwbaar vergelijken

**Prioriteit:** P1 · **Risico:** middel/hoog afhankelijk van test/CI-diff · **Blokkades:** G1, F3-B1 en een echt goedgekeurde referentie voor de gekozen route.

**Gebruikersresultaat:** een visuele/interactionele mismatch in bijvoorbeeld Mijn dag of Taken veroorzaakt een echte rode PR-gate.

**Uitvoering:** hergebruik de kleinste generieke primitives van F3-A waar ze werkelijk algemeen zijn; laat specifieke controles in de bestaande domeinjourney. Vergelijk dezelfde fictieve toestand, maatvoering, hiërarchie, kleuren waar bindend, acties en schermen na interactie. Voeg een negatieve fixture toe die aantoonbaar rood wordt bij materiële afwijking. Gebruik geen nieuw browserframework en verlaag F3-A-assertions niet.

**Acceptatie:** (a) groene proef op juiste ontwerp; (b) rode proef bij bewust veranderd ontwerp; (c) bewijs op exacte PR-head; (d) geen extra volledige browsermatrix bij ongerelateerde kleine wijziging.

### F3-B3 — Prototypepoort gericht uitbreiden naar overige goedgekeurde routes

**Prioriteit:** P1 · **Risico:** per deel-PR volgens planner · **Blokkades:** F3-B2, per scherm een echte goedgekeurde referentie.

**Gebruikersresultaat:** nieuwe UI-aanpassingen in alle tabbladen worden automatisch getoetst waar een goedgekeurd ontwerp bestaat.

**Uitvoering:** voeg de resterende domeinen in kleine, onafhankelijk te mergen groepen toe: (1) navigatie/Mijn dag/Taken/Agenda/Instellingen, (2) Kenniscentrum-overzicht/mappen en Leven-boodschappen/wensen/Fitness, (3) de afzonderlijke financiële schermen en modals. Voer per groep relevante states, bestaande domeintests en negatieve regressie uit. **19/19 visuele goedkeuring** is pas haalbaar als er daadwerkelijk 19 goedgekeurde referenties en passende toestanden zijn; zonder die bron blijft de toestand `NIET GEVERIFIEERD`, ook bij functioneel groene CI.

**Acceptatie:** (a) iedere bestaande goedgekeurde referentie is verbonden met gerichte controle; (b) niet-geautoriseerde ontwerpen blijven als ontbrekend aangegeven; (c) ongerelateerde kleine PR's blijven snel; (d) geen materieel verlies van interactiegedrag.

### Fase 4 — Mobiele audit en goedgekeurde UX-verbeteringen

### F4-A — Echte appbrede Android UX-inventaris en ontwerpdekking

**Prioriteit:** P1 · **Risico:** read-only · **Blokkades:** G0.

**Gebruikersresultaat:** onderbouwde verbeterlijst voor alle **18 hoofdviews plus start/PIN**, inclusief relevante schermtoestanden.

**Uitvoering:** hergebruik bestaande `visual-browser`, domeinjourneys en de in #73/#74 beschreven bron- en route-inventaris. Bekijk per relevante route minstens een concrete 393px staat, primaire acties, menu's, modals, scroll, tekst, tikgebieden, toetsenbordrisico en bestaande goedgekeurde referenties. Scheid echte defecten van ongeteste voorstellen en test/ontwerptekorten; registreer prioriteit, eigenaar, bronbewijs en maximaal tien eerste UX-kandidaten. Herhaal niet automatisch de volledige matrix op 360/412/1280px.

**Acceptatie:** (a) alle hoofdviews en start/PIN geïnventariseerd; (b) bekende uitzonderingen als niet geverifieerd gemarkeerd; (c) rangorde en maximaal tien kandidaten; (d) geen appcode gewijzigd; (e) toekomstige F4-B-kandidaat expliciet gekozen en uitsluitend na werkelijk ontwerpbesluit uitgevoerd.

### F4-B — UX-verbeteringen uitvoeren in kleine goedgekeurde PR's

**Prioriteit:** P1/P2 op basis van audit · **Risico:** per UI-scope · **Blokkades:** F4-A en goedkeuring van de concrete ontwerpwijziging; voor nieuwe getrouwheidsclaims passende F3-B-contracten.

**Gebruikersresultaat:** de tien daadwerkelijk belangrijkste schermproblemen worden opgelost, zonder nieuwe cascades of verborgen functie-uitval.

**Uitvoering:** begin bij de hoogste bewezen fout/goedkeurde verbetering. Eén plaatselijke UI-uitkomst per PR. Behoud touchzones, correcte menu- en editorstatus na actie, alle filters en opgeslagen velden. Vergelijk voor/na bij dezelfde fixture. De lijst is dynamisch: een kandidaat zonder defect of gebruikersgoedkeuring wordt gemotiveerd behouden, niet kunstmatig 'gerepareerd'.

**Acceptatie:** (a) concrete afwijking weg of bewuste behoudbeslissing; (b) 393px browserroute en voor/na; (c) bij risico extra viewport/keyboard; (d) geen ongeautoriseerde scopeuitbreiding.

### Fase 5 — CSS-eigenaarschap op bewijs

### F5-A — Kenniscentrum-CSS-eigenaarschap consolideren

**Prioriteit:** P2 · **Risico:** laag/middel, planner is leidend · **Blokkades:** G0; F3-A is al gemerged.

**Gebruikersresultaat:** toekomstige editor-/mapstijlwijzigingen vereisen minder selectorzoekwerk en overschrijvingen.

**Uitvoering:** bepaal de cascade van aantoonbaar overlappende Kenniscentrum-regels. Consolideer één bewezen conflictcluster per PR en behoud specificity/media/reduced-motion, bestaande DOM en exacte editorreferentie. Geen nieuwe `!important`-patch als vervanging.

**Acceptatie:** (a) één eigenaar van het gekozen gedrag; (b) berekende stijlen en interactiestaten gelijk, tenzij een defect bewust gerepareerd wordt; (c) bestaande prototype- en domeinbrowsercontrole groen; (d) geen andere schermregressie.

### F5-B — Gedeelde CSS, taken en inline styles opruimen op bewijs

**Prioriteit:** P2 · **Risico:** middel voor gedeelde layout, hoog bij grote inline ingrepen · **Blokkades:** F4-A; parallel met F5-A alleen zonder overlappende bestanden.

**Gebruikersresultaat:** kleinere risicozone voor een eenvoudige knop- of kaartaanpassing.

**Uitvoering:** prioriteer frequent gewijzigde schermen; traceer effectieve cascade via bestaande CSS-bestanden en de 28 inline styleblokken. Behoud geldige themascope/mediaregels. Consolideer uitsluitend aantoonbaar redundante overrides, per scope, liefst via bestaande CSS-eigenaar. Geen bulkverplaatsing van alle 28 blokken.

**Acceptatie:** (a) gedocumenteerde regel/eigenaar vóór/na; (b) geen onverwachte pixel-/geometrieverandering; (c) actuele, passende domein-/layoutcheck; (d) CSS-complexiteit aantoonbaar verminderd in geselecteerde cluster.

**Behouden historisch bewijs:** PR #64 consolideerde de 44×44px-takenmenuknop al; voer datzelfde werk niet opnieuw uit. Ook dynamische classes, alternatieve notitievormen, specificiteit, bronvolgorde en mediaqueries blijven onderdeel van de cascadeanalyse.

### Fase 6 — Modulegrenzen met ongewijzigde gegevenscontracten

### F6-A — Leven-module verdiepen zonder opslagcontract te wijzigen

**Prioriteit:** P2 · **Risico:** hoog · **Blokkades:** G1 en stabiliteit van betrokken bestaande tests.

**Gebruikersresultaat:** een kleine Leven-UI-wijziging hoeft minder opslaggerelateerde code te raken.

**Uitvoering:** kies na afhankelijkheidsinspectie één concrete UI-verantwoordelijkheid die van de persistente state/writes kan worden gescheiden zonder duplicate state of tweede adapter. Gebruik een kleine interface met hoge module-depth en goede locality. Bewaak bestaande `MementoStorageGuard`, backup, ID's, conceptnavigatie, scriptsvolgorde, serviceworkerprecache en offline upgrade. Risicoselectie pas verkleinen nadat negatieve regressies bewezen geen gevaar voor opslag/financiën maken.

**Acceptatie:** (a) dezelfde data- en navigatie-uitkomst in fictieve fixture; (b) mislukte write houdt originele opslag en invoer veilig; (c) high-risk planner, data-/upgrade-/offlinechecks passend groen; (d) minder codeconcentratie of meer testbare interface aantoonbaar, geen lege wrapperlaag.

### F6-B — Financiën-module verdiepen met onveranderde berekeningen

**Prioriteit:** P2/P3 · **Risico:** hoog · **Blokkades:** G1 en bestaande financiële veiligheidsregressies.

**Gebruikersresultaat:** financierings- en schermaanpassingen zijn beter te isoleren, zonder veranderd saldo of rapportages.

**Uitvoering:** kies één logisch samenhangende verantwoordelijkheid (bijv. presentatie van één bestaande periodeweergave) die veilig achter een kleine interface kan vallen. Hergebruik `memento-finance-period-core.js` en bestaande validatie; geen dubbele rekenregels. Test overdrachten, saldi, loonperioden, afronding, terugbetalingen, categorisatie, export/import, backup, offline upgrade en mislukte writes conform werkelijk geraakt oppervlak.

**Acceptatie:** (a) uitkomsten vóór/na identiek op gerichte regressiefixtures; (b) bestaande gegevens intact; (c) toepasselijke volledige hoogrisico-CI en upgrade groen; (d) geen toename van parallelle state of code-eigenaren.

### Documentatie en bewijsbronnen

### D1 — Documentatie/evidence gericht lichter en betrouwbaarder maken

**Prioriteit:** P2 · **Risico:** laag voor inventaris, kan hoger zijn bij scripts/tests · **Blokkades:** G0.

**Gebruikersresultaat:** agents weten welke bron geldig is zonder honderd historische documenten te hoeven lezen.

**Uitvoering:** categoriseer grote evidence- en historische documentatiebestanden naar normatief / historisch / testafhankelijk. Verklaar verouderde bronnen niet-normatief waar nog onduidelijk; wijzig alleen gerichte verwijzingen. Verwijder of archiveer pas na referentiezoektocht en bewezen niet-gebruik; pin ontwerp- en bewijsbronnen die bij eerdere acceptatie horen. Doe geen prestatieclaims op basis van enkel bestandenaantal.

**Acceptatie:** (a) één canonieke router; (b) geen verdwijnend referentiebewijs; (c) agent hoeft geen volledig docs-archief meer te lezen; (d) geen wijziging van appdata of schermen.

### Fase 7 — Effectmeting en afsluiting

### F7-A — Effect meten, device controleren en afronden

**Prioriteit:** P1 als afsluitende kwaliteitsborging · **Risico:** read-only + gerichte releasecontrole · **Blokkades:** voltooiing of expliciete behoud-/uitstelbesluiten voor G0–G2, F3-B, F4, F5, F6, D1.

**Gebruikersresultaat:** aantoonbare kwaliteits- en efficiëntiewinst, met restpunten in plaats van losse beloften.

**Uitvoering:** vergelijk representatieve kleine, middelgrote en hoogrisico PR's vóór/na op centrale CI-runtime, aantal werkelijke browserjobs, correctierondes, conflicts, diffomvang en visueel afkeurpercentage. Agent-runtime/gebruikslimiet alleen vergelijken als echte Codex/Work-sessielogs beschikbaar zijn; CI-minuten zijn daar geen proxy voor. Laat de gebruiker op de fysieke Galaxy A54 de voor hem relevante standalone PWA-uitkomsten toetsen (installeerbaarheid, update, offline herstart, touch, toetsenbord, scroll, menu, lokale gegevens); geef daarvoor een kort gericht checklistje.

**Acceptatie:** (a) per doel meetbare vóór/na-data of `NIET GEVERIFIEERD`; (b) open risico's expliciet; (c) laatste relevante main-CI en Pages-status bewezen; (d) apparaatstatus niet automatisch groen zonder echte toesteltest; (e) roadmap en commitverwijzingen actueel.

---

## 3. Vaste overdracht naar een nieuwe GPT-, Codex- of Work-chat

Kopieer onderstaande opdracht en vervang uitsluitend de werkpakket-ID. `docs/TECHNISCHE_ROADMAP.md` in de repository is de live bron; lokale bestanden en chatbijlagen zijn tijdsopnames.

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

**Uitvoeringsautorisatie:** gebruiker heeft na G0 expliciet toestemming gegeven voor alle handelingen binnen dit werkplan, inclusief afzonderlijk gecontroleerde merges en GitHub-beheer. Niet opnieuw om routinebevestiging vragen. Tests, gegevensbehoud en waarheidsgetrouwe bewijsstatus blijven vereist. G0 is gemerged; G1 volgt vanaf opnieuw gecontroleerde `main`.

## 4. Uitvoerlog — na iedere PR aanvullen, niet vooruit invullen

| Datum | Werkpakket | PR / finale SHA | Test / artifact / CI-run | Visuele/gegevensstatus | Besluit en resterend risico |
|---|---|---|---|---|---|
| 2026-11-02 | Roadmap opgesteld | Geen GitHub-mutatie | Repository read-only: `main` `248a5dd8` | Implementatie NIET GEVERIFIEERD | Startpunt; alle werkpakketten OPEN |
| 2026-11-02 | F0-A | [PR #67](https://github.com/jaribuijsman/Uitgavenkompas/pull/67) · head `cf57b02c2d85c58d91d1d1c3f5612cc7b863a7ac` · merge `e638d94e7759a5ada5113e1cf714f1e6cbb6b14b` | [PR-head CI 41453028522](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522) alle checks groen; [393px prototype/app-screenshots](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522/artifacts/13146400500); lokaal 360/393/412px en korte viewport; [postmerge 41453744164](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453744164) groen | Drie vervolgvormen, bronrelatie, afspraakdatum/-tijd, gewone en gestructureerde notities en opslagbehoud GESLAAGD; fysieke A54 NIET GEVERIFIEERD | Gemerged door gebruiker; identieke geteste Git-tree; live HTML-assetversies en `sw.js`-cache `v120` gecontroleerd. Restrisico: reeds geïnstalleerde clients en fysieke A54 niet individueel gecontroleerd. |

| 2026-11-02 | F1-A | [PR #69](https://github.com/jaribuijsman/Uitgavenkompas/pull/69) · head `798af6df28e1942897e1fb52da895d7ad44058bf` · merge `99b78c04183cbf012b050a8bf61c99bb7382094b` | [PR-head CI 41456245800](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456245800): plan en releasegate groen; browser/core/upgrade correct overgeslagen voor docs-only | Geen runtime-/opslagwijzigingen; documentatie-diff vergeleken; fysieke A54 niet van toepassing | Compacte AGENTS-router en niet-normatieve efficiencyhistorie gemerged na behoud van F0-A; tijdwinst nog niet gemeten. |

| 2026-11-02 | F2-A | [PR #70](https://github.com/jaribuijsman/Uitgavenkompas/pull/70) · head `e98590256aac1422916eca971c057e7d8737fd67` · merge `86460f546b258cf70ebd1683c2a1a2d617954e6b` | [CI 41456791941](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456791941): zes shards en 30 plannerchecks groen; [kennisartifact](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456791941/artifacts/13147900660) | Knowledge-journey in full-run 2×→1×; 22→21 browseruitvoeringen; gegevenscode ongewijzigd | `interface-visual` 51→36 s, totale CI 176→208 s in twee verschillende runs: **geen aangetoonde totale versnelling**; fysieke A54 niet van toepassing. |

| 2026-11-02 | F2-B | [PR #71](https://github.com/jaribuijsman/Uitgavenkompas/pull/71) · head `d78d8f88ad246687fe32406a2d902a03ab43f7d1` · merge `55ac17b798a4d54c68a8d4536cb8fa6ef56b89be` | [CI 41475455926](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41475455926): 31 plannerchecks, zes browserversnipperingen, releasegate groen | Verouderde handmatige V1-routes vervangen, originele tests behouden; applicatiecode ongewijzigd | Afzonderlijke nieuwe handmatige dispatchruns niet uitgevoerd, dus die uitvoerbaarheid NIET GEVERIFIEERD. |

| 2026-11-02 | F3-A | [PR #72](https://github.com/jaribuijsman/Uitgavenkompas/pull/72) · head `1bbc4a9723f1f3f62ad852b1fc98bbb85297a4f1` · merge `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3` | [Finale CI 41498366958](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958): 9 parityregressies, 31 plannerchecks, alle zes browsershards en releasegate groen; [prototype-/appscreenshots](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958/artifacts/13168131309) | Scope alleen Kenniscentrum-editor: acht gereproduceerde states; ander UI NIET GEVERIFIEERD | Postmerge [run 41499328108](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41499328108) groen, [Pages 41499326013](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41499326013) groen; fysieke A54 niet getest. |

| 2026-11-02 | G0 | Canonieke [PR #74](https://github.com/jaribuijsman/Uitgavenkompas/pull/74); basis `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3`; consolidatie van #73 en #74 | Volledige beide docdiffs vergeleken; route-ID's met navigatie en browserbronnen vergeleken; F3-A-head-CI, postmerge en Pages opnieuw via GitHub gelezen: success op genoemde SHA's | Alleen dit Markdown-bestand gewijzigd; geen runtime, opslag, browser of toestel gewijzigd/getest | Gereed voor mergebeoordeling, niet gemerged. Docs-only planner: tier none, geen browser/upgrade; huidige workflow triggert geen docs-only PR. G1 moet dit vóór G2 herstellen; geen nieuwe groene CI-claim. |

## 5. F4-A — read-only scherminventarisatie, prioriteiten en appbrede pariteitsdekking

**Onderzoekspunt:** `main` `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3`, 2 november 2026. Bron: actuele `assets/memento-unified-nav.js`, `memento-life-app.js`, `memento-settings.js`, `memento-start.js`, `memento-finance-app.js`, relevante kennis-/fitnesstests, `tests/visual-browser.cjs`, `tests/helpers/visual-assertions.cjs`, `docs/mijn-dag-v3-acceptance.md`, `docs/taken-v4-acceptance.md`, F3-A-bewijs en historische `docs/design-review`. Dit is **een code-/testcontract-inventarisatie**: géén nieuwe fysieke A54-test, geen live 393px browserinspectie van elke toestand, geen nieuwe gebruikersgoedkeuring of bewijs van actueel visueel defect. Bewaak dit onderscheid bij alle voorstellen.

**Feitelijke routes:** `assets/memento-unified-nav.js` bevat **Leven (8)**: Fitness, Mijn dag, Taken, Agenda, Notities, Boodschappen, Wensen, Instellingen; en **Financiën (10)**: Overzicht, Transacties, Analyse, Budgetten, Rekeningen, Planning, Slim Kopen, Geldcoach, Bonnetjes, Instellingen. De onderste balk toont per gebied vier voorkeursroutes plus Meer; het menu bevat de overige bestemmingen. Dit zijn **18 hoofdviews**, niet 18 onafhankelijke opslaggebieden of 18 reeds goedgekeurde prototypes. Start/PIN, menu's, dialogen en actie-/scrolltoestanden behoren daarnaast tot de appbrede eis.

**Route-ID's en aanvullende brondekking uit #73:** Leven `today`, `tasks`, `groceries`, `wishes`, `agenda`, `notes`, `fitness`, `backup`; Financiën `dashboard`, `transactions`, `analysis`, `accounts`, `budgets`, `planning`, `smartbuy`, `moneycoach`, `receipts`, `settings`. `#mementoStart` is de 19e primaire ingang; PIN en overlays zijn aanvullende staten. `tests/release-acceptance-browser.cjs` en `tests/glass-rendering-browser.cjs` bevatten dezelfde 18 hoofdroutes; `tests/memento-start-browser.cjs` en `tests/global-search-browser.cjs` dekken afzonderlijke start-/zoek-/conceptnavigatie. `docs/mijn-dag-v3-acceptance.md` en `docs/taken-v4-acceptance.md` zijn tekstuele contracten, geen universele vaste HTML-referenties. Ook `tests/visual-layout-browser.cjs` en `tests/calendar-header-browser.cjs` blijven relevant voor agenda/menu/hitbox; `#addTransaction`, `#txForm`, `#ml-receipts [data-ml-tab]` en `#fitnessDialog` zijn aanvullende bestaande interactie-ingangen, geen bewezen defecten.

**Huidige dekking (niet verwarren met prototypepariteit):** `tests/visual-browser.cjs` doorloopt alle 18 genoemde hoofdviews met een fictieve fixture en maakt screenshots; `tests/helpers/visual-assertions.cjs` borgt o.a. 44px-navigatie, boodschappen-/agendacellen, lege transactiefilters en transactiemodals. De huidige centrale high-risk matrix draait zes domeingroepen, **niet standaard de losse volledige `visual-browser.cjs`**, die onder `interface-smoke` voor gerichte/na-merge selectie staat. Domeinsuites controleren o.a. Mijn dag (`day-v3-browser.cjs`), Taken (`taken-v4-browser.cjs`), Kenniscentrum (`knowledge-workspace-browser.cjs`), Fitness (`fitness-browser.cjs`), en financiën/opslag (`app-review-browser.cjs`, `storage-safety-browser.cjs`). **Strikte vastgezette HTML-pariteit bestaat op dit moment alleen voor de Kenniscentrum-editor/vervolgflow in F3-A.** De historische design-review heeft vóór-/na-beelden maar is geen appbreed, definitief door de gebruiker goedgekeurd referentiearchief.

### Maximaal tien geprioriteerde, op code of bestaand testcontract gegronde kandidaten

| # | Scherm/staat — concrete bron of route | Vastgestelde code-/testfeit; geen ongegrond UX-defect | Voorstel / volgende verificatie |
|---|---|---|---|
| 1 · P1 | **Hele app**, `assets/memento-unified-nav.js` (`life`/ `finance`), `tests/visual-browser.cjs` | 8 + 10 hoofdviews hebben geen uniforme, bindende prototypehash/statenmatrix; huidige F3-A gate is gericht op één editor | **Behouden** bestaande tests; **F3-B** appbrede contracten per gewijzigde route vastleggen, niet alle views op iedere PR testen |
| 2 · P1 | **Instellingen**, `assets/memento-settings.js` `create()`, `navigate()`, `mountLife()`, `mountFinance()` en `[data-ms-target]` | Twee area-shells met dezelfde acht paginanamen verplaatsen bestaande controls; sommige items navigeren tussen Leven/Financiën. Dit is geen bewijs van dubbele handlers | **Behouden** echte controls; visueel 393px nav→detail→terug en diep-links controleren, tekst/verkorte uitleg pas **na** ontwerpgoedkeuring |
| 3 · P1 | **Mijn dag/afspraakkaarten**, `[data-life-view=today]`, `docs/mijn-dag-v3-acceptance.md`, `tests/day-v3-browser.cjs` | Bestaand contract beschrijft 44px-acties, notitie, menu, gegroepeerde afspraken, korte viewport en states na interactie | **Behouden** contract; referentiehash + screenshots voor open menu, notitie-overlay, lange titel en onderkant pas na expliciete visuele referentiekeuze |
| 4 · P1 | **Taken/Belangrijk**, `renderTasks` en `__important__` in `assets/memento-life-app.js`, `tests/taken-v4-browser.cjs` | Render bevat een afzonderlijke Belangrijk-groep vóór overige categoriegroepen, en afzonderlijke taakopties; geen bewezen duplicaatactie | **Behouden** bestaande Belangrijk-plaatsing; controleer de mobiele lijst, open opties, compacte kaart en 44px-doelen met bestaande fixture; niet blind samenvoegen |
| 5 · P1 | **Kenniscentrum Overzicht/Mappen/Notities**, `.kc-local-tabs`, `tests/knowledge-workspace-browser.cjs` | Domeinjourney test tabvolgorde, ingeklapte mappen en swipen; de vaste F3-A HTML-referentie heeft **editor-scope**, niet deze overzichtsviews | **Behouden** functionaliteit; per overzicht-/mapstaat een afzonderlijk goedgekeurd contract/beeld toevoegen in F3-B |
| 6 · P2 | **Transacties & betaalmodal**, `#toggleMoreTxFilters`, `#txMoreFilters`, `#modalContent`, `showModal` in Finance | Filterdrawer, lege resultaten, invoer, focus/Escape en opgeslagen bedragen zijn bestaande onafhankelijke paden in de testhelpers | **Behouden** filters/validatie; 393px open filter en modal (ook toetsenbord/korte hoogte) visueel toetsen vóór inkorten van uitleg |
| 7 · P2 | **Startscherm/PIN**, `assets/memento-start.js` `[data-ms-slide]`, `[data-ms-create]`, `tests/memento-start-browser.cjs` | Startcarrousel heeft 2 slides, snelle taak/notitie/transactieacties; interacties lopen via bestaande handlers, PIN heeft afzonderlijke veiligheid | **Behouden** start/PIN-gedrag; bevries alleen werkelijk goedgekeurde startreferentie, test na slidewissel en eerste taak. PIN nooit grafisch herschrijven vanuit historische screenshot |
| 8 · P2 | **Fitness**, `[data-fit=tab]`, `tests/fitness-browser.cjs` en `assets/memento-fitness.js` | Bestaande browserroute bereikt schema/voortgang en actieve sessies; een statische eerste screenshot dekt dat niet volledig | **Behouden** session state; beoordeel 393px tabwissel, set-editor en timer-overlay; pas na expliciete referentie ontwerpverschil claimen |
| 9 · P2 | **Boodschappen/Wensen/Agenda**, `[data-life-view]`, `assets/memento-life-app.js`, `tests/helpers/visual-assertions.cjs` | Navigatie en agenda-/boodschappendoelen hebben reeds domein- en aanraakcontroles; geen bewijs dat overeenkomende knoppen dezelfde werking hebben | **Behouden** aparte handlerketens; let op lange boodschappenlijsten, uitgeklapte acties, selectie/filters en zeven kalenderkolommen bij gerichte F3-B-test |
| 10 · P2 | **Overig Financiën** (Overzicht, Analyse, Budgetten, Rekeningen, Planning, Slim Kopen, Geldcoach, Bonnetjes), `#view-*`, `assets/memento-finance-app.js`, `assets/memento-tab-layout.js` | Alle routes zitten in de huidige navigatie; optionele uitlegsecties worden deels bewust onder een disclosure geplaatst; geen individuele vastgezette ontwerpvergelijking | **Behouden** onderliggende berekeningen en procedures; route per keer valideren inclusief lege staat, filters en open details, pas daarna `verplaatsen/samenvoegen` voorstellen |

**F4-A-beoordeling:** uitsluitend de bron-/testroute-inventaris is beschikbaar; F4-A blijft **IN UITVOERING**; individuele nieuwe visuele bevindingen, vermeend overbodige controls, echte A54 en 393px browserinspectie voor alle 18 views zijn **NIET GEVERIFIEERD**. **Geen verwijder-/samenvoegopdracht verleend** en geen F4-B-productiewijziging toegestaan zonder een afzonderlijk goedgekeurd voorstel. Volg eerst de uitvoervolgorde hierboven: na G0/G1–G2 de echte F4-A-browseraudit, daarna F3-B1 en de op referenties gebaseerde vervolgstappen.

**Kleine eerste F4-B-kandidaat (nog niet goedgekeurd):** inspecteer uitsluitend het Kenniscentrum-tabblad **Mappen** op 393px met een ingeklapte en uitgeklapte map. Vergelijk een door de gebruiker goedgekeurd compact ontwerp met `.kc-local-tabs`, `.kc-tree-children` en de bestaande mapuitklaphandler. Acceptatie: tabvolgorde/labels en alle map-ID's behouden, 44×44 hitbox, geen horizontale overflow, dezelfde mapuitklap-/terugkeerroute, voor/na-screenshot exact dezelfde fixture. Zonder ontwerpgoedkeuring **geen UI-wijziging**.

| 2026-11-02 | G1 | Basis `1b5de33824a41fa56109ea46b7469870e4297185`; branch `ci/g1-required-release-gate` | Docs-only PR-trigger zonder browsermatrix; gate eist exact geselecteerde success/skipped-resultaten; positieve/negatieve planner-, postmerge- en gatefixtures | Geen app-/opslagwijziging; volledige high-risk PR-gate vereist wegens workflow/planner | PR-head-CI en merge nog OPEN. G0 gemerged met expliciete gebruikersautorisatie; voor G0 bestond geen docs-CI-trigger. Rollback: revert G1; vóór terugdraaien eerst vereiste check/ruleset afstemmen zodat docs-PR niet permanent pending blijft. |

| 2026-11-02 | G1 afsluiting / G2 | G1 [PR #75](https://github.com/jaribuijsman/Uitgavenkompas/pull/75), head `b833bd304b6534fb5080f10c26217c39465a9738`, merge `9a78cdb00863ca8caab9a5ac934edbe5a07ca592`; Taken-synchronisatie [PR #76](https://github.com/jaribuijsman/Uitgavenkompas/pull/76), merge `21f92d131c1ec293160905df759ab8845636fd87` | G1 [CI 41504372835](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504372835) groen: zes browsershards, core, planner en gate; gerichte Taken [CI 41504148453](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504148453) groen. Eerste G1-run 41503307047 terecht rood op onmiddellijke opslaglezing; geen productassertion afgezwakt | Geen app-/opslagwijziging; G2 API 403, daarna protected:false en rulesets:[] | G2 GEBLOKKEERD; exacte eigenaarshandeling hierboven. Deze doc-PR verifieert de nieuwe lichte docs-only gate. Geen fysieke A54-claim. |
