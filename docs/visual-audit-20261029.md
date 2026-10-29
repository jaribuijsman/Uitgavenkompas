# Visuele controle van alle hoofdtabbladen — 29 oktober 2026

## Uitkomst

De vorige implementatie is **niet visueel gelijkwaardig aan het goedgekeurde voorstel**. De gedeelde glasstijl is aanwezig, maar veel schermen behouden de oude informatievolgorde, grote statistiekblokken en uitgebreide bediening boven de inhoud. De vorige broncontrole en functionele tests konden daarom geen volledige uitvoering van het ontwerp aantonen.

Gecontroleerde uitgangsversie: GitHub main `163ef84ebea4a60063ca06aa7f16be120ecbed32`. Vergelijking: het oorspronkelijke interactieve `memento-app-review.html` van 29 oktober, ongewijzigd weergegeven naast de echte app. Alle 18 hoofdtabbladen zijn afzonderlijk geopend en visueel beoordeeld op 393 CSS-pixels. Alleen fictieve gegevens op een afzonderlijke preview-origin; de schrijfbeveiliging bleef actief. Het prototype en de testapp bevatten verschillende voorbeeldrecords. Verschillen in bedragen, aantallen en inhoud zijn geen ontwerpgebrek op zichzelf. Dit is geen claim dat alle 42 detailtoestanden of 234 functiepunten opnieuw interactief zijn getest.

Bronnen voor projectregels: `LEESMIJ.txt`, bestaande masterplan-, opslag-, kennis- en ontwerpdocumentatie, de Memento Design System-template en de concrete afspraken in het gesprek. Er staat geen `AGENTS.md` in de onderzochte repository. Een afzonderlijk onzichtbaar document met projectaanwijzingen wordt niet als gelezen voorgesteld.

## Tabblad voor tabblad

