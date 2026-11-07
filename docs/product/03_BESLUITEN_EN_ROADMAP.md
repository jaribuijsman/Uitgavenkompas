# Memento — besluiten, status en roadmap

**Versie:** **2.0**, 31 oktober 2026 (historische D01–D30 vastgesteld in v1.0). **Status:** op basis van beschikbare historische projectcontext gereconstrueerd en met de bestaande v0.1-kennisbasis vergeleken. **Geen gegarandeerd volledige inventaris van alle losse chats.** Lees `04_HISTORISCHE_BESLUITENAUDIT.md` voor bewijskracht, historische verschillen en resterende lacunes.

> **Memento Projectkennis 2.0 — 31 oktober 2026**  
> Dit is een herzien kennisdocument, geen instructie om GitHub te wijzigen. Productbesluiten uit versie 1.0 blijven gelden als historische beslisgegevens, niet als automatisch geverifieerde implementaties.  
> **Bronhiërarchie:** actuele expliciete gebruikersopdracht → actuele GitHub `main` en `AGENTS.md` voor techniek/werkelijke code → recent expliciet goedgekeurd ontwerp voor gewenst gedrag → dit document voor productcontext → historisch archief.  
> **Efficiëntie:** laad alleen de passages die een taak nodig heeft. Alle test-, branch-, publicatie- en PWA-procedures volgen de huidige [AGENTS.md](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/AGENTS.md) en relevante `.agents/skills/` op GitHub; deze kennisdocumenten voegen geen tweede verplichte controleworkflow toe.  
> GitHub-referentie bij revisie: `4e17ba69389df9394975b517da2cc725953270a0` (31 oktober 2026), uitsluitend tijdsopname; controleer `main` opnieuw bij implementatie.  

## Nieuw productbesluit — 7 november 2026: Boodschappen / Voorraad

**Status: BESLOTEN; implementatiecontrole via de gekoppelde PR, niet automatisch live.** Binnen Boodschappen komt de vierde subtab **Voorraad** naast Mijn lijst, Producten en Aankopen. Voorraad gebruikt de bestaande gewone boodschappencatalogus als bron: een product kan meerdere afzonderlijke voorraadregels hebben (bijvoorbeeld geopende en ongeopende verpakkingen). Per regel zijn bewaarlocatie (koelkast, vriezer, voorraadkast), numerieke hoeveelheid en eenheid, notitie, openingsdatum, invriesdatum en houdbaarheidsdatum optioneel/beheerbaar. De bestaande beveiligde Leven-opslag en back-ups nemen de optionele voorraadgegevens mee zonder sleutel-/versiewijziging.

**Gedragsgrens:** handmatig toevoegen, bewerken, verbruiken en verwijderen; vanuit een bestaande gewone boodschap of aankoop kan men expliciet voorraad toevoegen en vanuit voorraad opnieuw op de boodschappenlijst plaatsen. Afvinken van boodschappen zet **niet automatisch** voorraad bij: dat zou een onbetrouwbaar aantal opleveren. Eenmalige receptingrediënten blijven buiten de voorraad en worden na afvinken op de bestaande manier verwijderd. Een product met geregistreerde voorraad kan niet stilzwijgend naar Aankopen worden verplaatst. Bestaande Producten, Aankopen en de Notion-import blijven intact.

**Houdbaarheid:** de app toont alleen een subtiele datumwaarschuwing, geen ingestelde pushmeldingen en geen automatische voedselveiligheidsclaim. Werkelijk veilige bewaartijd na openen moet de gebruiker controleren aan de hand van verpakking/productinformatie. De implementatie wordt visueel getoetst tegen bestaande Super Dark-stijl op mobiel; er bestaat voor deze functie geen apart als 1-op-1 goedgekeurd HTML-prototype.

## Actualisering ontwikkelworkflow — 31 oktober 2026

