# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 12.11.2026, 20:10 Uhr  
Repository: `aguengoeray-coder/Kuhhandel`  
Hauptbranch: `main`  
Aktueller `main`: **v0.47.2**, Commit `e74c69451bd552ddd17455e1bdc00615ffb075fe`.

> GitHub-Code und tatsächliche Workflow-Ergebnisse sind maßgeblich. Änderungen auf Feature-Branches sind nicht live.

## Veröffentlichter Stand
- `main`: App-Version v0.47.2.
- Claude v0.47.2 ist integriert.
- Codex-Automatisierung A/B/E wurde von Alp am 12.11.2026 um 19:59:26 UTC über PR #2 gemergt. Merge-Commit: `e74c694`.
- Claude Browser-/Layouttests C/D aus PR #3 sind ebenfalls in `main`.
- Shop v0.48 ist **noch nicht live** und nicht in die Haupt-App integriert.
- App-Version wird erst mit der Shop-Integration auf v0.48.0 erhöht; dann `js/app.js` (`APP_VERSION`), `version.json` und `CHANGELOG.md` gemeinsam aktualisieren.
- Cloudflare Worker `kuhhandel`; Supabase als Datenbank/Echtzeitdienst.
- Reines HTML/CSS/JavaScript mit ES-Modulen; kein Build-Schritt.

## Aktuelle Entwicklungsaufträge

| Bereich | Branch | Owner | Status / nächster Schritt |
|---|---|---|---|
| Shop v0.48 | `codex/v048-shop` | Codex | Aktueller Code-Head `ffa9b90`; mit aktuellem `main` synchronisiert (60 Commits voraus, 0 zurück). Unit-Tests, Shop-Playwright und Cloudflare Preview erfolgreich. Shop-Playwright prüft 852×393 und 667×375 sowie Mindestschrift 10 px. Allgemeiner Browser-Test: Ansichten bestanden, vollständige Testpartien laufen noch. PR #5 ist Draft. SQL nicht ausgeführt; kein Merge nach `main`. |
| Automatisierung A/B/E | `main` (ursprünglich `codex/automation-high`) | Codex | PR #2 von Alp gemergt. Tests, Browser-Tests und PR-Bericht auf Head `fc0d825` erfolgreich. Acht-Dateien-PR-Bericht korrigiert; Workflows liegen auf `main`. |
| Browser-/Layouttests C/D | `main` (aus `claude/e2e-layout`) | Claude | PR #3 gemergt. Workflow `.github/workflows/e2e.yml` und Playwright-Tests unter `e2e/**` integriert. |
| Live-App | `main` | — | v0.47.2. Shop-Änderungen sind nicht Bestandteil dieses Live-Stands. |

## Shop v0.48 – aktueller Prüfstand
- Elf Original-SVG-Avatare in Selten/Episch/Legendär mit 4/4/3-Anordnung.
- Acht freigegebene Sprüche: sieben kosten 10 Dublonen, „Ich habe nur gute Ideen“ 20 Dublonen.
- Shop-Demo bezieht Artikel-IDs und Preise direkt aus dem tatsächlichen Artikelkatalog.
- Playwright prüft 11 Avatare, 8 Sprüche, Text-/Button-Überläufe, Clipping, Bereichsgrenzen, JS-Fehler, Preislabels und Mindestschriftgröße 10 px bei 852×393 und 667×375.
- Letzter bestätigter Shop-Vorschau-Lauf: [Run 43297050744](https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43297050744), erfolgreich auf `ffa9b90`. Screenshots: [Artefakt](https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43297050744/artifacts/13978794151).
- Cloudflare Workers Builds Preview für `ffa9b90`: **erfolgreich**. [Builddetails](https://dash.cloudflare.com/96573a9c3ec574ef8d69f5e94fbde4c1/workers/services/view/kuhhandel/production/previews/codex-v048-shop/builds/2a5f574c-1b82-4566-8cdc-639e9697eeda).
- Allgemeiner Browser-Test auf `ffa9b90`: [Run 43297050731](https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43297050731); Ansichten in vier Größen bestanden, vollständige Testpartien noch in Arbeit.
- Shop-Branch ist mit aktuellem `main` über Merge-Commit `0f027fc` synchronisiert. PR #5 ist der saubere Draft-Abnahme-PR; PR #1 wurde wegen veraltetem Basisstand geschlossen.
- Supabase-SQL und Anleitung liegen unter `supabase/v0.48-shop.*`; SQL wurde nicht ausgeführt.
- Sicherheitsverbesserung: `record_results` ist im SQL-Entwurf explizit nur für `authenticated` ausführbar; statische Tests prüfen die Rechtevergabe.
- Restrisiko: `games.state` ist clientseitig beschreibbar. Die Dublonen-Siegprämie ist idempotent, aber ein manipulierter Endstand ist noch nicht vollständig ausgeschlossen. Echte Manipulationssicherheit erfordert serverautorisierte Spielzüge und Endstandsberechnung.

## Datei-Owner und Grenzen
- Codex-Automatisierung A/B/E: `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`, `CLAUDE.md`, `scripts/check.mjs`, `.github/workflows/tests.yml`, `.github/workflows/pr-report.yml`, `test/automation.test.js`.
- Claude-E2E: `e2e/**`, `.github/workflows/e2e.yml`.
- Shop v0.48: `js/shop.js`, `js/shopavatars.js`, `css/shop.css`, `shop-demo.html`, `supabase/v0.48-shop.sql`, `supabase/v0.48-shop-anleitung.md`, `test/shop.test.js`, `e2e/shop-preview.mjs`, `.github/workflows/shop-preview.yml`.
- Shop-Integration in `js/app.js`, `js/game.js`, `css/style.css` oder `index.html` bleibt ein separater Schritt.
- Keine Secrets committen. SQL führt ausschließlich Alp aus.

## Qualitätsprüfungen
- `npm test`: alle Tests unter `test/*.test.js`.
- Syntax-/Versionsprüfung über `scripts/check.mjs`.
- Browser-/Layouttests über `.github/workflows/e2e.yml`.
- Shop-spezifische Layoutprüfung über `.github/workflows/shop-preview.yml`.
- Shop-Playwright muss 852×393 und 667×375 bestehen.
- Vor jeder Freigabe vollständigen Diff gegen aktuellen `main` prüfen.

## Roadmap
1. A/B/E – gemeinsame Projektdokumentation, CI-Grundprüfungen und PR-Bericht: **in main integriert**.
2. C/D – Playwright-/Layoutprüfungen: **in main integriert**.
3. Shop v0.48: responsive UI und Backend-Entwurf geprüft; App-Integration und Sicherheit des Siegprämien-Nachweises sind nächste Schritte.
4. Supabase-SQL: nur nach Alps ausdrücklichem GO manuell ausführen.
5. Branch-Schutz für `main`: Alp richtet ihn selbst ein; KIs können die Schritte erklären.

## Freigabe
- PR #2 Automatisierung: von Alp gemergt.
- PR #5 Shop: Draft, kein Merge nach `main` ohne Alps ausdrückliches GO.
- PR #1 Shop: geschlossen, nicht gemergt.
- SQL niemals selbst ausführen. Kein Shop-Deployment ohne separate Freigabe.
