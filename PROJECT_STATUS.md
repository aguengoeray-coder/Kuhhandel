# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 12.11.2026  
Repository: `aguengoeray-coder/Kuhhandel`  
Hauptbranch: `main`  
Bestätigter Live-Stand: **v0.47.1**, Commit `0c049e189a2e7d10050991f44f162cc49248555d`. Alp hat diesen Stand freigegeben; GitHub-Tests und Cloudflare Workers Build wurden als erfolgreich gemeldet.

> GitHub-Code und tatsächliche Workflow-Ergebnisse sind maßgeblich. Branchlokale Änderungen sind nicht live.

## Veröffentlichter Stand
- `main`: v0.47.1.
- App-Version muss in `js/app.js` (`APP_VERSION`), `version.json` und oberstem `CHANGELOG.md`-Eintrag übereinstimmen.
- Cloudflare Worker `kuhhandel`; Supabase als Datenbank/Echtzeitdienst.
- Reines HTML/CSS/JavaScript mit ES-Modulen; kein Build-Schritt.

## Aktuelle Entwicklungsaufträge

| Bereich | Branch | Owner | Status / nächster Schritt |
|---|---|---|---|
| Shop v0.48 | `codex/v048-shop` | Codex | Separater Feature-Zweig. Browserreview 9999865 fand bei 852×393 und 667×375 abgeschnittene Avatar-Namen und Aktionsbuttons. Gefordert: Mindestschrift 10 px, Avatare mindestens 48 px, Pillen-Buttons. Neueste Korrektur erneut visuell prüfen. |
| Automatisierung A/B/E | `codex/automation-high` | Codex | Umsetzung auf Draft-PR #2. CI am Commit `07800eaa` erfolgreich: npm test 41/41, Syntax 14 JS-Dateien, Versionsabgleich v0.47.1. Wartet auf Alps Review/GO je Schritt. |
| Browser-/Layouttests C/D | `claude/e2e-layout` | Claude | Separater Owner/Branch. Playwright unter `e2e/**`, Workflow `.github/workflows/e2e.yml`; `package.json` bleibt unverändert. |
| Live-App | `main` | — | v0.47.1. Im Automatisierungsauftrag unverändert lassen. |

## Datei-Owner und Grenzen

**Codex – `codex/automation-high`:** `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`, `CLAUDE.md`, `scripts/check.mjs`, `.github/workflows/tests.yml`, `.github/workflows/pr-report.yml`, `test/*.test.js`.

**Claude – `claude/e2e-layout`:** `e2e/**`, `.github/workflows/e2e.yml`. Playwright wird im Workflow mit `--no-save` installiert; kein Edit an `package.json`. E2E-Bericht: `e2e-report/summary.md`; Screenshots-Artefakt: `e2e-screenshots`.

**Von beiden unangetastet:** `js/app.js`, `js/game.js`, `css/style.css`, `src/engine.js`. `codex/v048-shop` bleibt unberührt.

## Qualitätsprüfungen
- `npm test`: alle Tests unter `test/*.test.js`.
- Syntax: alle JS-Dateien unter `js/`, `src/`, `worker/` sowie `sw.js`.
- Versionsabgleich: `APP_VERSION` = `version.json` = oberster Changelog-Eintrag.
- `package.json` bleibt bewusst bei `0.1.0`: npm-Paketmetadatum, keine App-Version.
- Browser-/Layouttests laufen separat im Claude-E2E-Workflow.

## Roadmap
1. A – Projektgedächtnis und KI-Regeln vereinheitlichen.
2. B – Syntax- und Versionsprüfungen in die bestehende CI integrieren.
3. C/D – Claude ergänzt separat Playwright- und Layoutprüfungen.
4. E – PR-Bericht aktualisiert einen Kommentar pro PR und verlinkt E2E-Artefakte.
5. F – Alp richtet Branch-Schutz für `main` ein (Pull Request + grüne Pflichtprüfungen); KIs erklären nur die Schritte.

## Freigabe
Jeder Schritt wird einzeln committed, getestet und in `AI_HANDOFF.md` dokumentiert. Alp erteilt ein eigenes GO je Schritt. Ohne ausdrückliches GO kein Merge. SQL führt ausschließlich Alp aus.
