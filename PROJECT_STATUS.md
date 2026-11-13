# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 13.11.2026, 06:30 Uhr · Repository `aguengoeray-coder/Kuhhandel` · Live: https://kuhhandel.a-guengoeray.workers.dev

> Maßgeblich sind GitHub (`main`, PRs, Workflow-Ergebnisse). Diese Datei wird nach jeder Arbeitseinheit aktualisiert.
> Freigaben laufen nach der **Ampel** in `AGENTS.md` (🟢 KI mergt bei grünen Tests · 🟡 Alps Go · 🔴 nur Alp).

## 1. Was ist live?

| | |
|---|---|
| Live-Version (`main`) | **v0.52.2** – Merge-Commit `79f896d` (Cloudflare baut bei jedem Push auf `main` neu) |
| In Arbeit | **v0.53** größere Karten – Branch `claude/v053-grosse-karten`, 🟡 (Entwurf) |
| Nächste Versionen | v0.53 größere Karten · v0.54 Avatare leben + Siegerehrung · v0.55 Dublonen für alle (SQL) · v0.56 Börsen-Chaos · v0.57 2 Spieler |
| Datenbank | Supabase; ausgeführt bis einschließlich `supabase/v0.49-kult-avatare.sql` (von Alp bestätigt) |

### Zuletzt live gegangen
| Version | Inhalt | PR |
|---|---|---|
| v0.52.2 | 3-Spieler-Kuhhandel/Stapel ohne Überdeckung, ruhigerer Tisch, 3-Spieler-Regressionstests | #14 |
| v0.52.1 | Rattengeld fliegt über den Topf in der Mitte; Kuhhandel-Angebot fliegt in die Mitte | #13 |
| v0.52.0 | Avatare mit ganzem Körper (Shop) + groß neben dem Tisch auf der Startseite | #12 |
| v0.51.0 | Turbo-Spielart, „Was ist neu?“, Esel-Geldregen, Ratten-Rudel | #11 |
| v0.50.0 | „Wer ist dran“ als Leuchtrahmen + Banner-Flip | #10 |
| v0.49.0 | Kult-Avatare, Dublonen-Münze, einheitliche Größen | #9 |
| v0.48.x | Shop (Dublonen, 11 Avatare, 8 Sprüche), Chat-Menü mit Emojis | #6–#8 |

## 2. Offene PRs und Branches

| PR / Branch | Owner | Stufe | Status |
|---|---|---|---|
| `claude/v053-grosse-karten` | Claude | 🟡 | Entwurf: Tierreihe neben dem Geldfächer, Mitte ×1,3. Screenshots an Alp vor Merge. |
| #15 `claude/v0512-prozess` | Claude | 🟢 | Doku (dieses Dokument, Handoff, Ampel), `scripts/check.mjs` (+ „Was ist neu“- und AGENTS=CLAUDE-Prüfung), `tests.yml` ohne Doppelläufe. |
| `ai/auftraege` | Codex/Claude | – | `AUFTRAEGE.md` (Auftragsliste A-001 …). Inhalt wird in Abschnitt 5 hier übernommen; Branch kann danach gelöscht werden. |
| PR #5 `codex/v048-shop` | Codex | – | Geschlossen/überholt (Shop ist über #6–#8 live). |
| alte Feature-Branches (`v0.2x-…`, `kartenflug` …) | – | – | Alle längst in `main`. Aufräumen nur mit Alps Okay (🔴 löschen). |

## 3. Qualitätsprüfungen (alle müssen vor einem Merge grün sein)

