# Memento — efficiënte, risicogestuurde ontwikkeling

Geldt voor Codex, ChatGPT Work en andere agents in deze repository. De recentste gebruikersopdracht en hogere instructies gaan voor. De gebruiker heeft gevraagd om opdrachten zoveel mogelijk **in één uitvoering volledig af te handelen**; vraag niet opnieuw om reeds verstrekte toestemming en stop niet na alleen een plan.

## Werkstroom: inspecteer → herstel → controleer → lever op

1. Controleer **eenmalig** de actuele `main`-SHA en de relevante bestanden/handlers; lees de grote `index.html` alleen op gerichte regels. Kijk vóór nieuwe code of een bestaande helper of stijlregel het al oplost.
2. Kies **niveau 1, 2 of 3 op basis van werkelijk effect** (niet simpelweg omdat `index.html` of `sw.js` is aangeraakt). Maak één beperkte wijziging, met één duidelijke reden; geen parallelle herbouw van ongerelateerde schermen.
3. Gebruik eerst de **kleinst mogelijke relevante regressie**. Hergebruik een geslaagde test als de bijbehorende code daarna niet is gewijzigd. Laat GitHub Actions automatisch de uiteindelijke risicodekking selecteren via `tests/ci-plan.cjs`.
4. Corrigeer verouderde assertions/selectors **in dezelfde PR** wanneer code naar een ander bestand verhuist. Controleer nog steeds het daadwerkelijke gedrag; verlaag nooit verwachte resultaten en schakel geen falende tests uit.
5. Rond zelfstandig af: diff controleren, branch/PR, relevante CI, gerichte reparatie bij falen, daarna merge alleen wanneer checks groen zijn én publicatie is geautoriseerd. Rapporteer SHA, status, tests en eventuele blokkade compact.

Bij een goedgekeurd ontwerp: maak vóór implementatie een korte koppeling tussen
elk afgesproken onderdeel, de gewijzigde code en het acceptatiebewijs. Een
goedgekeurde editor hoort bij die scope; laat hem niet stilzwijgend buiten de PR.
Vergelijk de echte app met het gekozen ontwerp, inclusief geopende menu's en
dialogen. Controleer samengestelde routes na de interactie opnieuw op geometrie
en overflow; alleen aantallen knoppen of `isVisible()` zijn geen layoutbewijs.
Voor Mijn dag geldt [het V3/V2-contract](docs/mijn-dag-v3-acceptance.md) en de
gerichte `day-v3-browser`-suite. Beoordeel de CI-screenshots op de exacte head
vóór merge; rapporteer ontbrekend visueel bewijs als niet geverifieerd.

## Wat test je wanneer?

**1. Laag — lokale CSS, tekst, iconen, documentatie**
- Code: syntax/diff, stylescope en bestaande handlers controleren.
- Visueel getroffen onderdeel: **één 393px-browserrooktest**; 360px alleen bij werkelijk overlooprisico.
- Alleen documentatie/AGENTS: inhoudelijke diff, geen volledige browserjobs.
- Geen volledige financiële-, Leven-, backup-, of PWA-upgradecontroles.

**2. Middel — bestaande UI-interactie of scherm, kleine module, gedeelde CSS**
- Gerichte core-/regressietests en werkelijke browserroute(s) van het getroffen domein.
- Bij relevante wijzigingen in Kenniscentrum, Fitness, Financiën, Agenda en startscherm selecteert de CI-planner de bijbehorende browsergroep.
- Mobiel 360/393/412 px alleen voor daadwerkelijk beïnvloede interacties. Screenshot vóór/na als er visueel iets wijzigt.
- `index.html`-assetversies of `sw.js`-cachemanifestupdates **zonder andere codewijzigingen** zijn op zichzelf geen reden voor een volledige appmatrix; controleer wel verwijzingen en precache. De CI-planner verifieert dit tegen de Git-diff.

