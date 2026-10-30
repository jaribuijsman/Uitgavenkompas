# Notities — ontwerprichting C

Uitgangspunt: actuele `main` op 30 oktober 2026, `03fd10052f1e99b370f99a50a2b503fbb2cf8633` (laatste broncommit 14:45:57 UTC). Implementatie op verzoek van de gebruiker naar aanleiding van `Memento_Notities_Ontwerprichting_C.md`. Het daarin genoemde losse HTML-prototype en de vier oorspronkelijke masterplan-/ontwerpdocumenten waren niet beschikbaar in deze workspace; zij zijn niet als gelezen of getest aangemerkt. Actuele projectinstructies: `AGENTS.md`, `docs/knowledge-v2.md`, bestaande modules en tests.

## Scope en ontwerpcontract (G0–G3)

Risiconiveau **2**: presentatie en bestaande navigatie in Notities. Geen schema, opslagkeys, migratie, domeinmodule, ZIP-formaat, IDs, bijlagen of oorspronkelijke afbeeldingen gewijzigd. Mijn dag, Taken, Agenda, Financiën, PIN en branding vallen buiten de wijziging. Offline assets krijgen uitsluitend overeenkomstige versies en cache v77; de worker-fetch-/upgradelogica blijft identiek.

- Startpagina: één `+ Nieuw`, bestaande centrale zoekfunctie voor notities én taken, Inbox, hoofdverzamelingen met volledige bestaande covers van 120 CSS-px. Vastgezet, recent, snelle invoer, bestaande verzamelingen en beheer blijven beschikbaar.
- Hoofdverzameling: terug, titel met maximaal twee zichtbare regels, rechtstreeks kruimelpad naar Notities en overflow met bestaande handlers. Samenvatting telt ook submappen mee. Submaprijen zijn minimaal 72 px, met bestaand pictogram, naam, aantal en pijl. Rechtstreekse notities krijgen een eigen sectie; bij nul directe notities met aanwezige submappen verschijnt geen leeg blok.
- Subverzameling: zichtbare zoekrij; type, tags, sortering en lijst/galerij/tabel via `Filters`. De compacte lijst gebruikt een titel van maximaal twee regels, één previewregel, relevante tags, datum en pijl. Volledige tekst blijft via de editor bereikbaar.
- Leeg en geen treffers hebben afzonderlijke boodschappen en acties. Filters worden bij mapwisseling gewist; teruggaan vanuit een notitie naar dezelfde map behoudt de zoekselectie. Er wordt geen mapgebonden filtervoorkeur opgeslagen. Het wissen van filters behoudt de gekozen sortering en weergave.
- App- en browser-terug/vooruit gebruiken bestaande IDs en bewaakte save/cancel-routes. Browsergeschiedenis bevat alleen schermidentifiers. Nieuwe schermen beginnen bovenaan en geven toetsenbordfocus aan de titel; filterwijzigingen behouden de invoerfocus. Een leeg nieuw concept keert naar zijn oorspronkelijke map terug zonder lege notitie op te slaan.

De oorspronkelijke header stond in de geïsoleerde baseline bij openen correct. Het ontbreken van scrollherstel bij interne navigatie kon volgende schermen onder de vaste header laten beginnen. Dit is aan de navigatiekant opgelost. Dubbele kaart-/headerregels zijn verwijderd uit de late glass- en layout-stylesheets; de lokale Knowledge-stylesheet beheert deze indeling. Geen nieuwe observer, globale override of `!important`-laag toegevoegd. Bestaande late glass/layout-decoratie is meegenomen in de echte browserrenders.

## Verificatie (G1, G4)

Dezelfde fictieve fixture draait tegen de ongewijzigde baseline en de gewijzigde echte app. Chromium via Playwright 1.62.1, aanraakemulatie op 360/393/412, desktop 1280, hoogte 852, Nederlands, Europe/Amsterdam, vaste testdatum, reduced motion. Ook 430 px hoogte en grotere basistekst gecontroleerd. Geen productieprofiel of persoonlijke notitietekst gebruikt.

