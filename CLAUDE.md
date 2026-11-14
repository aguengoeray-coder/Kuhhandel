# Kuhhandel – Anleitung für KI-Assistenten (Codex, Claude & Co.)

Diese Datei gilt für jede KI, die an diesem Repo arbeitet. `AGENTS.md` hat denselben Inhalt (für Codex).
Besitzer: Alp. Mitentwickler: Nico. Sprache im Spiel und in Absprachen: **Deutsch**.

## Wichtigste Regeln für die Zusammenarbeit

1. **Nie direkt auf `main` hochladen.** Alles auf `main` geht über Cloudflare sofort live.
   Jede Änderung kommt auf einen eigenen Zweig (z. B. `nico/gebote-anzeige`) bzw. als Pull Request.
2. **Erst zeigen, dann live:** Screenshots der Änderung schicken. Ob vor oder nach dem Merge, regelt die **Ampel**
   (siehe unten): 🟢 Feinschliff/Bugfix → KI mergt bei grünen Tests und zeigt danach; 🟡 Neues → erst Alps Go; SQL führt Claude über den Supabase-Connector aus (Regel 7); 🔴 Löschen/Secrets → nur Alp.
3. **Bei Fragen erst prüfen und berichten**, nicht sofort umbauen.
4. **Kleine, abgeschlossene Schritte.** Vorher absprechen, wer woran arbeitet – nicht gleichzeitig dieselbe Datei umbauen.
5. **Änderungsprotokoll pflegen:** Jede Version bekommt einen Eintrag in `CHANGELOG.md` (Checkliste, kurz und verständlich).
   Versionsnummer in `js/app.js` (`APP_VERSION`) **und** in `version.json` mit hochzählen (ein Test prüft, dass beide gleich sind;
   die App zeigt allen „Neue Version da – neu laden“, sobald `version.json` neuer ist).
6. **Tests müssen grün sein:** `npm test` vor jedem Pull Request.
7. **Datenbank-Änderungen** (seit 13.11.2026, von Alp freigegeben): Claude führt SQL selbst über den **Supabase-Connector** aus –
   immer als SQL-Datei unter `supabase/` im Repo, vorher lokal getestet, nach dem Merge der passenden App-Version, danach Prüfabfrage
   + Supabase-Advisors und Bericht an Alp. KIs ohne Connector (z. B. Codex) bereiten SQL nur vor. Daten oder Konten löschen bleibt bei Alp.
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
| `js/shop.js`, `css/shop.css` | Shop (Reiter Avatare/Sprüche, Kaufen/Auswählen) |
| `js/shopavatars.js` | 14 Shop-Avatare als SVG: runder Kopf (Tisch) + Ganzkörper `shopAvatarFull` (Shop, Startseite) |
| `js/whatsnew.js` | „Was ist neu?“ für Spieler – oberster Eintrag = `APP_VERSION` (Check prüft das) |
| `e2e/` | Browser-Tests (Playwright): alle Ansichten × 4 Handygrößen, einheitliche Größen, komplette Partien |
| `scripts/check.mjs` | Syntax, Versionen, „Was ist neu“, AGENTS = CLAUDE |
| `worker/index.js` | Cloudflare Worker: liefert die Dateien aus, weckt Supabase täglich (Zeitplan in `wrangler.jsonc`), verschickt Push (`POST /push`, Secrets `PUSH_SECRET` + `VAPID_PRIVATE_JWK` nur im Cloudflare-Dashboard) |
| `sw.js` | Service Worker: zeigt die Push-Benachrichtigung (speichert nichts zwischen) |
| `.github/workflows/` | `tests.yml` (Tests bei jedem Pull Request), `supabase-wach.yml` (zweite Absicherung gegen Pausieren) |
| `supabase/passwort-zuruecksetzen.md` | Anleitung: Passwort eines Spielers neu setzen |

## Testen

