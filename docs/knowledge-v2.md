# Kenniscentrum 2.0 — implementatie en controle

Uitgangscommit: `f7d1d04fdca7fc26185cb3a7931859ca9c8c903e`. De wijziging beperkt zich tot Kenniscentrum, de vereiste importvalidatie, assetversies en bijbehorende tests. De uiteindelijke wijziging wordt rechtstreeks op main gecommit na controle op een tijdelijke validatiebranch. Er wordt niet geforceerd gepusht.

## Bediening

De startpagina toont Kenniscentrum, direct Notitie toevoegen, Inbox, de ingestelde hoofdverzamelingen, compacte vastgezette/recente items en aanvullende overzichten. **Bestaande verzamelingen** staat als uitklapbaar overzicht onder de recente items. Oude verzamelingen verdwijnen daardoor niet achter een stilzwijgende herindeling.

De vijf nieuwe standaardhoofdverzamelingen zijn **Levenspad**, **Huis & wonen**, **Recepten & creaties**, **Projecten & onderzoek** en **Ideeën & inspiratie**. Zij bevatten de aangevraagde 18 subverzamelingen. Het gaat om gewone, hernoembare en archiveerbare verzamelingen, geen verplichte taxonomie. Een hoofdverzameling mag ook rechtstreeks notities bevatten. Een PDF kan in elke passende verzameling worden opgeslagen; Documenten wordt niet als nieuwe verplichte hoofdverzameling toegevoegd.

Open een verzameling en kies **Instellingen → Bewerken** voor naam, pictogram, standaardweergave of ouder. De editor biedt 21 visuele SVG-pictogrammen met toegankelijke labels. De geselecteerde waarde is een gecontroleerde pictogram-ID, geen gebruikers-HTML. Lijst, galerij en tabel blijven aanwezig. Annuleren bewaart geen collectieaanpassingen; bij een mislukte opslag blijft de editor met ingevoerde waarden open. Een oude verzameling kan vanuit ditzelfde scherm naar een gekozen hoofdverzameling worden verplaatst.

Het kruimelpad brengt je rechtstreeks terug naar de ouder of startpagina. Subverzamelingen hebben geen verdere kinderen. Verplaatsen behoudt IDs en inhoud, en weigert een ongeldige ouder, een kring of een derde niveau. Namen zijn binnen dezelfde ouder uniek, ook voor gearchiveerde verzamelingen; gelijke namen onder verschillende ouders zijn toegestaan.

## Volgorde wijzigen

Kies op de startpagina het verzamelingenmenu → **Volgorde wijzigen**, of binnen een hoofdverzameling **Instellingen → Volgorde wijzigen** voor de kinderen. Alleen in deze modus verschijnt een sleepgreep. Houd deze ongeveer 300 ms vast en versleep met touch of muis. Een vroege beweging annuleert de sleepstart; buiten de greep blijft normaal scrollen beschikbaar. Dicht bij de schermrand scrollt de pagina automatisch mee.

Bij loslaten wordt de nieuwe volgorde via de bestaande schrijfbescherming opgeslagen. Buiten het geldige doel loslaten, pointercancel of Escape tijdens slepen annuleert de voorlopige volgorde. Bij een opslagfout wordt ook de zichtbare volgorde teruggezet. Omhoog-/omlaagknoppen bieden dezelfde bewaakte handeling zonder slepen. Rangschikken verandert nooit de ouder.

## Dagboek

**Levenspad → Dagboek** toont Vandaag, eerdere dagen, voorvertoningen en optionele stemming. De datumkiezer opent ook een lege eerdere dag. Vandaag wordt berekend in **Europe/Amsterdam**; datums verschijnen Nederlands. Er zijn geen streaks, doelen, AI-aanroepen of externe diensten aan het dagboek toegevoegd.

De editor heeft datum, optionele titel, tekst, stemming en tags. Bij alleen openen wordt geen lege notitie opgeslagen. Bestaande dagen openen dezelfde notitie-ID; datumconflicten worden geweigerd met behoud van de ingevoerde tekst. Een gearchiveerde dag blijft dezelfde datum reserveren en kan via de bestaande archiefhandeling worden hersteld. Verwijderde dagen blijven in de gewone prullenbak; een herstel dat een actieve dag zou dupliceren wordt geweigerd.

Het dagboek gebruikt normale notities met `journal: { version: 1, date: 'YYYY-MM-DD', mood: 'Goed' }`. Stemming mag leeg zijn. Alleen expliciete metadata maakt een notitie tot dagboek: namen zoals Persoonlijk of Dagboek doen dat niet. De bestaande autosave, revisions, tags, zoekfunctie, archief, prullenbak en back-ups worden hergebruikt. De versiesnapshot bewaart ook dagboekdatum/stemming. De opslaanknop blijft in de editorheader staan bij een korte viewport.

## Migratie en gegevensbehoud

