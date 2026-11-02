# Memento — Design System en visuele acceptatie

**Versie:** **1.0**, 30 oktober 2026. **Status:** geconsolideerde expliciete ontwerpkeuzes; uitvoering en rendering steeds afzonderlijk tegen actuele `main` verifiëren. De herkomst/auditdekking staat in `04_HISTORISCHE_BESLUITENAUDIT.md`.

> **Memento Projectkennis 2.0 — 31 oktober 2026**  
> Dit is een herzien kennisdocument, geen instructie om GitHub te wijzigen. Productbesluiten uit versie 1.0 blijven gelden als historische beslisgegevens, niet als automatisch geverifieerde implementaties.  
> **Bronhiërarchie:** actuele expliciete gebruikersopdracht → actuele GitHub `main` en `AGENTS.md` voor techniek/werkelijke code → recent expliciet goedgekeurd ontwerp voor gewenst gedrag → dit document voor productcontext → historisch archief.  
> **Efficiëntie:** laad alleen de passages die een taak nodig heeft. Alle test-, branch-, publicatie- en PWA-procedures volgen de huidige [AGENTS.md](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/AGENTS.md) en relevante `.agents/skills/` op GitHub; deze kennisdocumenten voegen geen tweede verplichte controleworkflow toe.  
> GitHub-referentie bij revisie: `4e17ba69389df9394975b517da2cc725953270a0` (31 oktober 2026), uitsluitend tijdsopname; controleer `main` opnieuw bij implementatie.  

## 1. Visuele identiteit

Memento heeft een elegant, rustig, volwassen bosgroen ontwerp met salie-/diepgroene materiaalvlakken en beheerste goud-/amberaccenten. Het definitieve woordmerk luidt **Memento** met slogan **Reflect · Refine · Conquer**. Behoud bestaande definitieve logo's, pictogrammen, illustraties, bosscènes en afgesproken animaties; vervang deze niet door generieke stockicons of nieuwe iconen zonder expliciete keuze.

Het uitgangspunt is een kalm, informatiegericht scherm: eerst de primaire handeling en relevante inhoud, daarna filter- en beheeropties. Compact betekent **minder visuele massa, niet kleinere bediening**. Geen lange uitleg, statistiekstapels of vele open filters vóór de eigenlijke inhoud als deze secundair zijn.

## 2. Componentregels

- **Kaarten:** consistente radius, afstand, teksthiërarchie, grens/accenten en compacte verticale ritmiek. Taakrijen en afspraakrijen moeten visueel verwant zijn wanneer hun functie vergelijkbaar is.
- **Checkboxen:** zichtbaar circa 22–24 CSS-px volgens `AGENTS.md`, maar minstens 44×44 CSS-px veilig aanklikbaar; vergroot nooit de zichtbare checkbox tot een enorm blok om de hitbox te vergroten.
- **Typografie:** leesbare titels, aantallen en financiële bedragen; geen onbedoelde letterafbreking of minuscule instructietekst.
- **Acties:** één herkenbare hoofdactie per context; overige acties via zorgvuldig gelabelde knoppen/disclosures. Belangrijke velden blijven direct vindbaar.
- **Formulieren:** behoud betekenisvolle velden, foutmeldingen, opslagstatus, labels en toetsenbordgedrag; geen misleidende 'Opgeslagen' vóór echte succesvolle write.
- **Navigatie:** oorspronkelijke tabstructuur en bestaande routes behouden tenzij expliciet anders goedgekeurd; geen extra hoofdtab om één feature toe te voegen.
- **Beweging:** subtiel, zinvol, uit te zetten met `prefers-reduced-motion`; geen voortdurend dure animatie die mobiel scrollen schaadt.

## 2a. Goedgekeurd prototype heeft voorrang binnen zijn scherm

Een door de gebruiker expliciet gekozen, concrete HTML-prototypeversie is de **normatieve UI-referentie** voor de genoemde schermen en interacties. Gebruik de algemene bosgroene ontwerpregels als fallback waar het prototype niets over zegt, niet om een goedgekeurde compositie te vervangen. Behoud de feitelijke bestaande appgegevens, lokale opslag, toegankelijkheid en technische veiligheid.

Visuele gelijkheid omvat niet alleen kleur maar ook **de volgorde en groepering van velden, marges, typografische hiërarchie, relatieve maten, primaire en secundaire acties, bottom sheets, geopende menu's, sticky header, scrollgedrag en gebruikersroutes**. Een prototype met fictieve actieknoppen vergt veilige koppeling aan echte functies zonder de goedgekeurde interface ongemerkt te veranderen. Bij noodzakelijke technische of toegankelijkheidsafwijking: kleinste mogelijke aanpassing, expliciet documenteren en bij wezenlijk ander uiterlijk vooraf toestemming vragen. Zie het uitvoerbare prototypecontract in `AGENTS.md`; maak geen tweede testmatrix.

## 3. Prestatiebesluit: geen dure live glass-blur

