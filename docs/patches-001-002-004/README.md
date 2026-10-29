# Memento — patches #001, #002 en #004

Datum: 29 oktober 2026. Basis: `8a3d9008f9698f4268d8b55ca45489f5a3de051c` op main. Uitsluitend deze drie patchpunten; #003 en #005 zijn niet uitgevoerd.

## Resultaat en gewijzigde bestanden

- `index.html`: achterstallige open taken staan standaard uitgeklapt onder **Nog te doen — eerder gepland**. De datum en relatieve achterstand blijven zichtbaar. Ook een taak met een focusmarkering voor vandaag blijft achterstallig zolang haar echte plandatum verstreken is. De telling scheidt gepland vandaag en achterstallig. Geen opslagmigratie of datumverschuiving bij weergeven.
- Dezelfde pagina: grote Dagboekknop uit datumkaart verwijderd, datumkaart compacter. Dagboek blijft bereikbaar via Notities → Levenspad → Dagboek. Ploegendiensttijd staat als capsule tussen Afspraken en + Afspraak. De bestaande dienstberekening, afspraakcheckbox, heropenen, Bewerk en Google-koppeling blijven behouden.
- Dezelfde pagina: dubbele weerkaart uit Mijn dag verwijderd. De bestaande gedeelde Open-Meteo-service en opslagkey blijven in gebruik. Een response moet ook bruikbare uurwaarden bevatten voordat die de cache vervangt. De actuele laad-/foutstatus is opvraagbaar door het openingsscherm, ook als de eerste netwerkrespons vóór het laden van dat scherm arriveert.
- `assets/memento-start.js`: gedeelde laad-/foutstatus, duidelijke melding bij mislukte verversing met het tijdstip van opgeslagen weer; juiste regenaanduiding voor WMO-buiencodes; één refreshsignaal naar de bestaande service.
- `assets/memento-ui.css`: compacte datumkaart, transparante donkergroene capsule met salieaccenten en afbreekbare afsprakenkop.
- `sw.js`: cache v52 en actuele versies van de gewijzigde assets voor de PWA.
- Twee aangetoonde applicatiefouten in `index.html` verholpen: de uitgestelde modalfocus kon tijdens snelle invoer focus overnemen; een nieuwe transactie koos bij een beperkte categorielijst een niet-bestaande standaardcategorie. Focus wordt meteen geplaatst; de standaardcategorie komt uit de aanwezige lijst. Bestaande transacties blijven ongewijzigd.
- `tests/helpers/enter-app.cjs` en de browsertests voor pictogrammen, notities, dagboek, collectiebeelden en visuele vergelijking: openen nu het dagportaal via Doorgaan en blijven compatibel met oudere PIN-snapshots. Ook herladen, tweede tab en back-upherstel doorlopen het openingsscherm.
- `tests/masterplan-browser.cjs` en `masterplan-journeys.cjs`: behouden de controles en volgen de huidige dashboardfilters en bestaande dagboeknavigatie. De gedeelde rekening gebruikt een kalendermaand; vóór de onafhankelijke-loonperiodecontrole wordt de persoonlijke loonperiode expliciet gekozen.
- `tests/helpers/knowledge-v2-browser-checks.cjs`: actuele openingsroute in tweede tab, na ZIP-herstel en offline herladen.
- `tests/pin-disabled-regression.cjs`: cachecontrole volgt de actuele scriptversie.
- `.github/workflows/knowledge-v2.yml` en `visual-review.yml`: handmatige PIN wordt met de beveiligingscontracttest en volledige dagportaal/PIN-browsertest gecontroleerd; oude automatische PIN-modus behoudt de beeldvergelijking.
- `.github/workflows/memento-dayportal.yml`: voert de nieuwe patches-browsertest uit.
- `tests/patches-001-002-004-browser.cjs` en `tests/fixtures/patch-weather.json`: reproduceerbare browsercontrole met geïsoleerde persoonsgegevens en een vastgelegde Open-Meteo-response.

## Oorzaken van de eerdere rode workflows

| Workflow op basiscommit | Vastgestelde oorzaak |
|---|---|
| Phase 1 storage safety | Nieuwe transactie met ontbrekende standaardcategorie kon niet opslaan; geen defect in Web Locks of IndexedDB |
| Memento masterplan acceptance | Vertraagde modalfocus verstoorde splitsingsinvoer; daarnaast verouderde dashboard- en dagboekstappen |
| Quick notes / Fitness | Test probeerde onzichtbare automatische PIN-invoer te vullen |
| Illustrated icons | Zelfde oude PIN-aanname, ook doorgaan nodig na offline herladen |
| Collection art | Oude PIN-aanname en openingsscherm na herladen |
| Journal acceptance | Oude PIN-aanname |
| Knowledge 2 | Opslagscenario hierboven en oude openingsroute bij tweede tab en ZIP-herstel |

