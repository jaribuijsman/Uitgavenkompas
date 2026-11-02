# Memento — efficiënte, risicogestuurde ontwikkeling

Geldt voor Codex, ChatGPT Work en andere agents in deze repository. De recentste gebruikersopdracht en hogere instructies gaan voor. De gebruiker heeft gevraagd om opdrachten zoveel mogelijk **in één uitvoering volledig af te handelen**; vraag niet opnieuw om reeds verstrekte toestemming en stop niet na alleen een plan.

## Canonieke productbronnen — lees altijd relevant, nooit een verouderde chatkopie

**De vier projectbronnen staan vanaf nu in GitHub** onder [`docs/product/README.md`](docs/product/README.md): [01_MASTERPLAN](docs/product/01_MASTERPLAN.md), [02_DESIGN_SYSTEM](docs/product/02_DESIGN_SYSTEM.md), [03_BESLUITEN_EN_ROADMAP](docs/product/03_BESLUITEN_EN_ROADMAP.md) en [04_HISTORISCHE_BESLUITENAUDIT](docs/product/04_HISTORISCHE_BESLUITENAUDIT.md) (uitsluitend historisch). Dit is de versiebeheerde productbron; oude ChatGPT-projectuploads synchroniseren niet. Voor iedere Memento-opdracht, ook via een gewone GPT-chat/GitHub-connector, lees eerst de actuele `main` en uitsluitend de **relevante** passages uit deze bronnen. GitHub-code en tests blijven de feitelijke bron voor huidige werking; een recent expliciet goedgekeurd ontwerp bepaalt gewenste werking.

**Ontwerpwerk ≠ uitvoering.** Bij een expliciet gevraagd ontwerp in GitHub: maak een designbranch met een versieerbaar ontwerpcontract/prototype en relevante productbesluiten; wijzig geen appcode zonder implementatieopdracht. Bij een later goedgekeurde implementatie: vertaal alle afgesproken eisen aantoonbaar naar code, gebruikersroutes en bewijs. Werk `03_BESLUITEN_EN_ROADMAP.md` binnen die PR bij bij een wezenlijk besluit of bewezen statusverandering. Werk `02_DESIGN_SYSTEM.md` bij indien de definitieve visuele afspraak verandert; laat het historische archief intact. Geen documenten in een publieke repo zetten met persoonlijke of vertrouwelijke gegevens.

**Zelfverbeterend werken:** reproduceer fouten, onderscheid echte appdefecten van verouderde/foutieve tests en reeds bestaande blokkades via vergelijking met de basisbranch, herstel de oorzaak en pas de kleinste relevante regressietest of procesregel aan. Meld niet-gerelateerde blokkades afzonderlijk; geen willekeurige testuitzonderingen, `force`-clicks of geforceerde merges. Zie [Android-PWA UX-standaard](docs/android-pwa-ux-standaard.md).

## Bindend prototypecontract — geen stille herinterpretatie

**Universele regel voor alle Memento-schermen:** wanneer de gebruiker een specifieke HTML-prototypeversie of visueel voorbeeld expliciet goedkeurt met formuleringen als *“precies zo”*, *“dit is de juiste”* of *“implementeer dit prototype”*, geldt **die gekozen versie** als bindend visueel én interactioneel acceptatiecontract voor de benoemde scope. Het is geen inspiratiebron die de uitvoerende agent naar eigen voorkeur opnieuw mag ontwerpen. Voor gewenste vormgeving, volgorde, ruimtegebruik, kleurtoepassing, knoppen, menu's, schermtoestanden en actiehiërarchie gaat dit specifieke akkoord vóór algemene design-systeemvoorkeuren en standaard-Android-patronen. Veiligheid, toegankelijkheid, bruikbare tikgebieden, bestaande opslag en expliciete nieuwere gebruikerskeuzes blijven harde grenzen; los een conflict op met de **kleinste visueel equivalente ingreep**, meld en motiveer een onvermijdelijke afwijking, en vraag bij een wezenlijk andere UI eerst expliciet akkoord. Geen stilzwijgende vervanging door een 'betere' variant.

