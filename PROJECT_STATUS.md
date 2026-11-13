# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 13.11.2026, 09:30 Uhr · Repository `aguengoeray-coder/Kuhhandel` · Live: https://kuhhandel.a-guengoeray.workers.dev

> Maßgeblich sind GitHub (`main`, PRs, Workflow-Ergebnisse). Diese Datei wird nach jeder Arbeitseinheit aktualisiert.
> Freigaben laufen nach der **Ampel** in `AGENTS.md` (🟢 KI mergt bei grünen Tests · 🟡 Alps Go · 🔴 nur Alp).

## 1. Was ist live?

| | |
|---|---|
| Live-Version (`main`) | **v0.54.0** – Merge-Commit `7941850` (Cloudflare baut bei jedem Push auf `main` neu) |
| Fertig, wartet auf Go | **v0.54.1** ruhiges Bezahlen + Quittung – PR #18, 🟡 |
| In Arbeit | **v0.55** Dublonen für alle – Branch `claude/v055-sicherheit` (Sicherheitsanalyse + SQL-Entwurf, nicht ausgeführt) |
| Nächste Versionen | v0.55 Dublonen (SQL, 🔴) · v0.56 Börsen-Chaos (Regelvorschlag zuerst) · v0.57 2 Spieler (Regelprüfung zuerst) |
| Datenbank | Supabase; ausgeführt bis einschließlich `supabase/v0.49-kult-avatare.sql` (von Alp bestätigt) |

### Zuletzt live gegangen
| Version | Inhalt | PR |
|---|---|---|
| v0.54.0 | Avatare jubeln beim Gewinnen, Podest mit Ganzkörper-Avataren, „+10 Dublonen“ | #17 |
| v0.53.0 | Größere Karten (×1,4): Tierreihe neben dem Geldfächer; Fächer staucht sich, max. 2 Tierreihen | #16 |
| — | Prozess: Ampel, Projektstand, Handoff, Checks | #15 |
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
| #18 `claude/v0541-bezahlen-quittung` | Claude | 🟡 | Bezahlen ohne Springen (Karte bleibt, Kasse rechts) + Ergebnis als Quittung. Wartet auf „Merge-Go #18“. |
| `claude/v055-sicherheit` | Claude | 🔴 | `supabase/v0.55-dublonen-sicherheit.sql` + `v0.55-sicherheit-vorschlag.md` (lokal gegen Postgres 16 getestet), Revanche per RPC mit Rückfall. Kein PR bis Alp entschieden hat. |
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

Zusätzlich: e2e prüft Startseite mit Avatar, Shop, Podest mit Avataren (3/4 Spieler) und 3-Spieler-Ansichten.
Bekannte Einschränkung: Einige Demos (`auction`, `cantpay`, `rat`, `rps` …) sind nur für 4 Spieler gebaut und laufen mit `?p=3` nicht – reine Demo-Grenze, kein Spielfehler.

## 4. Offene Fehler / Risiken

- **Dublonen (wichtig vor v0.55):** `games` ist von jedem Mitspieler frei beschreibbar; man kann heute ein sofort beendetes Spiel mit sich als Sieger anlegen und +10 kassieren. Lösung vorbereitet: `supabase/v0.55-sicherheit-vorschlag.md` (Wächter-Trigger, Revanche per RPC, ≥3 echte Konten/≥6 min/≥25 Züge, Tagesgrenze 60). Restrisiko danach: Schummeln innerhalb einer echten Partie (Tagesgrenze begrenzt).
- Branch-Schutz für `main` ist noch nicht eingerichtet (🔴, Alp; Anleitung in `AI_HANDOFF.md`).
- 8 Demos laufen nicht mit `?p=3` (nur Demo-Grenze).

## 5. Roadmap (von Alp am 13.11. freigegeben, Reihenfolge optimiert)

| Version | Inhalt | Stufe |
|---|---|---|
| v0.52.2 | 3-Spieler-Überdeckungen, ruhigerer Tisch | ✅ live |
| v0.53 | Größere Karten | ✅ live |
| v0.54 | Avatare leben + Siegerehrung | ✅ live |
| v0.54.1 | Ruhiges Bezahlen + Quittung (Alps Wahl A+C) | 🟡 PR #18 |
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

- „Merge-Go #18“ (Bezahlen + Quittung).
- v0.55: Sicherheitsvorschlag lesen und entscheiden; danach SQL selbst ausführen.
- Börsen-Chaos-Regeln und 2-Spieler-Regeln absegnen (Vorschläge folgen).
- Branch-Schutz für `main` selbst einrichten (Anleitung in `AI_HANDOFF.md`).
- Alte, gemergte Branches löschen lassen? (Liste auf Wunsch.)
