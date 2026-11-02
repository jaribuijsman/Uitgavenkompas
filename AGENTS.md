# Memento — agentcontract en router

Geldt voor GPT via GitHub, Codex, Work en andere agents. De recente expliciete gebruikersopdracht en hogere instructies gaan voor. Handel geautoriseerde opdrachten volledig af, maar wijzig, merge of publiceer niet zonder de bijbehorende toestemming. Lees alleen de relevante verdieping uit bestaande skills; geen verplichte dubbele instructieronde.

## 1. Bronnen en beslisregels

- **Feitelijke werking:** actuele main-SHA, werkelijk betrokken code en tests. Een historische audit, oud chatantwoord of document is geen runtimebewijs.
- **Gewenste werking:** recent expliciet gebruikersbesluit. Een precies goedgekeurd prototype is bindend voor zijn visuele én interactionele scope, binnen veiligheids- en toegankelijkheidsgrenzen.
- **Productcontext:** [docs/product/README.md](docs/product/README.md) routeert naar 01_MASTERPLAN (principes), 02_DESIGN_SYSTEM (vormgeving), 03_BESLUITEN_EN_ROADMAP (besluiten) en 04_HISTORISCHE_BESLUITENAUDIT (alleen historisch). Lees alleen relevante passages.
- **Technische uitvoering:** dit bestand, gerichte [skills](.agents/skills/), [Android-PWA UX-standaard](docs/android-pwa-ux-standaard.md), tests/ci-plan.cjs, tests/ci-groups.cjs en .github/workflows/app-review.yml.
- **Technische werkpakketten:** [docs/TECHNISCHE_ROADMAP.md](docs/TECHNISCHE_ROADMAP.md). Eén expliciet gekozen fase per opdracht; een plan alleen is geen implementatieautorisatie.
- **Conflicten:** onderscheid gewenste werking, bewezen actuele werking en verouderde documenten; meld een materieel conflict zonder zelf een nieuwe gebruikersbeslissing te verzinnen.

## 2. Eén uitvoerpad voor iedere agent

1. Onderscheid uitleg/onderzoek, ontwerp, prototype en expliciete implementatie. Ontwerp of design-PR verandert geen applicatiecode zonder opdracht.
2. Inspecteer één keer actuele main, de betreffende component, eigenaar, handlerketen, diffafhankelijkheden en maximaal de relevante skills. Geen volledige repoherlezing.
3. Stel maximaal **acht acceptatiecriteria** vast. Bestaande helpers/handlers en CSS-eigenaar hergebruiken; geen parallelle editor, dubbele state, extra dependency of nieuwe overrideketen voor kleine wijzigingen.
4. Reproduceer een defect en scheid regressie, bestaande bug, testdrift en omgevingsfout. Repareer de oorzaak; laat een ongerelateerde blokkade afzonderlijk zien.
5. Voer de kleinst passende lokale test uit, bundel correcties in één samenhangende push en laat de centrale PR-gate de feitelijke diff beoordelen. Start geen dubbele domeinworkflows.
6. Bij rode CI: inspecteer specifieke test/job/log; geen blind rerunnen, force-clicks, skip of afgezwakte assertions om groen te fabriceren.
7. Controleer vóór merge de PR-head tegen de dan actuele main. **Merge/publicatie uitsluitend na expliciete autorisatie, passende groene checks en toepasselijke visuele acceptatie.**
8. Controleer na geautoriseerde merge de echte PR/merge-SHA, GitHub-status, deployment en live assetverwijzingen. Lever compact bewijs met run-ID, niet-geteste punten en restrisico; noem geen fictieve checks.

## 3. Bindend prototype en Android-PWA

- **Bevries de goedgekeurde referentie vóór implementeren.** Bewaar toegankelijke versieerbare HTML-/screenshots, bron van goedkeuring en benoemde toestanden. Ontbreekt het exacte prototype, reconstrueer niet op gevoel en claim geen 1-op-1-fideliteit.
- Map zichtbare onderdelen, actiehiërarchie, knoppen en gedrag **na acties** op echte bestaande routes, opslag en handlers. Behoud editorvarianten (gewone tekst en gestructureerde inhoud), bronlinks, validatie, menu's, velden, lege/fouttoestanden, scroll, sticky/bottom-nav en bijlagen.
- Vergelijk goedgekeurd prototype en echte PR-head **met dezelfde fictieve fixture**, 393px viewport, scrollpositie, open sheet en interactiestaat. Gebruik de bestaande domeinbrowserjourney, concrete geometrie en screenshots ook na groen. Alleen een click, count of isVisible bewijst geen juiste layout.
- Materiële ontwerpafwijking = **visueel AFGEKEURD**, ook bij groene CI. Niet gemaakt bewijs of ontbrekende referentie = **visueel NIET GEVERIFIEERD**. Vraag expliciet akkoord voor een noodzakelijke wezenlijke afwijking; beperkte raster-/fontsmoothingverschillen zijn toegestaan.
- De [Android-PWA UX-standaard](docs/android-pwa-ux-standaard.md) geldt voor alle tabbladen. Memento is Android-first en wordt geïnstalleerd op Samsung Galaxy A54: let op tekst, veilige marges, tikgebieden, scroll/overlay, toetsenbord en laatst bereikbare actie.
- Projectminimum aanraakvlak **44×44 CSS-px**; bij nieuwe primaire bediening streven naar 48×48. Standaard een gerichte **393px** browserroute; extra 360/412px, korte viewport, keyboard of standalone **alleen bij concreet risico**.
- Bij scherm-/editorwijziging: test ook geopende menu's/dialogen, midden/einde scroll en relevante alternatieve documentvariant. Bewaak visuele vergelijkbaarheid met exacte PR-head artifacts vóór merge. Chromium-emulatie is **geen fysieke A54- of TalkBack-test**.
- De uitgebreide prototypepoort is niet verplicht bij documentatie-only of louter geïsoleerde tekst-, kleur- of icooncorrecties; gerichte controle blijft wel verplicht voor de werkelijk geraakte UI.

