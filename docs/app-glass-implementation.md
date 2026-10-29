# Uitvoering appontwerp — Nieuw Glas

Werkbasis: actuele GitHub `main` **910e0d4feddc3338c5693511b8d375b5d9ceaee2**, opnieuw gecontroleerd tijdens uitvoering. Het interactieve voorstel van 29 oktober 2026 omvatte 42 schermen en 234 gegroepeerde functiepunten. Dat aantal is een inventarisatie, geen claim van 234 afzonderlijk uitgevoerde browsertests.

De eigenaar gaf expliciet opdracht het voorstel in de app te implementeren en in main te publiceren. Bronregels: Memento Design System (template van 29 oktober), de beschikbare `LEESMIJ.txt`, `docs/masterplan-implementation.md`, het eindrapport en de concrete ontwerp-/gegevensafspraken uit het gesprek. Er waren geen aanvullende projectbestanden bij deze sessie bijgevoegd; niet-beschikbare bijlagen zijn niet als gelezen voorgesteld.

## Architectuur en gegevens

`memento-glass.css` geeft bestaande schermen dezelfde bosgroene translucente lagen, oorspronkelijke illustraties, dunne randen, salie-acties en eindige lichtinval. `memento-glass.js` groepeert bestaande bediening en bezit geen domeinopslag. De echte editors en bestaande bridges blijven de schrijvers. `memento-review-core.js` bevat uitsluitend pure berekeningen/validatie.

Geen historische migratie, geen wissen/ombouwen van taken, notities, bedragen, categorieën, IDs, bijlagen, sessies of PIN. De enige optionele nieuwe opgeslagen voorkeur is `compass_life_preview_v1.uiPreferences.taskFilters`, gevalideerd en geschreven via dezelfde beschermde Life-route. Receptschaling en kookafvinken zijn tijdelijk; alleen een expliciete ingrediëntselectie voegt via de bestaande mutatie/undo producten toe. Dit maakt geen transactie. Oude JSON en volledige ZIP blijven ondersteund.

Interne creditcardaflossing is geen tweede uitgave. De periode-uitkomst is geen banksaldo. Ontvangen overboekingen blijven apart inspecteerbaar, inclusief het gezamenlijke voorbeeld van €400 inkomen + €500 ontvangen transfer = €900 ontvangen. Gewoon navigeren neemt geen andere lokale financiële filters over; een expliciete doorklik wel.

## Schermdekking

Onderstaande tabel onderscheidt nieuwe uitwerking en doelbewust behouden functies. Bestaande betrouwbare routes worden niet vervangen door de vereenvoudigde formulieren of voorbeeldgegevens uit het prototype. Externe concurrentfuncties zoals banksynchronisatie, OCR, prijsmonitoring en cloud-delen waren vergelijking, geen onderdeel van deze opdracht.