| Tabblad | Voorstel | Waarneming in main | Beoordeling / vervolg |
|---|---|---|---|
| Mijn dag | Datum/dienst, dagboek, snelle invoer en compacte daggroepen. | Dagboek en invoer aanwezig. Meerdere achterstallige taken nemen de eerste weergave over; datum/dienst staan niet als compacte kop bij de titel. | Gedeeltelijk. Dagcontext en verhouding tussen eerdere taken en vandaag verder uitwerken, zonder oude datums te wijzigen. |
| Taken | Zoekveld, compacte filterkeuze, leesbare takenlijst; beheer secundair. | Snelle invoer en sorteren staan uitgebreid boven de lijst. De nieuwe uitklapgroep is in het oude vijfkolomsraster geplaatst: statusknoppen circa 536 px hoog. | Defect. Hersteld met compacte statusbediening, korte Overzichten-samenvatting, optionele snelle invoer en sorteren binnen Filters. Alle vijf statussen blijven bereikbaar. |
| Agenda | Daglijst eerst, Maand als alternatief; verbinding secundair. | Daglijst/Maand en tien roosterdagen aanwezig. Intro, rooster, maandbediening en verbinding duwen afspraken ver omlaag. Verbindingstatus breekt in fragmenten; nieuwe knoppen hadden browserstijl. | Gedeeltelijk. Knopstijl en statusafbreking hersteld. Compactere daglijst en roosterpresentatie blijven nodig. |
| Boodschappen | Categoriekaarten met product/hoeveelheid en grote afvinkdoelen. | Compacte productrijen en hoeveelheden aanwezig. Standaard één onverdeelde lijst; groeperen zit in lijstopties. | Dichtbij voor de rijen, afwijkend in categoriepresentatie en invoer. Bestaande favorieten/gekoopte items behouden. |
| Aankoopwensen | Twee of meer compacte wensrijen met status, budget en dossieractie. | Elke wens is nog een grote zelfstandige kaart met losse budget-, notitie-, link- en beheerregels. Paginatitel breekt midden in het woord. | Gedeeltelijk. Titel hersteld; compacte wensrijen blijven nodig. |
| Notities | Inbox, verzamelingen en recent bewaard snel zichtbaar. | Zoekveld en groot snel-invoerblok staan eerst; Inbox en eerste verzameling pas lager. Verzamelrijen zijn compacter, maar tonen niet dezelfde grote oorspronkelijke illustratieverhouding als het voorstel. | Gedeeltelijk. Startvolgorde en kaartillustraties verder uitwerken. |
| Fitness | Volgende training/start, planning en recente voortgang; actieve sessie apart. | Vandaag/Schema/Voortgang bereikbaar. De fixture hervat terecht een actieve sessie met oefeningdetails. Dat is een andere toestand dan de inactieve Vandaag-preview. | Deels vergelijkbaar. Geen gelijkwaardigheid van actieve training geclaimd op basis van deze twee verschillende toestanden; oefeningskaarten blijven uitgebreider. |
| Back-up & instellingen | Eén primaire ZIP-actie; herstel, oude JSON en privacy secundair. | Volledige ZIP staat vooraan en herstel is ingeklapt. Veel uitleg plus oude JSON blijven in dezelfde grote primaire kaart. | Gedeeltelijk. Hoofdkaart verkorten en oude JSON secundair plaatsen, met behoud van noodzakelijke gegevenswaarschuwingen. |
| Overzicht | Rekening/periode en kerncijfers met grafiek in eerste kaart. | Gedeelde financiële bovenbalk plus extra lokale context nemen ruimte in. Netto geldstroom is zichtbaar; de grafiek begint veel lager. | Gedeeltelijk. Compactere context en kernkaart nodig; geldstroom en banksaldo duidelijk gescheiden houden. |
| Transacties | Zoekveld, ingeklapte filters, netto selectietotaal en compacte regels. | Netto selectietotaal aanwezig, maar vier filterbedieningen staan open en extra contextregels nemen hoogte in; transacties blijven grote kaarten. | Gedeeltelijk. Filters/regels en verticale volgorde nog niet conform. |
| Analyse | Overzicht/Categorieën/Trends direct, filters secundair, grafiek centraal. | Rapportperiode, vergelijking, rekening en toewijzing staan uitgebreid boven de subtabs. Eerste cijfers/grafieken vallen grotendeels onder de eerste weergave. | Grote afwijking. Filterkaart onder compacte disclosure en subtabs/cijfers omhoog brengen. |
| Budgetten | Resterend bedrag en ingestelde categoriebudgetten voorop. | Context, rekeningkeuze en vier statistiekkaarten staan vóór de ingestelde categorieën. | Grote afwijking in hiërarchie. Eén resterend-budgetkaart en echte ingestelde budgetten eerst. |
| Rekeningen | Compacte lijst van drie rekeningen, daarna bewuste saldocontrole. | Vier statistiekkaarten plus uitleg/context staan vóór de eerste rekeningkaart; controles zijn verspreid per rekening. | Gedeeltelijk. Expliciete controleactie bestaat, maar de compacte lijst en controlehiërarchie ontbreken nog. |
| Planning & doelen | Betalingen/Spaardoelen als afzonderlijke keuzes, eerstvolgende betalingen direct zichtbaar. | Vier samenvattingskaarten staan voor betalingen; vaste lasten en doelen op één lange pagina. Titel wordt door twee actieknoppen smal. | Grote afwijking. Titel/actiegroep hersteld; subtabs en informatievolgorde blijven nodig. |
| Slim Kopen | Compact dossier met product, budget, advies en eisen; voorbereiding als hoofdactie. | Stappenlabels toegevoegd, maar de bestaande lange vragenlijst en introductie behouden. Het zijn visuele labels, geen werkende stappenwizard. | Gedeeltelijk. Dossier-/eisenhiërarchie nog uitwerken; geen wizard als geïmplementeerd rekenen. |
| Geldcoach | Compact onderwerp/zelfgeschreven vraag en controleerbare cijferbasis. | Grote onderwerpknoppen, toelichting en financiële context nemen de eerste weergave in. | Gedeeltelijk. Compactere onderwerpkeuze en vraag/cijferbasis omhoog. |
| Bonnetjes | Invoer, controleren en koppelen met afzonderlijke leesbare secties. | Stappenlabels en ingeklapte JSON aanwezig, maar de lange bestaande kaart mengt opdracht, invoer en controle. | Gedeeltelijk. Echte sectiehiërarchie en mobiele formulieren verder uitwerken. |
| Instellingen & data | Benoemde voorkeuren/categorieën/CSV/privacy, centrale back-up herkenbaar. | Secties ingeklapt; categorieën/privacy zitten in bestaande disclosures. Centrale back-up is niet direct als primaire kaart zichtbaar. | Relatief dichtbij qua groepering, maar hoofdroute voor volledige back-up nog onvoldoende herkenbaar. |

De Memento-kleuren en oorspronkelijke branding blijven behouden. Deze tabel telt een aanwezige functie niet automatisch als een visueel afgerond ontwerp. Het goedgekeurde Daglijn-startportaal is een aparte ingang en is niet vervangen door het Mijn dag-tabblad.

## Vastgestelde oorzaak van de taakfout

`index.html` definieerde vijf gelijke rasterkolommen voor vijf statusknoppen. `memento-glass.js` groepeerde drie knoppen in een lange disclosure, maar gaf die `flex-basis` terwijl de ouder een grid bleef. De lange tekst kreeg slechts ongeveer 64 px en brak door `overflow-wrap:anywhere` verticaal af. De andere twee knoppen rekten tot dezelfde hoogte mee. De oude acceptatietest keek alleen naar horizontale overflow en kon dit missen.

Herstel: flexrij met leesbare minimumruimte, 46 px hoge hoofdkeuzes, een korte samenvatting Overzichten of de geselecteerde beheerstatus, en de bestaande Archief/Bewaard/Prullenbak binnen de disclosure. Snelle invoer wordt optioneel uitklapbaar, Sorteren staat onder Filters. De kruisjes worden alleen bij wisbare filters getekend, niet meer bij Bewaar selectie.

