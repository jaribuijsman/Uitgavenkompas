# Navigatie-resultaatcontract — auditbevinding 1

Basis: `e8d4960eb6e2b28ce193bd133a2661fc26603bf4`, actuele main bij aanvang op 31 oktober 2026. De financiële reparatie uit PR #42 is daarin opgenomen. Branch: `fix/navigation-result-contract`.

## Bevinding en acceptatie

**BEVESTIGD** in een echte Chromium-render op 393 × 790 px met fictieve gegevens: vanuit een onopgeslagen snelle notitie weigert `setView('tasks')` de overgang, maar `MementoKnowledgeBridge.openRelated('task', id)` opent vervolgens toch het taakdetail. De nieuwe regressietest faalt op de oorspronkelijke main bij de assertion dat dit detailvenster gesloten moet blijven. Dit bewijst inconsistente navigatie; verlies van echte gebruikersgegevens is niet vastgesteld.

Contract:

1. `setArea()` en `setView()` geven expliciet `true` bij een geaccepteerde bestemming en `false` bij weigering of onbekende bestemming.
2. Notitie- en Fitness-conceptbeveiliging blijven actief. Een geweigerde overgang opent geen vervolgeditor of detailvenster en verandert geen hoofdopslag.
3. Het opnieuw kiezen van de huidige concepteditor behoudt de bestaande invoer-DOM en schermpositie.
4. Menu en oude schermselector blijven de werkelijke selectie tonen na weigering.
5. Zoek-, gerelateerde-item-, onderzoeks-, herstel- en Fitness-routes respecteren hetzelfde resultaat.
6. Na expliciet wissen of succesvol opslaan van het concept werkt normale navigatie weer; bestaande zoekresultaten openen hun oorspronkelijke editor.

De zichtbare indeling, financiële berekeningen, opslagkeys, schema's en gegevensinhoud worden niet gewijzigd. De bestaande planner kiest **hoog risico met upgradecontrole**, omdat `memento-life-app.js` een gemengde module is. Deze classificatie is niet verlaagd.

## Implementatie

- `memento-life-app.js`: expliciete booleans, concept-DOM behouden bij herselectie, gedeelde `MementoNavigation`-toegang voor bestaande UI-eigenaars; guards vóór vervolgacties in gerelateerde items, zoeken, aankooponderzoek, bronnotities, dagboek, back-up/prullenbak en gedeelde notities. Een geweigerde oude schermselectie wordt teruggezet.
- `memento-unified-nav.js`: stopt bij afgewezen gebied- of schermwissel; voert daarna geen verborgen bestemming of extra synchronisatie uit.
- `memento-global-search.js`: sluit resultaten na geaccepteerde navigatie en respecteert de uitkomst van de bestaande Life-bridges.
- `memento-fitness.js`: opent een boeking of hervat een training alleen na geaccepteerde navigatie.
- HTML en worker precache bevatten dezelfde vier nieuwe asset-URL's; cache v96. Worker-fetch- en opslaglogica zijn behouden.
- De bestaande zoekbrowsersuite bevat de gerichte regressie. Exacte assetversies in twee bestaande coretests zijn bijgewerkt; assertions zijn behouden. Geen nieuwe matrix of handmatige extra Actions-run.

## Lokaal bewijs

- `tests/global-search-browser.cjs`: geslaagd op 360/393/412 px; op 393 px ook onopgeslagen notitie, echte Fitness-opslagfout, menuweigering, bron-/zoekbridges, oude selector, dezelfde invoer-DOM en geometrie, byte-identieke hoofdopslag bij weigering, herstel en succesvolle vervolgnavigatie. Browserfouten: geen.
- `tests/fitness-browser.cjs`: geslaagd, inclusief boekingen, training, bewaarfout/retry, back-up en offline herstart.
- `tests/recovery-upgrade-browser.cjs`: upgrade vanaf de genoemde main naar cache v96 en offline herstart geslaagd. Beide bronopslagstrings en PIN behouden; binaire bijlagehash gelijk.
- Toepasselijke corecommando's uit `.github/workflows/app-review.yml`: lokaal geslaagd, inclusief financiële validatie, native schrijftoegang, opslagveiligheid, Life/Fitness, zoekcore en cachecontracten.
- Voor/na-screenshots van de oorspronkelijke fout, het behouden notitieconcept en Fitness-concept zijn in een echte renderer bekeken. DOM-bounding boxes blijven gelijk bij de geweigerde routes. Geen CSS- of layoutwijziging. Fysieke Samsung A54/standalone: **NIET GETEST**.

Lokale screenshots, metingen en logs: `/workspace/scratch/memento-navigation-evidence/`.
De centrale GitHub-release-gate voor de exacte PR-head is afzonderlijk leidend voor de volledige matrix.

## Vrijgave en restscope

Dit is reparatie-PR 2 uit de overdracht. Geen merge of publicatie uitgevoerd binnen deze opdracht. De CI-plannerkoppeling voor losstaande zoek-/navigatiewijzigingen (reparatie-PR 3) en overige auditpunten blijven apart. Er zijn geen echte gebruikersgegevens benaderd of GitHub-branchinstellingen gewijzigd.
