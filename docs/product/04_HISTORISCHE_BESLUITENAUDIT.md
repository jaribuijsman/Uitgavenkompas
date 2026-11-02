# Memento — historisch besluitenauditarchief (bron v1.0, bewaard in 2.0)

**Auditdatum:** 30 oktober 2026  
**Status:** inhoudelijk gecontroleerd op het aantoonbaar beschikbare materiaal; **niet volledig dekkend voor iedere losse projectchat**.  
**Productiecode/GitHub gewijzigd:** nee. **Actuele `main` read-only bevestigd:** `667577354f980232df195dd135cf4639b7811ad4`.

> **Archiefstatus 31 oktober 2026:** dit document bewaart de historische audit onverkort als bewijsbron. Oude SHA's, checks, onvolledigheden en opleverclaims zijn expliciet tijdsgebonden. Gebruik voor actuele Codex/Work/testprocedures `AGENTS.md`; lees dit archief alleen bij terugzoeken van besluiten, conflicten of chatopschoning. De oorspronkelijke historisch vastgestelde informatie hieronder is bewust niet herschreven.

## 1. Doel en bronnen

Dit auditlog voorkomt dat oude brainstorms, tijdelijke scopes of vroegere bugs later ten onrechte als blijvende producteisen worden gepresenteerd. De kennisbasis v0.1 is vergeleken met gericht opgehaalde fragmenten van historische Memento-/Uitgavenkompas-gesprekken uit 23–30 oktober 2026 en met beschikbare projectbronnen. De terugzoekfunctie biedt thematische treffers, geen volledige chatlijst en geen integraal exportbestand; **een uitputtende controle is niet aantoonbaar**.

Bronnen en bewijskracht:

