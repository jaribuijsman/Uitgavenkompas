# Taken v4 — uitvoeringscontract

Basis: `11a70931c13ae36ec89628e7a6794fadf5c000cd` (main, gecontroleerd 2026-11-01).
Risico: niveau 3. Alleen de Markdown-specificatie was bijgevoegd; het genoemde
HTML-prototype ontbrak. De bestaande app en de specificatie bepalen de uitvoering.

1. `renderTasks` groepeert bestaande categorieën, zonder lege groepen. Filters,
   statussen, menu's en de bestaande Sortable-adapter blijven werken; handmatig
   sorteren werkt binnen categorieën. Bewijs: browserroute met zoeken en slepen.
2. `editTask` behoudt alle velden. Optionele `planning.estimateMinutes` is een
   geheel getal 1–1440 of onbekend; bestaande taken krijgen geen fictieve duur.
   Bewijs: invoer, wissen, opslaan, validatie en bibliotheek/duplicaat.
3. Stappen behouden tekst, status en extra velden, ook met dubbele stapteksten.
   Omhoog/omlaag en afvinken gebeuren in het editorconcept. Geen slimme voorstellen
   in deze versie. Bewijs: bewerken, herschikken, annuleren en heropenen.
4. Alleen de bestaande editor biedt een uitklapbare timer voor opgeslagen taken.
   Eén sessie tegelijk, monotone actieve tijd, guarded checkpoints bij acties;
   achtergrond, sluiten, herstart en vergrendeling vereisen controle. Geen
   automatisch meegetelde achtergrondtijd. Bewijs: lifecycle en opslagfouten.
5. Stoppen vraagt correctie/bevestiging. Bevestigde sessies blijven afzonderlijk
   in `timing.measurements` met taak- en uitvoerings-ID; een aparte expliciete
   keuze vult de schatting in het concept. Normaal Opslaan bewaart die keuze.
6. Afronden gebruikt dezelfde taak en bestaande kalenderberekening. Alleen bij
   geslaagde afronding roteert een aanwezige timing-uitvoerings-ID. Metingen blijven
   bij hun oude uitvoering; undo herstelt alles. Mijn dag blijft ongewijzigd.
7. Geen nieuwe opslagkey, API of rootmigratie. JSON/ZIP bewaren aanvullende
   metadata; validatie vóór commit/herstel, rollback en exclusieve opslaglock
   beschermen data. Bibliotheek/dupliceren kopiëren geen timing. Bewijs: gerichte
   regressie plus centrale niveau-3-gate en upgrade van bovenstaande main.
8. Echte Chromium-render op 360/393/412 en desktop, 0/1/43 taken, lange tekst,
   menu en editor; minimaal 44px bediening en bereikbare acties bij korte viewport.
   Voor/na met dezelfde geïsoleerde fixture. Geen fysieke Android-claim.

Publicatie en merge zijn uitgesloten. Centrale PR-CI is de releasecontrole;
geen dubbele handmatige domeinmatrix. Zie het opleverrapport voor resultaten.