De volgende **technische documentatie** is in GitHub `main` aangetroffen op de revisiedatum: zes repositoryskills (`release-guardian`, `smart-regression`, `design-system-guardian`, `code-auditor`, `feature-architect`, `android-ux-inspector`), een taakgerichte router in `AGENTS.md`, en risicogestuurde PWA/A54-instructies. Deze aanwezigheid bewijst **geen automatische skillregistratie in Codex** en geen fysieke Android-test. Codex kan op een `work`-branch opereren terwijl `main` de bron van waarheid blijft. De eerdere generieke Base Environment startte buiten de repository en maakte skilldetectie onzeker; selecteer voor Memento de gekoppelde Uitgavenkompas-omgeving waar mogelijk. Raadpleeg technische details voortaan in `AGENTS.md` en skills in plaats van ze in deze roadmap te dupliceren.

**Statusregels:** een historische SHA of assistentclaim is geen actuele deploymentverificatie. D01–D30 en oude verificatievragen blijven bewaard als historisch bewijs, met ongewijzigde oorspronkelijke statusclaims. Nieuwe updates moeten expliciet bewijs bevatten voordat een oude status als 'aangetoond' wordt opgewaardeerd.

## Nieuw expliciet besluit — 2 november 2026: bindende prototypefideliteit

**Status: BESLOTEN voor het ontwikkelproces, NIET GEVERIFIEERD als reeds geïmplementeerde UI.** De gebruiker heeft bevestigd dat een expliciet goedgekeurd interactief HTML-prototype bij implementatie zo nauwkeurig mogelijk één-op-één als visueel en interactioneel contract moet gelden, voor **ieder Memento-tabblad**. Geen vrije herinterpretatie naar generieke Android- of oude design-systeemlayouts; technische/toegankelijkheidsconflicten uitsluitend minimaal oplossen en wezenlijk afwijkende vormgeving apart laten goedkeuren. Werk dit af met dezelfde-schermtoestand screenshots van prototype versus echte app, echte acties en een harde visuele PR-acceptatie. Groen functioneel CI zonder visuele vergelijking is niet genoeg. Zie `AGENTS.md` en `02_DESIGN_SYSTEM.md`.

**Geselecteerde referentie voor de toekomstige Kenniscentrum-editoruitvoering:** door de gebruiker in dit gesprek op 2 november 2026 aangeleverd `memento-kenniscentrum-prototype.html`, SHA-256 `8fe95983290fb8f63c080932530a763eb9f628d97ff6156183bbce329b84b837`. De bron bevat echte persoonlijke gezondheidsgerelateerde voorbeeldtekst en is daarom **niet** rechtstreeks in de publieke repository opgenomen. Vóór een toekomstige implementatie moet dezelfde HTML-versie beschikbaar zijn voor de uitvoerende agent, of een gecontroleerd geanonimiseerde maar visueel/interactioneel gelijkwaardige, versieerbare referentie worden gemaakt. Het huidige verzoek betreft **alleen de procesregels**, niet de daadwerkelijke Kenniscentrum-herbouw. De eerdere, losser interpreteerbare prototype-naar-codepraktijk vervalt; lopende code wordt niet automatisch als conform aangemerkt.

## 1. Statuswoorden

- **Besloten:** de gebruiker heeft het gewenste gedrag expliciet gekozen; dit bewijst geen technische voltooiing.
- **Aangetoond in repo:** commit/bron toont implementatie of reparatie; actuele runtime/echte telefoon kan aanvullend onderzoek nodig hebben.
- **Te verifiëren:** eerdere feedback of verslag kan verouderd zijn; geen opdracht om automatisch nieuwe code te schrijven.
- **Voorstel:** idee, prototype of plan zonder definitieve implementatietoestemming.
- **Niet uitvoeren:** expliciet uitgesloten of vervangen voorstel, tenzij gebruiker dat herroept.
- **Tijdelijke scope:** beperking voor één fase/patch; geen universeel verbod op een functie.
- **Conflicterende geschiedenis:** meerdere expliciete beslissingen in verschillende fasen; neem niet stilzwijgend één technische interpretatie aan.
- **Oplevering onbekend:** gebruiker gaf implementatieopdracht, maar actuele commit/runtime is niet aangetoond.

## 2. Besluiten en aantoonbare geschiedenis

