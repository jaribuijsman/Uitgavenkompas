# Memento gegevensveiligheid — fase 1

Scope: audit A01 (verouderde schrijvers), A02 (verwijdering op omschrijving) en de noodzakelijke afscherming van A12 (historische HTML). Uitgangscommit: `80585311d44adee3f0655a7ad697deb82e4f6338`.

## Schrijfprotocol

`assets/memento-storage-guard.js` vraagt via `navigator.locks.request` één exclusief, niet-wachtend slot aan: `memento-personal-data-writer-v1`. Het slot blijft bij het document. Daardoor kunnen bestaande synchrone formulieren hun echte boolean-resultaat behouden; er wordt niet een Promise als geslaagde write behandeld. Er is geen localStorage-lease, tijdslimiet, overname of vervalmechanisme. Een geschorst tabblad kan dus niet na een timeout alsnog onterecht gaan schrijven. De browser ruimt het native slot op bij het beëindigen van het document. `pagehide` geeft het ook expliciet vrij; een hervat document moet opnieuw laden.

Dit is bewust een tijdelijke **één-schrijftabbladmodus**, geen synchronisatie of automatische samenvoeging. Een tweede tabblad kan lezen en conceptinvoer bevatten, maar schrijven wordt geweigerd. Sluit het schrijftabblad en laad het andere opnieuw om daar verder te gaan. De herlaadknop waarschuwt dat nog niet opgeslagen formulierinvoer bij herladen verdwijnt; er wordt nooit automatisch op een conflict herladen.

Het document bewaart de exacte oorspronkelijke strings van `uitgavenkompas_v1` en `compass_life_preview_v1`. Elke commit controleert onder het nog gehouden native slot **beide** actuele persistente waarden tegen deze bronwaarden. Alleen succesvolle writes veranderen de verwachte bron. Een ander tabblad of oude schrijver die de opslag heeft gewijzigd, maakt het huidige document blijvend alleen-lezen tot een bewuste reload. Een `storage`-event of BroadcastChannel is geen onderdeel van de garantie.

Voor asynchrone import, back-up, bijlage-upload en definitief opruimen komt daar een documentintern operatietoken bij. Andere acties binnen hetzelfde document kunnen tijdens zo'n actie niet tussendoor schrijven. Het token blijft geldig over `await`, wordt in `finally` vrijgegeven en wordt door de bridges en bestandsopslag gecontroleerd. Dit vermijdt geneste aanvragen op hetzelfde Web Lock en daarmee een deadlock. Beëindiging van het hele document maakt het native slot alsnog vrij.

### Ondersteuning en ontbreken van een veilig slot

