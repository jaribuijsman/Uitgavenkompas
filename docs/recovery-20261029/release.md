# Memento — afronding resterende fases

Dit verslag vervolgt [de eerste herstelronde](resultaat.md). Opnieuw gecontroleerde uitgangs-main: `bf81413d6dc35fc097deeeb61c3eb09acf11834e`; PR #5 startte deze ronde op `1fc2b874474729d8f4df4d9b84188b5943dc6421`, met 58 geslaagde GitHub-checks. Main was niet gewijzigd. Vóór nieuwe codewijzigingen is de volledige Git-geschiedenis opnieuw geverifieerd en een tweede bruikbare bundle gemaakt: `/workspace/scratch/memento-release/pre-final-phase.bundle`, ref `1fc2b87`.

## Correctie van het eerdere vrijgavebesluit

De eerste ronde stelde een fysieke toesteltest, onafhankelijke menselijke goedkeuring en actieve branch protection te algemeen als verplichte publicatievoorwaarden. Het aangeleverde masterplan eist aantoonbare **relevante** functionele, opslag- en visuele acceptatie, geslaagde checks, geen kritieke regressies en een rollback. Het vraagt branch protection in te richten **“voor zover de verleende rechten dat toestaan”** en fysieke Android-beperkingen expliciet te noemen. Menselijke beoordeling blokkeert alleen waar deze onmisbaar is; er staat geen algemene onafhankelijke goedkeuringsplicht.

Daarom wordt de beperkte herstelrelease beoordeeld op echte browserrendering, objectieve geometrie/contrast, assistentinspectie van screenshots en opslag-/upgradebewijs. Geen fysieke of menselijke controle wordt als uitgevoerd opgevoerd. De ontbrekende beheerdersrechten worden niet omzeild. De bestaande voorafgaande gebruikersautorisatie voor voorwaardelijke merge/publicatie blijft van toepassing.

## Afgeronde aanvullende analyse en bronreparaties

De aanvullende audit gebruikt echte Chromium-rendering met axe-core 4.11.1, geïsoleerde fictieve gegevens en 360/393/412/1280 CSS-px. De 18 hoofdweergaven en geopende filters, bonnetjesstappen, formulieren, maandkalender en fitnessweergaven worden onderzocht. Geautomatiseerde contrastanalyse kan niet iedere tekst boven transparant glas/bosafbeeldingen berekenen; zulke gevallen blijven als `incomplete` in de ruwe bewijzen staan en worden visueel geïnspecteerd. Dat is geen volledige WCAG- of TalkBack-certificering.

| ID | Bewezen oorzaak | Herstel aan de eigenaar | Acceptatie |
|---|---|---|---|
| V01 | `.bill-date` combineert een vaste lichte achtergrond met globale `--green`, die inmiddels neongroen is. Gemeten contrast 1,37:1, maandlabel 9px. | Bestaande native regel gebruikt de donkere semantische tekstkleur op licht materiaal; maandlabel wordt 12px. Geen extra override of berekeningswijziging. | Alle datumbadges ≥4,5:1; label ≥12px; vier breedtes, geen clipping. |
| V02 | Transactiefilterchips en taakpresets gebruiken een benoemde generieke `div` zonder geldige rol. | De native taakmarkup en glass-eigenaar geven de bestaande groepen `role="group"`. | Geen bevestigde `aria-prohibited-attr`; filters/presets blijven functioneren. |
| V03 | Bonnetjestabs vervangen twee kaarten door één paneel, maar de ouder blijft het oude tweekolomsraster. Op desktop belandt de invoer rechts. | Layout markeert de getransformeerde ouder en bezit diens blokindeling. Native velden, handlers en alle drie stappen blijven intact. | Actief paneel onder de tabs, gelijke linkerrand en volle inhoudsbreedte, alle stappen op vier breedtes. |
| V04 | `.muted-box` combineert vaste bijna-witte achtergrond met globale lichte `--muted`. In Bonnetjes → Koppelen is het contrast 1,8:1. | Bestaande bronregel gebruikt donkere semantische tekst op het lichte materiaal, tekst minimaal 12px. | Meldingen voldoen aan 4,5:1, geen nieuwe contrastschending in geopende panelen. |

Deze fouten waren ook in de oorspronkelijke main aanwezig; zij zijn niet als nieuwe regressies uit de eerste herstelronde gepresenteerd. Geen gegevensschema, opslagkey, PIN, back-upformaat, berekening of definitief beeldbestand is gewijzigd. De wijziging aan bonnetjes herstelt de afgesproken tabvolgorde; er is geen nieuw ontwerp of nieuwe functie toegevoegd.

## Concreet lokaal resultaat

Alle **37 bestaande suites** zijn opnieuw geslaagd: 19 kernsuites, 16 oorspronkelijke browsersuites, de gerichte herstelbrowser en twee echte PWA-upgradepaden. De algemene visuele suite slaagt aanvullend op 360/393/412/1280 px. De nieuwe vrijgavesuite controleert **108 werkelijk gerenderde toestanden**, met nul bevestigde axe-overtredingen, passende bonnetjesgeometrie en exact behoud van Life/Finance/PIN. De datumbadges meten na herstel **13,98:1**, de lichte meldingen **15,2:1**. Bekijk [summary.json](release-evidence/summary.json), [de volledige toegankelijkheidsanalyse](release-evidence/release-acceptance.json) en de [108 captures](release-evidence/after/). Incomplete contrastgevallen blijven in het rapport zichtbaar en worden niet als automatisch goedgekeurd opgevoerd.

