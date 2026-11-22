# Änderungsprotokoll

## v0.91.0 – Kuh-Kiste, Outfits, Erfolgs-Zubehör (Alps Go 22.11. 03:07)

- [x] **📦 Kuh-Kiste** im Shop (40 Dublonen): Gewöhnlich 60 % · Selten 27 % · Episch 10 % · Legendär 3 %; Pech-Schutz (spätestens jede 25. legendär, jede 8. mindestens episch); Doppelte geben 5/10/20/50 Dublonen zurück. Gezogen wird auf dem Server.
- [x] **👕 Garderobe** mit 4 Fächern: Kopf, Brust, Beine, Gegenstand – frei kombinierbar. Ein gekaufter Avatar bringt Kopf, Brust und Beine mit; Gegenstände (Donnerhammer, Gurken-Säbel, Kristall-Kuhglocke …) und sehr seltene Teile (Goldrüstung, Raketenstiefel, Goldene Kuh …) gibt es nur in der Kiste.
- [x] **Set-Effekt:** alle 3 Teile eines Avatars an → passender Effekt (Stinkwolke, Höllenfeuer, Disco-Glitzer, Münzregen, Stromschlag …).
- [x] **Spezial-Spielfelder** (Casino, Bauernhof, Ozean, Strand, Winter) als Kisten-Inhalt.
- [x] **Erfolgs-Zubehör:** 👑 Kuhhandel-Krone (meiste gewonnene Kuhhandel), 🐀 Rattenschwanz (am häufigsten die Ratte), 💸 Geldregen (am häufigsten am Ende das meiste Geld) – trägt immer nur der aktuelle Rekordhalter.
- [x] Datenbank: `supabase/v0.91-kuhkiste.sql`.

## v0.90.0 – Einstellungen, Aussehen, Schnick-Schnack-Schnuck

- [x] **Börsen-Chaos: Start-Hand** – jeder beginnt mit 1 Pfändung und 1 Einspruch auf der Hand, vor dem Spiel 0–3 je Karte einstellbar (zusätzlich zu den Karten im Stapel).
- [x] **Spiel-Einstellungen auf einem Bild:** Warteraum in Gruppen (Spielart · Tempo · Start-Hand · Extras), Startfenster ohne Scrollen.
- [x] **Aussehen abgespeckt:** 6 abgestimmte Vorlagen, „Selbst mischen“ nur noch Spielfeld, Muster, Kartenrücken (Hintergrund passt automatisch). Spezial-Designs (Casino, Bauernhof, Ozean, Strand, Winter) gibt es künftig im Shop/in der Kuh-Kiste.
- [x] **Langweilig? Schnick-Schnack-Schnuck!** Tut sich 20 s nichts, kannst du einen Mitspieler herausfordern – alle sehen das Ergebnis (ändert nichts am Spiel).

## v0.89.0 – Rückmeldungen 22.11. nachts

- [x] **Schimmer „du bist dran“** leuchtet hinter deiner Figur unten links (nicht mehr hinter den Knöpfen).
- [x] **Passen beendet die Versteigerung nicht mehr** – der Höchstbietende darf sich noch selbst überbieten; haben alle anderen gepasst, beendet er mit „Beenden“ (oder die Uhr läuft ab).
- [x] **Bieten immer unten rechts**, „Passen“ oben und deutlich weg von den Gebotsknöpfen.
- [x] **Kuhhandel:** „effektiv bezahlt“ (= Differenz, bei Annahme das Angebot) sehen jetzt alle – im Ergebnis-Fenster und in „Letzte Runde“.
- [x] **Spezialkarte immer gleich:** goldener Stern unten am Tier-Set (bei dir und bei allen Mitspielern), ohne Tier ein eigenes Kärtchen mit Stern unten.
- [x] **Rattenkönig nur einmal** pro Partie, danach schneller zur Abrechnung.
- [x] **Sets der Mitspieler nie mehr eingeklappt** (kein „+3“), **eigene Sets größer** mit mehr Abstand, **„Deine Sets“ im Kuhhandel** im selben Kärtchen-Look.
- [x] **Statistik und Bestenliste im Spielmenü**, Menü zweispaltig ohne Abschneiden.

## v0.88.1 – Kleinkram

- [x] „Letzte Runde“ etwas schmaler (stieß an den Stapel).
- [x] Debug-Knöpfe (nur Testmodus) liegen nicht mehr über dem Geld-Fächer; „Deine Sets“ beim Kuhhandel-Antworten weiter oben.

## v0.88.0 – Bieten und Knöpfe flüssiger (Rückmeldung vom Testabend, 23:27)

- [x] **Keine Gebotssperre mehr.** Schutz vor Fehlgeboten jetzt so: Jeder Knopf bietet einen festen Betrag – war jemand schneller, kommt „Lea war schneller (130)“ statt eines höheren Gebots. Neue Beträge blinken kurz auf.
- [x] **Selbst überbieten:** Führst du schon, legt jeder weitere Tipp seinen Schritt einfach drauf (2× „+10“ = 20 mehr). Tipps während des Speicherns gehen nicht mehr verloren, sondern werden danach ausgeführt.
- [x] **Knöpfe reagieren zuverlässig:** Tippen zählt schon beim Loslassen, auch wenn der Tisch genau dann neu gezeichnet wird. Hat sich am Bild nichts geändert, wird gar nicht neu gezeichnet – weniger Flackern bei Fenstern und Animationen.
- [x] **💬-Fenster neu:** Antippen deiner Figur öffnet Reiter – Emojis (16 Stück, ein Tipp = gesendet), Sprüche, Aktionen, Karten. Die Schnell-Emojis am Rand sind wieder weg.
- [x] **Deine Emojis/Sprüche** erscheinen wieder direkt über deiner Figur.
- [x] **Letzte Runde** weiter links und dezenter, beim Kuhhandel mit der Differenz der Gebote.
- [x] **Handgeld wieder vollständig:** jeder Schein einzeln statt „×3“-Stapel.

## v0.87.0 – Wünsche vom Testabend (Alps Go 21.11. 21:17)

- [x] **Plätze getauscht:** deine Figur unten links (Schnell-Emojis daneben), deine Knöpfe unten rechts.
- [x] **„+10“ groß und rot**, +20/+50/+100 klein darunter.
- [x] **Bieten wie bei Balatro:** Scheine im Fächer antippen (springen hoch), dann „… bieten“ – alle zusammen als Gebot.
- [x] **Schutz vor Fehlgeboten:** Bietet ein anderer, sind die Gebotsknöpfe 0,8 s gesperrt und blinken.
- [x] **Überboten!** jetzt groß: roter Rand-Blitz und Schild mit Wer und Wie viel.
- [x] **Kann nicht zahlen:** Scheine bleiben bis zum Ende der Versteigerung am Platz offen. Bietet danach keiner, gibt es das Tier nicht umsonst – die Versteigerung beginnt von vorn.
- [x] **Alle anderen haben gepasst:** der letzte Bieter sieht das und kann mit „Beenden“ abschließen.
- [x] **Letzte Runde** steht klein auf dem Tisch (nur die letzte, kein Verlauf).
- [x] **Rattenrunde:** Knopf „🤖 Auto-0 legen“.
- [x] **Kuhhandel Schritt 1:** zeigt alle Tiere des gewählten Gegners („Lea hat 14 Tiere: …“).
- [x] **Geld der Mitspieler als kleiner Fächer** verdeckter Scheine.
- [x] **Podest wächst** nach Punkten – der Letzte zuerst, der Sieger zuletzt.

## v0.86.0 – Wichtige Fehler aus dem Testabend + Feinschliff

- [x] **Ergebnis-Fenster und Animationen fehlten später im Spiel:** Das Protokoll ist auf 200 Einträge begrenzt – ab da hat die App keine Neuigkeiten mehr erkannt (keine Fenster nach Versteigerung/Kuhhandel/Spezialkarte, keine fliegenden Tiere und Scheine). Jetzt zählt ein fortlaufender Zähler (`logNo`). Gilt auch für laufende Partien.
- [x] **Buzzer:** Wer buzzert, wird sofort allen über die Live-Verbindung gezeigt – der Countdown bleibt bei allen gleichzeitig stehen.
- [x] **Sprechblasen/Emojis und Geheimauftrag ruckeln nicht mehr**, wenn im Hintergrund etwas passiert (Animation läuft beim Neuzeichnen weiter statt neu zu starten).
- [x] **iPad:** kein weißer Balken mehr unten.
- [x] **Rattenrunde:** Am Platz steht wieder die Kartenzahl, wie viel gelegt wurde, zeigt der Stapel daneben.

- [x] **Einheitliches Layout:** alle Hauptknöpfe in Großbuchstaben, jede Fenster-Überschrift mit ihrem Emoji (📖 Spielregeln, 📊 Meine Statistik, 🏆 Bestenliste, 🧍 Mein Profil …).
- [x] **„Sehr günstig!“:** Wer einen Kuhhandel für höchstens 50 gewinnt, bekommt den großen Auftritt (sehen nur die beiden Beteiligten) – der Gewinner jubelt 😄, der Verlierer ist traurig 😢.
- [x] **Rattenhandel:** Im VS-Auftritt steht jetzt „… will die Ratte an … loswerden“ statt „will die Ratte“.
- [x] **Schnell-Emojis rechts:** In spannenden Momenten (Versteigerung, Kuhhandel, Spezialkarte, Ratte, Bezahlen, Aufteilen) stehen rechts am Rand 😱 🔥 🤑 😂 – ein Tipp, und alle sehen es über deiner Figur.

## v0.85.0 – Spannung am Ende, Sets immer im Blick

- [x] **Spielende mit Highlights:** Nach dem letzten Zug (und ggf. dem Rattenkönig) kommen erst die Highlights der Partie, Karte für Karte – z. B. Kuhhandel-König, Teuerster Kauf, Rattenfänger, Sternsammler –, danach die Abrechnung, „Und der Sieger ist …“ und das Treppchen.
- [x] **Kuhhandel:** Deine eigenen Sets bleiben sichtbar – als Leiste „Deine Sets“ mit Tier und Anzahl (✓ bei fertigem Quartett), das Kuhhandel-Fenster bleibt darüber.
- [x] **Sets der Mitspieler ansehen:** Tiere eines Mitspielers antippen → Fenster mit all seinen Tieren (Anzahl, aktueller Wert, fertige Quartette, Spezialkarten, Ratten). Seine Figur antippen öffnet weiterhin die Reaktionen.
- [x] **Zu zweit:** Beim Aufteilen steht kurz da, wer was bekommt – auch welcher Geldschein. Der Esel bringt jetzt auch zu zweit beiden den Esel-Bonus (50 / 100 / 200 / 500).
- [x] **Teams/alle:** Die aufgedeckte Karte „zappelt“ nicht mehr – die Dreh-Animation startete bei jedem Neuzeichnen neu.
- [x] Datenbank: `supabase/v0.85-kasse-rechte.sql` – die Kasse ist für Spieler nur noch lesbar (Schreiben nur über die Abrechnung).

## v0.84.0 – Einsatz & Kasse

- [x] **💶 Einsatz** (in jeder Spielart, Warteraum „💶 Einsatz“ oder Modus-Fenster): 1 / 2 / 5 / 10 / 20 € pro Kopf. Jeder bestätigt am eigenen Platz mit „💶 Dabei?“ – gestartet wird erst, wenn alle ✓ haben. Am Tisch steht „💶 Topf 20 €“.
- [x] **Platz 1 bekommt den ganzen Topf** (bei Gleichstand oder im Team geteilt), angezeigt beim Treppchen.
- [x] **Neue 💶 Kasse** (Startseite unten): Bilanz pro Person, „Wer schuldet wem“ (paarweise verrechnet), „Bezahlt ✓“ – nur wer das Geld bekommt, darf abhaken –, und die letzten Runden mit Einsatz.
- [x] Die App bewegt **kein** Geld, sie ist nur euer Schuldenbuch.
- [x] Datenbank: `supabase/v0.84-kasse.sql` (Tabelle `kasse`, Funktionen `kasse_settle`, `kasse_paid_pair`).

## v0.83.0 – Teams 2 gegen 2

- [x] **🤝 Teams 2 gegen 2** (Schalter im Warteraum und im Modus-Fenster, nur zu viert, nicht zu zweit): Partner sitzen sich gegenüber. Im Warteraum steht „Team A/B ⇄“ über den Figuren – der Gastgeber tippt an, wer in welchem Team ist (Start erst bei 2 gegen 2).
- [x] Eure Tiere zählen zusammen (2 + 2 = Quartett des Teams), Wertung pro Team wie ein Spieler, dazu erfüllte Geheimaufträge beider Partner. Beide Partner stehen gemeinsam auf dem Treppchen: „Team Nico & Mo gewinnt!“.
- [x] Das Geld deines Partners siehst du offen (🤝 und Summe am Platz), Kuhhandel und Zwangsversteigerung im eigenen Team gibt es nicht; ein fertiges Team-Quartett ist vor Pfändung geschützt. Rattenkönig: blockiert ein Quartett seines Teams.

## v0.82.0 – Geheimaufträge

- [x] **🎯 Geheimaufträge** (Schalter im Warteraum und im Modus-Fenster, mit allen Spielarten): Jeder bekommt zu Beginn verdeckt einen eigenen Auftrag – z. B. „Sammle das Esel-Quartett“ (+400), „Habe am Ende mindestens 3 Quartette“ (+500), „Gewinne mindestens 3 Kuhhandel“ (+400), „Ersteigere mindestens 4 Tiere“, „Kaufe ein Tier für mindestens 300“, „Habe am Ende mindestens 300 Taler“, „Hole dir eine Spezialkarte“, „Nimm 2× die Ratte“ (je +300/+400). Zu zweit gibt es nur passende Aufträge.
- [x] Am Anfang zeigt ein Zettel deinen Auftrag, danach jederzeit über 🎯 oben links – mit Fortschrittsbalken. Die anderen siehst du nicht.
- [x] Am Ende: Bonus in der Wertung (🎯 in der Abrechnung), beim Treppchen steht bei jedem Spieler sein Auftrag und ob er ihn geschafft hat.

## v0.81.0 – Börsen-Chaos: Kurse sofort + Blindmarkt

- [x] **Kurse wirken sofort:** Auf allen Tierkarten im Börsen-Chaos (Versteigerung, Auslage, Kuhhandel, Mitspieler) steht der aktuelle Kurs – alter Wert durchgestrichen, neuer Wert grün (gestiegen) oder rot (gefallen).
- [x] **Neue Börsen-News „🙈 Blindmarkt“** (1×, jetzt 14 News): Die nächsten 3 Versteigerungen laufen verdeckt – niemand sieht das Tier, auch der Auktionator nicht. Beim Zuschlag dreht sich die Karte für alle um; ein Esel bringt seinen Bonus erst dann. Neben dem Stapel steht „🙈 Blind 3“.
- [x] Spielregeln (Reiter Börsen-Chaos) und Modus-Kachel angepasst.

## v0.80.0 – Mein Profil

