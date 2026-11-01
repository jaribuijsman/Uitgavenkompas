# Memento — Notities & Kenniscentrum V2

**Formele productspecificatie /to-spec — concept ter goedkeuring**  
**Datum:** 1 november 2026  
**Bron:** Matt Pocock `/grill-with-docs`, acht gespreksrondes, besluiten Q1–Q62.  
**GitHub-baseline (read-only):** `jaribuijsman/Uitgavenkompas`, `main` op `02ab97a952926e56f86764e9f5ae1f9ac4a09c10`.  
**Status:** Ontwerp, geen implementatie; niet gepubliceerd naar een issue tracker, geen repositorymutaties of automatische tests uitgevoerd.

## Problem Statement

Het huidige Notities-/Kenniscentrum van Memento is op mobiel te abstract en vraagt te veel nadenkwerk bij invoeren, vinden en ordenen. De gebruiker wil de snelheid van een eenvoudige notitieapp combineren met de functionaliteit van een uitgebreid kenniscentrum. Bestaande notities, recepten, dagboekgegevens, attachments, links, tags, geschiedenis en back-ups mogen niet verloren gaan. De primaire gebruiksomgeving is een geïnstalleerde Android-PWA (Samsung Galaxy A54).

Boeken zoals *Don't Make Me Think*, *The Design of Everyday Things*, *Building a Second Brain* en *Information Architecture for the Web and Beyond* dienen uitsluitend als ontwerpbronnen, **niet** als aanleiding voor een boekenbibliotheek of leesregistratie in Memento.

## Solution

Eén geïntegreerd, local-first Notities & Kenniscentrum binnen het bestaande onderdeel Leven met:

- een persoonlijk dashboard, één prominente zoekfunctie, snelle invoer en de lokale ingangen **Overzicht / Notities / Mappen**;
- maximaal drie mapniveaus; één originele notitie met één primaire map en nul of meer extra actieve mapkoppelingen; Inbox als veilige opvangmap;
- per map bewaarde lijst-/galerij-/tabelweergave, sortering, herkenbare filters en een vrij configureerbaar dashboard;
- een visuele editor die standaard rustig is, aangevuld met een aparte ontwerpmodus, herbruikbare sjablonen en optionele extra blokken;
- afbeeldingen in notitie-inhoud, PDF-kaarten met interne lezer, tekstversievergelijking en inhoud-only herstel;
- lokale tagsuggesties en gerelateerde notities met expliciete bevestiging; AI per afzonderlijke actie optioneel en met toestemming;
- een configureerbare widgetbouwer zonder uitvoerbare gebruikerscode, met brongebonden rechten en een aangepaste mobiele bediening;
- automatische, herstelbare migratie, betrouwbare bewerking, geldige volledige en afzonderlijke back-ups, optioneel versleutelde Kenniscentrum-export;
- volledige offline werking van de gewone kernfuncties, zonder huidige synchronisatieplicht.

Het ontwerp is **geen nieuwe algemene Memento-app**, geen tweede bottomnavigatie en geen Notion-kloon.

## User Stories

