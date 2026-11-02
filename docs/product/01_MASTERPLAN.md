# Memento — centraal masterplan

**Documenttype:** blijvende productkennis (**versie 2.0**, 31 oktober 2026; oorspronkelijke basis 30 oktober).  
**Repository:** https://github.com/jaribuijsman/Uitgavenkompas  
**Status:** gecontroleerde consolidatie van de beschikbare eerdere projectgesprekken, drie voorgaande kennisbestanden, projectrapporten en read-only GitHub-check; **niet bewezen dat elke afzonderlijke oude projectchat is ingezien**. Zie `04_HISTORISCHE_BESLUITENAUDIT.md` voor reikwijdte, lacunes en conflicten.  
**Historische nulmeting (v1.0):** `667577354f980232df195dd135cf4639b7811ad4` op 30 oktober 2026. Niet als actuele `main` gebruiken.

> **Memento Projectkennis 2.0 — 31 oktober 2026**  
> Dit is een herzien kennisdocument, geen instructie om GitHub te wijzigen. Productbesluiten uit versie 1.0 blijven gelden als historische beslisgegevens, niet als automatisch geverifieerde implementaties.  
> **Bronhiërarchie:** actuele expliciete gebruikersopdracht → actuele GitHub `main` en `AGENTS.md` voor techniek/werkelijke code → recent expliciet goedgekeurd ontwerp voor gewenst gedrag → dit document voor productcontext → historisch archief.  
> **Efficiëntie:** laad alleen de passages die een taak nodig heeft. Alle test-, branch-, publicatie- en PWA-procedures volgen de huidige [AGENTS.md](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/AGENTS.md) en relevante `.agents/skills/` op GitHub; deze kennisdocumenten voegen geen tweede verplichte controleworkflow toe.  
> GitHub-referentie bij revisie: `4e17ba69389df9394975b517da2cc725953270a0` (31 oktober 2026), uitsluitend tijdsopname; controleer `main` opnieuw bij implementatie.  

## 1. Doel en bronhiërarchie

Memento is een persoonlijke Android-first PWA voor dagelijkse planning, agenda, taken, financiën, kennis/notities, leven, boodschappen, aankoopwensen, fitness en verwante functies. Het doel is één samenhangende, snelle, betrouwbare applicatie in plaats van een opeenstapeling van losstaande functies.

1. Systeem- en veiligheidsinstructies en de actuele expliciete gebruikersopdracht.
2. Huidige GitHub-code, tests, bestaande `AGENTS.md` en controleerbare actuele runtime voor **feitelijk gedrag**.
3. Actueel expliciet vastgesteld gebruikersbesluit en laatst goedgekeurd design voor **gewenst gedrag**.
4. Projectinstructies en deze gecontroleerde kennisbasis voor de standaardwerkwijze.
5. Oudere chats, prototypes, rapporten en PR-beschrijvingen als historische aanwijzingen, niet als automatisch geverifieerde feiten.

Bij conflict: noem het conflict; achterhaal welke beslissing recenter en expliciet is en verifieer de code. Een screenshot is bewijs van die opname en toestand, niet van de hele app. Zeg nooit dat een onderdeel af is uitsluitend omdat een vorige assistent dat beweerde.

## 2. Duurzame productprincipes

- Eenvoudige, samenhangende Android-first PWA; geen onnodige nieuwe routes, CSS-lagen of afwijkende formulieren.
- Alle bestaande financiële gegevens, opslagidentiteiten, back-ups, links, notities en offline functionaliteit blijven veilig.
- Bestaande functionele invoervelden blijven bereikbaar, ook bij compacte snelle invoer.
- Maak onderscheid tussen *besloten ontwerp*, *zichtbare broncode*, *uitgevoerde test* en *geverifieerde productie*.
- **Technische uitvoering:** zie de actuele `AGENTS.md` en taakgerichte repositoryskills. Herhaal de processtappen, testmatrix, GitHub-autorisatie en opleverformaten niet hier; die zijn daar de bron van waarheid.

## 3. Onderzoek versus uitvoering

Een brainstorm of ontwerp is geen opdracht om GitHub te wijzigen. Bij expliciete implementatie: inspecteer `main` en alleen relevante bronnen, volg de risicogestuurde controles van `AGENTS.md` en rapporteer uitsluitend aantoonbaar uitgevoerde verificaties. Een kleine wijziging vereist geen volledige historische audit of alle vier kennisdocumenten.

