# Memento — complete cleanup: actuele voortgang en resterende risico's

**Laatst bijgewerkt:** 31 oktober 2026, na PR #26. **Status: gedeeltelijk afgerond, nog géén volledige cleanup.**

Repository: `jaribuijsman/Uitgavenkompas`. Gecontroleerde `main`-commit: `d591c4099cfee938c9e943007778ab85cb6be678`.

## Wat aantoonbaar is uitgevoerd

| PR | Onderdeel | Bevestigd resultaat |
|---|---|---|
| #15 | Kenniscentrum: archief/prullenbak | Zoek-, verzamelings-, type- en tagfilters worden ook in archief en prullenbak toegepast; regressietests toegevoegd |
| #16 | Notitie-browsertest | Wacht op correcte renderstatus in plaats van direct na input te tellen; **intermitterende afwijking bestaat nog** |
| #17 | Financiën-CSS | Vier overschreven financiële layoutdeclaraties verwijderd |
| #18 | Navigatie | Ongewijzigde navigatie en tabbladlogica losgemaakt van `index.html`, met offline caching |
| #19 | CI en `AGENTS.md` | Zes parallelle browsergroepen, inhoudsgerichte risicoselectie en minder onnodige tests |
| #20 | Financiën/Leven | 226.110 en 132.652 tekens JavaScript **byte-identiek** uitgepakt naar `assets/memento-finance-app.js` en `assets/memento-life-app.js`; synchrone scriptvolgorde en PWA precache behouden |
| #21 | CSS-baselaag | 110.649 tekens CSS **byte-identiek** verplaatst naar `assets/memento-base-app.css`; oorspronkelijke cascadepositie behouden |
| #22 | Kenniscentrum-CSS | Vroeger overschreven kleurdeclaratie en eerste redundante reduced-motion-regel verwijderd; latere werkzame regels behouden |
| #23 | Browsergeschiedenis Kenniscentrum | De test wacht op gecommitteerde `popstate`-terugkeer vóór het wissen van de zoektekst; de eis van drie notities blijft |
| #24 | Veiligheid CI-planner | Uitgepakte Financiën-/Leven-scripts expliciet hoog risico met verplichte data-/upgradechecks; basestylesheet als gedeelde CSS herkend |
| #25 | Mobiele Kenniscentrum-filters | Op telefoonbreedtes twee kolommen en sortering op volle rij; echte Chromium-test controleert bruikbare breedtes |
| #26 | Kenniscentrum-zoekinvoer | Directe `input`/native `search`-listeners op actuele zoekvelden, geen dubbele documentdelegate; aanvullende regressie voor niet-bubbelende native wisactie |

Elke genoemde PR is pas na een groene toepasselijke GitHub-releasecontrole naar `main` gemerged. De oorspronkelijke complete PR-tests van #20 en #21 bevatten ook een offline upgrade vanaf `main`. GitHub Pages bouwt en publiceert op afzonderlijke workflows.

**Resultaat codeorganisatie:** `index.html` vóór deze fase ~663.072 tekens; na #22 ~193.876 tekens: ruim **70% afname**. Dat is structurele verplaatsing van code, **geen bewijs** dat de onderliggende functies al vereenvoudigd of volledig vrij van duplicatie zijn.

## Wat nog openstaat — prioriteit

### P0 — Kenniscentrum-zoekinvoer: gerichte correctie gepubliceerd, blijvende regressiebewaking

Een eerdere notitietest wisselde tussen groen en rood na terugnavigatie en wissen van de zoektekst. Op de **productie-commit vóór PR #26** faalde GitHub Actions-run `41194827708` opnieuw. De toegevoegde diagnostiek bewees: bij 360px stond de zichtbare invoer nog op `Fictief`, er werd één item getoond, terwijl `MementoKnowledgeCore.search(...,query:'')` **drie** geldige notities vond en de tag-/typefilters leeg waren. Dit toont een UI-invoer-/renderprobleem, geen fout in de kernzoekresultaten.

PR #23 heeft de test eerst gesynchroniseerd met de browsergeschiedenis; dat alleen bleek niet voldoende. PR #26 heeft daarna het actuele zoekveld rechtstreeks aan `input` en `search` gekoppeld, dubbel delegeren voorkomen en gebeurtenissen op verwijderde velden afgevangen. Een nieuwe browserregressie verifieert de **niet-bubbelende native zoekveld-wisgebeurtenis**.

