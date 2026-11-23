# Loonperiodes onder Instellingen

Goedgekeurd: gebruiker vroeg op 23 november 2026 om implementatie van het aangepaste prototype, met behoud van het financiële tabblad. Basis: e495745179eb2bfe53fbcee045e3649cdcc97993. Referentie: `design-review/salary-period-approved-20261123/index.html` (Sites-bron 843fd32efb49cf2b0699f44bf40a638896214461). De productie-instellingenschil blijft leidend: nieuwe ingang binnen bestaande groepen, geen vervangende instellingenpagina.

1. Instellingen bevat Loonperiodes; overzicht, bestaande transactiemodal en dashboardfilters blijven behouden. Bestaande periodevoorkeuren worden hergebruikt.
2. Salaris wordt expliciet bevestigd uit een bestaande inkomst of handmatige datum; geen automatische herkenning/nieuwe boeking. Maximaal één salarisgrens per kalendermaand, conform bestaande maandelijkse loonperioden. Vervangen van een grens vraagt bevestiging.
3. Beheer volgt gekozen loonperiode/kalendermaand en expliciete rekeningselectie. Alleen afgelopen perioden met bevestigde grenzen kunnen afgesloten worden; lopend/voorlopig blijft als tussenstand downloadbaar.
4. Afsluitingen bewaren exacte grenzen, rekeningselectie, transacties, analyse en budgetten in opeenvolgende versies. Wijzigingen aan transacties/splits/subcategorieën/budgetten/grenzen worden zichtbaar; eerdere versies blijven exporteerbaar. Bestaande monthClosures blijven ongewijzigd beschikbaar als kalendermaandhistorie.
5. JSON bevat volledige transacties, netto categorie/subcategoriebedragen, budgetten, passende vorige-periodevergelijking en gescheiden transfers; CSV dezelfde transacties incl. transfers en splitdetails. Elke export benoemt status/waargenomen einddatum; resultaat is geen banksaldo. Retouren verlagen uitgaven; interne creditcardaflossing telt niet dubbel.
6. Opslag loopt door bestaande finance save/guard en behoudt onbekende bestaande velden. Nieuwe archieven worden aan importgrens gevalideerd. Falen/quota/concurrentie verandert geen opgeslagen afsluiting en laat de invoer staan.
7. De bestaande modal/focus/terugroute wordt hergebruikt. Nieuwe primaire bediening 48px; 393px plus 360/412px voor rekening-/datumwrapping; geen overflow, laatste actie bereikbaar bij korte hoogte.
8. Offline assets zijn versieconsistent; JSON/ZIP-herstel bewaart versies; gerichte core/browsertests plus ongewijzigde centrale high-risk gate en upgradecheck.

Alle fixtures en exportvoorbeelden zijn fictief. Geen productiegegevens in publieke bron/artifacts. Fysieke A54/TalkBack-verificatie blijft afzonderlijk.