- [x] **„Mein Profil“ statt „Dein Spielerbild“** (Startseite → auf deinen Namen tippen): links deine Figur groß, Name, Titel (z. B. „Kuh-Kaiser“), Dublonen und Kurz-Statistik (Spiele, Siege, Rekord) mit Abkürzung zu Statistik und Shop.
- [x] **Reiter „Figur“:** alle gekauften Shop-Figuren zum Anziehen per Antippen, dazu die 10 Gratis-Tiere. Ein Gratis-Tier antippen legt die Shop-Figur ab – die Farbe gibt es nur noch, wenn ein Gratis-Tier gewählt ist (vorher wirkte sie mit Shop-Figur gar nicht).
- [x] **Reiter „Sprüche & Emotes“:** alles, was du im Shop gekauft hast, inkl. eigenem Spruch.
- [x] **Reiter „Konto“:** Passwort ändern.
- [x] **Spielregeln überarbeitet:** Reiter je Spielart (Grundregeln, Turbo, Börsen-Chaos, Zu zweit), aktuell mit Tempo, „Warte, warte, warte!“, „Zeig Batzen!“ und Rattenkönig. Börsen-Chaos zeigt alle News als eigene Karten (Symbol, Anzahl, Wirkung). Fehler behoben: oben standen große Balken „Orange“ und „Lila“ (die Farb-Legende der Knöpfe war verrutscht).
- [x] **ⓘ für die Spielart:** im Spiel oben links neben dem Menü und im Modus-Fenster neben dem Namen – öffnet die Regeln direkt beim passenden Reiter.
- [x] Datenbank: `supabase/v0.80-avatar-ablegen.sql` – Shop-Figur ablegen (`shop_set_avatar(null)`).

## v0.79.0 – Warte, warte, warte!

- [x] **„✋ Warte, warte, warte!“ bei der Versteigerung:** Jeder Bieter (nicht der Auktionator) darf einmal pro Versteigerung drücken – die Uhr bekommt die Versteigerungszeit der Runde dazu (Gemütlich +15 s, Normal +10 s, Schnell +7 s, Turbo +6 s, bei Hektik die halbe Zeit). Ab dem zweiten Drücken in derselben Versteigerung gibt es nur noch die halbe Zeit. Der Knopf sitzt unter dem Gebots-Schild; alle sehen „WARTE, WARTE, WARTE!“ mit Namen und hören ein dreifaches „Wa-wa-wa“.
- [x] **Auch beim Kuhhandel (mit Kuhhandel-Zeit):** Der Herausgeforderte darf einmal pro Kuhhandel verlängern (+30 / +20 / +14 s).
- [x] **Auch beim Aufteilen zu zweit:** Wer die Karte ansieht, darf einmal pro Karte verlängern (+15 / +10 / +7 s).
- [x] **Rattenkönig:** Hat jemand am Ende alle Ratten, sehen alle eine eigene Show – Kanalisation, vier Ratten springen aus den Gullys, flitzen um die Figur, springen ihr auf den Kopf, *PUFF!* – und die Figur trägt eine Rattenmütze mit Krone. Die Mütze bleibt am Tisch und auf dem Siegertreppchen. Erst danach wird das Quartett geopfert bzw. abgerechnet.

## v0.78.0 – Mehr Ruhe

- [x] **Ergebnisse länger sichtbar:** Ohne Spielverlauf ist das Ergebnis-Fenster die einzige Stelle, an der man sieht, wer was bekommt und zahlt – es bleibt jetzt 4,5 s (Kuhhandel 5,8 s, „umsonst“ 3 s) statt 3 s. Für dich selbst weiter wegtippbar.
- [x] **Karte in Ruhe ansehen:** Nach dem Aufdecken bleiben 3 s (statt 1,5 s), bevor die Versteigerungsuhr läuft.
- [x] **Tempo pro Runde:** Im Warteraum „Tempo: 🐢 Gemütlich / Normal / ⚡ Schnell“. Drei Gruppen:
  - **Denkzeiten folgen voll** (×1,5 / ×1 / ×0,7): Versteigerung 15 / 10 / 7 s, Aufteilen zu zweit 15 / 10 / 7 s, Kuhhandel-Zeit 30 / 20 / 14 s.
  - **Info-Fenster folgen nur leicht** (×1,3 / ×1 / ×0,85), damit man sie auch bei „Schnell“ lesen kann: Karte ansehen 3,9 / 3 / 2,6 s, Ergebnisse, VS-Auftritte, Börsen-News-Karte, Quartett-Show, Gerichtsvollzieher. „Kann nicht zahlen“ 6,5 / 5 / 5 s – nie kürzer.
  - **Bleibt immer gleich:** Spezialkarte (Zeig Batzen 3 s, Achtung, Countdown 1 s pro Zahl, Schnick-Schnack-Schnuck) und alle Bewegungen (Tiere laufen, Geld fliegt).
  - **Hektik** (Börsen-Chaos) halbiert die Versteigerungszeit der Runde: 7,5 / 5 / 3,5 s statt immer 5 s.
- [x] **Quartett-Show länger:** 5,5 s statt 3,8 s – Tiere, Requisiten und Ruf spielen ihre Szene zweimal.
- [x] **VS-Auftritte länger:** Kuhhandel-VS 3,2 s (Wiederholung 2,4 s statt 0,9 s), Spielstart 3,2 s – man sieht in Ruhe, wer gegen wen um welches Tier spielt. Läuft mit dem Tempo der Runde mit.
- [x] **Neues Modus-Fenster:** Oben Name, Untertitel und Eckdaten (z. B. „10 Tierarten · Versteigerung 10 s · Kuhhandel“), darunter die Einstellungen als Kacheln mit Symbol, kurzer Erklärung und Schiebeschalter (an = grün), Tempo als Leiste. Bei „Geld im Stapel“ führt „Scheine anpassen ›“ zu den Scheinen (0 bis 500 einzeln mit − / +).
- [x] **Ratte:** Kein Rattenrudel mehr über den Tisch – nur noch die eine Ratte aus der Karte, die reihum am Geld knabbert.

## v0.77.0 – Zu zweit

- [x] **Neuer Modus „Zu zweit“** (nach der offiziellen 2-Spieler-Variante von Kuhhandel Master): im Klassisch-Fenster „👥 Zu zweit“ anhaken oder im Warteraum einschalten – genau 2 Spieler.
- [x] **Aufteilen statt Versteigern:** Wer dran ist, tippt „Karte ansehen“ und sieht die oberste Karte als Einziger. Behalten → der andere bekommt die nächste; Abgeben → man bekommt selbst die nächste. Die Rückseite der nächsten Karte zeigt, ob ein Tier oder 💰 Geld kommt. 10 s Bedenkzeit, dann wird automatisch behalten. Der andere sieht „… schaut sich die Karte an“ mit wackelnder Karte.
- [x] **Danach:** Tiere laufen zu ihrem Stapel, Geld fliegt (fremdes verdeckt) ins Geld.
- [x] **Regeln zu zweit:** Geldscheine (ohne 0er) liegen im Stapel – aus „Geld im Stapel“, sonst der Standard-Satz; kein Esel-Bonus; Ratten und Spezialkarten werden einfach mit aufgeteilt; statt aufzuteilen darf man kuhhandeln. Ist der Stapel leer, gibt es nur noch Kuhhandel – verzichten beide nacheinander („Verzichten“), ist das Spiel vorbei. Wertung wie immer.
- [x] **Quartett-Show für alle:** Ist ein Quartett voll, sehen alle Spieler eine eigene, lustige Szene passend zum Tier – Hähne krähen bei Sonnenaufgang, Gänse fliegen in Formation, Katzen springen im Mondschein, Hunde jagen ihren Schwanz, Schafe zählen sich über den Zaun in den Schlaf, Ziegen erklimmen den Gipfel, Esel treten den Geldsack auf, Schweine springen in die Suhle, Kühe springen über den Mond, Pferde gewinnen das Derby. Dazu wer es geschafft hat, Ruf und Geräusch. Sie startet, wenn Tier und Geld angekommen sind, lässt sich nicht wegtippen, und erst danach geht das Spiel weiter. Die alte Ehrenrunde über den Tisch ist weg.
- [x] **Viele Scheine im Angebot:** Bietet jemand im Kuhhandel sehr viele Karten (z. B. 10), liegen sie jetzt überlappend in einer Reihe – vorher wuchs das Feld in zwei Reihen bis in dein Geld.
- [x] **💬-Fenster scrollt flüssig:** Passiert im Hintergrund etwas, wird das Fenster nicht mehr neu aufgebaut – Wischen und Scrollen brechen nicht mehr ab, nur geänderte Abschnitte werden still ausgetauscht.
- [x] Startseite: Der Knopf „Spielen“ unten ist weg – gespielt wird über die Modus-Kacheln.
- [x] Nur Klassisch (kein Turbo/Börsen-Chaos zu zweit). Spielstart-Auftritt „DUELL ZU ZWEIT!“. Debug: Testspiel zu zweit über das Klassisch-Fenster.

## v0.76.0 – Erst in die Mitte, dann zum Gewinner

- [x] **Schneller Kuhhandel, richtig:** Wird der Handel entschieden, während die Einsätze noch in die Mitte laufen, laufen sie jetzt fertig – das Ergebnis-Fenster wartet, bis sie in der Mitte stehen. Danach laufen alle nur noch aus der Mitte zum Gewinner. Kein Hin und Her mehr.
- [x] **VS nicht mehr wegtippbar:** Die VS-Auftritte (Kuhhandel, Spezialkarte, Spielstart …) laufen immer ganz durch – Antippen überspringt sie nicht mehr.

## v0.75.0 – Flüssiger

- [x] **Schneller Kuhhandel ohne Hin und Her:** Ist der Handel entschieden, während die Einsätze noch in die Mitte laufen, bleiben sie in der Mitte – von dort laufen alle zum Gewinner. Kein Zurücklaufen mehr zum Spieler und wieder in die Mitte.
- [x] **Esel:** Die Papierbälle erscheinen erst, wenn der Esel wirft – nicht schon vorher in seiner Hand.
- [x] **Geld landet sauber in deiner Hand:** Dein Schein fliegt in einem weichen Bogen genau auf seinen Platz im Fächer – gleiche Drehung, gleiche Größe – und leuchtet dort kurz auf, ohne Nachhüpfen. Gilt auch für Dividende und Marktpanik; abgegebene Scheine (Steuer, Panik) bleiben im Fächer, bis sie losfliegen.

## v0.74.0 – Start aufgeräumt

- [x] **Dein Spiel klein im Kopf:** „Du bist dran! ▶ Weiter“ bzw. „Spiel von … Platz nehmen“ steht jetzt als schmale Leiste zwischen „Tier Börse“ und deinem Namen – die vier Modus-Kacheln werden dadurch deutlich größer.
- [x] **Beitreten-Kachel:** zeigt, wie viele Räume offen sind; im Fenster steht dein laufendes Spiel ganz oben („▶ Weiter spielen“), darunter Code und offene Räume.
- [x] **Debug wie bei allen:** Das Testspiel steht nicht mehr auf der Startseite, sondern als Zeile „🧪 Testspiel 3/4 Spieler“ in jedem Modus-Fenster – mit genau diesem Modus und den gewählten Einstellungen. Deine Startseite sieht jetzt aus wie bei allen anderen.
- [x] Kachel-Bilder werden nicht mehr abgeschnitten.

## v0.73.0 – Modus wählen

- [x] **Neuer Startbildschirm:** Vier große Kacheln mit eigenem Bild – Klassisch, Turbo, Börsen-Chaos und Beitreten. Erst nach dem Antippen öffnet sich das Fenster mit den Einstellungen der Runde (Geldscheine im Stapel, Kuhhandel-Zeit, Geld zählt am Ende) und „Raum erstellen“. Alles lässt sich im Warteraum weiter ändern.
- [x] **Dein Spiel bleibt oben:** Laufende und offene Spiele stehen als schmale Leiste über den Kacheln („Weiter spielen“ / „Platz nehmen“).
- [x] **Beitreten per Code repariert:** Der alte Knopf „🔑 Mit Code“ war eigentlich der *Wiedereinstieg* (Code **und PIN** vom alten Gerät) – wer nur den Raum-Code hatte, bekam „Code oder PIN stimmt nicht“. Jetzt: Kachel „Beitreten“ → nur den 4-Buchstaben-Code eingeben (klein geschrieben geht auch). Klare Meldungen: Tippfehler, Spiel läuft schon, Raum voll. Offene Räume stehen direkt darunter. Der Wiedereinstieg mit PIN ist ein Link im selben Fenster.
- [x] Einladungs-Link nutzt dieselbe Prüfung und sagt genau, warum es nicht klappt.

## v0.72.0 – Jeder Schein fliegt

- [x] **Börsen-News bewegen Geld sichtbar:** Dividende – aus der Bank fliegt jedem ein Schein ins Geld (deiner offen). Steuerprüfung – von jedem Geld fliegt ein Schein in die Bank (nur deiner offen). Marktpanik – jeder Schein fliegt verdeckt zum linken Nachbarn (deinen gegebenen und bekommenen siehst du).
- [x] **Kuhhandel-Geld landet beim Spieler:** Nachdem die Tiere gelaufen sind, fliegt das Angebot aus der Mitte zum Herausgeforderten und das Gegenangebot zum Herausforderer.
- [x] **Flotter:** Wird ein Tier umsonst vergeben, bleibt das Ergebnis nur 2 s stehen (statt 3 s); das Tier läuft schon los, während das Fenster ausblendet; kürzere Ruhe vor dem nächsten Zug. Spart rund 1,5 s pro Versteigerung.
- [x] **News-Titel passen in eine Zeile:** „Hype!“ / „Blase platzt!“ – Tier und neuer Wert stehen darunter.

## v0.71.0 – Merken statt anzeigen

- [x] **Kein Zwischenstand mehr:** Der Schalter „📊 Zwischenstand“ im Warteraum und der Knopf im Menü sind weg – wer vorne liegt, muss man sich merken (wie bei Krone und 💸).
- [x] **Verlierer-Pose:** Wer am Ende allein ganz hinten liegt, lässt auf dem Podest den Kopf hängen, über ihm hängt eine Regenwolke 🌧️ (bei 4 Spielern in seiner Zeile).
- [x] Warteraum zeigt „Börsen-Chaos (13 News)“; Projektstand und Übergabe aktualisiert.

## v0.70.0 – Alles läuft dorthin, wo es liegt

- [x] **Tiere laufen zu dir:** Wer ein Tier bekommt (Versteigerung, Spezialkarte, Ratte, Kuhhandel), zu dem läuft das ganze Tier aus der Tischmitte bis auf seinen Stapel und wird dort zur Karte. Die runde Tierkarte, die vorher zusätzlich flog, ist weg.
- [x] **Kuhhandel in zwei Schritten:** Nach dem VS laufen die Einsätze beider Spieler von ihren Stapeln in die Mitte – der Topf füllt sich, wenn sie ankommen. Nach dem Ergebnis laufen alle Tiere (mit Koffer) aus der Mitte zum Gewinner.
- [x] **Nie mehr zum Avatar:** Geld fliegt immer vom Geld des Zahlers zum Geld des Empfängers (bei dir: dein Fächer, bei Mitspielern: ihre Kartenanzahl), Tiere zu den Tierstapeln. Auch der gezogene Geldschein, der Rattentopf, das Kuhhandel-Angebot und die Rattenrunde. Der Esel-Bonus trifft weiter am Kopf – danach landet der Schein im Geld.
- [x] **Getaktet:** Erst das Tier, dann das Geld, dann wandert der Zug weiter – der Ablauf rechnet mit der neuen Laufzeit.

## v0.69.0 – Börsen-Hype

