# Memento — glaseffecten en scrollbelasting

De klacht is haperend scrollen na de glasupdate. Uitgangspunt is `main` op `7503b542d9f37bdf059a552397b666d7e008eef2`. De gebruiker heeft gevraagd dit op main op te lossen.

## Ontwerp- en gegevenscontract

Behoud de bosachtergrond, gouden branding, groene transparante materialen, bestaande tekst, schermindeling, touchdoelen en functies. Vervang live achtergrondvervaging door een dichter geschilderd groen verloop. Geen nieuwe instellingen, extra observers, gewijzigde opslagkeys, migratie of gebruikersgegevens in testmateriaal. Startportaal, PIN-scènes en originele artwork blijven behouden. De mobiele achtergrond mag met de pagina meescrollen.

## Wijziging

- Verwijder de live `backdrop-filter` uit de bestaande eigenaren van kaarten, navigatie, dialogen, analysetabs en financiële keuzepanelen. Dit voorkomt dat deze oppervlakken tijdens scrollen hun achtergrond moeten vervagen. Geen aanvullende algemene override-laag.
- Verhoog de dekking van het gedeelde groene kaartmateriaal van 50–52% naar 86–88%, zodat tekst ook zonder blur leesbaar blijft.
- Gebruik tot en met 800 CSS-px een meescrollende bosachtergrond. Desktop behoudt de bestaande achtergrondpositie.
- Behoud de korte bestaande binnenkomst-/lichtanimaties. De diagnose liet zien dat die eindigen; deze wijziging richt zich op de blijvende grafische belasting.
- Vernieuw de gewijzigde asset-URL's en de PWA-cache naar `memento-pwa-v72-20261029-scroll-v1`.

## Controle

`tests/glass-rendering-browser.cjs` controleert de werkelijk berekende stijl van alle 18 hoofdschermen, navigatiemenu op mobiel, rekeningkeuze, tweede analysetab en beide invoerdialogen op 360/393/412/1280 CSS-px. Het gebruikt normale beweging, bewaakt de afwezigheid van actieve achtergrondvervaging en mobiele vaste achtergronden, controleert breedte en scrollbediening en vergelijkt de exacte Life/Finance/PIN-opslag vóór/na. De suite draait voortaan in de bestaande verplichte release gate.

De identieke baselinecollector registreert het oude gedrag op de onveranderlijke uitgangscommit. De nieuwe suite behoudt strikte assertions; de collector wordt niet als geslaagde prestatietest opgevoerd.

| Scherm bij 393 px | Weergegeven blur-oppervlakken vóór | Na |
| --- | ---: | ---: |
| Mijn dag | 5 | 0 |
| Taken | 3 | 0 |
| Notities | 12 | 0 |
| Analyse | 10 | 0 |

De telling omvat weergegeven elementen in het document, ook onder de vouw. Voor/na-screenshots en de volledige meetrapporten staan onder `evidence/`. Bestaande tests omvatten daarnaast 0/1/43 taken, menu-hitboxes, taakafronding, filters, Agenda en Mijn dag, 108 schermtoestanden met axe en gereduceerde beweging, en gegevens-/binaire-bijlagebehoud bij echte PWA-upgrades. Ook de direct voorafgaande v71-release krijgt een aparte upgradecontrole in CI.

De exacte testresultaten, head-/merge-SHA en publicatienacontrole worden vastgelegd in de bijbehorende PR. Er is geen fysieke Android-/Samsung-FPS-meting: nul live blur-oppervlakken is aantoonbaar, een gegarandeerde framesnelheid op een telefoon niet. Automatische toegankelijkheidschecks zijn geen volledige WCAG-certificering.

## Terugval

Herstelpunt: lokale branch `backup/pre-glass-performance-7503b54` en onveranderlijke uitgangscommit hierboven. Indien nodig: revert via een nieuwe PR, geef teruggezette assets een hogere nieuwe worker/cacheversie en herhaal gegevens-/offlinecontroles. Geen browseropslag wissen.
