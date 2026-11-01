# Taken v4 — implementatie en bewijs

Basis: main `11a70931c13ae36ec89628e7a6794fadf5c000cd`, opnieuw gecontroleerd
op 1 november 2026. Branch: `feat/memento-taken-v4`. Niveau 3. Geen merge of
publicatie; de centrale PR-gate bepaalt de uiteindelijke CI-status.

## Uitbreiding

De bestaande Taken-editor, filters, bibliotheek, taakmenu's, Sortable-adapter en
herhaalroutine zijn uitgebreid. Taken staan per bestaande categorie; sorteren
werkt binnen de groepen. `renderToday` is ongewijzigd. De gedeelde takenrij toont
de optionele schatting alleen buiten Mijn dag.

`planning` bevat optionele gehele minuten (1–1440, null/ontbrekend is onbekend).
`timing` bevat een huidige uitvoerings-ID, afzonderlijke bevestigde metingen en
hoogstens één onbevestigde sessie. Alle gegevens blijven binnen dezelfde Life-key
en bestaande guarded commitroute, zonder rootmigratie of nieuwe externe API.
Na succesvolle afronding rouleert een aanwezige uitvoerings-ID; bestaande
geschiedenis wordt niet achteraf aangevuld. Undo herstelt de vorige uitvoering.
Bibliotheek en duplicaten krijgen alleen de standaardduur, geen timinghistorie.

De timer gebruikt monotone tijd en schrijft bij gebruikersacties en
lifecycle-checkpoints. Een geheugenheartbeat herkent onderbrekingen en
klokverschillen, zonder opslag per seconde. Achtergrond, sluiten, vergrendeling,
herstart of een onverklaarde tijdsprong vragen controle; een onzekere tijdspanne
wordt niet bijgeteld. Bevestigde metingen worden afzonderlijk bewaard. Alleen
expliciete toestemming vult de schatting in het concept; Opslaan bewaart die.
Een onopgeloste meting moet eerst bevestigd of verworpen worden voordat de taak
kan worden afgerond, gearchiveerd of verwijderd.

## Lokaal uitgevoerd

| Controle | Uitkomst |
| --- | --- |
| Syntax gewijzigde JS, `git diff --check` | Geslaagd |
| `node tests/memento-regression.cjs` | 87 regressies geslaagd |
| `node tests/taken-v4-core.cjs` | Metadata, negatieve validatie, bibliotheek, klokonderbreking, rollback en ongewijzigde Mijn dag geslaagd |
| `node tests/storage-safety.cjs` | 22 veiligheidscontroles geslaagd |
| `node tests/storage-lock-native.cjs` | Exclusieve native opslaglock geslaagd |
| `node tests/ci-plan-regression.cjs` | 28 plannercontroles geslaagd |
| `node tests/service-worker-cache.cjs` | Cache-/offlinecontract geslaagd |
| `node tests/sortable-visibility-browser.cjs` | Werkelijke Chromium-touch, volgordeopslag en aangrenzende Leven-bediening geslaagd |
| `node tests/taken-v4-browser.cjs` | Nieuwe editorroute, categorieën, zoeken, dubbele stapteksten/status, schatting instellen/wissen, timer pauze/hervat/stop, meerdere sessies, toestemming weigeren, freeze/herstart, quotafout/retry, JSON-herstel/ongeldige import, ZIP inclusief binaire bijlage, vierdaagse herhaling, undo en duplicaat geslaagd |

Browsercommando's gebruikten `NODE_PATH=/workspace/memento-tooling/node_modules`;
Playwright staat buiten de productierepository. Alle fixtures staan uitsluitend
in tijdelijke lokale Chromium-profielen. Er zijn geen productiegegevens gelezen
of geschreven en geen fictieve schattingen aan bestaande productiegegevens
toegevoegd.

## Visueel bewijs

Echte Chromium-render op 360/393/412/1280 × 852, plus 480px schermhoogte met
gefocust duurveld. Geen horizontale documentoverflow; taakmenu en editoracties
binnen de viewport; het actieve invoerveld blijft geheel boven de acties.
Nieuwe stapbediening heeft minimaal 44px tikdoelen. Gecontroleerd met 0, 1 en
43 taken en lange tekst. Reduced motion en touch zijn ingesteld.

Voor/na met dezelfde geïsoleerde fixture is opgeslagen in
`/tmp/memento-taken-v4/{before,after}`, inclusief screenshots en `geometry.json`.
De eerste taak begint bij 393px op y=444 vóór en y=475 na groepering: de
categorieheading voegt circa 31px toe; de eerste taak blijft volledig zichtbaar.
Screenshots van lijst, menu, editor en timercontrole zijn visueel bekeken.
CI bewaart nieuwe screenshots als artifact `memento-taken-v4-life-full`.

De niveau-3-PR-controle voert de zes bestaande browsergroepen, alle toepasselijke
coreveiligheidschecks en de echte offline upgrade van voorgaande main uit.
De upgradefixture controleert nu ook schatting, bevestigde meting en een
onbevestigde sessie, naast ongewijzigde Life/financiële/PIN-data en binaire bijlagen.
Deze CI wordt niet handmatig met een tweede volledige matrix gedupliceerd.

## Afwijkingen en grenzen

- Het genoemde interactieve HTML-prototype was niet bijgevoegd; exacte visuele
  overeenkomst daarmee is niet geverifieerd. De bestaande Memento-stijl is behouden.
- Controle van de meting staat in de bestaande editor; de expliciete keuze voor
  de schatting gebruikt de bestaande browserbevestiging. Geen tweede taakeditor.
- Duur wordt numeriek ingevoerd; er zijn geen nieuwe snelle-minutenknoppen.
- Stappen gebruiken omhoog/omlaag en de bestaande tekstinvoer. Er is geen slimme
  adviesheuristiek toegevoegd; voorstellen waren optioneel en mogen nooit stil
  worden toegepast.
- Een nieuwe taak wordt eerst normaal opgeslagen voordat meten beschikbaar is,
  zodat metingen altijd aan een bestaande stabiele taak-ID gekoppeld zijn.
- Chromium-emulatie bewijst geen fysieke Samsung Galaxy A54-, TalkBack- of echte
  Android-process-kill-test. Die tests zijn niet uitgevoerd. De werkelijke
  Android/PWA-lifecycle blijft een gerichte handmatige nacontrole vóór eventuele
  latere publicatie.

Rollback: deze PR niet mergen of de branchcommit terugdraaien. Een terugkeer naar
de huidige main leest aanvullende velden als onbekende metadata; er is geen
opslagkey of rootversie veranderd. Bewaar vóór een latere release een ZIP-back-up.