1. Als gebruiker wil ik op het Kenniscentrum-dashboard direct kunnen zoeken en een notitie toevoegen, zodat ik weinig handelingen nodig heb.
2. Als gebruiker wil ik een gedachte zonder mapkeuze in Inbox bewaren, zodat ik niets vergeet.
3. Als gebruiker wil ik zien hoeveel notities nog in Inbox staan en ze snel kunnen indelen, zodat opruimen overzichtelijk blijft.
4. Als gebruiker wil ik mijn notities terugvinden via **Overzicht, Notities en Mappen**, zodat de navigatie voorspelbaar is.
5. Als gebruiker wil ik maximaal drie niveaus van mappen gebruiken, zodat ik meer structuur krijg zonder eindeloos diep te navigeren.
6. Als gebruiker wil ik dat iedere notitie één primaire map heeft, zodat het standaardpad eenduidig is.
7. Als gebruiker wil ik één notitie in meerdere mappen kunnen tonen, zodat ik niets hoef te dupliceren.
8. Als gebruiker wil ik bij het loskoppelen van de primaire map automatisch een andere actieve map als primaire locatie krijgen, met Ongedaan maken, zodat ik door kan werken.
9. Als gebruiker wil ik dat een notitie zonder normale mapkoppelingen in Inbox terechtkomt, zodat ze niet onvindbaar wordt.
10. Als gebruiker wil ik bij het archiveren van een map geen notities globaal archiveren, zodat andere mappen hun inhoud blijven tonen.
11. Als gebruiker wil ik bij het archiveren van een notitie die uit alle actieve mapweergaven verwijderen, zodat het archief consequent werkt.
12. Als gebruiker wil ik een map met inhoud via een verplaatsingsvoorbeeld kunnen verwijderen, zodat notities en submappen behouden blijven.
13. Als gebruiker wil ik dat **Alle notities** en algemene zoekresultaten een notitie slechts eenmaal tonen, ongeacht haar mapkoppelingen.
14. Als gebruiker wil ik titel-, tekstfragment-, map-, datum-, tag- en typegegevens zien bij zoekresultaten, zodat ik de juiste notitie herken.
15. Als gebruiker wil ik kunnen zoeken in alle notities en daarna filteren, zodat ik informatie niet eerst handmatig hoef te lokaliseren.
16. Als gebruiker wil ik dat iedere map haar sortering, weergave en filters onthoudt, zodat ik die niet steeds opnieuw instel.
17. Als gebruiker wil ik actieve filters altijd duidelijk kunnen zien en wissen, zodat ik geen verdwenen notities vermoed.
18. Als gebruiker wil ik op een onderwerp een uitgebreid maar ordelijk dashboard zien, zodat relevante informatie voorrang krijgt.
19. Als gebruiker wil ik de volgorde en afmetingen van widgets in een expliciete aanpasmodus wijzigen, zodat scrollen niet per ongeluk widgets verplaatst.
20. Als gebruiker wil ik op mobiel een gestapeld dashboard en aangepaste widgetbediening, zodat aanraakbediening betrouwbaar blijft.
21. Als gebruiker wil ik widgets zonder programmeercode samenstellen uit bestaande gegevens, zodat ik geen ontwikkelaar hoef te zijn.
22. Als gebruiker wil ik per widget toegang verlenen tot specifieke gegevensbronnen, zodat financiële of persoonlijke gegevens niet onbedoeld zichtbaar worden.
23. Als gebruiker wil ik direct in een visuele editor typen en opmaken, zodat ik geen opmaaksyntax hoef te onthouden.
24. Als gebruiker wil ik aanvullende blokken via een invoegmenu toevoegen, zodat de basiswerkbalk compact blijft.
25. Als gebruiker wil ik geavanceerde instellingen via **Aanpassen** openen, zodat gewone notities eenvoudig blijven.
26. Als gebruiker wil ik eigen sjablonen maken en als mapstandaard kiezen, zodat ik terugkerende notities sneller opbouw.
27. Als gebruiker wil ik nieuwe sjabloonvelden optioneel aan oude notities toevoegen, zonder ingevulde waarden kwijt te raken.
28. Als gebruiker wil ik afbeeldingen in de tekst kunnen plaatsen en PDF's vanuit een compacte kaart openen, zodat documentgebruik overzichtelijk is.
29. Als gebruiker wil ik bestaande Markdown-notities zonder conversie kunnen lezen, zodat hun inhoud behouden blijft.
30. Als gebruiker wil ik alleen na expliciete bewerkactie een gecontroleerde conversie met voorbeeld, zodat ik kan beoordelen of iets verloren gaat.
31. Als gebruiker wil ik bij niet-veilige conversie de oorspronkelijke editor kunnen gebruiken, zodat ik niet vastloop.
32. Als gebruiker wil ik automatisch opslaan én via Opslaan dezelfde veilige schrijfactie direct forceren, zodat de opslagstatus duidelijk is.
33. Als gebruiker wil ik bij een opslagfout mijn invoer houden en Opnieuw proberen of Tekst kopiëren kunnen kiezen, zodat ik niet afhankelijk ben van een onbetrouwbare browserstatus.
34. Als gebruiker wil ik bij gelijktijdig bewerken niet ongemerkt een nieuwe versie overschrijven, zodat conflicten zichtbaar worden.
35. Als gebruiker wil ik oude tekstversies vergelijken en titel en inhoud herstellen zonder actuele tags, mappen en bijlagen te veranderen.
36. Als gebruiker wil ik een duidelijke ontbrekende-afbeelding-placeholder zien als oude inhoud verwijst naar een niet-beschikbaar bestand.
37. Als gebruiker wil ik lokale tagsuggesties tijdens schrijven en bij Inboxverwerking kunnen goedkeuren, zodat ik minder handmatig beheer.
38. Als gebruiker wil ik voorgestelde relaties onderscheiden van bevestigde koppelingen, zodat algoritmische vermoedens niet als feiten verschijnen.
39. Als gebruiker wil ik per externe AI-actie expliciet toestemming geven voor de inhoud die gedeeld wordt, zodat AI nooit stilzwijgend mijn notities verwerkt.
40. Als gebruiker wil ik mijn gewone notities, mappen, sjablonen, zoeken en dashboards offline kunnen gebruiken.
41. Als gebruiker wil ik kunnen werken met honderden notities zonder een onoverzichtelijke lange lijst, zodat de eerste weergave snel en compact blijft.
42. Als gebruiker wil ik opslaggebruik kunnen zien en een waarschuwing krijgen bij weinig ruimte, zonder automatische verwijdering van gegevens.
43. Als gebruiker wil ik dat bij de eerste V2-start automatisch veilig wordt gemigreerd of veilig wordt teruggevallen naar de bestaande gegevensstaat.
44. Als gebruiker wil ik vóór het herstellen van een oudere back-up een compatibiliteitscontrole, herstelvoorbeeld en veiligheidskopie, zodat ik niet per ongeluk gegevens vernietig.
45. Als gebruiker wil ik een afzonderlijke Kenniscentrum-back-up exporteren, zodat ik mijn notities niet samen met mijn financiën hoef te verspreiden.
46. Als gebruiker wil ik optioneel een versleutelde Kenniscentrum-back-up maken, zodat ik gevoelige gegevens extern kan bewaren.
47. Als gebruiker wil ik bij het herstellen van een afzonderlijke export uitsluitend het Kenniscentrum vervangen, zodat andere Memento-onderdelen onaangetast blijven.
48. Als gebruiker wil ik toekomstige optionele synchronisatie niet uitgesloten zien, maar nu geen online afhankelijkheid krijgen.
49. Als gebruiker wil ik op mijn Android-toestel met toetsenbord open bij de editor- en opslaanknoppen kunnen, zodat ik geen tekst verlies door navigatiefouten.
50. Als gebruiker wil ik dat huidige dagboek- en receptfuncties na de upgrade blijven werken, zodat bestaande workflows niet verdwijnen.

