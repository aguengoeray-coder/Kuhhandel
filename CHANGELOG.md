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