## 4. Tests, gegevensveiligheid en privacy

- **Niveau 1:** kleine lokale CSS, tekst, icoon of documentatie; diff/syntax/stijleigenaar. Voor visuele wijziging één 393px-rooktest. **Documentatie-only: geen browserjourney.**
- **Niveau 2:** bestaande UI-interactie, klein modulegedrag, gedeelde CSS; gerichte core-/domeintest en echte browserroute, met voor/na-beeld waar uiterlijk wijzigt.
- **Niveau 3:** opslag, beveiliging/PIN, financiële berekening, service-worker-lifecycle, grote inline wijzigingen of planner-HIGH-module; de volledige toepasselijke releasecontrole met zes parallelle browsergroepen en door planner vereiste opslag-/upgrade-/offlinechecks.
- **De planner beslist:** tests/ci-plan.cjs plus tests/ci-plan-regression.cjs zijn de bindende technische risicoselectie. Downgrade niet op taaknaam. assets/memento-life-app.js mengt UI en persistentie en blijft hoog risico tot afzonderlijk bewezen veilige modularisering met negatieve veiligheidstests.
- **Nooit echte gegevens verliezen:** transacties, bedragen, taken, afspraken, notities, IDs, gekoppelde bijlagen, back-ups, categorieën, overboekingen, PIN, ZIP-herstel en offline opslag blijven intact. Alleen een expliciet goedgekeurde, geteste migratie mag opslagcontracten veranderen.
- Gebruik uitsluitend geïsoleerde fictieve fixtures. **Privacy:** geen echte persoonlijke/medische/financiële gegevens, adressen, sleutels, tokens of vertrouwelijke screenshots in de publieke repository, PR of CI-artifacts.
- Bij veranderde offline-assets: index.html-versieparameters en sw.js CORE/precache/cacheversie consistent houden. Wijzig de worker-lifecycle niet voor een zuivere CSS-reparatie.
- **Postmerge-snelpad uitsluitend met bewijs:** tests/ci-postmerge.cjs moet de juiste PR, exacte succesvolle definitieve app-review-head, gewone/squash-merge én identieke Git-tree aantonen. Ontbreekt dat bewijs, dan geldt de normale risicomatrix. Directe pushes en handmatige full runs worden niet afgewogen.
- Bij ontbrekende browser-/shelltoegang: lokale check **NIET GEVERIFIEERD** rapporteren; GitHub-CI mag niet als lokale test gepresenteerd worden.

## 5. Verantwoordelijkhedenmatrix — één primaire bron

| Onderwerp | Primaire eigenaar |
| --- | --- |
| Bronhiërarchie, autorisatie, veiligheids- en visuele poort | **AGENTS.md** |
| Productbesluiten/ontwerp/historie | **docs/product/README.md** en relevante 01/02/03/04 |
| Android, keyboard, touch, hit-testing en viewport | [.agents/skills/android-ux-inspector/SKILL.md](.agents/skills/android-ux-inspector/SKILL.md) |
| CSS-eigenaar en visuele componentconsistentie | [.agents/skills/design-system-guardian/SKILL.md](.agents/skills/design-system-guardian/SKILL.md) |
| Nieuwe functies en requirements-to-code | [.agents/skills/feature-architect/SKILL.md](.agents/skills/feature-architect/SKILL.md) |
| Code-audits, duplicatie en veilige refactor | [.agents/skills/code-auditor/SKILL.md](.agents/skills/code-auditor/SKILL.md) |
| CI-risicokeuze en negatieve safetyregressie | [.agents/skills/smart-regression/SKILL.md](.agents/skills/smart-regression/SKILL.md) en tests/ci-plan.cjs |
| Release, artifacts, postmerge, deployment | [.agents/skills/release-guardian/SKILL.md](.agents/skills/release-guardian/SKILL.md) en tests/ci-postmerge.cjs |
| Eén voortgangsbestand voor technische fasen | [docs/TECHNISCHE_ROADMAP.md](docs/TECHNISCHE_ROADMAP.md) |

Lees alleen de relevante bestaande skills, ook wanneer de cloudcatalogus leeg is; handmatig lezen is niet hetzelfde als automatische skillactivering. [docs/agent-efficiency.md](docs/agent-efficiency.md) is voortaan **niet normatief**.

## 6. Oplevering en grenzen

- **GESLAAGD** = bewezen volgens relevante checks; **NIET GEVERIFIEERD** = ontbrekend bewijs; **AFGEKEURD** = bewezen resterend defect of materiële prototypeafwijking.
- Rapporteer exacte PR/head/merge/CI, visuele status, dataveiligheid, eventuele rollback en productie-/device-status. Groene browser-CI bewijst geen echte A54 of geüpdatete geïnstalleerde PWA.
- Pas productbesluitenbestanden alleen aan bij een wezenlijk nieuw besluit. Laat historische audits intact. Werk de technische roadmap alleen bij voor de gekozen fase en gebruik geen tweede voortgangsbestand.
