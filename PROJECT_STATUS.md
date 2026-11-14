# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 14.11.2026 · Arbeitsstand ChatGPT · Repository `aguengoeray-coder/Kuhhandel` · Live: https://kuhhandel.a-guengoeray.workers.dev

> Maßgeblich sind GitHub (`main`, PRs, Workflow-Ergebnisse). Diese Datei wird nach jeder Arbeitseinheit aktualisiert.
> Freigaben laufen nach der **Ampel** in `AGENTS.md` (🟢 KI mergt bei grünen Tests · 🟡 Alps Go · 🔴 nur Alp).

## 1. Was ist live?

| | |
|---|---|
| Live-Version (`main`) | **v0.63.1** – Merge-Commit `a9c2247` (#37); CI-Merge laut GitHub-Commit erfolgt |
| In Arbeit | **v0.64.0 Figuren-Theater** – Branch `chatgpt/v064-figuren-theater`; Browser-Tests nach erster Runde mit 32 Befunden; Testlogik und kleine Dock-Überlappung korrigiert, erneuter CI-Lauf ausstehend |
| Nächste Versionen | 2-Spieler-Modus (Regelprüfung zuerst) · Börsen-Chaos nach ersten echten Partien nachjustieren |
| Datenbank | Supabase; ausgeführt bis einschließlich `supabase/v0.63-eigener-spruch.sql` (Claude über Connector 14.11., Prüfabfrage + Advisors ✓); davor `v0.60-admin-nur-angemeldet.sql`, `v0.61-emote-pruegel.sql` (Claude) |

### Zuletzt live gegangen
| Version | Inhalt | PR |
|---|---|---|
| v0.63.1 | Längere Duell-Intros, konkrete Kuhhandel-Texte, Esel startet erst nach Aufdecken, Bonusbetrag + Aua-Reaktion, geräteabhängige Laufwege | #37 |
| v0.63.0 | Duell-Intros (Kuhhandel/Rattenhandel/SSS/Spielstart), Spitzenreiter-Krone, „Letzte Karte!“, Finale (Ende nicht überspringbar), Shop „Eigener Spruch“, Kursrallye/-sturz zufällig 30–100 % (Sturz meist stärker) | #34 |
| v0.62.0 | Figuren springen aus dem Profilbild (Jubel, Pleite, Prügeln), Ratte, Quartett-Polonaise, Kuhhandel-Koffer | #34 |
| v0.61.x | Emote „Verprügeln“ (Shop, Admin immer, 5 s Pause), Muskel-Esel klettert aus der Karte | #33, #34 |
| v0.60.1 | Esel zerknüllt die Bonus-Scheine und wirft sie jedem zu | #32 |
| v0.60.0 | Börsen-Chaos: neue Spielart mit 8 Börsen-News (Kursrallye/-sturz, Dividende, Steuerprüfung, Marktpanik, Hektik), Kurszettel | #29 |
| v0.59.1 | Mitte −22 %, Tiere im Regal bis 118 % | #28 |
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
| `chatgpt/v064-figuren-theater` (#38) | ChatGPT | 🟡 | v0.64.0: Figuren-Theater; Browser-Tests nach Korrekturen erneut in Prüfung |
| `claude/doku-v063` | Claude | 🟢 | Diese Doku-Aktualisierung. |
| `ai/auftraege` | Codex/Claude | – | Ersetzt durch Abschnitt 5; löschen nur mit Alps Okay. |
| alte Feature-Branches | – | 🔴 | Alle in `main`. Aufräumen nur mit Alps Okay. |

## 3. Qualitätsprüfungen (alle müssen vor einem Merge grün sein)

| Prüfung | Wo | Was sie findet |
|---|---|---|
| `npm test` (61 Tests) | lokal + Workflow `tests.yml` | Spielregeln (inkl. 100 simulierte Turbo- und klassische Komplettspiele), Shop-Katalog/Preise = SQL-Preise, Ganzkörper-Avatare, Automatisierung |
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
- Supabase-Advisors: `admin_*` für anon gesperrt (v0.60-SQL ✓). Noch 9 anon-ausführbare Funktionen (join_game, my_pin, save_push … – teils gewollt, Prüfung angeboten). Schutz vor geleakten Passwörtern = Dashboard-Schalter (Alp).
- Branch-Schutz für `main` noch nicht eingerichtet (🔴, Alp; Anleitung in `AI_HANDOFF_ARCHIV.md`).
- 8 Demos laufen nicht mit `?p=3` (nur Demo-Grenze).

## 5. Roadmap

| Version | Inhalt | Stufe |
|---|---|---|
| v0.52–v0.59 | Avatare, größere Karten, Siegerehrung, Dublonen für alle, Platz am Tisch, neue Charaktere | ✅ live |
| v0.60 | Börsen-Chaos | ✅ live |
| v0.61–v0.63.1 | Emote Verprügeln, lebendige Figuren + Gags, Duell-Intros, Finale, eigener Spruch, Esel-Feinschliff | ✅ live |
| v0.64.0 | Ganzkörper-Figuren an den Plätzen + kostenloses Figuren-Theater (5 Szenen) | 🟡 in Arbeit; PR/CI/Screenshots ausstehend |
| nächste | 2-Spieler-Modus (Originalregeln prüfen, Vorschlag an Alp) | 🟡 |
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

- Restliche 9 anon-Funktionen prüfen lassen? Passwort-Leak-Schutz im Dashboard einschalten.
- 2-Spieler-Regeln absegnen (Vorschlag folgt).
- Branch-Schutz für `main` selbst einrichten.
- Alte, gemergte Branches löschen lassen? (Liste auf Wunsch.)
