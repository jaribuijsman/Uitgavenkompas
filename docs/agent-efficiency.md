# Memento — efficiënte implementatie zonder veiligheidsverlies

Datum: 31 oktober 2026. Geldt bij alle volgende GPT/ChatGPT-, Codex- en Work-taken, ongeacht GitHub-connector, Work-computer of lokale terminal.

## Bronhiërarchie en doel

Actuele `main` bepaalt feitelijke werking; expliciete taak en laatste goedgekeurd ontwerp bepalen gewenste werking. `AGENTS.md` is leidend voor operationele testkeuze. Oude projectbronnen en audits zijn historische productkennis; lees alleen wat voor de taak relevant is.

## Klein en veilig

1. Voor UI-wijzigingen: maximaal acht concrete acceptatiecriteria vóór programmeren, inclusief bestaande editor, opslag en bereikbare knoppen. Verifieer bestaande handler in plaats van een parallel pad te bouwen.
2. Pas alleen de betrokken componenten aan. Geen CSS-overrides stapelen of onnodige refactors in data-/opslagcode.
3. Voer eerst gerichte lokale test uit, dan een samenhangende PR. Vermijd commits per kleine selectorfix en daarmee geannuleerde CI-runs.
4. Vertrouw niet alleen op groene generieke tests voor een goedgekeurd ontwerp: controleer ook de echte geopende editor, overlay en mobiel scrollen, waar geraakt.
5. Bewaar bestaande data/IDs, financiële berekeningen, PIN en offline/backup. Bij wijziging aan opslag/worker/security altijd brede checks.
6. Een CI-job op `main` na merge gebruikt alleen een gerichte smoke als `tests/ci-postmerge.cjs` onafhankelijk verifieert: gewone of squash-merge met exact dezelfde Git-tree als de geteste PR-head, juiste PR en geslaagde definitieve app-review-run. Anders blijft de normale risicomatrix verplicht. Handmatige full run blijft altijd full.

## Eén methode voor alle agents

GPT, Codex en Work moeten het uniforme contract in `AGENTS.md` volgen. Controleer de actuele `main`, de werkelijke diff en de betrokken handlers, doe alleen de passende lokale controle en push dan één definitieve PR-commit. De centrale CI-planner selecteert de toepasselijke tests: de gebruikte AI-tool geeft geen vrijstelling en is ook geen reden voor extra browsergroepen. Verouderde PR-runs niet telkens opnieuw starten; kijk bij mislukking in het concrete joblog.

Beschikbaarheid van lokale tests kan verschillen: GPT met alleen de GitHub-connector mag ontbrekende shell-/browserbewijzen niet als geslaagd rapporteren. De echte GitHub-gate en postmerge-bewijscontrole zijn afdwingbaar; de werkinstructies zelf garanderen niet dat elk extern model ze automatisch naleeft. Risicovolle opslag- en offlinewijzigingen houden hun brede checks.

## Bewijs

Rapporteer werkelijke testresultaten, toepasselijke viewport, PR/SHA, uitstaande device-checks en deployment. GitHub-verificatie is geen fysieke Samsung-test. Actualiseer roadmap/projectbronnen alleen bij nieuwe besluiten of significante releases; niet na elke lokale CSS-correctie.

## Openstaand verbeterpunt

`assets/memento-life-app.js` vermengt UI met opslaglogica. De CI behandelt wijzigingen daarin bewust als hoog risico tot een afzonderlijk geteste splitsing in presentatie en persistentie is uitgevoerd. Classificeer een wijziging in dit gecombineerde bestand **niet** op basis van een vrijblijvende tekstmarker of modelverklaring als risicoloos.
