# Hoofdkwartieren — goedgekeurd ontwerp en implementatiecontract

Referentie: `headquarters-approved-20261103.html`. Jari keurde het verticale ontwerp goed en vroeg daarna om subtiele bewerkknoppen en verslepen via Bewerken, gevolgd door Volgorde opslaan. Vervolgens gaf hij opdracht tot implementeren. Baseline: main `d2ae12bfd32f05d64722f14fcaabafd298189b2d` (3 november 2026).

## Acceptatiecriteria

1. Het hoofdscherm toont compacte inbox/invoer boven één verticale lijst. Kaarten behouden hun bestaande illustratie, naam, ID en link. Geen horizontale paginering.
2. De aparte kaartbewerking is een subtiele ellips met minimaal 44×44 px aanraakvlak; tikken hierop opent geen externe pagina.
3. Bewerken opent een tijdelijke sorteerlijst met sleepgrepen. Aanraken van de greep start direct slepen; gewoon scrollen elders blijft werken. Bestaande SortableJS verzorgt touch, toetsenbord en randscrollen.
4. Alleen Volgorde opslaan schrijft de nieuwe hoofdkwartierenvolgorde. Annuleren/terug bewaart niets; een opslagfout behoudt de bewerkbare poging. Herstart bewaart de laatst succesvol opgeslagen volgorde.
5. Toevoegen en kaartbewerking gebruiken de bestaande editor, bestandsopslag en bewaakte writes. Naam, omschrijving, HTTPS-link, pictogram en afbeelding zijn aanpasbaar. De tien afgesproken categorieën zijn invulvoorstellen, geen automatische herindeling van persoonlijke data.
6. De Notion-pagina-ID voorkomt dubbele koppelingen, ook bij een andere titel/host/query. Een verborgen kaart wordt via bestaande Mappen/Archief hersteld. Notion-inhoud wordt door deze appwijziging niet gewijzigd.
7. Notion-kaarten gebruiken exact dezelfde HTTPS-anchorroute als de bestaande Receptenkaart, zonder nieuw intent-schema, nieuw tabblad of iframe. Native Android-bestemming en terugkeer vereisen nog toestelcontrole; browser-CI bewijst dit niet.
8. Bestaande notities, dagboek, Fitness en overige appdelen blijven behouden. Offline assetversies en cache worden samen bijgewerkt. Geen persoonlijke back-up of notitiegegevens in broncode/CI.

## Aansluiting op bestaande gegevens en vormgeving

De app gebruikt de bestaande appnavigatie, kaarteditor en groene/gouden stijleigenaar. Het prototype toonde tien voorbeeldkaarten; de implementatie toont de echte bestaande hoofdverzamelingen en biedt de tien namen als startkeuzes bij toevoegen. Geen bestaande map wordt automatisch hernoemd, verborgen of naar Notion verplaatst. Daardoor blijft de inhoud bereikbaar terwijl de gecontroleerde inhoudsoverdracht een afzonderlijke stap blijft. De bestaande Recepten-startkaart wordt pas bij expliciet opslaan van de sorteervolgorde als normale kaart vastgelegd; annuleren schrijft ook daarvoor niets.

## Bewijsgrenzen

Functionele coretests en de bestaande workspace-browserjourney dekken de gewijzigde routes. De browserjourney controleert touch/muis, tijdelijke volgorde, annuleren, expliciet opslaan, herstart, opslagfout, toevoegen/bewerken en archiveren/herstellen. Screenshotreview van de exacte PR-head blijft vereist. Fysieke Android-Notionopening, TalkBack en geïnstalleerde-PWA-cache zijn niet lokaal geverifieerd. Implementatieautorisatie geeft geen afzonderlijke merge-/publicatieopdracht.