Bij elke **implementatie van een goedgekeurd prototype** (niet bij gewone tekst-, icoon- of onderhoudspatches):

1. **Bevries de referentie vóór coderen.** Benoem de geselecteerde versie, schermen, goedkeuringsbron en eventueel SHA-256. Leg een toegankelijk, versieerbaar HTML-/screenshotreferentiebestand plus compact acceptatiecontract vast in de design-PR of implementatie-PR. Een publieke repository mag **nooit** echte medische/financiële of andere vertrouwelijke voorbeelddata bevatten: maak een functioneel en visueel gelijkwaardige geanonimiseerde fixture, of gebruik een toegankelijke private referentie. Als het exacte referentieontwerp voor de uitvoerende agent niet beschikbaar is, **niet zelf reconstrueren en geen 1-op-1-oplevering claimen**.
2. **Maak een 1-op-1-vertaling, geen nieuw ontwerp.** Koppel de zichtbare onderdelen en acties van de gekozen versie aan de bestaande Memento-componenten, data/handlers, schermroutes en maximaal acht samengevatte acceptatiecriteria. Behoud ook menu's, velden, editorvarianten, onderlinge afstanden, tekstomloop, scroll-/stickygedrag en wat zichtbaar wordt ná een actie. Hergebruik bestaande code; maak geen nieuwe CSS-overrideketen of parallelle editor om de afbeelding na te bootsen. Dummy-gedrag uit een prototype wordt gekoppeld aan de bestaande **echte en veilige** functie, nooit stilletjes weggelaten.
3. **Vergelijk dezelfde toestanden met dezelfde fixture.** Render het goedgekeurde prototype en de echte branch met identieke viewport, testinhoud, scrollpositie en relevante menu-/dialoogtoestanden. Gebruik standaard de gerichte 393px-Android-browserjourney; breid alleen bij aantoonbaar relevant risico uit naar 360/412px, korte viewport, toetsenbord of standalone. Controleer visuele hiërarchie, positie, breedte, hoogte, ruimtegebruik, paneelvolgorde, knoppen, open menu's, bereikbaarheid en interactie. Kleine font-/OS-rasterverschillen zijn toegestaan; gewijzigde indeling, weggelaten onderdelen of andere bediening niet.
4. **Afwijking = afkeuring, tenzij expliciet goedgekeurd.** Maak in de PR de referentie-/appbeelden en een korte vergelijking per veranderde toestand zichtbaar. Leg noodzakelijke afwijkingen en hun reden afzonderlijk vast, met het gebruikersakkoord. Is de vergelijking niet uitgevoerd of de referentie afwezig, rapporteer **visueel NIET GEVERIFIEERD**. Bij materiële afwijking: **visueel AFGEKEURD**, herstellen vóór merge, óók wanneer alle CI-tests groen zijn. Geen productiemelding “precies zoals prototype” zonder daadwerkelijk bewijs.
5. **Geen nieuwe dure generieke testprocedure.** Integreer dit in de bestaande risicogestuurde domeinjourney en centrale PR-gate; hergebruik screenshots, fixtures en artifacten. Een kleine wijziging buiten een goedgekeurde prototype-implementatie blijft niveau 1 met de beperkte checks van dit document.

**Onderscheid ontwerp en uitvoering:** een expliciet goedgekeurde vormgeving is een ontwerpbesluit, niet automatisch toestemming om de app te wijzigen. Een nieuwe implementatieopdracht en de geldende branch-/publicatieregels blijven nodig.

## Taakgerichte skillrouter (ook als cloudcatalogus leeg is)

Bij werk in deze repository: gebruik `AGENTS.md` als basis. Selecteer **alleen de relevante** lokale instructies uit `.agents/skills/<naam>/SKILL.md` op basis van de taak, ook wanneer de cloud-/executor-skillcatalogus ze niet automatisch toont. Dit is handmatig lezen van projectinstructies, **geen bewijs van automatische skillactivering**.