- [x] **Neue Börsen-News 🚀 „Hype!“:** Der Wert eines Tiers verdoppelt sich (×2). Das Tier wird beim Mischen ausgelost.
- [x] **Neue Börsen-News 🫧 „Blase platzt!“:** Der Wert eines Tiers halbiert sich (÷2). Börsen-Chaos hat damit 13 News.
- [x] **Kurse rechnen wie an der Börse:** Rallye, Sturz, Hype und Blase werden jetzt multipliziert statt addiert (×2 und dann ÷2 = wieder normal; +50 % und −50 % = ×0,75). Höchstens ×4, nie unter 0. Laufende Partien rechnen mit ihrem bisherigen Kurs weiter.
- [x] **Rückseiten verraten die nächste Karte:** Liegt oben im Stapel eine Börsen-News, ist die Rückseite schwarz-gold mit Kurskurve und „BÖRSE“; ein Geldschein ist grün mit 💰. Tierkarten bleiben wie gewohnt.
- [x] **Mehr merken, weniger verraten:** Keine Spitzenreiter-Krone und kein „… führt!“ mehr, kein 💸 über pleite Spielern – wer führt oder kein Geld hat, muss man sich selbst merken.
- [x] **Kurssprung-Animation:** Nach einer Kurs-News blinken alle Karten dieses Tiers (eigene Auslage, Mitspieler, Kurszettel) grün ▲ oder rot ▼, dazu eine Börsenglocke.

## v0.68.0 – Figuren mit Leben

- [x] **Ganze Tiere:** Beim Kuhhandel läuft das gewonnene Tier als ganzes Tier zum neuen Besitzer (Kuh als Kuh, Huhn als Huhn …) – mit Beinen, Schwanz, Flügeln und Koffer; auch Ratte und Quartett-Polonaise. Das Tier schaut in Laufrichtung.
- [x] **„Ka-ching!“:** Wer Geld bekommt (Verkauf in der Versteigerung, Geldschein aus dem Stapel, Rattentopf, Spezialkarte verkauft, Kuhhandel-Geld), dem regnen Münzen in den Kopf – Goldglanz, Betrag und Kassen-Klingeln.
- [x] **Starter-Figuren:** Wer keinen Shop-Avatar hat, steht jetzt als sein Profil-Tier da – großer Kopf, Pulli in Platzfarbe – statt Kopf im Kreis.
- [x] **Figuren leben:** leichtes Atmen und Kopfneigen am Platz; Mimik über dem Kopf: 💦 wer lange am Zug ist, 💢 wenn dir jemand dein Sammeltier wegschnappt oder du einen Kuhhandel verlierst, 😍 beim eigenen Quartett, 💸 ohne einen einzigen Schein.
- [x] **Debug-Modus aufgeräumt:** Das Infofenster springt beim Scrollen nicht mehr nach oben, Abschnitte lassen sich auf- und zuklappen. Auch andere Fenster (Menü, 💬, Einstellungen) behalten beim Neuzeichnen ihren Scroll-Stand.

## v0.67.0 – Emotes im Shop

- [x] Figuren-Theater-Emotes gibt es jetzt im Shop (Reiter „Emotes“): 😂 Auslachen 60, 🍯 Schleimen 60, 🥧 Torte ins Gesicht 80, 🤫 Verschwörung 100, 🌿 Baum-Runde 120 – teurer als Sprüche. Admins können alle.
- [x] Aufgeräumter Emote-Bereich: Mitspieler antippen → „Aktion mit …“ als Kacheln (Verprügeln, Auslachen, Schleimen, Torte, Verschwörung); eigene Figur → „Für alle“ (Baum-Runde). Gekaufte bunt, nicht gekaufte gesperrt mit Preis. Verprügeln jetzt direkt beim Mitspieler statt über die eigene Figur. (SQL `supabase/v0.67-emotes.sql`)
- [x] Nur Alp ist Admin (kann alle Emotes); alle anderen kaufen regulär.
- [x] Kein Abdunkeln mehr während einer Szene – die Figuren heben sich mit Lichtkante und Schatten ab.

## v0.66.0 – Knöpfe, die man versteht

- [x] Feste Farben für alle Knöpfe: **grün = du bekommst** (Zuschlag, Geld nehmen, Ratte nehmen, Spezialkarte verkaufen), **orange = du zahlst** (Bieten, Bezahlen, Selbst kaufen, Angebot/Gegenangebot, Verdeckt legen), **rot = Karte aufdecken**, **lila = Kuhhandel**, **gold = Pfänden**, **weiß = neutral**.
- [x] Beträge mit Vorzeichen und Pfeil: „+130 ⬇ bekommst du“ / „−130 ⬆“.
- [x] Gesperrte Knöpfe blass und gestrichelt – klar anders als aktive.
- [x] Der erwartete Knopf (Karte aufdecken, Zuschlag, Bezahlen) leuchtet nach 3 s sanft; nach 8 s pulsiert er wie bisher.
- [x] Legende in den Regeln.

## v0.65.0 – Zwangsversteigerung

- [x] Börsen-Chaos: neue **Handkarten** im Stapel – 2× Zwangsversteigerung, 1× Einspruch (jetzt 11 News). Aufgedeckt → verdeckt auf die Hand, du deckst gleich nochmal auf. Mitspieler sehen nur, *dass* du eine Karte hast (Bluff).
- [x] **⚖️ Zwangsversteigerung:** statt deines Zuges ausspielen („Pfänden“), Tier eines Mitspielers wählen → es wird versteigert, der Besitzer **muss verkaufen** und bekommt das Geld; bietet niemand, behält er es. Geschützt: fertige Quartette, Ratten, Spieler ohne Geld. Kein Mindestgebot – wer klug wartet, schießt Schnäppchen.
- [x] **🛡️ Einspruch:** wehrt eine Pfändung gegen dich automatisch ab (beide Karten sind dann weg).
- [x] Das Siegel „GEPFÄNDET“ klebt während der Versteigerung auf der Tierkarte; beim ersten Mal erklärt ein Hinweis die Handkarte.
- [x] Auftritt im Figuren-Theater: Gerichtsvollzieher mit Hut, Kuckuck-Siegel „GEPFÄNDET“, KLONK – bzw. Schild „EINSPRUCH!“.

## v0.64.0 – Figuren-Theater

- [x] **Ganze Figuren an jedem Platz:** Mitspieler stehen als ganze Figur auf ihrem Namensschild (ohne Shop-Avatar: Körper in Platzfarbe, Bild als Kopf) – du auch.
- [x] **Figuren-Theater:** Figuren verlassen ihren Platz (der ist dann leer), watscheln wie Pappfiguren hin und her, spielen die Szene und gehen zurück. In der Mitte sind alle gleich groß, beim Gegner hat man dessen Größe. Der Tisch wird dabei kurz abgedunkelt.
- [x] Neue Szenen für alle (Mitspieler antippen → „Aktion mit …“): 😂 **Auslachen**, 🍯 **Schleimen**, 🤫 **Verschwörung** (mit zufälligem Komplizen gegen den Angetippten), 🥧 **Torte ins Gesicht**. Deine Figur antippen → 🌿 **Baum-Runde** für alle (Schale, Gras, Drehen, Joint geht reihum, ~8 s).
- [x] Prügeln, Jubel und Pleite laufen jetzt auch mit der ganzen Figur. Pause zwischen zwei Szenen: 9 s.
- [x] Szenen gehen an alle im Raum; jedes Gerät spielt sie aus der eigenen Sitzposition.

## v0.63.2 – Geldschein-Rückseite

- [x] Liegt oben auf dem Stapel ein Geldschein, hat die Karte eine **grüne Rückseite mit Taler-Münze** statt der Kuh – man sieht vorher, ob ein Schein oder eine Tierkarte kommt (nur mit „Geldscheine im Stapel“).

## v0.63.1 – Feinschliff Intros & Esel

- [x] Duell-Intros länger: Kuhhandel/Rattenhandel 2 s, Spielstart 3 s (Schnick-Schnack-Schnuck bleibt kurz).
- [x] Im Kuhhandel-Intro steht direkt, worum es geht: „Nico will deinen Hund“ / „Test 1 will die Kuh von Test 2“ / „Du willst 2 Kühe von Mo“.
- [x] Esel-Bonus: Erst liegt nur die Karte da, dann klettert der Esel raus (Start erst, wenn die Karte offen ist – vorher konnte er schon während des Umdrehens draußen sein).
- [x] Beim Treffer steht statt „BAM!“ der Betrag (+50/+100/+200/+500); der Getroffene hält sich kurz den Kopf (Hände, Sternchen, Wackeln). Betrag bleibt immer im Bild.
- [x] Laufwege (Verprügeln, Gags) werden erst beim Zeichnen aus Sicht des Geräts bestimmt – stimmt jetzt auch nach „Sicht“-Wechsel im Debug-Modus.

## v0.63.0 – Duell-Intros & eigener Spruch

- [x] **Duell-Intro** (eigenes Design, Bewegungsprinzip wie bei klassischen Handheld-Duellen): schräge Farbflächen in Platzfarbe, Figuren sliden aus verschiedenen Richtungen rein, „VS“ mit Blitz – bei Kuhhandel, Rattenhandel, Schnick-Schnack-Schnuck und Spielstart (3 und 4 Spieler).
- [x] Antippen überspringt; ab dem 3. Duell desselben Paares nur noch kurz; im Menü „Intros aus“. Unter jeder Figur ihr Spruch, Duell-Zähler, Erzrivalen bekommen Flammen. Der Kuhhandel-Timer startet erst nach dem Intro.
- [x] „Letzte Karte!“ – Spotlight, wenn der Stapel leer wird · „Neuer Spitzenreiter!“ – Krone fliegt zum neuen Führenden.
- [x] Spielende läuft für alle gemeinsam ab und lässt sich nicht mehr überspringen: Punkte zählen, Trommelwirbel „Und der Sieger ist …“, dann Siegertreppchen.
- [x] Börsen-Chaos: **Kursrallye** zufällig +30 … +100 % (meist klein), **Kurssturz** zufällig −30 … −100 % (meist kräftig) – die Börse schadet eher, als dass sie hilft.
- [x] Verprügeln: das Profilbild des Prüglers ist leer, solange seine Figur unterwegs ist (bei allen Mitspielern).
- [x] Shop: **Eigener Spruch** (50 Dublonen) – selbst ausdenken, max. 40 Zeichen, jederzeit änderbar (SQL `supabase/v0.63-eigener-spruch.sql`).

## v0.62.0 – Alles wird lebendig

- [x] **Profilbild wird lebendig:** Figuren springen aus ihrem runden Profilbild (Kopf = Profilbildgröße) und stehen neben ihrem Platz; das Profilbild ist so lange leer. Shop-Avatare mit eigenem Körper, alle anderen bekommen einen Standard-Körper in ihrer Platzfarbe.
- [x] Avatar-Gags: **Versteigerung gewonnen** → Gewinner jubelt („Meins!“, Konfetti) · **Pleite!** → Taschen raus, Motten · **Verprügeln** → die Figur selbst läuft hin. Bei „Überboten“ bewusst keine Animation.
- [x] Tierkarten-Gags: **Ratte** klettert aus ihrer Karte und schnüffelt an jedem Geldstapel · **Quartett** → die 4 Tiere tanzen Polonaise · **Kuhhandel** → das Tier läuft beleidigt mit Koffer zum neuen Besitzer.

## v0.61.1 – Muskel-Esel & Pleite

- [x] Esel-Bonus: Ein muskulöser Esel (Sixpack, Bizeps, rote Shorts) klettert aus der Karte – sein Kopf startet genau im Kartenbild –, knüllt die Scheine und wirft jedem mit Wucht einen Papierball an den Kopf, dann plumpst er zurück in die Karte.
- [x] Neuer Gag „Pleite!“: Wer nicht zahlen kann, stülpt die leeren Hosentaschen nach außen, Motten flattern heraus.
- [x] Emote „Verprügeln“: nur noch 5 s Pause zwischen zwei Prügeleien.

## v0.61.0 – Emote „Verprügeln“

- [x] Neuer Shop-Reiter **Emotes**: „🥊 Verprügeln“ für 100 Dublonen – Admins haben es immer (SQL `supabase/v0.61-emote-pruegel.sql`).
- [x] Im Spiel: eigene Figur antippen → 💬-Fenster → „🥊 Verprügeln“ → Mitspieler wählen.
- [x] Deine Figur läuft zum Mitspieler, Comic-Prügelwolke mit POW! BAM! KLATSCH!, Sternen und Aufprall-Geräuschen, dann läuft sie zurück – alle sehen es live.
- [x] 20 s Pause zwischen zwei Prügeleien.

## v0.60.1 – Respektloser Esel

- [x] Esel-Bonus neu: Statt Geldregen schnappt sich der Esel die Scheine, knüllt sie zusammen und pfeffert jedem einzeln einen Papierball an den Kopf – BAM! ZACK! PATSCH! (mit Knüll- und Aufprall-Geräusch).

## v0.60.0 – Börsen-Chaos

- [x] Neue Spielart **📈 Börsen-Chaos** (im Warteraum einschaltbar, nie zusammen mit Turbo): 8 Börsen-News im Stapel (62 Karten).
- [x] News: Kursrallye 2× (+50 %), Kurssturz 2× (−50 %, stapelbar, nie unter 0), Dividende (+50 für alle), Steuerprüfung (höchster Schein weg), Marktpanik (zufälliger Schein verdeckt nach links), Hektik (3 Versteigerungen nur 5 s).
- [x] Aufgedeckte News erscheint groß in der Mitte – bei Steuer/Marktpanik mit deinem persönlichen Teil („Du gibst 500 ab“); danach deckt der Aufdecker nochmal auf.
- [x] Kurszettel neben dem Stapel, Tierkarten zeigen den aktuellen Wert, Wertung rechnet mit Kursen; Test-Spieler bieten nach Kurs.
- [x] Testspiel/Debug: Schalter „Börsen-Chaos“ und Abkürzung „Börsen-News als nächste Karte“; 6 neue Regeltests + 100 simulierte Komplettspiele.

## v0.59.1 – Größere Tiere

- [x] Karte und Stapel in der Mitte etwas kleiner, dafür sind deine Tiere im Regal deutlich größer (bis 118 %, vorher 82 %).

## v0.59.0 – Dein Platz wie bei den Mitspielern, nur groß

- [x] Deine Tiere stehen als Regal in **einer Reihe** direkt über deinem Geld – über die ganze Breite zwischen Knöpfen und Figur (am Ende deutlich größer als vorher); Anzahl-Plakette „2×“ liegt wie bei den Mitspielern auf der Karte; Ratten bleiben Karten.
- [x] Geld als **Hand von unten mit festen Fächern**: 0, 10, 20, 50, 100, 200, 500 haben immer denselben Platz (fehlende Werte als blasser Platzhalter) – beim Zahlen verrutscht nichts.
- [x] Deine **Figur rechts groß und immer sichtbar** (auch beim Kuhhandel und „Zeig Batzen“ – für 💬); wenn du dran bist, leuchtet es weich gelb hinter deiner Figur (kein Rahmen mehr).
- [x] Die Summe deines Geldes steht direkt rechts neben deiner Hand (Namensschild zeigt nur noch „Du“).
- [x] Sprechblasen kommen **aus dem Mund**: bei dir links aus deiner Figur, bei den Mitspielern direkt unter ihrem Bild (Zipfel zum Mund).
- [x] Karte in der Mitte etwa 8 % kleiner, damit Regal und Hand darunter Platz haben.

## v0.58.1 – Platz zwischen Karte und Figur

- [x] Deine Figur unten ist etwas kleiner, damit die große Karte bei 3 Spielern bzw. mit Hinweiszeilen nicht an ihren Kopf stößt.
- [x] Projektstand und Übergabe-Doku auf v0.58 gebracht.

