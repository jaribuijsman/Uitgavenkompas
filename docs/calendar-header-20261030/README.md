# Mijn dag — Google Agenda in de afsprakenheader

De verbindingsactie stond als tekstlink onder de afgeronde afspraken. Zij staat nu als Google Agenda-pictogram direct na de diensttijd en vóór `+ Afspraak` in de header van Vandaag. Het pictogram blijft beschikbaar na verbinden; het label is `Google-agenda verbinden` of `Google-agenda opnieuw verbinden`. De oude link is verwijderd.

Uitgangspunt: actuele `origin/main` op 30 oktober 2026, `667577354f980232df195dd135cf4639b7811ad4`. Herstelpunt: dezelfde onveranderlijke commit en lokale tag `checkpoint/google-calendar-header-20261030`. Branch: `fix/memento-google-calendar-header`; [PR #9](https://github.com/jaribuijsman/Uitgavenkompas/pull/9). De eerste implementatie was `fb9163e9fab4eb4e9b73246e93335ec7cf39dcfb`; de definitieve PR-head bevat de hieronder beschreven correctie voor bredere platformfonts, nieuwe captures en opnieuw uitgevoerde controles. De exacte head-/merge-SHA, uiteindelijke CI en publicatienacontrole staan bij de PR.

## Ontwerp en scope

Bronnen: actuele `AGENTS.md`, `LEESMIJ.txt`, de bestaande UI-/glass-/layout-eigenaren en de Memento Mobile Quality Gate. De concrete indeling uit de gebruikersopdracht vormt het ontwerpcontract; er was geen losse ontwerpafbeelding meegeleverd.

- Een 24px meerkleurig Google Agenda-icoon binnen een knop van exact 44 × 44 CSS-px, donker bosgroen glasmateriaal en afgeronde hoeken. Geen live achtergrondvervaging.
- Diensttijd → Google Agenda → `+ Afspraak`, zonder overlap of regelafbreking bij 360/393/412/1280 px. De header blijft 44 px hoog. Geen extra kaart of microtekst.
- Duidelijke toegankelijke naam, tooltip, zichtbare toetsenbordfocus en native knopbediening. Alleen de header van Vandaag krijgt de verbindingsknop; toekomstige dagen behouden hun bestaande afspraakactie.
- `paintTodayAppointments()` gebruikt dezelfde `data-memento-gcal-connect`-handler en `MementoGoogleCalendar.connect()`. Geen tweede OAuth-clientimplementatie, opslagkey, schemawijziging, migratie of reset.
- Bedieningsgeometrie in `memento-ui.css`; materiaal in `memento-glass.css`. Geen nieuwe observer of `!important`-override. Beide asset-URLs zijn gelijk bijgewerkt in `index.html` en `sw.js` CORE; cache `memento-pwa-v75-20261030-calendar-header-v2`.
- Afspraken, taken, navigatie, financiële berekeningen, PIN, bijlagen en oorspronkelijke artwork vallen buiten de functionele wijziging. Alleen fictieve fixtures in nieuwe browsercontexten gebruikt.

## Werkelijk uitgevoerde verificatie

Playwright 1.62.1 met de bijbehorende Chromium-renderer; tooling buiten de productiebron in `/tmp/memento-browser`. Alle lokale commando's gebruiken `NODE_PATH=/tmp/memento-browser/node_modules`.

| Controle | Uitkomst | Bewijs |
| --- | --- | --- |
| Alle 19 core-commando's uit `app-review.yml` | PASS | [core.log](evidence/core.log) |
| Volledige browsermatrix, inclusief nieuwe `calendar-header-browser.cjs` | PASS, alle 20 suites | [uitkomsten](evidence/test-results.json), [runner](evidence/runner.log) |
| `visual-browser.cjs` met `tests/helpers/visual-fixture.cjs` | PASS op 360/393/412/1280 | `evidence/visual-*.json` |
| `recovery-browser.cjs` | PASS, 0/1/43 taken, lange titel, menu, filters/presets, completeren/heropenen, naastliggende tabs | [uitkomsten](evidence/test-results.json) |
| `release-acceptance-browser.cjs` | PASS, 108 schermtoestanden, onder meer axe, invoer, navigatie en opslag | [rapport](evidence/release-acceptance.json) |
| `glass-rendering-browser.cjs` | PASS, alle 18 hoofdschermen op vier breedtes | [rapport](evidence/glass-rendering.json) |
| Bestaande PWA-upgrades vanaf oorspronkelijke versie, herstelversie en v71 | PASS, worker-overname, offline herladen, exacte Life/Finance/PIN en binaire bijlagen | `evidence/*upgrade.json` |
| Extra echte v74 → v75-upgrade vanaf de actuele main | PASS, oude cache opgeruimd, nieuwe assets offline, Life/Finance/PIN bytegelijk en bijlagehash behouden | [rapport](evidence/current-main-upgrade.json) |
| Gerichte Google Agenda-interactie | PASS: klik en Enter bereiken bestaande OAuth-handler; gesimuleerde OAuth-callback/API-afspraak verschijnt via bestaande synchronisatie; lokale afspraken/taken/notities/fitness/instellingen en Finance/PIN blijven gelijk | [log](evidence/calendar-header-browser.log) |
| Header, afgeronde afspraken en afspraak toevoegen | PASS, oude link afwezig, uitklapper en bestaande dialoog bereikbaar; opnieuw renderen na sync behoudt pictogram | [log](evidence/calendar-header-browser.log) |
| Kleinere schermhoogte, grotere basistekst, reduced motion | PASS, geen horizontale overflow; gemeten in gerichte test | [testbron](../../tests/calendar-header-browser.cjs) |

Alle 28 lokale testgroepen zijn geslaagd (19 core-invocations, 23 browser-invocations inclusief vier visual-breedtes, vier upgrade-invocations). Ook `git diff --check` is uitgevoerd. De oude door bestaande tests overschreven screenshots onder `docs/patches-001-002-004` zijn hersteld; dit rapport bewaart nieuwe bewijsartefacten in een eigen map.

De eerste CI-run op `e3b50b1` blokkeerde terecht op de nieuwe headerassertie: de bredere systeemfont van Ubuntu 26 brak bij 360 px de toevoegknop af naar een tweede regel. Het [screenshot en meetrapport](evidence/ci-font-failure/) zijn behouden. Hersteld door alleen binnen de header met de Google-knop tracking, kolomafstand en horizontale badge-/knoppadding compacter te maken. De diensttijd blijft 12 px en de knop 44 × 44 px. Toekomstige headers behouden hun oorspronkelijke afstand. De oorspronkelijke veiligheidsasserties blijven intact; een extra assertie vereist nu bovendien een headerhoogte van 44 px. Een afzonderlijke run met `DejaVu Sans, sans-serif` slaagt op alle vier breedtes ([rapport](evidence/fallback-font.json), [360 px](evidence/360-fallback-font.png)).

Tijdens de volledige lokale herhaling traden twee timeouts op: bij het sluiten van het bestaande taakmenu in visual-393 en bij offline herladen in de extra main-upgrade. Beide volledige suites slaagden bij afzonderlijke herhaling, zonder bron- of assertiewijziging. De mislukte pogingen en geslaagde herhalingen blijven expliciet in [test-results.json](evidence/test-results.json) en de bijbehorende logs staan. Alle overige groepen, waaronder de volledige 108-toestanden-acceptatie en de drie overige upgrades, slaagden direct.

## Werkelijke voor/na-weergave

Beide fasen gebruiken dezelfde fictieve fixture, vaste datum 30 oktober 2026 (middagdienst 14:00–22:00), viewport, taal, tijdzone en renderer. De vóórfase rendert de onveranderlijke main-snapshot; de nafase de gewijzigde productiecode. Screenshots en geometrie zijn bekeken. Het exacte aanraakvlak is 44 × 44 px op alle vier breedtes; de duty-badge, verbindingsknop en toevoegknop overlappen niet. De eerste taak onder afspraken begint 48 px hoger door het verwijderen van de oude link, terwijl de headerhoogte gelijk blijft.

| Breedte | Vóór | Na | Header / knop |
| --- | --- | --- | --- |
| 360 | [afspraken](evidence/before/360-appointments.png), [hele pagina](evidence/before/360-day.png) | [afspraken](evidence/after/360-appointments.png), [hele pagina](evidence/after/360-day.png) | 44 px / 44 × 44 px |
| 393 | [afspraken](evidence/before/393-appointments.png), [hele pagina](evidence/before/393-day.png) | [afspraken](evidence/after/393-appointments.png), [hele pagina](evidence/after/393-day.png) | 44 px / 44 × 44 px |
| 412 | [afspraken](evidence/before/412-appointments.png), [hele pagina](evidence/before/412-day.png) | [afspraken](evidence/after/412-appointments.png), [hele pagina](evidence/after/412-day.png) | 44 px / 44 × 44 px |
| 1280 | [afspraken](evidence/before/1280-appointments.png) | [afspraken](evidence/after/1280-appointments.png) | 44 px / 44 × 44 px |

DOM-metingen: [vóór](evidence/before/report.json), [na](evidence/after/report.json). Ook de volledige bestaande visual-suite is met dezelfde fixture op de main-snapshot gerenderd. De hoofdinhoud van Taken, Agenda en de financiële hoofdpagina toont op alle breedtes geen gewijzigde indeling. De [beeldvergelijking](evidence/visual-comparison.json) is grotendeels pixelgelijk, met kleine raster-/transitieverschillen in bestaande navigatie- en brandingvlakken; deze beelden zijn bekeken. Mijn dag verandert volgens bovenstaand contract.

## Vrijgave en grenzen

De gebruiker heeft implementatie, PR en merge naar main na alle verplichte controles expliciet geautoriseerd. Lokale functionele, visuele en offline controles zijn geslaagd. Merge vindt uitsluitend plaats na geslaagde GitHub-controles en een nieuwe controle van `origin/main`; de werkelijk gedeployde site en cache worden daarna afzonderlijk gecontroleerd en bij de PR gerapporteerd.

Dit zijn browseremulaties, geen fysieke Android-, Samsung-toetsenbord-, TalkBack- of PWA-installatietests. Google OAuth en de Calendar API zijn in de gerichte test gesimuleerd; er is geen echt Google-account aangemeld. Geen functionele of visuele afwijkingen binnen de gevraagde wijziging openstaand.

Terugval: revert via een aparte PR, met opnieuw verhoogde cache-/assetversies en herhaalde opslag-/offlinecontroles. Nooit gebruikersopslag wissen.