| Onderwerp | Status | Beschrijving / bewijsspoor |
| --- | --- | --- |
| Bron van waarheid | Besloten | Verifieer actuele `main` vóór iedere taak; repo `AGENTS.md` bevat technische eisen. |
| Gegevensveiligheid | Besloten en technisch vastgelegd | Behoud keys/IDs/schema's, ZIP/bijlagen, financiële juistheid, bestaande functies en PIN; test offline upgrade. [AGENTS.md](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/AGENTS.md). |
| Stabilisatie vóór uitbreiden | Besloten | Eerst dubbele CSS/JS, inconsistenties en regressies oplossen, niet telkens extra override-lagen toevoegen. |
| Hoofdscherm Financiën | Besloten | Focus op transacties, uitgaven en categorieën; budgetten in eigen onderdeel. |
| Overboekingen | Aangetoond in eerdere commit, actueler resultaat verifiëren | Inkomende interne overboeking telt als rekeningmutatie, niet als externe inkomen in totaaloverzichten; voorkom dubbeltelling. Historische SHA `52ac8c2` (28 oktober). |
| Achterstallige taken | Besloten, eerder geïmplementeerd | Blijven standaard zichtbaar in 'Nog te doen — eerder gepland' met oorspronkelijke datum/relatief te laat. Niet dupliceren of automatisch verplaatsen. [Patch-evidence](https://github.com/jaribuijsman/Uitgavenkompas/tree/main/docs/patches-001-002-004). |
| Mijn dag: taken als afspraken | Aangetoond in meest recente bekende commit | 30 oktober commit `667577354f980232df195dd135cf4639b7811ad4`: taken volgen compacte indeling van afspraken. Controleren in de echte app blijft zinvol. |
| Notitiebanners | Aangetoond in commit | 30 oktober commit `83461b9e0dfa6fce9e61b38834dd1b45cbaba211`: herstel full-width illustraties en CSS-conflict; check op mobiele runtime. |
| Mobiele glaseffecten | Aangetoond in commits | 29 oktober dure blur verwijderd; scrollprestaties verbeteren zonder dat fysieke FPS is bewezen. `0da3f963`, `86a6efd9`. [Rapport](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/glass-performance-20261029/README.md). |
| Data-/UI-herstel | Aangetoond in commit | 29 oktober `7503b542`: recovery met kern-/browser-/PWA-acceptatie, voortbouwend op de repo-documentatie. |
| Fitness | Besloten + aangetoond in repo | A/B/C-split: borst/triceps, rug/biceps, benen/schouders/buik; circa 45 min, flexibel rond diensten; vorige sets/actieve training behouden. [fitness.md](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/fitness.md). |
| Gezondheid / Samsung Health | Besloten en deels aangetoond | Handmatige invoer met herkenbare bronstatus; geen onbevestigde live koppeling. Slaapdatum hoort bij wakker-word-datum. App-status herverifiëren. |
| Leven-lijsten | Besloten | Boodschappen, Aankopen en Aankoopwensen afzonderlijk houden; favorieten, bestaande invoer en Slim Kopen-koppeling behouden. |
| Startschermweer | Besloten voor eerder ontwerp | Rustige, compacte weerkaart en warme dynamische bosidentiteit behouden; daadwerkelijke live weerbron voor actuele verwachting afzonderlijk testen. |
| Beveiligings-/PIN-ontwerp | Te verifiëren | Vroegere gesprekken over een visueel nieuw start-/PIN-scherm en PIN zonder functie kunnen botsen met het technische behoudcontract. Geen beveiligingswijziging aannemen; huidige UI/config en nieuwste expliciete toestemming inspecteren. |
| Google Agenda | Te verifiëren | Idee voor een compact verbindingspictogram onder/naast afrondingen. Beschouw niet als verbonden zonder echte autorisatie en API-verificatie. |

## 3. Openstaande verificatievragen: geen automatische bouwopdracht

1. **Nieuwe mobiele taak- en afspraakrijen:** controleer de implementatie uit 30 oktober op 360/393/412 CSS-px en echt toestel; checkbox optisch klein en toch goed aanraakbaar.
2. **Notitiebanners:** bevestig of alle oorspronkelijke afbeeldingen op actuele PWA inclusief cacheupdate correct schalen.
3. **Historische UX-audit:** hercontroleer vroegere afwijkingen (Agenda-informatiehiërarchie, Aankoopwensen, Analysefilters, Budgetten, Slim Kopen-stappen) tegen huidige `main`. De audit van 29 oktober is een tijdsopname; niet blind overnemen.
4. **Fysieke Samsung Galaxy A54 5G:** echte toetsenbord-, systeemterugknop-, scroll-, TalkBack-, installatie-, PIN- en vergrendelingstests zijn in genoemde oude rapporten niet gedaan. Verifieer vóór afsluiten van betrokken issues.
5. **Externe koppelingen:** Google Agenda, actuele weerdata, externe AI/microfoondiensten en Samsung Health niet als integraal getest presenteren zonder concrete succesvolle end-to-end-gegevens.
6. **Historische dekking:** veel oudere projectgesprekken zijn gericht doorzocht, maar een complete export-/titelinventaris ontbreekt. Vóór massaal verwijderen van oude chats moeten eventuele nog niet doorzoekbare gesprekken worden geëxporteerd of doorgelicht. Zie `04_HISTORISCHE_BESLUITENAUDIT.md`.

## 4. Huidige werkplanning (geen automatische implementatieopdracht)

- Kleine wijziging: actuele `main`, betreffende component en relevante skill; daarna de beperkte risicogestuurde controle uit `AGENTS.md`.
- Brede verandering of opslagrisico: expliciet acceptatiecontract, geïsoleerde tests, relevante browser-/migratiecontrole en bewijs vóór publicatie.
- Groot projectonderzoek: raadpleeg pas dan historische PR's, alle beslisregisters en de oude UX-audit.
- Deze roadmap geeft geen toestemming om nieuwe functies of oude patchvoorstellen zelfstandig uit te voeren.

## 5. Wijzigingslogsjabloon

Gebruik bij ieder nieuw gebruikersbesluit:

- Datum + exact onderwerp
- Type: besloten / voorstel / niet uitvoeren / aangetoond / te verifiëren
- Gewenst gedrag + expliciete uitsluitingen
- Bron: gesprek, commit, PR, rapport, screenshot
- Betrokken modules en risico's
- Laatste geverifieerde main-SHA
- Testbewijs en publicatiestatus
- Wat vervalt van de vorige afspraak

## 6. Belangrijke technische referenties

- [Actuele repo](https://github.com/jaribuijsman/Uitgavenkompas)
- [Recente commit — taken op Mijn dag](https://github.com/jaribuijsman/Uitgavenkompas/commit/667577354f980232df195dd135cf4639b7811ad4)
- [Bannerherstel](https://github.com/jaribuijsman/Uitgavenkompas/commit/83461b9e0dfa6fce9e61b38834dd1b45cbaba211)
- [Masterplan eindrapport](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/masterplan-final-report.md)
- [Audit 29 oktober](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/visual-audit-20261029.md)
- [Kenniscentrum implementatie](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/knowledge-v2.md)


## 7. V1.0 — expliciet teruggevonden beslissingen

De datums zijn de datums van de oorspronkelijke keuze, niet de datum waarop code is bewezen. Geen privétransactiebedragen opgenomen in dit duurzame register. Alle implementatiestatussen blijven onder voorbehoud van actuele code-/runtimecontrole.

| ID | Datum | Status | Concreet besluit / grens |
| --- | --- | --- | --- |
| D01 | 24–28 okt | Besloten | Centrale maandselectie in Financiën; extra lokale filters blijven. Hoofdoverzicht = transacties, uitgaven, categorieën; Budgetten apart; voorkeur drie doorveegbare grafieken. |
| D02 | 23–28 okt | Besloten | Persoonlijk en Gezamenlijk afzonderlijk; saldo/inkomsten/uitgaven per rekening inzichtelijk; interne transfer telt voor rekeningmutatie, niet als nieuwe externe inkomsten/consumptie-uitgaven. |
| D03 | 28 okt | Besloten | Creditcard als betaalwijze/transactietype, niet als derde bankrekening. Uitgestelde betaling en eventuele dubbeltelling nog apart technisch onderzoeken. |
| D04 | 23–29 okt | Besloten | Aanwijzer/toewijzing gescheiden van bankrekening; categorie, subcategorie en aanwijzer blijven bij elke transactieroute bereikbaar, inclusief quick-entry. |
| D05 | 28 okt | Besloten | Transactiesplits alleen na expliciete keuze; standaard geen splits (historisch `splits: null`); geen automatische splitsingsrijen. |
| D06 | 28 okt | Besloten | Aankoop/wens/dossier koppelen mag optioneel; **Gekocht** maakt nooit vanzelf een financiële transactie. |
| D07 | 28 okt | Besloten | Roosterpatroon `OOMMVNNVVV` vanaf 28-10-2026; O 06–14, M 14–22, N 22–06, V vrij. Tien dagen cyclisch herhalen. |
| D08 | 25–29 okt | Besloten | Google Agenda-gegevens alleen lezen; lokale afspraken niet terugschrijven. Afvinken van Google-afspraak is lokale Memento-status. |
| D09 | 25 okt | Besloten, later vereenvoudigd | Niet-afgevinkte afspraken blijven met oorspronkelijke datum zichtbaar; later compactere Mijn dag-layout zonder verlies van acties. Verifiëren tegen huidige interpretatie. |
| D10 | 29 okt | Besloten | Achterstallige taken standaard in uitgeklapte sectie met originele datum en 'te laat'; aparte dagtelling; geen automatische verplaatsing of dagelijkse duplicatie. |
| D11 | 28 okt | Besloten | Geen automatisch toegekende taakprioriteiten; gebruiker kiest zelf. |
| D12 | 30 okt | Besloten; gedeeltelijk aangetoond | Taken op Mijn dag exact als afspraken indelen met datum i.p.v. tijd; bewerken/afvinken bereikbaar. GitHub-commit `6675773` is aangetoond, fysieke weergave niet. |
| D13 | 30 okt | Besloten; oplevering onbekend | Google Agenda-pictogram tussen diensttijd en '+ Afspraak'; oude link onder Afgeronde afspraken laten vervallen mits functionaliteit behouden. Er was implementatieopdracht, maar geen bewezen live-commit binnen teruggevonden gesprek. |
| D14 | 29 okt | Besloten; gemelde uitvoering | Daglijn als startscherm, Lichtinval/Nieuw Glas, snelle acties Taak/Notitie/Transactie via bestaande editors; historische commit `910e0d4` genoemd, actuele rendering niet zelfstandig getest. |
| D15 | 29 okt | Besloten (beperkte scope) | Compacte weerkaart op het openingsscherm voorlopig ongemoeid; ontwerpen voor Agenda en taken daaronder zijn afzonderlijk te beoordelen. |
| D16 | 25–28 okt | Besloten | Dagboek schrijven eerst, reflectie optioneel; groot tekstvlak, autosave, versiegeschiedenis en betrouwbare opslagstatus behouden; direct bereikbaar via startscherm. |
| D17 | 29 okt | Besloten; gemelde uitvoering | Slaap van een nacht over twee kalenderdagen hoort bij de **ontwaakdatum**, ook bij ploegendienst; handmatige gezondheidsvelden, Samsung Health niet stilzwijgend als gesynchroniseerd presenteren. |
| D18 | 26–27 okt | Besloten; deels gemeld geïmplementeerd | Kenniscentrum local-first, hoofdverzameling **Levenspad**, één subniveau, verplaatsen/ordenen zonder ID-verlies; PDF/beelden/volledige ZIP-back-up. Synchronisatie later, niet automatisch actief. |
| D19 | 27 okt | Besloten; gemelde uitvoering | Centrale illustratiekiezer, bestaande en eigen illustraties, categoriebeeldkeuze; geen betaalde AI-API zonder toestemming. |
| D20 | 27 okt | Besloten; gemelde uitvoering | Snelle notities met typ- en spraaktranscriptie, bewerkbaar vóór opslag, Inbox-route; 'Mijn dag' in die ene patch niet wijzigen. |
| D21 | 25 okt | Besloten; gemelde uitvoering | Boodschappen, Aankopen en Aankoopwensen gescheiden; compacte invoer, favorieten, gekocht-status en Slim Kopen-actie bij Aankopen. |
| D22 | 26–29 okt | Besloten + tijdelijke scope | Fitness A/B/C, circa 45 min en flexibel rond diensten; eerdere sets/historie behouden. De afzonderlijke uitrol van 29 okt beperkte nieuwe Fitness-functionaliteit tot trainingafsluiting. |
| D23 | 25–29 okt | Conflicterende geschiedenis | Automatische PIN-timer (25 okt) → standaard PIN uit (27 okt) → handmatig vergrendelen met PIN, Doorgaan op dagoverzicht (28 okt) → veiligheid en PIN-tests behouden (29 okt). Runtime/config testen vóór wijziging. |
| D24 | 26–28 okt | Besloten | Bestaand warm bos, zes illustraties en weers-/dagdeeleffecten, Beverwijk/Open-Meteo en december-/kerstvariant. Weersbron en echte mobielprestaties afzonderlijk verifiëren. |
| D25 | 27–29 okt | Besloten | Eerst herstel en CSS/JS-consolidatie, geen nieuwe conflicterende lagen; gegevens, IDs, achterliggende functionaliteit en assets veilig. Vóór publicatie aantoonbare mobiele en regressietests. |
| D26 | 28 okt | Besloten | Vijf beheersbare implementatiefasen; belangrijke wijziging traceerbaar via oorspronkelijke behoefte, code, testresultaat en indien nuttig voor-/na-beelden. De volledige gekozen patchselectie verdient bronaudit. |
| D27 | 29 okt | Eenmalige scope, niet generiek | Patchopdracht **#001/#002/#004 wel**, **#003/#005 niet**; alleen voor die specifieke run. Geen automatische regel voor alle latere ontwikkelopdrachten. |
| D28 | 29 okt | Tijdelijke scope | Fase 2 specifiek: Fitness-trainingafsluiting, Wensen en Boodschappen; Fase 3 specifiek: Slim Kopen en Geldcoach, **zonder transactienotities**. Reeds afgeronde patch niet opnieuw zonder vraag uitrollen. |
| D29 | 28 okt | Besloten | Centrale zoekfunctie voorlopig op notities/taken met type, verzameling en context; **Financiën uitgesloten**. |
| D30 | 30 okt | Besloten | Kennisbasis na historische besluitenaudit naar gecontroleerde v1.0; versies bewaren, projectdocumenten vervangen na download/upload en oude chats pas opschonen wanneer dekking is beoordeeld. |

## 8. Openstaande conflicten en niet-bewijsbare voltooiing

| Onderwerp | Laatst bekende wens | Wat ontbreekt voor een harde conclusie |
| --- | --- | --- |
| PIN / doorgaan / timer | Handmatig vergrendelen mogelijk; behoud PIN- en opslagveiligheid; warme bosweergave | Huidige configuratie en echte PIN-/PWA-/inactiviteitspaden op apparaat. Oude 15-minutenkeuze mag niet automatisch heringevoerd worden. |
| Google Agenda-pictogram | Compact verbinden/opnieuw verbinden tussen diensttijd en + Afspraak | Vervangende connect-/reconnect-flow, zichtbare status, volledige live-commit en Android-interactie. |
| Financieel creditcardmodel | Twee bankrekeningen, creditcard als betaalwijze, geen dubbele verplichting | Alle opslagmigraties, geboekte/uitgestelde bedragen en invloed op totale uitgaven. |
| 25 pagina's UX-review en 21 patchpunten | Gebruiker selecteerde inhoud per onderdeel, uitsluitingen en vijf-fasen-aanpak | Volledige woordelijke lijst van geselecteerde F-/I-/patchitems; voor sommige onderdelen zijn alleen fragmenten teruggevonden. Geen automatische uitvoering. |
| Recente herontwerpideeën Mijn dag | Zeer rustige, nieuwe UI zonder overbodige kaarten | Definitieve visueel gekozen variant ontbreekt; eerdere preview niet als toestemming tot vervangen behandelen. |
| Exacte historische chatdekking | Geen definitief besluit verloren vóór opschonen | Volledige export of inventaris met alle chatnamen/gespreksinhoud ontbreekt; v1.0 kan niet beweren 100% van de chats gecontroleerd te hebben. |

## 9. Volgende onderhoudsstap

Wanneer nieuwe bewijsstukken beschikbaar komen: vergelijk elk document/gesprek met D01–D30, voeg uitsluitend echt nieuwe keuzes toe, noem welke oude keuze vervalt en houd desnoods aparte **verval-/conflictrecords** aan. Voor implementatiewerk altijd opnieuw GitHub `main`, PR's, tests, lokale opslagcontracten en runtime onderzoeken. **Deze v1.0-documentwijziging geeft geen toestemming om GitHub of productie te wijzigen.**