- Release, PR, deployment of acceptatiebewijs → `release-guardian`
- Testselectie, regressie of CI-efficiëntie → `smart-regression`
- CSS, componentconsistentie of visuele stijlen → `design-system-guardian`
- Dupliceerde code, bugs, onderhoud of opschoning → `code-auditor`
- Nieuwe functie, scherm, gegevensstroom of ontwerp → `feature-architect`
- Android, touch, viewport, scroll of mobiele dialogen → `android-ux-inspector`

Lees alleen benodigde skillbestanden (bij overlap maximaal de direct relevante); ga daarna direct verder met de bestaande risicogestuurde workflow. Skills vervangen de CI-gates, privacyregels of gebruikersopdracht niet. Als het bestand ontbreekt, meld dat en werk volgens `AGENTS.md`; maak geen nieuw duplicaat. Zoek vanaf de repositoryroot, niet vanuit een lege `/workspace`.

## Standaard voor alle schermen: Android Developers × Memento

[De Memento Android-PWA UX-standaard](docs/android-pwa-ux-standaard.md) is **normatief** voor ontwerp, implementatie en acceptatie van ieder tabblad. Vertaal Android-richtlijnen naar HTML/CSS/PWA; behoud het goedgekeurde Memento-design. Lees alleen de relevante voorschriften en de direct geraakte code, niet dagelijks alle Android-documentatie. Volg bij onverwachte fouten de oorzaakanalyse → gerichte reparatie → passende regressietest → bewijs → procesverbetering. Rapporteer een blokkade met de eigenaar/route en het exacte PR-head-SHA; benoem expliciet wanneer een externe of reeds bestaande fout niet door de wijziging is veroorzaakt. Geen automatische merges op basis van alleen een groene status.

## Samsung Galaxy A54 — snelle PWA-controle

Memento wordt primair als geïnstalleerde Android-PWA gebruikt. Beoordeel relevante wijzigingen daarom op standalone-schermruimte, veilige marges bij Android-systeemnavigatie, bereikbare acties bij geopend toetsenbord en scroll/overlays. Browsertests simuleren dit slechts gedeeltelijk; claim geen fysiek toestelbewijs.

**Efficiëntie is verplicht:** volg de bestaande CI-risiconiveaus; voeg géén algemene extra testmatrix, nieuwe frameworkinstallatie of verplichte fysieke toesteltest toe. Bij een lokale, laagrisico visuele wijziging volstaat de bestaande gerichte 393px-rooktest. Voeg uitsluitend bij concreet risico een extra breedte, korte viewport of keyboard/standalone-scenario toe. Hergebruik screenshots/artifacts en stop na bewezen passende checks. Voor nieuwe of aangepaste primaire mobiele bediening: streef naar een aanraakvlak van 48×48 CSS-px, met 44×44 px als bestaande minimale projectgrens; controleer de daadwerkelijke bediening en niet uitsluitend het pictogram. Bij echte toestelafwijkingen: een gerichte handmatige A54-check, niet standaard voor iedere kleine patch.

## Één uitvoeringscontract voor GPT, Codex en Work

**Verplicht en identiek** voor ChatGPT/GPT via GitHub-tools, Codex, Work en alle andere agents. De gebruikte omgeving is geen uitzondering op risicoselectie, gebruikersautorisatie of veiligheidscontroles.

1. **Inspecteer één keer:** actuele `main`-SHA, relevante skill, concrete code-diff en bestaande handlers. Bepaal de werkelijke impact, niet alleen de bestandsnaam. Spreek een minimale toepasselijke testset af met de bestaande `tests/ci-plan.cjs`.
2. **Eerst lokaal klein testen:** controleer syntax, diff en directe regressie/browserroute. Vermijd extra brede matrices. Als GPT of een andere agent geen lokale runtime heeft, meld dit expliciet als **NIET GEVERIFIEERD**; claim nooit dat een lokale test is uitgevoerd.
3. **Eén definitieve push:** bundel verwante correcties in een samenhangende branchcommit na lokale verificatie. Start geen CI bij iedere kleine selector- of assertionwijziging. Bij een echte CI-fout: inspecteer uitsluitend de falende test, herstel gericht en push zo nodig één correctie.
4. **Één centrale PR-gate:** gebruik `.github/workflows/app-review.yml` en de planner voor het exacte PR-head-SHA. Geen extra handmatige domeinworkflows of volledige tweede matrix wanneer het bewijs voor dezelfde code al bestaat.
5. **Veilige postmerge:** normale en squash-merges krijgen alleen korte controles bij een bewezen identieke Git-tree, exact groen PR-head-SHA, dezelfde `main`-basis en gemergede PR. Directe pushes, manual full en onbewezen merges volgen het normale risicoplan.
6. **Gelijke eindrapportage:** noem werkelijke SHA/PR, checks, uitgevallen checks, gegevensveiligheid en productie/PR-status. Browseremulatie is geen A54-toesteltest; zeg dit waar relevant.

