# Kennis — herstel van de goedgekeurde referentie

Baseline main c6fad65d192879ce2c0a0dccd11372963f447845. Jari heeft de afwijkende uitvoering afgekeurd en expliciet gevraagd de route exact naar het goedgekeurde prototype terug te brengen, oude functies/sjablonen onderaan te verwijderen en de navigatie Kennis te noemen.

De referentie blijft `headquarters-approved-20261103.html`. De oude PR95-beoordeling gold ten onrechte als visueel akkoord. Deze correctie vervangt die productkeuze.

1. De hoofdroute bevat uitsluitend de prototypekop, omschrijving, compacte Inbox, tien benoemde hoofdkwartieren, kleine bewerkknoppen en toevoegen. Geen zoekveld, lokale tabs, oude mappen, recent/vastgezet, sjablonen, widgets, opslagbeheer of back-upsecties daaronder.
2. De tien namen/omschrijvingen zijn gelijk aan de referentie; bestaande mapnamen sturen het overzicht niet langer aan. Eigen bestaande afbeeldingen blijven via de bijbehorende onderwerpbron zichtbaar. Ongekoppelde kaarten openen de koppel-editor; er worden geen Notion-bestemmingen verzonnen.
3. Kennis vervangt Notities als navigatielabel; stabiele interne route `notes` blijft bestaan voor compatibiliteit.
4. Invoer/kaartbeheer/sorteren volgen de referentie. Echte links gebruiken dezelfde HTTPS-route als Recepten. Sorteren gebruikt de bestaande bewezen touch-/randscrollondersteuning en schrijft alleen na Volgorde opslaan.
5. Kaartconfiguratie is afzonderlijk additief onder knowledge.portal opgeslagen. Bestaande notities, map-IDs, templates in oude back-ups, dagboek en bestanden worden niet destructief gemigreerd of gewist. Het oude enginegedeelte blijft alleen voor dagboek/gegevenscompatibiliteit; de oude workspace is geen onderdeel van het Kennis-portaal.
6. De hoofdkwartierenjourney wordt bewust vervangen omdat het oude product is verwijderd. De nieuwe journey vergelijkt de werkelijke portalgeometrie en typografie met de bevroren referentie, op identieke inhoudsbreedte en zonder fictieve telefoonchrome. De echte appchrome blijft bestaan.
7. Tests bewaken tijdelijke sortering, annuleren, bewaren, herstart, linkkoppeling, Inbox en volledig behoud van oude notities/collecties/financiën. Corevalidatie weigert onveilige links en ongeldige portalconfiguratie.
8. Geen visuele vrijgave zonder screenshotreview van de exacte head. Geen fysieke Android-Notion- of TalkBackclaim uit Chromium afleiden.
