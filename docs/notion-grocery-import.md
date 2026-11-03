# Notion-ingrediënten als eenmalige boodschappen

Gebaseerd op gebruikersopdracht 3 november 2026 en de bijgewerkte Memento × Notion-roadmap. Baseline main: `6f20b2621b92502cead53b77f85a8bfb6b8b4766`.

## Gebruiksroute en ontwerp

Boodschappen → Mijn lijst → Ingrediënten uit Notion → plak ingrediënten → Controleren → selecteer en corrigeer regels/categorieën → Voeg N toe. Receptnaam en HTTPS-bronlink zijn optioneel. De bestaande Life-dialoog, producteditor, supermarktgangcategorieën en bewaakte opslag blijven eigenaar. Geen automatisch ophalen van privé-Notion en geen nieuwe gegevensverbinding.

Invoer gebruikt een ruim tekstveld en één primaire actie. Controle toont per ingrediënt een 48px selectielabel, naam, hoeveelheid, winkelcategorie, onzekerheden en de oorspronkelijke regel. Onderaan blijven Terug en Toevoegen bereikbaar in de bestaande vaste dialoogfooter. Terug/Sluiten bewaart het concept binnen de sessie; na succes begint de volgende import opnieuw. Er is geen eerdere goedgekeurde pixelreferentie voor dit scherm. Gebruikersopdracht autoriseert de implementatie; visuele acceptatie wordt afzonderlijk gerapporteerd.

## Acht acceptatiecriteria

1. Alleen geselecteerde regels worden na bevestiging atomair toegevoegd aan de bestaande actieve boodschappenlijst, zonder bronrecepten of andere domeinen te wijzigen.
2. Iedere importregel behoudt zijn brontekst; ontbrekende hoeveelheden en onduidelijke keuzes/ranges worden niet verzonnen of stil afgekapt.
3. Exact herkende hoeveelheden kunnen ×0,5/1/2/3; overige regels hebben een waarschuwing. Handmatig aangepaste hoeveelheden blijven bij verder schalen behouden.
4. Notion-ingrediënten hebben eigen IDs, `origin: notion-recipe` en `lifecycle: one-off`; geen matching, activatie of optelling met gewone producten. Dubbelen binnen invoer worden gemeld.
5. Afvinken verwijdert alleen de eenmalige regel uit actuele opslag. Deze komt niet in Producten, Favorieten, suggesties of een gekochte-importverzameling. De bestaande tijdelijke undo blijft beschikbaar en vervalt na een volgende wijziging.
6. De winkelcategorie is vooraf en later via Bewerken instelbaar. De bestaande winkelmodus groepeert hem op die categorie, ook bij expliciet Overig. Open importregels blijven na herstart/back-up/herstel bestaan.
7. Annuleren of mislukte opslag schrijft niets gedeeltelijk weg. Concept/selectie blijft na fout bruikbaar. Dezelfde ingrediënten mogen bij een latere boodschappenronde opnieuw geïmporteerd worden.
8. Gewone producten, gedeelde linkconcepten, opslagbeveiliging, offline assets en overige Leven-/Financiëngegevens behouden hun gedrag. Nieuwe metadata wordt gevalideerd; oude producten worden niet herclassificeerd.

## Eigenaren en controles

| Eis | Implementatie | Controle |
|---|---|---|
| Tekst, onzekerheden, schalen | memento-grocery-import.js | grocery-import-core.cjs |
| Transactie, eenmalige levensduur, undo | memento-life-app.js / bestaande storage guard | grocery-import-storage.cjs; bestaande opslagtests |
| Invoer, selectie en categorie | bestaande Life-dialoog / producteditor; memento-ui.css | grocery-import-browser.cjs, 360/393/412/1280px en korte viewport |
| Offline/update | index.html, sw.js precache en versie | service-worker-cache.cjs; bestaande upgradebrowserjourney |

Nieuwe core-/opslagtests en bestaande corechecks zijn lokaal uitgevoerd. Browserbinary kon in de lokale omgeving niet worden geïnstalleerd; geen lokale screenshot-, A54- of TalkBack-claim. De PR-gate voert de volledige door de planner gekozen browsergroepen en upgradecheck uit. De nieuwe browserjourney bewaart geometrie, screenshots en foutstatus ook bij groen als `memento-grocery-import-visual`.

## Opslagcompatibiliteit

Geen nieuwe opslagkey of herschrijving van oude producten. Optionele importmetadata staat op dezelfde boodschappenrecords. Validatie weigert ongeldige eenmalige records zonder oude opslag te vervangen. Actieve importdata gaat mee in bestaande back-ups; verwijderen kan oude gedownloade back-ups niet veranderen. Oude appversies kennen de nieuwe levensduur niet: gebruik na deze update geen oude appversie om zulke records te bewerken. Rollback is niet geverifieerd als downgrade met actieve importrecords; gegevens behouden/herstellen met de nieuwe versie.

## Nog afzonderlijk te bewijzen

Fysieke Samsung A54/PWA, toetsenbord op het toestel en visuele beoordeling van de exacte PR-head. Android-tekstdelen als nieuwe importingang, JSON-import, directe Notion-API-koppeling en automatische personen-/portiesherkenning vallen buiten deze basisversie. Gewone gedeelde links blijven de bestaande conceptnotitieroute volgen.