Een gemengde module zoals `assets/memento-life-app.js` bevat ook persistentie. Verlaag die niet op grond van een tekstmarker, modelinschatting of cosmetisch klinkende taak. Pas risicodowngrades eerst toe ná aantoonbaar veilige isolatie van presentatiecode, met regressie en negatieve veiligheidstests.

## Werkstroom: inspecteer → herstel → controleer → lever op

1. Controleer **eenmalig** de actuele `main`-SHA en relevante bestanden/handlers; lees grote bestanden alleen op gerichte regels. Lees uitsluitend de toepasselijke passages uit projectbronnen; historische audits en alle projectdocumenten zijn géén verplichte dagelijkse preflight. Kijk vóór nieuwe code of een bestaande helper of stijlregel het al oplost.
2. Kies **niveau 1, 2 of 3 op basis van werkelijk effect** (niet simpelweg omdat `index.html` of `sw.js` is aangeraakt). Maak één beperkte wijziging, met één duidelijke reden; geen parallelle herbouw van ongerelateerde schermen.
3. Maak bij goedgekeurde UI-ontwerpen vóór programmeren een microcontract van maximaal acht controleerbare criteria, inclusief bestaande editors en acties. Gebruik eerst de **kleinst mogelijke relevante regressie**. Hergebruik een geslaagde test als de bijbehorende code daarna niet is gewijzigd. Laat GitHub Actions automatisch de uiteindelijke risicodekking selecteren via `tests/ci-plan.cjs`.
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

## Verplicht visueel acceptatiecontract per tabblad (Android-first)

Een groen functioneel CI-resultaat is **geen** visuele goedkeuring. PR #59 slaagde omdat de Knowledge-test alleen acties/opslaan en de algemene layouttest andere tabbladen controleerden; op de echte A54 waren de sticky balk, schermbrede knoppen en bijlagekiezer toch fout. Deze blinde vlek mag niet worden herhaald.

Bij wijzigingen aan de **schermindeling, navigatie, editor, actiehiërarchie, overlay of interactie** (niet bij louter documentatie of een geïsoleerde kleur/icooncorrectie):
1. Leg vóór coderen per geraakt tabblad de goedgekeurde schermtoestand vast: start, bewerken, scroll midden/onderaan, menu geopend, lange inhoud en relevante lege/fouttoestand. Benoem de bestaande functies/IDs die blijven. Gebruik het originele prototype als referentie; testdata en toestanden moeten vergelijkbaar zijn.
2. Bepaal de enige bestaande JS/CSS-eigenaar en verwijder conflicterende oude regels in plaats van onderaan overrides te stapelen. Controleer cascade én de renderroute voor gewone notities en document-/receptvarianten.
3. Voeg in **de bestaande domein-browserjourney** echte gebruikersinteracties en geometrieasserties toe voor de gewijzigde toestanden. Meet breedte/hoogte, open menusheets, zichtbaarheid bij scrollen, sticky-headertegenligging, laatste actie boven de bottom-nav, file-input en korte viewport waar relevant. Hergebruik `tests/helpers/mobile-visual-contract.cjs` **als deze op de gecontroleerde branch bestaat**; anders test je dezelfde relevante geometrie in de bestaande domeinjourney. Voorkom afhankelijkheid van nog niet gemergede PR's. Geen tests die slechts `count()` of `isVisible()` controleren.
4. De centrale CI bewaart de relevante schermbeelden op de exacte PR-head **ook als de tests groen zijn**. Inspecteer ze zelf naast het goedgekeurde ontwerp vóór merge; keur mismatches af en herstel in dezelfde PR. Een groen resultaat zonder deze vergelijking heet **functioneel GESLAAGD / visueel NIET GEVERIFIEERD**, niet visueel GESLAAGD.
5. Op echte A54-afwijkingen: gebruik de door de gebruiker getoonde screenshots als concrete regressiecase. Test dezelfde paginastaat eerst in Chromium op 393 px, plus 360/412 en 470px hoogte alleen bij daadwerkelijk relevant overloop-/keyboardrisico. Browserverificatie is geen fysieke toesteltest; meld dat verschil.
6. Publiceer pas na geautoriseerde merge en controleer versienummers/serviceworker. Verwijder of reset nooit echte lokale PWA-data om een layoutprobleem te 'repareren'.

