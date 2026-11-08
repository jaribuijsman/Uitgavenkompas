# Mijn dag V3 en afspraak-editor V2 — herstelcontract

Dit is het acceptatiecontract voor de op 31 oktober goedgekeurde ontwerpen. De
zelfstandige ontwerpvoorbeelden gelden niet als bewijs van werkende productie.

| Onderdeel | Vereist resultaat |
| --- | --- |
| Afspraakkaart | Zelfde vierkoloms indeling als taken: afvinken, tijdvak, titel/details met optionele notitieknop, driepuntjes. Alle acties minimaal 44×44 px, ook op 360 px. |
| Takenkaart | Bestaande vier kolommen: checkbox, tijd/datum, inhoud, driepuntjes. |
| Afspraakgroepen | Gepland eerst, daarna Nog open met aantal en oorspronkelijke datum. Lege groepen verborgen; bestaande chronologische volgorde binnen iedere groep behouden. |
| Notitie | Bij afspraken tussen titel en afvinken; bij taken bestaande positie. Volledige tekst bereikbaar zonder overflow. |
| Dagkeuze | Eén dag per scherm; menu/notitie openen verandert scrollbegrenzing of positie niet. |
| V2-editor | Titel met echte microfoon op één rij; tijden naast elkaar; checkbox 23 px in 44 px label. |
| Beheer | Verwijderen onder Meer opties, met bevestiging en bestaande undo. Footer: Annuleren en Opslaan. |
| Invoer | Hele dag schakelt tijden uit zonder conceptwaarden te wissen; notitie vergroten behoudt tekst. |
| Fouten | Ongeldige eindtijd en opslagfout behouden alle conceptinvoer en bestaande opgeslagen gegevens. |
| Veiligheid | Bestaande IDs, opslagvelden, bronnotities, Google read-only en financiële gegevens behouden. |

`tests/day-v3-browser.cjs` controleert de echte app op 360/393/412/1280 px, korte
hoogte, lege lijst en 43 taken. De test controleert kaartgeometrie én de combinatie
menu → bewerken → sluiten → dag wisselen, inclusief notitie-overlay. Screenshots
en meetrapport blijven ook bij een geslaagde CI-run als artifact beschikbaar.

Vóór merge: beoordeel de screenshots op de exacte PR-head naast het ontwerp en
controleer alle contractregels. Een groene CI of zichtbare knop vervangt deze
vergelijking niet. Meld fysieke Android-weergave uitsluitend als getest wanneer
die echt op een toestel is gecontroleerd. Bevestig na merge de geladen productie-
assetversies; een Pages-build alleen bewijst geen juiste weergave.

Deze controles verkleinen de kans op herhaling; zij garanderen geen foutloze app.

## Compacte afspraakkaarten — 2 november 2026

Gebruiker heeft dit ontwerp goedgekeurd en expliciet gevraagd alleen een PR te
maken. Browser-/Android-controle en beoordeling van CI-artifacts blijven bij de
gebruiker; deze uitvoering claimt geen visuele goedkeuring en doet geen merge.
Alleen de afspraakpresentatie in Mijn dag wijzigt. Agenda, taken, editors,
opslagvelden en afvinkhandlers blijven behouden. Controleer ook alleen oude
open afspraken, gemengde groepen, geen notitie, hele dag, lange titels en afronden/heropenen.

## Gelijke afspraak- en taakkaarten — 8 november 2026

De expliciete vraag van 8 november vervangt het eerdere afwijkende drieluiks raster voor afspraken op Mijn dag (2 november). Afspraken en taken gebruiken nu **checkbox → tijd/datum in dezelfde capsule → titel/details → opties**. De notitieknop blijft binnen de detailskolom; toegang tot menu, editor, afvinken, Google-afspraak en opgeslagen data blijven ongewijzigd. Op 360/393/412 px horen de rasterkolommen en tijdcapsules hetzelfde te zijn. Andere schermen blijven buiten deze wijziging.
