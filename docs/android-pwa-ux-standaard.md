# Memento — Android-first PWA-ontwerp- en acceptatiestandaard

Status: vaste projectwerkwijze voor **alle** onderdelen van Leven en Financiën. De actuele goedgekeurde Memento-ontwerpen, `02_DESIGN_SYSTEM` en specifieke gebruikersbesluiten bepalen het product; deze standaard bewaakt de kwaliteit van implementatie. Een guideline is geen toestemming om een reeds goedgekeurd ontwerp stilzwijgend te vervangen.

## Bronnen: Android-principes, correct vertaald naar Memento PWA

Android Developer UI-design is referentie voor **gedrag, ergonomie, hiërarchie, toegankelijkheid en consistente navigatie**. De app is een HTML/CSS/JS-PWA, geen Kotlin/Jetpack Compose-app. Gebruik dus web-API's, CSS `env(safe-area-inset-*)`, viewportmetingen en semantische HTML in plaats van native Android API's of nieuwe dependencies te kopiëren.

Officiële bronnen (controleer relevante versie en toepassing bij nieuw ontwerp, niet iedere kleine CSS-patch):
- Navigatie & action hierarchy: https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- Responsive/adaptive layouts: https://developer.android.com/design/ui/mobile/guides/layout-and-content/adapt-layout
- Toegankelijkheid (contrast, iconlabels, alternatieve bediening): https://developer.android.com/design/ui/mobile/guides/foundations/accessibility
- Aanraakdoelen: https://developer.android.com/guide/topics/ui/accessibility/apps
- Systeemranden / laatste scrollitem: https://developer.android.com/develop/ui/views/layout/edge-to-edge
- Systeem- en keyboard-insets (native concepten; vertaal naar web): https://developer.android.com/develop/ui/views/layout/insets
- PWA-standalone context: https://web.dev/learn/pwa/installation

## Visuele uitgangspunten

1. **Memento blijft Memento.** Bosgroen, salie, warme accenten, eigen illustraties, rustige typografie en bestaande tokens/kaarten; Android-richtlijnen sturen UX, niet een volledige Material 3-restyle.
2. **Primaire actie is ondubbelzinnig.** Hoogstens één dominante actie per taakcontext; secundaire acties dichtbij hun inhoud, zeldzame of destructieve acties in een herkenbaar overflow-/beheermenu. Niets verwijderen of verbergen zonder een bereikbare route.
3. **Navigatie volgt taakniveau.** Primaire Memento-navigatie, tabs voor gelijkwaardige inhoud, contextuele bovenbalk voor bewerken, terug/annuleren met conceptbehoud; vermijd vier permanente navigatielagen en dubbel werkende knoppen.
4. **Aanraakbaar en leesbaar.** Nieuwe of gewijzigde mobiele primaire bediening richt zich op minimaal 48×48 CSS-px als praktische webvertaling van 48 dp. Bestaande 44×44 px blijft de expliciete minimale projectgrens; maak geen kleinere nieuwe targets. Check werkelijke hitbox, 200% zoom/tekstvergroting, focus, labels, kleurcontrast (4,5:1 voor gewone tekst als doel, 3:1 voor UI-indicatoren waar van toepassing), tekstafbreking en voldoende ruimte.
5. **Schermruimte hoort bij inhoud.** Toetsenbord, statusbalk, camerauitsparing, systeemgebaar, bottom-nav en native filechooser mogen geen controls of opgeslagen inhoud afdekken. Geen horizontale overflow of schermbrede megaknoppen zonder functie. Laat de laatste regel/actie boven de navigatie bereikbaar zijn.
6. **Geen gestoorde pointer-events.** Maak sticky/fixed elementen zichtbaar en contrastrijk, met correcte stapeling en ruimte voor klikdoelen; controleer browser-hit-testing, niet enkel `isVisible()`. Verplaats geen problemen met `force: true`, willekeurige delays, onnodige `!important` of transparante overlays.
7. **Toegankelijk zonder uitsluitend gebaar.** Swipe heeft knoppen/andere bediening als alternatief. Werkende Android-terugroute, Escape waar relevant, focusherstel na dialogen, semantische formuliervelden en statusmeldingen.

## Het vaste ontwerp → code → bewijscontract