Deze extra diepgang is **domeingebonden en risicogestuurd**: één getroffen editor => één relevante journey met meerdere schermtoestanden, geen volledige matrix van alle tabbladen. Voor louter niveau-1 kleur-/icoonwijzigingen blijft de bestaande korte rooktest voldoende. Bij opslag, beveiliging, financiën of serviceworkerlogica blijft niveau 3 verplicht.

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
- De zes zware browsergroepen worden **parallel** uitgevoerd op de PR of op een niet-verifieerbare/directe `main`-wijziging; de volledige risicodekking blijft gehandhaafd.
- Wanneer persistentie of service-workerlogica verandert: test de upgrade van de vorige `main`, behoud van originele data en binaire bijlagen, offline herstart, PIN en herstelpaden.
- Visuele fixture op 360/393/412/1280 als breed systeemgedrag geraakt wordt. Bij brede taakwijzigingen 0/1/43 taken, lange tekst, filters, menu, afronden/heropenen, Mijn dag en Agenda.

## CI — bron van waarheid

- `.github/workflows/app-review.yml`: centrale uitvoering, jobmatrix en release-gate.
- `tests/ci-plan.cjs`: kiest op basis van de **werkelijke file-inhoud/diff** passende risicoklasse en domeinen. `tests/ci-plan-regression.cjs` controleert de beslisregels.
- `tests/ci-groups.cjs`: voert geselecteerde suites uit, registreert **tijd per suite** en voert de volledige dekking bij niveau 3 in parallelle shards uit.
- De overige domeinworkflows zijn handmatig/gericht; start ze **niet nogmaals** als de centrale run dezelfde controles al uitvoert.
- Een na merge volledig identieke Git-tree met een **bewezen groene PR-run voor exact die head** krijgt op `main` alleen een korte rooktest en cachecontractcontrole. `tests/ci-postmerge.cjs` verifieert gewone/squash-parent(s), de identieke PR-head-tree en GitHub-PR/Actions-bewijs. Als verificatie ontbreekt of faalt, start het normale volledige risicoplan; directe pushes of `workflow_dispatch` slaan de veiligheidschecks nooit over.
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
- Geen overbodige rondes code lezen, complete repository opnieuw inventariseren, tientallen screenshots maken of alle testgroepen handmatig herhalen. Push pas na de gerichte lokale controle, zodat verouderde CI-runs zo weinig mogelijk starten. Laat CI de matrix één keer draaien en onderzoek bij rood de **specifieke falende test**.
- Bij browserwerk: Playwright 1.62.1 buiten de productierepository. De CI hergebruikt waar mogelijk de Chromium-downloadcache. Geen nieuw productie-npm-project.
- Laat bij onvermijdelijke externe goedkeuring of rode releasecontrole de PR open en zeg **precies** wat blokkeert. Geen claim van afgeronde publicatie zolang GitHub dat niet bevestigt.
- Eindrapport: wat gewijzigd, tests daadwerkelijk geslaagd/mislukt, PR/commit, productie- of conceptstatus en rollbackmogelijkheid. Geen generieke voortgangsteksten.