`migrateHierarchy()` voegt metadata met `hierarchyVersion: 1` toe **binnen de bestaande beveiligde Leven-write**. De bewerking gebruikt de actuele Web Locks-guard en de bestaande rollback in de bridge. De guard bewaart de oorspronkelijke ruwe Leven-JSON als vorige-versie-herstelkopie. De migratie verwijdert niets en wijzigt geen historische bedragen, taken of Fitness-gegevens.

Bestaande notitie-IDs, collectie-IDs, categorieën, links, bijlagen, tags, recepten/ingrediënten, revisies en archiefstatus blijven behouden. De voormalige zes standaardverzamelingen blijven hun IDs houden, ook als ze leeg of hernoemd zijn. Onzekere inhoud wordt niet automatisch verplaatst. Bestaande verzamelingen zonder `parentId` blijven in het overzicht Bestaande verzamelingen. Nieuwe hoofdverzamelingen hebben `parentId: null`; subverzamelingen hebben een bestaande ouder-ID. `order` is een geheel getal binnen de ouder. Oude pictogram-ID's krijgen een veilige visuele fallback/alias; nieuwe keuzes worden gevalideerd.

De vaste nieuwe default-IDs zijn onafhankelijk van de namen. Herhaald openen of importeren van een reeds gemigreerde back-up voegt niets opnieuw toe en reset naam, volgorde of pictogram niet. Een onverwachte versie of botsing met een gereserveerde migratie-ID blokkeert de migratie; de bron blijft behouden. De oude `ensure()`-logica maakt bij notities met een geldige collectie-ID geen nieuwe categoriecollectie aan vanwege een verouderde categorienaam. Een geldige expliciete collectie-ID heeft voorrang op een legacy categorienaam, ook op het woord Inbox.

De JSON-domeinen, Life-versie en ZIP-manifestversie blijven ongewijzigd: **volledige ZIP versie 2**. Nieuwe metadata reist gewoon mee in dezelfde Life-JSON. Zowel nieuwe JSON-import als vorige-versie-herstel valideert de kennisgegevens vóór schrijven. Een oudere JSON zonder kennisgegevens blijft leesbaar. Oude JSON bevat zoals voorheen geen binaire bijlagen; voor documenten blijft volledige ZIP de juiste back-up.

## Opslagveiligheid

Nieuwe collectie-, volgorde-, verplaatsings-, archief- en dagboekbewerkingen gebruiken `MementoKnowledgeBridge.write()` en vervolgens de bestaande Web Locks-guard. Er is geen tweede directe localStorage-schrijfroute. De guard en IndexedDB-bestandsmodule zijn niet gewijzigd.

De UI meldt een geweigerde of mislukte schrijfactie niet als succes. Collectie-invoer en dagboektekst blijven in de open editor staan; rangschikken keert terug naar de opgeslagen volgorde. Concepten zijn bij een geweigerde opslag niet buiten de open app duurzaam opgeslagen: browserdata wissen of het proces afsluiten blijft een risico. De bestaande waarschuwing om actuele gegevens te herladen behoudt haar bevestiging voor verlies van onopgeslagen invoer.

## Tests

- Bestaande Kenniscentrumtests: 16 controles.
- Nieuwe kernregressies: 13 controles voor migratie, IDs, twee niveaus, namen, iconen, verplaatsen, rangschikken, datums, dagboekconflicten en JSON.
- Nieuwe veiligheidssuite: 5 groepen met bewaakte migratie/originele herstelkopie, alleen-lezen mutaties, oude JSON, ongeldige hiërarchie/dagboekmetadata en oude/nieuwe volledige ZIP v2 inclusief PDF-bytes, financiële gegevens, revisies, verplaatsingen, iconen en archief.
- Bestaande opslagveiligheid: 22 controles plus native Web Locks, bestaande Fitness-core (25), prullenbak en PIN-bosregressies.
- Echte Chromium-proeven op 360, 393, 412 en 1280 px: collectie-editor, hoofd-/subnavigatie, directe notitie in hoofdverzameling, iconen, verplaatsen, annuleren, dagboek, oude PDF openen/downloaden, archiveren/herstellen, touch/muisdrag, pijlbediening, ongeldige drop, opslagfouten, automatisch scrollen met veel kinderen, alleen-lezen conceptbehoud, ZIP-export/herstel en offline herladen.
- Dezelfde fictieve fixture wordt op de oude app en nieuwe app geladen. De zichtbare PIN-JPEG wordt byte voor byte vergeleken. Persoonlijke browsergegevens worden nergens gebruikt.

De ongewijzigde algemene suite stopt nog op de bekende directe aanroep van verwijderde legacy-views bij `tests/memento-regression.cjs:47`; de eerder vastgestelde oude checklistverwachting blijft eveneens ongewijzigd. De bestaande Fitness-browsertest bereikt de bekende ZIP-als-JSON-fout op regel 250. Deze falende controles zijn niet verwijderd of afgezwakt en blijven als afzonderlijke rode jobs zichtbaar. De nieuwe veiligheids- en browserjobs en de publicatieverificatie zijn afzonderlijk beoordeelbaar.

## Browseromgeving en grenzen