Nieuwe regressie: `NODE_PATH=/tmp/memento-browser/node_modules node tests/notes-direction-c-browser.cjs`.

- Alle vier breedtes: hoofdkaarten, compacte submappen, drie notitierijen met tags en lange URL, zoek/filter/sortering/weergaven, filters zonder treffers, lege map, context van nieuwe notitie, app-terug, browser-terug/vooruit, directe kruimelnavigatie en navigatie na scrollen.
- Geen horizontale documentoverflow; titels beginnen onder de vaste header; zichtbare bediening minimaal 44×44 px. Drie submappen passen op mobiel binnen de eerste viewport, boven de bottomnavigatie. Geen submapbanners; originele covervelden en de centrale kiezer blijven bestaan.
- Op 393 px: bewuste opslagweigering tijdens browser-terug uit de directe editor houdt invoer zichtbaar en opslag ongewijzigd. Opnieuw bewaren na herstel slaagt. Extra fixture met vijftien submappen, een lange oudernaam, één directe notitie en geopend beheermenu.
- Mijn dag, Taken en Agenda op 393 px zijn **pixelidentiek** aan de baseline met dezelfde fixture.
- Voor/na-beelden en DOM-metingen staan in `evidence/`. `runtime.json` bevat de SHA-256-hashes van alle gewijzigde runtimebestanden.

Bestaande uitgevoerde controles:

```text
node tests/knowledge-regression.cjs       # 16 controles geslaagd
node tests/knowledge-v2-core.cjs          # 13 controles geslaagd
node tests/knowledge-v2-safety.cjs        # 5 veiligheidsgroepen geslaagd
node tests/knowledge-covers.cjs          # 4 cover-/ZIP-groepen geslaagd
node tests/app-review-core.cjs           # 17 controles geslaagd
node tests/masterplan-core.cjs           # zoekscope/tellingen/IDs geslaagd
node tests/service-worker-cache.cjs      # geslaagd
node --check assets/memento-knowledge.js # geslaagd
git diff --check                        # geslaagd
```

Ook geslaagd: bestaande `knowledge-v2-browser.cjs` op 393 px (editor, verplaatsen, dagboek, lange invoer, opslagfout/herstel, touchdrag, rollback, PDF-bytes, alleen-lezen tab, volledige ZIP en echte offline herlaadactie), `knowledge-covers-browser.cjs` en `illustrative-icons-browser.cjs`. De laatste controle opent alle 23 categorieën via hun bestaande IDs. Tests voor submapcovers controleren voortaan de bewaarde afbeelding in de editor; pictogramtests gebruiken de nieuwe folderrijen. Geen gegevens- of veiligheidsasserties verwijderd. De nieuwe suite is toegevoegd aan de bestaande release gate.

Een browseremulator bewijst geen fysieke Galaxy A54-, Android IME-, TalkBack- of geïnstalleerde-PWA-test. Deze apparaatcontroles blijven **NIET GETEST**. Bestaande ongewijzigde dagboek-/PDF-bediening valt buiten de nieuwe 44px-lijstschermmetingen.

## Vrijgave (G5)

Publicatie loopt via een aparte branch en PR naar main, na geslaagde automatische controles. Voor merge wordt de actuele main opnieuw vergeleken. Na publicatie worden de werkelijk geserveerde index, worker en vier gewijzigde assets op SHA-256 vergeleken en wordt een geïsoleerde mobiele live-weergave gecontroleerd. Een geslaagde lokale controle is op zichzelf geen publicatiebewijs.

Rollback: revert de PR als één geheel, inclusief overeenkomstige assetversies en cacheversie. Er is geen datamigratie terug te draaien; gebruikersopslag hoeft niet te worden gewist.

[Vóór: hoofdverzameling](evidence/before-393-parent.jpg) · [Na: startpagina](evidence/after-393-home.jpg) · [Na: hoofdverzameling](evidence/after-393-parent.jpg) · [Na: notitielijst](evidence/after-393-child.jpg)