1. **Gebruikerstekst uit eerdere projectgesprekken:** sterkste historische bewijs voor *gewenst gedrag*; datum en scope per beslissing genoteerd waar vindbaar. De oorspronkelijke gesprekken zijn niet integraal meegeleverd; daar waar terugzoekfragmenten afgebroken waren, is geen verborgen tekst gereconstrueerd.
2. **De drie kennisdocumenten v0.1** (`01_MASTERPLAN.md`, `02_DESIGN_SYSTEM.md`, `03_BESLUITEN_EN_ROADMAP.md`): uitgangspunt; alleen relevante toevoegingen en verduidelijkingen in v1.0.
3. **Read-only GitHub-check 30-10-2026:** `main` head `667577354f980232df195dd135cf4639b7811ad4`; `AGENTS.md` gelezen. [AGENTS.md](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/AGENTS.md) en [commit](https://github.com/jaribuijsman/Uitgavenkompas/commit/667577354f980232df195dd135cf4639b7811ad4). Dat verifieert de bron-SHA en technische contracten, **niet** ieder genoemd featuregedrag.
4. **Bestaande onderzoeken:** *Memento product en UX onderzoek* (27 oktober, 25 pagina's) en *Memento onderzoek Kenniscentrum roadmap* (27 oktober). Onderzoeksvoorstellen zijn **niet** als gebruikersbesluiten geteld, tenzij latere expliciete selectie uit gesprekken vindbaar was.
5. **Historische assistentopleveringen/commits:** aanwijzing dat iets ooit gebouwd/gepubliceerd zou zijn, niet genoeg om actuele appfunctionaliteit of fysieke Android-werking te claimen.

## 2. Themadeelverantwoording

| Thema | Relevante historische gesprekperiode | Nieuw zichtbaar geworden keuze(s) | Verwerkt in |
| --- | --- | --- | --- |
| Startscherm / Daglijn / Mijn dag | 25, 28–30 okt | Daglijn, Lichtinval/Nieuw Glas, quick-entry, taakrij als afspraakrij, Google-verbinden-pictogram, laatste simplificaties | masterplan §7.1; design §7.1; D08–D15 |
| Agenda en diensten | 25, 28 okt | Alleen-lezen Google, lokale checkbox, niet-afgevinkte afspraak zichtbaar, OOMMVNNVVV, geen automatische taakprioriteit | masterplan §7.1; D07–D11 |
| Financiën | 23–29 okt | 2 rekeningen, creditcard betaalwijze, gecombineerde rekeningmutatie vs externe inkomsten, centrale maandselector, splits optioneel, aanwijzer apart, geen auto-aankooptransactie | masterplan §7.2; D01–D06 |
| Dagboek / Gezondheid | 27–29 okt | Schrijven voorop; autosave en historie; ontwakingsdatum als slaapdatum; handmatige bronstatus | masterplan §7.3; D16–D17 |
| Kenniscentrum | 26–27 okt | Levenspad, local-first, één subniveau, ZIP, afbeeldingen en centrale illustratiekeuze; sync later | masterplan §7.3; D18–D20 |
| Leven / Fitness / Slim Kopen | 24–29 okt | Drie lijstdoelen, geen geldtransactie bij Gekocht, A/B/C, afgebakende spraak- en fitnessfasen, centrale zoekactie excl. Financiën | masterplan §7.2–7.3; D21–D22, D28–D29 |
| Beveiliging / Bos / Weer | 25–29 okt | Opeenvolgende PIN-besluiten, zes bosillustraties, Open-Meteo en decemberthema, tegenstrijdige automatische timer | masterplan §7.4; design §7.2; D23–D24 |
| Werkwijze / patchscope | 27–30 okt | Eerst herstel, onderzoek voor wijzigingen, tracering per patch, 5 fasen, éénmalige patchescope, GitHub-autorisatie | masterplan §2–3/8; D25–D27/D30 |

## 3. Expliciete vervangingen, uitsluitingen en waarschuwingen

1. **PIN-beleid:** 25 oktober automatische timer geaccepteerd; 27 oktober uitschakeling standaard PIN-scherm; 28 oktober handmatige vergrendeling + 'Doorgaan'; 29 oktober PIN-/opslagveiligheid verplicht behouden. Geen eenvoudige 'het PIN-scherm is afgeschafft'-conclusie toegestaan; lees actuele configuratie voor iedere ingreep.
2. **Weer / Quote op Mijn dag:** 25 oktober voorkeur voor standaard uitgevouwen; 29 oktober specifiek gekozen dat dubbele weerkaart van Mijn dag verdwijnt bij betrouwbare startschermweerkaart. Context verschilt, nieuwere concretere scope gaat voor.
3. **Agenda:** 25 oktober aanvankelijk maandoverzicht zonder invoer; latere lokale-afspraakfunctionaliteit naast alleen-lezen Google was expliciet gekozen. Oudere 'geen invoer'-beperking niet terug invoeren.
4. **Mijn dag herontwerpen:** ontwerpen van 29 oktober werden als te druk teruggestuurd. Een nieuw radicaal rustig ontwerp is *gevraagd*, niet definitief als complete vervanging geaccordeerd. Het later wel goedgekeurde *taakrij = afspraakrij* is een beperktere uitvoerbare eis.
5. **29 oktober patches:** uitsluitend #001/#002/#004 binnen die taak; #003/#005 niet. Niet als permanente productverboden lezen.
6. **Spraakuitrol:** de beperkingen voor fase 2 en fase 3 van 29 oktober golden voor die opdracht, niet voor een toekomstig onbeperkt ontwikkelmandaat.
7. **AI:** een knop naar een ChatGPT-onderzoeksopdracht of kopieerprompt is geen automatische API-koppeling, scraping of toestemming betaalde modellen met persoonsgegevens te gebruiken.
8. **Vermeende opleveringen:** historische assistentmeldingen over main/publicatie, 42 schermen/234 onderdelen, 16/16 of 84/17 tests en PR's zijn geen bewijs dat iedere functie *vandaag* goed werkt. Hercontroleer tegen `main` en echte UI.
9. **Gegevenshistorie:** concrete persoonlijke transacties, adressen, accountnummers en andere privégegevens zijn bewust **niet** overgenomen in de duurzame kennisbasis. Alleen semantische productregels zijn bewaard.

## 4. Bewijslacunes en voltooiingsgrens

- Een **complete lijst van alle resterende oude gesprekken** in het ChatGPT-project was niet opvraagbaar. Er is **geen** export beschikbaar waarmee alle chat-titels, aantallen en individuele bronnen op volledigheid gecontroleerd konden worden.
- In eerdere chatresultaten worden 21 geselecteerde patch-/verbeterpunten, de F-/I-codes en een 25-pagina's UX-rapport genoemd. De volledige exacte keuze-voor-keuze tekst is **niet integraal beschikbaar**. Dit auditdocument mag niet een schijnbaar complete matrix van die punten uitvinden.
- Sommige teruggevonden gebeurtenissen bevatten een gebruikerstoestemming én een assistentclaim over uitvoering, maar geen onafhankelijk geteste eindstatus. In de v1.0 is daarom per onderwerp 'besloten', 'gemeld' of 'te verifiëren' gescheiden.
- Fysieke Samsung Galaxy A54-tests, Google-autorisatie in het eigen account, echte gegevensmigratie en volledige PWA-offline/ZIP-herstelflow zijn **niet opnieuw uitgevoerd** voor deze documentaudit. Dat was ook niet nodig voor alleen een kennisbasiswijziging.

## 5. Controle bij toekomstige chat-opschoning

1. Maak eerst in ChatGPT een lijst/export van de daadwerkelijk nog aanwezige projectgesprekken (titel/datum; inhoud waar mogelijk), en bewaar die lokaal zolang er mogelijk unieke besluiten in staan.
2. Leg ieder nog niet vergeleken gesprek naast D01–D30: nieuw besluit, bevestiging, correctie, alleen voorstel of tijdelijke scope. Registreer de laatste expliciete keuze en verwijzing; geen codeaanname.
3. Werk zo nodig alle drie kernbestanden en dit auditlog in één versie bij. Voorkom dubbele, tegenstrijdige regels. Bewaar een kopie van 1.0 voordat naar 1.1 wordt gegaan.
4. Vervang vervolgens de oude bestanden in het ChatGPT-project door de nieuwe, zodat nieuwe gesprekken ze als bron kunnen raadplegen. **Documenten die alleen als download in deze chat bestaan, zijn niet automatisch als blijvende projectbestanden bijgewerkt.**
5. Archiveer of verwijder pas daarna oude chats; bij verwijderen kunnen ontbrekende besluiten definitief onvindbaar worden. Laat actuele projectinstructies en de vier kennisdocumenten staan.

## 6. Opleverstatus van de documentaudit

- **GESLAAGD:** drie bestaande Markdown-bestanden gelezen, vergeleken en aangevuld met D01–D30; bron-/statusonderscheid, uitsluitingen en historische conflicten beschreven; `main`/`AGENTS.md` alleen gelezen.
- **NIET GEVERIFIEERD:** volledigheid van alle bestaande projectgesprekken, specifieke F-/I-keuzes op woordniveau, en onafhankelijke runtime-/deviceverificatie van eerder gemelde builds.
- **NIET UITGEVOERD:** wijzigingen aan GitHub/main, productiepublicatie, persoonlijke data of automatische projectbestand-vervanging.