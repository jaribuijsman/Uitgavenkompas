# Memento masterplan 1.0 — uitvoering en bewijs

Contract: besluitversie 1.0 van 28 oktober 2026, M01–M20, Q01–Q05 en A01–A18. De expliciete uitvoeringsopdracht van de eigenaar autoriseert implementatie, commits en publicatie op `main`. Uitgangspunt: `52ac8c2f120b97769e26a8fb7f2ec1735ea7c0c9`.

## Nulmeting en gegevenscontract

De statische app heeft een bestaande financiële module in `index.html`, een Leven-module met bridges en aparte notitie-/fitnessmodules in `assets/`. Geen framework of nieuwe runtimeafhankelijkheid toegevoegd. De bestaande woordmerken, illustraties en pictogrammen blijven behouden.

- `uitgavenkompas_v1`: transacties, rekeningen, categorieën, maandbudgetten, vaste lasten, dossiers, instellingen en financiële prullenbak.
- `compass_life_preview_v1`: taken, boodschappen/aankopen, wensen, afspraken, notities, verzamelingen, versies en fitness. Binaire bijlagen staan in IndexedDB `memento_knowledge_files_v1`.
- De bestaande Web Lock en broncontrole bewaken beide hoofdsleutels. Een tweede tabblad kan lezen en invoeren, maar niet schrijven. Import, herstel en bestandswrites gebruiken hetzelfde operatietoken. Geen vervangende opslagarchitectuur.
- JSON versie 1 en volledige ZIP versie 2 blijven leesbaar. Geen echte persoonlijke gegevens beschikbaar of gebruikt. Alle herstelscenario's gebruiken fictieve gegevens op een aparte lokale origin en een tijdelijk Chromium-profiel.
- PIN blijft uitgeschakeld; de bestaande configuratie wordt niet gewist of veranderd.

### Financieel filtercontract (vastgesteld vóór bouwen)

De globale maand blijft gedeeld. Dashboardrekening en dashboardloonperiode blijven lokale keuzes; Transacties, Analyse, Budgetten en Geldcoach behouden hun eigen rekening-/toewijzingsfilters. Navigeren naar een ander financieel tabblad verandert deze keuzes niet. Een dashboardloonperiode wordt niet stilzwijgend op een maandanalyse toegepast. Fase 4 maakt de afzonderlijke context en exacte datums zichtbaar en behoudt beide periodetypen. Dit volgt de bestaande bediening en vereist geen datamigratie.

## Fase 1 — betrouwbaarheid en vastgestelde fouten

**Eisen:** M11, foutcorrectie M08, historiecorrectie M04, betrouwbaarheid M14; nulmeting Q01–Q03. Overige onderdelen van deze eisen volgen in hun afgesproken fase.

**Reproducties:** Geldcoach gaf `money(fmt(data.net))` door aan een numerieke formatter; het kruimelpad gebruikte de laatst geopende verzameling; dagboekhistorie bevatte vandaag. De algemene test gebruikte vervallen views en verwachtte een checkbox in een dichtgeklapte notitie. Fitness probeerde een ZIP-download als JSON te lezen; de dagboektest gebruikte een vervallen datumkiezer. PIN-/pictogramtests hadden een verouderde, vaste cacheversie.

**Wijzigingen:** Geldcoach formatteert de numerieke nettowaarde eenmaal. Het pad volgt de echte verzameling-ID van de geopende notitie. Eerdere dagen zijn strikt ouder dan vandaag. Tests bedienen de actuele routes, lezen de echte ZIP en controleren dat cache en HTML exact bij elkaar horen. De opslagworkflow draait voortaan ook op `main`. De nieuwe masterplanworkflow bewaart mobiele testartefacten.

**Gegevensimpact:** geen nieuw domeinschema, geen conversie van historische records, geen wijziging van IDs of bijlagen. De bestaande hiërarchiemigratie en herstelroute blijven intact. Serviceworker/cache en de URL van het gewijzigde script zijn samen bijgewerkt.