## v0.58.0 – Neue Charaktere und Sprüche

- [x] 9 neue Avatare (Kopf + ganzer Körper, mit Bewegung): Kult **Mr. Passt Schon** (50), Legendär **Die dumme Kuh** (60), Selten (30): Mama Sports, Dickes Huhn, Bontje Lebkuchen, Die schmatzenden Zwillinge, Nacht-Gohan, Der schielende Mogli, Der dicke Gojo.
- [x] 7 neue Sprüche (je 10): „Ich bin das dicke Huhn und gehe heute schwimmen“, „Hey, du bist eine dumme Kuh!“, „Ich habe Hunger“, „Bau mal einen“, „Lass uns auf einen Kurzen zu den ukrainischen Nachbarn“, „Schmatz nicht!!“, „Can I ask you by any chance how old you are? 📱“.
- [x] **Zwei Sprüche gratis:** jeder kann sich im Shop zwei Sprüche kostenlos aussuchen („🎁 Gratis nehmen“).
- [x] 💬-Fenster zeigt nur noch Sprüche (die Emojis sind raus).
- [x] Dein Rahmen unten ist symmetrisch: Figur genau in der Mitte, Geld links und Tiere rechts je mittig; Debug-Knöpfe oben rechts.
- [x] „Überboten!“ erscheint direkt über dem Gebots-Schild des neuen Höchstbietenden (statt über der Karte).
- [x] SQL `supabase/v0.58-neue-charaktere.sql` (Preisliste aus dem Katalog erzeugt, Test prüft Gleichheit) – führt Alp im SQL-Editor aus (Connector getrennt).

## v0.57.1 – Preis in der Überschrift

- [x] Ergebnis-Fenster: Überschrift mit Preis („Test 2 kauft das Schaf für 140 [Schein]“, „… Spezialkarte für 3 Karten“, „… ertauscht 2× Ziege für 3 Karten“, „Du nimmst die Ratte + 3 Karten“); darunter nur noch „Test 2 → 4 Karten → Test 1“.
- [x] Neues kleines Geldschein-Zeichen für Taler (die goldene Münze bleibt den Dublonen vorbehalten).

## v0.57.0 – Wie am echten Tisch (Konzept 3)

- [x] **Dein Platz:** deine Figur sitzt unten in der Mitte – genau gegenüber dem Platz oben. Geld links (linke Hand), Tiere rechts (rechte Hand), alles im goldenen Rahmen.
- [x] Gleiche Geldscheine liegen als Stapel (×2, ×3), die Summe steht über dem Fächer.
- [x] Testspiel: Test-Spieler bekommen zufällige Shop-Avatare, dein eigener Avatar wird angezeigt.
- [x] Die 💬-Sprechblase über deiner Figur ist weg: **Tippen auf deine Figur** öffnet das Emoji-/Sprüche-Fenster.
- [x] Deine Sets zeigen die Anzahl wie bei den Mitspielern („2×“, „3×“, Quartett grün) statt „noch 1“.
- [x] **Debug (Testspiel)** – neue Abkürzungen: viel Geld, viele Tiere, Kuhhandel 2 gegen 2 vorbereiten, alle Quartette verteilen, Spiel sofort beenden (Abrechnung + Siegertreppchen). Neuer Regel-Test für „sofort beenden“.

## v0.56.1 – Testspiel zeigt deinen Avatar

- [x] Fehler behoben: Im Testspiel (Debug) wurde dein eigenes Profilbild bzw. dein Shop-Avatar nicht angezeigt, weil dein Platz dort intern „me“ heißt. Test-Spieler haben weiterhin kein Bild (sie haben kein Konto).

## v0.56.0 – Dein Platz am Tisch (Variante C)

- [x] **Deine Figur unten rechts:** dein Shop-Avatar in ganzer Figur (ohne Shop-Avatar: dein rundes Bild) mit Namensschild. Gewinnst du ein Tier, hüpft sie und das 🎉 kommt von ihr.
- [x] **💬 als Sprechblase über deiner Figur**; deine eigenen Sprüche erscheinen dort.
- [x] **Goldener Rahmen** („du bist dran“) umschließt jetzt Geld, Tiere und Figur vollständig – die Scheine sitzen höher und sind ganz sichtbar.
- [x] Fächer staucht sich passend; ab 10 Scheinen werden gleiche Werte gestapelt (×2). Viele Tiere: 2 Reihen, etwas kleiner.
- [x] Supabase: SQL führt ab jetzt Claude über den Supabase-Connector aus (Regel in AGENTS.md/CLAUDE.md, von Alp freigegeben).

## v0.55.0 – Dublonen für alle (+ Schutz der Spielstände)

- [x] **Neue Dublonen** (nach dem SQL von Alp): +2 je echter Partie, +5 je Quartett (höchstens 5), +10 für den Sieg, höchstens 60 pro Tag. Echte Partie = mindestens 3 Konten, 6 Minuten, 25 Züge.
- [x] **Siegertreppchen** zeigt deine Gutschrift dieser Partie („+2 Mitgespielt · +10 Quartette · +10 Sieg = +22“), der Kontostand wird neu geladen.
- [x] **Schutz:** Die Datenbank lässt keine erfundenen Spielstände mehr zu (neues Spiel nur im Warteraum, Mitspieler nur per Beitreten, beendete Spiele fest). Revanche läuft über eine Server-Funktion.
- [x] Ohne das neue SQL läuft alles wie bisher (+10 für den Sieg).
- [x] Anleitung: `supabase/v0.55-anleitung.md`, Hintergrund: `supabase/v0.55-sicherheit-vorschlag.md`. Neuer Test prüft SQL-Beträge gegen die App.

## v0.54.1 – Aufgeräumter Tisch

- [x] **Bezahlen:** Die Tierkarte bleibt nach der Versteigerung genau an ihrem Platz (nur der „Verkauft!“-Stempel kommt dazu). Links bleibt „Haben schon“, rechts erscheint die Kasse „Zahle … → Name“ – dort, wo vorher das Gebot stand.
- [x] **Ergebnis-Fenster:** wieder mittig, aber kompakt mit Bildern statt Text: Tier → wer es bekommt, darunter Geld: wer → wie viel → an wen. Der aufgedeckte Kuhhandel bleibt der große Auftritt.
- [x] **„Zuletzt passiert“** steht nicht mehr auf dem Tisch, sondern oben im 💬-Menü (nur das letzte Ereignis – kein Verlauf).
- [x] **Eine Kartengröße:** Stapel, Karte beim Umdrehen, Versteigerung, Ratte, Spezialkarte – alle gleich groß (vorher wurde die Karte beim Umdrehen erst kleiner, dann größer).
- [x] **Deine Sets** in voller Größe, solange sie passen; der 💬-Knopf sitzt jetzt rechts oberhalb davon, die Versionsnummer unten links.
- [x] **Du bist dran:** statt des abgeschnittenen Lichtkegels ein goldener Rahmen um deinen Platz (Geld + Tiere).
- [x] 3 Spieler: Stapel und Kuhhandel-Feld ragen nicht mehr in die Überschrift (Fund von Alp). Die Browser-Tests prüfen jetzt auch die Überschrift.

## v0.54.0 – Avatare leben + Siegerehrung

- [x] **Jubel:** Wer bei Versteigerung, Spezialkarte oder Kuhhandel das Tier bekommt, dessen Avatar springt kurz mit 🎉 über seinem Platz (Shop-Avatar in ganzer Figur, sonst der runde Kopf).
- [x] **Siegertreppchen:** Shop-Avatare stehen in ganzer Figur auf dem Podest, springen auf, der Sieger hüpft weiter. „+10 Dublonen“ am Sieger (nur in echten Partien, nicht im Testspiel).
- [x] Neue Browser-Tests: Podest mit Avataren (3 und 4 Spieler).

## v0.53.0 – Größere Karten

- [x] Deine Tierreihe steht jetzt rechts neben deinem Geldfächer (zwei Reihen, wenn es viele sind) – antippen für Kuhhandel wie bisher.
- [x] Dadurch wird die Tischmitte frei: Stapel, Tierkarte bei Versteigerung, Ratte und Spezialkarte sind **40 % größer** – in allen Phasen gleich groß.
- [x] Viele Geldscheine: der Fächer staucht sich, damit der erste Schein nicht unter dem „Kuhhandel“-Knopf liegt. Viele Tiere: höchstens 2 Reihen, dann kleiner (beides von den Browser-Testpartien gefunden).
- [x] Geprüft: alle Ansichten in 4 Handygrößen, mit 3 und 4 Spielern, ohne Überdeckungen.

## v0.52.2 – Feinschliff

- [x] **3 Spieler:** Das Kuhhandel-Feld überdeckt nicht mehr den „Abbrechen“-Knopf; beim Rattenhandel-Antworten nicht mehr dein Geld und nicht die Überschrift.
- [x] **Ruhigerer Tisch:** Handelbare Tiere bei den Mitspielern haben einen festen Goldrand statt zu pulsieren. Bewegung bleibt nur für: wer dran ist, Stapel, Hauptknopf, Gebot/Zeit.

## v0.52.1 – Geld wandert über die Mitte

- [x] **Rattenrunde:** Wer eine Karte legt, dessen Schein fliegt verdeckt vom Platz (bzw. aus deinem Fächer) in den Topf in der Mitte.
- [x] **Ratte nehmen:** Der ganze Topf fliegt aus der Mitte zum Nehmer (bei dir offen in den Fächer) – nicht mehr aus den Händen der anderen.
- [x] **Kuhhandel/Rattenhandel:** Nach dem „KUHHANDEL!“-Auftritt fliegt das Angebot vom Platz in die Mitte; erst dann liegen die Scheine dort.
- [x] Geldschein ziehen kam schon aus der Mitte – unverändert.

## v0.52.0 – Avatare mit ganzem Körper

- [x] Alle 14 Shop-Avatare haben jetzt einen ganzen Körper mit eigener Kleidung und Requisite (Aktenkoffer, Zepter, Krücke, Handy …).
- [x] **Shop:** Die Figuren stehen komplett auf einem Podest in der Farbe ihrer Stufe.
- [x] **Startseite:** Dein aktiver Avatar steht groß rechts neben dem Tisch; Tippen öffnet den Shop. Ohne Avatar: „? Avatar holen“.
- [x] Am Spieltisch bleibt der runde Kopf (Platz).
- [x] Neuer Test: jeder Avatar hat Kopf, Körper und Bewegung.

## v0.51.0 – Turbo-Spielart

- [x] **⚡ Turbo** im Warteraum einschaltbar (Gastgeber): nur 7 Tierarten (ohne Hahn, Gans, Katze), Versteigerung 6 s statt 10 s, Kuhhandel-Bedenkzeit 12 s statt 20 s. Eine Partie ist etwa halb so lang.
- [x] Am Stapel steht „⚡ Turbo“, damit alle wissen, welche Spielart läuft.
- [x] Klassisch bleibt unverändert. Neue Regel-Tests: 100 Turbo-Komplettspiele.
- [x] **Esel:** echter Geldregen über den ganzen Tisch. **Ratte:** ein Rudel aus drei Ratten flitzt vorbei.
- [x] **📰 Was ist neu?** in den Einstellungen – nach einem Update erscheint es einmal automatisch.

## v0.50.0 – Neuer „Wer ist dran“-Anzeiger

- [x] **Kein wandernder gelber Kreis mehr.** Der Platz, der dran ist, leuchtet einmal hell auf und glimmt dann ruhig golden weiter.
- [x] **Überschrift klappt um** wie eine Anzeigetafel und trägt die Farbe des Spielers, der dran ist.
- [x] **Du bist dran:** dein Tischrand unten leuchtet golden.

## v0.49.0 – Kult-Avatare, Dublonen-Münze, einheitliche Größen

- [x] **3 neue Kult-Avatare (je 50):** Der verletzte Bennet, Der schreiende Nico, Der quasselnde Alp.
- [x] **Dublonen-Münze** statt „D“ – im Shop und neben deinem Namen.
- [x] **Einheitlicher Tisch:** Stapel und Tierkarte (Versteigerung, Ratte, Spezialkarte) haben jetzt dieselbe Größe, die Überschrift oben ist immer gleich groß – nichts „springt“ mehr zwischen den Phasen.
- [x] Hintergrund: automatischer Größen-Test, Demo-Ansichten auch mit 3 Spielern (`?p=3`).

## v0.48.1 – Shop schöner, 💬-Menü mit Emojis

- [x] **Shop neu:** zwei Reiter „Avatare“ und „Sprüche“, große Avatar-Karten mit Seltenheit, Sprüche als Sprechblasen. Nichts wird mehr abgeschnitten – bei wenig Platz wird gescrollt.
- [x] **💬-Menü:** oben 8 Emojis zum schnellen Reagieren (😂 👍 👎 😱 🤑 🙄 🔥 🐮), darunter deine gekauften Sprüche, dann die Standard-Sprüche, ganz unten die Karten.
- [x] **Sprechblasen am Tisch:** runder, mit Schatten, längere Sprüche brechen um; Emojis erscheinen groß ohne Kasten.

## v0.48.0 – Shop: Dublonen, Börsen-Avatare und Sprüche

- [x] **Shop geöffnet:** Startseite → 🛒 Shop. 11 eigene Börsen-Avatare (Selten 30 D, Episch 40 D, Legendär 60 D) und 8 Sprüche (10 D, „Ich habe nur gute Ideen“ 20 D).
- [x] **Dublonen:** Jeder startet mit 0. Für jeden Sieg gibt es 10 Dublonen (einmal pro Spiel). Der Kontostand steht neben deinem Namen.
- [x] **Gekaufter Avatar** ersetzt dein Profilbild – auf der Startseite, im Warteraum und am Spieltisch, für alle sichtbar.
- [x] **Gekaufte Sprüche** erscheinen im 💬-Menü am Tisch.
- [x] Preise und Käufe werden in der Datenbank geprüft (man kann nichts doppelt oder ohne genug Dublonen kaufen).

## v0.47.2 – Kleine Layout-Fehler (von den neuen Browser-Tests gefunden)

- [x] **Warteraum auf flachen Handys (800×360):** „SPIEL STARTEN“ war unten angeschnitten – passt jetzt ganz ins Bild.
- [x] **Kuhhandel-Auswahl (Schritt 1):** überdeckte auf flachen Handys ein Stück der Plätze links/rechts. Die Tier-Kärtchen sind dort jetzt etwas kompakter (Bild + Wert, ohne Tiernamen).
- [x] **Neu im Hintergrund:** automatische Browser-Tests bei jedem Pull Request – alle Ansichten in 4 Handy-Größen und komplette Test-Partien.

## v0.47.1 – Startseite symmetrisch

- [x] „＋ Neues Spiel“ und „🔑 Mit Code“ stehen jetzt nebeneinander mittig unter dem Tisch statt rechts daneben – der Tisch steht genau in der Mitte.

## v0.47.0 – Neue Startseite „Tisch“

- [x] **Börsenticker** läuft oben über die ganze Breite.
- [x] **Das Spiel liegt auf dem Tisch:** groß in der Mitte auf dem Filz – mit den Spielern und freien Plätzen („Platz nehmen“). Dein laufendes Spiel zuerst („Du bist dran!“ → „Weiter spielen“). Mehrere Spiele: mit ‹ › blättern.
- [x] Daneben „＋ Neues Spiel“ und „🔑 Mit Code“.
- [x] **Leiste unten wie in einer App:** Spielen · Shop (kommt mit dem nächsten Update) · Bestenliste · Statistik · Regeln · Einstellungen.
- [x] **⚙️ Einstellungen** in einem Fenster: Profilbild, Aussehen, Benachrichtigen (Schalter), Als App, Meine Statistik, Admin (nur Admins), Abmelden. Die vielen Knöpfe auf der Startseite sind weg.
- [x] Oben rechts dein Bild und Name – antippen ändert das Profilbild.
- [x] Testspiel (Debug) liegt als letzter Tisch zum Durchblättern.