- `npm test` – Regeln, Shop, Automatisierung.
- `node scripts/check.mjs` – Syntax, Versionen, Doku-Gleichheit.
- Browser-Tests: `NODE_PATH=$(npm root -g) node --test e2e/views.spec.mjs e2e/sizes.spec.mjs e2e/fullgame.spec.mjs` (der Test startet seinen eigenen kleinen Server).
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
- **Spezialkarte** (Wert 250, nicht handelbar, kein Esel-Bonus): Erst 3 s „Zeig Batzen!“ (jeder darf drücken → alle Geldstapel mit Anzahl 3 s auf dem Tisch), dann 2 s „Achtung“ Countdown 10 → 1 (1 s pro Zahl) für alle
  außer dem Aufdecker. Wer zuerst buzzert, bietet so viele verdeckte Karten wie die Zahl. Gleiche Zahl → Schnick-Schnack-Schnuck
  (jeder wählt selbst). Aufdecker entscheidet: kaufen (er zahlt dem Buzzer die Karten) oder verkaufen (Buzzer zahlt ihm).
  Der Zahler wählt die Karten selbst. Niemand buzzert → Aufdecker bekommt sie umsonst. Buzzer kann nicht zahlen → Karten offen,
  Countdown neu, er darf erst ab seiner Kartenanzahl drücken. Aufdecker mit zu wenig Karten muss verkaufen.
- **Börsen-Chaos** (Spielart, nie mit Turbo): + 8 Börsen-News im Stapel; aufgedeckt → Wirkung sofort, Aufdecker deckt nochmal auf.
  Kursrallye 2× (zufällig +30 … +100 %), Kurssturz 2× (−50 %; Kurse stapeln sich, nie unter 0; Tier beim Mischen ausgelost), Dividende (alle +50),
  Steuerprüfung (jeder gibt seinen höchsten Schein ab, nur eigener sichtbar), Marktpanik (jeder schiebt einen zufälligen Schein verdeckt nach links),
  Hektik (nächste 3 Versteigerungen 5 s). Wertung mit aktuellen Kursen; Spezialkarte (250) und Esel-Bonus unverändert.
- Wertung: (Summe der Quartettwerte + 250 je passender Spezialkarte) × Anzahl der Quartette, danach + 250 je Spezialkarte
  ohne zählendes Quartett.

## Design

Querformat, angelehnt an die Bedienung der Monopoly-App (eigene Gestaltung, keine fremden Grafiken/Figuren).
Ein durchgehendes Spielfeld (Standard: Nachtblau mit Filz, frei wählbar unter „Aussehen“). Sitzordnung wie am echten Tisch:
Mitspieler links, oben, rechts (3 Spieler: oben links/oben rechts), du unten in der Mitte (deine Figur, gegenüber dem Platz oben; Antippen öffnet 💬), Geld links davon, Tiere rechts davon; Reihenfolge im Uhrzeigersinn.
Eigenes Geld als Fächer unten, deine Knöpfe unten links (Daumen), Menü oben links, 💬 durch Antippen deiner Figur. Ergebnisse (Versteigerung, Spezialkarte, Kuhhandel, Kann nicht zahlen) immer im selben Ergebnis-Fenster (`.evcard`); Bezahlen/Angebote direkt im Geld-Fächer. Flugziele (Karten, Geld) werden nach
dem Zeichnen gemessen (`data-aim-to` / `data-aim-from`, `aimFx` in `js/game.js`), nicht fest eingebaut.
Farben nur über die CSS-Variablen aus `js/theme.js` (--tbl-*, --bg, --back …), nicht fest einbauen.

## Verbindlicher KI-Arbeitsablauf

1. Vor jeder Arbeit: diese Datei, `PROJECT_STATUS.md` und offene Einträge in `AI_HANDOFF.md` lesen; danach `main`, eigenen Branch, relevante Fremdbranches und Datei-Owner auf GitHub prüfen.
2. Bei widersprüchlicher Dokumentation anhalten und den tatsächlichen Code-/Git-Stand klären.
3. Pro Aufgabe genau ein schreibender Owner; Reviewer bleiben read-only. Die im neuesten Handoff genannten Dateigrenzen sind verbindlich.
4. Nach jeder Arbeitseinheit passende Tests ausführen, `PROJECT_STATUS.md` aktualisieren und einen datierten Handoff-Eintrag mit Branch, Commit, Dateien, Tests und offenen Punkten ergänzen.
5. Nur auf dem eigenen Branch committen. Merge nach der **Ampel** unten.