**Werkelijk uitgevoerd en geslaagd:** algemene regressie (82), opslagveiligheid (22), native slotvrijgave, fitnesskern (25), kennis/ZIP (16), hiërarchie (13), hiërarchie/herstelveiligheid (5 groepen), dagboekkern (7), prullenbak, PIN uitgeschakeld, bosillustraties, pictogramkern (66 illustraties), covers. Chromium: bestaande opslagtest (9 groepen incl. twee tabs, quota, IndexedDB, ZIP en offline), fitness-browsertest, kennis-v2-browsertest en masterplanscenario's op 360/393/412 px. De laatste controleren onder meer negatieve Geldcoach-preview/prompt, CSV-centbedrag, dubbel betalen/correctie, notitiepad en dagboekhistorie.

**Bewijs:** nulmeting met screenshots op 393 px in de uitvoerwerkruimte; aanvullende screenshots op alle drie mobiele breedtes. Reproduceer met `node tests/helpers/visual-fixture.cjs`, de bestaande browserharnassen en `tests/masterplan-browser.cjs` (Playwright 1.62.1; `BROWSER_EXECUTABLE` kan Chromium selecteren). De hoofdopslag en PIN-instelling zijn na elke scenario-run gecontroleerd. De unit-test voor verwijderen/herstellen van een betaling controleert betaald/open en bonkoppelingen.

**Beperkingen:** desktop-Chromium met aanraakinvoer en kleine viewport is geen fysieke Android-/TalkBack-test. Een verkleinde viewport simuleert beschikbare toetsenbordruimte, geen werkelijk Android-toetsenbord. Bestaande, vóór de opslagbeveiliging geopende code kan het Web Lock negeren; sluit oude tabbladen/PWA-vensters bij de update. Er is geen onbewezen garantie toegevoegd voor zulke oude, nog draaiende code. Een publicatiecontrole vereist de werkelijk gepubliceerde commit en volgt na push.


## Fase 2 — Mijn dag, taken, dagboek en notities

**Eisen:** M01 (dienstbadge volgt na cyclusvalidatie in fase 4), M02–M05. Mijn dag heeft een compacte datum/samenvatting en één dagboekknop; eerder geplande taken en de volgende twee dagen blijven uitklapbaar bereikbaar. Snelle invoer behoudt taakdatum, Inbox, microfoon en bestaande opslag. Weer, gedachte, afspraken, agenda en training zijn behouden. Geen prioriteiten automatisch veranderd.

**Code:** `index.html` (Mijn dag, bestaande taakdetails en quick capture), `assets/memento-knowledge.js/.css` (directe notitiebewerking, dagboek en conceptstatus), `assets/memento-ui.css` (compacte dagindeling), cache/assetversies, cumulatieve masterplan-browsertest. Notitietitel en tekst worden bij een korte notitie niet identiek herhaald. Het notitiemenu bevat versiegeschiedenis; de uitgebreidere editor en alle bestaande beheeracties blijven beschikbaar.

**Gegevens:** geen hoofdopslagmigratie. De bestaande taken en notities behouden hun IDs, kleine-stapvelden, versies en bijlagen. Alleen een tijdelijk concept in `sessionStorage` van het eigen tabblad is toegevoegd (`memento_note_draft_v1`), inclusief oorspronkelijke notitie en bestemming. Succesvol opslaan wist dit herstelconcept. Herladen kan het concept na bevestiging hervatten; een inmiddels nieuwere notitie blokkeert het overschrijven. Verwerpen is een expliciete actie. Sluiten van de volledige browsersessie kan sessieopslag verliezen; dit is geen externe back-up.

**Geslaagd:** 82 algemene regressies; opslagveiligheid (22), kennis-/dagboekkern en hiërarchie/herstelveiligheid; bestaande Chromium-opslagtest en kennis-v2-test. De cumulatieve masterplansuite controleert op 360/393/412 px snelle notitie zonder titel, directe notitiebewerking/verplaatsing met hetzelfde ID en revisies, directe taakdatum/stap, afronden/heropenen zonder duplicaten, dagboek in één actie, lange tekst/schrijfstand in een 430px-hoge viewport, quota, herladen/herstel en weigering van een verouderd herstelconcept. Fase-1-scenario's blijven groen.