## v0.46.0 – Kuhhandel: der Einsatz ist sichtbar

- [x] **Topf in der Mitte:** Statt einer Karte mit „um 2“ liegen alle eingesetzten Tierkarten beider Seiten in der Mitte – bei „um 2“ also 4 Karten. Darunter „2 gegen 2 · Gewinner bekommt alle 4“ (Rattenhandel: „Verlierer bekommt alle“).
- [x] **Einsatz je Seite:** Jede Seite zeigt ihre eingesetzten Karten, wie viele sie behält („+1“) und was sie hätte, wenn sie gewinnt („gewinnt → 4× Gans · Quartett!“).
- [x] Gilt beim Angebot machen, beim Antworten, beim Zuschauen und im Ergebnisfenster.
- [x] **Geldtausch im Ergebnisfenster:** Nach dem Aufdecken rutschen die beiden Geldstapel sichtbar auf die andere Seite. Danach fliegt nur noch das Tier – kein doppelter Geldflug mehr, die Pause nach dem Kuhhandel ist rund 1,5 s kürzer. Dein neues Geld erscheint beim Schließen im Fächer und leuchtet kurz.
- [x] „Kann nicht zahlen“ mit sehr vielen Scheinen: die Scheine werden zusammengefasst („10 ×8“), damit das Feld nicht in deine Tierreihe wächst (vom Test gefunden).
- [x] Spezialkarte bezahlen mit vielen Karten (z. B. 10): die Felder liegen in einer Reihe statt in zwei, damit sie nicht in deine Tierreihe ragen (vom Test gefunden, gab es auch schon live). Kuhhandel-Antwortfeld etwas kompakter für flache Handys.
- [x] Neue Demo-Ansichten: `tradeum2` (Kuhhandel um 2), `cantpaymany`, `sppay10`.

## v0.45.0 – Geld in der Hand, große Momente

**Dein Geld kommt und geht sichtbar aus deiner Hand**
- [x] **Bezahlen:** Genau deine Scheine schieben sich kurz hoch und fliegen dann offen aus dem Fächer zum Empfänger. Bis dahin bleiben sie in der Hand, die Summe daneben stimmt jederzeit.
- [x] **Bekommen:** Die Scheine fliegen offen in deinen Fächer, erscheinen erst bei der Landung und leuchten kurz.
- [x] Bei Mitspielern bleiben es Rückseiten (ihr Geld ist verdeckt).
- [x] Flüge starten jetzt sicher mit dem gemessenen Ziel (in manchen Browsern konnte ein Flug sonst am Startplatz hängen bleiben).

**Ratte**
- [x] Dein niedrigster Schein ist vorgewählt – nur noch „Verdeckt legen“ drücken oder einen anderen antippen. „Ratte nehmen“ bleibt getrennt in der Mitte.

**Neue Einstellung im Warteraum**
- [x] **💰 Geld zählt am Ende:** Übriges Geld wird zu den Punkten addiert (nicht multipliziert). Steht in der Abrechnung, auf dem Siegertreppchen („+300“) und in der Rechnung.

**Große Auftritte – nur bei besonderen Ereignissen** (gleicher Stil wie „KUHHANDEL!“, höchstens einer pro Ergebnis)
- [x] **GLEICHSTAND!** – Kuhhandel mit Differenz 0: der Herausforderer holt das Tier umsonst.
- [x] **BLUFF!** – Kuhhandel mit lauter Nullen gewonnen (sehen nur die beiden Beteiligten, die Beträge bleiben sonst geheim).
- [x] **GESCHENKT!** – niemand buzzert, die Spezialkarte gibt es umsonst.
- [x] **QUARTETT!** – das vierte Tier.
- [x] **RATTENKÖNIG!** – einer hat alle Ratten und muss ein Quartett blockieren.

## v0.44.0 – Kuhhandel: klarer auswählen

- [x] **Schritt 1 – ein Fenster:** „Mit wem, um welches Tier?“ – oben die Gegner, darunter große Kärtchen nur mit den Tieren, die ihr beide habt. Jedes Kärtchen zeigt Wert, „um 1/2“ und wie viele ihr habt („Du 3 · Lea 1“).
- [x] **Gegner auch direkt am Platz antippen:** mögliche Gegner sind gestrichelt umrandet („antippen“), der gewählte leuchtet („✓ gewählt“).
- [x] **Schritt 2 – Geld:** Gegner und Tier stehen fest, nur noch Scheine wählen. „Gegner/Tier ändern“ führt zurück.
- [x] Die verwirrende zweite Tierreihe (deine Tiere, nicht antippbar) ist weg.
- [x] Eigenes Set antippen (wenn du dran bist) springt wie bisher direkt zu Schritt 2.

**Fester Ablauf nach jedem Ergebnis** (aus den echten Flügen berechnet, nicht mehr geschätzt)
- [x] Fenster zu → das Tier fliegt → erst wenn es gelandet ist, fliegt das Geld (beim Kuhhandel erst das Angebot hin, wenn es angekommen ist das Gegenangebot zurück) → 0,7 s Ruhe → **dann** wandert der gelbe „dran“-Rahmen → erst danach ist „Karte aufdecken“ frei.
- [x] Fenster früher wegtippen: der ganze Ablauf rückt einfach vor, die Reihenfolge bleibt.
- [x] **Geld fliegt in einem Zug** vom Zahler zum Empfänger – kein Halt mehr in der Mitte.
- [x] Gemessen in Test-Partien: der Rahmen startet jetzt immer frühestens 0,7 s nachdem der letzte Schein gelandet ist (vorher oft, während das Geld noch flog).

**KUHHANDEL!**
- [x] Startet jemand einen Kuhhandel, erscheint bei allen kurz ein großes „KUHHANDEL!“ (bzw. „RATTENHANDEL!“): die beiden Spieler fliegen aufeinander zu, darunter „um 2× Kuh“. Dauert 1,5 s und blockiert nichts.

## v0.43.1 – Ruhigerer Ablauf

- [x] **Kuhhandel-Fenster:** Alle Scheine werden sicher aufgedeckt (vorher blieben auf manchen iPhones einzelne Scheine verdeckt).
- [x] **Gelber „dran“-Rahmen** wandert erst zum nächsten Spieler, wenn Tier und Geld gelandet sind – nicht mehr mittendrin.
- [x] **Richtige Anzahl:** Es fliegen so viele Scheine, wie wirklich bezahlt werden (vorher höchstens 5). Tierkarten: so viele, wie den Besitzer wechseln (beim Kuhhandel um 2 also 2).
- [x] Weniger Gelb auf dem Feld: das kurze Leuchten am Platz des neuen Tierbesitzers ist wieder weg.
- [x] Kuhhandel-Fenster: „Du bekommst 300 · Nico bekommt 560“ (vorher fehlte das zweite „bekommt“).
- [x] Kuhhandel vorbereiten: die Felder erscheinen sanfter und stoßen beim Auftauchen nicht mehr kurz an die Plätze.

## v0.43.0 – Klarere Ergebnisse, schneller bezahlen

**Ergebnis-Fenster nebeneinander**
- [x] **Kuhhandel als Duell:** Links der Herausforderer, rechts der Gegner, das Tier in der Mitte („VS“). Jeder hat ein eigenes Feld mit großen Scheinen und großer Summe.
- [x] Der Gewinner bekommt einen grünen Rahmen und das Schild „gewinnt“ (beim Rattenhandel „ist sie los“), der Verlierer wird leicht ausgegraut – erst nachdem die Scheine umgedreht sind.
- [x] Die **Differenz** steht groß in der Mitte (sehen auch Zuschauer). Bei Gleichstand steht da, wer gewinnt; Beteiligte sehen „Du bekommst 60 · Nico 100“.
- [x] Angenommenes Angebot im selben Stil: „bietet 60“ – ✓ – „nimmt an“.
- [x] **Versteigerung und Spezialkarte** im selben Stil: links wer kauft und zahlt (mit Schild „kauft“ / „kauft selbst“), rechts wer das Geld bekommt.
- [x] **Ratte genommen:** Wer sie nimmt, sieht die gewonnenen Scheine offen mit Summe; die anderen nur die Anzahl.
- [x] In den ersten Runden steht „Tippen zum Schließen“ im Fenster.

**Ablauf**
- [x] **Erst das Tier, dann das Geld:** Das Tier wandert zum neuen Besitzer (sein Platz leuchtet kurz auf), danach fliegt das Geld. Beim Kuhhandel erst das Angebot hin, dann das Gegenangebot zurück.
- [x] **Buzzer:** Sobald jemand buzzert, bleibt die Zahl stehen (mit Namen) und der Countdown tickt nicht weiter. Die kurze Zeit zum Gleichziehen läuft unsichtbar weiter.

**Flotter**
- [x] Ergebnis-Fenster stehen etwas kürzer (Versteigerung 3 s, Spezialkarte/Ratte 3,5 s) – „Karte aufdecken“ wird erst frei, wenn Tier und Geld gelandet sind.
- [x] Spezialkarte: „Zeig Batzen!“ nur noch 3 s, „Achtung“ 2 s (vorher 5 s und 3 s).
- [x] Auktionator lässt sich Zeit: nach 8 s steht bei ihm „Alle warten auf dich“ und die Knöpfe pulsieren; die anderen können ihn schon nach 12 s anstupsen (sonst 20 s).
- [x] „Passend wählen“ erscheint beim Bezahlen nur noch, wenn nichts vorgewählt ist oder du die Auswahl geändert hast.

**Bedienung**
- [x] **Bezahlen:** Passen deine Scheine genau (mit höchstens 5 Scheinen), sind sie schon vorgewählt – nur noch „Bezahlen“ drücken. Bei der Spezialkarte sind die kleinsten Scheine vorgewählt. Passt nichts genau, wählst du selbst. Die Auswahl lässt sich vorher ändern.
- [x] **Ratte:** Schein zweimal schnell antippen legt ihn direkt in die Mitte.
- [x] Viele Scheine im Bezahl- oder Angebotsfeld liegen in einer überlappenden Reihe, statt nach unten in deine Tierreihe zu wachsen. „Zeit abgelaufen“ sitzt am Kartenrand statt auf deiner Tierreihe.
**Spielende**
- [x] **Abrechnung:** Bevor das Siegertreppchen kommt, werden die Punkte einzeln hochgezählt – vom letzten Platz bis zum Sieger, mit Trommelwirbel; beim Sieger Glitzer und Fanfare. Antippen überspringt.
- [x] **Neue Auszeichnungen im Börsenbericht:** 🃏 Bluffer (Nullen in gewonnenen Kuhhandeln), 🌧️ Pechvogel (Kuhhandel knapp verloren), 💶 Trinkgeld-König (am meisten überzahlt), 🤏 Geizhals (oft geboten, nie hoch). Die Liste lässt sich scrollen.

- [x] Neue Demo-Ansichten: `tradeseen`, `tradetie`, `traderatresult`, `specialhit`, `paynew`, `?ev=ratgot`, `?ev=specialself`.

## v0.42.0 – Ganzer Bildschirm

- [x] **Der Tisch füllt jetzt den ganzen Bildschirm:** Bisher war er ein fester Rahmen, der oben/unten (iPhone) bzw. links/rechts (breite Handys) Platz verschenkt hat. Jetzt kleben Plätze, Menü, 💬, deine Knöpfe und dein Geld an den Rändern, die Mitte bekommt die zusätzliche Höhe bzw. Breite. Kamera-Aussparung und Home-Balken bleiben frei.
- [x] Dadurch keine Überlappungen mehr spät im Spiel (viele Tiere, viel Geld): Stapel/Versteigerungskarte an deiner Tierreihe, Kuhhandel-Felder im Geld-Fächer, „Zeig Batzen“-Stapel auf deinem Geld.
- [x] „… bald nur noch Kuhhandel“ neben dem Stapel bricht um und ragt nicht mehr in den Platz rechts.
- [x] Debug: `?spaet=1` startet das Testspiel kurz vor Schluss (alle haben viele Tiere) – zum Prüfen voller Plätze.

## v0.41.0 – Ruhiger aufdecken, einheitliche Knöpfe

- [x] **Aufdecken ohne Springen:** Die Karte wächst direkt aus dem Stapel, dreht sich um und bleibt genau dort liegen, wo sie versteigert wird (vorher rutschte sie erst nach unten und sprang dann nach oben).
- [x] **„Du führst“ steht jetzt im Gebots-Schild** („🔨 Du führst 200“) statt neben dem Geld – der Geld-Fächer bleibt an seinem Platz.
- [x] **Alle Entscheidungs-Knöpfe in derselben Form:** Zuschlag, Verkaufen, Ratte nehmen, Annehmen und Gegenangebot sehen jetzt aus wie „Selbst kaufen“ und „Karte aufdecken“ (weiße bzw. rote Pille, kleine Überschrift, Betrag darunter).

## v0.40.0 – Glitzer

- [x] **Gezogener Geldschein wird wieder groß gezeigt:** Nach „Niemand bietet – … umsonst“ (oder Spezialkarte umsonst) wurde der nächste Geldschein nicht mehr angezeigt. Behoben.
- [x] **Glitzer:** 100er, 200er und 500er funkeln beim Ziehen (Glanzstreifen, Sterne, 500er golden umrandet, helles Funkel-Geräusch).
- [x] Schwein, Kuh und Pferd: nach dem Umdrehen ein Funkenregen, während der Versteigerung glitzern sie ruhig weiter. Die große Karte liegt beim Aufdecken jetzt über deinen Tieren.
- [x] Bei 3 Spielern mit vielen Tieren ragte „… versteigert“ in den Platz oben – die Tischmitte rückt jetzt automatisch nach unten.
- [x] Geld-Summe rutscht nicht mehr unter den schräg liegenden letzten Schein.

## v0.39.0 – Spielgefühl

- [x] **Kuhhandel aufdecken wie am Tisch:** Im Ergebnis-Fenster drehen sich beide Stapel Schein für Schein um, erst dann steht der Gewinner fest (Unbeteiligte sehen nur die Rückseiten).
- [x] Letzte 3 Sekunden der Versteigerung: Tick-Ton und pulsierender Ring.
- [x] „⚡ Letzte Karte im Stapel!“ und „🐮 Stapel leer – ab jetzt nur noch Kuhhandel!“ werden angesagt.
- [x] Dein Gebot führt: Geld-Fächer schimmert golden, „🔨 Du führst“.
- [x] Esel-Bonus: Es regnen Scheine auf alle Plätze, mit Klingeln.
- [x] Tiergeräusche beim Aufdecken (Kuh, Esel, Hahn, Ratte) – Platzhalter, eigene Aufnahmen können in js/voices.js eingetragen werden.
- [x] Teure Karten (Schwein, Kuh, Pferd): Trommelwirbel, Karte zittert erst und leuchtet nach dem Umdrehen.
- [x] Ratte aufgedeckt: Eine kleine Ratte huscht über den Tisch.
- [x] Großes Gebot (+100 oder mehr auf einmal): „Wow!“ am Gebots-Schild.
- [x] Reaktionen fliegen sichtbar vom Absender zum Empfänger.
- [x] Gegner mit 3 von 4 Karten: Das Kärtchen am Platz glimmt.
- [x] Neue Schalter im Warteraum (Gastgeber, standardmäßig aus): **Bedenkzeit im Kuhhandel** (20 s Uhr, keine automatische Entscheidung) und **Zwischenstand im Menü** (nur offene Quartette, Geld zählt nicht).
- [x] Neues Aussehen „Winter“ mit Schnee-Muster.
- [x] Revanche: Wer zuletzt war, fängt an.
- [x] Der goldene „dran“-Rahmen wandert erst weiter, wenn das Ergebnis-Fenster zu ist und Karte und Geld geflogen sind (vorher sprang er zu früh).
- [x] Warteraum mit „Geldscheine im Stapel“ passt wieder ohne Scrollen aufs Handy (Schalter sitzen rechts neben der Überschrift).
- [x] Spürbarer: eigene Vibrations-Muster (überboten, Zuschlag, Herausforderung, Quartett, kann nicht zahlen, du bist dran); auf dem iPhone ein kurzer Impuls über einen Trick (iOS 18+, noch auf echten Geräten zu testen).

