# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 12.11.2026, 20:03 Uhr  
Repository: `aguengoeray-coder/Kuhhandel`  
Hauptbranch: `main`  
Aktueller `main`: **v0.47.2**, Commit `e74c69451bd552ddd17455e1bdc00615ffb075fe`.

> GitHub-Code und tatsächliche Workflow-Ergebnisse sind maßgeblich. Änderungen auf Feature-Branches sind nicht live.

## Veröffentlichter Stand
- `main`: App-Version v0.47.2.
- Claude-Änderungen aus v0.47.2 sind integriert.
- Codex-Automatisierung A/B/E wurde von Alp am 12.11.2026 um 19:59:26 UTC über PR #2 gemergt. Merge-Commit: `e74c694`.
- Die automatisierten Browser-/Layouttests C/D aus Claudes PR #3 sind ebenfalls in `main`.
- Der Shop v0.48 ist **noch nicht live**.
- App-Version muss in `js/app.js` (`APP_VERSION`), `version.json` und oberstem `CHANGELOG.md`-Eintrag übereinstimmen.
- Cloudflare Worker `kuhhandel`; Supabase als Datenbank/Echtzeitdienst.
- Reines HTML/CSS/JavaScript mit ES-Modulen; kein Build-Schritt.

## Aktuelle Entwicklungsaufträge

| Bereich | Branch | Owner | Status / nächster Schritt |
|---|---|---|---|
| Shop v0.48 | `codex/v048-shop` | Codex | Head `0f027fc`; nachweislich mit aktuellem `main` synchronisiert (51 Commits voraus, 0 zurück). Unit-Tests und Shop-Playwright auf vorherigem Shop-Head `75da997` erfolgreich; 852×393 und 667×375 bestanden. Nach Branch-Synchronisierung laufen die Prüfungen erneut. PR #1 bleibt Draft. SQL nicht ausgeführt, kein Merge nach `main`. |
| Automatisierung A/B/E | `codex/automation-high` | Codex | PR #2 am 12.11.2026 von Alp gemergt. Tests, Browser-Tests und PR-Bericht auf Head `fc0d825` erfolgreich. Acht-Dateien-PR-Bericht korrigiert. Die Workflows liegen jetzt auf `main`. |
| Browser-/Layouttests C/D | `main` (aus `claude/e2e-layout`) | Claude | PR #3 ist gemergt. Workflow `.github/workflows/e2e.yml` und Playwright-Tests unter `e2e/**` sind integriert. |
| Live-App | `main` | — | v0.47.2. Shop-Änderungen sind nicht Bestandteil dieses Live-Stands. |

## Shop v0.48 – aktueller Prüfstand
- Elf Original-SVG-Avatare in Selten/Episch/Legendär mit 4/4/3-Anordnung.
- Acht freigegebene Sprüche: sieben kosten 10 Dublonen, „Ich habe nur gute Ideen“ 20 Dublonen.
- Shop-Demo-Preise werden direkt aus dem tatsächlichen Artikelkatalog abgeleitet.
- Playwright prüft 11 Avatare, 8 Sprüche, Text-/Button-Überläufe, Clipping, Bereichsgrenzen, JS-Fehler und Preislabels bei 852×393 und 667×375.
- Letzter bestätigter Shop-Vorschau-Lauf: [Run 43295672317](https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43295672317), erfolgreich auf `75da997`. Screenshots: [Artefakt](https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43295672317/artifacts/13978987804).
- Aktueller Shop-Branch wurde mit `main` über Merge-Commit `0f027fc` synchronisiert; neue CI-Prüfungen laufen/stehen aus.
- Cloudflare Preview für den aktuellen Branch-Head ist noch nicht bestätigt.
- SQL-Entwurf und Anleitung liegen unter `supabase/v0.48-shop.*`; SQL wurde nicht ausgeführt.
- Restrisiko: `games.state` ist clientseitig beschreibbar. Die Dublonen-Siegprämie ist idempotent, aber ein manipulierter Endstand ist noch nicht vollständig ausgeschlossen. Echte Manipulationssicherheit erfordert serverautorisierte Spielzüge und Endstandsberechnung.

## Datei-Owner und Grenzen
- Codex-Automatisierung A/B/E: `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`, `CLAUDE.md`, `scripts/check.mjs`, `.github/workflows/tests.yml`, `.github/workflows/pr-report.yml`, `test/automation.test.js`.
- Claude-E2E: `e2e/**`, `.github/workflows/e2e.yml`.
- Shop v0.48: `js/shop.js`, `js/shopavatars.js`, `css/shop.css`, `shop-demo.html`, `supabase/v0.48-shop.sql`, `supabase/v0.48-shop-anleitung.md`, `test/shop.test.js`, `e2e/shop-preview.mjs`, `.github/workflows/shop-preview.yml`.
- Shop-Integration in `js/app.js`, `js/game.js`, `css/style.css` oder `index.html` bleibt ein separater, späterer Schritt.
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
3. Shop v0.48: responsive UI und Backend-Entwurf prüfen; anschließend Integration in die App vorbereiten.
4. Supabase-SQL: nur nach Alps ausdrücklichem GO manuell ausführen.
5. Branch-Schutz für `main`: Alp richtet ihn selbst ein; KIs können die Schritte erklären.

## Freigabe
- PR #2 Automatisierung: von Alp gemergt.
- PR #1 Shop: bleibt Draft; kein Merge nach `main` ohne Alps ausdrückliches GO.
- SQL niemals selbst ausführen. Kein Deployment des Shops ohne separate Freigabe.
