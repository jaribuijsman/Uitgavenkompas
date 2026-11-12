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
| G1 | Centrale CI-status ook voor documentatie-PR's beschikbaar maken | P0 | Hoog, workflow/planner | GESLAAGD | [PR #75](https://github.com/jaribuijsman/Uitgavenkompas/pull/75), head `b833bd304b6534fb5080f10c26217c39465a9738`, merge `9a78cdb00863ca8caab9a5ac934edbe5a07ca592`, [CI 41504372835](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504372835); docs-only [CI 41505128968](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41505128968): plan/gate groen, core/browser/upgrade skipped |
| G2 | `main` effectief beschermen | P0 | GitHub-beheerinstellingen | GEBLOKKEERD — NIET GEVERIFIEERD | GET protection en POST ruleset: HTTP 403 `Resource not accessible by integration`; regels `[]`, `protected:false` na poging op `9a78cdb` |
| F0-A | Afwijking na PR #66 vaststellen en herstellen | P0 | Hoog als `memento-life-app.js` geraakt wordt | GESLAAGD | [PR #67](https://github.com/jaribuijsman/Uitgavenkompas/pull/67) · merge `e638d94e7759a5ada5113e1cf714f1e6cbb6b14b` · [PR-head-run 41453028522](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522) · [beelden](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41453028522/artifacts/13146400500) |
| F1-A | `AGENTS.md` en efficiencyregels consolideren | P1 | Laag, documentatie | GESLAAGD | [PR #69](https://github.com/jaribuijsman/Uitgavenkompas/pull/69) · merge `99b78c04183cbf012b050a8bf61c99bb7382094b` · [PR-head CI 41456245800](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456245800) |
| F2-A | Dubbele browserjourney in volledige CI oplossen | P1 | Hoog: CI-planner/groepen | GESLAAGD | [PR #70](https://github.com/jaribuijsman/Uitgavenkompas/pull/70) · merge `86460f546b258cf70ebd1683c2a1a2d617954e6b` · [CI 41456791941](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41456791941) |
| F2-B | Historische handmatige workflows en tests corrigeren | P1 | Hoog: workflows; veiligheidsdekking behouden | GESLAAGD (centrale CI) | [PR #71](https://github.com/jaribuijsman/Uitgavenkompas/pull/71) · merge `55ac17b798a4d54c68a8d4536cb8fa6ef56b89be` · [CI 41475455926](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41475455926); handmatige dispatch NIET GEVERIFIEERD |
| F3-A | Prototypevergelijking in bestaande domein-CI afdwingbaar maken | P1 | Hoog bij workflowaanpassing | GESLAAGD (Kenniscentrum-scope) | [PR #72](https://github.com/jaribuijsman/Uitgavenkompas/pull/72) · merge `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3` · [head-CI 41498366958](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958) · alleen Kenniscentrum-editor/vervolg, **niet appbreed** |
| F3-B1 | Appbreed register van goedgekeurde referenties en staten | P1 | Laag/middel | GESLAAGD (register) | 19 ingangen plus overlaystaten in §6; expliciete hashes en ontbrekende goedkeuringen; geen 19/19-claim |
| F3-B2 | Eerste niet-Kenniscentrum-prototype afdwingbaar vergelijken | P1 | Middel/hoog | GEBLOKKEERD — referentie ontbreekt | Geen vastgezette goedgekeurde niet-KC HTML-/schermreferentie gevonden; tekstcontracten zijn afzonderlijk geregistreerd |
| F3-B3 | Poort uitbreiden naar overige goedgekeurde routes | P1 | Per deel-PR volgens planner | GEBLOKKEERD — na F3-B2 | Overige routes hebben geen goedgekeurde versievastgelegde visuele referentie; bestaande domeinjournies behouden |
| F4-A | Per tabblad UX/tekst/knoppen-audit, read-only | P1 | Geen codewijziging | GESLAAGD (browserinventaris met expliciete uitzonderingen) | 61 vastgelegde staten op 393px; 18 hoofdviews + start/PIN; bron/evidence en uitzonderingen in §5; fysieke A54 NIET GEVERIFIEERD |
| F4-B | Eerste goedgekeurde UI-vereenvoudiging uitvoeren | P2 | Laag/middel afhankelijk van diff | GESLAAGD | [PR #80](https://github.com/jaribuijsman/Uitgavenkompas/pull/80), head `f5629c157fddf9ab8c86a64f4e7d23a85b49fcb7`, merge `7f51c5b20400ac0bdecf15f2be1f843c5cd0fe00`, [CI 41506489816](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41506489816) groen; 44×44 op vier viewports |
| F5-A | Kenniscentrum-CSS-cascade consolideren | P2 | Laag/middel, werkelijk effect verifiëren | GESLAAGD | [PR #81](https://github.com/jaribuijsman/Uitgavenkompas/pull/81), head `4418be1ba06ef85cb0ea74e99c2b80ec268e7f66`, merge `1d490d9f402f6797797c4592b6a7ab42823f0427`, [CI 41507119123](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41507119123) groen; 34 beelden pixelgelijk |
| F5-B | Gedeelde/taken-CSS alleen bij bewezen duplicatie opschonen | P2 | Middel bij gedeelde CSS | GESLAAGD | [PR #82](https://github.com/jaribuijsman/Uitgavenkompas/pull/82), head `3f7086c07a5aa36b3cc1c57facabf153bb9cca30`, merge `dd0bcb2736eafb1cb421684d786bd86adc9ad0e3`, [CI 41507906393](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41507906393) groen; computed styles gelijk |
| F6-A | Leven: één UI-verantwoordelijkheid losmaken van persistentie | P2 | Hoog, opslag-/upgradecontract | GESLAAGD | [PR #83](https://github.com/jaribuijsman/Uitgavenkompas/pull/83), head `810737c431b30293dd7319a614a3857841bcd824`, merge `5a8b4a34fd88a64c8bdbb88efd0df4fbe519ee8f`, [CI 41511453710](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41511453710) groen: zes browsergroepen + upgrade |
| F6-B | Financiën: één modulegrens vereenvoudigen | P3 | Hoog, financiële integriteit | GESLAAGD | [PR #85](https://github.com/jaribuijsman/Uitgavenkompas/pull/85), head `a4e3c7e0057d8e06180ac6936b6c84500cb3d6b7`, merge `1c8a73d432d89f67aa57cd288095794ede635dc0`, [CI 41512472162](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41512472162) groen: zes browsergroepen + upgrade |
| D1 | Historische documentatie en bewijsbronnen ordenen | P2 | Laag, uitsluitend documentatie | GESLAAGD | [PR #86](https://github.com/jaribuijsman/Uitgavenkompas/pull/86), head `851b7d77b57b51e704b4b5abd00ea1e37bd04946`, merge `6692be5c948398e6e914e0b21d58382d89f9f070`, [docs-CI 41513484891](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41513484891) groen |
| F7-A | Effectmeting, device- en productiecontrole | P1 | Read-only en gerichte releasecontrole | NIET GEVERIFIEERD voor volledige afsluiting; metingen/livechecks uitgevoerd | §7: exacte CI-meting, bronbytes en live offline groen; G2, F3-B2/B3 en fysieke A54 blijven expliciet open |
| A-20261112 | CI-register, icoonjourney en algemene rooktest herstellen | P1 | Hoog: planner/runner; geen appcode | GESLAAGD — CI, merge en publicatie binnen deze scope | [PR #119](https://github.com/jaribuijsman/Uitgavenkompas/pull/119); head `184eb813732b1d13c7b50d0c7bc531aadd1b9c5a`; merge `331fa87d31938d8283b17b961e1ffa7d3afe797c`; [CI 43312061603](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312061603), [postmerge 43312655340](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312655340) en [Pages 43312653661](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312653661) groen. Fysieke A54 niet getest. |

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
| 2026-11-02 | G1 afsluiting / G2 | G1 [PR #75](https://github.com/jaribuijsman/Uitgavenkompas/pull/75), head `b833bd304b6534fb5080f10c26217c39465a9738`, merge `9a78cdb00863ca8caab9a5ac934edbe5a07ca592`; Taken-synchronisatie [PR #76](https://github.com/jaribuijsman/Uitgavenkompas/pull/76), merge `21f92d131c1ec293160905df759ab8845636fd87` | G1 [CI 41504372835](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504372835) groen: zes browsershards, core, planner en gate; gerichte Taken [CI 41504148453](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504148453) groen. Eerste G1-run 41503307047 terecht rood op achtergebleven schatting 3; PR #76 verbeterde de lees-synchronisatie maar bleek later onvoldoende. De vertraagde autofocusrace is afzonderlijk reproduceerbaar gemaakt en gerepareerd; geen productassertion afgezwakt | Geen app-/opslagwijziging; G2 API 403, daarna protected:false en rulesets:[] | G2 GEBLOKKEERD; exacte eigenaarshandeling hierboven. Deze doc-PR verifieert de nieuwe lichte docs-only gate. Geen fysieke A54-claim. |
| 2026-11-02 | F4-A | Basis `2275741f0c9cc6808442058ceaa00813ffc80edf`; branch `docs/f4a-rendered-mobile-audit` | 61 geïsoleerde Chromium-staten op 393px, inclusief korte hoogte; JSON, viewport-JPEG en herhaalbare captures in docs/design-review/f4-a-20261102 | 18 hoofdviews plus start/PIN daadwerkelijk gerenderd; screenshots bekeken; geen appcode of productiegegevens gewijzigd | Inventaris met expliciete uitzonderingen; acht kandidaten. Planning-hitbox gekozen voor F4-B; ontbrekende prototypes en fysieke A54 blijven NIET GEVERIFIEERD. |
| 2026-11-02 | F3-B1 / B2–B3 | Basis `0e3210c15afb0a5d70c7add63a68918f543ca8c7`; F4-A [PR #78](https://github.com/jaribuijsman/Uitgavenkompas/pull/78), merge `0e3210c15afb0a5d70c7add63a68918f543ca8c7`, head `0b25ef3cea7d0ba266e4b536a6ca6c4929d5a173`, [docs-CI 41505583725](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41505583725) groen | Alle 19 ingangen, UI-eigenaren, domeintests, fixture/hash/viewport, states, bewijslocaties en goedkeuringsstatus vastgelegd; KC-HTML-blob gecontroleerd | F3-B1 register GESLAAGD; bestaande KC-gate behouden. B2/B3 NIET GEVERIFIEERD wegens ontbrekende niet-KC visuele referentie | Geen appcode of automatische goedkeuring gemaakt. Onafhankelijke F4-B/F5/F6/D1 volgen binnen de geautoriseerde scope. |
| 2026-11-02 | F4-B | Basis `e50ebcff25a15b3ec424b6c27690e2ee0a2847d8`; F3-B1 [PR #79](https://github.com/jaribuijsman/Uitgavenkompas/pull/79), [CI 41506060873](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41506060873) groen | Planning-editbuttons in bestaande CSS-eigenaar naar minimaal 44×44; echte edge-hit-testing en openen/annuleren in app-review-browser | Bedragen, IDs, betaalregistratie, vaste lasten en doelen behouden; index/precache/cacheversie consistent bijgewerkt | Centrale relevante head-CI en visuele nacontrole nog OPEN; rollback via revert met nieuwe cacheversie. Overige kandidaten bewust buiten deze eerste gerichte reparatie. |
| 2026-11-02 | F5-A | Basis `7f51c5b20400ac0bdecf15f2be1f843c5cd0fe00`; branch `refactor/f5a-knowledge-header-owner` | Cascade: vroege `.kc-editor-head` top72/z25/achtergrond werd later altijd vervangen door topvar/z3/achtergrond; korte top66 werd door dezelfde latere regel overschreven. Effectieve gemeenschappelijke waarden nu in één eigenaar, late regel en dode top66 verwijderd | Specificiteit en media-fonts behouden; geen nieuwe important-regels of DOM-/handlerwijziging. V3-specifieke header blijft eigen contract houden | Gematchte berekende stijlen en bestaande prototype-/domeinjourney, exacte head-CI en merge nog te bewijzen; rollback via revert met nieuwe cacheversie. |
| 2026-11-02 | F5-B | Basis `1d490d9f402f6797797c4592b6a7ab42823f0427`; branch `refactor/f5b-dialog-footer-owner` | `.life-dialog-footer` had display/align/wrap in base, latere justify/border en uiteindelijke UI-afmetingen; nu één complete gemeenschappelijke regel in memento-ui.css. Alle 10 footerstates behouden exact dezelfde computed styles/geometrie; 9 beelden pixelgelijk, 2 budgetmodal-randpixels verschillen 1 RGB-eenheid | [Vergelijkingsrapport](design-review/f5-b-footer-owner-20261102/comparison.json), [vóór taakeditor](design-review/f5-b-footer-owner-20261102/before-task-editor.jpg), [na](design-review/f5-b-footer-owner-20261102/after-task-editor.jpg). Geen materiële visuele afwijking; formulier-specifieke has/media-regels en PR #64-takenmenu behouden | Cachecheck en gerichte Mijn dag/layoutjourneys groen; centrale medium head-CI bepaalt merge. Geen app-/opslagwijziging of nieuwe important; rollback via revert met nieuwe cacheversie. |
| 2026-11-02 | F6-A | Basis `dd0bcb2736eafb1cb421684d786bd86adc9ad0e3`; branch `refactor/f6a-life-task-presentation` | Eén samenhangende editorpresentatie uit gemengde Life-module naar memento-life-presentation.js: timeromhulsel, timercontrols en staprijen; kleine pure interface. 33 oude/nieuwe rendergevallen exact gelijk, geen mutaties; tests gebruiken dezelfde interface | Bestaande state, timerCheckpoint/acties, validatie, conceptnavigatie, IDs en guarded writes blijven bij hun bestaande eigenaar. Script synchroon vóór life-app en in precache; planner blijft HIGH + upgrade | Gerichte core/browser, negatieve opslag-/offline-upgrade en volledige centrale high-risk gate vereist; geen risicodowngrade of schemawijziging. Rollback: revert met nieuwe cacheversie; data behouden. |
| 2026-11-02 | Blokkerende focusfix bij F6-A | Basis `dd0bcb2736eafb1cb421684d786bd86adc9ad0e3`; branch `fix/task-editor-autofocus-race` | Nieuwe schedulingstress vertraagt uitsluitend de bestaande 20ms-autofocus naar 500ms. Oude code reproduceerbaar rood: na expliciet typen in lifeTaskEstimate is de actieve control BUTTON / Sluiten / life-close. De sluitknop kon de Backspace van de test overnemen; alleen wachten op opslag was onvoldoende | showDialog focust nu alleen als de dialoog nog open is en er niet al focus binnen staat. De stresscontrole is groen en Backspace wist nu werkelijk de schatting; annuleren bewaart exact de oude taskdata. Bestaande null-assertion en safetytests intact | Lokale complete Taken-journey en cachecheck groen. [PR #84](https://github.com/jaribuijsman/Uitgavenkompas/pull/84) groen gemerged in `909adc595c4d5de5e07f506edae17ac18fd5696a`; [CI 41510153098](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41510153098) met zes browsergroepen + upgrade geslaagd; F6-A opnieuw volledig toetsen. Geen opslagcontract of nieuwe interface gewijzigd. |
| 2026-11-02 | F6-B | Basis `5a8b4a34fd88a64c8bdbb88efd0df4fbe519ee8f`; branch `refactor/f6b-finance-period-presentation` | De zichtbare periode-/filtertekst van zes financiële views staat nu achter één pure `periodContext`-interface in memento-finance-presentation.js. 192 oude/nieuwe view/maand/loonperiode/rekening/eigen datums/filter/zoektermgevallen exact gelijk, inputs onveranderd | DOM-selectie, account-/datumfilters, memento-finance-period-core, bedragen, totalen, rekeningen, validatie en guarded writes blijven in Finance. Geen dubbele rekenregel of state; nieuwe module synchroon vóór Finance en in precache | Zelfde textContent-uitkomst; geen HTML-injectiepad. HIGH + zes browsergroepen + upgrade verplicht. Gerichte regressies, echte browser, data/offline-upgrade en finale head-CI bepalen acceptatie. |
| 2026-11-02 | D1 | Basis `1c8a73d432d89f67aa57cd288095794ede635dc0`; branch `docs/d1-evidence-source-routing` | Bestaande productrouter categoriseert normatief/historisch/testafhankelijk; vier oude rapporten/audits en design-review-index krijgen uitsluitend een zichtbare tijdsopnameverwijzing. Alle oorspronkelijke bodies en gepinde KC-HTML ongewijzigd | Code/workflow/Markdown-referenties onderzocht; niets verwijderd of gearchiveerd vanwege actieve test-/bewijs-/herkomstwaarde. Uitvoerlog weer één geldige tabel met behouden aanvullende meetnotities | Alleen docs; geen app-, data- of testwijziging. Diff/links/bodybehoud en lichte docs-gate vereist; geen runtime-/agenttijdwinstclaim op bestandenaantal. |
| 2026-11-12 | A-20261112 | [PR #119](https://github.com/jaribuijsman/Uitgavenkompas/pull/119); head `184eb813732b1d13c7b50d0c7bc531aadd1b9c5a`; merge `331fa87d31938d8283b17b961e1ffa7d3afe797c` | [PR-CI 43312061603](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312061603), [postmerge 43312655340](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312655340) en [Pages 43312653661](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312653661) groen; lokaal 34 coretests, 36 plannergevallen en zes browsergroepen | 85 live-bestandscontroles gelijk; 393px-livebrowser en offline Taken-herlaad groen; app-/opslagcode ongewijzigd | Expliciet geautoriseerd gepusht, gemerged en gepubliceerd. Quickfit/releasebescherming blijven apart; fysieke A54 en bestaande PWA niet getest. |

### Aanvullend verificatiebewijs

**F5-A lokale verificatie:** [vergelijkingsrapport](design-review/f5-a-header-owner-20261102/comparison.json): alle 34 screenshots pixelgelijk vóór/na; alle berekende CSS-eigenschappen én geometrie van de editorheaders identiek in 21 gerenderde states. Bestaande KC-journey inclusief acht bindende prototypevergelijkingen en 360/393/412/korte-editorstaten groen; geen JS-fouten. [Vóór](design-review/f5-a-header-owner-20261102/before-approved-plain-editor-same-fixture.jpg) / [na](design-review/f5-a-header-owner-20261102/after-approved-plain-editor-same-fixture.jpg). Cachecheck groen. Planner medium, life-knowledge plus interface-layout-smoke (de huidige planner selecteert deze ook bij HTML-versieparameters), upgrade false; centrale exacte head-CI volgt.



**F6-A lokaal bewijs op actuele basis `909adc595c4d5de5e07f506edae17ac18fd5696a`:** [33 exacte oude/nieuwe rendergevallen en beelden](design-review/f6-a-life-presentation-20261102/comparison.json). Bestaande Taken-journey inclusief nieuwe autofocusstress op 360/393/412/1280, mislukte metingwrite, conceptbehoud, terugkeer/undo en ZIP groen. 17 van 19 ruwe beelden pixelgelijk; één beginlijst heeft een andere focus-halo, één korte editor is 12px anders gescrold tijdens het uitlopen van een bestaande scrollcorrectie. De [genormaliseerde korte vergelijking vóór](design-review/f6-a-life-presentation-20261102/before-393-short-normalized.png) / [na](design-review/f6-a-life-presentation-20261102/after-393-short-normalized.png) heeft exact dezelfde focus, scroll, geometrie én pixels. Pure interface valideert veilige escaping en onveranderlijke inputs. 87 domeinregressies, 22 opslagveiligheidsgevallen, scriptvolgorde en [upgrade vanaf de focusfix-main](design-review/f6-a-life-presentation-20261102/upgrade.json) groen: data/PIN/bijlagehash behouden, nieuw asset offline aanwezig, cache v125. Life-app 181259→179531 bytes; geen claim van kleinere totale download of agenttijd. De mergeconflicten in roadmap/assetversies zijn met behoud van beide wijzigingen opgelost; geen bron-/opslaggedrag vervangen.



**F6-B lokaal bewijs:** [192 exacte contextvergelijkingen en 30 pixelgelijke financiële viewportbeelden](design-review/f6-b-finance-context-20261102/comparison.json), [herhaalbare oude/nieuwe vergelijking](design-review/f6-b-finance-context-20261102/differential.cjs), [vóór Analyse](design-review/f6-b-finance-context-20261102/before-393-finance-analysis.jpg) / [na](design-review/f6-b-finance-context-20261102/after-393-finance-analysis.jpg). App-review-browser op 360/393/412px groen; broncore voor perioden en validatie ongewijzigd. 33 financiële boundarychecks, 87 regressies, 22 opslagveiligheidsgevallen en 22 app-core/scriptvolgordechecks groen. [Echte upgrade](design-review/f6-b-finance-context-20261102/upgrade.json) vanaf actuele F6-A-main behoudt data/PIN/bijlagehash, verwijdert oude cache en laadt nieuwe assets offline (cache v126). De winst is een direct testbare presentatie-interface zonder DOM/storage, geen claim van een kleinere totale app of lagere AI-gebruiksminuten.

| 2026-11-02 | F7-A | Basis `6692be5c948398e6e914e0b21d58382d89f9f070`; branch `docs/f7-measurement-and-release-closeout` | [CI-metingen](design-review/f7-closeout-20261102/ci-measurements.json), [geserveerde bytes](design-review/f7-closeout-20261102/live-assets.json), [echte live-browser/offline](design-review/f7-closeout-20261102/live-browser.json). Laatste app-main [CI 41513348870](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41513348870) groen op `1c8a73d`; [Pages 41513698824](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41513698824) groen op `6692be5` | HTML/SW/acht getroffen assets bytegelijk; live Planning 44×44 en edge-hit positief, taak/KC-editor geopend, offline herstart met beide nieuwe modules groen; cache v126 | Volledige afsluiting NIET GEVERIFIEERD: branchbescherming ontbreekt door API 403, niet-KC goedgekeurde schermreferenties ontbreken, fysieke A54 niet beschikbaar. Bewuste behoud-/uitstelbesluiten en toestelcheck in §7; geen fictieve goedkeuring, AI-tijd- of snelheidsclaim. |

## 5. F4-A — read-only scherminventarisatie, prioriteiten en appbrede pariteitsdekking

**Historische broninventaris uit #73/#74 (hieronder aangevuld met echt browserbewijs):** `main` `eca16e1bf59b5a0209114ed8db8aa4b8068d17d3`, 2 november 2026. Bron: actuele `assets/memento-unified-nav.js`, `memento-life-app.js`, `memento-settings.js`, `memento-start.js`, `memento-finance-app.js`, relevante kennis-/fitnesstests, `tests/visual-browser.cjs`, `tests/helpers/visual-assertions.cjs`, `docs/mijn-dag-v3-acceptance.md`, `docs/taken-v4-acceptance.md`, F3-A-bewijs en historische `docs/design-review`. Die eerdere fase was uitsluitend een code-/testcontract-inventarisatie; het aanvullende F4-A-browserbewijs en de actuele beperkingen volgen hieronder.

**Feitelijke routes:** `assets/memento-unified-nav.js` bevat **Leven (8)**: Fitness, Mijn dag, Taken, Agenda, Notities, Boodschappen, Wensen, Instellingen; en **Financiën (10)**: Overzicht, Transacties, Analyse, Budgetten, Rekeningen, Planning, Slim Kopen, Geldcoach, Bonnetjes, Instellingen. De onderste balk toont per gebied vier voorkeursroutes plus Meer; het menu bevat de overige bestemmingen. Dit zijn **18 hoofdviews**, niet 18 onafhankelijke opslaggebieden of 18 reeds goedgekeurde prototypes. Start/PIN, menu's, dialogen en actie-/scrolltoestanden behoren daarnaast tot de appbrede eis.

**Route-ID's en aanvullende brondekking uit #73:** Leven `today`, `tasks`, `groceries`, `wishes`, `agenda`, `notes`, `fitness`, `backup`; Financiën `dashboard`, `transactions`, `analysis`, `accounts`, `budgets`, `planning`, `smartbuy`, `moneycoach`, `receipts`, `settings`. `#mementoStart` is de 19e primaire ingang; PIN en overlays zijn aanvullende staten. `tests/release-acceptance-browser.cjs` en `tests/glass-rendering-browser.cjs` bevatten dezelfde 18 hoofdroutes; `tests/memento-start-browser.cjs` en `tests/global-search-browser.cjs` dekken afzonderlijke start-/zoek-/conceptnavigatie. `docs/mijn-dag-v3-acceptance.md` en `docs/taken-v4-acceptance.md` zijn tekstuele contracten, geen universele vaste HTML-referenties. Ook `tests/visual-layout-browser.cjs` en `tests/calendar-header-browser.cjs` blijven relevant voor agenda/menu/hitbox; `#addTransaction`, `#txForm`, `#ml-receipts [data-ml-tab]` en `#fitnessDialog` zijn aanvullende bestaande interactie-ingangen, geen bewezen defecten.

**Huidige dekking (niet verwarren met prototypepariteit):** `tests/visual-browser.cjs` doorloopt alle 18 genoemde hoofdviews met een fictieve fixture en maakt screenshots; `tests/helpers/visual-assertions.cjs` borgt o.a. 44px-navigatie, boodschappen-/agendacellen, lege transactiefilters en transactiemodals. De huidige centrale high-risk matrix draait zes domeingroepen, **niet standaard de losse volledige `visual-browser.cjs`**, die onder `interface-smoke` voor gerichte/na-merge selectie staat. Domeinsuites controleren o.a. Mijn dag (`day-v3-browser.cjs`), Taken (`taken-v4-browser.cjs`), Kenniscentrum (`knowledge-workspace-browser.cjs`), Fitness (`fitness-browser.cjs`), en financiën/opslag (`app-review-browser.cjs`, `storage-safety-browser.cjs`). **Strikte vastgezette HTML-pariteit bestaat op dit moment alleen voor de Kenniscentrum-editor/vervolgflow in F3-A.** De historische design-review heeft vóór-/na-beelden maar is geen appbreed, definitief door de gebruiker goedgekeurd referentiearchief.

### F4-A — echte browserinventaris, 2 november 2026

**Bewijs:** [manifest](design-review/f4-a-20261102/manifest.json), [49 basisstaten](design-review/f4-a-20261102/audit/393/report.json), [10 aanvullende formulieren/staten](design-review/f4-a-20261102/extra/393/report.json) en [2 Planning-staten met hit-testing](design-review/f4-a-20261102/planning/393/report.json). Alle 18 hoofdviews zijn op 393×852px aan boven- én onderkant gerenderd en de screenshots zijn bekeken. Extra: takenmenu, mappen dicht/open, financiële filters, transactieformulier op 430px hoogte, Fitness-schema/voortgang, globale navigatie, beide startslides, PIN en na scrollen bereikbare ontgrendelknop op 430px. Taak-, wens-, boodschappen-, afspraak-, budget-, rekeningcontrole-, vaste-lasten- en doel-formulieren zijn geopend en geannuleerd. Geen JS-pageerrors en geen horizontale paginaoverflow gemeten. Offscreen carouselkaarten/achtergrondeffecten zijn geen paginaoverflow.

**Herhaalbaar:** genereer een tijdelijke fictieve fixture met `node tests/helpers/visual-fixture.cjs`; voer vanuit de checkout de drie `docs/design-review/f4-a-20261102/capture*.cjs` uit met `MEMENTO_VISUAL_FIXTURE`, `MEMENTO_VISUAL_PHASE` en `MEMENTO_VISUAL_OUT`. Het manifest pint de fixturehash, tijd, viewport en broncommit. De gebruikte appbestanden op `b833bd3` zijn aantoonbaar identiek aan auditbasis `2275741f0c9cc6808442058ceaa00813ffc80edf`; G1/G2 veranderden geen appcode.

**Uitzonderingen:** Linux/Chromium is geen fysieke A54-, TalkBack-, standalone-installatie- of echte IME-test. Native select-/bestandskiezers en niet iedere lege/fout/importtoestand zijn onafhankelijk bediend. Externe requests zijn bewust geblokkeerd; start toont dus de echte weerfoutstaat. Eén aanvullende Planning-poging trof het nog gekozen Spaardoelen-tabblad; de aparte Planning-opname vanuit een vers profiel bevestigt het resultaat. De tweede startslide is ook na de animatie vastgelegd; de PIN-knop is na scrollen bereikbaar (`x41,y245,w311,h50` bij hoogte 430). Geen van deze auditbeelden is automatisch een goedgekeurd prototype.

### Geprioriteerde kandidaten (acht, geen extra permanente roadmap)

| # | Scherm / eigenaar | Werkelijk bewijs en beoordeling | Besluit |
|---|---|---|---|
| 1 · P1 | Planning; `memento-layout.css`, `[data-edit-bill]` | [Beeld](design-review/f4-a-20261102/planning/393/planning-hitbox.jpg); button `x333,y530.58,w30,h30`, edge-hit-test positief; bestaande `data-edit-bill` opent het juiste formulier | Uitgevoerd via PR #80: eigen hitbox van 30×30 naar minimaal 44×44, compact pictogram behouden, geen overlap of gewijzigd betaalgedrag. Dit is herstel van de reeds geldende aanraaknorm binnen de geautoriseerde opdracht. |
| 2 · P1 | Overzicht; `memento-finance-dashboard-v9.js` | `#m9-replay` 40×40 en `#m9-allcats`/`#m9-alltx` 42px hoog in [meetrapport](design-review/f4-a-20261102/audit/393/report.json) | Behouden in deze eerste F4-B; afzonderlijke gerichte hitboxtest en scope nodig. |
| 3 · P2 | Analyse; `memento-finance-app.js` | Categorielinks in audit 18px hoog; geen 44px-claim | Eerst complete klikouder/hit-testing vaststellen; financiële berekeningen behouden. |
| 4 · P2 | Mijn dag; `memento-life-app.js` / V3-presentatie | Sommige titelknoppen 21–42px hoog; kaart en omliggende acties hebben eigen functies | Geen functies samenvoegen op basis van tekstgelijkheid; afzonderlijke titel-/kaart-hit-test nodig. |
| 5 · P2 | Wensen; `memento-life-app.js` | Productlink 93×18; overige beheerknoppen zijn onafhankelijk | Voorlopig behouden; afzonderlijk aanraakvoorstel binnen bestaande kaart. |
| 6 · P2 | Kenniscentrum-overzicht; `memento-knowledge.css` | Titel Kenniscentrum breekt op 393px midden in het woord; [beeld](design-review/f4-a-20261102/audit/393/knowledge.jpg) | Leesbaarheidskandidaat; geen nieuwe overzichtsreferentie of fictieve ontwerpgoedkeuring. Mappen zelf zijn functioneel behouden. |
| 7 · P1 dekking | Alle 19 primaire ingangen; domeineigenaren | Geen 19 goedgekeurde versievaste schermreferenties; KC-editor is slechts een deelstaat | F3-B1 registreert exact goedkeuring/hash/staat; ontbrekende bronnen blijven NIET GEVERIFIEERD. |
| 8 · P2 device | Start/PIN en formulieren; betreffende eigenaar | Browserstates en bereikbare laatste actie vastgelegd; fysieke IME/standalone niet beschikbaar | Bestaand gedrag behouden; F7-A rapporteert devicebeperking en gerichte toestelcheck. |

**F4-B lokaal bewijs:** [vóór op 393px](design-review/f4-a-20261102/planning/393/planning-hitbox.jpg), [na op 393px](design-review/f4-b-planning-20261102/393/planning-hitbox.jpg) en [44×44-meting](design-review/f4-b-planning-20261102/393/report.json). Dezelfde fictieve fixture/datum; extra 360/412/1280px wegens mogelijke omloop. Alle vier beelden bekeken, edge-hit-tests positief. Bestaande app-review-browser op 360/393/412px controleert zowel vaste-last- als doeleditor en byte-identieke financiële opslag na annuleren. Een aanvankelijke meetproef werd door vaste navigatie afgedekt; de test scrollt het doel nu werkelijk naar het midden vóór hit-testing, zonder force-click of zwakkere maatassertion.

**F4-B-keuze:** kandidaat 1 herstelt een gemeten overtreding van de bestaande 44×44-norm. Alleen de Planning-editbuttons en bijbehorende hitbox-/annuleercheck veranderen; exacte fictieve bedragen, IDs, betaalregistratie en doelgegevens blijven gelijk. De oudere Mappen-kandidaat uit #73 is onderzocht maar voor deze eerste wijziging bewust behouden: geen defect in open/dicht vastgesteld en geen goedgekeurd compact mapontwerp aanwezig.

## 6. F3-B1 — register van goedkeuring, route en staat

Dit register volgt de echte 18 navigatieroutes plus de start-ingang. **Status in de laatste kolom gaat over visuele prototypepariteit**, niet over bestaan/functioneren van de route. Het F4-A-browserbewijs is auditmateriaal en geen nieuwe goedkeuring. Prefix van app-eigenaren is `assets/memento-`, van domeintests `tests/` met suffix `.cjs`. Algemene navigatie-eigenaar: `memento-unified-nav.js`; bestaande planner/groepen blijven leidend.

**Gedeelde fixture/viewport:** [exacte fictieve auditfixture](design-review/f4-a-20261102/fixture.json), SHA-256 `5d0d03301a9b85bd08ca9bc7ccda5183fbdcb9edf8ba4ca700ea4f556f95baac`, bron `tests/helpers/visual-fixture.cjs`; 393×852, korte staat 393×430, vaste datum/tijd en scroll volgens [manifest](design-review/f4-a-20261102/manifest.json). App/ontwerp moeten bij een toekomstige echte vergelijking dezelfde fixture, scroll en staat gebruiken. Specifieke Taken-/Mijn dag-tests houden hun bestaande 0/1/43 en datumfixtures. Een ontbrekende referentiehash is expliciet **geen** automatische baseline van de huidige app.

| Route | UI-/CSS-eigenaar | Bestaande domeinjourney | Vereiste staten / te meten eigenschappen | Goedkeuring en visuele status |
|---|---|---|---|---|
| `life:today` | `life-app.js; ui/glass/layout.css` | `day-v3-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/day.jpg) | dag, menu, afspraakeditor, notitie, korte hoogte; Titel/acties/volgorde/44px; tekstcontract 590c827ef52c90ead52a8c864e7a20eb52f99d3e | Volledige schermreferentiehash ontbreekt; tekstcontract is geen exact HTML-prototype; **NIET GEVERIFIEERD** |
| `life:tasks` | `life-app.js; ui/layout.css` | `taken-v4-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/tasks.jpg) | open/afgerond, 0/1/43, lang, filter, menu, editor/timer; Groepen/hitboxes/formulier; specificatie 7b1154a755f78f8cc360397529cbd88381856a2f | Volledige schermreferentiehash ontbreekt; tekstcontract is geen exact HTML-prototype; **NIET GEVERIFIEERD** |
| `life:groceries` | `life-app.js; layout.css` | `sortable-visibility-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/groceries.jpg) | lijst/product/aankopen, bewerken, sorteren; Rijen, checkbox/touch, menu en scroll | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `life:wishes` | `life-app.js; layout.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/wishes.jpg) | kaart, wenseditor, beheer, externe link; Titel, bronlink, beheer en handler | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `life:agenda` | `life-app.js; ui.css` | `calendar-header-browser; day-v3-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/agenda.jpg) | maand, afspraak, korte editor, Google-menu; 7 kolommen, tijdvelden, footer en touch | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `life:notes` | `knowledge.js; knowledge.css; knowledge-workspace.js` | `knowledge-workspace-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/knowledge.jpg) | overzicht, mappen dicht/open; editor/sheets hieronder; Overzicht/maphiërarchie; alleen editor heeft HTML-hash 193a7573ec6aedebb8aaba9cd07af29e5d512410 | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `life:fitness` | `fitness.js; fitness.css` | `fitness-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/fitness.jpg) | vandaag, schema, voortgang, sessie/set-editor; Set/acties/keyboard en bestaande sessiegegevens | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `life:backup` | `settings.js; life-app.js; settings.css` | `app-review-browser; recovery-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/settings.jpg) | instellingen, privacy, back-up/herstel; Detail/terug, waarschuwing en bereikbare laatste actie | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:dashboard` | `finance-dashboard-v9.js; glass/layout.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/finance.jpg) | trend/categorie/maand, rekening, drilldown; Grafiek, bedragen, rekeningcontext en hitbox | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:transactions` | `finance-app.js; layout/base-app.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/transactions.jpg) | lijst, filters, leeg, nieuw/bewerken, korte modal; Bedragen, velden, footer, focus en context | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:analysis` | `finance-app.js; layout.css` | `app-review-browser; release-acceptance-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/analysis.jpg) | overzicht/categorie/trend, filter, rapport; Categorie, grafiek, labels, context en aanraken | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:accounts` | `finance-app.js; layout.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/accounts.jpg) | rekeningkaart, saldo controleren, instellingen; Saldo, controles, doelrekening en detail | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:budgets` | `finance-app.js; layout.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/budgets.jpg) | budgetkaart, categorie, budgeteditor; Categorieën, totaal/maand, open editor | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:planning` | `finance-app.js; layout.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/planning.jpg) | betalingen, spaardoelen, vaste-last/doeleditor; Datum/bedrag, betaalactie, edit-hitbox en annuleren | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:smartbuy` | `finance-app.js; layout.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/smartbuy.jpg) | vraag/eisen/vergelijk/keuze, dossier; Velden, acties, leeg dossier en context | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:moneycoach` | `finance-app.js; layout.css` | `app-review-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/moneycoach.jpg) | onderwerp, privacy, context en prompt; Negatief resultaat, bronbedragen en selecties | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:receipts` | `finance-app.js; tab-layout.js; layout.css` | `app-review-browser; release-acceptance-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/receipts.jpg) | invoer/controleren/koppelen, JSON-fout, bestand; Stappen, velden, bonrelatie; importdetails niet apart bediend | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `finance:settings` | `settings.js; finance-app.js; settings.css` | `app-review-browser; recovery-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/finance-settings.jpg) | instellingen/detail/terug, privacy, restore; Categorieregels, waarschuwing, controle-/herstelformulier | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |
| `start:#mementoStart` | `start.js; start.css; forest-lock.js` | `memento-start-browser`; [auditbeeld](design-review/f4-a-20261102/audit/393/start.jpg) | weer/gedachte, daglijn, create, doorgaan, PIN; Acties/scroll/footer en foutstaat weer; PIN apart hieronder | Volledige schermreferentiehash ontbreekt; **NIET GEVERIFIEERD** |

**Bestaande goedkeuringen en relevante overlays (geen fictieve uitbreiding):**

| Scope / toestand | Versievaste bron en goedkeuring | Fixture / route / meting / bewijs | Status |
|---|---|---|---|
| KC gewone-teksteditor boven/midden/onder, vervolgsheet en drie vervolgformulieren, gestructureerde variant behouden | Expliciete goedkeuring 2 november in `docs/design-review/knowledge-prototype-parity-20261102.md`; HTML Git-blob `193a7573ec6aedebb8aaba9cd07af29e5d512410` | `knowledge-workspace-browser` + `knowledge-prototype-parity.cjs`; identieke fictieve titel/body, 393px, kaartbreedte/kleuren/hiërarchie/sticky header/sheetanker; acht automatische app/reference-staten in groene [G1-run 41504372835](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504372835) | **GESLAAGD uitsluitend binnen bestaande F3-A-scope**; geen nieuwe goedkeuring van overzicht/mappen |
| KC bijlagen/Meer/locaties | Zelfde goedgekeurde bron; hash hierboven, bestaande geteste scopes | Bestaande workspacejourney maakt screenshots en controleert controls/IDs; niet elk subformulier heeft een afzonderlijke bindende geometrievergelijking | **NIET GEVERIFIEERD** voor volledige 1:1-pariteit van alle substaten |
| Mijn dag / afspraakeditor, lange titel / menu / notitie / lege en 43-takenstaat | [Goedgekeurd tekstcontract](mijn-dag-v3-acceptance.md), Git-blob `590c827ef52c90ead52a8c864e7a20eb52f99d3e`; expliciete bron vermeldt 31 oktober en compacte kaarten 2 november | Bestaande `day-v3-browser` toetst kaartvolgorde, 44px-acties, niet-overlap, na-acties, korte editor en fouten; geen vastgezet overeenkomstig HTML-/schermprototype gevonden | **NIET GEVERIFIEERD** voor exacte visuele prototypepariteit; tekstcontract en functionele geometrytests blijven bindend |
| Taken-editor/timer/stappen | [Specificatie](taken-v4-acceptance.md), Git-blob `7b1154a755f78f8cc360397529cbd88381856a2f`; document meldt zelf dat bijgevoegd HTML-prototype ontbrak | `taken-v4-browser`: 0/1/43, editor, timer, wissen schatting, foutwrite, offline/restore. PR #76 synchroniseert de opslaglezing; geen andere verwachte uitkomst | **NIET GEVERIFIEERD** voor exacte visuele prototypepariteit |
| Financiële modals: transactie, rekeningcontrole, vaste last, doel, budget | Geen aantoonbaar goedgekeurde, versievastgelegde modalspecifieke visuele bron gevonden | [F4-A-formulieren](design-review/f4-a-20261102/extra/393/report.json), [transactie/korte viewport](design-review/f4-a-20261102/audit/393/report.json); domeinjourneys behouden | **NIET GEVERIFIEERD** |
| Startslides, PIN, globale Meer-navigatie | Historische start-/design-reviewbeelden tonen eerdere implementatie, geen automatisch goedgekeurd actueel schermcontract | `memento-start-browser`/`global-search-browser`, F4-A start/nav en [gescrollde PIN](design-review/f4-a-20261102/extra/393/pin-short-scrolled.jpg); geen fysieke deviceproef | **NIET GEVERIFIEERD** |
| Fitness-dialogen, instellingen detail/restore, native import-/bestandskiezers | Geen versievastgelegde geautoriseerde visuele referentie gevonden | Bestaande `fitness-browser`, `recovery-browser`, `storage-safety-browser`; F4-A niet alle fout-/importsubstates handmatig bediend | **NIET GEVERIFIEERD** |

**Besluit F3-B2/B3:** onderzocht maar **GEBLOKKEERD door ontbrekende relevante goedgekeurde visuele referenties**. De aanwezige tekstcontracten en domeintests blijven behouden; er is geen correcte positieve/negatieve niet-KC-prototypeproef te claimen tegen een ontbrekende bron. Geen huidige screenshot tot goedgekeurd ontwerp promoveren, geen lege generieke wrapper of kunstmatige CI-roodstand toevoegen. Bij een beschikbaar goedgekeurd prototype worden alleen de relevante bestaande domeinjournies uitgebreid, met negatieve afwijkingsfixture en bewijs op de exacte PR-head. Dit verhindert de onafhankelijke reparatie van een aantoonbare bestaande aanraaknorm niet.

## 7. F7-A — effectmeting, productie en resterende grenzen

### Gemeten resultaat en betekenis

Alle negen stappen zijn beoordeeld en de uitvoerbare werkpakketten zijn als afzonderlijk gecontroleerde PR's uitgevoerd. G0, G1, F4-A, F3-B1, de eerste bewezen F4-B-reparatie, één F5-A-/F5-B-cluster, één F6-A-/F6-B-presentatieverantwoordelijkheid en D1 hebben hun bewijs binnen de genoemde scope. De aparte autofocusbug is reproduceerbaar rood gemaakt, opgelost en onder dezelfde hoge veiligheidsmatrix gemerged. **Het gehele plan is niet volledig GESLAAGD:** G2 is door integratierechten geblokkeerd, F3-B2/B3 missen goedgekeurde visuele bronnen en de fysieke A54-controle ontbreekt.

[Bronmetingen](design-review/f7-closeout-20261102/ci-measurements.json) gebruiken echte GitHub-run-/jobtijdstippen. De doorlooptijd hieronder loopt van de eerste jobstart tot het laatste jobeinde, inclusief wachten tussen jobs; het is geen CPU-tijd, Codex-/Work-agenttijd of ChatGPT-gebruiksminuten. Runs hebben verschillende diffs en vormen geen gecontroleerde snelheidsproef.

| Geval | PR / run | Browserjobs | Jobdoorlooptijd | Bestanden / commits |
|---|---|---|---|---|
| baseline-high | [#72](https://github.com/jaribuijsman/Uitgavenkompas/pull/72) / [run 41498366958](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41498366958) | 6 | 183 s | 5 / 2 |
| G1-high | [#75](https://github.com/jaribuijsman/Uitgavenkompas/pull/75) / [run 41504372835](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41504372835) | 6 | 208 s | 5 / 2 |
| G2-docs | [#77](https://github.com/jaribuijsman/Uitgavenkompas/pull/77) / [run 41505128968](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41505128968) | 0 | 18 s | 1 / 1 |
| F4-B-medium | [#80](https://github.com/jaribuijsman/Uitgavenkompas/pull/80) / [run 41506489816](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41506489816) | 2 | 77 s | 17 / 1 |
| F5-A-medium | [#81](https://github.com/jaribuijsman/Uitgavenkompas/pull/81) / [run 41507119123](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41507119123) | 2 | 68 s | 9 / 2 |
| F5-B-medium | [#82](https://github.com/jaribuijsman/Uitgavenkompas/pull/82) / [run 41507906393](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41507906393) | 2 | 85 s | 10 / 1 |
| F6-A-final | [#83](https://github.com/jaribuijsman/Uitgavenkompas/pull/83) / [run 41511453710](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41511453710) | 6 | 193 s | 21 / 2 |
| F6-B-high | [#85](https://github.com/jaribuijsman/Uitgavenkompas/pull/85) / [run 41512472162](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41512472162) | 6 | 263 s | 18 / 1 |

**Aangetoond:** documentatie heeft nu een succesvolle consistente releasegate zonder browserjobs; gerichte middelrisico-PR's hadden twee browserjobs en hoogrisico-PR's behielden zes plus vereiste upgrade. De eerste G1- en F6-A-runs werden terecht rood bij een bestaande focusrace. PR #76 verbeterde de opslag-synchronisatie, maar pas de afzonderlijke deterministische focusfix #84 voorkomt dat uitgestelde beginfocus de Backspace overneemt. De negatieve test blijft op oude code rood en op de huidige code groen. Er is geen blind groen geforceerd.

**Niet aangetoond:** totale CI-versnelling, minder agenttijd, lager AI-gebruik, lager visueel afkeurpercentage of minder conflicten ten opzichte van vergelijkbare eerdere sessies. Er zijn geen betrouwbare Codex-/Work-sessielogs of vergelijkbare historische denominatoren. G1/F6-A hadden twee PR-commits; F5-A had een documentatiecorrectie van de exacte plannerselectie. Het samenbrengen van F6-A en de aparte focusfix vereiste één bewuste conflictoplossing in roadmap/index/SW met behoud van beide bedoelingen en opnieuw groene volledige CI. Aantallen commits en evidencebestanden zijn geen directe maat voor productiviteit.

**Onderhoudsresultaat:** de gemeenschappelijke KC-header heeft één effectieve eigenaar in plaats van drie conflicterende regels; de gedeelde dialoogfooter heeft één complete UI-eigenaar in plaats van drie baseregels plus een latere UI-regel. Life-app is 179531 bytes en Finance-app 226043 bytes; de twee nieuwe pure presentatiemodules isoleren respectievelijk taakstappen/timercontrols en periode-/filtertekst. Het gekozen JS-cluster is samen 407369→408820 bytes (+1451), dus geen kleinere-bundleclaim. 33 Life-rendergevallen en 192 Finance-contextgevallen zijn exact gelijk; 34 KC-beelden, de footer-metingen en 30 financiële viewportbeelden onderbouwen de beperkte visuele scope.

### Bewust behouden en uitgesteld

- **G2 — geblokkeerd:** de integratie geeft 403 bij protection lezen en ruleset maken; na de poging zijn rulesets `[]` en `main.protected:false`. De exacte eigenaarshandeling en herstelroute staan bij G2. CI is aanwezig maar nog niet door GitHub-branchbeleid afgedwongen. Er is geen destructieve force-push-/deletieproef uitgevoerd.
- **F3-B2/B3 — geblokkeerd:** alleen de bestaande KC-editorscope heeft een gepinde goedgekeurde HTML-referentie. De tekstcontracten van Mijn dag/Taken blijven bindend voor hun eigen eigenschappen, maar bewijzen geen volledige 1:1-schermpariteit. Geen auditbeeld tot goedkeuring promoveren, geen ontbrekende referentie groen verklaren.
- **F4/F5/F6 — beperkte uitgevoerde scope:** Planning heeft de eerste bewezen 44px-reparatie; overige kandidaten blijven met bewijs of verificatiebehoefte in §5. Mappen blijft behouden zonder nieuw compact ontwerp. Andere CSS-clusters/inline blokken en de overige grote moduleverantwoordelijkheden worden niet bulkverplaatst zonder apart bewijs. Opslagcontracten, handlers, financiële rekenregels, IDs, bijlagen, PIN, back-up en offlinegedrag blijven behouden. De gemengde Life-/Finance-bestanden blijven hoog risico; geen risicodowngrade.
- **D1 — behouden bewijs:** niets verwijderd of gearchiveerd wegens nog aanwezige test-, acceptatie- of herkomstwaarde. De bestaande productrouter en deze roadmap blijven de leesroute en enige technische voortgangsbron.

### Live publicatie en browsernacontrole

De laatste appwijziging is F6-B-merge `1c8a73d432d89f67aa57cd288095794ede635dc0`, met succesvolle [postmerge CI 41513348870](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41513348870). D1-main `6692be5c948398e6e914e0b21d58382d89f9f070` heeft succesvolle [Pages-deployment 41513698824](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/41513698824). Het [bytesrapport](design-review/f7-closeout-20261102/live-assets.json) verifieert werkelijk geserveerde HTML, serviceworker en acht geraakte asset-URLs/hashwaarden tegenover de repository. Cache: `memento-pwa-v126-20261102-finance-context-v1`.

De [echte live-browserroute](design-review/f7-closeout-20261102/live-browser.json) gebruikte een nieuw geïsoleerd profiel met uitsluitend de fictieve fixture op GitHub Pages, 393px en geblokkeerde externe weerrequests. [Planning](design-review/f7-closeout-20261102/planning-hitbox.jpg) meet 44×44 met positieve edge-hit-test; de [taakeditor](design-review/f7-closeout-20261102/live-task-editor.jpg) en [KC-editor](design-review/f7-closeout-20261102/live-knowledge-editor.jpg) zijn geopend en de beelden bekeken. Na serviceworkercontrole is netwerk uitgezet en de pagina echt herladen: [offline Planning](design-review/f7-closeout-20261102/live-offline-planning.jpg) en beide nieuwe presentatiemodules laden. Geen JavaScript-pageerrors. Dit is Chromium-emulatie van de gepubliceerde app, geen bewijs van de geïnstalleerde A54-client. Een eerste harnesspoging blokkeerde zelf de URL zonder eindslash; de allowlist-/navigatiecorrectie is toegepast vóór de succesvolle proef, zonder appcodewijziging.

### Gerichte fysieke Galaxy A54-check — nog NIET GEVERIFIEERD

1. Open de bestaande geïnstalleerde PWA eenmaal online en controleer de normale update zonder lokale appgegevens te wissen of opnieuw te installeren.
2. Controleer Planning: bewerken van vaste last/doel met tikken, annuleren en terugkeer; bestaande bedragen en gegevens blijven gelijk.
3. Gebruik een eigen fictieve testtaak voor titel/schatting: typen, leegmaken, opslaan/heropenen, open menu en toetsenbord; laatste actie blijft bereikbaar en invoerfocus wordt niet overgenomen.
4. Sluit de PWA volledig, start offline en open Mijn dag, Taken, Kenniscentrum/bijlage en Financiën; controleer scroll en onderste acties. Werkelijke IME, grotere systeemtekst, standalone-insets en TalkBack blijven toestelafhankelijk.

**Eerstvolgende acties, maximaal drie:** effectieve branchbescherming door de bevoegde eigenaar; een werkelijk goedgekeurde versievaste niet-KC-referentie voor F3-B2; de gerichte fysieke A54-proef. Geen daarvan wordt vooruit als uitgevoerd of goedgekeurd geregistreerd.

## 8. A-20261112 — goedgekeurd eerste herstelpakket

**Autorisatie:** gebruiker koos op 12 november 2026 de eerste stap uit de review: pakket A lokaal uitvoeren, stap voor stap. Daarna gaf de gebruiker expliciet toestemming: “Je mag pushen mergen en publiceren van de commit.” Pakket B (Quickfit/dekkingsuitbreiding), branchebescherming en codeopruiming blijven buiten deze uitvoering. De actuele main is opnieuw vastgesteld op `1c67f0896ff180ebbb6eb9967b810af3b5a0b9c9`.

**Uitvoering:** één gedeeld browserregister voor planner en runner; onbekende suite-namen vroeg weigeren; historische Kennisjourneys bij wijzigingen conservatief door de huidige volledige dekking beoordelen. De icoonjourney volgt het actuele portaal en bestaande document-/kruimelpadroute; de rooktest gebruikt snelle invoer op Mijn dag en bestaande taakmenu's. De zes volledige groepen nemen voortaan ook de herstelde icoon- en rookjourney mee, zodat groen in de volledige matrix deze routes eveneens beoordeelt. Geen applicatiecode, vormgeving of opslagcontract verandert.

**Acceptatie, maximaal zeven criteria:**

1. De bestaande runner-, icoon- en rookfouten zijn vóór reparatie gereproduceerd op huidige main.
2. Planner en runner gebruiken hetzelfde register; actieve directe groepen zijn uitvoerbaar, onbekende namen worden afgewezen en oude Kennis-homejourneys worden niet heractiveerd.
3. Zes volledige browsergroepen, met alle bestaande veiligheidsjourneys en zonder dubbele Kennis-workspacejourney; iconen en algemene smoke zijn elk eenmaal als suite opgenomen.
4. De icoonjourney controleert raster/labels, huidig portaal, 23 bewaarde categorie-IDs via bestaande documenten, icoonkeuze, behouden notities/transacties en offline herladen.
5. Algemene smoke controleert snelle invoer op Mijn dag, bewerken/afronden vanuit Taken, ingeklapte groepen, notities, financiële invoer en offlinegedrag; helperwijzigingen selecteren deze journey.
6. Nieuwe negatieve plannergevallen zijn eerst rood gezien en daarna groen; alle door de uiteindelijke diff geselecteerde lokale core-/browserchecks worden uitgevoerd. GitHub-CI wordt afzonderlijk als niet uitgevoerd gemeld zolang er niet gepusht is.
7. Diffreview en gerichte browserbeelden tonen de geteste routes; appbestanden, echte gebruikersdata, cacheversie en productbesluiten blijven ongewijzigd.

**Lokaal resultaat:** de drie oorspronkelijke fouten zijn opnieuw bevestigd vóór reparatie. `node tests/ci-plan-regression.cjs` slaagt met 36 gevallen; beide gerichte routes (`node tests/ci-groups.cjs test-illustrative-icons-browser medium` en `interface-smoke medium`) zijn groen. De finale diff selecteert `high`, zes groepen en `upgrade:false`: alleen tests/CI/documentatie veranderen. Alle 34 scripts uit de centrale corejob en `node tests/ci-groups.cjs <groep> high` voor interface-layout, interface-feature, interface-acceptance, interface-visual, life-full en data-full zijn geslaagd. Dit zijn 26 unieke suites, 29 browseruitvoeringen door de vier smoke-breedtes (360/393/412/1280); de toegankelijkheidsjourney controleert eveneens vier breedtes. Zes gewijzigde JS-bestanden slagen voor syntaxcontrole; diff-whitespace is schoon. Onafhankelijke diffreview: geen belangrijke bevindingen.

**Bewijs en grenzen:** lokale logs en bekeken 393px-beelden van portaal, bestaande categorie, offline checklist en taakmenu zijn buiten de repository bewaard onder `/workspace/memento-package-a-evidence`. Deze beelden zijn een routebaseline, geen volledige ontwerp- of fysieke A54-goedkeuring. De test die bestaande screenshots onder docs overschreef, heeft zijn nieuwe beelden in tijdelijk bewijs gekregen; de historische Git-bestanden zijn exact hersteld. Applicatiebestanden, opslagcontracten en cacheversie blijven gelijk aan main. Quickfit-testdrift blijft expliciet open voor pakket B. De latere GitHub-vrijgave en live-nacontrole staan hieronder; fysieke A54 en de bestaande geïnstalleerde PWA blijven niet geverifieerd.


**Vrijgave 12 november 2026:** [PR #119](https://github.com/jaribuijsman/Uitgavenkompas/pull/119) is na groene exacte [PR-head-CI 43312061603](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312061603) gemerged als `331fa87d31938d8283b17b961e1ffa7d3afe797c`. De Git-tree is identiek aan de lokaal geteste head `184eb813732b1d13c7b50d0c7bc531aadd1b9c5a`. [Postmerge-CI 43312655340](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312655340) heeft de identieke PR-tree onafhankelijk bewezen en de korte smoke plus gate succesvol uitgevoerd. [Pages-deployment 43312653661](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/43312653661) is geslaagd op de merge-SHA.

De publieke HTML, worker, alle precache-URLs en de nieuwe CI-/roadmapbestanden zijn opgehaald: 85 controles, allemaal bytegelijk aan de merge-tree. Een nieuw geïsoleerd live Chromium-profiel op 393px met uitsluitend fictieve gegevens opende Mijn dag, Taken en Kennis zonder horizontale documentoverflow of JS-pageerrors; Taken is na netwerk uitschakelen echt herladen. Worker-cache `memento-pwa-v157-20261111-checklist-icon-v1` heeft 82 entries en blijft bewust ongewijzigd omdat appassets niet veranderen. Livebeelden van Taken en Kennis zijn bekeken. Geen fysieke A54-, TalkBack- of bestaande geïnstalleerde-clientclaim. Rollback kan via een afzonderlijk beoordeelde revert van de test-/CI-merge; er is geen opslagmigratie terug te draaien.