## Implementation Decisions — productcontract en voorgestelde architectuur

### IA en navigatie

- Eén lokale Kenniscentrum-navigatie binnen Leven: Overzicht / Notities / Mappen; de bestaande appbrede navigatie blijft eigenaar van de onderste navigatie.
- Inbox is een bijzondere geldige opvanglocatie, geen excuus om notities zonder locatie te laten bestaan. Belangrijk, Recent, Archief en Alle notities zijn slimme weergaven, geen duplicerende fysieke mappen.
- Een **notitie** heeft één stabiele ID en één actuele primaire map. Aanvullende mapkoppelingen verwijzen naar diezelfde notitie-ID. Een nieuwe primaire map wordt deterministisch gekozen uit de resterende actieve koppelingen; bij geen actieve koppelingen wordt Inbox gebruikt. De keuze is met één handeling ongedaan te maken zolang de transactie nog terug te draaien is.
- Het archiveren van een map beïnvloedt alleen de zichtbaarheid van de map(hiërarchie) in de actieve mappennavigatie; bestaande notitiekoppelingen worden niet weggegooid. Een notitie kan nog via actieve andere mappen of Alle notities worden gevonden. Bij een uitsluitend gearchiveerde primaire map blijft de relatie historisch behouden; geopende context en toegankelijke navigatie vallen terug op een actieve route.
- Een notitie archiveren is globaal: zichtbaar in notitiearchief, niet in gewone actieve collecties. Het verwijderen van een mapkoppeling verschilt van een notitie naar de prullenbak verplaatsen.
- Mapverwijderwizard: behandel de volledige subtree; toon aantallen van getroffen notities en mappen, behoud overige koppelingen en voer pas na bevestiging de bedoelde verplaatsingen in één gecontroleerde wijziging uit. Bij fout: geen gedeeltelijke toestand presenteren als succes.
- Per map onthouden we presentatievoorkeuren; actieve filters tonen een duidelijk leesbare indicatie plus Wis filters. De terugknop en browsergeschiedenis behouden de geopende context.
- Een visueel dashboard is configureerbaar maar mag de vindbaarheid van de primaire actie Nieuwe notitie en de globale zoekfunctie niet aantasten.