De nieuwe CI-test wacht na herladen expliciet op de schrijfrechten en de zichtbare datumkaart voordat de dagtelling wordt gelezen; dit herstelt een timingfout zonder de assertion te versoepelen.

Geen tests uitgeschakeld en geen gegevensbehoud-, conflict-, herstel- of beveiligingsassertions verwijderd.

## Daadwerkelijke controles vóór publicatie

Chromium 153 via Playwright, in nieuwe geïsoleerde profielen; nooit de persoonlijke browseropslag.

- Nieuwe patchscenario's op 360, 393 en 412 px: meerdere lange achterstallige taken, focusmarkering, routine, uitsluiten afgerond/archief/prullenbak, originele datum/notities/teruglink, telling na herladen, afvinken, opnieuw plannen naar vandaag, invoeren en verwijderen. Een herhalende taak behoudt dezelfde ID en krijgt uitsluitend bij expliciet afronden haar bestaande volgende datum.
- Afspraken op die drie breedtes: meerdere lange titels, capsule, checkbox afvinken/heropenen, Bewerk bereikbaar. Bestaande gedeelde afspraak- en Google-logica is niet vervangen.
- Weer: huidige temperatuur, zes dag-uurwaarden, bronlink, expliciet verversen, fout met cache en fout zonder cache. Weeracties veranderen de Life-gegevens niet.
- `storage-safety-browser.cjs`: native tweedelige-tabconflicten, behoud concepten, quotafout en retry, IndexedDB, volledige ZIP-export/herstel met originele attachment-ID's en offline laden geslaagd.
- `memento-category-browser.cjs`: bestaande/nieuwe categorie, historische gegevens en splitsing op 360/393/412 geslaagd.
- `masterplan-browser.cjs`: volledige vijf fasen op 360/393/412 geslaagd, inclusief zoeken, notities, dagboekconcept/conflicten, gekoppelde taken, aankoopdossiers, ZIP, financiële centen, ploegendienst en fitness.
- `masterplan-journeys.cjs`: vijf concrete journeys vergeleken met immutable `52ac8c2`; echte oude-PWA-upgrade en behoud van bestaande data geslaagd.
- Dagportaal inclusief handmatige PIN instellen, verkeerde/juiste PIN, vergrendelen en herladen op 360/393/412 geslaagd.
- Fitness-browsertest geslaagd. Quick notes, dagboekopname, collectiebeelden en pictogrammen op 360/393/412 gecontroleerd; 66 pictogrammen op vier formaten, alle 23 categorieën, offline assets en ID-behoud.
- Knowledge 2: hiërarchie, lange teksten, slepen, alleen-lezen tweede tab, attachment, ZIP-herstel en offline laden op 360/393/412 gecontroleerd.
- Zestien Node-controles geslaagd: category-integrity, memento-regression, masterplan-core, storage-safety, storage-lock-native, service-worker-cache, knowledge-regression, knowledge-v2-core, knowledge-v2-safety, journal-upgrade-core, fitness-regression, trash-regression, pin-disabled-regression, illustrative-icons-core, knowledge-covers en pin-forest-regression.

## Online weer en testomgeving

De bestaande exacte Open-Meteo-URL gaf online actuele current-data en 72 hourly-waarden terug. Ook de browserflow is getest met twee live HTTP-aanvragen naar diezelfde URL (eerste ophaling en verversen). De rechtstreekse browsernetwerkverbinding in deze omgeving gaf `ERR_EMPTY_RESPONSE`; daarom is alleen voor deze live controle de browseraanvraag via curl naar dezelfde externe URL doorgestuurd. De productiecode gebruikt gewoon de bestaande fetch en heeft geen relay of tweede bron gekregen. De reproduceerbare regressietests simuleren daarnaast succes en netwerkuitval.

Een incidentele offline browsernavigatie overschreed bij gelijktijdige lokale tests de korte timeout; de herhaling slaagde. De Doorgaan-helper wacht nu op de zichtbare app in plaats van op een niet-bestaande navigatie van die knop. Geen fysieke Android-telefoon getest en geen live persoonlijke Google-accountverbinding gebruikt.

## Screenshots

Alle beelden zijn echte browserbeelden met duidelijk fictieve testtaken en -afspraken. Breedtes 360, 393 en 412 px.

| Breedte | Datum en achterstallige taken | Afspraken en dienstcapsule |
|---|---|---|
| 360 | [Mijn dag](day-360.png) | [Afspraken](appointments-360.png) |
| 393 | [Mijn dag](day-393.png) | [Afspraken](appointments-393.png) |
| 412 | [Mijn dag](day-412.png) | [Afspraken](appointments-412.png) |

## Publicatie

De uiteindelijke commit, GitHub Actions-status en controle van de live versie worden in de oplevering vermeld. Dit rapport behoort tot dezelfde implementatiecommit als de code en screenshots. De relevante workflows zijn te controleren via [GitHub Actions](https://github.com/jaribuijsman/Uitgavenkompas/actions).
