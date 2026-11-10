# Kuhhandel – Anleitung für KI-Assistenten (Codex, Claude & Co.)

Diese Datei gilt für jede KI, die an diesem Repo arbeitet. `CLAUDE.md` hat denselben Inhalt (für Claude).
Besitzer: Alp. Mitentwickler: Nico. Sprache im Spiel und in Absprachen: **Deutsch**.

## Wichtigste Regeln für die Zusammenarbeit

1. **Nie direkt auf `main` hochladen.** Alles auf `main` geht über Cloudflare sofort live.
   Jede Änderung kommt auf einen eigenen Zweig (z. B. `nico/gebote-anzeige`) bzw. als Pull Request.
2. **Erst zeigen, dann live:** Vor dem Zusammenführen in `main` immer Screenshots der Änderung schicken
   und das Okay von Alp abwarten. Erst nach Freigabe mergen.
3. **Bei Fragen erst prüfen und berichten**, nicht sofort umbauen.
4. **Kleine, abgeschlossene Schritte.** Vorher absprechen, wer woran arbeitet – nicht gleichzeitig dieselbe Datei umbauen.
5. **Änderungsprotokoll pflegen:** Jede Version bekommt einen Eintrag in `CHANGELOG.md` (Checkliste, kurz und verständlich).
   Versionsnummer in `js/app.js` (`APP_VERSION`) mit hochzählen.
6. **Tests müssen grün sein:** `npm test` vor jedem Pull Request.
7. **Datenbank-Änderungen** nicht selbst ausführen: neue SQL-Datei unter `supabase/` anlegen und Alp
   Schritt für Schritt erklären, wie er sie im Supabase-SQL-Editor ausführt.
8. Keine Geheimnisse ins Repo (der Supabase *Publishable Key* in `js/config.js` ist öffentlich und okay,
   ein *Secret/Service-Role Key* gehört niemals hierher).

## Aufbau

- **Hosting:** Cloudflare Worker `kuhhandel` (statische Dateien, `wrangler.jsonc` + `.assetsignore`).
  Live: https://kuhhandel.a-guengoeray.workers.dev – jeder Push auf `main` baut automatisch neu.
- **Datenbank/Echtzeit:** Supabase (Frankfurt). Tabellen `games`, `profiles`, `game_results`, `seat_pins`.
  Konten: Name + Passwort (intern als `name@kuhhandel.app`, E-Mail-Bestätigung ist aus).
  SQL-Stand: `supabase/schema.sql` + spätere Dateien in `supabase/`.
- **Kein Build-Schritt**, reines HTML/CSS/JavaScript (ES-Module).

| Datei | Inhalt |
|---|---|
| `src/engine.js` | Komplette Spiellogik (Regeln), ohne Oberfläche – jede Aktion gibt einen neuen Spielstand zurück |
| `test/engine.test.js` | Tests aller Regeln + simulierte Komplettspiele (`npm test`) |
| `js/app.js` | Startseite, Warteraum, Verbindung zu Supabase, Debug-Modus |
| `js/game.js` | Spieltisch im Querformat (alle Phasen) |
| `js/animals.js` | Eigene Tierbilder (SVG) |
| `js/bots.js` | Test-Spieler für den Debug-Modus |
| `js/sounds.js` | Geräusche (im Browser erzeugt) |
| `js/demo.js` | Beispiel-Spielstände für Screenshots (`?demo=turn`, `auction`, `tradesetup` …) |
| `css/style.css` | Gestaltung |

## Testen

- `npm test` – Regeln.
- Lokal starten: `python3 -m http.server 8765` im Repo, dann `http://localhost:8765/?demo=turn`
  (Demo-Ansichten brauchen keine Datenbank – gut für Screenshots im Querformat 844×390).
- Debug-Modus im Browser: `?debug=1` → auf der Startseite „Testspiel“ (läuft nur auf dem Gerät, mit Test-Spielern).

## Spielregeln (Hausregeln, so umgesetzt)

- 3–4 Spieler, 40 Tierkarten (10 Arten × 4). Werte: Hahn 10, Gans 40, Katze 90, Hund 160, Schaf 250,
  Ziege 350, Esel 500, Schwein 650, Kuh 800, Pferd 1000.
- Startgeld: 2× 0, 3× 10, 1× 20, 1× 50 = 100 Taler. Fremdes Geld ist verdeckt (nur Kartenanzahl sichtbar).
- Esel-Bonus beim Aufdecken für alle: 50 / 100 / 200 / 500.
- Versteigerung auf Zeit: 20 s nach dem Aufdecken, nach jedem Gebot 15 s. Gebotsknöpfe +10/+20/+50/+100/+200/+500.
  Erst nach Ablauf entscheidet der Auktionator: Zuschlag an den Höchstbietenden oder selbst zum Höchstgebot kaufen.
- **Kein Wechselgeld.** Wer nicht zahlen kann, zeigt alle Scheine offen; Auktion startet neu, er darf höchstens altes Gebot − 10 bieten.
- Kuhhandel: verdecktes Angebot; annehmen (Geld nehmen, Tier abgeben) oder Gegenangebot.
  Gebote werden **immer getauscht**, höheres gewinnt, **Gleichstand → Herausforderer gewinnt**. Haben beide 2, geht es um 2.
- Kein Spielverlauf im Spiel (man muss sich merken, was passiert ist). Kein Zug-Überspringen.
- Wertung: Summe der Quartettwerte × Anzahl der Quartette.

## Design

Querformat, angelehnt an die Bedienung der Monopoly-App (eigene Gestaltung, keine fremden Grafiken/Figuren).
Grüner Tisch, Spieler rechts mit Farbband, eigenes Geld als Fächer unten, Aktionen links.