### Editor en inhoud

- Dagelijks schrijven gebeurt in één rustige, visuele editor met compacte opmaakbalk en additioneel invoegmenu. **Aanpassen** opent een afzonderlijke ontwerpmodus. Er wordt geen tweede, concurrerende notitie-editor voor normale inhoud gebouwd.
- De visuele inhoud krijgt één gezaghebbende bronrepresentatie, versiebeheer en veilige verwijzingen naar bestanden. Er mag nooit stilzwijgend informatie worden afgeleid of weggeworpen bij opening van oude Markdown.
- Conversie naar visuele inhoud is uitsluitend op expliciete bewerkactie, voorafgegaan door een voorbeeld. Als roundtrip niet aantoonbaar verliesvrij is: broninhoud bewaren en oude editor aanbieden.
- Sjablonen zijn definities voor nieuwe notities, geen impliciete herschrijving van bestaande notities. Bij schemawijziging worden nieuwe velden alleen na expliciete toestemming in bestaande exemplaren toegevoegd; ingevulde waarden blijven onveranderd.
- PDF-documenten tonen compacte kaarten en een interne lezer; doorzoekbare PDF-tekst en annotatie per pagina zijn geen vereiste in de eerste uitvoering. Ontbrekende afbeeldingen worden zichtbaar aangeduid, zonder tekstherstel te blokkeren.
- Opslaan-knop en autosave roepen dezelfde beveiligde schrijfroute aan; het verschil is slechts de timing. Statussen moeten onderscheid maken tussen In bewerking, Opslaan, Opgeslagen, Fout en Conflict. Tijdelijke conceptopslag is geen gegarandeerde duurzame back-up.
- Inhoud-only versieherstel: titel en inhoud worden gewijzigd. Mapkoppelingen, tags en bijlagen blijven zoals ze nu zijn; ontbrekende inline bestanden tonen een placeholder. Een herstel zelf mag een nieuwe versie opleveren, zonder een onbeperkte geschiedenis te suggereren.

### Slimme functies en widgets

- Tagsuggesties werken lokaal zonder AI, zowel in editor als Inbox, en vereisen goedkeuring. Optionele AI wordt nooit automatisch aangeroepen en vraagt per actie expliciete toestemming voor de te verwerken inhoud.
- Voorgestelde relaties en bewust bevestigde koppelingen zijn afzonderlijke begrippen. Verwijderen van een suggestie verandert geen oorspronkelijke notitie.
- Widgetbouwer is declaratief/no-code en kan alleen vooraf toegestane databronnen en velden lezen; standaard Leven, Financiën uitsluitend na specifieke toestemming. Een UI-melding alleen is geen technische toegangscontrole: de datalaag moet de toegestane projecties afdwingen.
- Vrije desktopindeling en geordende mobiele projectie uit dezelfde widgetconfiguratie. Aanpassen gebeurt in een expliciete modus; mobiel gebruikt sleepgrepen en formaatkeuzes, met alternatieve bediening zonder drag.
- Gewone functies blijven local-first en offline. Geen actueel synchronisatieprotocol; data-identiteit, revisie en wijzigingsvolgorde moeten toekomstige optionele sync mogelijk houden zonder die nu te claimen.

