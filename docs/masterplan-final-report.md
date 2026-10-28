# Memento — eindrapport masterplan 1.0

Uitvoering van het geautoriseerde masterplan van 28 oktober 2026, rechtstreeks op `main`. Technisch vertrekpunt: `52ac8c2f120b97769e26a8fb7f2ec1735ea7c0c9`. De vijf implementatiefasen zijn uitgevoerd. De functionele wijzigingen zijn gebouwd en lokaal getest; de hieronder expliciet genoemde fysieke en gebruikerstests zijn niet uitgevoerd. Publicatiebewijzen staan onderaan en worden na de laatste deployment ingevuld.

Live-app: <https://jaribuijsman.github.io/Uitgavenkompas/>. Het [bewijsdossier per fase](masterplan-implementation.md) beschrijft oorspronkelijke fouten, code, gegevensimpact en uitgevoerde controles. [Browseracceptatie](masterplan-evidence/phase5/report.json), [voor/na-metingen en echte PWA-upgrade](masterplan-evidence/phase5/journeys/report.json) en screenshots zijn in de repository opgenomen. Alle testgegevens zijn fictief en gebruikt in afgescheiden browserprofielen; de persoonlijke browseropslag van de eigenaar is niet gebruikt.

## Functionele eisen

| Eis | Resultaat en controle |
|---|---|
| M01 | Compact Mijn dag, directe dagboekdag, uitklapbare volgende dagen en eerder geplande taken. Weer, gedachte, microfoon, afspraken, agenda en training blijven bereikbaar. Gevalideerde dienstbadge; geen automatische prioriteitswijziging. Mobiele browsercontrole op drie breedtes. |
| M02 | Taak/notitie via bestaande quick capture met zichtbare bestemming; geen verplichte titel en geen identieke titel/body-weergave. Fout bewaart invoer. Opgeslagen inhoud heropend en vergeleken. |
| M03 | Deadline, kleine stappen en afronden/heropenen direct in taakdetail. IDs, stapmetadata en historie behouden; herladen en geen duplicaten gecontroleerd. |
| M04 | Eén actie naar vandaag, groeiend schrijfveld en schrijfstand; metadata optioneel, overzicht met compacte bosillustratie, eerdere dagen zonder vandaag. Eerlijke opslagstatus en herstelconcept; historie/datums blijven. Beperkte viewport getest; werkelijk Android-toetsenbord nog niet. |
| M05 | Gewone notitie direct bewerkbaar met titel, inhoud en verzameling. Menu met versiegeschiedenis en beheer; uitgebreide editor behouden. Verplaatsen, conceptfout/herstel, ID/revisies en bijlagen gecontroleerd. |
| M06 | Geselecteerde passage of expliciete passage-invoer naar taakvoorstel. Bestaande duurzame IDs en tweerichtingslinks/status; verplaatsen, archiveren en ZIP-herstel getest. |
| M07 | Centrale lokale inhoudszoeker voor taken/notities, fragment rond zoekwoord, type/bestemming en zichtbare wisbare filters. Middenwoord en exacte bestemming getest. Financiële transacties en PDF-inhoud buiten scope gehouden. |
| M08 | Recursieve verzamelingstellingen met direct aantal; kruimelpad uit werkelijke verzameling-ID. Verplaatsen, archiveren/herstellen, zoeken en herladen gecontroleerd. Geen mappenconversie. |
| M09 | Notitie-ingang heet Notities. Bestaande boodschappen/aankopen, wensen en financiële onderzoeksdossiers eerst geïnventariseerd; hun opslag en vindbaarheid behouden. |
| M10 | Vrijblijvende wens–onderzoeksroute naar hetzelfde dossier met naam, budget en historie; herstel verwijderd dossier na bevestiging. Gekocht en een optioneel financieel concept maken nul transacties. Boeking blijft een aparte bevestiging. |
| M11 | Negatief Geldcoach-netto hersteld; numerieke centberekeningen tot presentatie. Preview, prompt, numerieke JSON-export en CSV gecontroleerd, waaronder € 0/€ 32,34 → −€ 32,34. Geen echte transacties aangepast. |
| M12 | Expliciete begin/einddatum en rekeningcontext in financiële schermen. Kalendermaand en persoonlijke loonperiode behouden. Bewuste lokale filters blijven bij navigatie en globale maandwisseling staan; alleen expliciete drilldown draagt context over. |
| M13 | Inkomsten, uitgaven en resultaat onderscheiden van transferontvangsten, rekeningbeweging, saldo en raming. Persoonlijk/gezamenlijk/creditcard en bestaande financiële functies behouden. Cent-/kaartaflossingsregressie en mobiele schermen getest. |
| M14 | Bekende betaling start met bedrag, datum en rekening; overige velden achter Meer details. Dubbele submit, correctie, undo, brontransactie en conflicterend herstel gecontroleerd. Onbekende transactiemetadata behouden. |
| M15 | Ingestelde budgetten eerst; alle overige categorieën uitklapbaar beschikbaar. Geen categorieën/budgetten verwijderd; maandgebonden werking behouden. |
| M16 | Doelrange, rust, vorige referentie met datum en lege nieuwe meetvelden; voortgang en geldigheidscontrole. Lege set geweigerd; geldige set telt eenmaal en start rust. Op alle drie breedtes getest. |
| M17 | Vorige prestatie herleidbaar naar oefening/apparaat/locatie/datum. Ander apparaat bewaart ingevoerde en afgeronde sets; met invoer komt een aparte oefening erbij, zichtbaar meegerekend. Historische uitgangspunten blijven onderscheiden van metingen; uitlegroute behouden. |
| M18 | Eén absolute rusttimer, alleen actief prominent, beëindigen en ±15 seconden. Pauzeren bewaart positie/sets, hervatten en afronden blijven afzonderlijk. Tijdvooruitgang en reload getest; echte telefoonvergrendeling niet. |
| M19 | Visuele cyclus `OOMMVNNVVV`, start 28-10-2026, volledige labels/tijden. Mijn dag, kalender en fitness delen dezelfde projectie. Tien dagen, herhaling, maand/jaar en nacht tot 06:00 getest. Historische V/L/N/R-opslag exact behouden. |
| M20 | Bestaande diep-/saliegroene stijl, woordmerk, iconen en illustraties behouden. Succesfeedback 180 ms na echte write, filterfeedback en reduced motion. Gewijzigde primaire tikdoelen gecontroleerd; geen nieuwe iconenstijl of runtimeframework. |

