# Memento Kenniscentrum — implementatie en grenzen

Status: geïmplementeerd op `main`, local-first. Dit document beschrijft de **werkelijke** code, niet alleen het eerdere ontwerp.

## Gebruikersinterface
De bestaande Leven-weergave `notes` opent een compacte Kenniscentrum-hub met snelle invoer, recente items, vastgezette items en verzamelingen. Kenniscentrum 2.0 voegt vijf aanpasbare hoofdverzamelingen met twee niveaus en een dagboek toe. De voormalige verzamelingen (eLiquid Recepten, Inspiratie, Documenten, Projecten, Huis & Leven, Onderzoek) blijven met dezelfde IDs bereikbaar onder Bestaande verzamelingen. Zie [migratie, bediening en testbewijs](knowledge-v2.md). Er worden geen demonstratiegegevens aan persoonlijke opslag toegevoegd. Inbox, archief, prullenbak, zoeken, tags, sorteren, lijst/galerij/tabel, receptgegevens, checklists, Markdown-opmaak, gerelateerde notities, conceptautosave en tekstversies zijn aanwezig.

PDF/JPEG/PNG/WebP kunnen lokaal worden toegevoegd (maximaal 25 MB per bestand); de PDF wordt via de **ingebouwde browserviewer in een iframe** geopend, niet via PDF.js. PDF-tekstindexering, OCR, paginagebonden annotaties en PDF.js zijn nog **niet** geïmplementeerd. Externe websites worden alleen op expliciete linkactie geopend. Android PWA share target voor tekst/links is geconfigureerd, maar Android-gedrag is nog niet in een echte browser bevestigd.

## Opslag en synchronisatie
De actuele schrijfbare bron voor **tekstuele kennisitems en verzamelingsmetadata** is de bestaande Leven-JSON in `localStorage` onder `compass_life_preview_v1`. De bestaande Leven- en Financiën-gegevens blijven daardoor compatibel. **Binaire bijlagen** worden afzonderlijk in IndexedDB `memento_knowledge_files_v1` opgeslagen. Dit is een bewust beperkte tussenstap: de eerder voorgestelde volledige IndexedDB-migratie voor metadata is nog niet gerealiseerd.

Kennisitems krijgen stabiele IDs, `revision`, `updatedAt`, `createdAt`, tags, koppelingen en optionele bijlagen. Kenniscentrummetadata bevat `deviceId`. Er is **nog geen synchronisatieprotocol**, conflictresolutie, versleuteling of gedeelde backend; het systeem is structureel voorbereid maar niet volledig sync-ready. Een volgende fase vereist een transactionele metadataopslag, een wijzigingslog en synchronisatie van binaire bestanden. Schakel geen sync in zonder een expliciete privacy- en conflictstrategie.

## Back-up en herstel
Leven → Back-up & instellingen heeft een volledige offline ZIP-export van **Leven + Financiën + bijlagen**, met manifest, SHA-256-integriteitscontrole en lokale ZIP-archivering zonder externe dienst. Herstel controleert bestanden vooraf en vraagt bevestiging. Oudere JSON-import/export blijft beschikbaar maar bevat geen bijlagen. ZIP is **niet versleuteld**. ZIP-grootte maximaal circa 180 MB; bestandslimiet 25 MB. De gebruiker kan opslaggebruik controleren en een verzoek voor blijvende browseropslag indienen. De browser kan dit weigeren en een back-up blijft noodzakelijk.

Financiën bewaart de hoofdgegevens in `uitgavenkompas_v1`. De ZIP neemt daarnaast twee bekende dashboardvoorkeuren mee. Andere tijdelijke UI-voorkeuren, externe Google-accounttokens en PIN-geheimen worden niet als volledige persoonlijke gegevens geclaimd. Bij opslagfouten wordt herstel geprobeerd; browserafsluiting, opslagtekort en het wissen van browsergegevens blijven risico's.