### Gegevens, migratie en back-up

- Bewaar alle bestaande notitie-, collectie- en bijlage-IDs, dagboekvelden, checklistidentiteiten, recepten, archiefstatus, tags, gekoppelde taken, financiële gegevens en herstelroutes.
- Migratie gebeurt **automatisch** bij eerste V2-start, zonder voorafgaand toestemmingsscherm (Q57=A). Eerst niet-destructieve compatibiliteitscontrole; maak een valide herstelbare oude staat; voer de wijziging idempotent uit; valideer verwijzingen en bestandsintegriteit; activeer pas na compleet succes. Bij onvoldoende opslag of crash: oude staat intact en V2 niet activeren. Interne snapshot is geen vervanging voor een externe kopie.
- Maak de scheiding tussen metadatastaat en binaire bestanden betrouwbaar: kies een transactionele wijzigingsgrens, herstelbare referenties en één bron van waarheid. Specificeer de definitieve opslagstrategie pas na onafhankelijke schemacontrole van Leven/Financiën-integraties.
- De bestaande volledige Memento-export moet vanaf de eerste datamodelwijziging bruikbaar blijven. De aanvullende Kenniscentrum-export is separaat, bevat benodigde metadata en binaire bijlagen maar **niet** automatisch andere Leven-, Fitness- of financiële inhoud. Herstel vervangt alleen de Kenniscentrum-deelstaat na voorbeeld, compatibiliteitscheck en herstelkopie (Q41 en Q56).
- Kenniscentrum-export biedt optionele, aantoonbaar veilige versleuteling met authenticatie en wachtwoordafleiding; niet claimen dat het bestaande ZIP-formaat daarmee al compatibel is. Bij verloren wachtwoord geen fictieve terugvalbelofte.
- Detecteer onvoldoende opslag waar mogelijk preventief; verwijder nooit automatisch revisies of attachments om ruimte vrij te maken. Corrupte of verweesde bestanden blokkeren geslaagde volledige back-upclaims en moeten een expliciete herstelstatus krijgen.

### Noodzakelijke aanvullende technische definities (geen open gebruikerskeuzes)

- Referentiële integriteit: iedere actieve mapkoppeling wijst naar een bestaande map, een notitie-ID is uniek, er bestaat precies één primaire locatie of Inbox-fallback; drie mapniveaus maximaal; geen hiërarchiecycli.
- Doorzoekscope: normale zoekresultaten staan op notitie-ID, ook wanneer een notitie binnen meerdere mappen voorkomt. Bij archiefzoeken gelden afzonderlijke statusfilters.
- Toestemming: per widget kleinste gegevensscope; toestemming intrekken trekt toegang van die widget in zonder andere wijzigingen.
- Herstel en opslaan: positief succesbericht uitsluitend na geslaagde duurzame schrijfronde; bij mismatch geen 'last writer wins'.
- Nieuwe bewerkingsvormen mogen niet impliciet de betekenis van de bestaande dagboekeditor of recepten veranderen.

## Testing Decisions

### Testfilosofie

Test observeerbaar gedrag met geïsoleerde fictieve fixtures; geen echte persoonlijke browseropslag. Hergebruik bestaande domein-, opslag-, back-up- en browserregressies en de risicogestuurde CI. Test zo hoog mogelijk via bestaande domein- en browserinterfaces; introduceer geen parallelle testkern zonder aantoonbare noodzaak. Niet elk faseonderdeel rechtvaardigt de volledige browsermatrix, maar migratie of opslagwijziging is hoog risico.

### Verplicht testbewijs