## v0.38.0 – Knöpfe dort, worum es geht

- [x] Versteigerung (Auktionator nach Ablauf): „Zuschlag an Nico · 130“ sitzt beim Gebots-Schild rechts neben der Karte, „Selbst kaufen“ bleibt unten links – weit auseinander.
- [x] Spezialkarte (Aufdecker entscheidet): „Verkaufen – Nico zahlt dir 7 Karten“ sitzt neben der Karte, „Selbst kaufen“ unten links.
- [x] Rattenrunde: „Ratte nehmen“ sitzt beim Stapel der gelegten Karten in der Mitte, „Verdeckt legen“ unten links beim Geld.
- [x] Bieten: „Passen“ ist kleiner und deutlich abgesetzt von den Gebotsknöpfen.

## v0.37.1

- [x] Kuhhandel beantworten: „Annehmen – Geld nehmen“ sitzt jetzt beim Geld des Herausforderers, „Gegenangebot“ bei deinem eigenen Geld – weit auseinander, kein Vertippen mehr. Auf dem Knopf steht, was passiert („1× Hund geht an Nico“ bzw. „1 Karte · 50 bieten“). Der Knopf „Ehrlich & männlich!“ im Kuhhandel ist weg – den Spruch gibt es weiter über 💬.
- [x] Rattenhandel: In der Mitte steht wieder „um 1“ (der Text „loswerden“ passte nicht auf das Schild).

## v0.37.0 – Kuhhandel deutlicher und schneller

- [x] Kuhhandel: Das umkämpfte Tier steht groß in der Mitte zwischen beiden Seiten („um 2“, bei Ratten „2× loswerden“) – für Herausforderer, Gegner und Zuschauer gleich. Das gebotene Geld steht groß da („3 Karten · verdeckt geboten“).
- [x] Schneller: Kuhhandel-Ergebnis 4 s statt 6 s; wenn der Stapel leer ist (nur noch Kuhhandel) nur 3 s – Sperre entsprechend kürzer.
- [x] Eigenes Tier-Set antippen, wenn du dran bist: Kuhhandel um dieses Tier öffnet sich direkt; handelbare Sets leuchten. Geht keiner: „Keiner sonst hat Esel“.
- [x] Im Spiel lässt sich kein Text mehr markieren (kein „Kopieren/Nachschlagen“-Menü beim langen Drücken).

## v0.36.0 – Börsen-Look, Börsenbericht, Rattenrunde im Ergebnis-Fenster

- [x] Rattenrunde kommt ins Ergebnis-Fenster („Lea nimmt die Ratte · + 3 Karten“); die gelegten Scheine fliegen beim Schließen zum Nehmer, Aufdecken ist so lange gesperrt.
- [x] Kurstafel zeigt echte Zahlen aus euren Spielen: letzter Sieg, Siege je Spieler (▲ zuletzt gewonnen), Rekord, teuerster Kauf – dazu die Tierpreise.
- [x] Warteraum: Kurstafel neben dem Titel; wer einsteigt, springt auf seinen Platz und „Mo ist an der Börse eingestiegen“ wird kurz eingeblendet.
- [x] Börsen-Rahmen in Gold statt Holz (Startseite, Warteraum, Spielende, Aussehen-Vorschau).
- [x] Spielende: größere Quartett-Symbole, die Rechnung des Gewinners steht direkt da (Antippen zeigt die eines anderen).
- [x] „Rückblick“ heißt jetzt **Börsenbericht** – mit Symbolen, neu „Pleitegeier“ (wer am wenigsten Geld übrig hat) und Knopf **Teilen** (schickt den Bericht als Text, z. B. in die WhatsApp-Gruppe).
- [x] Einladungslink zeigt beim Teilen eine Vorschau („Komm an die Tier Börse! 🐮📈“ mit Kuh-Bild).
- [x] Aufgeräumt: rund 230 ungenutzte Gestaltungsregeln entfernt – Aussehen bleibt gleich (per Bildvergleich geprüft).

## v0.35.0 – Team Rockets Tier Börse

- [x] Das Spiel heißt jetzt **Team Rockets Tier Börse**: neuer Startbildschirm mit Kurstafel mit laufenden Tierpreisen, Spruch „Kaufen. Bluffen. Kuhhandeln.“ – auch Anmeldeseite, Seitentitel, App-Name auf dem Homescreen und Einladungstext.
- [x] „Karte aufdecken“ und Kuhhandel (auch über die Kärtchen am Platz) sind erst frei, wenn das Ergebnis-Fenster abgelaufen ist (Versteigerung 4 s, Spezialkarte 4,5 s, Kuhhandel 6,5 s) – der Balken im Knopf zeigt die Wartezeit. Wegtippen schließt nur das eigene Fenster, die Sperre bleibt, damit alle anderen das Ergebnis sicher sehen. Test-Spieler warten genauso.
- [x] Ergebnis-Fenster dunkeln den Tisch nicht mehr ab – vorher wurde nur das Spielfeld dunkel und oben/unten blieb ein heller Rand stehen.

## v0.34.0 – flüssiger, ein Ergebnis-Fenster, Bezahlen im Fächer

- [x] **Ein Ergebnis-Fenster für alles:** Versteigerung, Spezialkarte und Kuhhandel sehen gleich aus – Karte links, rechts Art, Ergebnis und wer wem zahlt („Du → 120 → Lea“). Grüner Rahmen = gut für dich.
- [x] Quartett steht als Abzeichen direkt im Fenster (kein zweites Fenster mehr).
- [x] Beim Schließen fliegt die Karte aus dem Fenster ins Set, das Geld vom Zahler zum Empfänger. Antippen schließt sofort; deckt jemand die nächste Karte auf, macht das Fenster Platz.
- [x] „Kann nicht zahlen“ im gleichen Rahmen (rot).
- [x] Weg: gelbes Zuschlag-Schild, weißes „Was ist passiert“-Fenster, gelbes Esel-Fenster (steht alles schon in der Infozeile bzw. am Tisch). Beim Bezahlen liegt ein „Verkauft!“-Stempel auf der Karte.
- [x] Infozeile leuchtet kurz auf, wenn etwas Neues drinsteht.
- [x] **Bezahlen, Kuhhandel und Ratte direkt im Geld-Fächer:** Schein antippen → er springt ins Feld, im Feld antippen → zurück. Ratte: Schein antippen (hebt sich), dann „Verdeckt legen“.
- [x] Gebots-Blasen der oberen Plätze erscheinen neben dem Profil statt oben abgeschnitten; bietet jemand gleich nochmal, hüpft seine Blase nur.
- [x] Profile am Tisch einheitlich: Name und Status immer gleich breit, das Band kommt ohne Lücke aus dem Kreis (auch bei „versteigert“, „Aufdecker“ usw.). Wer dran ist, zeigt der goldene Rahmen um den ganzen Platz.
- [x] Standard-Aussehen jetzt Nachtblau mit Filz (wer sein Aussehen schon selbst gewählt hat, behält es; „Zurück auf Empfehlung“ unter Aussehen holt den neuen Standard).
- [x] Flüssiger: Dauer-Animationen (Wackeln am Stapel, Leuchten, Sanduhr) springen beim Neuzeichnen nicht mehr auf Anfang; Konfetti und Leuchten laufen auf dem Grafikchip; einheitliche Bewegungen.

## v0.33.2

- [x] Zeile „Was zuletzt passiert ist“ deutlich kleiner und immer einzeilig – der Ziehstapel rutscht nach oben und überdeckt deine Tier-Sets nicht mehr.
- [x] 💬-Knopf (Reaktionen) sitzt jetzt unten rechts statt oben links neben dem Menü – wirkt nicht mehr wie ein Teil von Nicos/linkem Platz.

## v0.33.1

- [x] Dezente Pfeile ↻ zwischen den Plätzen zeigen dauerhaft die Spielrichtung.
- [x] „+200“ (Geldschein) beim linken Platz verdeckt den 💬-Knopf nicht mehr.
- [x] Kürzere Statuszeilen am Platz, bleiben einzeilig: „Buzz 6“, „kein Buzz“, „🤖 Bot“.
- [x] Unten links kein doppeltes „Du versteigerst …“ mehr (steht schon oben im Schild).
- [x] Sprechblase an dich rutscht beim Bezahlen, Kuhhandel und in der Rattenrunde neben deine Geldauswahl statt darüber.
- [x] Kleine Handys (z. B. iPhone SE): Tier-Kärtchen der Mitspieler etwas größer.

## v0.33.0 – Sitzordnung wie am echten Tisch

- [x] Mitspieler sitzen jetzt um den Tisch: links, oben, rechts (bei 3 Spielern oben links und oben rechts), du unten. Gespielt wird im Uhrzeigersinn – links von dir ist als Nächstes dran.
- [x] Der Tisch nutzt die volle Breite; dein eigenes Profil ist weg (dein Geld und deine Tiere liegen ja vor dir).
- [x] Der Zug wandert sichtbar: ein goldener Schein gleitet vom alten zum neuen Platz; wer dran ist, dessen Platz leuchtet.
- [x] Gebote springen am Platz des Bieters auf, wer gepasst hat, wird grau.
- [x] Rattenrunde: Die gelegten Karten liegen sichtbar vor jedem Platz; wer die Ratte nimmt, zu dem fliegen alle Stapel.
- [x] Gekaufte Tiere, Geld und Esel-Bonus fliegen genau zum Platz (Ziel wird gemessen, nicht mehr fest eingestellt).
- [x] 💬-Knopf neben dem Menü für „Reaktion an alle“; Sprechblasen an dich erscheinen über deinem Geld, Sprechblasen an andere unter ihrem Platz.
- [x] „Erst ab N“ steht beim Buzzer auch schon während „Gleich …“; nach „keine N Karten“ bei der Spezialkarte kurze Zeile statt großer Scheinreihe (die Scheine zeigt das große Fenster).
- [x] Debug-Knöpfe unten rechts. Einmaliger Hinweis zur neuen Sitzordnung beim ersten Spiel.
- [x] Fehler behoben: „Achtung … 10“ lag als unsichtbare Fläche über dem ganzen Tisch.
- [x] „Anstupsen“ / „Für X übernehmen“ sitzen jetzt direkt unter bzw. neben dem Platz und verdecken keinen Namen; lange Namen werden mit „…“ gekürzt.

## v0.32.2

- [x] Dein Geld in der Hand ist weiter sichtbar (rund 90 % jeder Karte statt gut 60 %). Sonst hat sich nichts verschoben – per Bildvergleich in 36 Spielsituationen geprüft: nur der Geldfächer ist anders.

## v0.32.1

- [x] Spielfeld ist jetzt wirklich ein durchgehendes Bild über den ganzen Bildschirm: kein versetzter Streifen mehr oben/unten (bzw. links/rechts), Muster läuft lückenlos durch, die Spielerleiste reicht bis zum Rand. Auf allen Bildschirmgrößen und beim Drehen/Größe ändern.

## v0.32.0

- [x] Ein durchgehendes Spielfeld (Variante C): kein Holzrahmen und kein roter Rand mehr im Spiel – der ganze Bildschirm ist Tisch, die Mitspieler stehen rechts auf einer leicht abgedunkelten Leiste. Alle Knöpfe, Karten und Fenster bleiben genau an ihrem Platz.
- [x] „Aussehen“ angepasst: Vorschau und Vorlagen zeigen das neue Spielfeld; „Hintergrund“ gilt jetzt für Startseite & Menüs (Punkt in der Vorlage).
- [x] Deutlichere Texte beim Kaufen: Schild „Nico kauft das Schwein von Alp für 60!“ (bzw. „… selbst für 60!“, „Niemand bietet – Alp bekommt die Gans umsonst“). Bildzeile: „Nico hat Schwein [Bild] von Alp für 60 gekauft“, „Alp hat Schwein selbst gekauft – zahlt 60 an Nico“, „Du hast 2× Kuh von Lea ertauscht“, „Nico hat die Kuh-Spezialkarte von Mo für 3 Karten gekauft“ bzw. „Mo behält die Kuh-Spezialkarte und zahlt 3 Karten an Nico“, „… hat die Ratte genommen und 4 Karten bekommen“, „… hat einen Geldschein gezogen“. Bei dir richtig: „Du hast“, „von dir“, „an dich“.
- [x] Fehler behoben: Beim Vorkaufsrecht stand bisher „Verkauft an …“ statt „kauft selbst“.
- [x] Spielregeln unverändert; ein neuer Test prüft, dass Vorkaufsrecht/„behält“ richtig erkannt werden.

## v0.31.0

- [x] Tiere der Mitspieler rechts als kleine Karten statt Kreise (Anzahl als Plakette, Quartett mit goldenem Rand und ✓, Spezialkarte mit Stern). Bis zu 7 Sorten pro Spieler sichtbar statt 4; bei dir selbst 5 (deine Tiere liegen ja groß unten).
- [x] Spielfeld bleibt gleich groß – alles passt in die bisherige Spalte (geprüft auf allen Handygrößen und am Laptop).

## v0.30.5

- [x] Unten links steht nicht mehr doppelt „X ist dran …“ – wer dran ist, zeigen schon das Schild oben und die Sanduhr. Die Fläche bleibt frei, solange du nicht dran bist.
- [x] „Zieht einen Geldschein“ erscheint jetzt wie Kauf und Kuhhandel als Bildzeile (Spieler + kleiner Schein).
- [x] Fehler behoben: Mit sehr vielen Tieren (und großer Schrift) ragte deine Auslage ein paar Pixel unter die Knöpfe links. Sie wird jetzt nachgemessen und passt immer.

## v0.30.4

- [x] Fehler behoben: Das Fenster „Kann nicht zahlen“ kam nach jedem weiteren Gebot erneut. Jetzt kommt es genau einmal, danach läuft die Versteigerung neu. Gleiche Ursache, ebenfalls behoben: Das Kuhhandel-Ergebnis konnte beim nächsten Kuhhandel nochmal auftauchen, der Geldschein beim nächsten Zug, und der Esel-Hinweis verschwand beim ersten Gebot. (Jedes Ereignis hat jetzt eine eigene Nummer.)
- [x] Deine neue Karte fliegt jetzt genau auf den passenden Stapel in deiner Auslage (und wird dabei so klein wie die Karten dort); der Stapel wackelt, wenn sie ankommt.
- [x] Große Schrift ist jetzt Standard. Wer sie unter „Aussehen“ selbst ausgeschaltet hat, behält seine Wahl.

## v0.30.3

