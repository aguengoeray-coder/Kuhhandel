# Änderungsprotokoll

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