## Prestatieonderzoek

Twee algemene observers reageerden op iedere tekstvervanging in de hele body. Daardoor leidde een gewone tekstupdate (zoals een klok) opnieuw tot brede documentzoekacties en controle van de opslagmelding.

Een geïsoleerde browserproef met 60 tekstupdates veroorzaakte vóór herstel circa 810–812 documentzoekacties. Er waren in die proef geen geregistreerde long tasks. De doorlooptijd van de remote browser is geen betrouwbare snelheidsscore voor een fysieke Samsung Galaxy A54.

Herstel beperkt de glasobserver tot bestaande app-/dialoogwortels en negeert tekstwijzigingen. Nieuwe formulieren worden nog steeds direct voorbereid. De opslagmelding observeert alleen toevoeging/verwijdering op body-niveau en haar eigen zichtbaarheid/afmetingen; de gereserveerde ruimte wordt alleen bij een echte wijziging opnieuw gezet. De brede `:has()`-regel over alle menu-voorouders is vervangen door klassen op uitsluitend de werkelijke voorouders van het geopende menu. Opslagbeveiliging, PIN, datamodellen en bestaande schrijfroutes zijn niet gewijzigd.

## Verificatie

Nieuwe echte Chromium-suite `tests/visual-layout-browser.cjs`: 360/393/412 CSS-pixels, zowel normale als verminderde beweging, begrensde knophoogten, grotere bedieningslettertypen, bereikbaarheid van alle taakstatussen, zichtbare eerste taak, optionele invoer/sortering, titel-/kalenderstatusafbreking en maximaal 99 globale documentzoekacties voor 60 tekstupdates. Bestaande menu-, opslag-, PWA-upgrade- en functietests blijven vereist.

Validatie afgerond: 15 lokale kern-/regressiesuites geslaagd en alle 15 GitHub Actions-jobs op de herstelcode geslaagd (core, upgrade en 13 browsersuites). Een fysiek toestel, TalkBack, het Samsung-toetsenbord en batterij-/GPU-prestaties zijn hiermee niet bevestigd. De resterende ontwerpafwijkingen in de tabel zijn niet door deze gerichte herstelpatch opgelost.

## Controlebeelden

De beelden tonen links de echte app met fictieve data, rechts het oorspronkelijke voorstel met zijn eigen voorbeelddata. De afwijkende teksten en aantallen dienen niet als pixelvergelijking. De labels boven beide telefoons onderscheiden uitgangsversie en herstelversie.

- [Taken vóór herstel](visual-repair-20261029/taken-main-163ef84.jpg)
- [Taken na herstel](visual-repair-20261029/taken-herstel.jpg)
- [Aankoopwensen na titelherstel](visual-repair-20261029/wensen-herstel.jpg)
- [Agenda na stijl-/statusherstel](visual-repair-20261029/agenda-herstel.jpg)

De daadwerkelijke layoutmetingen van de nieuwe browserproef staan in [visual-layout-20261029.json](visual-layout-20261029.json). In alle zes combinaties waren de hoofdkeuzes 46 px hoog, de hele taakbalk 56 px en het aantal globale documentzoekacties voor 60 tekstupdates nul. Bij vergrote bedieningstekst bleef de balk circa 56,4 px. Ook het echte taakmenu is visueel geopend: de acties blijven boven de kaarten en boven de ondernavigatie bereikbaar.

## Validatie en release

Geteste codecommit: `6f817efa781c33047f1d467c46af40aff0203da7`. [De volledige Actions-run](https://github.com/jaribuijsman/Uitgavenkompas/actions/runs/40920970686) slaagde in alle 15 jobs, inclusief echte opslagconflicten tussen twee tabs, quota-/conceptbehoud, complete ZIP/binaire bijlagen, offline upgrade, bestaande menu's en de nieuwe layoutcontrole. Er zijn geen gegevensasserties verwijderd.

De eerste herstelrun `bccef94` had één mislukte opslagbrowserjob: de test drukte op de nieuwe ingeklapte snelle invoer zonder die eerst via de summary te openen. Die run telt niet als groene acceptatie. De daaropvolgende testwijziging bedient de echte uitklapknop en laat alle oorspronkelijke opslagasserties staan; daarna slaagden alle jobs.

Publicatiepakket: dezelfde geteste appcode, aangevuld met dit verslag, metingen en controlebeelden. Serviceworkerversie `memento-pwa-v67-20261029-visual-repair-v1` en expliciet vernieuwde URLs voor de drie gewijzigde presentatiebestanden. Geen wijziging aan de gebruikeropslag, schrijfbewaking, PIN, historische gegevens of oorspronkelijke illustraties. Een normale app-update volstaat; browsergegevens wissen is niet nodig.

De eerdere 234-punteninventarisatie was een bron-/functievergelijking. Zij bewijst geen 234 visueel afgeronde functies. De open afwijkingen in de tabel blijven open na deze herstelrelease; deze release is geen verklaring dat het hele ontwerpvoorstel af is.