## Validatie
`node tests/knowledge-regression.cjs` en `node tests/memento-regression.cjs`; syntaxcheck van alle nieuwe JS-modules. De workflow `.github/workflows/knowledge-regression.yml` draait op pushes naar `main`. Tests controleren o.a. legacy-notities, checklistidentiteit, revisies, validatie, ZIP-roundtrip, ontbrekende bestanden en ontbrekende Financiën. Een werkelijke Android-browserinspectie, PDF-compatibiliteit en deployment zijn aparte controles; meld deze nooit als geslaagd zonder ze te hebben uitgevoerd.

## Volgende noodzakelijke technische verbeteringen
1. Gecontroleerde migratie van kennisitemmetadata naar IndexedDB met oude JSON-back-up en rollback.
2. Synclog per object, conflictkopieën en integriteitscontrole van bestanden.
3. Echte Android/PWA-browser- en hersteltests, inclusief meerdere tabbladen, volle opslag en offline PDF.
4. Optionele PDF.js-lezer, zoeken in PDF-tekst en paginagebonden aantekeningen.
5. Uitbreidbare, geteste back-upmanifesten voor toekomstige gegevensbronnen; bij grote collecties een streaming ZIP-export.

Geen echte persoonlijke gegevens of fictieve items zijn toegevoegd.

## Permanent prullenbak leegmaken (26 oktober 2026)

Het menu **Leven → Back-up & instellingen → Prullenbak definitief leegmaken** toont aantallen van reeds verwijderde items in **Leven** (notities, taken, boodschappen, wensen en taaktemplates, plus eventueel verwijderde Fitness-sessies) en **Financiën** (alle arrays onder de bestaande financiële `trash`-opslag). Hetzelfde scherm is bereikbaar vanuit **Financiën → Instellingen & data → Prullenbak Financiën** en vanuit de Kenniscentrum-prullenbak.

Deze handeling werkt alleen nadat de gebruiker expliciet **VERWIJDEREN** heeft ingevoerd. De applicatie verwijdert geen actieve transacties, bonnen, afspraken, notities, trainingssessies of bewaarde sjablonen, en maakt geen gegevens namens de gebruiker schoon zonder toestemming.

De pure regels staan in `assets/memento-trash-core.js` en zijn regressiegetest in `tests/trash-regression.cjs`. De UI controleert beide actuele gegevensbronnen, bewaart alleen noodzakelijke bestands-ID's voor herstelbaar herproberen, schrijft nieuwe Leven- en Financiën-gegevens en probeert een fout vóór voltooiing terug te draaien. Na voltooide schrijfoperaties ruimt de functie de twee **automatische lokale vorige-versie-herstelkopieën** op, zonder nieuw snapshot van de te wissen items te maken. De verwijderde notitiebijlagen worden uit IndexedDB verwijderd als er geen resterende notitie naar verwijst. Een bestandsfout houdt alleen de bestands-ID in een kleine opruimwachtrij over, zodat de gebruiker expliciet opnieuw kan proberen.

**Grenzen:** deze code is geen forensisch veilige overschrijving van fysieke opslag. Eerder gedownloade ZIP-/JSON-back-ups, andere browserprofielen, andere apparaten en gegevens die bewust nog in een actief object staan, worden niet verwijderd. De broncode bevat geen individuele gebruikersnotities. Gegevenssynchronisatie is nog niet aanwezig; bij latere synchronisatie moet definitief verwijderen expliciete tombstones en conflictregels krijgen. De twee `localStorage`-bronnen kunnen niet als één IndexedDB-transactie worden geschreven: bij fouten probeert de UI terug te draaien, maar browsercrashes of gelijktijdig gebruik in meerdere tabbladen kunnen gedeeltelijke resultaten veroorzaken. Sluit andere Memento-tabbladen tijdens leegmaken en bewaar eerst een externe back-up wanneer herstel later gewenst is.