## Kwaliteitsvoorwaarden

| Eis | Status en bewijs |
|---|---|
| Q01 | Uitgevoerd. Actuele main, commits, workflows en opslag onderzocht; historische coach-, pad- en dagboekfouten gereproduceerd. Vervallen tests aangepast naar echte huidige bediening, zonder garanties te schrappen. Zie fase 1. |
| Q02 | Getest. Bestaande twee hoofdsleutels, native Web Lock, broncontrole, operatietokens en IndexedDB hergebruikt. Geen destructieve migratie. Oud JSON en volledige ZIP met binaire bijlagen getest met fictieve gegevens. |
| Q03 | Uitgevoerd en foutscenario's getest. Concept/Opslaan/Opgeslagen/fout, sessiegebonden herstel en blokkering van verouderde concepten. Exportdatum beschrijft klaarzetten, geen externe veilige kopie. PIN blijft uitgeschakeld en configuratie bewaard. |
| Q04 | Browsergedeelte uitgevoerd; fysieke controle open. 360/393/412, korte viewport, landschap, +25% tekst, focus/Escape, geselecteerd contrast, primaire tikdoelen, reduced motion, online/offline en echte oude-workerupgrade getest. Geen fysieke Android-, TalkBack- of batterijtest en geen volledige WCAG-audit. |
| Q05 | Bewijsdossier, commits, daadwerkelijke tests, screenshots en officiële documentatie vastgelegd. Vijf handelingen vóór/na gemeten. Ervaren moeite en meting na gewenning ontbreken; daarvoor is de gebruiker nodig. |

Nieuwe velden zijn beperkt tot noodzakelijke optionele context in bestaande objecten, waaronder `resumeExerciseId`; nieuwe taken hebben een normale lege verwijderstatus. De bestaande taak–notitie- en wens–dossierrelaties zijn hergebruikt. Geen tweede zoekindex, roosteropslag, timer, notitiesysteem of externe synchronisatie toegevoegd. Het herstelconcept `memento_note_draft_v1` is geversioneerd en alleen in de sessie van het betreffende tabblad opgeslagen.

