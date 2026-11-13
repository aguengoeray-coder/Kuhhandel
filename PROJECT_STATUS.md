# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 13.11.2026, 19:40 Uhr · Repository `aguengoeray-coder/Kuhhandel` · Live: https://kuhhandel.a-guengoeray.workers.dev

> Maßgeblich sind GitHub (`main`, PRs, Workflow-Ergebnisse). Diese Datei wird nach jeder Arbeitseinheit aktualisiert.
> Freigaben laufen nach der **Ampel** in `AGENTS.md` (🟢 KI mergt bei grünen Tests · 🟡 Alps Go · 🔴 nur Alp).

## 1. Was ist live?

| | |
|---|---|
| Live-Version (`main`) | **v0.59.0** – Merge-Commit `7f7ea7a` (#26); Cloudflare-Build erfolgreich (der Build von #25/v0.58.1 war fehlgeschlagen, ist in v0.59 enthalten) |
| In Arbeit | – |
| Nächste Versionen | Börsen-Chaos (Regelvorschlag zuerst) · 2-Spieler-Modus (Regelprüfung zuerst) |
| Datenbank | Supabase; ausgeführt bis einschließlich `supabase/v0.58-neue-charaktere.sql` (Alp im SQL-Editor, Prüfabfrage 13.11. 15:58 ✓) |

### Zuletzt live gegangen
| Version | Inhalt | PR |
|---|---|---|
| v0.59.0 | Dein Platz: Tier-Regal über dem Geld, Hand mit festen Fächern + Summe, Figur rechts groß mit Leuchten, Sprechblasen aus dem Mund | #26 |
| v0.58.1 | Figur kleiner, Doku | #25 |
| v0.58.0 | 9 neue Charaktere, 7 Sprüche, 2 Gratis-Sprüche (SQL `shop_claim_free`), 💬 nur Sprüche, symmetrischer Rahmen unten, „Überboten!“ über dem Gebot, Bezahl-Box einreihig | #24 |
| v0.57.1 | Preis in der Ergebnis-Überschrift, Taler-Schein-Zeichen | #23 (in #24) |
| v0.57.0 | Wie am echten Tisch (Figur unten Mitte, Geld links, Tiere rechts) + Debug-Abkürzungen | #22 |
| v0.56.x | Eigene Figur am Tisch, Testspiel mit deinem Avatar | #20, #21 |
| v0.55.0 | Dublonen für alle + Schutz der Spielstände (SQL von Alp ausgeführt) | #19 |
| v0.54.x | Avatare jubeln, Podest; aufgeräumter Tisch, ruhiges Bezahlen | #17, #18 |
| v0.53.0 | Größere Karten | #16 |
| v0.52.x | Ganzkörper-Avatare, Geld über die Mitte, 3-Spieler-Feinschliff | #12–#14 |

## 2. Offene PRs und Branches

| PR / Branch | Owner | Stufe | Status |
|---|---|---|---|
| `claude/doku-v059` | Claude | 🟢 | Diese Doku-Aktualisierung. |
| `ai/auftraege` | Codex/Claude | – | Ersetzt durch Abschnitt 5; löschen nur mit Alps Okay. |
| alte Feature-Branches | – | 🔴 | Alle in `main`. Aufräumen nur mit Alps Okay. |

## 3. Qualitätsprüfungen (alle müssen vor einem Merge grün sein)

| Prüfung | Wo | Was sie findet |
|---|---|---|
| `npm test` (55 Tests) | lokal + Workflow `tests.yml` | Spielregeln (inkl. 100 simulierte Turbo- und klassische Komplettspiele), Shop-Katalog/Preise = SQL-Preise, Ganzkörper-Avatare, Automatisierung |
| `node scripts/check.mjs` | lokal + `tests.yml` | JS-Syntax aller Dateien, `APP_VERSION` = `version.json` = CHANGELOG, „Was ist neu“ kennt die Version, `AGENTS.md` = `CLAUDE.md` |
| e2e Ansichten | `e2e.yml` → `e2e/views.spec.mjs` | alle Demo-Ansichten × 4 Handygrößen + 3-Spieler-Ansichten + Startseite/Shop: JS-Fehler, Überlappungen, abgeschnittener Text, zu kleine Schrift |
| e2e Größen | `e2e/sizes.spec.mjs` | große Karte + Überschrift in allen Phasen gleich groß |
| e2e Partien | `e2e/fullgame.spec.mjs` | 4 komplette Partien mit Test-Spielern im Browser (3 und 4 Spieler) ohne JS-Fehler; „hängt“ = 40 s ohne Änderung an Banner, Stapel, Höchstgebot oder Geld |
| PR-Bericht | `pr-report.yml` | ein Kommentar pro PR: geänderte Dateien, Risiken, Testergebnisse |
| Workers Build | Cloudflare | Vorschau-Build je Branch |

Zusätzlich: e2e prüft Startseite mit Avatar, Shop, Podest mit Avataren (3/4 Spieler) und 3-Spieler-Ansichten.
Bekannte Einschränkung: Einige Demos (`auction`, `cantpay`, `rat`, `rps` …) sind nur für 4 Spieler gebaut und laufen mit `?p=3` nicht – reine Demo-Grenze, kein Spielfehler.

## 4. Offene Fehler / Risiken

- Restrisiko Dublonen: Schummeln innerhalb einer echten Partie (Tagesgrenze 60 begrenzt den Schaden); Stufe 2 = Züge über den Worker (siehe `supabase/v0.55-sicherheit-vorschlag.md`).
- Supabase-Advisors (angeboten, wartet auf Alps „ja“): `anon`-Ausführrecht der `admin_*`-Funktionen entziehen, Schutz vor geleakten Passwörtern einschalten.
- Supabase-Connector war am 13.11. nachmittags getrennt → SQL v0.58 hat Alp selbst ausgeführt.
- Branch-Schutz für `main` noch nicht eingerichtet (🔴, Alp; Anleitung in `AI_HANDOFF_ARCHIV.md`).
- 8 Demos laufen nicht mit `?p=3` (nur Demo-Grenze).

## 5. Roadmap

| Version | Inhalt | Stufe |
|---|---|---|
| v0.52–v0.59 | Avatare, größere Karten, Siegerehrung, Dublonen für alle, Platz am Tisch, neue Charaktere | ✅ live |
| nächste | Börsen-Chaos: dritte Spielart mit Ereigniskarten (Regelvorschlag vorher an Alp) | 🟡 |
| danach | 2-Spieler-Modus (Originalregeln prüfen, Vorschlag an Alp) | 🟡 |
| später | Erfolge + Saison-Rangliste (SQL), Zuschauen, Zug-Zeitlimit mit Bot-Vertretung, Shop: Tischdesigns/Kartenrücken | – |

## 6. Datei-Owner (pro Aufgabe genau ein schreibender Owner)

| Bereich | Dateien | Owner heute |
|---|---|---|
| Spiel-UI | `js/game.js`, `css/style.css` | Claude |
| Startseite, Shop-Anbindung | `js/app.js`, `js/shop.js`, `js/shopavatars.js`, `css/shop.css` | Claude |
| Regeln | `src/engine.js`, `test/engine.test.js` | Claude (bei Regeländerung 🟡) |
| Browser-Tests | `e2e/**`, `.github/workflows/e2e.yml` | Claude |
| Doku/Prozess | `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`/`CLAUDE.md`, `scripts/check.mjs`, `tests.yml`, `pr-report.yml` | Claude (Codex übernimmt nach Absprache, siehe Handoff) |
| SQL | `supabase/*.sql` | Claude führt über den Supabase-Connector aus (Regel 7); ohne Connector führt Alp aus |

## 7. Freigaben, die noch von Alp gebraucht werden

- Supabase-Advisors: `anon` von `admin_*` entziehen + Passwort-Leak-Schutz – „ja“?
- Börsen-Chaos-Regeln und 2-Spieler-Regeln absegnen (Vorschläge folgen).
- Branch-Schutz für `main` selbst einrichten.
- Alte, gemergte Branches löschen lassen? (Liste auf Wunsch.)