In `main` is op 29 oktober de permanente `backdrop-filter` van diverse oppervlakken verwijderd ten gunste van visueel vergelijkbare maar beter presterende dekkende groene lagen. Mobiele bosachtergrond mag meescrollen in plaats van vastgeprikt zijn. Zet geen zware live-blur, nieuwe wereldwijde overrides of DOM-observers terug voor cosmetische redenen. Bron: [glasprestatierapport](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/glass-performance-20261029/README.md).

## 4. Schermprincipes

| Scherm | Gewenste hiërarchie / bewaarde keuze |
| --- | --- |
| Startscherm / Daglijn | Weerkaart, compacte agenda-/takenoverzichten en snelle acties; behoud goedgekeurde bosweergave en gegevenscontext. Niet verwarren met het tabblad Mijn dag. |
| Mijn dag | Vandaag in één oogopslag, taken en afspraken compact; achterstallige taken zichtbaar met oorspronkelijke datum en expliciete vertraging. Geen automatische datumverschuiving. |
| Taken | Leesbare lijst voorop, filters secundair, beheer bereikbaar. Elke taak compact als afspraakrij; checkbox visueel klein en tikvlak groot. |
| Agenda | Afspraken vroeg zichtbaar; verbinding-/roosterdetails ondergeschikt. Alleen echte koppeling als verbonden tonen. |
| Financiën: Overzicht / Transacties / Analyse | Transacties, uitgaven en categorieanalyse centraal. Context/filterpanelen compact; grafieken goed zichtbaar. Interne transfers duidelijk onderscheiden. |
| Budgetten | Budgetten in hun eigen onderdeel, niet als standaard hoofdfocus van Financiën. |
| Notities / Kenniscentrum | Snel terugvinden, Inbox, verzamelingen, recent, duidelijke omslagen/illustraties; teksteditor geeft tekst prioriteit. |
| Boodschappen / Aankopen / Aankoopwensen | Drie aparte doelen; compacte rijen, favorieten en bestaande details behouden. |
| Slim Kopen / Geldcoach | Rustige stappen en relevante informatie; label 'stappen' is niet automatisch een werkende wizard. |
| Fitness | Start/hervat training duidelijk; tijdens actieve set geen verborgen primaire controles, doelranges en eerdere resultaten behouden. |
| Back-up / Instellingen | Volledige ZIP als duidelijke primaire back-upactie; herstel en privacy veilig en duidelijk ingedeeld. |

Een eerder 42-schermen/234-punten-prototype is **geen vrijbrief voor implementatie** en bewijst niet dat alle schermen actueel hetzelfde zijn. De audit van 29 oktober documenteert veel gedeeltelijk overeenkomende schermen; meerdere daarvan kunnen inmiddels gerepareerd zijn.

## 5. Visuele acceptatie op basis van wijzigingsrisico

Vergelijk alleen het **geraakte component en zijn relevante toestanden** met het laatst goedgekeurde ontwerp. Bij een kleine lokale CSS-wijziging geldt de gerichte 393px-rooktest volgens `AGENTS.md`; voeg 360/412px, korte viewport, toetsenbord- of standalone-PWA-controle uitsluitend toe bij daadwerkelijk risico. Bij brede UI-wijzigingen geldt de uitgebreide risicogestuurde dekking. Controleer overflow, tikgebieden, tekstomloop, dialogen en focus waar relevant. Fysieke A54-controle is niet bewezen door Chromium-emulatie. Gebruik bestaande fixtures en screenshots; geen dubbele testmatrix op basis van dit document.

## 6. Ontwerparchief en bronnen