## 4. Bestaande architectuur: uitgangspunten, geen onbeperkt contract

Volgens de actuele `AGENTS.md` hebben domeinmodules eigenaarschap van data en beveiligde opslag; `memento-ui.js` behandelt viewport/notices, `memento-ui.css` gedeelde bediening, glass het materiaal en layout de bestaande leesvolgorde. De repo gebruikt o.a. `index.html`, `assets/`, `tests/`, `docs/` en `sw.js`. De werkelijke actuele modulegrenzen moeten bij een wijziging opnieuw onderzocht worden.

**Echte toestelcontrole blijft nodig:** browseremulatie op 360/393/412 CSS-px is niet hetzelfde als testen op een Samsung Galaxy A54 5G met systeemtoetsenbord, Android-terugknop, TalkBack, PWA-installatie, vergrendeling en batterij/GPU-gedrag. Het repo-eindrapport erkent deze lacune.

## 5. Hoofdgebieden van Memento

- **Mijn dag / Daglijn:** datum, roostercontext, compacte afspraken, taken (ook achterstallige), dagboekactie, snelle invoer en overzicht zonder onnodige dubbelingen.
- **Taken / Agenda:** begrijpelijke status, kleine visuele checkbox met volwaardig tikvlak; agenda-/takenindeling consistent; Google Agenda niet als verbonden beschouwen zonder werkelijk bevestigde koppeling.
- **Financiën:** echte inkomsten/uitgaven onderscheiden van interne transfers, rekeningmutaties, saldi, creditcardverplichtingen en budgetten. Transacties, uitgaven en categorieën staan in het financiële hoofdscherm centraal; Budgetten blijft een eigen onderdeel.
- **Kenniscentrum / Notities / Dagboek:** verzamelingen, zoekbaarheid, IDs/relaties, concept- en bewaartoestand, bijlagen en back-up; bestaande notitie- en taaklinks in stand houden.
- **Leven:** boodschappen, aankopen en aankoopwensen blijven onderscheiden; Slim Kopen en Geldcoach gebruiken bestaande duurzame gegevens en koppelingen.
- **Fitness:** training/routines/setregistratie, behoud van historie, doelrange, vorige prestatie, herstel en opslagfoutgedrag.
- **Gezondheid / diensten:** waar van toepassing handmatige invoer en expliciete bronstatus; geen verzonnen Samsung Health-integratie of ongeteste externe synchronisatie.
- **Start-/PIN-scherm:** definitieve branding/bosillustraties en bestaande PIN-status/opslag respecteren; een ontwerpvoorstel is niet automatisch een beveiligingswijziging.

## 6. Bronnen en onderhoud

Primaire interne bronnen in `main`:

- [AGENTS.md](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/AGENTS.md)
- [Masterplan eindrapport](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/masterplan-final-report.md)
- [Masterplan implementatie](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/masterplan-implementation.md)
- [Visuele audit 29 oktober](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/visual-audit-20261029.md)
- [Glasontwerp-implementatie](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/app-glass-implementation.md)
- [Kenniscentrum V2](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/knowledge-v2.md)
- [Fitness](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/fitness.md)

Onderhoud het besluit-/roadmapdocument bij een **wezenlijk nieuw of gewijzigd productbesluit**; niet bij iedere cosmetische patch. Verander geen historische testsuccessen achteraf. Upload een nieuwe documentversie naar ChatGPT-projectbronnen als er inhoudelijk iets wijzigt; deze bestanden synchroniseren niet vanzelf met GitHub of ChatGPT-projectbestanden. Controleer bij wijzigingen ook de kruisverwijzingen met `02_DESIGN_SYSTEM.md`, `03_BESLUITEN_EN_ROADMAP.md` en `04_HISTORISCHE_BESLUITENAUDIT.md`.


## 7. Geconsolideerde functionele contracten (historisch vastgesteld in v1.0)

Deze eisen zijn afkomstig uit expliciete gebruikerskeuzes uit eerdere projectgesprekken. Het woord **besloten** betekent hier *gewenst gedrag*; het bevestigt **niet** dat de huidige `main` dit volledig implementeert.

### 7.1 Planning, Agenda en Mijn dag

