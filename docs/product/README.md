# Memento — productbronnen in GitHub

**Canonieke bron:** de actuele `main` van deze repository. Deze map vervangt de vier statische ChatGPT-projectbronnen. Bestanden in een chat of ChatGPT-project synchroniseren niet automatisch met GitHub; zij zijn na deze migratie alleen tijdsopnames.

| Document | Autoriteit | Onderhoud |
| --- | --- | --- |
| [01_MASTERPLAN.md](01_MASTERPLAN.md) | Blijvende productprincipes, architectuurcontext en kerncontracten | Alleen bij fundamenteel nieuw of gewijzigd productprincipe |
| [02_DESIGN_SYSTEM.md](02_DESIGN_SYSTEM.md) | Visuele identiteit, goedgekeurde schermopbouw en ontwerpregels | Bij expliciet goedgekeurde ontwerpwijziging |
| [03_BESLUITEN_EN_ROADMAP.md](03_BESLUITEN_EN_ROADMAP.md) | Laatst goedgekeurde keuzes, voortgang en openstaande beslissingen | Bij materieel productbesluit / aantoonbaar nieuwe status |
| [04_HISTORISCHE_BESLUITENAUDIT.md](04_HISTORISCHE_BESLUITENAUDIT.md) | Alleen historisch archief met beperkingen van eerdere audit | Niet herschrijven om actuele code of testuitkomst te suggereren |

## Werkvolgorde bij iedere Memento-taak

1. **Actuele `main`** is feitelijk bewijs van code en tests, niet automatisch van het gewenste gedrag. Lees `AGENTS.md` en uitsluitend relevante `.agents/skills/` inclusief [Android-PWA UX-standaard](../android-pwa-ux-standaard.md) voor ontwikkeling.
2. **Ontwerpvragen / brainstorm**: lees alleen de relevante passages van 01, 02, 03. Werk een voorstel uit op grond van bestaande Memento-componenten. Een ontwerpverzoek is geen toestemming om applicatiecode te wijzigen.
3. **Goedkeuring**: een nieuw expliciet gebruikersbesluit gaat voor oudere documenten. Leg de nieuwe keuze en wat zij vervangt eerst vast in `03_BESLUITEN_EN_ROADMAP.md`, en update `02_DESIGN_SYSTEM.md` alleen als het ontwerp werkelijk verandert. Onzekerheden niet invullen als beslist.
4. **Ontwerp in GitHub**: maak bij expliciete wens een ontwerpbranch (`design/<onderdeel>-<korte-omschrijving>`) met specificatie, screenshot/HTML-prototype indien gevraagd en acceptatiecriteria. Een design-PR is **geen productie-implementatie**. Behoud goedgekeurde prototypes als versieerbare referentie als zij voor de uitvoering bepalend zijn.
5. **Implementatie**: na expliciete opdracht een aparte geautoriseerde werkbranch of de afgesproken bestaande implementatiebranch, en een eisenmatrix `besluit → code → browserroute → bewijs`. Controleer zowel gewone als bijzondere schermvarianten en behoud lokale data.
6. **Feedbacklus**: als code, CI of fysieke A54-test een fout laat zien, classificeer bewijsgericht **productfout / testfout / bestaande fout / regressie / niet geverifieerd**, herstel binnen scope of open een duidelijk gekoppelde blokkade-PR. Wijzig de relevante regressietest of de instructie zodat de fout volgende keer eerder gevonden wordt. Niet forceren of stilzwijgend tests uitschakelen.
7. **Samenvoegen en rapportage**: alleen met bevoegdheid en passende groene controles en visuele acceptatie; rapporteer exact SHA, werkelijke checks, niet-geteste punten en PR-/publicatiestatus. Bij uitvoering die een wezenlijk besluit of geverifieerde status verandert, werk 03 in dezelfde PR bij.

## Conflicten en migratiegrens

Prioriteit: actuele expliciete gebruikerskeuze voor gewenste werking; actuele code + geslaagde tests voor feitelijke werking; `AGENTS.md` en skills voor technische procedure; deze documenten voor productcontext en historie. Een verlopen implementatieclaim in een document wordt **niet** automatisch een waarheidsclaim.

