# Memento — risicogestuurde projectafspraken

Geldt voor Codex en Work bij werk in deze repository. Specifiekere `AGENTS.md`-bestanden gelden in hun submap. Hogere instructies en de recentste expliciete gebruikersopdracht gaan voor. Vraag niet opnieuw om toestemming voor reeds geautoriseerd werk.

## Werkwijze

- Controleer één keer de actuele `main`-SHA als herstelpunt en bepaal welke bestanden, selectors en handlers geraakt worden. Zoek gericht op symbolen/regelnummers; lees de enorme `index.html` niet standaard integraal. Hergebruik bevindingen als ze nog actueel zijn.
- Kies op basis van **impact** niveau 1, 2 of 3. Bij gemengde of onverwacht risicovolle wijzigingen geldt het hoogste niveau. Leg de keuze kort vast; schaal alleen op bij een concrete reden.
- Wijzig zo weinig mogelijk. Geen ongevraagd redesign, brede refactor, dubbele CSS-regels/`!important`-ketens of nieuwe observers. Inspecteer bij UI-fouten late CSS en DOM-decoratie; oude screenshots zijn geen bewijs van de actuele weergave.
- Gebruik bestaande code en relevante tests. Test na een gerichte reparatie opnieuw, maar herhaal geen succesvolle suites zonder gewijzigde afhankelijkheden.

## Risiconiveaus

**1 — Laag (lokale presentatie of documentatie).**
Voorbeelden: tekst, icoon, lokale CSS, knop verplaatsen met bestaande handler, HTML-rendering zonder nieuwe logica of opslagwijziging.
Controle: gerichte diff + syntax/handlercontrole. Bij zichtbare UI-wijzigingen één mobiele rooktest rond **393 px**; ook **360 px** als overloop aannemelijk is. Screenshot alleen als visuele verificatie dat vereist. **Geen** volledige app-matrix, taakscenario's 0/1/43, opslagtests of standaard vier viewport-captures. Alleen documentatie (`AGENTS.md`, README): diff en inhoud controleren, geen runtime-tests.

**2 — Middel (scherm of bestaande interactie).**
Voorbeelden: formulier, menu of navigatie aanpassen, meerdere componenten binnen één scherm, interactie met bestaande state, gedeelde CSS met aantoonbare impact op enkele schermen.
Controle: relevante functie-/regressietests en getroffen gebruikersroutes; mobiel 360/393/412 voor zover beïnvloed. Bij belangrijke visuele veranderingen één vergelijkbare vóór/na-fixturecapture plus controle op overlap, afsnijding en focus. Desktop en aangrenzende schermen alleen als geraakt. **Geen** volledige testmatrix zonder breed risico.

**3 — Hoog (gegevens, beveiliging of breed systeemgedrag).**
Voorbeelden: opslagkeys/schema, guarded persistence, migraties, back-up/ZIP/attachments, PIN/toegang, financiële berekeningen, service-worker- of offline-logica, destructieve functies, architectuur, breed gedeelde componenten of tokens.
Controle: volledige toepasselijke `app-review.yml`-matrix, `tests/recovery-browser.cjs`, `tests/visual-browser.cjs` op **360/393/412/1280** (fixture via `tests/helpers/visual-fixture.cjs`), relevante opslag-, veiligheids- en PWA-upgradetests. Vóór/na-captures en echte interactie-, fout- en herstelpaden. Bij brede taakwijzigingen: 0/1/43 taken, lange titel, menu, filters, afronden/heropenen, Mijn dag én Agenda.

## Veiligheidsregels voor ieder niveau

- Bescherm gegevens, bestaande keys/IDs/schema's, PIN, berekeningen, ZIP/binaire bijlagen, originele assets en functies. **Nooit gebruikersopslag wissen**, destructief migreren of tests/veiligheidsasserties verzwakken om een controle te laten slagen. Gebruik uitsluitend fictieve fixtures in geïsoleerde browsers.
- Domeinmodules beheren gegevens en guarded persistence; `memento-ui.js` de viewport/notice, `memento-ui.css` gedeelde bediening, glass het materiaal en layout de leesvolgorde. Houd gedeelde tokens/disclosures bij één eigenaar.
- Houd focus en labels toegankelijk, aanraakdoelen minimaal **44×44 px**, visuele checkbox **22–24 px**. Open native disclosures met zichtbare knoppen, nooit met force-click om tests te passeren.
- **Offline asset bijgewerkt?** Synchroniseer bestandsversies in `index.html` en `sw.js` CORE en verhoog de cacheversie. Bij uitsluitend CSS-/assetversies: beperkte URL-, precache- en laadcontrole (niveau 1/2). Bij verandering van worker-fetch-/upgradelogica of kritieke opslag: volledige PWA-upgradetest (niveau 3). Wis geen gebruikersopslag.
- Indien browsertooling nodig: installeer Playwright 1.62.1 buiten de app (`npm install --prefix /tmp/memento-browser --no-package-lock --no-save playwright@1.62.1`), installeer Chromium en gebruik `NODE_PATH=/tmp/memento-browser/node_modules`. Geen nieuw productie-npm-project. Bekijk door tests gewijzigde screenshots in `docs/`; commit geen onbedoelde artefacten.

## GitHub, publicatie en rapportage

- **Niveau 1:** direct naar `main` mag alleen bij expliciete reeds gegeven publicatieautorisatie en als de repository het toelaat, na gerichte controle; anders branch/PR. **Niveau 2/3:** altijd aparte branch en PR. Vergelijk vóór merge met de actuele `main`; reconcileer verschillen.
- GitHub Actions kan onafhankelijk van dit bestand een volledige suite starten. **Dit bestand verandert CI niet.** Start dezelfde brede suite niet nóg eens lokaal; respecteer verplichte statuschecks. Merge niet bij falende vereiste checks of kritieke regressies; los concrete blokkades op.
- Rapporteer compact in het Nederlands: risiconiveau, wijziging, daadwerkelijk uitgevoerde controles, SHA/PR, status en rollbackmogelijkheid. Een browseremulator is geen fysieke Samsung-/Android-, TalkBack- of geïnstalleerde-PWA-test.