- Roosterreferentie: **28 oktober 2026**, repeterend patroon **O O M M V N N V V V** (10 kalenderdagen). O = **06:00–14:00**, M = **14:00–22:00**, N = **22:00–06:00** op de volgende kalenderdag, V = vrij. Gebruik lokale datums en houd rekening met middernacht; test de hele cyclus.
- Persoonlijke taken, lokale afspraken en waar bevoegd Google Agenda-afspraken op het dagoverzicht weergeven, maar geen lokale afspraak ongemerkt naar Google schrijven. De eerder gekozen Google-koppeling is **alleen-lezen**. Google-afspraak afvinken in Memento betekent een *lokale* afrondstatus, geen terugschrijven naar Google.
- Niet-afgevinkte afspraken behouden hun oorspronkelijke datum en moeten volgens de eerdere gebruikerskeuze ook op volgende dagen terugvindbaar blijven onder Vandaag; controleer hun huidige gedrag apart van taken.
- Verlopen geplande taken blijven zichtbaar met oorspronkelijke datum en vertraging, zonder automatische datumverschuiving of duplicatie; dagtelling onderscheidt vandaag gepland en achterstallig.
- Gebruiker bepaalt prioriteiten zelf: **geen automatische prioriteitstoekenning**. De gebruiker kan een taak afronden, heropenen, verplaatsen of verwijderen met behoud van semantiek.
- Op Mijn dag geldt een latere precieze UI-keuze: taakregels krijgen dezelfde compacte vierdelige indeling als afspraakregels (afvinken, datum/tijdzone, inhoud, Bewerken). Het afzonderlijke tabblad Taken wordt hierdoor niet automatisch herontworpen.
- Dagboek is toegankelijk via een directe ingang op het startscherm; eerdere opdracht verwijderde de *dubbele Dagboekknop op Mijn dag*, niet de functie. De voormalige dubbele weerkaart op Mijn dag mocht alleen weg als het startscherm een betrouwbare weerkaart heeft.

### 7.2 Financiën

- Het financiële **hoofdscherm** draait om transacties, uitgaven, categorieën, maandcontext en grafieken; Budgetten heeft een apart onderdeel. Er was expliciete voorkeur voor drie doorveegbare grafieken.
- Primaire rekeningtypen in het gewenste model: **Persoonlijk** en **Gezamenlijk**. **Creditcard** is een betaalwijze/transactietype, geen derde bankrekening; de afhandeling van uitgestelde betaling en dubbele boeking vereist aparte verificatie.
- Een inkomende interne overboeking telt bij de bijschrijvingen/rekeningmutaties van de ontvangende rekening, maar telt **niet** als nieuwe externe inkomsten voor totaal- of categorieanalyses. Uitgaande transfer mag niet dubbel als consumptie-uitgave worden verwerkt. Saldi, financiële periode en transactierichting blijven consistent bij rekening- en maandwissel.
- Een centrale maandselectie bepaalt de standaardperiode van de financiële tabbladen; aanvullende filters blijven per scherm mogelijk. Onderzoek het huidige gedrag alvorens filters te veranderen.
- Een uitgavetoewijzing/aanwijzer (persoonlijk, partner of gezamenlijk) is een ander begrip dan de gekozen bankrekening. Behoud daarnaast categorie, **subcategorie**, betaalwijze, omschrijving, bedrag en overige bestaande transactiegegevens in alle invoerpaden.
- Transactiesplitsing is **volledig optioneel**: pas regels aanmaken na een expliciete keuze **Splitsen**, gewone transacties blijven ongesplitst (`splits: null`, voor zover dit nog de actuele datarepresentatie is). Maak geen ongevraagde splits.
- De actie **Gekocht** in Aankopen/Aankoopwensen mag **niet automatisch** een financiële transactie creëren. Bestaande relaties tussen aankoop, dossier, budget en historie mogen niet ongemerkt verloren gaan.

### 7.3 Leven, Kenniscentrum, Dagboek en Fitness