| Prüfung | Wo | Was sie findet |
|---|---|---|
| `npm test` (52 Tests) | lokal + Workflow `tests.yml` | Spielregeln (inkl. 100 simulierte Turbo- und klassische Komplettspiele), Shop-Katalog/Preise = SQL-Preise, Ganzkörper-Avatare, Automatisierung |
| `node scripts/check.mjs` | lokal + `tests.yml` | JS-Syntax aller Dateien, `APP_VERSION` = `version.json` = CHANGELOG, „Was ist neu“ kennt die Version, `AGENTS.md` = `CLAUDE.md` |
| e2e Ansichten | `e2e.yml` → `e2e/views.spec.mjs` | alle Demo-Ansichten × 4 Handygrößen + 3-Spieler-Ansichten + Startseite/Shop: JS-Fehler, Überlappungen, abgeschnittener Text, zu kleine Schrift |
| e2e Größen | `e2e/sizes.spec.mjs` | große Karte + Überschrift in allen Phasen gleich groß |
| e2e Partien | `e2e/fullgame.spec.mjs` | 4 komplette Partien mit Test-Spielern im Browser (3 und 4 Spieler) ohne JS-Fehler |
| PR-Bericht | `pr-report.yml` | ein Kommentar pro PR: geänderte Dateien, Risiken, Testergebnisse |
| Workers Build | Cloudflare | Vorschau-Build je Branch |

Bekannte Einschränkung: Einige Demos (`auction`, `cantpay`, `rat`, `rps` …) sind nur für 4 Spieler gebaut und laufen mit `?p=3` nicht – reine Demo-Grenze, kein Spielfehler.

## 4. Offene Fehler / Risiken

- Dublonen-Siegprämie: `games.state` ist clientseitig beschreibbar → ein manipulierter Endstand ist nicht völlig ausgeschlossen. Mit v0.55 Tagesgrenze einbauen.
- Höhe der Tischmitte (~160 px zwischen Plätzen und eigener Reihe) begrenzt größere Karten → v0.53.
- Branch-Schutz für `main` ist noch nicht eingerichtet (🔴, Alp; Anleitung im Handoff).

## 5. Roadmap (von Alp am 13.11. freigegeben, Reihenfolge optimiert)

| Version | Inhalt | Stufe |
|---|---|---|
| v0.52.2 | 3-Spieler-Überdeckungen, ruhigerer Tisch | ✅ live |
| v0.53 | Größere Karten: eigene Tierreihe neben den Geldfächer, Mitte ~25 % höher | 🟡 |
| v0.54 | Avatare leben (Jubel-Moment bei Sieg/Versteigerung/Kuhhandel/Quartett) + Siegerehrung (Podest mit Ganzkörper-Avataren, Konfetti, Dublonen-Aufstellung) | 🟡 |
| v0.55 | Dublonen für alle: +2 je Partie, +5 je Quartett, +10 Sieg, Tagesgrenze | 🔴 SQL |
| v0.56 | Börsen-Chaos: dritte Spielart mit Ereigniskarten (Regelvorschlag vorher an Alp) + Bildkarten in der Spielarten-Auswahl | 🟡 |
| v0.57 | 2-Spieler-Modus (Originalregeln prüfen, Vorschlag an Alp) | 🟡 |
| später | Erfolge + Saison-Rangliste (SQL), Zuschauen, Zug-Zeitlimit mit Bot-Vertretung, Shop: Tischdesigns/Kartenrücken | – |

## 6. Datei-Owner (pro Aufgabe genau ein schreibender Owner)

| Bereich | Dateien | Owner heute |
|---|---|---|
| Spiel-UI | `js/game.js`, `css/style.css` | Claude |
| Startseite, Shop-Anbindung | `js/app.js`, `js/shop.js`, `js/shopavatars.js`, `css/shop.css` | Claude |
| Regeln | `src/engine.js`, `test/engine.test.js` | Claude (bei Regeländerung 🟡) |
| Browser-Tests | `e2e/**`, `.github/workflows/e2e.yml` | Claude |
| Doku/Prozess | `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`/`CLAUDE.md`, `scripts/check.mjs`, `tests.yml`, `pr-report.yml` | Claude (Codex übernimmt nach Absprache, siehe Handoff) |
| SQL | `supabase/*.sql` | KI bereitet vor, **Alp führt aus** |

## 7. Freigaben, die noch von Alp gebraucht werden

- v0.53 Größere Karten: Merge-Go nach Vorher/Nachher-Screenshots.
- v0.54 Siegerehrung/Avatare: Merge-Go nach Screenshots.
- v0.55 SQL ausführen.
- Börsen-Chaos-Regeln und 2-Spieler-Regeln absegnen.
- Branch-Schutz für `main` selbst einrichten (Anleitung im Handoff).