## Acceptatiescenario's A01–A18

“Geslaagd” hieronder betekent de genoemde werkelijk uitgevoerde automatische/browsercontrole, met de expliciete fysieke beperkingen. Het betekent geen algemene garantie voor ieder apparaat of iedere browser.

| ID | Uitkomst |
|---|---|
| A01 | Geslaagd: negatief netto, prompt, JSON/CSV, nul-/positieve-/centgevallen. |
| A02 | Geslaagd: dubbele actie, bronlink, correctie, undo en geweigerd dubbel betaalherstel; planning/werkelijke transactie gescheiden. |
| A03 | Geslaagd: rekening-/periodecontext, persoonlijke loonperiode tegenover gezamenlijke kalendermaand, lokaal datumbereik intact. |
| A04 | Geslaagd: directe huidige dag, oudere geschiedenis, datumidentiteit en vandaag niet in eerdere dagen. |
| A05 | Geslaagd: korte notitie zonder dubbele tekst, deadline/stappen direct wijzigen en herladen. |
| A06 | Browserdeel geslaagd: lange tekst in verkleinde viewport, quota, bestemming/concept na reload, retry en stale-draftblokkade. Werkelijk Android-toetsenbord niet getest. |
| A07 | Geslaagd: inhoudswoord middenin, type/pad/fragment, filters wissen, juiste notitie/taak. |
| A08 | Geslaagd: passage, bidirectionele link/status na verplaatsen/archiveren en ZIP-proefherstel. |
| A09 | Geslaagd: recursieve telling, werkelijk pad, verplaatsen/archiveren/herstellen met dezelfde IDs. |
| A10 | Geslaagd: hetzelfde dossier, naam/budget/onderzoek behouden, herstellen uit prullenbak en nul automatische transacties. |
| A11 | Geslaagd: lege/ongeldige set geweigerd, geldige set eenmaal, nieuwe meting leeg, apparaatwissel zonder verlies. |
| A12 | Browserdeel geslaagd: absolute timer met tijdvooruitgang/reload, pauzeren en hervatten van positie/invoer, apart afronden. Echte vergrendeling/achtergrond door Android niet getest. |
| A13 | Geslaagd: exacte tien-daagse vector, herhaling, november/januari en nachtgrenzen; legacyprofiel ongewijzigd. |
| A14 | Geslaagd voor geteste browserversies: echte twee-tabconflicten en PWA-upgrade oude main → nieuwe worker → offline. Exacte opslag/PIN en bijlagehash gelijk. Reeds draaiende code van vóór het slotprotocol kan niet achteraf worden stilgelegd. |
| A15 | Geslaagd: oude JSON, nieuwe volledige ZIP, IDs/links/versies en echte binaire bijlage; uitsluitend gescheiden testopslag. |
| A16 | Browserdeel geslaagd op drie breedtes, landschap, korte viewport, focus en Escape, geselecteerd contrast/reduced motion. Fysiek Android, echt toetsenbord, systeemterugknop en TalkBack niet getest. |
| A17 | Dossier en objectieve vergelijking uitgevoerd; tien voor/na-routes en screenshots. Subjectieve moeite en na-gewenningmeting niet uitgevoerd. |
| A18 | Definitieve CI-/Pages-/live-uitkomst wordt hieronder na publicatie geregistreerd; eerdere fasen zijn gepubliceerd en gecontroleerd. |

## Werkelijk uitgevoerde tests

