# Memento — projectafspraken (risicogestuurd)

Deze regels gelden vanaf de repository-root voor Codex en voor Work wanneer zij in deze repository werken. Specifiekere `AGENTS.md`-bestanden gelden binnen hun submap. Hogere instructies en de nieuwste expliciete gebruikersopdracht gaan voor. Vraag geen herhaalde toestemming voor al geautoriseerd werk.

## Doel en werkwijze

Lever een **kleine, juiste wijziging met proportionele controle**. Hoe meer risico voor gebruikersgegevens, veiligheid of andere schermen, hoe uitgebreider de test. Een wijziging van drie regels hoeft geen volledige app-audit te worden.

1. Lees deze instructies eenmaal per taak. Controleer de actuele `main`-SHA en de daadwerkelijk betrokken bestanden. Zoek gericht op selectors, functies en regelnummers; lees de grote `index.html` niet standaard volledig. Hergebruik eerdere relevante bevindingen, maar controleer dat ze nog gelden.
2. Kies vóór wijzigingen **niveau 1, 2 of 3** op basis van de *werkelijke impact*, niet alleen het aantal gewijzigde regels. Noteer niveau en reden kort in het eindverslag. Bij meerdere wijzigingen geldt het hoogste niveau. Verhoog het niveau als onderzoek onverwachte afhankelijkheden of risico's laat zien.
3. Onderzoek alleen de aangeraakte code en directe afhankelijkheden. Geen algemene herontwerpen, brede refactors, nieuwe CSS-override-lagen of extra observateurs zonder opdracht. Controleer bij weergaveproblemen ook late CSS en DOM-decoratie.
4. Gebruik bestaande componenten, handlers en tests. Voer dezelfde test niet onnodig meerdere keren uit; herhaal alleen na relevante reparatie. Voer geen complete lokale testmatrix uit als geschikte GitHub Actions die al uitvoeren.

## Risiconiveaus en minimale controles

### Niveau 1 — Laag: lokale, presentatiegerichte wijziging

Voorbeelden: label, tekst, pictogram, kleur, lokale CSS-selector, kleine verplaatsing van een knop met een **bestaande** handler, of documentatie zonder uitvoerbare code. Ook een kleine HTML-stringwijziging kan niveau 1 zijn wanneer opslag, netwerkgedrag, berekeningen en interactielogica ongewijzigd blijven.

- Controleer de gerichte diff, de betrokken selector/handler en eventuele syntaxis. Doe bij een zichtbare UI-wijziging één gerichte mobiele browser-/interactietest op circa 393 px; controleer 360 px erbij wanneer breedte of overloop een risico vormt. Maak alleen een screenshot als die iets extra's verifieert.
- Documentatie-only: diff- en inhoudscontrole volstaan; **geen browser-, opslag- of PWA-test**.
- **Geen volledige `app-review.yml`-matrix, vier viewport-captures, 0/1/43-taakscenario's of uitgebreide opslagtest voorschrijven** voor dit niveau, tenzij een concreet gevonden risico dat noodzakelijk maakt.

### Niveau 2 — Middel: functionele of schermbrede UI-wijziging

Voorbeelden: bestaand formulier of menu wijzigen, meerdere componenten van één scherm, nieuwe interactie met bestaande state, gedeelde stijlregel die meerdere schermen kan raken, navigatie of een gebruikerspad zonder opslagmigratie.

- Test de gewijzigde gebruikersroute en relevante bestaande regressies (inclusief fout- en interactiestaten). Controleer mobiele breedtes 360/393/412 voor zover de wijziging die raakt; desktop alleen wanneer het gedrag daar verandert.
- Bij een wezenlijk visuele ingreep: vóór/na-captures met dezelfde fictieve fixture en viewport, plus geometriecontrole op afsnijding, overlap, focus en aanraakdoelen. Controleer andere werkelijk geraakte schermen.
- Geen volledige applicatiematrix als de wijziging lokaal aantoonbaar afgebakend blijft.

### Niveau 3 — Hoog: gegevens, veiligheid of systeemgedrag