De geraadpleegde [MDN browser-compat-data voor LockManager](https://github.com/mdn/browser-compat-data/blob/main/api/LockManager.json) vermeldt ondersteuning vanaf Chrome/Chrome Android 69, Firefox 96 en Safari 15.4. De app vertrouwt op runtime-featuredetectie, een secure context en het daadwerkelijk verkrijgen van het slot. Een lokale HTML-origin, verouderde browser, geweigerde aanvraag of ontbrekende API krijgt geen onbeveiligde fallback: de hoofdopslag, herstel, purge en binaire writes worden geblokkeerd. HTTPS is de ondersteunde gebruikswijze; localhost wordt alleen voor geïsoleerde browsertests gebruikt.

### Writes over meerdere opslagkeys

localStorage heeft geen transactie over twee keys. Een gecoördineerde batch met meerdere keys legt daarom eerst `memento_storage_pending_v1` vast: een geversioneerde herstelset met de exacte `before`- en `after`-waarden. Als die voorafkopie door quota niet kan worden geschreven, verandert de batch geen hoofdgegevens.

Bij een gewone schrijffout worden alleen reeds geschreven waarden teruggezet, en alleen als ze nog gelijk zijn aan de eigen zojuist geschreven waarde. Een onbekende nieuwere waarde wordt niet als rollback overschreven. Bij mislukte rollback blijft de herstelset behouden en blokkeert de app verdere wijzigingen. Bij een herstart met een onafgeronde herstelset is de app eveneens alleen-lezen. De herstelset is als JSON te downloaden. Er wordt in deze fase **geen automatisch herstel van een onzekere gedeeltelijke toestand** uitgevoerd; beoordeel de herstelset en een externe ZIP voordat een aparte, gecontroleerde herstelactie wordt ontworpen. Dit is een bewust conservatieve noodstop, geen volwaardige databasejournal met automatische replay.

Na een succesvolle batch worden de bestaande één-versieherstelkopieën op de gewone manier bijgewerkt. Als dat niet lukt, blijft de oudere kopie staan en meldt de app dat. Definitief prullenbaklegen verwijdert die kopieën niet meer als neveneffect. Bijlagen die een huidige notitie of de behouden Leven-herstelkopie nodig heeft, worden eveneens behouden. Definitief uit de actieve toestand verwijderen is daardoor niet hetzelfde als alle herstelkopieën wissen; de bevestigingstekst noemt dat expliciet.

## Aangesloten paden

| Bestand/functies | Bescherming |
|---|---|
| `index.html`: financiële `save()` | Alle reguliere mutaties, CSV-/JSON-import, financiële vorige versie, instellingen en financiële verwijder-/herstelacties komen via dezelfde guarded commit. Fouten behouden formulierinvoer en rollen de domeintoestand terug. |
| `index.html`: Leven `save()` en `mutate()` | Taken, afspraken, boodschappen, wensen, notities en undo gebruiken dezelfde controle. Een geweigerde mutatie rendert de ingevulde UI niet onnodig opnieuw. |
| `MementoKnowledgeBridge.write`, `MementoFitnessBridge.replace` | De gewone writes gaan via Leven; asynchrone bestandsacties geven het eigen operatietoken door. |
| `MementoFinanceTrashBridge` | Geen directe setItem; vervanging controleert het slot en de bron. Na een gezamenlijke batch wordt de financiële geheugentoestand alleen overgenomen uit de gecommitte opslag. |
| `importCompleteBackup`, oude `importBackup`, `restorePreviousLife` | Vervangen kan niet buiten de guard om. ZIP/JSON blijven in hun bestaande formaat. Een volledige vervanging vereist beide domeinbronnen; bijlagen worden alleen door de eigenaar geschreven. |
| `performPermanentTrashPurge` | Het plan komt pas na de stale-controle tot stand. Beide domeinen en eventuele pending-bestandsmetadata worden als guarded batch geschreven. Binaire verwijdering controleert vóór iedere transactie het token en de actuele bron. |
| `memento-knowledge-store.js` | Elke readwrite-transactie controleert de guard vóór en na het asynchroon openen van IndexedDB. Alleen-lezen bestandsacties blijven mogelijk. |
| `memento-knowledge.js`: `attach()` | Houdt een operatietoken voor de bestandswrite en de bijbehorende notitiemetadata. |

Leescontroles, PIN, weer en algemene UI-voorkeuren zijn geen nieuwe persoonlijke gegevensdatabase. De beveiliging richt zich op de twee hoofdopslagdomeinen, de betrokken import-/herstelmetadata en kenniscentrumbestanden. Andere auditbevindingen zoals algemene XSS-, editor- en volledige schemavalidatieproblemen zijn geen onderdeel van deze fase.

## A02: laden verwijdert niets op omschrijving

De volledige tak die op `Beginsaldo roodstand` of `Saldo roodstand` selecteerde, de openingsbalans aanpaste en transacties wegschreef is verwijderd. `loadState()` schrijft niet meer naar de financiële opslag. Legitieme transacties, bedragen, IDs, rekeningen, openingsbalansen en bonverwijzingen blijven behouden, ook bij herhaald laden. Er worden geen verdwenen transacties uit eerdere herstelkopieën gereconstrueerd.

De bestaande niet-destructieve standaardwaarden voor oudere formaten blijven bestaan. Er is geen nieuwe domeinmigratie nodig of ingevoerd. Een eventuele toekomstige correctiemigratie moet een eigen schema-/migratie-ID, controle op aantoonbare herkomst, idempotente voortgang, referentievalidatie en een herstelbare ongewijzigde bronkopie krijgen. Een omschrijving of vermoeden is geen migratiebewijs. Historisch herstel vergt een afzonderlijk voorstel en afzonderlijke beoordeling van de bronbestanden.

## Historische entrypoints en PWA

De actuele repositoryboom bevat twee HTML-entrypoints: `index.html` en `uitgavenkompas-v20-pincode-vergrendeling-1.html`. De repositorymetadata meldt GitHub Pages, maar er is geen eigen publicatieworkflow of uitsluitingslijst in de bron. Bij het statisch serveren van de repositoryroot kan het historische pad dus bereikbaar zijn. De exacte actieve Pages-configuratie is niet via de beschikbare leestools vastgesteld; er is niets gedeployed om dit te testen.

Het historische bestand is vervangen door een kleine HTML-doorverwijzing, zonder JavaScript, localStorage of IndexedDB. De oude bron blijft bereikbaar in de Git-geschiedenis. Er zijn geen andere historische bestanden willekeurig verwijderd.

De serviceworker gebruikt `memento-pwa-v25-20261027-safety-v1`. De guard en de gewijzigde kenniscentrumscripts hebben corresponderende nieuwe queryversies in zowel `index.html` als CORE. De worker onderschept het historische pad vóór elke cache lookup en stuurt naar de huidige app. Daardoor kan een door **deze nieuwe worker** gecontroleerde navigatie niet alsnog een eerder gecachte uitvoerbare versie van dat bestand terugkrijgen. Deze logica is ook met een fictieve oude gecachte response en een offline fetch gecontroleerd.

**Bestaande al geopende oude documenten blijven een beperking.** JavaScript dat vóór de update is geladen, kan het nieuwe slotprotocol negeren. Het vervangen van bestanden, een cacheversie of `clients.claim()` trekt die code niet in. Er wordt niet automatisch genavigeerd of een oude conceptinvoer weggegooid. Sluit bij ingebruikname alle oude Memento-tabbladen en PWA-vensters, zorg online dat de nieuwe worker is geïnstalleerd en open de nieuwe versie opnieuw. Een apparaat dat offline nog uitsluitend de oude app/worker heeft, heeft de reparatie nog niet. Er is geen garantie tegen willekeurige oncoöperatieve code op dezelfde origin. De stale-controle ziet een reeds uitgevoerde externe write, maar kan een gelijktijdige schrijver die geen Web Lock gebruikt niet atomair uitsluiten.

## Tests en reproduceerbaarheid

Gebruik uitsluitend fictieve gegevens en een lege testorigin:

```sh
node tests/storage-safety.cjs
node tests/storage-lock-native.cjs
node tests/fitness-regression.cjs
node tests/knowledge-regression.cjs
node tests/trash-regression.cjs
node tests/memento-regression.cjs
# Met Playwright en Chromium:
node tests/storage-safety-browser.cjs
node tests/fitness-browser.cjs
```

De nieuwe veiligheidssuite bevat 22 controles: gelijktijdig verwerven van het slot; Financiën-, taken- en notitieconflicten; broncontrole bij een externe write; stale purge; quota en conceptbehoud; cross-key rollback; mislukte rollback en herstart; ontbrekende APIs; vrijgave bij pagehide; beide omschrijvingen met bestaande en nul-openingsbalans; JSON/ZIP-compatibiliteit; alle herstelroutes en bridges; een echt gepauzeerde asynchrone import; back-upexport; normale purge met behoud van herstelkopieën; guarded bestandswrites; historische entrypoints en een offline SW-doorverwijzing. De DOM/localStorage/IndexedDB-adapters hiervan zijn testdubbels. De afzonderlijke Node-test gebruikt echte Web Locks en beëindigt de eigenaarsworker om vrijgave te controleren (Node >=24.5).

De nieuwe browsertest gebruikt echte tabbladen op dezelfde geïsoleerde lokale origin, native Web Locks, IndexedDB, PIN/formeel invullen, een quota-injectie, ZIP-export/herstel en offline gedrag. De nieuwe workflow installeert exact Playwright 1.62.1 buiten de appbron. Dat voegt geen productiedienst of runtimeafhankelijkheid toe.

Lokaal gemeten: de 22 veiligheidscontroles, de native-locktest, 25 Fitness-kernchecks, 16 Kenniscentrum-/ZIP-checks en de prullenbaksuite slagen. De algemene Memento-suite stopt nog bij de bekende verouderde viewverwachting. Een aparte, uitsluitend in geheugen aangepaste foutverzamelaar bevestigt dezelfde **79 geslaagde / 2 falende** controles als op de auditcommit. De tweede bestaande fout verwacht oude checklistmarkup. Alleen de opslagfixture is aangepast om de werkelijke guard met een toegekend één-document-slot te gebruiken; geen bestaande controle is verwijderd, overgeslagen of afgezwakt.

De lokale browserrun is geblokkeerd door `listen EPERM` voor localhost; de eerdere Chromiumstart is eveneens door sandboxrechten geblokkeerd. De browserworkflow moet daarom apart worden beoordeeld. Een geslaagde Node-test is geen Android-browser- of echte IndexedDB-proef. De bestaande Fitness-browsertest is ongewijzigd; eventuele verouderde verwachtingen daarin worden niet stil overgeslagen.

## Overblijvende risico's en bewuste grenzen

- Nieuw en oud JSON en ZIP versie 2 blijven leesbaar; de domeinschema's en IDs zijn niet gemigreerd. Alleen een transient geversioneerde herstelkey en een native slotprotocol zijn toegevoegd.
- Slechts één tabblad kan wijzigen. Ook een achtergrondtabblad kan het slot nog houden. Dat is bewust veiliger dan een lease stelen van een mogelijk geschorste schrijver.
- Nog niet opgeslagen concepten blijven na een geweigerde actie zo veel mogelijk in hun huidige formulier staan. Een expliciete reload/afsluiting kan die invoer verliezen; er is geen nieuw duurzaam conceptarchief gebouwd.
- Een onoplosbare rollback of onderbroken cross-key batch blokkeert wijzigingen en bewaart de ruwe herstelset. Automatische replay en een volledige migratie naar IndexedDB vallen buiten deze fase.
- Cross-key herstelsets vragen extra tijdelijke opslag. Bij onvoldoende ruimte wordt de actie geweigerd vóór een hoofdwaarde wijzigt. Dit is geen garantie dat iedere grote back-up op ieder Android-apparaat kan worden hersteld.
- Lokale herstelkopieën worden bij purge behouden, inclusief hun benodigde bijlagen. Dat kan ruimte blijven innemen en maakt oude verwijderde inhoud herstelbaar. Een latere expliciete beheerfunctie voor zulke kopieën vergt afzonderlijke scope.
- De overige auditbevindingen zijn niet als geheel opgelost. Deze wijziging is geen algemene securityfix, encryptie, synchronisatie, appverpakking of CSS-refactor.
- De PR is ter beoordeling. Niet mergen of publiceren zonder expliciete toestemming van de eigenaar.
