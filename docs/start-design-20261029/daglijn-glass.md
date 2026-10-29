# Daglijn · Nieuw Glas · Lichtinval

Basis: GitHub `main` op `26b90c87f52d3f39a098efc82e546e3e07f25d02` (29 oktober 2026).

## Behoefte en wijziging

Het vorige startscherm gebruikte twee hoge illustratiekaarten en kon op een telefoon verticale scroll vereisen. De gekozen Daglijn toont vier compacte regels: afspraak vandaag, open/achterstallige taak, afspraak morgen en een volgende taak. Aantallen staan boven de regels. De bestaande goudkleurige branding, bosillustraties, handmatige PIN en weersbron blijven behouden.

De glasvulling is halftransparant. De daglijn heeft een glaslaag met een subtiele extra tint per regel voor contrast. Lichtinval is een korte reflectie bij het openen; tekst blijft op zijn plaats en de animatie stopt vanzelf. `prefers-reduced-motion` schakelt deze beweging uit. Bij onvoldoende hoogte of grotere tekst blijft de inhoud bereikbaar via een scrollbare shell, in plaats van onder Doorgaan af te snijden.

De bestaande uurverwachting van vandaag blijft compleet: zes tijdstippen van 06:00 t/m 21:00 passen naast elkaar. Regenpercentages zijn compact weergegeven; de toegankelijke namen bevatten de betekenis. De bestaande cache, verversknop, bronlink en foutafhandeling worden hergebruikt.

## Analyse van de bestaande invoerpaden

| Snelfunctie | Bestaande route | Behouden onderdelen |
|---|---|---|
| Taak | Leven → Taken → `lifeAdd` → `editTask()` | Omschrijving, soort/routine, categorie, optionele plandatum, herhaling en aangepast interval, ruimte, prioriteit, notitie, kleine stappen en bestaande dicteerknoppen |
| Snelle notitie | Leven → Notities → bestaande `kc-quick-text` Inbox-invoer | Bestaand concept, inspreken, expliciet bewaren en Uitwerken naar de volledige notitie-editor |
| Transactie | Financiën → `addTransactionTop` → `transactionModal()` | Uitgave, inkomst, terugbetaling, overboeking, omschrijving, bedrag, datum, tegenpartij, categorie, subcategorie, rekening/bestemming, Uitgever/toewijzing (`txPerson`), betaalmethode, notitie en categorie-splitsing |

Er zijn geen alternatieve invoerformulieren, nieuwe gegevensopslag of migraties toegevoegd. De startmodule schrijft geen Life- of financiële records. Alleen de bestaande editors verwerken bevestigde invoer via hun bestaande opslagbewaking. Navigatie die door een open concept wordt tegengehouden, wordt niet omzeild. De PIN-controle vindt ook voor iedere snelactie plaats.

## Gewijzigde code

- `assets/memento-start.js`: daglijnpresentatie, originele plandatum naast achterstalligheidsstatus, bestaande editorroutes en kortdurende Lichtinval.
- `assets/memento-start.css`: vervangt de oude kaartindeling door responsieve glaslagen; geen stapeling van oude overrides.
- `index.html`: uitsluitend de versieparameters van beide startbestanden.
- `sw.js`: cache v64 en dezelfde twee nieuwe assetversies; cache-isolatie en herstelgedrag blijven intact.
- `tests/memento-start-browser.cjs`: acceptatie van vier daglijnregels, originele achterstallige datum en alle drie echte invoerpaden; behoudt weer-/PIN-controles.

## Uitgevoerde controles vóór publicatie

- JavaScript-syntaxis en `git diff --check`: geslaagd.
- `node tests/pin-disabled-regression.cjs`: geslaagd, inclusief alle negen uitvoerbare inline scripts en huidige precache-URL's.
- `node tests/service-worker-cache.cjs`: geslaagd; oude caches kunnen de actuele offline fallback niet vervangen.
- `node tests/storage-safety.cjs`: alle 22 controles geslaagd.
- `node tests/memento-regression.cjs`: alle 84 controles geslaagd.
- `node tests/memento-category-integrity.cjs`: alle 13 controles geslaagd.
- `node tests/dictation-regression.cjs`: geslaagd.

Echte browsercontrole op een lokale preview, met uitsluitend fictieve gegevens:

| CSS-viewport | Shellhoogte / scrollhoogte | Horizontale overflow | Alle vier regels boven footer |
|---|---|---|---|
| 360 × 700 | 630 / 630 | Nee | Ja |
| 393 × 772 | 694 / 694 | Nee | Ja |
| 412 × 760 | 682 / 682 | Nee | Ja |

Alle drie snelfuncties openen hun bestaande invoerroute. Subcategorie, toewijzing, betaalmethode en splitsing zijn in het echte transactievenster gecontroleerd. Een geblokkeerde opslag houdt omschrijving, bedrag, subcategorie en persoon in het formulier vast. De oorspronkelijke fictieve taken bleven gelijk; geen transactie, taak of notitie werd door alleen openen/annuleren toegevoegd.

De lokale HTTP-preview biedt geen native veilig schrijfslot en de bestaande bewaking houdt deze terecht alleen-lezen. Er is geen beveiliging uitgeschakeld om succesvol opslaan te simuleren. Succesvolle opslag/rollback is in de bestaande Node-regressies gecontroleerd; de bijgewerkte Chromium-acceptatietest wordt door GitHub Actions op localhost uitgevoerd na de push. De daadwerkelijke workflow- en Pages-resultaten moeten daarom apart na publicatie worden bekeken.

## Praktische grens

De Samsung Galaxy A54 5G heeft een fysiek scherm van 1080 × 2340 pixels, maar browserindeling gebruikt CSS-pixels en de beschikbare hoogte verandert door browserbalken en weergave-instellingen. Daarom is geen vaste A54-pixelbreedte afgedwongen. Het fysieke toestel, Samsung Internet, een geopend Android-toetsenbord en sterk vergrote systeemtekst zijn niet op het toestel getest.

Bronnen: [Samsung-specificatie](https://image-us.samsung.com/SamsungUS/samsungbusiness/pdf/spec-sheets/HHP-A545G-DATA-GENERIC-MAR23-FINAL-V1.1.pdf), [MDN devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio), [MDN viewport](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport).
