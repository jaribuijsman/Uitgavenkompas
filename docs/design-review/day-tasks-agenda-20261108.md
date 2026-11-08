# Mijn dag, Taken en Agenda — uitvoeringscontract

Opdracht: het aangeleverde gezamenlijke implementatieplan uitvoeren, bevestigd op 8 november 2026. De uitvoeringsopdracht vervangt de oude conceptblokkade. Basis: `1d1b9c31a33e7978379d518a7ae641cd8ec09a19` (main). Geen nieuwe vormgeving voor Kennis/Meer en geen herimport of opschoning van taken.

## Acceptatiecriteria en bewijsroute

| # | Gewenst gedrag | Eigenaar | Verificatie |
|---|---|---|---|
| 1 | Volledige geselecteerde datum + dienst onder snelle invoer; geen dubbele bovenstrook | life-app `dayContext`/`syncDayCarousel`, glass/layout-decorators | agenda-plan-browser, day-v3-browser, voor/na screenshots |
| 2 | Taken uitsluitend via bestaande greep slepen, aanraking 500 ms; scroll vóór activering annuleert | sortable-ui, sortable CSS | agenda-plan-browser (CDP touch), sortable-visibility-browser (werkelijk herschikken + opslag) |
| 3 | Categorieën gesloten bij navigatie, onafhankelijk te openen; interacties bewaren open keuzes | life-app `expandedTaskCategories`/`setView` | agenda-plan-browser, taken-v4-browser, recovery-browser |
| 4 | Geen snelle invoer op Taken; nieuwe taak, zoeken, filters en statussen blijven | life-app `render` | agenda-plan-browser, visual-layout-browser, storage-safety-browser via Mijn dag |
| 5 | Eén gouden stip naast datum voor echte lokale/geladen Google-afspraken, ook recurrent; geen taken/trainingen/backlog | bestaande kalender `paintEvents`, layout CSS | agenda-plan-browser, calendar-header-browser, memento-regression |
| 6 | Alleen O/M/N zichtbaar; vrije dag zonder V, dienstgegevens intact | bestaande kalender `paintEvents` | calendar-header-browser, agenda-plan-browser |
| 7 | Geen/wekelijks/maandelijks/jaarlijks en hele dag; één reeks met uitzonderingen; keuze voorkomen/reeks bij wijzigen/verwijderen | appointment-recurrence, bestaande afspraakeditor | agenda-plan-core/browser, storage-safety-browser |
| 8 | Behoud data, ID's, back-ups/offline; geen overlap/overflow in Bosgroen en Super Dark | validator, bestaande guarded mutate, versie-URL's en precache | zes planner-browsergroepen, core-controles, recovery-upgrade-browser; 360/393/412/1280 px |

## Gegevenscontract en randgevallen

Geen migratie: bestaande afspraken blijven geldig zonder `recurrence`/`exceptions`. Reeksen voegen `recurrence` (`none`, `weekly`, `monthly`, `yearly`) toe aan dezelfde afspraak. `exceptions` bewaart overrides/afronding of annulering onder de oorspronkelijke ISO-datum. Virtuele voorkomens krijgen uitsluitend tijdens rendering een afgeleide ID; de reeks blijft één opgeslagen afspraak. Verplaatsen bewaart de oorspronkelijke sleutel. Reekswijzigingen behouden bestaande uitzonderingen. Maanddagen die niet bestaan en 29 februari in niet-schrikkeljaren worden overgeslagen; geen verschuiving naar een andere verjaardag. Het formulier toont bij reeksbewerking de oorspronkelijke startdatum. De scopekeuze laadt de bijbehorende bewaarde waarden.

Lokale herhaling gebruikt kalenderdagen, onafhankelijk van zomertijd. Google-items blijven alleen-lezen; bestaande lokale tijdzone- en exclusieve einddatumlogica blijft gelden. Dagstippen sluiten doorgeschoven oude afspraken en Fitness-boekingen uit. Handmatige takenherhaling en ontbrekende taakdatums blijven ongewijzigd.

## Testomgeving

Uitsluitend fictieve gegevens in geïsoleerde profielen. Lokale Chromium-emulatie is geen fysieke Samsung A54-, TalkBack- of geïnstalleerde-PWA-test. Geen productiegegevens gebruikt. Voor/na-beelden worden door `agenda-plan-browser.cjs` geschreven naar `/tmp/memento-agenda-plan/{before,after}`; de basisbron is een afzonderlijke worktree. Viewportbeelden zijn bewust gebruikt: full-page-capture in deze renderer wijzigt de hoogte van het adaptieve dagcarrousel tijdens opname. Andere bestaande journeys controleren lange lijsten en scrollposities afzonderlijk.


## Lokale verificatie

GESLAAGD: 45 core-/syntaxcommando's uit de centrale workflow; de 24 browserjourneys uit alle zes high-riskgroepen; upgrade vanaf bovenstaande main met echte serviceworker/IndexedDB, offline herladen en bewaarde bijlagehash. Mislukte journeys door gewijzigde navigatie zijn na aanpassing van de echte gebruikersroute opnieuw afzonderlijk uitgevoerd. De aanvullende afspraakjourney controleert beide thema's op 360/393/412/1280 px, jaarherhaling, Google-items over middernacht, reeks/voorkomen, taakdetails en touch. De ZIP-roundtrip bevat ook een reeks met verplaatste en geannuleerde voorkomens.

De upgradefixture wacht nu op `networkidle` vóór omschakelen: anders kan een nog lopende fetch van de oude worker diens cache na activatie opnieuw aanmaken. De runtime-workerlogica is ongewijzigd; geen safetyassertion is verwijderd. De browserinstallatie gebruikt lokaal Chromium 153; CI gebruikt zijn eigen gepinde Playwright-installatie. Dit zijn afzonderlijke controles.

Versiebehouden fictieve 393px-vergelijkingen:

| Scherm | Voor | Na |
|---|---|---|
| Agenda, Bosgroen | [Voor](day-tasks-agenda-20261108/before-393-forest-agenda.png) | [Na](day-tasks-agenda-20261108/after-393-forest-agenda.png) |
| Mijn dag, Bosgroen | [Voor](day-tasks-agenda-20261108/before-393-forest-day.png) | [Na](day-tasks-agenda-20261108/after-393-forest-day.png) |
| Taken, Super Dark | [Voor](day-tasks-agenda-20261108/before-393-superdark-tasks.png) | [Na](day-tasks-agenda-20261108/after-393-superdark-tasks.png) |

NIET GEVERIFIEERD: fysieke Samsung A54/TalkBack en een geïnstalleerde productie-PWA. Geen merge/publicatie uitgevoerd als onderdeel van dit lokale bewijs. De PR-workflow bewaart de uiteindelijke agenda-beelden ook op groene runs.
