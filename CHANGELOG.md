# Änderungsprotokoll

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