## Ampel: wer darf mergen? (von Alp am 13.11.2026 freigegeben)

| Stufe | Was | Ablauf |
|---|---|---|
| 🟢 Grün | Bugfixes, Layout-/Design-Feinschliff, Tests, Doku, kleine Effekte – **und alles, wofür Alp ausdrücklich „ja“/„Go“ gesagt hat** | KI mergt selbst, sobald `npm test`, `node scripts/check.mjs` und die GitHub-Prüfungen (test, e2e, Workers Build) auf dem PR-Kopf grün sind. Danach Bericht mit Screenshots an Alp. |
| 🟡 Gelb | Neue Features, Regeländerungen, neue Spielarten, alles rund um Shop/Dublonen | Erst Screenshots + Testergebnisse, dann auf Alps „Merge-Go #PR“ warten. |
| 🟡 SQL | Schema-/Funktions-Änderungen per SQL-Datei | Claude führt sie über den Supabase-Connector aus (Datei im Repo, lokal getestet, Rückweg-Befehl notiert), nachdem die App-Version gemergt ist; danach Prüfabfrage + Advisors + Bericht. |
| 🔴 Rot | Daten oder Konten löschen, Secrets, Branch-Schutz-Einstellungen | Immer mit Alp. |

- Merge immer über den PR (GitHub-API: `gh api -X PUT repos/aguengoeray-coder/Kuhhandel/pulls/<n>/merge -f merge_method=merge`), nie direkt auf `main` committen oder pushen – so funktioniert es auch mit Branch-Schutz.
- Nur live gehen, wenn gerade niemand spielt. Sagt Alp „zurück“: sofort den letzten Merge rückgängig machen (`git revert -m 1 <merge>`), Tests, Push.
- Vor jedem Merge vollständigen Diff gegen aktuellen `main` prüfen.

## Verbindliche Freigabe- und Sicherheitsregeln

- **Kein direkter Commit auf `main`.** Merges nur nach der Ampel oben; ein „Go“ gilt nur für den konkret benannten Schritt.
- Alp ist alleiniger Product Owner und entscheidet über Umfang, Prioritäten und Abnahme. Workflows (GitHub Actions) mergen nie selbst.
- SQL nur über den Supabase-Connector (Claude) und nur aus einer SQL-Datei im Repo; keine spontanen Änderungen direkt in der Datenbank. Lesende Abfragen zur Prüfung sind jederzeit erlaubt.
- Keine Secrets ins Repository. Supabase Secret-/Service-Role-Keys gehören ausschließlich in sichere Umgebungsvariablen/Secret Stores.
- Automatisierte Workflows dürfen prüfen und berichten, aber keine Codeänderungen, Merges oder Pushes ausführen.
- PR-Berichte erhalten nur minimale Berechtigungen: `contents: read` und `pull-requests: write`.
- Branch-Schutz für `main` soll Pull Requests und grüne Pflichtprüfungen verlangen. Einrichtung nur durch Alp; KIs liefern eine Anleitung.
- „Live“ nur behaupten, wenn Merge in `main` und Deployment tatsächlich nachgewiesen sind.

## Dokumentation und Versionsregeln

- `AGENTS.md` und `CLAUDE.md` müssen identisch sein.
- `PROJECT_STATUS.md` ist die kompakte Quelle für aktuellen Projektstand und Roadmap; keine parallelen, redundanten Roadmap-/Teamdateien pflegen.
- `AI_HANDOFF.md` enthält offene Übergaben (mit Vorlage); abgeschlossene Einträge stehen in `AI_HANDOFF_ARCHIV.md`.
- App-Version: `APP_VERSION` in `js/app.js` = `version.json` = oberster Versionskopf in `CHANGELOG.md`.
- `package.json`-Version ist npm-Paketmetadatum und derzeit bewusst `0.1.0`; nicht mit der App-Version verwechseln.
- `npm test` und `node scripts/check.mjs` müssen vor einem PR grün sein.