- Laatste algemene kernrun: **84 regressies**, negen uitvoerbare inline scripts syntactisch geparseerd. Nieuwe rekeningtest onderscheidt persoonlijke rekening, gezamenlijke rekening, creditcardschuld en aflossing op centniveau.
- Opslagveiligheid: 22 checks, native slotvrijgave; bestaande browserharnas met negen groepen voor twee tabs, onopgeslagen invoer, quota, IndexedDB, ZIP en offline. Geen browserfouten.
- Fitnesskern: 25 checks; kennis/ZIP 16; hiërarchie 13; kennisveiligheid vijf groepen; dagboekkern zeven. Aanvullend prullenbak, PIN uitgeschakeld, bosillustraties, covers en 66 iconen.
- Cumulatieve masterplanbrowser: **15 resultaatgroepen op 360, 393 en 412 CSS-pixels**, zonder fouten. De eerdere fasen worden op elke breedte opnieuw bediend. Zie [volledig resultaat](masterplan-evidence/phase5/report.json).
- Aanvullende visuele/bedieningsrun op dezelfde drie breedtes: validatie, modal-focus, Escape/focusterugkeer, financiële opslag/bewerking, taakdetail, lange tekst en offline. [360](masterplan-evidence/phase5/visual/360-report.json), [393](masterplan-evidence/phase5/visual/393-report.json), [412](masterplan-evidence/phase5/visual/412-report.json). Deze diagnostiek vermeldt ook kleinere secundaire controls en gesloten details; geen algemene claim dat elk element 48 pixels is.
- Oorspronkelijke main en nieuwe app met dezelfde fixture: tien routes, nul JavaScript-fouten; echte serviceworkerupgrade met behoud van exacte hoofdsleutels, PIN en SHA-256 van binaire bijlage. Zie [uitkomst](masterplan-evidence/phase5/journeys/report.json).
- Bestaande fitness-, kennis-v2-, pictogram-/navigatie- en quickfit-browserworkflows blijven van toepassing. Een echte quickfit-regressie in fase 4 is als aparte reparatie vastgelegd; de hele quickfit-run slaagde daarna lokaal op de drie breedtes en in CI.

Lokale browser: Chromium 154.0.8037.57 met Playwright 1.62.1; Node 24.19.0. GitHub Actions installeert de bij Playwright horende Chromium-versie en bewaart mobiele bewijsartefacten. De productieapp heeft hierdoor geen nieuwe runtimeafhankelijkheid.

### Vijf vaste handelingen, dezelfde 393px-fixture

Een klik/tap of het invullen van één tekstveld telt als één actie. De routes beginnen op Mijn dag en eindigen bij daadwerkelijk opgeslagen of geopende inhoud. De betalingsroute omvat het openen van het financiële menu; daarmee is het resultaat reproduceerbaar en geen losse knopvergelijking.

| Handeling | Oorspronkelijke main | Nieuwe app |
|---|---:|---:|
| Taak toevoegen | 2 | 2 |
| Notitie opslaan | 3 | 3 |
| Notitie op inhoud terugvinden | 5 | 3 |
| Dagboek schrijven en bewaren | 6 | 3 |
| Bekende betaling registreren | 5 | 5 |
| Direct zichtbare bewerkvelden bij die betaling | 11 | 3 |

De tien routes hadden nul JavaScript-fouten. Dit meet geen ervaren moeite, menselijke vergissingen of gewenning. Een latere gebruiksronde op de eigen telefoon blijft daarvoor nodig.

## Belangrijkste visuele veranderingen

Mijn dag geeft datum, dienst en dagboektoegang compact boven snelle invoer. Notities en dagboek geven de tekst ruimte; aanvullende metadata en beheer blijven vindbaar. Financiën toont duidelijk welk bedrag een periode-uitkomst is en welke rekening/filter meetelt. Bekende betalingen starten met drie velden. Fitness toont doel, vorige referentie en huidige invoer afzonderlijk; het rooster toont dezelfde gevalideerde cyclus op alle relevante plekken.

Voor/na op dezelfde 393px-fixture:

| Route | Voor | Na |
|---|---|---|
| Dagboek | [Screenshot](masterplan-evidence/phase5/journeys/before-diary.jpg) | [Screenshot](masterplan-evidence/phase5/journeys/after-diary.jpg) |
| Betaling | [Screenshot](masterplan-evidence/phase5/journeys/before-payment.jpg) | [Screenshot](masterplan-evidence/phase5/journeys/after-payment.jpg) |
| Notitie terugvinden | [Screenshot](masterplan-evidence/phase5/journeys/before-find-note.jpg) | [Screenshot](masterplan-evidence/phase5/journeys/after-find-note.jpg) |