1. Automatische migratie van oude JSON en ZIP met identieke IDs, alle velden en binaire bestanden; herhaal dezelfde migratie zonder duplicatie; simuleer crash/opslagtekort halverwege en controleer rollback.
2. Drie mapniveaus, verplaatsen van subtrees, kringdetectie, dubbele namen, archiveren en herstellen van ouders.
3. Eén notitie in drie mappen: wijzig in map A, lees in B, unieke algemene zoekhit, correcte tellingen, primaire herkeuze en Inbox-fallback.
4. Map archiveren versus notitie archiveren, gearchiveerde primaire map, verwijderwizard bij gedeelde notities, terugdraaiing na fout.
5. Browser-terug, Android-terug, deep-linkachtige navigatie, toetsenbord open, focus, sticky header, scroll, korte viewport, lang label, lege mappen en geen-resultatenstatus.
6. Editorconversie met lange en ongewone Markdown, checklists, links, escaped tekst en bestaand dagboek/recept; geen stille corruptie.
7. Inhoud-only revisieherstel en ontbrekende inline afbeelding; tags, bestanden en mapkoppelingen onveranderd.
8. Gelijktijdige tabbladen, mislukte autosave, expliciete opslag, onbeschikbare opslag, concept-hervatten en conflictvergelijking.
9. Volledige Memento- en afzonderlijke Kenniscentrum-export; correct manifest, hashes, ontbrekend bestand, fout wachtwoord, tampering, verkeerde versie, selectie van vervangingsscope en herstel met archiefstatus.
10. Widgettoegang per bron, intrekken toestemming, ongeoorloofde financiële velden, geen arbitraire gebruikerscode; AI verstuurt geen inhoud vóór expliciete opt-in.
11. Offline herladen van geïnstalleerde PWA, kernnavigatie, zoekresultaten, editor, sjablonen en widgets; geen externe scripts afhankelijk voor normale werking.
12. Prestatie- en UX-fixtures met 0, 1, 50, 500+ notities, veel mappen, grote bijlagen en 20 widgets. Resultaten worden gemeten, niet verzonnen.
13. Browserbreedtes 393px eerst, 360/412 bij wraprisico, desktop 1280 voor layout; 48×48 CSS-px voorkeur voor nieuwe primaire touchacties en minimaal bestaand 44×44; echte A54-/TalkBack-/toetsenbordcontrole separaat als **niet getest** tot uitgevoerd.

### Acceptatiecontract voor het prototype

Vergelijk drie uiterlijke ordeningen op exact dezelfde fictieve dataset en dezelfde werkstromen. Gebruik één zelfstandige HTML-prototypepagina, wissel via `?variant=a|b|c` en een vaste variantenkiezer. Geen opslag, server of echte GitHub-actie. Laat gebruikersstatus na interactie zien. Varianten: A Dashboard-first, B Structure-first, C Search-first. Gevraagde praktijktaken: zoek, snelle invoer, Inbox verwerken, map openen, meerdere koppelingen herkennen, widgetindeling aanpassen, een notitie openen en statusveranderingen controleren. **De prototypekeuze verandert uitsluitend presentatie, niet de 62 functionele besluiten.**

Meet bij echte gebruikerstests voor dezelfde taken: handelingen, tijd en fouten, plus subjectieve duidelijkheid; geen prestatieclaims uit een statisch prototype afleiden. Vraag daarna om de voorkeursvariant en concrete aanpassingen. Geen productcode voordat het prototype is goedgekeurd.

## Out of Scope

- Boekenbibliotheek, boekvoortgang, leestool, EPUB-reader of vergelijkbare boekenfeatures.
- Realtime/cloudsync, accountsysteem of samenwerking tussen meerdere gebruikers in de eerste V2-uitvoering.
- Verplichte AI, stille externe AI-analyse, automatische categorisering zonder bevestiging.
- Vrije HTML/JavaScript-widgets met onbegrensde Memento-datatoegang.
- Volledig PDF-OCR/tekstextractie, paginagebonden annotaties en een zware onderzoeksreader in de eerste uitvoering.
- Een nieuwe algemene navigatie voor Memento of ongevraagde wijzigingen aan Financiën, PIN, Agenda, taken en Fitness.
- Directe productie-implementatie, GitHub-issuepublicatie, branch, pull request, merge, commit of deployment in deze stap.