- [x] Kann jemand nicht zahlen, sehen jetzt **alle** 5 s lang groß in der Mitte jeden einzelnen seiner Scheine, dazu Anzahl und Summe („7 Scheine · zusammen 80 Taler“) und was jetzt gilt („darf höchstens 80 bieten“ bzw. bei der Spezialkarte „darf erst ab 7 buzzern“). Antippen schließt das Fenster; die kleine Zeile auf dem Tisch bleibt wie bisher.
- [x] Fair für alle: In diesen 5 s kann niemand bieten (auch wer das Fenster wegtippt nicht) – die Gebotsknöpfe sind ausgegraut („gleich geht’s los …“), danach laufen die normalen 10 s. Bei der Spezialkarte startet „Achtung“ und der Countdown erst nach den 5 s.

## v0.30.2

- [x] Verschnaufpause: Nach jedem Ergebnis (Zuschlag, Kuhhandel, Spezialkarte, Ratte genommen, Geldschein gezogen) kann der Nächste 2,5 s lang nicht aufdecken oder handeln – der Knopf ist ausgegraut und füllt sich mit einem goldenen Balken. Test-Spieler warten genauso.
- [x] Die gekaufte Karte fliegt etwas langsamer zum Käufer und immer bis zum Ende.
- [x] Fehler behoben: Zuschlag-Schild („Verkauft an … für 90!“), Quartett-Jubel, gezogener Geldschein, fliegendes Geld und die weiße Info verschwanden, sobald irgendetwas Neues passierte (z. B. schnelles Bezahlen). Jetzt laufen sie immer ganz durch.
- [x] Zeitgesteuerte Fenster richten sich nach der Serverzeit (wichtig, wenn die Uhr am Handy etwas falsch geht).

## v0.30.1

- [x] Reaktionen: 😂 und 😱 sind raus. Neu: „Unehrliches, unmännliches Angebot! 👎“ (große rote Sprechblase mit Buh-Ton) und „Komm schon, da geht noch mehr!“.
- [x] Lange Sprüche gehen im Reaktionsfenster über die ganze Breite, damit sie lesbar bleiben.

## v0.30.0

- [x] Schnick-Schnack-Schnuck: Ergebnis bleibt jetzt 5,5 s stehen (erst Schütteln, dann groß „Du gewinnst!“), mit Zeitbalken; danach steht oben „X gewinnt Schnick-Schnack-Schnuck · bei N“.
- [x] Kuhhandel-Ergebnis sehen jetzt **alle** 6 s lang: „X gewinnt 1× Hund“ + „Unterschied: 40“ (bzw. „nimmt das Angebot an“ / „Gleichstand – Herausforderer gewinnt“). Die genauen Beträge sehen nur die beiden Beteiligten.
- [x] Spezialkarte: Ergebnis („X bekommt die Spezialkarte · Y zahlt Z 4 Karten“) bleibt 4 s stehen.
- [x] Antippen schließt die Ergebnis-Fenster sofort; das alte „Weiter“-Fenster nach dem Kuhhandel ist weg.

## v0.29.3

- [x] Fehler behoben: Beim Kuhhandel gegen jemanden mit vielen Tieren lag die dritte Reihe unter den Geldscheinen und war nicht antippbar. Ab 5 Tieren werden die Kacheln kleiner, alle bleiben sichtbar.
- [x] Größere Tippflächen auf dem Handy für kleine Knöpfe (Tiere der Gegner, Gegner-Auswahl, „Ehrlich & männlich“, Profil-Knöpfe).

## v0.29.2

- [x] Kuhhandel: In deinem Kasten siehst du jetzt deine eigenen Tiere (eine Reihe, Rest als „+N“). Das Tier, um das es geht, steht vorne, groß und golden umrandet – beim Anbieten, Warten und Antworten.

## v0.29.1

- [x] Kuhhandel: Statt der Anzahl beim Gegner („×3“) steht am Tier jetzt, worum es geht („um 1“ bzw. „um 2“); oben „1× Kuh“.
- [x] Reaktionsfenster schließt sich mit einem Tipp aufs Spielfeld; passt jetzt immer ganz auf den Bildschirm; Tiere darin als Mini-Karten.
- [x] Keine doppelten Hinweise mehr: Wenn schon ein Schild (z. B. „Niemand bietet …“) oder die Bildzeile die Aktion zeigt, kommt kein zusätzliches weißes Fenster.

## v0.29.0

- [x] Neue Reaktion „Ehrliches, männliches Angebot! 💪“ – große goldene Sprechblase mit eigenem Ton. Beim Kuhhandel als Schnellknopf „💪 Ehrlich & männlich!“ direkt am Duell.
- [x] „Zeig Batzen!“: Bei jeder Spezialkarte gibt es 5 Sekunden lang einen großen Knopf – jeder darf drücken. Dann liegen alle Geldstapel verdeckt mit Anzahl auf dem Tisch (3 s), danach „Achtung“ und Countdown. Drückt keiner, geht es nach 5 s normal weiter.

## v0.28.0

- [x] Aussehen: Vorschau-Tisch links bleibt stehen, beim Durchprobieren springt nichts mehr nach oben.
- [x] Aussehen: Kuhflecken entfernt; neu: 4 Tischfarben (Ozean, Pflaume, Oliv, Schoko), 6 Hintergründe (Ozean, Wald, Pflaume, Sand, Koralle, Himmel), 4 Kartenrücken (Türkis, Orange, Pink, Weiß), Muster Wellen/Zickzack/Kreise/Fischgrät/Gitter, Vorlagen Ozean/Wald/Pflaume/Strand.
- [x] Aussehen: Schalter „Große Schrift“ für die kleinen Beschriftungen.
- [x] Ton in 4 Stufen: aus / leise / mittel / laut (Menü).
- [x] „Niemand bietet“-Schild sitzt höher und verdeckt den Stapel nicht mehr; die Bildzeile ist solange ausgeblendet.
- [x] Rattenrunde: kurz „Legen:“ neben den Scheinen.
- [x] Aufdecken: Karte wird nicht mehr riesig.
- [x] Neu: „📊 Statistik“ auf der Startseite – Spiele, Siege, Quote, Rekord, Ø Punkte, Ø Quartette, letzte Spiele; ab jetzt auch Lieblingstier, teuerster Kauf und Kuhhandel-Bilanz (SQL v0.28).
- [x] Neu: Push-Benachrichtigung „Du bist dran“, auch wenn die App zu ist (Startseite „🔔 Benachrichtigen“ oder Menü). Braucht SQL v0.28 + zwei Secrets im Cloudflare Worker. iPhone: nur als App vom Homescreen.

## v0.27.0

- [x] Gezogener Geldschein sieht aus wie ein echter Schein (vorher dunkler Fleck in der Mitte).
- [x] Startseite: Bei laufenden Spielen steht „Du bist dran!“ (rot umrandet), wenn jemand auf dich wartet.
- [x] Regeln: alle Tierkarten mit Wert als kleine Karten; Überschriften in Tischfarbe (auch Bestenliste).
- [x] Spielende: Fanfare für alle, „Buh“ für den letzten Platz.
- [x] Gebotsknöpfe vibrieren kurz beim Tippen (wenn Vibration an).
- [x] Fehler behoben: Die Esel-Einblendung „Alle bekommen +N“ verschwand beim Neuzeichnen nach dem Aufdecken, bevor man sie sah. Jetzt läuft sie zu Ende, und an der Karte steht dauerhaft „Esel-Bonus: alle +N“.

## v0.26.0

- [x] Kleine Tierbilder ohne Kreis: Kuhhandel-Auswahl, Ratten-Quartettwahl und Tier-Zeilen nutzen Mini-Karten mit Strahlen.
- [x] Kuhhandel-Ergebnis mit großer Tierkarte und Anzahl.
- [x] Schnick-Schnack-Schnuck als sauberes Fenster in der Tischmitte.
- [x] Geldschein aus dem Stapel: „N im Stapel“ wird solange ausgeblendet.
- [x] Warte-Text kurz: „Mo entscheidet …“.
- [x] Startseite: Logo mit Comic-Kuh.
- [x] Wer dran ist, hat eine kleine Sanduhr am Bild.
- [x] Letzte Aktion als Bildzeile (z. B. Bild „Nico“ kauft für 120 [Kuh-Karte] von Bild „Lea“).
- [x] „Überboten!“-Hinweis mit eigenem Ton, wenn dich jemand überbietet.
- [x] Revanche-Knopf leuchtet „Revanche läuft – mitmachen“, sobald jemand eine gestartet hat.
- [x] Fehler behoben: Spielerfarbe in der Spalte rechts ging verloren (doppelte Stilangabe).

## v0.25.0

- [x] Neues Kartendesign: Tier groß ohne Kreis, Sonnenstrahlen in der Tierfarbe, Wert oben und Name unten auf Weiß. Gilt für alle großen Karten und die eigenen Tierstapel.
- [x] Viele Tierarten: deine Stapel bleiben rechts neben den Knöpfen und werden kleiner, statt unter die Knöpfe zu rutschen. Kartenstapel in der Mitte etwas kleiner.

## v0.24.0

- [x] Warteraum: Tisch in der gewählten Spielfeld-Farbe.
- [x] Spielende auf dem Spieltisch mit Siegerpodest (1./2./3., Krone, Quartette), Platz 4 darunter; antippen zeigt die Rechnung. Rückblick ebenfalls auf dem Tisch.
- [x] Knöpfe, die noch nicht gehen (z. B. „Bezahlen“), sind grau statt blass-rot.
- [x] Letzte Hinweistexte entfernt (Ratte, Kuhhandel).
- [x] Spezialkarte: statt Infokasten „Schwein haben: Mo ×1“ bzw. „Noch keiner hat …“.
- [x] Geldschein aus dem Stapel: Text oben wird solange ausgeblendet.
- [x] „noch 2“ unter den eigenen Tieren größer, „noch 1“ fett.
- [x] Startseite: „Spielerbild“ und „Abmelden“ als Knöpfe.

## v0.23.0

- [x] Neuer Tischaufbau: linke Spalte weg, Tisch breiter, Menü als kleiner Knopf oben links.
- [x] Deine Knöpfe immer unten links (Daumen). Wenn du nichts tun musst, steht dort, worauf ihr wartet.
- [x] Dein Profil rechts unten unter den Gegnern; antippen zeigt deine Punkte mit Rechnung.
- [x] Kuhhandel direkt über die leuchtenden Tiere der Gegner starten; gewähltes Tier groß und golden, Schritte als Leiste.
- [x] Versteigerung: Countdown als Ring um die Karte; daneben, wer das Tier schon hat (Bild × Anzahl) oder „Neu im Spiel“.
- [x] Gegner: Geldkarten-Anzahl als kleines Symbol statt „7 Karten“.
- [x] Banner groß in deiner Farbe, wenn du gefragt bist („Du bist dran“, „Zahle …“, „Nochmal aufdecken!“).
- [x] Geld: Fächer rückt zusammen, ab 12 Scheinen als Stapel je Wert mit „×N“ – Summe immer sichtbar.
- [x] Rattenrunde: Karte legen durch Antippen der eigenen Scheine unten, links nur „Ratte nehmen“.
- [x] Gelber Rand bei Aktionen entfernt.
- [x] Neu: „🎨 Aussehen“ (Startseite und Menü): Spielfeld-Farbe und -Muster, Hintergrund-Farbe und -Muster, Kartenrücken-Farbe und -Muster, fünf Vorlagen. ★ = Empfehlung. Standard: Petrol-Tisch auf Bordeaux. Gilt nur auf dem eigenen Gerät.

## v0.22.0

- [x] Spielerspalte: Tiere nur noch in einer Reihe (Quartette zuerst), Rest als „+N“ – nichts rutscht mehr übereinander. Antippen zeigt alles.
- [x] Rattenrunde: groß „Du bist dran“ bzw. „Nico ist dran“ und „Gelegt: N Karten“.
- [x] Spielende: Konfetti fällt hinter der Wertung, Namen bleiben lesbar.
- [x] Kuhhandel: drei Schritte links (Gegner → Tier → Geld) mit Häkchen.
- [x] Wenn du gefordert bist (dran, herausgefordert, zahlen, Ratte, Entscheidung): Rand leuchtet kurz auf.
- [x] Letzte Aktion erscheint kurz groß in der Mitte, danach klein oben.
- [x] Eigene Tiere: „noch 2“ statt „2/4“, bei „noch 1“ golden.
- [x] Stapel größer und mittig; wenn du dran bist, wackelt er und lässt sich antippen.
- [x] Esel: eine große Einblendung „Esel! Alle bekommen +N“ statt vier kleiner Schilder.
- [x] Startseite: Links als richtige Knöpfe, Spielliste kompakter.
- [x] Alle Tipps und Erklärtexte im Spiel entfernt.

## v0.21.1

- [x] Zuschlag-Schild („Verkauft an … für …!“) repariert: war schwarz mit kleinem weißem Kästchen (alte Regel im Stil überschrieb es) – jetzt goldenes Band mit Hammer, mittig auf dem Tisch.

## v0.1.0 – Spiellogik

- [x] Spielstart mit 3–4 Spielern, gemischter Stapel, Startgeld 90 Taler
- [x] Versteigerung mit Geboten in 10er-Schritten, Zuschlag oder Vorkaufsrecht
- [x] Esel-Bonus 50 / 100 / 200 / 500 für alle
- [x] Bezahlen ohne Wechselgeld
- [x] Zahlungsunfähig: Karten offenlegen, Neustart, Obergrenze altes Gebot minus 10
- [x] Kuhhandel: annehmen oder Gegenangebot, Gebote werden immer getauscht, Gleichstand → Herausforderer gewinnt
- [x] Spielende und Wertung
- [x] Verdeckte Infos pro Spieler (fremdes Geld nur als Kartenanzahl)
- [x] Automatische Tests inkl. 200 zufälliger Komplettspiele

## v0.2.0 – Spieltisch

- [x] Startseite: Name, offene Spiele, Spiel erstellen, beitreten
- [x] Warteraum mit 4 Plätzen, Start ab 3 Spielern
- [x] Spieltisch im Querformat: Tisch mit Stapel, eigene Tiere, Geld als Fächer, Mitspieler rechts
- [x] Versteigerung: Bieten / Hohes Gebot / Passen, Auktionator: Zuschlag oder Vorkaufsrecht
- [x] Bezahlen mit Kartenauswahl, Hinweis bei Überzahlung (kein Wechselgeld)
- [x] Zahlungsunfähig: offene Karten für alle, Obergrenze sichtbar
- [x] Kuhhandel: Gegner, Tier und Karten wählen; Antwort mit Annehmen oder Gegenangebot; Ergebnis für die Beteiligten
- [x] Spielende mit Wertung

## v0.3.0 – Tierbilder und Animationen

- [x] 10 eigene Tierbilder auf allen Karten (groß, Tisch, Kuhhandel)
- [x] Tierkarte fliegt beim Versteigern auf den Tisch
- [x] Neues Gebot: Höchstgebot-Schild und Sprechblase springen kurz auf
- [x] Esel-Bonus: „+Betrag“ steigt bei allen Spielern auf
- [x] Zahlungsunfähig: Kartenkasten wackelt
- [x] Gekauftes oder gehandeltes Tier fliegt zum neuen Besitzer
- [x] „Du bist dran“ pulsiert, Konfetti am Spielende
- [x] Animationen aus, wenn am Handy „Bewegung reduzieren“ eingestellt ist

## v0.4.0 – Countdown, Verbindung, Signal