Aanvullende eindbeelden: [notitie](masterplan-evidence/phase5/393-direct-note-viewport.jpg), [financiën](masterplan-evidence/phase5/393-finance-viewport.jpg), [training](masterplan-evidence/phase5/393-fitness-viewport.jpg), [rooster](masterplan-evidence/phase5/393-roster-viewport.jpg), [back-upstatus](masterplan-evidence/phase5/393-backup-status-viewport.jpg). De elf beschermde bronnen zijn [bytegelijk aan de nulmeting](masterplan-evidence/phase5/assets-preserved.json).

## Commits en publicatie

| Fase | Commit | Inhoud |
|---|---|---|
| 1 | `8c1b4af` | Nulmeting, Geldcoach/pad/dagboekfouten en betrouwbare bestaande tests. |
| 2 | `acb5192` | Mijn dag, snelle invoer, directe taak-/notitiebewerking, dagboek en herstelconcept. |
| 3 | `ce51249` | Centrale zoekfunctie, tellingen, benamingen en duurzame taak-/aankoopkoppelingen. |
| 4 | `7a2c8d8` | Financiële context/betalingen/budgetten, fitnessinvoer/timer/hervatten en vast rooster. |
| 4, reparatie | `88343a7` | Volgende-setbediening bereikbaar buiten actieve rust; volledige quickfit-verificatie. |
| 5 | Zie definitieve publicatie hieronder | Visuele feedback, eerlijke back-upstatus, cumulatieve acceptatie en bewijsdossier. |

Vóór iedere push is `origin/main` opgehaald en met de verwachte vorige commit vergeleken. Er is niet geforceerd gepusht en geen andere branch gebruikt. De fasen 1–4 en de reparatie zijn via GitHub Pages gepubliceerd; de reparatie had tien geslaagde Actions-runs inclusief Pages. De live-code van de vier fasen is met de betreffende commit vergeleken.

### Definitieve publicatie

Wordt ingevuld met de fase-5-commit, definitieve Actions-uitkomsten en gecontroleerde live-bytes/browserresultaten na deployment. De bovenstaande lokale resultaten staan los van die nog te controleren publicatiestap.

## Resterende beperkingen en benodigde vervolgstappen

- Een echte Android-gebruiksronde blijft nodig voor toetsenbord/cursor, systeemterugknop, TalkBack, vergrendeling, batterijgebruik en installatie als PWA. De uitgevoerde Chromium-tests vervangen die hardwarecontrole niet. Externe AI-, Google-agenda- en microfoondiensten zijn niet echt aangeroepen; geen externe wijzigingen zijn uitgevoerd.
- Ervaren moeite en na-gewenningvergelijking zijn niet gemeten. Objectieve stappen, zichtbare velden en browserfouten zijn wel reproduceerbaar vastgelegd.
- Maak zelf een volledige ZIP en controleer het bestand buiten de telefoon. Een klaargezette download bewijst niet dat de kopie duurzaam elders is opgeslagen. Een oudere JSON bevat geen binaire bijlagen.
- Sluit oude Memento-tabbladen en PWA-vensters en open de app eenmaal online na de update. Reeds draaiende zeer oude code van vóór het bestaande slotprotocol kan niet via een nieuwe publicatie worden gedwongen dat protocol te respecteren. De onderzochte oorspronkelijke main en huidige code zijn met echte tabs/locks getest.
- Een sessieconcept overleeft herladen binnen de betreffende browsersessie; sluiten/wissen van de hele sessie of volledige opslaguitval kan ook die herstelkopie wegnemen. Geen onterechte duurzame-opslaggarantie toegevoegd.
- Geen kritieke gegevensfout in de geslaagde eindruns. De expliciet uitgesloten uitbreidingen zijn niet toegevoegd. De afzonderlijke bijlage over overboekingen/maandafsluiting is niet als extra scope boven het masterplan uitgevoerd; de actuele transferfunctie van het vertrekpunt is behouden en getest.

Officiële bronnen gebruikt voor de technische randvoorwaarden: [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), [VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API) en [serviceworkerlevenscyclus](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers). De daadwerkelijk geraadpleegde passages staan in het [bronnenbewijs](masterplan-evidence/phase5/official-sources.json).