## Domain Glossary (concept voor toekomstige CONTEXT.md)

| Canonieke term | Betekenis |
|---|---|
| Kenniscentrum | Het geïntegreerde lokale onderdeel voor verzamelen, maken, ordenen en terugvinden van persoonlijke notities en documenten. |
| Notitie | Eén inhoudsobject met stabiele identiteit, onafhankelijk van het aantal mappen waarin het verschijnt. |
| Primaire map | De standaardlocatie van een notitie binnen de actieve structuur; er is steeds precies één primaire locatie of Inbox. |
| Extra mapkoppeling | Een tweede of volgende verwijzing naar dezelfde notitie, geen kopie. |
| Inbox | Een geldige opvanglocatie voor snel gemaakte of nog niet ingedeelde notities. |
| Map | Benoemde collectie van notities en maximaal twee onderliggende mapniveaus. |
| Slim overzicht | Berekenbare weergave zoals Recent, Belangrijk of Alle notities, zonder het notitieobject te dupliceren. |
| Notitiearchief | Status waarbij de notitie globaal uit actieve verzamelingen verdwijnt, maar herstelbaar blijft. |
| Maparchief | Status die de mapnavigatie verbergt zonder de globale notitiestatus te wijzigen. |
| Sjabloon | Herbruikbare structuur met configureerbare velden voor nieuwe notities. |
| Widget | Configureerbaar dashboardonderdeel dat uitsluitend toegestane gegevens kan tonen. |
| Toestemming | Expliciet verleend recht aan een widget of AI-actie om een afgebakende gegevensbron te gebruiken. |
| Revisie | Bewaard historisch inhoudsmoment, niet automatisch een volledige oude toestand inclusief actuele bestanden en relaties. |
| Concept | Bewerkte maar nog niet met succes duurzaam opgeslagen inhoud. |
| Kenniscentrum-export | Een export die de gesloten verzameling van Kenniscentrum-data en haar benodigde bijlagen bevat. |

## Architectural Decision Records — voorgestelde ADR's, nog niet gepubliceerd

**ADR-01 — Eén notitie, meerdere mapkoppelingen.** Kies stabiele notitie-identiteit en primaire + extra koppelingen boven kopiëren van inhoud. Dit voorkomt divergentie tussen mappen en maakt deduplicatie in zoeken mogelijk. Impact: migratie, tellingen, zoeken, archive/delete en back-upreferenties. Belangrijk alternatief: virtuele smart collections zonder echte mapkoppelingen; verworpen omdat Q15 expliciet meerdere maplidmaatschappen vereist.

**ADR-02 — Local-first, automatische beschermde migratie.** Gewone bewerkingen blijven offline; V2 migreert pas na integriteitscontrole en herstelbare voorgaande staat. Alternatief: directe in-place herschrijving of verplichte bevestiging, niet gekozen vanwege gebruikersbesluit Q57=A en dataveiligheidsvereisten.

**ADR-03 — Behoud Markdown, één gezaghebbende inhoudsbron.** Nieuwe visuele editor mag oude representaties niet stilzwijgend herschrijven. Alternatief: alle notities op upgrade convertieren; verworpen wegens risico op onomkeerbare opmaakfouten.

**ADR-04 — No-code widgets met afgebakende gegevensprojecties.** Vrije vormgeving, zonder vrije uitvoerbare code. Alternatief: plugincode die rechtstreeks opslag leest; verworpen wegens privacy en isolatie.

**ADR-05 — Gescheiden herstelgebieden.** Volledige Memento-back-up blijft; Kenniscentrum-export bevat alleen Kenniscentrumdata en noodzakelijke bijlagen. Herstel mag Leven/Financiën buiten Kenniscentrum niet vervangen. Alternatief: elke export als volledige app-snapshot; verworpen wegens privacy en onverwachte neveneffecten.

