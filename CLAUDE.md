# Kuhhandel – Anleitung für KI-Assistenten (Codex, Claude & Co.)

Diese Datei gilt für jede KI, die an diesem Repo arbeitet. `AGENTS.md` hat denselben Inhalt (für Codex).
Besitzer: Alp. Mitentwickler: Nico. Sprache im Spiel und in Absprachen: **Deutsch**.

## Wichtigste Regeln für die Zusammenarbeit

1. **Nie direkt auf `main` hochladen.** Alles auf `main` geht über Cloudflare sofort live.
   Jede Änderung kommt auf einen eigenen Zweig (z. B. `nico/gebote-anzeige`) bzw. als Pull Request.
2. **Erst zeigen, dann live:** Vor dem Zusammenführen in `main` immer Screenshots der Änderung schicken
   und das Okay von Alp abwarten. Erst nach Freigabe mergen.
3. **Bei Fragen erst prüfen und berichten**, nicht sofort umbauen.
4. **Kleine, abgeschlossene Schritte.** Vorher absprechen, wer woran arbeitet – nicht gleichzeitig dieselbe Datei umbauen.
5. **Änderungsprotokoll pflegen:** Jede Version bekommt einen Eintrag in `CHANGELOG.md` (Checkliste, kurz und verständlich).
   Versionsnummer in `js/app.js` (`APP_VERSION`) **und** in `version.json` mit hochzählen (ein Test prüft, dass beide gleich sind;
   die App zeigt allen „Neue Version da – neu laden“, sobald `version.json` neuer ist).
6. **Tests müssen grün sein:** `npm test` vor jedem Pull Request.
7. **Datenbank-Änderungen** nicht selbst ausführen: neue SQL-Datei unter `supabase/` anlegen und Alp
   Schritt für Schritt erklären, wie er sie im Supabase-SQL-Editor ausführt.
8. Keine Geheimnisse ins Repo (der Supabase *Publishable Key* in `js/config.js` ist öffentlich und okay,
   ein *Secret/Service-Role Key* gehört niemals hierher).

## Aufbau

- **Hosting:** Cloudflare Worker `kuhhandel` (statische Dateien, `wrangler.jsonc` + `.assetsignore`).
  Live: https://kuhhandel.a-guengoeray.workers.dev – jeder Push auf `main` baut automatisch neu.
- **Datenbank/Echtzeit:** Supabase (Frankfurt). Tabellen `games`, `profiles`, `game_results` (mit `extras` für die eigene Statistik), `seat_pins`, `error_reports` (automatische Fehlerberichte), `admins` (Alp + Nico),
  `push_subscriptions` + `push_settings` (Push „Du bist dran“: Trigger `kh_push` auf `games` meldet per pg_net an den Worker `/push`).
  Admin-Bereich: Startseite → „⚙ Admin“ (nur für Admins; jede Admin-Funktion `admin_*` prüft in Supabase, ob der Aufrufer Admin ist).
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
| `js/theme.js` | Aussehen: Farben/Muster für Spielfeld, Hintergrund, Kartenrücken (CSS-Variablen, pro Gerät gespeichert) |
| `js/demo.js` | Beispiel-Spielstände für Screenshots (`?demo=turn`, `auction`, `tradesetup` …) |
| `css/style.css` | Gestaltung |
| `worker/index.js` | Cloudflare Worker: liefert die Dateien aus, weckt Supabase täglich (Zeitplan in `wrangler.jsonc`), verschickt Push (`POST /push`, Secrets `PUSH_SECRET` + `VAPID_PRIVATE_JWK` nur im Cloudflare-Dashboard) |
| `sw.js` | Service Worker: zeigt die Push-Benachrichtigung (speichert nichts zwischen) |
| `.github/workflows/` | `tests.yml` (Tests bei jedem Pull Request), `supabase-wach.yml` (zweite Absicherung gegen Pausieren) |
| `supabase/passwort-zuruecksetzen.md` | Anleitung: Passwort eines Spielers neu setzen |

## Testen

- `npm test` – Regeln.
- Lokal starten: `python3 -m http.server 8765` im Repo, dann `http://localhost:8765/?demo=turn`
  (Demo-Ansichten brauchen keine Datenbank – gut für Screenshots im Querformat 844×390).