De lokale sandbox weigert een luisterende server en proxyverbinding. De daadwerkelijke browserproeven draaien daarom in Chromium op een geïsoleerde GitHub Actions-runner. Touch is met Chromium/CDP-touchgebeurtenissen getest, desktop met muis en lange druk. Dit is **geen fysieke Android-test**. Een viewport van 430 px hoog simuleert beperkte toetsenbordruimte; echte Android IME, TalkBack, native keuzemenu's en apparaatgebonden PWA-installatie zijn niet fysiek gecontroleerd. De PDF wordt nog steeds via de browserviewer geopend; ondersteuning verschilt per Android-browser, waarvoor Open origineel beschikbaar blijft.

De serviceworkercache is `memento-pwa-v28-20261027-kc2-v1`. Alleen de gewijzigde Knowledge-assets krijgen een nieuwe versie. De pixelart-bossen, weeranimaties, kerstthema, PIN-code, Fitness, Financiën en taken zijn behouden. Een oude offline installatie moet eenmaal online de nieuwe worker/assets ophalen; reeds geopende oude documenten blijven hun oude geladen code gebruiken tot herladen.

## Verifieerbare publicatie

De workflow `Knowledge 2 acceptance` draait de bovenstaande controles op de validatiebranch en main. De job `published-pages` draait uitsluitend op main en na geslaagde nieuwe kern-, browser- en bestaande opslagbrowserjobs. Zij haalt de publieke index, serviceworker en drie Knowledge-bestanden via HTTPS op en vergelijkt alle vijf SHA-256-hashes met de uitgecheckte commit. Alleen bij vijf exacte overeenkomsten verschijnt een geslaagde publicatieverificatie met `kc2-publication-evidence`. Een succesvolle commit of een Pages-build zonder deze controle is op zichzelf geen bewijs van de live code.

## Uitgevoerde controles en beelden

Alle nieuwe kern-/veiligheidscontroles en alle vier browserjobs zijn geslaagd op applicatiecode `8a0d148cc4c1deb3181dc8e3e9038462ecd66abf`. Per breedte zijn 12 controleclusters en 16 naschermen vastgelegd, zonder JavaScriptfouten of horizontale documentoverflow. De oorspronkelijke opslagbrowsertest en de bestaande Knowledge/PIN-workflow zijn eveneens geslaagd. De twee genoemde legacy-jobs blijven rood; de workflow als geheel krijgt daardoor een rode conclusie, terwijl de relevante nieuwe controles groen zijn.

[Validatierun](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/40450442051) · [Machineleesbaar bewijs](knowledge-v2-screenshots/evidence.json)

| Breedte | Startpagina | Levenspad | Collectie-editor | Dagboek, korte viewport | Dagboekdagen | Automatisch scrollen |
| --- | --- | --- | --- | --- | --- | --- |
| 360 px | [Beeld](knowledge-v2-screenshots/360/home.jpg) | [Beeld](knowledge-v2-screenshots/360/levenspad.jpg) | [Beeld](knowledge-v2-screenshots/360/collection-editor.jpg) | [Beeld](knowledge-v2-screenshots/360/journal-editor-short.jpg) | [Beeld](knowledge-v2-screenshots/360/journal-history.jpg) | [Beeld](knowledge-v2-screenshots/360/order-auto-scroll.jpg) |
| 393 px | [Beeld](knowledge-v2-screenshots/393/home.jpg) | [Beeld](knowledge-v2-screenshots/393/levenspad.jpg) | [Beeld](knowledge-v2-screenshots/393/collection-editor.jpg) | [Beeld](knowledge-v2-screenshots/393/journal-editor-short.jpg) | [Beeld](knowledge-v2-screenshots/393/journal-history.jpg) | [Beeld](knowledge-v2-screenshots/393/order-auto-scroll.jpg) |
| 412 px | [Beeld](knowledge-v2-screenshots/412/home.jpg) | [Beeld](knowledge-v2-screenshots/412/levenspad.jpg) | [Beeld](knowledge-v2-screenshots/412/collection-editor.jpg) | [Beeld](knowledge-v2-screenshots/412/journal-editor-short.jpg) | [Beeld](knowledge-v2-screenshots/412/journal-history.jpg) | [Beeld](knowledge-v2-screenshots/412/order-auto-scroll.jpg) |
| 1280 px | [Beeld](knowledge-v2-screenshots/1280/home.jpg) | [Beeld](knowledge-v2-screenshots/1280/levenspad.jpg) | [Beeld](knowledge-v2-screenshots/1280/collection-editor.jpg) | [Beeld](knowledge-v2-screenshots/1280/journal-editor-short.jpg) | [Beeld](knowledge-v2-screenshots/1280/journal-history.jpg) | [Beeld](knowledge-v2-screenshots/1280/order-auto-scroll.jpg) |

De volledige PNGs en overige schermen staan in de artifacts van de run. Het openen van de lokale PDF-blob en downloaden van PDF-bytes zijn gecontroleerd. Dit is geen bewijs dat de native PDF-viewer in headless Chromium of elke Android-browser pagina-inhoud tekent; die apparaatcontrole blijft expliciet open.

