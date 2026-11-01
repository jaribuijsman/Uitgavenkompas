# Kenniscentrum — Visueel workspace V2

Baseline: `02ab97a952926e56f86764e9f5ae1f9ac4a09c10`. De productspecificatie staat in SPEC.md. De recentste gebruikersbesluiten gaan voor:

- Navigatie: **Overzicht / Mappen / Notities**; onderwerpen per vier, rechts swipen voor de volgende pagina.
- Recent en Vastgezet zijn compacte, standaard ingeklapte rijen. Geen dominante Belangrijk-kaart.
- Mappenboom klapt per map open en onthoudt de stand.
- Eigen afbeeldingen voor kaartcovers, achtergrond van Overzicht en afbeeldingwidgets.
- Externe AI volgt later. Er is geen externe AI-service of API-sleutel toegevoegd. Bestaande handmatige ChatGPT-hulpmiddelen blijven bestaan.

## Acceptatiecontract en code-eigenaren

| Criterium | Implementatie | Controle |
|---|---|---|
| 1. Bestaande gegevens/IDs blijven, automatische V2-activatie heeft vooraf herstelbare staat | knowledge.js activateWorkspace; bestaande StorageGuard/KnowledgeStore | workspace-core, storage-safety, recovery-upgrade-browser |
| 2. Drie mapniveaus, meervoudige koppelingen, unieke zoekhit, veilige verwijdering | knowledge-core.js en knowledge-workspace.js | workspace-core; workspace-browser |
| 3. Mappen eerst, inklappen, swipe per vier, compact Recent/Vastgezet | knowledge.js en knowledge.css | workspace-browser met echte app, geen standalone prototype |
| 4. Eén visuele editor, veilige oude bron, tekstversies en fouten/conflicten zichtbaar | knowledge.js; declaratieve documentblokken in knowledge-core.js | workspace-core, workspace-browser, bestaande journal-/recipe-/storage-tests |
| 5. Sjablonen importeren, eigen sjablonen, per map standaard, velden alleen expliciet toevoegen | workspace module + templates.json | workspace-core; bestaande notities blijven ongewijzigd |
| 6. Widgets met afgebakende bron, toestemming intrekken, volgorde/formaat/desktoppositie | projectWidget + workspace UI; bestaande SortableJS | workspace-core; workspace-browser |
| 7. Alle eigen afbeeldingen en bijlagen blijven bruikbaar in volledige en aparte back-ups | backup.js fileReferences; knowledge-backup.js; Trash-referentiecontrole | workspace-core, knowledge-regression, trash-regression |
| 8. Offline assets en veilige upgrades | index.html, sw.js; geen wijziging worker-fetchlogica | service-worker-cache, centrale browsergroepen en upgrade-gate |

## Opslag- en herstelgrens

De bestaande Leven-JSON blijft de metadata-eigenaar. `knowledge.workspace.version=2` is een additieve uitbreiding; geen tweede metadata-database of parallelle editorstaat. De bestaande StorageGuard verzorgt exclusieve schrijfacties en rollback. Bijlagen blijven in de bestaande IndexedDB. Voor activatie worden bestaande bestandsverwijzingen gecontroleerd en wordt een onafhankelijke IndexedDB-snapshot met de oorspronkelijke metadata én benodigde binaire bestanden gemaakt (`kc-workspace-before-v2`). Onvoldoende ruimte of een ontbrekend bestand verhindert activatie; de oude bron blijft intact. Bestanden worden pas geschreven vóórdat de metadata ernaar verwijst; bij afgewezen metadatawrites worden nieuw toegevoegde bestanden opgeruimd. Externe kopieën blijven nodig.

De afzonderlijke export (`memento-knowledge`, versie 1) bevat uitsluitend notes + knowledge en benodigde binaire bestanden. Herstel controleert eerst schema, hashes en bestaande bestands-ID's; maakt daarna een herstelarchief (`kc-before-restore-v2`) en vervangt alleen notes + knowledge via de bestaande guarded bridge. Andere Leven-velden en Financiën worden niet vervangen. Bestaande bronrechten buiten Kenniscentrum worden bij afzonderlijk herstel ingetrokken.

De optionele `.mkc`-envelop gebruikt WebCrypto AES-256-GCM met een willekeurige 96-bit IV, 128-bit authenticatietag en PBKDF2-HMAC-SHA-256 (600.000 iteraties, willekeurig 128-bit salt). De volledige vaste header is authenticated additional data. Onbekende parameters en beschadigde inhoud worden geweigerd. Geen wachtwoordherstel. Het bestaande volledige Memento-ZIP-formaat blijft versie 2 en krijgt ook de nieuwe beeldreferenties.

Bronnen: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey en https://www.w3.org/TR/webcrypto/#aes-gcm.

## Sjablonen door ChatGPT laten ontwerpen

Meegeleverde sjablonen staan in `assets/memento-knowledge-templates.json` en worden offline gecachet. Voeg daar een `memento-template` object toe; de knop **Meegeleverde sjablonen ophalen** gebruikt dezelfde validatie als bestandsimport. Bestaande exemplaren worden niet herschreven. Voor een privé-sjabloon: laat ChatGPT één JSON-bestand genereren en importeer dat in Memento; gevoelige inhoud hoeft niet naar GitHub.

Formaat voor een enkel bestand:

```json
{"format":"memento-template","version":1,"template":{"name":"Weekreflectie","kind":"note","fields":[{"key":"week","label":"Week","type":"text"}],"document":{"version":1,"blocks":[{"id":"heading","type":"heading","text":"Wat wil ik onthouden?"},{"id":"body","type":"text","text":""}]}}}
```

Toegestane importblokken zijn tekst, kop, citaat en checklist; markeringen `bold`/`italic`. Geen uitvoerbare HTML/JS, externe URLs of apparaatgebonden bijlagen in sjabloonbestanden. Bij import kan de gebruiker bewust een bestaand sjabloon bijwerken; nieuwe velden worden afzonderlijk en met behoud van ingevulde waarden toegevoegd. Afbeeldingen voeg je lokaal aan notities of de interface toe.

## Grenzen en bewijs

De Markdown-preview bewaart de oorspronkelijke tekens letterlijk; zij claimt geen verliesvrije semantische Markdown-conversie. De oorspronkelijke editor blijft bereikbaar. PDF gebruikt de bestaande interne browserviewer met download/open-origineel terugval. Geen PDF-OCR, sync of accountbackend.

De lokale Work-preview wordt via HTTP aangeboden en mist een veilig Web Lock; zij kan geen schrijfflows bewijzen. De beveiliging blijft intact. Daarom moeten de centrale CI-browser- en upgradetests op het exacte PR-head slagen voordat vrijgave kan worden overwogen. Fysieke Samsung A54/PWA, TalkBack en werkelijk schermtoetsenbord: niet getest door browseremulatie.

Reviewbevindingen, werkelijk uitgevoerde checks en resterende afwijkingen horen bij de PR; een groene kernsuite alleen is geen releasebewijs.