## Phasing and Release Gates

| Fase | Scope | Gate |
|---|---|---|
| 0 — Ontwerpvalidatie | Specificatie, drie interactief vergelijkbare prototypes | Gekozen variant en expliciete gebruikersgoedkeuring |
| 1 — Gegevensbasis | Veilig datamodel, migratie, drie niveaus, mapkoppelingen, integriteit, compatibiliteit volledige back-up | Herstel/rollback en belangrijke Leven-regressies aantoonbaar groen |
| 2 — Dagelijks gebruik | Dashboard, zoeken, filters, Inbox, navigatie, mobiele bediening, grote collecties | Dagelijkse flows en offline gebruik werken |
| 3 — Editor en sjablonen | Visuele editor, blokken, PDF-kaart/lezer, afbeeldingen, versievergelijking, sjablonen | Oude Markdown/dagboek/recepten en bestandsintegriteit behouden |
| 4 — Slim en aanpasbaar | Widgets, dashboards, rechten, lokale tags en relaties | Gegevensscope-test, mobiel widgetbeheer, geen verplichte AI |
| 5 — Extra export en V2-vrijgave | Afzonderlijke export, optionele encryptie, optionele AI, afwerking en releasecontrole | Gehele contract geaccepteerd; geen ongeteste veiligheidsclaims |

**Kritische afhankelijkheid:** de bestaande volledige ZIP-back-up moet al in fase 1 compatibel zijn met het nieuwe datamodel. Een aanvullende afzonderlijke Kenniscentrum-export kan later volgen.

## Decision Registry — 62 vaste gebruikersbesluiten

| Ronde | Antwoorden |
|---|---|
| 1 | Q1=B · Q2=A · Q3=C · Q4=C · Q5=B |
| 2 | Q6=B · Q7=A · Q8=B · Q9=B · Q10=A · Q11=C · Q12=C |
| 3 | Q13=C · Q14=B · Q15=B · Q16=B · Q17=B · Q18=B · Q19=B · Q20=B |
| 4 | Q21=A · Q22=C · Q23=B · Q24=C · Q25=B · Q26=A · Q27=C · Q28=A |
| 5 | Q29=B · Q30=B · Q31=B · Q32=C · Q33=B · Q34=B · Q35=A · Q36=A |
| 6 | Q37=A · Q38=B · Q39=B · Q40=A · Q41=B · Q42=B · Q43=A · Q44=B · Q45=B |
| 7 | Q46=A · Q47=A · Q48=B · Q49=A · Q50=A · Q51=A · Q52=A · Q53=A · Q54=B |
| 8 | Q55=B · Q56=A · Q57=A · Q58=A · Q59=B · Q60=B · Q61=B · Q62=B |

## Further Notes

- Deze specificatie onderscheidt **gebruikersbesluiten** van **technische voorstellen**. Eventuele keuzes over exacte transactietechniek, editorbibliotheek, ZIP-crypto of gegevensindexering zijn implementatiedetails en worden pas op de passende technische grens vastgesteld.
- Er is in de geraadpleegde main-boom geen `CONTEXT.md`/`CONTEXT-MAP.md` of gepubliceerde ADR-map aangetroffen. De conceptbegrippen en ADR's staan daarom uitsluitend in dit document, niet in de repository.
- Het Matt Pocock `/to-spec`-proces kent publicatie naar issue tracker als vervolgstap. Dit is bewust **niet uitgevoerd**, omdat de gebruikersopdracht expliciet read-only GitHub voorschrijft.
- Een werkend prototype toont interactie en informatiearchitectuur, maar valideert geen transacties, beveiliging, echte Android PWA of datamigratie. Gegevens en acties daarin zijn fictief.
- Broncodebasis: `assets/memento-knowledge-core.js`, `assets/memento-knowledge.js`, `assets/memento-backup.js`, `docs/knowledge.md`, `docs/notes-direction-c-20261030/README.md`, `AGENTS.md` en de lokale feature-architect/Android-UX-skills op genoemde commit.