- [Eerdere visuele audit](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/visual-audit-20261029.md)
- [App-glass implementatie](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/app-glass-implementation.md)
- [Startschermontwerp](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/docs/start-design-20261029/README.md)
- [Ontwerpreview en voor/na-bewijs](https://github.com/jaribuijsman/Uitgavenkompas/tree/main/docs/design-review)
- [AGENTS.md — exacte tap-/testregels](https://github.com/jaribuijsman/Uitgavenkompas/blob/main/AGENTS.md)


## 7. Detailbesluiten uit eerdere gesprekken (v1.0)

### 7.1 Startscherm / Daglijn versus Mijn dag

- Deze zijn **verschillende schermcontexten**. Op 29 oktober werd **Daglijn** als uitgangspunt gekozen en werden **Lichtinval** en **Nieuw Glas** voor het startscherm goedgekeurd. De directe invoeracties zijn **Taak**, **(Snelle) notitie** en **Transactie**, gebouwd rond de bestaande formulieren in plaats van functioneel uitgeklede kopieën.
- De op 29 oktober goedgekeurde **compacte transparante weerkaart** voorlopig niet ongemerkt aanpassen; het gevraagde vervolg betrof uitsluitend kaarten **Agenda** en **Mijn dag/taken** eronder. Horizontaal doorveegbare kaarten waren een onderzoeksvariant, niet automatisch de definitieve Mijn dag-indeling.
- Het dagoverzicht Mijn dag moet **minder druk** zijn dan eerdere proefontwerpen. De gebruiker vroeg op 29 oktober opnieuw om een radicaal rustiger nieuw concept: dat verzoek is *ontwerpverkenning*, niet de goedkeuring van één definitief vervangend scherm.
- De datumkop, sectie Nog te doen en dropdown moeten compact zijn; vermijd duplicatie van informatie die al op het openingsscherm bestaat. Eerdere opdrachten verwijderden een dubbele dienst-/weerinformatie op Mijn dag zonder echte planning of acties te verwijderen.
- Afspraak- en taakrijen volgen dezelfde leeslogica. De afspraak heeft tijd, de taak kan **datum** op die plaats tonen. Gebruik vier duidelijke zones: afvinkdoel, tijd/datum, omschrijving, **Bewerk**. Voorkom dat één rij door een extreem brede kaart onnodig wordt uitgerekt.
- In de afspraakbalk: **Google Agenda verbinden/opnieuw verbinden** is gewenst als **aanklikbaar pictogram tussen de diensttijdcapsule en '+ Afspraak'**. De lange verbindingslink onder Afgeronde afspraken vervalt **als** het nieuwe pictogram daadwerkelijk dezelfde actie betrouwbaar uitvoert. Het verzoek is op 30 oktober voor `main` goedgekeurd, maar de technische oplevering is nog afzonderlijk te verifiëren.
- Eerdere keuze van 25 oktober: **Quote en Weer op Mijn dag** waren standaard uitgeklapt. Latere afspraken vereenvoudigden en haalden de dubbele weerkaart weg: laat deze oude voorkeur **niet** zwaarder wegen dan een specifiek later goedgekeurde vereenvoudiging.

### 7.2 Bos, weer en bewegend openingsscherm

- Definitieve sfeer: warm en cosy, illustratief **pixelart-/boskarakter**, met diepgroen, salie, lichte accenten en bestaande merkassets. In oktober werden **zes bosillustraties** met automatische dagdeelrotatie en een optie **Kies bos** geselecteerd; weersinvloeden zoals regen, sneeuw, mist en licht/donker en een **december-/kerstvariant** zijn onderdeel van de historische goedgekeurde richting.
- Het openingsscherm werd later opgevat als dagoverzicht met **Doorgaan**, een actuele **uurverwachting voor vandaag** (Open-Meteo als bestaande gekozen bron), afspraken en taken. Beverwijk was de gekozen plaats voor weersafhankelijkheid. Controleer bij echte appwerking loading, mislukte fetch, offline fallback en tijdzone. Een ontwerp kan niet aantonen dat de meteorologische data realtime binnenkomt.
- Het visuele PIN-/openingsscherm **mag niet impliciet beslissen** of PIN-beveiliging actief is. Een visueel ontwerp vervangt geen beveiligingsacceptatie; zie masterplan §7.4.
- De op 29 oktober ingevoerde performancekeuze (geen permanent zware `backdrop-filter`) gaat voor op oudere voorstellen voor intensiever glas. **Nieuw Glas** is een uitstraling, geen verplichting GPU-belastende live-blur terug te zetten.

### 7.3 Invoer, notities en overige schermen

- Snelle transacties: rekening, bedrag, categorie, **subcategorie** en **aanwijzer** moeten functioneel bereikbaar blijven. Een kleinere kaart of modal is geen reden om velden te schrappen.
- Het dagboek geeft **schrijven** prioriteit; grotere/meegroeiende tekstinvoer, afleidingsvrije mogelijkheid, autosave en zichtbare bewaartoestand. Gebruik de bestaande illustratiestijl; een eerdere pixelart-bosvariant voor het dagboek was een ontwerpvoorkeur, geen vrijbrief de bestaande editor te vervangen.
- Kenniscentrum: geïllustreerde categorieën, hoofdniveau **Levenspad**, visueel aantrekkelijke covers/banners, centrale beeldkeuze, maar vermijd herhaalde tekst en onnodige lege tussenruimte. Bij notitiebanners is **beeldverhouding en volledige breedte** essentieel; niet zomaar crop/contain aanpassen zonder echte vergelijking.
- Leven: Boodschappen, Aankopen en Aankoopwensen visueel verwant maar ondubbelzinnig gescheiden; de AI-/Slim Kopen-ingang bij Aankopen is een expliciete doorklikactie, geen stille datakoppeling.
- Fitness: primaire bediening tijdens actieve sets zichtbaar, voortgang en vorige prestatie compact. Training afsluiten moet duidelijk zijn, zonder extra formulierlagen op mobiele schermen.

### 7.4 Historische controle-eisen en huidige toepassing

Deze eerdere volledige viewportmatrix is een **historische ontwerpacceptatielijst**, geen standaardverplichting voor iedere kleine patch. Kies de werkelijk relevante toestanden en schermformaten via `AGENTS.md`; gebruik de uitgebreide matrix wanneer de wijziging breed of risicovol is. Een 393px Chromium-viewport is **niet** gelijk aan een Samsung Galaxy A54 5G. Als een visuele test niet werkelijk is uitgevoerd, rapporteer **NIET GEVERIFIEERD** en laat dat niet opwegen tegen een mock-up.