Voorbeelden: opslagkeys/schema's, guarded persistence, import/export/back-up/ZIP, PIN, privacy/toegang, financiële berekeningen, service-worker-fetch-/offline- of upgradegedrag, destructieve acties, architectuur, of breed gedeelde componenten/tokens met onvoorspelbare impact.

- Werk op een aparte branch en controleer via PR. Controleer volledige relevante `app-review.yml`-matrix, `tests/recovery-browser.cjs`, de visuele suite op 360/393/412/1280 met fixture uit `tests/helpers/visual-fixture.cjs`, plus toepasselijke opslag-, beveiligings- en PWA-upgradetests.
- Gebruik vóór/na-captures en verifieer echte interacties, inclusief herstel- en foutpaden. Bij taakcomponenten met breed effect: 0/1/43 taken, lange titel, menu, filters, afronden/heropenen, Mijn dag en Agenda.
- Merge niet met falende vereiste checks, ontbrekend kritisch bewijs of onopgeloste regressies.

## Altijd geldende veiligheidsgrenzen

- Bescherm bestaande opslagkeys, IDs, schema's, PIN, financiële data, bijlagen, oorspronkelijke assets en functies. **Nooit gebruikersopslag wissen**, veiligheidsasserties verwijderen/verzwakken, of destructieve migraties uitvoeren om tests te halen.
- Gebruik uitsluitend fictieve gegevens in geïsoleerde browsercontexten. Bedien native disclosures via zichtbare knoppen; force-click niet om tests groen te krijgen. Behoud toegankelijke labels, focus en aanraakdoelen van minstens 44×44 px; het zichtbare checkbox-vak mag 22–24 px zijn.
- Domeinmodules bezitten data en beveiligd opslaan; `memento-ui.js` bezit viewport/notice, `memento-ui.css` gedeelde bediening, glass het materiaal en layout de leesvolgorde. Bewaak één bron per gedeelde token/constructie; geen opeenvolgende algemene `!important`-patches.
- **Offline asset gewijzigd?** Houd URL-versies in `index.html` en `sw.js` CORE in overeenstemming en verhoog de cacheversie. Bij alleen een versie-/precachewijziging volstaat op niveau 1 of 2 een gerichte consistentie- en laadcontrole; een volledige daadwerkelijke worker-upgradetest is verplicht wanneer service-worker-logica, offlinegaranties of kritieke opslagstromen veranderen.
- Browsertooling indien nodig buiten de productiebron: `npm install --prefix /tmp/memento-browser --no-package-lock --no-save playwright@1.62.1`, installeer Chromium en gebruik `NODE_PATH=/tmp/memento-browser/node_modules`. Maak geen onnodig nieuw npm-project.
- Sommige tests schrijven screenshots onder `docs/`: controleer zulke diffs en commit geen onbedoeld gewijzigde historische beelden.

## Branch, CI en publicatie

- Leg vóór wijzigingen de huidige `main`-SHA vast als herstelpunt. **Niveau 1** mag na gerichte controle rechtstreeks naar `main` als de gebruiker publicatie al expliciet heeft geautoriseerd en de repository dit toestaat; anders een korte branch/PR. **Niveau 2 en 3**: aparte branch en PR. Vergelijk vóór merge opnieuw met actuele `main` en herstel branchverschillen waar nodig.
- De GitHub-workflows kunnen automatisch een volledige matrix starten, ongeacht dit risiconiveau. Dit bestand schakelt die workflows **niet** uit. Start niet dezelfde volledige suites nog eens zelf; respecteer bestaande verplichte branch-/mergechecks. Negeer geen relevante fout of verplichte mislukte check. Wijzig CI-configuratie niet als ongevraagde optimalisatie.
- Werk een kleine taak zelfstandig af; vermijd herhaald onderzoeks-, goedkeurings- en rapportagewerk zonder nieuwe informatie. Breid de scope alleen uit bij een concreet aangetoond probleem.
- Rapporteer compact in het Nederlands: niveau, gewijzigde bestanden, daadwerkelijk uitgevoerde controles en resultaten, SHA/branch/PR, publicatiestatus en zo nodig rollback. Noem expliciet beperkingen. Browseremulatie is geen fysieke Samsung-, Android-toetsenbord-, TalkBack- of geïnstalleerde PWA-test.