**3. Hoog — opslag/gegevens, beveiliging, financiële berekeningen, service-worker-lifecycle of grote inline JS/CSS-ingrepen**
- Volledige toepasselijke GitHub-releasecontrole met regressie-, browser-, opslag- en veiligheidschecks.
- De zes zware browsergroepen worden **parallel** uitgevoerd; de volledige dekking blijft gehandhaafd, maar geen aaneengesloten browserwachtrij.
- Wanneer persistentie of service-workerlogica verandert: test de upgrade van de vorige `main`, behoud van originele data en binaire bijlagen, offline herstart, PIN en herstelpaden.
- Visuele fixture op 360/393/412/1280 als breed systeemgedrag geraakt wordt. Bij brede taakwijzigingen 0/1/43 taken, lange tekst, filters, menu, afronden/heropenen, Mijn dag en Agenda.

## CI — bron van waarheid

- `.github/workflows/app-review.yml`: centrale uitvoering, jobmatrix en release-gate.
- `tests/ci-plan.cjs`: kiest op basis van de **werkelijke file-inhoud/diff** passende risicoklasse en domeinen. `tests/ci-plan-regression.cjs` controleert de beslisregels.
- `tests/ci-groups.cjs`: voert geselecteerde suites uit, registreert **tijd per suite** en voert de volledige dekking bij niveau 3 in parallelle shards uit.
- De overige domeinworkflows zijn handmatig/gericht; start ze **niet nogmaals** als de centrale run dezelfde controles al uitvoert.
- Gebruik `workflow_dispatch` voor een bewuste volledige controle, niet als standaard bij kleine UI-wijzigingen.
- Een groene PR-releasecheck is noodzakelijk; falende relevante tests niet overslaan, hernoemen of versoepelen. Flakiness eerst reproduceren en oplossen (echte toestand, gerichte wait, screenshots/foutlog), niet blind herhalen tot groen.

## Bescherm gegevens, toegang en bestaande werking

- **Nooit** gebruikersopslag wissen, data opnieuw initialiseren, schema's/keys/IDs/PIN zonder expliciete migratie veranderen, ZIP/herstel/attachments ongetest breken of echte gebruikersgegevens in tests gebruiken.
- Gebruik alleen geïsoleerde fictieve testfixtures. Bewaar bestaande berekeningen, categorieën, overboekingen en offline gedrag.
- `memento-ui.js` beheert viewport/notice, `memento-ui.css` gedeelde knoppen; glass visueel materiaal; layout leesvolgorde; modules domeinstaat. Voeg geen dubbele CSS-`!important`-ketens of onnodige observers toe.
- Bedienbaarheid: minimaal **44×44 px** voor aanraakdoelen, duidelijke focus/labels; geen `force-click` om browserfouten te negeren.
- Bij bijgewerkte offline assets: synchroniseer versieparameters in `index.html` en `sw.js` CORE en verhoog cacheversie. Verander geen worker-fetchlogica bij puur assetonderhoud.
- Browseremulatie is geen echte Samsung-/Android-/TalkBack-test. Claim dat niet.

## GitHub en efficiënt gebruik van Codex/Work

- Niveau 1: directe `main`-wijziging uitsluitend bij aanwezige publicatieautorisatie en geldende branchregels. Niveau 2/3: aparte branch en PR; vergelijk vóór merge met de dan-actuele `main`.
- Geen overbodige rondes code lezen, complete repository opnieuw inventariseren, tientallen screenshots maken of alle testgroepen handmatig herhalen. Laat CI de matrix één keer draaien en onderzoek bij rood de **specifieke falende test**.
- Bij browserwerk: Playwright 1.62.1 buiten de productierepository. De CI hergebruikt waar mogelijk de Chromium-downloadcache. Geen nieuw productie-npm-project.
- Laat bij onvermijdelijke externe goedkeuring of rode releasecontrole de PR open en zeg **precies** wat blokkeert. Geen claim van afgeronde publicatie zolang GitHub dat niet bevestigt.
- Eindrapport: wat gewijzigd, tests daadwerkelijk geslaagd/mislukt, PR/commit, productie- of conceptstatus en rollbackmogelijkheid. Geen generieke voortgangsteksten.