De documenten zijn geïmporteerd uit de aangeleverde bestanden (01 en 03: versie 2.0, 02: versie 1.0, 04: historische audit). Eerdere zinnen over het handmatig opnieuw uploaden naar ChatGPT-projectbestanden zijn **verouderde migratie-instructies**: onderhoud vanaf nu de GitHub-bestanden. De audit van oktober blijft historisch, inclusief het destijds genoemde oude `main`-SHA.

**Privacy:** de repository is publiek. Geen persoonlijke echte transacties, identificeerbare medische aantekeningen, adressen, sleutels, tokens of andere vertrouwelijke documenten committen. Voor vertrouwelijke productnotities moet eerst een aparte private opslagroute worden gekozen.

**Voor gewone ChatGPT-chats:** deze GitHub-bestanden worden niet automatisch als live context geladen. Geef bij een Memento-opdracht de repository of het Memento-project als context en laat de actuele `AGENTS.md` plus relevante productpassages raadplegen. Claim geen automatische synchronisatie.

## Gericht navigeren door technische documentatie en bewijs (D1)

Deze bestaande router is het vertrekpunt; lees geen compleet bewijsarchief voor een gewone wijziging. De enige operationele technische voortgangsbron blijft [TECHNISCHE_ROADMAP.md](../TECHNISCHE_ROADMAP.md). Een historisch eindrapport of screenshot bepaalt niet automatisch de actuele werking of ontwerpgoedkeuring.

| Categorie | Bronnen | Gebruik / behoud |
|---|---|---|
| Normatief voor de betrokken scope | Actuele `AGENTS.md`, deze productrouter en relevante 01/02/03; Android-PWA-standaard, actieve acceptatiecontracten en actuele code/tests | Lees uitsluitend de geraakte scope. `04_HISTORISCHE_BESLUITENAUDIT.md` blijft historisch. De technische roadmap vervangt historische cleanup-statuslijsten. |
| Testafhankelijk en versiegebonden | `docs/design-review/knowledge-prototype-approved-20261102.html` (Git-blob `193a7573ec6aedebb8aaba9cd07af29e5d512410`), bijbehorend acceptatiecontract; `docs/mijn-dag-v3-acceptance.md`, `docs/taken-v4-acceptance.md`; `docs/icon-audit.html`, `docs/icon-sticker-sheet.svg` | Niet verplaatsen/verwijderen op bestandenaantal. KC-HTML wordt werkelijk geladen/gehasht door de workspace-/paritytests; icoon-audit door illustrative-icons-browser, sticker-sheet wordt gegenereerd door de bestaande helper. Tekstcontracten zijn geen fictieve HTML-prototypes. |
| Historisch bewijs / tijdsopnames | `docs/masterplan-implementation.md`, `docs/masterplan-final-report.md`, `docs/masterplan-evidence/**`, `docs/cleanup-audit-20261031.md`, `docs/visual-audit-20261029.md`, oudere design-review- en domeinbewijsfolders | Alleen openen bij een concrete herkomst-/regressievraag. Oorspronkelijke bewijzen en hashes blijven behouden; oude geslaagd-/omgevingclaims gelden voor hun genoemde datum/commit. |
| Actueel taakgebonden uitvoerbewijs | Geselecteerde F4/F5/F6-bewijzen in `docs/design-review/`, gekoppeld vanuit de technische roadmap en PR's | Alleen raadplegen voor die vergelijking. Een auditbeeld is geen goedgekeurde nieuwe referentie; privacyveilige fixtures en broncommit blijven leidend. |

Referentieonderzoek voor D1: code-/workflowverwijzingen plus bestaande Markdown-links gecontroleerd voordat archivering/verwijdering is overwogen. **Niets gearchiveerd of verwijderd:** de dossiers hebben nog herkomst-, acceptatie- of testwaarde. De winst is een duidelijke leesroute en één actuele statusbron, geen onbewezen claim over runtime, agenttijd of repositorygrootte.
