# Memento — complete cleanup: actuele voortgang en resterende risico's

**Laatst bijgewerkt:** 31 oktober 2026, na PR #22. **Status: gedeeltelijk afgerond, nog géén volledige cleanup.**

Repository: `jaribuijsman/Uitgavenkompas`. Gecontroleerde `main`-commit: `2536e07b106f6a3e5301e0babff98d5fa6077cab`.

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

Elke genoemde PR is pas na een groene toepasselijke GitHub-releasecontrole naar `main` gemerged. De oorspronkelijke complete PR-tests van #20 en #21 bevatten ook een offline upgrade vanaf `main`. GitHub Pages bouwt en publiceert op afzonderlijke workflows.

**Resultaat codeorganisatie:** `index.html` vóór deze fase ~663.072 tekens; na #22 ~193.876 tekens: ruim **70% afname**. Dat is structurele verplaatsing van code, **geen bewijs** dat de onderliggende functies al vereenvoudigd of volledig vrij van duplicatie zijn.

## Wat nog openstaat — prioriteit

### P0 — Intermitterende Kenniscentrum-zoekfout

`tests/notes-direction-c-browser.cjs` faalde op sommige CI-runs wanneer na terugnavigeren de lokale zoekopdracht wordt gewist. De verwachte 3 notities werden dan niet binnen 5 seconden gerenderd; andere runs slagen. De fout bestond al vóór PR #20 en is nog niet als een reproduceerbare appbug of test-race geklassificeerd. In PR #20 is alleen **diagnostiek bij een mislukking** toegevoegd: werkelijke inputwaarde, zichtbare lijst, filters, route en core-zoekresultaten worden dan gelogd. De verwachte uitkomst blijft 3.

**Vervolg:** gerichte herhaling in een geïsoleerde fixture; bij een fout eerst de nieuwe diagnostiek analyseren, dan oorzaak oplossen. Niet blind timeouts verhogen, tests uitschakelen of verwachtingen verlagen.

### P1 — Echte CSS-conflicten en mobiele bedienbaarheid

Er zijn nog **27 inline styleblokken** in `index.html`, naast CSS-bestanden voor tokens, glas, layout, UI, Kenniscentrum, Fitness en Start. De historische selector-telling in de oorspronkelijke audit gaf meerdere herhalingen; herhaalde selectors binnen verschillende mediaqueries zijn niet automatisch een bug.

Eerdere `knowledge-v2-browser`-diagnostiek toonde elementen die buiten hun deelcontainer kunnen vallen, ondanks een totale `document.scrollWidth` van 393 px. Ook zijn op bepaalde schermen bedieningsvlakken onder 44px gerapporteerd. Dit moet visueel op een echte viewport/screenshot worden beoordeeld. **Verwijder alleen bewezen overbodige regels en behoud de huidige stijl.**

### P1 — Vereenvoudig interne JS-implementatie

De twee uitgepakte applicatiescripts blijven zelf groot (Financiën ~226 KB, Leven ~133 KB). Hun functies, state en opslagcontracten zijn nog niet volledig opgesplitst in onafhankelijke, testbare domeinmodules. Kijk eerst welke bestaande `assets/*-core.js`-modules al verantwoordelijkheid bezitten. Vermijd nog een tweede implementatie van dezelfde berekening of state.

**Aanpak per kleine PR:** afhankelijkheden expliciet maken, één zelfstandig stuk verplaatsen of duplicatie verwijderen, publieke API handhaven, gerichte test aanvullen en offline-upgrade alleen als die werkelijk geraakt wordt.

### P2 — Functionele eindcontrole en ongebruikte code

Controleer per module de daadwerkelijke gebruikersroute: taken (verlopen/herhalen), afspraken, financiële overboekingen/categorieën, notities/zoekfuncties, fitness, back-up/ZIP, PIN en instellingen. Vergelijk waar mogelijk met huidige `main`; oude voorbeeldscreenshots of oude branches zijn geen bewijs. Verwijder code/assets pas na een volledige referentiezoektocht en controle van offline cache en oudere back-upformaten.

## Werkwijze bij vervolgopdracht

1. Begin bij dan-actuele `main` en lees `AGENTS.md`. Herhaal niet steeds de volledige repository-inventarisatie.
2. Prioriteit: herstel P0 (Kenniscentrum flake), daarna echte CSS-cascade/touch-problemen en vervolgens het intern vereenvoudigen van de grote Financiën-/Leven-scripts.
3. **Eén afgebakend risico per PR.** Wijzig relevante bestaande tests in dezelfde PR; laat risicogestuurde CI automatisch kiezen.
4. Bewaar de originele browseropslag, IDs, PIN, financiële rekenregels, attachments, ZIP/herstel en mobiele weergave. Test uitsluitend fictieve geïsoleerde fixtures.
5. Merge uitsluitend na relevante groene tests en controleer de actuele `main` opnieuw. Geen onnodige dubbele testmatrices.
6. Werk **ditzelfde rapport** na een grote cleanupstap bij, in plaats van steeds nieuwe auditdocumenten te stapelen.

**Afbakening:** deze inventarisatie registreert wat is geverifieerd in GitHub-code, PR-diffs en CI-runs. Geen volledige dynamische inspectie van iedere functie of een fysieke Android-test is uitgevoerd; de complete cleanup is nog niet voltooid.
