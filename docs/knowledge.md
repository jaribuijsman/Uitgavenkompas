# Memento Kenniscentrum — implementatie en grenzen

Status: geïmplementeerd op `main`, local-first. Dit document beschrijft de **werkelijke** code, niet alleen het eerdere ontwerp.

## Gebruikersinterface
De bestaande Leven-weergave `notes` opent een compacte Kenniscentrum-hub met snelle invoer, recente items, vastgezette items en verzamelingen. Er zijn zes lege voorgestelde verzamelingen (eLiquid Recepten, Inspiratie, Documenten, Projecten, Huis & Leven, Onderzoek); bestaande categorieën worden als verzamelingen herkend, zonder demonstratiegegevens toe te voegen. Inbox, archief, prullenbak, zoeken, tags, sorteren, lijst/galerij/tabel, receptgegevens, checklists, Markdown-opmaak, gerelateerde notities, conceptautosave en tekstversies zijn aanwezig.

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
