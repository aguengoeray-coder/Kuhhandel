# AI_HANDOFF.md – offene Übergaben

Dieses Dokument enthält aktuelle, offene Übergaben. Abgeschlossene oder überholte Übergaben stehen im Archiv. Vor jeder Arbeit tatsächliche Branches und Commits prüfen.

## 12.11.2026 – Claude → Codex: v0.47.1 und Shop-Review

**Quelle:** `claude/handoff`, Einträge vom 12.11.2026 um 17:50 und 17:55.  
**v0.47.1:** Mit Alps GO live gestellt; `main` = `0c049e1`, GitHub-Tests und Workers Build grün.

### Shop-Review 9999865 – offen
- Korrekt: acht Sprüche/Preise, 4/4/3-Layout, keine Überlappung, keine horizontale Überbreite; damaliger Testlauf 42/42.
- Blocker bei 852×393 und 667×375: Avatar-Namen oben sowie Kaufen-/Auswählen-/Aktiv-Buttons unten abgeschnitten.
- Mindestschrift 10 px, Avatare mindestens 48 px, Spruch-Kaufbuttons pillenförmig.
- Vor Übergabe automatisiert prüfen: Kindergrenzen innerhalb `.shop-item`, kein Textüberlauf, keine Schrift unter 10 px; Screenshots beider Viewports.
- Shop bleibt separater Auftrag auf `codex/v048-shop`, nicht Teil von `codex/automation-high`.

## 12.11.2026 – Alp → Codex/Claude: Automatisierung HIGH

**Status:** Von Alp freigegeben; Umsetzung auf getrennten Branches. Merge in `main` nur nach eigenem GO je Schritt.

### Codex – `codex/automation-high`
- A: Doku – `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`, `CLAUDE.md` (identisch). ROADMAP/AI_TEAM-Inhalte in Status-/Regeldokumente integrieren, keine doppelten Dateien.
- B: CI – `node --check` für JS unter `js/`, `src/`, `worker/` plus `sw.js`; Versionsprüfung `APP_VERSION` = `version.json` = oberster Changelog-Eintrag. `package.json` 0.1.0 bewusst ausnehmen. Bestehenden Engine-Versionstest nicht unnötig duplizieren.
- E: Ein PR-Kommentar pro PR, bei Folgeläufen aktualisieren. Geänderte Dateien, npm test/Checks, Risiken (engine.js, neue SQL, fehlende Versionsanhebung/CHANGELOG, AGENTS/CLAUDE-Abweichung). E2E-Bericht und Artefakt `e2e-screenshots` verlinken, sobald Claudes Workflow verfügbar ist.
- Codex-Dateigrenzen: `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`, `CLAUDE.md`, `scripts/check.mjs`, `.github/workflows/tests.yml`, `.github/workflows/pr-report.yml`, `test/*.test.js`.

### Claude – `claude/e2e-layout`
- C/D: Playwright-Tests unter `e2e/**`, Workflow `.github/workflows/e2e.yml`.
- Kein Edit an `package.json`; Playwright via `--no-save`, Start: `node --test e2e/`.
- E2E-Zusammenfassung `e2e-report/summary.md`, Screenshots-Artefakt `e2e-screenshots`.

### Gemeinsame Sicherheitsregeln
- `codex/v048-shop` bleibt unberührt.
- `js/app.js`, `js/game.js`, `css/style.css`, `src/engine.js` bleiben im Automatisierungsauftrag unangetastet.
- Kein automatischer Merge, kein Push auf `main`, keine automatische Veröffentlichung.
- SQL niemals selbst ausführen; Alp führt SQL selbst aus.
- Jeden Schritt einzeln committen, Tests ausführen, Commit/Ergebnis hier melden und auf Alps GO warten.

## Archiv
### 12.11.2026 – Historische Übergaben aus `codex/ai-project-memory` und `claude/handoff`
- Frühe Dokumentationsstände, ROADMAP und AI_TEAM wurden in `PROJECT_STATUS.md` und `AGENTS.md` zusammengeführt.
- Frühere v0.45/v0.46/v0.47.0-Statusangaben sind überholt; maßgeblich ist `main` v0.47.1 @ `0c049e1`.
- Detaillierte Shop-Historie und Testprotokolle bleiben auf `codex/v048-shop`; hier steht nur der aktuelle Blocker.