**Verificatie:** PR #26 release-gate groen (run `41195307725`), daarna ook de zelfstandige controle op `main` groen (run `41195428603`), en GitHub Pages succesvol gepubliceerd. **Onzekerheid:** omdat de oorspronkelijke fout intermitterend was, bewijzen deze twee groene runs niet dat elke toekomstige race is uitgesloten. Houd de bestaande strikte drie-notities-assertie én `KC_SEARCH_CLEAR_DIAGNOSTIC` aan; analyseer een nieuwe rode run inhoudelijk, niet door de test te verzwakken.

### P1 — Echte CSS-conflicten en mobiele bedienbaarheid

Er zijn nog **27 inline styleblokken** in `index.html`, naast CSS-bestanden voor tokens, glas, layout, UI, Kenniscentrum, Fitness en Start. De historische selector-telling in de oorspronkelijke audit gaf meerdere herhalingen; herhaalde selectors binnen verschillende mediaqueries zijn niet automatisch een bug.

Een mobiele screenshot liet op 360px afgekorte tag-/sorteringslabels in het Kenniscentrumfilter zien; dat is in PR #25 gerichter hersteld en met Chromium-geometryasserties gecontroleerd. Eerdere `knowledge-v2-browser`-diagnostiek toonde daarnaast elementen die buiten hun deelcontainer kunnen vallen, ondanks een totale `document.scrollWidth` van 393 px. Ook zijn op bepaalde schermen bedieningsvlakken onder 44px gerapporteerd. Dit moet visueel op een echte viewport/screenshot worden beoordeeld. **Verwijder alleen bewezen overbodige regels en behoud de huidige stijl.**

### P1 — Vereenvoudig interne JS-implementatie

De twee uitgepakte applicatiescripts blijven zelf groot (Financiën ~226 KB, Leven ~133 KB). Hun functies, state en opslagcontracten zijn nog niet volledig opgesplitst in onafhankelijke, testbare domeinmodules. Kijk eerst welke bestaande `assets/*-core.js`-modules al verantwoordelijkheid bezitten. Vermijd nog een tweede implementatie van dezelfde berekening of state.

**Aanpak per kleine PR:** afhankelijkheden expliciet maken, één zelfstandig stuk verplaatsen of duplicatie verwijderen, publieke API handhaven, gerichte test aanvullen en offline-upgrade alleen als die werkelijk geraakt wordt.

### P2 — Functionele eindcontrole en ongebruikte code

Controleer per module de daadwerkelijke gebruikersroute: taken (verlopen/herhalen), afspraken, financiële overboekingen/categorieën, notities/zoekfuncties, fitness, back-up/ZIP, PIN en instellingen. Vergelijk waar mogelijk met huidige `main`; oude voorbeeldscreenshots of oude branches zijn geen bewijs. Verwijder code/assets pas na een volledige referentiezoektocht en controle van offline cache en oudere back-upformaten.

## Werkwijze bij vervolgopdracht

1. Begin bij dan-actuele `main` en lees `AGENTS.md`. Herhaal niet steeds de volledige repository-inventarisatie.
2. Prioriteit: bewaak de in PR #26 herstelde Kenniscentrum-invoer met bestaande diagnostiek; ga nu verder met daadwerkelijke CSS-cascade-/touchproblemen en het intern vereenvoudigen van de grote Financiën-/Leven-scripts.
3. **Eén afgebakend risico per PR.** Wijzig relevante bestaande tests in dezelfde PR; laat risicogestuurde CI automatisch kiezen.
4. Bewaar de originele browseropslag, IDs, PIN, financiële rekenregels, attachments, ZIP/herstel en mobiele weergave. Test uitsluitend fictieve geïsoleerde fixtures.
5. Merge uitsluitend na relevante groene tests en controleer de actuele `main` opnieuw. Geen onnodige dubbele testmatrices.
6. Werk **ditzelfde rapport** na een grote cleanupstap bij, in plaats van steeds nieuwe auditdocumenten te stapelen.

**Afbakening:** deze inventarisatie registreert wat is geverifieerd in GitHub-code, PR-diffs en CI-runs. Geen volledige dynamische inspectie van iedere functie of een fysieke Android-test is uitgevoerd; de complete cleanup is nog niet voltooid.