- **Boodschappen**, **Aankopen** en **Aankoopwensen** blijven onderscheiden; Aankopen kan een expliciete route naar Slim Kopen bieden. Producten, aantallen, favorieten, gekocht-status en bestaande historie blijven behouden.
- Kenniscentrum is **local-first**, met duurzame IDs, verzamelingen en maximaal één subniveau waar die beperking van toepassing is. **Levenspad** is de expliciet gekozen naam van de hoofdverzameling. PDF's, afbeeldingen, eigen illustraties, categoriehernoeming/-rangschikking en de volledige ZIP-back-up blijven werkend. Voorbereid op latere synchronisatie betekent **niet** dat synchronisatie al actief is.
- Snelle notities kunnen via typen of expliciet ingeschakelde spraaktranscriptie naar de Inbox; transcriptie is eerst bewerkbaar en wordt niet zelfstandig bewaard of naar derden verzonden. Externe ChatGPT-/AI-hulp is gebruikersgestuurd en mag niet stilzwijgend een betaalde API aanroepen.
- Dagboek: **schrijven eerst**, reflectie optioneel, groot/meegroeiend tekstvlak, autosave en versiegeschiedenis behouden, bij opslagfout geen schijnbevestiging. Voor slaap over twee datums is de datum **van wakker worden** leidend, ook bij nachtdienst. Gezondheidswaarden zijn handmatig vast te leggen met herkenbare bron; Samsung Health is niet automatisch verbonden.
- Fitness: schema **A borst/triceps, B rug/biceps, C benen/schouders/buik**; doel spieropbouw/sterker worden, circa 45 minuten, flexibel rond de ploegendienst. Behoud actieve sets, vorige prestaties en trainingshistorie. Een tijdelijke scopekeuze op 29 oktober beperkte een bepaalde fase tot **trainingafsluiting**; dat is geen algemene toestemming alle overige fitnessonderdelen uit te breiden.

### 7.4 Beveiliging en toegang: geschiedenis is geen opdracht

- Op 25 oktober werd een automatische PIN-vergrendeltimer geaccepteerd; op 27 oktober volgde expliciete uitschakeling van het standaard PIN-scherm; op 28 oktober werd een open start-/dagoverzicht met **Doorgaan** en **alleen bewuste handmatige vergrendeling** gekozen. Op 29 oktober is expliciet geëist dat de **PIN-beveiliging en de tests niet verzwakt** worden. Deze uitingen staan in verschillende ontwikkelfasen.
- Behandel de laatste combinatie als *ontwerpintentie*: het standaard startscherm mag zonder PIN bereikbaar zijn zolang de gebruiker dat zo heeft ingesteld, maar handmatig vergrendelen en de bestaande PIN-/opslagbeveiliging mogen niet worden vernield. **De precieze huidige runtime en eventuele automatische timer zijn niet end-to-end geverifieerd**. Niet stilzwijgend opnieuw instellen of uitschakelen.
- Het visuele open-/PIN-scherm en de beveiligingslogica zijn aparte verantwoordelijkheden: behoud bosschermen, logo, dagweer en animaties zonder hun aanwezigheid als bewijs van beveiliging te zien.

## 8. Afbakening en projectonderhoud (v1.0)

- Een chat met het verzoek *ontwerp, voorbeelden, onderzoek of vergelijking* autoriseert **geen GitHub-wijziging**. Een eerder voor een afgebakende taak gegeven publicatietoestemming is geen algemeen mandaat voor nieuwe taken. De laatste expliciete opdracht over de betreffende scope gaat voor.
- Een **goedgekeurd ontwerp** verschilt van een **goedgekeurde implementatie**, die weer verschilt van een **bewezen functionele implementatie**. Voor alle drie staat in het besluitregister een apart spoor.
- Het concept met **42 schermen/234 functies** en de 25-pagina's tellende UX-review zijn referentiemateriaal, geen opdracht om de volledige voorstellenlijst uit te voeren. De geselecteerde patchcodes uit oktober zijn niet allemaal volledig uit de beschikbare gespreksfragmenten reconstrueerbaar; details moeten vóór nieuwe bouwbesluiten uit oorspronkelijke bronnen worden geverifieerd.
- Verwijder oude projectchats pas na expliciete inventarisatie van chatnamen en bewijsexport. De beschikbare terugzoekfunctie leverde relevante historische fragmenten maar **geen complete, controleerbare lijst van alle projectgesprekken**; versie 1.0 is daarom op inhoud gecontroleerd, **niet uitputtend qua chatdekking**.
- Bij conflict registreer: oorspronkelijk besluit, latere correctie, laatst geldige afbakening, ontbrekend runtimebewijs en benodigde verificatie. Vul geen lacunes met aannames.