## 12.11.2026 – Codex → Alp/Claude: Automatisierung A/B/E – erster geprüfter Stand

**Branch:** `codex/automation-high`  
**Basis:** `main` @ `0c049e189a2e7d10050991f44f162cc49248555d` (v0.47.1)  
**Draft-PR:** [#2 – Automatisierung HIGH](https://github.com/aguengoeray-coder/Kuhhandel/pull/2)  
**Status:** A/B/E umgesetzt und CI-geprüft; wartet auf Alps Review und separates GO. Nicht gemergt, nicht live.

### Commits (in Reihenfolge)
- `30be46f` – AGENTS-Regeln und Freigabesicherheit.
- `5e5721d` – CLAUDE.md an AGENTS.md angeglichen.
- `e392a79` – PROJECT_STATUS.md mit aktuellem Live-Stand und Roadmap.
- `151d6fb` – AI_HANDOFF.md konsolidiert.
- `184ff69` – `scripts/check.mjs` für Syntax und Versionsabgleich.
- `e73b21b` – Tests für die zusätzliche Changelog-Versionsprüfung.
- `9a72110` – CI-Workflow erweitert.
- `93976db` – PR-Bericht ergänzt.
- `d0557e9`, `07800ea` – Risikoerkennung für App-Version, Quelländerungen und AGENTS/CLAUDE-Abweichungen präzisiert.

### Geänderte Dateien
- `AGENTS.md`, `CLAUDE.md` (byte-identisch)
- `PROJECT_STATUS.md`, `AI_HANDOFF.md`
- `scripts/check.mjs`, `test/automation.test.js`
- `.github/workflows/tests.yml`, `.github/workflows/pr-report.yml`

### Prüfungen – tatsächlich ausgeführt
- GitHub Actions **Tests**, Run `43264889546`: erfolgreich.
  - `npm test`: **41/41 bestanden** (vorher 38/38 Engine-Tests, drei neue Versionsprüftests).
  - `node scripts/check.mjs`: **14 JavaScript-Dateien** syntaktisch geprüft.
  - Versionsabgleich: `APP_VERSION = version.json = oberster CHANGELOG-Eintrag = 0.47.1`.
- GitHub Actions **PR-Bericht**, Run `43264889568`: erfolgreich.
  - Ein bestehender PR-Kommentar wurde aktualisiert statt einen weiteren Kommentar anzulegen.
  - Kommentar: https://github.com/aguengoeray-coder/Kuhhandel/pull/2#issuecomment-6830205917
- `AGENTS.md` und `CLAUDE.md` wurden nach erneutem Abruf als identisch bestätigt.
- Vollständiger PR-Diff geprüft: **8 Dateien geändert, 0 unbeabsichtigte Löschungen**, Branch 0 Commits hinter main.
- Keine App-Dateien, Shop-Dateien, SQL-Dateien oder Secrets geändert.

### Noch offen / Abhängigkeit zu Claude
- Browser-/Layouttests C/D sind noch nicht in diesem Branch enthalten.
- Claudes Workflow sollte exakt `name: E2E Layout` verwenden, damit `pr-report.yml` den Abschluss erkennt.
- Claude sollte den Inhalt von `e2e-report/summary.md` zusätzlich in `$GITHUB_STEP_SUMMARY` schreiben. Der PR-Bericht verlinkt dann die Workflow-Zusammenfassung und das Artefaktverzeichnis `e2e-screenshots`.
- Der `workflow_run`-Empfänger in `pr-report.yml` wird erst zuverlässig aktiv, wenn diese PR-Bericht-Workflowdatei auf dem Default-Branch vorhanden ist. Für den ersten E2E-Lauf nach Integration ggf. den Workflow erneut ausführen, damit der Bericht aktualisiert wird.
- Alp richtet den Branch-Schutz für `main` selbst ein; die Schritt-für-Schritt-Anleitung folgt in der Übergabe.

### Sicherheitsstatus
- PR #2 bleibt Draft. Kein Merge, kein Push auf `main`, kein Deployment.
- `codex/v048-shop` blieb unberührt.
- Kein SQL ausgeführt.
- **Nächste Entscheidung:** Alp prüft A, B und E und erteilt – falls freigegeben – ein ausdrückliches GO für diesen konkreten Schritt.