- [x] Versteigerung läuft auf Zeit: 10 s Start, jedes Gebot setzt auf 6 s zurück; alle gepasst = sofort vorbei
- [x] Auktionator entscheidet erst nach Ablauf: Zuschlag oder selbst zum Höchstgebot kaufen
- [x] Nach Standby / Netzwechsel lädt das Spiel den aktuellen Stand automatisch nach
- [x] Mitspieler ohne Verbindung werden als „offline“ angezeigt
- [x] Laufende eigene Spiele auf der Startseite („Weiter spielen“)
- [x] Ton + Vibration, wenn du dran bist, zahlen musst oder herausgefordert wirst (im Menü abschaltbar)
- [x] Gebotsknöpfe für jeden Scheinwert: +10, +20, +50, +100, +200, +500

## v0.4.1 – Fehlerbehebung

- [x] Spieler wurden rausgeworfen, wenn irgendein anderes Spiel gelöscht wurde – jetzt nur noch beim eigenen Spiel
- [x] Kurzer Verbindungsabbruch wirft nicht mehr raus, sondern versucht es erneut
- [x] Countdown: 20 s nach dem Aufdecken, 15 s nach jedem Gebot

## v0.4.2 – Countdown für alle gleich

- [x] Countdown läuft nach der Server-Uhr statt nach der Uhr jedes Geräts
- [x] Spielstand wird alle 3 Sekunden abgeglichen, auch wenn die Live-Verbindung hakt
- [x] „Offline“ erst nach 15 Sekunden ohne Verbindung, kurze Aussetzer werden ignoriert

## v0.5.0 – Debug-Modus

- [x] Einschalten mit ?debug=1, ausschalten mit ?debug=0 (gilt pro Gerät)
- [x] Testspiel mit 3 oder 4 Spielern nur auf diesem Gerät, ohne Supabase
- [x] Sicht wechseln (oben rechts) oder automatisch zu dem, der gerade handeln muss
- [x] Test-Spieler, die selbst bieten, zahlen, zuschlagen und handeln
- [x] Abkürzungen: Countdown 5 s, Vorspulen, Esel als nächste Karte, Geld leeren
- [x] Infofenster: Version, Live-Verbindung, letzter Abgleich, Uhr-Abweichung, Online, Fehler
- [x] „Fehlerbericht kopieren“ für echte Spiele

## v0.5.1 – Eigenes Geld in der Auktion

- [x] Während der Versteigerung zeigt eine Leiste deine Geldkarten und die Summe (für Bieter und Auktionator)

## v0.6.0 – Versteigerung auf dem Tisch

- [x] Die Auktion verdeckt den Tisch nicht mehr: Tierkarte, Countdown und Höchstgebot liegen mitten auf dem Tisch
- [x] Eigenes Geld bleibt als Fächer in der Hand sichtbar (extra Geld-Leiste entfällt)
- [x] Gebotsknöpfe (+10 bis +500) und „Passen“ in der linken Spalte, Auktionator entscheidet dort

## v0.6.1 – Startgeld

- [x] Startgeld je Spieler: 2× 0, 3× 10, 1× 20, 1× 50 = 100 Taler (vorher 90)

## v0.6.2 – Kuhhandel übersichtlich

- [x] Tiere im Kuhhandel als kleine Kacheln (passt auch bei allen 10 Tierarten)
- [x] Geld als Stapel nach Scheinwert: antippen legt einen Schein ins Angebot, Schein im Angebot antippen nimmt ihn zurück
- [x] Gilt für Kuhhandel, Gegenangebot und Bezahlen

## v0.7.0 – Optimierungen

- [x] War jemand gleichzeitig schneller, wird der Zug automatisch auf dem neuen Stand nochmal versucht
- [x] Als App aufs Handy (Vollbild, Querformat, Kuh-Symbol) mit Anleitung für iPhone und Android
- [x] Revanche am Spielende mit denselben Spielern
- [x] „Passend auswählen“ beim Bezahlen (am wenigsten überzahlen)
- [x] Spielregeln im Menü und auf der Startseite
- [x] Quartett-Moment, wenn jemand alle 4 Karten einer Tierart hat
- [x] Wiedereinstieg auf neuem Gerät mit Spiel-Code + PIN
- [x] Alte Spiele (2 Tage ohne Zug) werden automatisch gelöscht
- [x] SQL `supabase/v0.7-wiedereinstieg.sql` in Supabase ausgeführt

## v0.8.0 – Konten und Extras

- [x] Feste Konten: Anmelden mit Name + Passwort, auf jedem Gerät dasselbe Konto (bisheriges Gerät wird beim Konto-Erstellen übernommen)
- [x] Spielerbild: Tier + Farbe wählen, erscheint im Warteraum, am Tisch und in der Bestenliste
- [x] Einladung per Link aus dem Warteraum (WhatsApp & Co.), Link führt direkt in den Warteraum
- [x] Gastgeber kann Spieler aus dem Warteraum entfernen; geht der Gastgeber, übernimmt der Nächste
- [x] Reaktionen im Spiel: Bluff!, Niemals!, Gut gespielt!, Zu teuer!, 😂, 😱
- [x] Geräusche: Karte aufdecken, Gebot, Hammerschlag, Münzen, Kuhhandel, Quartett (im Menü abschaltbar)
- [x] Geld-Animation: verdeckte Scheine fliegen vom Zahler zum Empfänger
- [x] Bestenliste: Siege, Spiele, Quote, Rekord, Ø Quartette
- [x] Erste-Runde-Hilfe: Hinweise beim ersten Mal (je einmal pro Konto und Gerät)
- [x] Supabase: „Confirm email“ ausgeschaltet
- [x] SQL `supabase/v0.8-konten.sql` in Supabase ausgeführt

## v0.9.0 – Ratten, Spezialkarten und Feinschliff

- [x] 4 Ratten im Stapel: Rattenrunde (verdeckt Karte legen oder Ratte nehmen), danach nochmal aufdecken
- [x] Rattenhandel: nur wenn beide Ratten haben, wer mehr bietet wird sie los
- [x] Spielende: wer alle Ratten hat, wählt ein Quartett, das nicht zählt (mit Punktevorschau)
- [x] 10 Spezialkarten (je 250, nicht handelbar): Buzzer-Countdown 10 → 1, Kaufen oder Verkaufen, Bezahlen mit Kartenanzahl
- [x] Schnick-Schnack-Schnuck bei Gleichstand am Buzzer
- [x] Zahlungsunfähig bei der Spezialkarte: Karten offen, Countdown neu, erst ab eigener Kartenanzahl
- [x] Neue Wertung mit Spezialkarten und blockiertem Quartett
- [x] Reaktionen: eigenen Platz antippen = an alle, anderen Spieler antippen = an ihn
- [x] Version klein unten rechts
- [x] Spielerspalte: Tiere als Symbol mit Anzahl (z. B. 2× Pferd), Ratten und Spezialkarten mit Stern
- [x] Wert auf jeder Tierkarte, auch klein
- [x] Spielregeln im Spiel ergänzt; Debug: Ratte / Spezialkarte als nächste Karte
- [x] Laufende alte Spiele ohne Ratten enden weiterhin normal

## v0.10.0 – Anstupsen, Punkte, Rechnung, Buzzer-Spannung

- [x] Anstupsen: Wartet das Spiel über 20 s auf jemanden, erscheint bei ihm „👉 Anstupsen“ – sein Handy piept und vibriert
- [x] „Punkte jetzt“ links unter dem Geld (nur die eigenen)
- [x] Spielende: Spieler antippen zeigt die Rechnung, z. B. (800+250★ + 1000) × 2 + 250★ = 4350
- [x] Buzzer: Ticken bei 3-2-1, eigener Buzzer-Ton
- [x] Schnick-Schnack-Schnuck: Hände schütteln, dann wird aufgedeckt, mit Ergebnis

## v0.11.0 – Geldscheine im Stapel

- [x] Warteraum: Gastgeber schaltet „Geldscheine im Stapel“ ein und stellt pro Schein (0 bis 500) die Anzahl ein, höchstens 20
- [x] Mitspieler sehen die Einstellung im Warteraum (nur lesen)
- [x] Geldschein aufgedeckt: Aufdecker bekommt ihn, alle sehen den Betrag, Zug ist vorbei
- [x] Revanche übernimmt die Einstellung

## v0.12.0 – Feinschliff

- [x] „Neue Version da – neu laden“: App prüft regelmäßig, ob es ein Update gibt
- [x] Spiel mit neuerer Version: ältere Handys müssen erst neu laden; im Warteraum startet das Spiel erst, wenn alle aktuell sind
- [x] Dateien werden nicht mehr veraltet aus dem Zwischenspeicher geladen
- [x] Bildschirm bleibt im Warteraum und im Spiel an
- [x] Kleine Handys (iPhone SE/Mini): größere Symbole und Texte, Spielnamen auf der Startseite nicht mehr abgeschnitten
- [x] Mitspieler antippen zeigt seine Tiere, Ratten, Spezialkarten und Geldkarten groß
- [x] Kurze Vibration beim Buzzern
- [x] Startseite: offene Spiele zeigen „mit X Geldscheinen“
- [x] Spezialkarte: „Darf nicht buzzern“ statt „Erst ab 0“, kürzere Kartenzeile
- [x] Debug-Testspiel: „Geld im Stapel“ an/aus

## v0.13.0 – Betrieb und Rückblick

- [x] Supabase schläft nicht mehr ein: Cloudflare fragt täglich kurz die Datenbank an (dazu als Reserve GitHub)
- [x] Fällt jemand 2 Minuten aus, kann jeder Mitspieler „🤖 Für X übernehmen“ – ein Test-Spieler spielt für ihn weiter, bis er „Selbst weiterspielen“ tippt
- [x] Passwort ändern im Spielerbild-Fenster; Anleitung für Alp zum Zurücksetzen (`supabase/passwort-zuruecksetzen.md`)
- [x] Tests laufen automatisch bei jedem Pull Request auf GitHub
- [x] Fehler werden automatisch an Supabase gemeldet (Tabelle `error_reports`)
- [x] Rückblick am Spielende: teuerster Kauf, Kuhhandel-König, Rattenfänger, Sternsammler, Glückspilz, Sparfuchs
- [x] Ton und Vibration getrennt im Menü
- [x] SQL `supabase/v0.13-fehlerberichte.sql` in Supabase ausgeführt

## v0.14.0 – Admin-Bereich

- [x] Startseite → „⚙ Admin“ (nur für Admins sichtbar, Rechte werden in Supabase geprüft)
- [x] Spieler: Liste mit letzter Anmeldung, Spielen und Siegen; Passwort neu setzen; Konto löschen; Admin geben/nehmen
- [x] Spiele: laufende und offene Spiele mit Phase ansehen und löschen
- [x] Bestenliste: einzelne Spiele entfernen oder alles zurücksetzen
- [x] Fehlerberichte direkt in der App ansehen und löschen
- [x] SQL `supabase/v0.14-admin.sql` in Supabase ausgeführt (Admin: Alp)

## v0.15.0 – Debug im Admin-Bereich

- [x] Admin-Bereich → Reiter „Debug“: Debug-Modus auf diesem Gerät an/aus, Testspiel mit 3 oder 4 Spielern starten, Geld im Stapel an/aus
- [x] Link `?debug=1` funktioniert weiterhin für alle

## v0.16.0 – Bezahlen am Tisch, Bedienung am iPhone

- [x] Bezahlen öffnet kein eigenes Fenster mehr: Tier und Kassenfeld in der Tischmitte, Scheine unten in der Hand antippen, Knöpfe links
- [x] Gilt auch für die Spezialkarte; die anderen sehen am Tisch, wer gerade zahlt
- [x] iPhone-App vom Home-Bildschirm: Spiel bleibt in der sicheren Fläche (nicht unter Kamera-Aussparung und Home-Balken)
- [x] Kein Doppeltipp-Zoom mehr, Knöpfe reagieren schneller
- [x] Kleine Knöpfe größer: Debug-Leiste („Sicht wechseln“), Debug-Fenster, Emoji-Auswahl, Kuhhandel-Gegner, Warteraum, Admin

## v0.17.0 – Schnellere Versteigerung, Geldschein zeigen

- [x] Versteigerung: 10 s nach dem Aufdecken und nach jedem Gebot wieder 10 s (vorher 20 s / 15 s)
- [x] Geldschein aus dem Stapel: wird allen groß in der Tischmitte gezeigt („Nico zieht 200“) und fliegt dann zum Spieler

## v0.18.0 – Neues Tisch-Design

- [x] Breiterer Tisch, Infos links in einem Kasten, Spielerspalte mit Karten (Symbole unter dem Namen)
- [x] Reaktionen/Spielerdetails nur noch beim Antippen von Bild oder Name
- [x] Wer dran ist, leuchtet; Höchstbietender bekommt „🔨 Betrag“ an seiner Karte
- [x] Neue Tierkarten (Hochformat, Werte oben, Name auf Farbband) und Geldscheine (Zahl in der Mitte)
- [x] Gebote: nur noch 10 / 20 / 50 / 100 – groß das Gebot, mehr bieten = mehrmals tippen; „⚠ zu viel“ über dem eigenen Geld
- [x] Kuhhandel, Gegenangebot, Warten und Ergebnis direkt auf dem Tisch statt in eigenen Fenstern
- [x] Warte-Ansicht beim Bezahlen repariert
- [x] Beträge auf Tier- und Geldkarten nur einmal, mittig
- [x] Ratten-Blockieren am Spielende auf dem Tisch
- [x] Startseite und Warteraum mit Holzrahmen im Tisch-Look

## v0.19.0 – Kräftige Tierfarben

- [x] Jede Tierart hat eine eigene, gut unterscheidbare Farbe: Pferd rot, Kuh dunkelblau, Schwein dunkelrosa, Esel orange, Katze lila, Hund hellblau, Hahn hellgrün, Gans gelb, Schaf türkis, Ziege braun, Ratte grau

## v0.20.0 – Aufdecken mit Animation

- [x] Aufgedeckte Tierkarte dreht sich erst allein groß in der Tischmitte um (1,5 s), dann rutscht sie an ihren Platz
- [x] Danach blendet ein kleiner, dezenter Infokasten ein (Wert, bei anderen, du hast, Esel-Bonus)
- [x] Countdown und Bieten starten erst nach der Animation – alle sehen die Karte zuerst
- [x] Ratte und Spezialkarte drehen sich genauso um

## v0.21.0 – Neue Tiere, Auslage, Gebote sichtbar

- [x] Alle 11 Tiere neu gezeichnet: lustige Comic-Köpfe mit je einem Gag (Kuh mit Kaugummi, Schwein mit Sonnenbrille, Ratte mit Gaunermaske …)
- [x] Eigene Karten liegen fest als Auslage über dem Geld – in jeder Phase sichtbar, pro Tierart ein Stapel (1–4 Karten sichtbar übereinander, Quartett in Gold), Spezialkarte mit Stern im Stapel
- [x] Gewonnene Karten fliegen in den eigenen Stapel, der kurz hüpft
- [x] Aufgedeckte Karten (Tier, Ratte, Spezialkarte) mittig, links kleine Info, rechts Gebot/Countdown/gelegte Karten
- [x] Gebote: groß „Nico bietet 130“ in Spielerfarbe, springt bei jedem neuen Gebot auf und blitzt beim Bieter auf
- [x] Zuschlag-Schild mit Hammer („Verkauft an Nico für 120!“)
- [x] Quartett: vier Karten in Gold für alle
- [x] Stapelrücken mit Kuh, letzte 5 Karten gelb markiert