## Structurele borging

De bestaande volledige CI blijft behouden en krijgt `release-acceptance-browser.cjs`: alle 18 hoofdtabbladen op vier breedtes, echte aanvullende toestanden, bevestigde toegankelijkheidsfouten als harde fout, onoplosbare contrastgevallen zichtbaar in het rapport, geometrie van de bonnetjestabs en exact ongewijzigde Life/Finance/PIN na alleen-lezen navigatie. De overige bestaande veiligheidsasserties blijven ongewijzigd.

Een uniek aggregaat **`Memento release gate`** slaagt uitsluitend als alle core-, browsermatrix- en upgradejobs daadwerkelijk slagen. Het verbergt geen mislukte of geannuleerde matrixjob. Hierdoor kan één ondubbelzinnige status als verplichte check worden ingesteld; de workflow draait op iedere PR naar main zonder padfilter.

[branch-protection.json](branch-protection.json) is het concrete instelbare beleid: strikte actuele statuscheck van GitHub Actions, bescherming ook voor beheerders, PR-route, opgeloste gesprekken, geen force-push of branchverwijdering. Er wordt geen nieuwe menselijke goedkeuringseis aan de bestaande opdracht toegevoegd. Een echte PUT naar de GitHub-beschermings-API is uitgevoerd en kreeg **403 Resource not accessible by integration**. De beveiliging is dus **niet ingesteld**; de mislukte beheerhandeling wordt niet verward met de toegestane PR-merge. Bij vrijgave worden hoofd-SHA, basis-main, alle actuele checks en runtimehashes rechtstreeks opnieuw gecontroleerd, zonder force of bypass.

## Verificatie en vrijgaveprocedure

De concrete lokale resultaten, accessibility-rapporten, screenshots en API-uitkomst staan onder `release-evidence/`. Alle bestaande kern-/browsersuites en de twee bestaande PWA-upgradebaselines blijven onderdeel van de CI. De nieuwe worker/cacheversie is **`memento-pwa-v71-20261029-release-v1`**; alle gewijzigde JS/CSS-URLs zijn consistent vernieuwd in index en CORE. Voor een bestaande gebruiker verandert geen opslagpad.

Vrijgave vindt pas plaats wanneer alle checks op de nieuwste PR-head groen zijn, de werkelijke nieuwe schermen zijn geïnspecteerd, geen kritieke afwijking openstaat, main opnieuw gecontroleerd en eventuele wijzigingen verwerkt zijn en de controleerbare rollback beschikbaar is. De merge gebruikt de verwachte head-SHA. De bestaande GitHub Pages-route verzorgt publicatie. Na publicatie worden de live bestanden op SHA-256 vergeleken met de gepubliceerde commit en wordt de werkelijk geserveerde app in een nieuw geïsoleerd profiel getest, inclusief offline herladen en v71-cache. Deployment-/merge-SHA en nacontrole-uitkomst worden in PR #5 en het eindverslag vastgelegd; een voorbereidend verslag is op zichzelf geen publicatiebewijs.

## Resterende beperkingen

- Geen gekoppeld fysiek Android-/Samsung-toestel; native toetsenbord, OS-selectors, TalkBack, installatiegedrag, batterij/GPU en echte toestelprestaties zijn niet getest. Dit is niet als geslaagde toestelacceptatie aangemerkt.
- Branch protection kon wegens ontbrekende GitHub-administratierechten niet worden ingesteld. Het concrete beleid is gereed; de nieuwe gate is pas platformmatig afdwingbaar nadat een bevoegde beheerder dit beleid toepast.
- De oorspronkelijke zeer kleine secundaire labels en glas-/afbeeldingscontrastgevallen zijn geïnventariseerd. Er is geen algemene typografische herinrichting uitgevoerd. Visuele inspectie van deze bestaande labels is geen volledige toegankelijkheidscertificering.
- Echte Google OAuth, microfoon en Samsung Health blijven buiten de geïsoleerde fixturetests. Er zijn geen berichten, echte financiële gegevens of invoer naar die diensten verstuurd.

Deze beperkingen zijn onderzoeks-/borgingsresultaten, geen vervalste PASS. Eventuele nieuwe falende functionele of visuele controles blokkeren de release volgens het masterplan.

## Rollback

Het oorspronkelijke herstelpunt `backup/pre-recovery-20261029-bf81413` en de geverifieerde bundle blijven behouden. Daarnaast bestaat de volledige pre-vrijgavebundle op `1fc2b87`. Bij problemen na publicatie: revert de herstelrelease via een nieuwe PR, behoud alle actuele browsergegevens, geef teruggezette assets een **nieuwe hogere worker/cacheversie** en draai dezelfde opslag-/offline-/binaire-hashcontroles. Geen localStorage/IndexedDB wissen, geen oud schema terugzetten en geen branch verwijderen.