| Scherm | Uitwerking |
|---|---|
| Startscherm · Daglijn | Bestaande Nieuw Glas/Daglijn behouden, inclusief weer, vier routes en drie echte invoervensters. |
| Mijn dag | Compacte dagkop en gelabeld dagboek; originele datums, dienst en open achterstallige taken behouden. Gedachte secundair uitklapbaar. |
| Taken | Wisbare filterchips, bewaarde selecties via bestaande Life-write, stapvoortgang en secundaire statusoverzichten. |
| Taakdetail & invoer | Bestaande editor: omschrijving, plandatum en stappen eerst; eigenschappen met actuele samenvatting eronder. |
| Agenda | Daglijst standaard, Maand als tikalternatief; Google-beheer in eigen disclosure. Bronafspraken blijven native. |
| Rooster & dienst | Tien echte geprojecteerde dagen, volledige dienst op selectie en nachtgrens 06:00; historische profielcodes niet gewijzigd. |
| Boodschappen | Compacte categorieën, 48px afvinken en hoeveelheid naast product. Bestaande gekocht-/undo-/catalogus-/herstelroutes behouden. |
| Aankopen-lijst | Eigen lijstidentiteit, budget en bestaande Slim Kopen-route behouden binnen dezelfde glasrijen. |
| Aankoopwensen | Compacte status/budgetkaarten; notitie en beheer uitklapbaar; onderzoeks- en herstelactie blijven direct. |
| Notities · start | Compacte horizontale verzamelkaarten met echte bestaande illustraties; Inbox/zoeken/recente items behouden. |
| Zoeken in notities & taken | Veilig ge-escapete markering in fragment; bestaande filters en werkelijke paden behouden. Geen finance/PDF-zoekclaim. |
| Verzamelingen | Glaskaart, bestaande directe/recursieve telling, werkelijke hiërarchie en oorspronkelijke rangschik-/weergavefuncties. |
| Notitie bewerken & verbinden | Ruim direct schrijfvlak, optionele titel/tags uitklapbaar; oorspronkelijke uitgebreide editor, versies en passageconversie behouden. |
| Recepten & creaties | Echte ingrediëntrijen, niet-destructief ×0,5/×2/×3, kookafvinken, leesstand/volgende stap en geselecteerd toevoegen aan bestaande boodschappen. |
| Mijn dagboek | Zoeken in historische dagen met tekstfragment; vandaag blijft directe ingang; Mijn verhaal en bestaande optionele invoergroepen behouden. |
| Gezondheid & welzijn | Bestaande handmatige Samsung Health-velden en bronstatus behouden; geen automatische koppeling of nieuwe meetclaim. |
| Spraak, audio & AI-schrijfhulp | Bestaande afzonderlijke dictatie-, opname- en externe schrijfhulproutes behouden met dezelfde concept-/toestemmingsbeveiliging. |
| PDF, afbeeldingen & bijlagen | Bestaande bestandsnamen, type/grootte, preview, Download en Open origineel behouden; bestandopslag en ZIP onaangeroerd. |
| Fitness · Vandaag | Bestaande Start/Hervatten en echte geplande training behouden; gedeelde glaskaarten en compacte dienstinformatie. |
| Actieve training | Actieve oefening open, andere oefeningen als benoemde details; Volgende set en hervatpositie openen de juiste oefening voor focus. |
| Fitness · Schema | A/B/C-strip naar echte schemakaarten; voorstel vergelijken met voor/na op een kopie vóór bestaande expliciete toepassing. |
| Fitness · Voortgang | Oefeninggrafiek centraal; frequentie, spiergroepen, voeding en metingen achter eigen keuze; echte historische data behouden. |
| Overzicht | Netto uitgaven en geldstroom met afzonderlijke overboekingen/grove ontvangst; drie gelabelde grafiekknoppen; bewuste contextdoorklik. |
| Transacties | Lijst en één netto-selectietotaal voorop; echte filters ook als wisbare chips. Native paginering en export blijven. |
| Transactie invoeren | Volledig bestaand formulier; categorie, subcategorie, rekening en toewijzing direct; overige details uitklapbaar. Splitsing en transferbestemming behouden. |
| Analyse · Overzicht | Bestaande lokale periode/rekening/persooncontext en vergelijkingen behouden; gedeelde glasstijl en compacte donut. |
| Analyse · Categorieën | Bestaande tikbare categorie/subcategorie- en transactieroutes behouden, compactere grafiek; V9-doorklik draagt context expliciet over. |
| Analyse · Trends & inzichten | Echte jaar-/vergelijkings-/patrooncijfers en broncontext behouden; geen verzonnen voorspellingen of tweede analysebron. |
| Rekeningen | Werkelijk saldo pas na expliciete controleactie; startpositie uitklapbaar. Bestaand verschil en controledatum blijven. |
| Budgetten | Bestaande ingestelde limieten eerst; totaalbudget onder Beheer; overnemen noemt vervangende categorielimieten en totaal vóór bevestigen. |
| Planning · vaste lasten | Bestaande brontransactie/legacy-status en korte betaalinvoer behouden; correctie/dubbele-submit/undo blijven bewaakt. |
| Spaardoelen & scenario | Compacte glaskaarten met bestaande voortgang/inleg; scenario in eigen uitklapbare sectie, zonder financiële writes. |
| Slim Kopen | Visuele stappen Vraag/Eisen/Vergelijk/Keuze rond het bestaande dossier, IDs en bronlinks behouden. |
| Geldcoach | Bestaande concrete coachvraag, cijferbasis, preview en expliciete externe AI-stap behouden in gedeelde stijl. |
| Bonnetjesscanner | Invoer/Controleren/Koppelen benoemd; JSON onder eigen technische disclosure; echte bon-, split- en transactiekoppeling behouden. |
| Back-up & instellingen | Eén primaire volledige ZIP; herstel, beveiliging, privacy en definitieve verwijdering elk eigen disclosure. |
| Instellingen & data | Bestaande voorkeuren/categorieën/back-up/privacy in benoemde secties; centrale volledige ZIP-route behouden. |
| Navigatie & algemene bediening | Bestaande Leven/Financiën, vier vaste dagelijkse routes en Meer behouden; herkenbare actieve selectie en glasnavigatie. |
| Checklist-notitie | Voortgang en open items eerst zonder opgeslagen volgorde/IDs te herschrijven; bestaande passage-/taakconversie behouden. |
| Links & notitieconversies | Bestaand gerelateerd-blok, werkelijke doel-ID/status en bevestigde conversie behouden. |
| Verzamelingsbeeld & uitsnede | Dezelfde compacte kaartverhouding bij kiezen; bestaande bron, focus, eigen afbeelding en bewaakte bestandswrite behouden. |
| Android, offline & opslagfouten | Bestaande Web Lock/alleen-lezen/foutherstel ongewijzigd; versiegebonden cache met nieuwe assets en reduced motion. |