Per **inhoudelijk gewijzigde tab of editor**, vóór code:
- Leg de bron vast: actuele `main`, bestaande component/CSS-eigenaar, eerdere goedkeuring, relevante gegevens/handlers en schermtoestanden. Noteer maximaal 8 concrete acceptatiecriteria.
- Maak een interactief prototype met dezelfde Memento-stijlen en echte gebruiksroutes. Een screenshot of prototype alleen bewijst de productieversie niet.
- Maak een routekaart: **eis → productie-HTML/JS/CSS → browserhandeling → screenshot/meting**. Dek bestaande varianten en acties af, inclusief opslaan, cancel, navigeren, openen/sluiten, scrollen en fout/lege/lange toestanden voor zover geraakt.
- Implementeer zo gericht mogelijk op een branch. Hergebruik eigenaars en componenten; geen extra handlers, CSS-overrideketens, onnodige dependency of wijziging van gegevensmodellen.
- Test eerst klein lokaal indien tooling beschikbaar, daarna exact één CI-plan voor het PR-head-SHA. CI-groen ≠ visueel goedgekeurd. Bewaar relevante browserartifacts ook bij groen, beoordeel voor/na in dezelfde fixture/viewport/toestand.
- Bij grotere mobiele UI-wijzigingen: 393px standaard, 360/412px bij wrappen/overflowrisico, korte hoogte/IME bij editors en vaste bediening, desktopbreedte bij responsieve ingrepen. Test ook een langere bestaande notitie/document, niet alleen een leeg nieuw formulier.
- Vóór merge: **(a)** passende tests groen, **(b)** alle goedgekeurde eisen terug te vinden in code, **(c)** screenshotvergelijking acceptabel, **(d)** geen regressie in opslag/financiën/PWA, **(e)** alleen met merge-autorisatie. Na merge controleer PR en productie-assets apart; PWA op fysieke A54 blijft expliciet NIET GEVERIFIEERD zolang niet getest.

## Zelfverbeterende foutafhandeling — geen eindeloze herhaallus

Bij iedere onverwachte CI-fout, implementatieafwijking of toestelmelding:
1. **Leg de feiten vast:** exact commit, reproducerende route, viewport, verwacht/werkelijk resultaat, log/screenshot. Markeer `AFGEKEURD` voor een echte afwijking. Een groene test op een andere pagina is geen bewijs voor dit scherm.
2. **Classificeer:** app-defect, test-/selectordrift, tijd/scrollflakiness, cache/assetversie, onjuiste fixture, ontoereikend acceptatiecontract of nieuwe productbeslissing. Raad niet zonder bewijs.
3. **Controleer of de fout ook op de PR-basis bestaat.** Een bestaande fout blijft een fout, maar mag niet worden toegeschreven aan de huidige diff zonder vergelijking. Een documentatie-PR mag niet heimelijk de UI repareren.
4. **Los de directe oorzaak op binnen scope,** of maak een afzonderlijke, nauw afgebakende blokkade-PR met concrete eigenaar. Versterk de kleinste relevante regressietest of acceptatiecriteria zodat precies dit defect voortaan wordt ontdekt.
5. **Nooit** tests uitschakelen/versoepelen, `force`-klikken, willekeurige sleeps, broad cleanup, databestanden resetten of `main` forceren om groen te bereiken. Herhaal geen volledige CI-run zonder code- of evidenceverandering.
6. **Rapporteer de sluiting van de lus:** oorzaak, code/test/werkwijze die zijn gewijzigd, verificatie, nog open risico, head-SHA, PR/merge en wat op het echte toestel ontbreekt. Als bewijs ontbreekt: `NIET GEVERIFIEERD`.

## Risicobeheersing

Niveau 1: lokale kleur/icoon/tekst, één gerichte controle. Niveau 2: gewijzigde schermindeling/knoppen/scroll/dialog, domeinroute plus visuele toestanden. Niveau 3: opslag, transacties, beveiliging, worker-lifecycle, brede UI-ingrepen, en gewijzigde CI-workflow: volledige relevante veiligheidscontrole. Een klein onderdeel van één tabblad is géén vrijbrief om andere appdelen opnieuw te testen.

**Definitie van gereed:** gevraagd ontwerp aantoonbaar in werkelijke app aanwezig, primaire en secundaire acties bereikbaar, geldige test- en beeldbewijzen, geen bekende blokkende regressie en expliciete release-status. Niet slechts `green CI`, niet slechts `PR gemaakt`.