- Debug-Modus im Browser: `?debug=1` → auf der Startseite „Testspiel“ (läuft nur auf dem Gerät, mit Test-Spielern).

## Spielregeln (Hausregeln, so umgesetzt)

- 3–4 Spieler, 54 Karten: 40 Tierkarten (10 Arten × 4), 10 Spezialkarten (eine je Tierart), 4 Ratten. Werte: Hahn 10, Gans 40, Katze 90, Hund 160, Schaf 250,
  Ziege 350, Esel 500, Schwein 650, Kuh 800, Pferd 1000.
- Startgeld: 2× 0, 3× 10, 1× 20, 1× 50 = 100 Taler. Fremdes Geld ist verdeckt (nur Kartenanzahl sichtbar).
- Esel-Bonus beim Aufdecken für alle: 50 / 100 / 200 / 500.
- Versteigerung auf Zeit: 10 s nach dem Aufdecken, nach jedem Gebot wieder 10 s. Gebotsknöpfe +10/+20/+50/+100 (mehr bieten = mehrmals tippen).
  Erst nach Ablauf entscheidet der Auktionator: Zuschlag an den Höchstbietenden oder selbst zum Höchstgebot kaufen.
- **Kein Wechselgeld.** Wer nicht zahlen kann, zeigt alle Scheine offen; Auktion startet neu, er darf höchstens altes Gebot − 10 bieten.
- Kuhhandel: verdecktes Angebot; annehmen (Geld nehmen, Tier abgeben) oder Gegenangebot.
  Gebote werden **immer getauscht**, höheres gewinnt, **Gleichstand → Herausforderer gewinnt**. Haben beide 2, geht es um 2.
- Kein Spielverlauf im Spiel (man muss sich merken, was passiert ist). Kein Zug-Überspringen.
- **Ratte:** Aufgedeckt → reihum ab links vom Aufdecker (Aufdecker macht mit, mehrere Runden): eine Geldkarte verdeckt legen
  (0er erlaubt) oder Ratte nehmen und alle gelegten Karten bekommen; ohne Karten muss man nehmen. Danach muss der Aufdecker
  nochmal aufdecken (Stapel leer → Kuhhandel). Rattenhandel nur, wenn beide Ratten haben; umgekehrt: wer mehr bietet,
  wird sie los; Gleichstand → Herausforderer; 2 gegen 2 → um beide. Spielende erst, wenn einer alle Ratten hat; er
  wählt ein eigenes Quartett, das nicht zählt (weder Wert noch Anzahl).
- **Spezialkarte** (Wert 250, nicht handelbar, kein Esel-Bonus): Erst 5 s „Zeig Batzen!“ (jeder darf drücken → alle Geldstapel mit Anzahl 3 s auf dem Tisch), dann 3 s „Achtung“ Countdown 10 → 1 (1 s pro Zahl) für alle
  außer dem Aufdecker. Wer zuerst buzzert, bietet so viele verdeckte Karten wie die Zahl. Gleiche Zahl → Schnick-Schnack-Schnuck
  (jeder wählt selbst). Aufdecker entscheidet: kaufen (er zahlt dem Buzzer die Karten) oder verkaufen (Buzzer zahlt ihm).
  Der Zahler wählt die Karten selbst. Niemand buzzert → Aufdecker bekommt sie umsonst. Buzzer kann nicht zahlen → Karten offen,
  Countdown neu, er darf erst ab seiner Kartenanzahl drücken. Aufdecker mit zu wenig Karten muss verkaufen.
- Wertung: (Summe der Quartettwerte + 250 je passender Spezialkarte) × Anzahl der Quartette, danach + 250 je Spezialkarte
  ohne zählendes Quartett.

## Design

Querformat, angelehnt an die Bedienung der Monopoly-App (eigene Gestaltung, keine fremden Grafiken/Figuren).
Breiter Tisch (Standard: Petrol auf Bordeaux, frei wählbar unter „Aussehen“), Spieler rechts mit Farbband (du ganz unten),
eigenes Geld als Fächer unten, deine Knöpfe unten links im Tisch (Daumen), Menü oben links in der Tischecke.
Farben nur über die CSS-Variablen aus `js/theme.js` (--tbl-*, --bg, --back …), nicht fest einbauen.