## Verificatie en publicatiepoort

Nieuw: `tests/app-review-core.cjs` controleert 17 financiële, hoeveelheid- en voorkeurcontracten. `tests/app-review-browser.cjs` bedient echte formulieren en echte opslag op geïsoleerde localhost-origins op 360/393/412 CSS-pixels, controleert ongewijzigde oorspronkelijke taken/fitness, en maakt beelden van alle 18 hoofdtabbladen. Bestaande functionele suites, native schrijfslot-, quota-/twee-tab-, ZIP-/bijlage- en echte PWA-upgradeproeven blijven vereist.

De eerste validatiecommit `91b420e` staat uitsluitend op `codex/app-glass-review`. De kern-, opslag-, PWA-upgrade-, dagboek-, covers-, pictogram- en quickfitcontroles slaagden; zes browserjobs faalden. Die mislukte runs worden niet als geslaagd gerekend. Onder meer gefolde instellingen, tags en kalender hadden aangepaste bediening in de tests nodig; de nieuwe transactiecontrole is bovendien van een onmiddellijke momentopname naar een expliciete opslagbevestiging gebracht. Geen gegevensasserties zijn verwijderd. `tests/helpers/reveal.cjs` opent de werkelijke ancestor-summary voordat een specifiek verborgen veld wordt bediend.

Op `a674e28488b0ead1362475cd83f1e5d695a0cbab` slaagde de cumulatieve masterplansuite, evenals de kern- en echte upgradeproef. Verdere validatie en definitieve publicatie worden pas hieronder vastgelegd nadat ze werkelijk zijn voltooid. Main blijft tot een groene acceptatie op de bestaande versie.

De mobiele proeven gebruiken Chromium met kleine aanraakviewports. Geen fysieke Samsung Galaxy A54 5G, werkelijk Android-toetsenbord, TalkBack, systeemterugknop of batterij-/vergrendelingstest beschikbaar. CSS-pixels passen zich aan browser- en weergave-instellingen aan; de fysieke 1080px-schermbreedte wordt niet vastgezet. Reduced motion en bestaande safe-area-/dialogregels blijven aanwezig.

## Vastgezette acceptatie

De definitieve functionele versie is **7fe9f833d6633e2d926021bcafec422f608307b3**. De volledige [acceptatierun 40911654927](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/40911654927) is geslaagd: core, echte PWA-upgrade en alle elf browsersuites (app-review, masterplan, storage-safety, categorieën, fitness, knowledge-v2, covers, pictogrammen, quickfit, dagboek en startscherm). Ook de drie overige op deze tak geactiveerde workflows zijn geslaagd. Alle 19 lokale gewijzigde bestanden zijn vóór vrijgave met de blobs van deze geteste commit vergeleken.

De nieuwe browseracceptatie bedient op 360/393/412 px de bewaarde taakselectie, taak met stappen, transactie met Subcategorie/Uitgever, contextdoorklik, niet-destructieve receptschaling, geselecteerde boodschappen en ingrediëntbewerking. De bestaande taken en fitness blijven objectgelijk. Alle 18 hoofdtabbladen worden op die drie breedtes op horizontale overloop gecontroleerd en vastgelegd. De overige bestaande suites toetsen de fout-/herstelroutes en binaire bijlagen. De beperkte toesteltestdekking hierboven blijft van toepassing.

De publicatie voegt uitsluitend dit bewijsdocument toe bovenop de geteste functionele commit. Er worden tijdens vrijgave geen verdere functies of stijlen aangepast. De nieuwe serviceworker gebruikt releasecache `memento-pwa-v65-20261029-app-glass-v1`; alle nieuwe assets staan in de eigen offlinecache.


### Aanvullende publicatiecontrole: taakmenu

De afzonderlijke day-portal-workflow op `009e072` vond een werkelijke overlap: `backdrop-filter` en `isolation` op glaskaarten maakten een eigen containing/stacking context rond het bestaande vaste taakmenu. De bottom-navigatie kon daardoor de verwijderactie afdekken. Tijdens een geopend menu worden uitsluitend op zijn voorouders deze effecten opgeheven; de bestaande menugeometrie en herstelbare acties blijven behouden. De specifieke suite `patches-001-002-004-browser` is toegevoegd aan de vrijgavematrix. Cache v66 en het CSS-versietoken zijn samen bijgewerkt. Dit is herstel van een publicatiefout, geen uitbreiding van het ontwerp.
