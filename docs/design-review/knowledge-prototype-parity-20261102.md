# Kenniscentrum — bindende prototypeacceptatie (2 november 2026)

**Originele gebruikersreferentie:** `memento-kenniscentrum-prototype.html` (SHA-256 `8fe95983290fb8f63c080932530a763eb9f628d97ff6156183bbce329b84b837`). De originele privéfixture bevat medische persoonsgegevens en hoort niet in een publieke GitHub-repository. [Deze geanonimiseerde, interactieve referentie](knowledge-prototype-approved-20261102.html) behoudt het originele HTML/CSS-ontwerp en de interactieroutes, met alleen fictieve notitie- en brongegevens.

**Bron:** expliciete gebruikersgoedkeuring en implementatieopdracht 2 november 2026. **Technische basis:** actuele `main` bij branchstart, `AGENTS.md`, Design System Guardian en Android UX Inspector. **Scope:** bestaande Kenniscentrum kennisitem-editor, niet het algemene Kenniscentrum-overzicht en niet de dagboekeditor.

## Acht acceptatiecriteria

1. **Mobiele header:** kruimelpad; compacte sticky balk Terug / Kennisitem bewerken / Meer / saliekleurig Opslaan. Geen overlap met de hoofdheader of toetsenbordbediening.
2. **Schrijfkaart:** Titel eerst; Type en Verzameling naast elkaar; Inhoud met een horizontaal scrollbare, enkele werkbalk. Voor gewone notities H1, Vet, Lijst, Link en Taak uit selectie, zonder standaard uitgeklapte bijblokken.
3. **Bestaande gestructureerde notities:** behouden hun documentblokken, checkliststatus, brongegevens en templates; de visuele blokeditor wordt compacter getoond. Geen automatische migratie van een document naar een gewone textarea.
4. **Organiseren:** één compacte kaart met Verzameling, labels als chips en 'Ook tonen in andere mappen'. Map- en labelkeuzes blijven lokale echte bewerkingen; meervoudige mappen delen één notitie-ID.
5. **Slim opvolgen:** één saliekleurige hoofdactie 'Nieuw vervolg' naast een afzonderlijk koppelingenmenu. De uitschuiflijst toont Vervolgtaak, Vervolgafspraak en Vervolgnotitie; de bestaande veilige Memento-vervolgflow slaat het gekozen soort op met bronrelatie.
6. **Beheer/bijlagen:** een compacte laatste kaart met Bijlagen en Alle overige acties. Echte bestandskeuze en lokaal opslaan blijven beschikbaar; bestaande revisies, archief en prullenbak blijven behouden.
7. **Schermen na interactie:** vergelijk de echte editor en het HTML-prototype op 393 CSS-px, inclusief tekstinvoer, open Vervolg-/Meer-/Bijlagen-sheets, boven/midden/onderaan scrollen en bereikbare laatste actie boven de navigatie. Neem 360/412 en korte viewport mee vanwege sticky/keyboardrisico.
8. **Veilige oplevering:** geen gegevensverlies, geen fictieve data in gebruikersopslag, geen externe oproepen of nieuwe afhankelijkheden. Oplevering als visueel GESLAAGD pas na daadwerkelijke visuele vergelijking van de goedgekeurde referentie met de *PR-head*-render; groen CI zonder die vergelijking blijft NIET GEVERIFIEERD.

## Implementatiecontract

| Prototype | Bestaand Memento-onderdeel | Aangepaste presentatie |
| --- | --- | --- |
| Sticky editorbar | `renderEditor`, `header`, `save`, `back` | `.kc-v3-editor-head` en compacte `.kc-header` |
| Titel / Type / Verzameling | `editing.title/kind/collectionId` | `.kc-v3-writing-card`, `.kc-v3-meta-two` |
| Textarea en document | `kc-body`, `renderVisualDocument`, `ws-block` | Een editorpaneel per bestaande opslagvorm |
| Organiseren | `tags`, `W.setLocations` | Compacte rijen, lokale dialogen |
| Vervolg | `MementoLifeFlow.start`, `mementoFlow.origin` | Keuzesheet vóór de bestaande veilige flow |
| Bijlagen | `attach`, `S.save`, `attachmentsHTML` | Ondergebracht in echte bijlagensheet |
| Meer / geschiedenis | `pin`, `archive-item`, `versions`, `delete` | Bottom sheet, geen open beheerpanelen |

De keuze voor de bestaande MementoLifeFlow-formulierstap ná de nieuwe vervolgkeuzes is een **bewuste functionele veiligheidsafwijking** ten opzichte van de demonstratiesheet in de losse HTML: echte bronvalidatie, omzetting, mapkeuze en opslag blijven daar beschikbaar. Beschouw dit niet als bewezen visuele 1-op-1-pariteit voor die vervolgformulierstap zonder aanvullende schermvergelijking.

## Verificatie

De browserjourney `tests/knowledge-workspace-browser.cjs` + `tests/helpers/knowledge-workspace-browser-checks.cjs` toont de gewijzigde editor en maakt screenshots van de referentie, schrijfkaart, vervolg-, bijlagen- en beheersheets. `knowledge-prototype-geometry.cjs` controleert relevante viewport-/scrolltoestanden. De centrale CI-gate blijft leidend. Fysieke A54-controle wordt niet geclaimd op basis van Chromium.
