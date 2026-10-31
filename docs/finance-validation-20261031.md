# Financiële validatie — auditbevindingen 3 en 4

Basis: `fd35f3381933c5ba96f8b5240902d9c167cd906c` (actuele main bij aanvang, 31 oktober 2026).
Branch: `fix/finance-validation`. Risicoklasse 3: financiële opslag en import.

## Bevestiging en contract

Beide bevindingen zijn **BEVESTIGD**, met uitsluitend fictieve, geïsoleerde opslag:

- De oorspronkelijke code laadt `{transactions: {unexpected: 'fixture'}, categories: []}` zonder blokkering, maakt `transactions` leeg en overschrijft de bron bij `save()`.
- De oorspronkelijke JSON-import bewaart een transactie met `amount: 'bad'`.
- Dit reproduceert de technische faalscenario's; werkelijk verlies van gebruikersgegevens is hiermee niet vastgesteld.

Acceptatie: ongeldige bestaande opslag blijft byte-identiek bewaard en financieel schrijven blijft geblokkeerd. Financiële JSON, gecombineerde oude JSON, lokale herstelkopie en ZIP worden vóór bevestiging/schrijven gecontroleerd. Een mislukte financiële herstelwrite verandert geheugen of blokkering niet. Bedragen, IDs en referenties worden nooit gerepareerd. Geldige historische gegevens blijven bruikbaar. Bestaande schermen, berekeningen, PIN, opslagkeys, ZIP-formaat en worker-fetchgedrag blijven behouden.

## Implementatie

`assets/memento-finance-validation.js` is de gedeelde, mutatievrije grenscontrole voor transacties, categorieën, rekening-ID's, transfers, splits, budgetten, vaste lasten, doelen, bonnen, onderzoeksrecords, prullenbak, instellingen en financiële historische totalen. Onbekende toekomstige schemaversies worden geweigerd. Uitbreidingsmetadata wordt behouden.

`prepareFinance()` valideert vóór de bestaande compatibiliteitsdefaults. Ondersteund: ontbrekende optionele legacyvelden, ontbrekende rekening als persoonlijke rekening, `startBalance` zonder `accountOpening`, expliciete `null` voor ongebruikte transactievelden, een leeg werkelijk saldo en ontbrekende subcategorieën. De splittolerantie volgt de bestaande editor (0,009 euro); bedragen worden niet afgerond of gewijzigd. Historische categorie- en bill/receipt-referenties kunnen na verwijdering blijven bestaan en worden daarom niet automatisch vervangen of als ontbrekende rekening behandeld.

Financiële JSON en lokale herstelkopie delen één guarded herstelcommit; geheugen en blokkering worden pas na succes bijgewerkt. Import tijdens demomodus wordt geweigerd. Gecombineerde JSON valideert Financiën wanneer die daadwerkelijk wordt geïmporteerd. ZIP valideert vóór bijlageherstel; export weigert eveneens ongeldige financiële inhoud. De bestaande schrijfslot-, journal-, rollback- en bestandscontroles blijven van toepassing.

De nieuwe asset is synchroon vóór de financiële app geladen en opgenomen in cache v95; gewijzigde asset-URL's zijn gelijk in HTML en precache. De bestaande planner behandelt de validator als hoog risico met upgradecontrole. De nieuwe tests draaien in de bestaande corejob en opslagbrowsersuite; er is geen extra matrix.

## Uitgevoerd bewijs

- `node tests/finance-validation.cjs`: **33 controles geslaagd**. 28 negatieve fixtures doorlopen laden, financiële JSON, oude gecombineerde JSON, lokale recovery en een checksum-geldige ZIP. Opslag, PIN, geheugen en bijlagen blijven bij weigering intact; tevens succesvolle/mislukte/geannuleerde recovery en legacybehoud.
- Alle toepasselijke corecommando's uit `.github/workflows/app-review.yml` lokaal geslaagd, inclusief opslag, native locks, financiële regressies, planner en kennis-/bijlagechecks. Twee oude ZIP-testfixtures kregen geldige transactievelden; assertions zijn behouden.
- `tests/app-review-browser.cjs`: geslaagd op 360/393/412 px, inclusief transacties en bestaande taken/Fitness.
- `tests/storage-safety-browser.cjs`: geslaagd, inclusief echte JSON/ZIP-bediening, native schrijftoegang, conflict-/quota-afhandeling, IDB-bijlagen, geldige back-uproundtrip, ongeldige financiële import zonder opslag- of bestandswijziging en offline herstart.
- `tests/recovery-upgrade-browser.cjs`: main → nieuwe worker → offline herstart geslaagd. Originele hoofdopslagstrings en PIN identiek; binair bijlagehash behouden; validator offline aanwezig.
- Gerichte Chromium-voor/na-render met dezelfde fictieve gegevens op 360/393/412/1280 px: dashboard en instellingen hebben dezelfde geometrie, zonder documentoverflow. De zes mobiele screenshots zijn pixel-identiek; desktopinstellingen ook. Desktopdashboard visueel beoordeeld, met gelijke geometrie. Bij corrupte bron blijft een geblokkeerd transactieconcept beschikbaar en de bron ongewijzigd.

Screenshots en lokale logs: `/workspace/scratch/memento-finance-evidence/`. Fysieke Samsung A54/standalone is **NIET GETEST**. De volledige centrale GitHub-releasecontrole is apart zichtbaar op de PR voor de exacte head; lokale controles vervangen die niet.

## Resterende scope en vrijgave

Alleen reparatie-PR 1 uit de overdracht is geïmplementeerd. Bevindingen 1, 2 en 5–9 zijn hier niet opnieuw geaudit of opgelost. GitHub-branchinstellingen zijn niet gewijzigd. Geen gebruikersopslag of productieomgeving benaderd. Geen merge of publicatie uitgevoerd. De PR vereist de groene centrale release-gate en afzonderlijke autorisatie voor merge/publicatie.