**Mobiel:** screenshots van Mijn dag, directe notitie, taakdetail en schrijfstand op alle drie breedtes; een verkleinde viewport is nadrukkelijk alleen een simulatie van minder beschikbare ruimte. Geen fysiek Android-toetsenbord of TalkBack beschikbaar. Alle definitieve assets zijn behouden. Publicatiegegevens worden bij eindacceptatie gebundeld.

## Fase 3 — zoeken, verzamelingen en duurzame koppelingen

**Eisen:** M06–M10. De notitie-ingang heet overal Notities. Een centrale lokale zoekroute combineert notities en taken, met inhoudsfragment rond het zoekwoord, type, werkelijke bestemming/status, zichtbare filters en één wisactie. Financiële transacties en PDF-tekstextractie vallen buiten deze zoekroute. Hoofdverzamelingen tonen aantallen inclusief subverzamelingen, met een afzonderlijk direct aantal.

**Koppelingen:** een echte tekstselectie of expliciet geplakte passage opent een taakvoorstel; de gehele notitie wordt niet automatisch gekopieerd. Pas bewaren maakt de open taak. Bestaande `sourceNoteId` en `conversions` verzorgen de teruglinks en de zichtbare open-/afgerond-/archiefstatus. Verplaatsen, archiveren en herstel behouden deze IDs. Er is geen nieuwe koppelmigratie of zoekdatabase nodig.

**Aankoopanalyse:** Boodschappen en Aankopen zijn afzonderlijke lijsten in de bestaande productopslag. Aankoopwensen zijn afzonderlijke records; Slim Kopen gebruikt de bestaande financiële onderzoeksdossiers. Deze structuren en opgeslagen namen zijn behouden. Terug naar dezelfde wens en hetzelfde dossier behoudt naam, budget, antwoorden en uitkomst. Een dossier in de prullenbak wordt uitsluitend na bevestiging hersteld. Gekocht boeken doet niets financieel; de optionele registratieknop opent alleen een lege transactiedraft met productcontext. Onderzoek bewaren meldt een mislukte terugkoppeling eerlijk en kan zonder duplicatie opnieuw worden geprobeerd.

**Code/gegevens:** bestaande notitiecore/UI/CSS en de Life-/onderzoeksbridges in `index.html`, cumulatieve browser-/kerntest en bijbehorende cacheversies. Nieuwe taken krijgen direct het bestaande standaardveld `deletedAt: ''`, zodat export/herstel geen extra normalisatiestap op een zojuist gemaakte taak nodig heeft. Historische gegevens zijn niet herschreven; bestaande onbekende dossiermetadata wordt bij bewerken behouden.

**Geslaagd:** algemene suite (82), nieuwe pure zoek-/tel-/koppelcontroles, bestaande kennis/ZIP (16), hiërarchie (13), veiligheid/herstel (5 groepen), PIN en pictogramkern. Chromium: bestaande kennis-v2-suite en cumulatieve masterplansuite op 360/393/412 px. Die laatste controleert woorden midden in lange tekst, resultaatcontext, taakresultaat, selectie → voorstel → taak → bronnotitie, status na verplaatsen/archiveren/afronden, recursieve teller, aankoopstatus zonder transactie, optionele lege financiële draft, herstel van hetzelfde dossier uit de prullenbak, en volledige ZIP-export/herstel met binaire bijlagen en exact gelijke Life/Finance-objecten. Alle eerdere fasescenario's zijn opnieuw geslaagd.

**Beperkingen:** geen fysieke Android-/TalkBack-test; tekstselectie is met Chromium-aanraakinvoer en de expliciete passagefallback gecontroleerd. Geen echte AI-aanroepen, externe agenda- of bankacties uitgevoerd.
