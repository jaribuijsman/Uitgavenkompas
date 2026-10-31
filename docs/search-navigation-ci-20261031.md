# Gerichte CI-selectie voor zoeken en navigatie — auditbevinding 6

Basis: actuele main `5f184f1633dd0a8a2997ae6df6a261cbb6c5387e` op 31 oktober 2026, inclusief PR #43. Branch: `fix/search-navigation-ci-selection`. Dit is reparatie-PR 3 uit de overdracht.

## Bevinding en oplossing

**BEVESTIGD:** de bestaande planner selecteert bij een losse wijziging aan onderstaande bestanden alleen `interface-smoke`, terwijl de bestaande zoekbrowsersuite zoeken, menu-/zoekroutes en behoud van notitie- en Fitness-concepten controleert. De nieuwe positieve regressie faalt op de oorspronkelijke planner met `interface-smoke` in plaats van `test-global-search-browser`.

| Gewijzigd bestand | Voorheen | Nieuwe gerichte groep |
| --- | --- | --- |
| `assets/memento-global-search.js` | `interface-smoke` | `test-global-search-browser` |
| `assets/memento-global-search-core.js` | `interface-smoke` | `test-global-search-browser` |
| `assets/memento-global-search.css` | `interface-smoke` | `test-global-search-browser` |
| `assets/memento-unified-nav.js` | `interface-smoke` | `test-global-search-browser` |

`tests/ci-plan.cjs` krijgt één expliciete impactkoppeling. De bestaande groepsrunner ondersteunt de directe suite al; er is geen nieuwe groep, workflow of matrix nodig. Zoekstyles behouden hun bestaande lage risicoklasse, de genoemde JavaScript-modules hun middelhoge risicoklasse. Tab-layout verzorgt presentatie en is geen eigenaar van de gedeelde menunavigatie; die wordt niet aan deze zoekroute gekoppeld.

## Acceptatie en regressies

Vier nieuwe regressiegroepen bewaken:

- Positieve selectie voor alle vier exacte assetpaden.
- Eén selectie bij gecombineerde bron-/testwijzigingen en herhaalde paden; een losse browsertest blijft rechtstreeks geselecteerd.
- Geen zoekbrowser bij ongerelateerde modules, documentatie of alleen de zoekcore-unittest; bestaande domeinkoppelingen blijven behouden.
- Hoge risico's houden exact de bestaande zes groepen en hun upgradevereisten. Handmatige volledige controle en bewezen identieke postmerge behouden hun bestaande gedrag. Er komt bij hoge risicodekking geen tweede losse zoekgroep bij, omdat de suite al in `life-full` zit.

Deze plannerwijziging zelf blijft volgens de bestaande regels **hoog risico** en krijgt daarom één centrale PR-releasecontrole met de bestaande zes browsergroepen. De upgradejob is niet nodig: applicatiebestanden, opslag, HTML en serviceworker zijn in deze PR niet gewijzigd.

## Uitgevoerd bewijs

- `node --check tests/ci-plan.cjs` en `node --check tests/ci-plan-regression.cjs`: geslaagd.
- `node tests/ci-plan-regression.cjs`: alle **28 regressiegroepen geslaagd**; bestaande assertions zijn behouden.
- `node tests/ci-postmerge-regression.cjs`: geslaagd.
- `node tests/global-search-core.cjs`: geslaagd.
- `node tests/ci-groups.cjs test-global-search-browser medium` met de bestaande externe Playwright-installatie: één suite uitgevoerd, geslaagd in **5,6 seconden**. De bestaande suite controleert 360/393/412 px en de gerichte 393px-conceptroutes. Geen extra lokale browsermatrix uitgevoerd.

Lokale logs: `/workspace/scratch/memento-ci-search-evidence/`. De centrale GitHub-gate moet afzonderlijk op de exacte PR-head slagen. Voor/na-productbeelden zijn niet van toepassing: er is geen product- of layoutwijziging. Geen nieuwe fysieke A54-test.

Geen gegevens of productieassets gewijzigd. Geen merge, publicatie of wijziging aan branchinstellingen uitgevoerd. Het volgende afzonderlijke werkpunt is onderzoek naar het veilige PWA-updatemoment (reparatie-PR 4); de huidige PR wijzigt geen worker-lifecycle.
