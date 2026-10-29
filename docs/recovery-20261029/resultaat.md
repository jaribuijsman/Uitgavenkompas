# Memento — herstelverslag, 29 oktober 2026

## Bereikt resultaat

Onderzoek en de noodzakelijke herstelpakketten zijn uitgevoerd op een afzonderlijke branch. **Niet gemerged en niet gepubliceerd.** De herstelcode staat in [concept-PR #5](https://github.com/jaribuijsman/Uitgavenkompas/pull/5). De resterende vrijgaveblokkades staan hieronder; dit verslag verklaart niet dat alle mogelijke schermtoestanden, toegankelijkheid en fysieke Android-ervaring volledig zijn goedgekeurd.

Oorspronkelijke en opnieuw gecontroleerde main: **`bf81413d6dc35fc097deeeb61c3eb09acf11834e`**. Herstelbranch: **`fix/memento-recovery-20261029`**. Codepakket na de laatste visuele correctie: **`250318afdb41354c4980a619bc9ad0212df06003`**; een volgende documentatiecommit voegt alleen verslag en bewijzen toe. [De SHA-256-manifestatie](evidence/tested-runtime-sha256.json) legt alle geteste runtimebestanden vast, zodat ook na een documentatiecommit controleerbaar is welke appcode is getest.

Alle **15 oorspronkelijk zichtbare branches** en alle **vier bestaande PR's** zijn geïnventariseerd, inclusief expliciet lege vervolgpagina's. De volledige matrix, oorspronkelijke SHA's, merge-bases, voor/achterstand, CI-bewijs en hergebruikbeoordeling staan in [het onderzoeksrapport](audit.md). Geen branch is verwijderd. Niets is blind overgenomen: de meeste branch-tips zitten al in main; de oude KC2-functies zijn anders geïmplementeerd aanwezig en getest. De cockpit-preview en schrijfproef zijn geen noodzakelijke reparaties.

## Oorzaken en definitieve wijzigingen

| Probleem | Oorzaak | Definitief herstel | Bewijs |
|---|---|---|---|
| Dubbel/groot taakafvinkkader | Laat geladen glassregels leggen een kaartachtige rand/achtergrond over een ouder pseudovak | Strijdige glass/inline/today-regels verwijderd; één eigenaar in `memento-ui.css`; 22px zichtbaar vak binnen **48×48px** transparant doel met passende gridkolom | recovery/report; before/after/*/tasks.jpg |
| Bewaar selectie verdringt de lijst | `paintTaskFilterChips()` voegde de bewaarknop altijd vóór results toe | Presetbeheer in de bestaande native Filters-disclosure; lege chips nemen geen ruimte in; Sorteren direct in de native template, geen achteraf verplaatsen meer | Preset bewaren/laden/wissen/reload; 54px hogere eerste taak |
| Kleine afspraakbediening en verborgen grote hitbox | 28×36px element en pseudo-after buiten de gridkolom; bewerk 36px hoog | Native afspraakbron: 44px kolom/doel, 22px zichtbaar vak binnen het doel, bewerk minimaal 44px; buitenliggende hitbox verwijderd | Mijn dag/Agenda, completion/heropen/edit en geometrie |
| Meerdere tokenbronnen | ui en glass definieerden ieder eigen `:root` | `memento-tokens.css` beheert matte/glazen kleuren, font/regelafstand, ruimte, radiussen, schaduw en checkboxgeometrie; bestaande materiaalwaarden behouden | Pixelvergelijking en alle schermcaptures |
| Dubbele disclosureconstructie | glass en layout hadden ieder een helper voor dezelfde native knopen | `memento-disclosure.js` vormt bestaande knopen; callers houden component-/open-state-eigenaarschap; keyed idempotentie behouden | Herhaalde refresh verandert DOM noch opslag; layout/full suites |
| Visuele PR-workflow faalt op verborgen kalender | Daglijst actief; oude test zoekt maandknoppen en negeert latere disclosures | Maandtab en echte disclosures openen; transactietitel gebruiken voor bewerken; quick capture via summary openen | Visual review op vier breedtes; alle oorspronkelijke functionele/veiligheidsasserties behouden |
| Volledige acceptance niet op iedere PR | Workflow had alleen beperkte pushbranches | `app-review.yml` heeft PR-trigger op main zonder padfilter, alle 19 kernsuites, 17 browsersuites en twee echte PWA-upgradebaselines; bewijsartefacten blijven beschikbaar | PR Actions met core, browsermatrix en upgrade |
| Projectafspraken ontbraken | Geen AGENTS.md in de oorspronkelijke checkout | Gerichte afspraken over hiërarchie, data, stijl-eigenaars, echte browsercontroles, PWA/rollback en rapportage | Root-AGENTS.md |

De eerste implementatieronde gebruikte 44px taakdoelen. De bestaande masterplan-assertie eist echter **48px**. Die veiligheidseis is niet verlaagd: het definitieve doel is 48px en het zichtbare vak blijft 22px. Ook de gridkolom is 48px; geen overlap met titel/menu. Een brede vervanging raakte tijdens herstel twee boodschappen-gridregels. De pixelvergelijking ontdekte de extra 4px en tekstafbreking; de definitieve correctie herstelt daar de oorspronkelijke 44px-kolom. De nieuwe regressie controleert dit apart. Een te vroege uitlezing van de Mijn dag-summary in de bestaande patchtest is verholpen door op zichtbaarheid te wachten; de oorspronkelijke assertions blijven staan.

Geen gegevensmigratie, reset, wijziging aan opslagidentifiers, berekeningen, ZIP-formaat, PIN-logica of definitieve illustraties. De domeinmodules voor opslag/backup/finance/fitness/notities zijn niet herschreven. Geen test is verwijderd en geen bestaande veiligheidsassertie is verzwakt.

## Werkelijk uitgevoerde controles

De auditbaseline had 19/19 kernsuites en 15/16 bestaande browsersuites groen. De oorspronkelijke falende Visual review en het nieuwe gerichte hersteltestscript tegen de oorspronkelijke main zijn opgeslagen; de nieuwe test faalt daar terecht op de permanent zichtbare bewaarknop. Er wordt geen oorspronkelijke fout als nieuwe fout gepresenteerd.

| Controle | Uitkomst | Vindplaats |
|---|---|---|
| Alle 19 kern-/opslag-/berekenings-/ZIP-/PIN-suites | PASS | final-core-results.json en logs/ |
| Alle 16 oorspronkelijke browsersuites, inclusief gerepareerde Visual review | PASS na gedocumenteerde herstelrondes; visual op 360/393/412/1280 | logs/; de eerste volledige tussenronde met twee fouten blijft apart bewaard |
| Nieuwe `recovery-browser.cjs` | PASS: 12 combinaties van vier breedtes en 0/1/43 taken; lange titel, menu/hitbox, complete/heropen via toetsenbord, presets, refresh-idempotentie, bewaarde data/reload; bij één taak ook boodschappen en afspraken | recovery/report.json en beelden |
| Oude `masterplan-journeys.cjs` | PASS: vijf echte invoer-/zoek-/dagboek-/betalingsstromen vóór/na en upgrade vanaf `52ac8c2` | old-upgrade/report.json en old-upgrade.log |
| Nieuwe `recovery-upgrade-browser.cjs` | PASS: oorspronkelijke main `bf81413` → herstel → offline, identieke Life/Finance/PIN, binaire hash gelijk, oude cache weg en nieuwe token/helper-assets offline aanwezig | upgrade/report.json |
| Horizontale overflow, formulieren, korte viewport, focus, invalid/save/edit/cancel | PASS binnen geteste toestanden en breedtes | after/*/report.json; bestaande browserlogs |
| Visuele controle alle 18 hoofdtabbladen vóór/na | Uitgevoerd door assistent op 360/393/412/1280; werkelijke Chromium-beelden en geometrie; geen onafhankelijke menselijke eindacceptatie | [Vergelijkingsviewer](index.html), before/after |
| Fysieke Samsung/Android, Samsung-toetsenbord/select, TalkBack, installatie/performance | NIET GETEST | Handmatig protocol in audit.md |
| Branch protection/rulesets | Geen actieve bescherming aangetoond; detail/configuratietoegang 403 | github-branches/rulesets/protection.json |
| Publicatie | Niet uitgevoerd; publieke worker nog v68 | public-version.json |

Browsertooling: Playwright 1.62.1 met daadwerkelijk geïnstalleerd Chromium, buiten de appbron. Node 24.19.0. Fictieve fixtures, nieuwe geïsoleerde contexts en lokale HTTP-origins; externe auth/weerrequests zijn waar relevant geblokkeerd of met fixtures beantwoord. Geen persoonlijke gebruikersopslag benaderd. Tests die bestaande historische screenshots onder docs/ overschrijven zijn geïnspecteerd en die historische bestanden zijn hersteld; nieuwe bewijzen staan apart in deze map.

Reproduceer de visuele suite door `node tests/helpers/visual-fixture.cjs` naar een tijdelijk JSON-bestand te schrijven en `NODE_PATH`, `MEMENTO_VISUAL_FIXTURE`, `MEMENTO_VISUAL_WIDTH` en `MEMENTO_VISUAL_OUT` te zetten voor `node tests/visual-browser.cjs`. De recovery-suite schrijft onder `MEMENTO_RECOVERY_OUT`. Voor de nieuwe upgradetest wijst `MEMENTO_RECOVERY_BASELINE_ROOT` naar een uitgepakt immutable `bf81413`-archief. De bestaande upgrade houdt zijn eigen `52ac8c2`-baseline. Alle CI-commando's staan in `app-review.yml`.

## Visueel resultaat en grenzen van vergelijking

Er zijn 128 oorspronkelijke viewportbeelden bewaard, inclusief gerichte kalender/filterproeven, en 151 beelden uit de definitieve algemene visuele suite, plus aparte 0/1/43-/menu-/upgradebeelden. De eerste 29 toestanden per breedte zijn tussen vóór en na vergelijkbaar: 116 beeldparen. [pixel-comparison.json](evidence/pixel-comparison.json) bevat onbewerkte tellingen en verschilgebieden; geen tolerantie is gebruikt om een rode baseline alsnog groen te verklaren. Naast de bedoelde verschillen bestaan kleine rendering-/JPEG-afwijkingen. De 360px-navigatiecapture heeft een andere interne scrollpositie. Die is daarom niet als bewezen identiek aangemerkt.

In de vaste mobiele taakfixture begint de eerste taak **54px hoger: y=452 → y=398**. Dezelfde lange-taakfixture in de gerichte suite toont een volledig zichtbare eerste taak boven de bodemnavigatie. Compact zichtbaar vak: 22×22px; taakdoel: 48×48px; afspraakdoel: 44×44px. De menu's zijn daadwerkelijk geopend en op hit-testing/viewportgrenzen gecontroleerd. De aanvullende 25%-tekstvergroting en landscapecontrole van de bestaande masterplansuite slagen. Dit simuleert geen volledig Android-schermtoetsenbord of native OS-fontinstelling.

Alle onaangeraakte hoofdtabbladen zijn opnieuw bekeken. De financiële logica, merkassets en visuele materiaalwaarden zijn behouden. Niet voor iedere mogelijke combinatie van leeg/fout/laden/dialog/menu in alle 18 tabs bestaat afzonderlijk screenshotbewijs. Externe Google-auth, echte microfoon/Samsung Health en fysieke toestelprestaties blijven onbekend. Kleine metadata/contrast en de bestaande bonnetjes-desktopindeling zijn als vervolgaudit vastgelegd; hiervoor is geen ongecontroleerd redesign toegevoegd.

## GitHub-controles en veilige stop

De oorspronkelijke codecommit `7509ede3a278ed3b9f168e510a6dfa64a682f5d6` is via de nieuwe volledige PR-workflow en de bestaande specialistische workflows getest. De definitieve correctie `250318a` behoudt alleen de bestaande boodschappengeometrie en voegt daarvoor een assertion toe. De CI-status is tijdgebonden: [controleer de checks van de nieuwste PR-head](https://github.com/jaribuijsman/Uitgavenkompas/pull/5/checks), niet alleen een eerdere groene run. Eventuele opgeslagen `github-final-checks.json`/`github-code-runs.json` geven het exacte controlemoment, SHA en resultaat. Een documentatiecommit is geen nieuwe runtimewijziging; het SHA-256-manifest maakt die gelijkheid controleerbaar.

**Vrijgave geblokkeerd.** Het masterplan eist: “Als controles falen, visuele acceptatie niet aantoonbaar is […] stop vóór merge/publicatie.” De technische browsercontrole is uitgevoerd, maar onafhankelijke menselijke visuele acceptatie en fysieke Android-controle zijn niet beschikbaar. Daarnaast zijn er geen actieve verplichte GitHub-checks/rulesets en ontbreken de administratierechten om die beveiliging in te richten/volledig te verifiëren. Geen bypass of force-merge toegepast. Dit is een concrete veilige stop vóór publicatie, geen verzoek om tussentijdse inhoudelijke goedkeuring.

Openstaande borging: R07 branchbeveiliging met vereiste core/browsermatrix/upgradechecks en reviewregels; R09 fysiek Android-/toegankelijkheidsprotocol; R10 gerichte contrast/kleine-tekstmetingen en verdere veilige componentextractie. Het gehele masterplan is daarmee **nog niet volledig vrijgegeven**. Wel zijn audit, bronreparaties, testherstel, eigenaren/tokens, CI-uitbreiding en concrete reviewartefacten opgeleverd.

## Herstelpunt en rollback

Remote herstelref **`backup/pre-recovery-20261029-bf81413`** wijst naar de oorspronkelijke main. Volledige Git-bundle is lokaal gecontroleerd met `git fsck` en `git bundle verify`; hash en pad staan in audit.md. De oudere backupbranch is leesbare oude code, geen geteste persoonlijke ZIP; zij is niet geschikt verklaard om actuele gegevens terug te zetten.

De herstelbranch gebruikt **`memento-pwa-v70-20261029-recovery-v2`** met vernieuwde, expliciete CORE-assets. De publieke site serveert nog **v68**. Geen productie-upgrade uitgevoerd. Bij een toekomstige release en noodzakelijke rollback: revert alleen herstelcommits via een nieuwe PR, behoud actuele lokale gegevens, neem de bijbehorende oude appassets uit de backupref maar geef de worker en gewijzigde URLs een **nieuwe** versie. Test opnieuw het bestaande profiel/binaire bijlagen en offline laden. Wis nooit localStorage/IndexedDB en draai geen oud gegevensschema over actuele data terug.
