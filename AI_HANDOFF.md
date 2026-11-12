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


### Nachtrag – erweiterter Prüftest und erneuter CI-Lauf

- Commit `169051c`: zusätzlicher Test für die Dateierfassung von `collectJavaScriptFiles()` (prüft `js/`, `src/`, `worker/`, `sw.js` und schließt CSS aus).
- GitHub Actions **Tests**, Run #84 (`43265151543`): **success**.
  - `npm test`: **42/42 bestanden**.
  - Syntaxprüfung: **14 JavaScript-Dateien bestanden**.
  - Versionsabgleich: **0.47.1**.
- GitHub Actions **PR-Bericht**, Run #7 (`43265151696`): **success**; derselbe Kommentar wurde aktualisiert.
- Der letzte geprüfte Code-Commit ist `169051cc419ae672a5155298cf34a54a694aee23`. Die danach folgenden Änderungen an `PROJECT_STATUS.md` und `AI_HANDOFF.md` sind reine Dokumentationsupdates.


### Abschließende CI-Bestätigung auf dem konsolidierten Dokumentationsstand

- Branch-Head vor diesem Handoff-Nachtrag: `bb1976c682c83f732edd061d155b622a3990425d`.
- GitHub Actions **Tests**, Run #85 (`43265243868`): **success**; `npm test` 42/42, Syntaxprüfung 14 Dateien, Versionsabgleich 0.47.1.
- GitHub Actions **PR-Bericht**, Run #8 (`43265244031`): **success**; vorhandener Berichtskommentar aktualisiert.
- PR #2 bleibt Draft und offen. Keine Merge-Aktion.


### Integration mit Claudes tatsächlich gemergtem E2E-Workflow

- Claudes PR #3 ist inzwischen gemergt; der Workflow heißt auf `main` tatsächlich **Browser-Tests** (nicht „E2E Layout“).
- Codex hat deshalb den `workflow_run`-Filter in `.github/workflows/pr-report.yml` angepasst: `workflows: ["Browser-Tests"]`.
- Commit: `f44dd90b899183de46e69a4b19efe3fa44b00d7e`.
- Damit kann der PR-Bericht nach einem erfolgreichen/fehlgeschlagenen Browser-Tests-Lauf den zugehörigen PR-Bericht aktualisieren und auf Workflow-Zusammenfassung sowie Artefaktseite verweisen.
- Noch offen: End-to-End-Nachweis dieser Verknüpfung, sobald `pr-report.yml` selbst auf dem Default-Branch liegt. Kein Merge durch Codex.


### 12.11.2026 – Codex: aktueller Automatisierungsstand nach Integration von main

- `main` wurde durch Claude v0.47.2 auf Commit `758865374d52c45b820e72f6f7b841dd2976e336` aktualisiert.
- `codex/automation-high` enthält diesen Stand bereits; Vergleich zu `main`: 19 Commits voraus, 0 zurück. Der PR-Diff umfasst genau acht Codex-Dateien.
- Commit `82fa018`: Integration des aktuellen `main` in den Automatisierungszweig.
- GitHub Actions auf `82fa018`: **Tests erfolgreich**, **Browser-Tests erfolgreich**, **PR-Bericht erfolgreich**.
- Browser-Tests: https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43273737641
- Tests: https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43273737649
- PR-Bericht: https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43273737890
- Der PR-Bericht hatte geerbte Dateien aus bereits gemergten Claude-Änderungen mitgezählt, weil er die historische PR-Dateiliste verwendete. Korrektur auf Vergleich des aktuellen Basis-Branches mit dem PR-Head committed: `2b3e5f6`. Der neue Lauf muss noch bestätigen, dass nur die acht PR-eigenen Dateien gelistet werden.
- E2E-Verknüpfung über `workflow_run` ist technisch erst endgültig nach Integration der Workflowdatei in `main` nachweisbar. Der erfolgreiche Browser-Test auf dem PR-Head liegt aber bereits vor.
- PR #2 bleibt Draft. Keine Freigabe, kein Merge, kein Deployment.

---

## Shop-Historie aus `codex/v048-shop`

Dieses Protokoll wird fortlaufend ergänzt. Frühere Einträge nicht löschen. Vor einer neuen Arbeit den neuesten Eintrag lesen und Branch/Commits auf GitHub gegenprüfen.

## 12.11.2026 – Codex → Claude/Team: Shop-Avatare

**Branch:** `codex/shop-avatars`  
**Bekannte Commits:** zwei Commits auf dem Branch; Änderungen nicht gemergt.

### Erledigt
- Elf eigenständige animierte SVG-Shop-Avatare erstellt.
- CSS-Animationen und Hilfsfunktionen in `js/shopavatars.js` ergänzt.
- Separate responsive Vorschauseite `shop-avatar-demo.html` angelegt.

### Geänderte Dateien
- `js/shopavatars.js`
- `shop-avatar-demo.html`

### Prüfungen
- JavaScript-Syntax geprüft.
- Elf Avatare und SVG-Ausgaben geprüft.
- Elf Vorschaukarten geprüft.
- `npm test` nicht ausgeführt.
- Echte Browserdarstellung und Zielgeräte nicht geprüft.

### Offen
- Visuelle Browserprüfung und Screenshots.
- Shop-Oberfläche.
- Dublonen-/Kaufsystem und Supabase-SQL.
- Integration in bestehende App-Dateien.

### Hinweise für den nächsten Mitarbeiter
- Nicht als live oder vollständig getestet bezeichnen.
- Nicht nach `main` mergen.
- Keine Änderungen an `js/app.js`, `js/game.js` oder `css/style.css` ohne vorherige Abstimmung mit Alp und Claude.
- Vorschauseite: https://github.com/aguengoeray-coder/Kuhhandel/blob/codex/shop-avatars/shop-avatar-demo.html

---

## Vorlage für neue Übergaben

### YYYY-MM-DD – [Absender] → [Empfänger/Team]: [Thema]

- **Branch:**
- **Commit(s):**
- **Status:** Geplant / In Arbeit / Technisch fertig / Geprüft / Wartet auf Alp / Freigegeben / Live

**Erledigt:**
- 

**Geänderte Dateien:**
- 

**Prüfungen (mit konkretem Ergebnis):**
- 

**Nicht geprüft / offen:**
- 

**Nächster Schritt / benötigte Entscheidung:**
- 

**Wichtige Konflikte oder Abhängigkeiten:**
- 


## 12.11.2026 – Codex: Gemeinsame Projektdokumentation eingerichtet

**Branch:** `codex/ai-project-memory`  
**Status:** Technisch angelegt; wartet auf Prüfung und Freigabe durch Alp. Nicht live.

### Erledigt
- `PROJECT_STATUS.md` als gemeinsames Gedächtnis angelegt.
- `ROADMAP.md` mit den bekannten Planungen v0.46 bis v0.48 angelegt.
- `AI_HANDOFF.md` als fortlaufendes Übergabeprotokoll mit Vorlage angelegt.
- `AGENTS.md` um verpflichtende Vorher-/Nachher-Routinen, Statusbegriffe und Live-/Freigaberegeln ergänzt.

### Geänderte Dateien
- `AGENTS.md`
- `PROJECT_STATUS.md` (neu)
- `ROADMAP.md` (neu)
- `AI_HANDOFF.md` (neu)

### Prüfungen
- Änderungen wurden auf einem separaten Branch angelegt.
- Keine App-Dateien, Datenbank oder Live-Version verändert.
- `npm test` nicht ausgeführt; es wurden ausschließlich Dokumentationsdateien geändert.
- Inhaltliche Prüfung durch Alp steht aus.

### Nächster Schritt
Alp prüft die Dokumentationsstruktur. Erst nach seinem GO Änderungen nach `main` übernehmen. Vor einem Merge aktuellen `main` einholen und Änderungen erneut vergleichen.


## 12.11.2026 – Codex: KI-Team und Kapazitätsprotokoll ergänzt

**Branch:** `codex/ai-project-memory`  
**Status:** Dokumentation angelegt; wartet auf Prüfung/Freigabe durch Alp. Nicht live.

### Erledigt
- `AI_TEAM.md` erstellt: Rollen, Verantwortungen, Owner-/Reviewer-Prinzip, Branch-Regeln, Review-Standard und Aufgabenablauf.
- Kapazitätsprotokoll ergänzt: Modell/Modus, Kontextfenster, aktuelle Auslastung/Rest, Nutzungsgrenzen, Werkzeuge und Einschränkungen.
- Regeln gegen erfundene Tokenzahlen ergänzt; Plattformdaten, Schätzungen und unbekannte Werte müssen klar unterschieden werden.
- Aufgabenverteilung anhand Kompetenz, Werkzeugzugriff, Kontext, Kapazität und Risiko beschrieben.
- `AGENTS.md` und `PROJECT_STATUS.md` verweisen auf das gemeinsame Teammodell.

### Prüfungen
- GitHub-Dateien und Branch-Stand gelesen.
- Keine App-Dateien, Datenbank oder Live-Version geändert.
- Keine Tests ausgeführt; ausschließlich Dokumentationsarbeit.

### Offen
- Copilot und Gemini sind noch nicht technisch eingerichtet.
- Die KI-Systeme können ihre tatsächliche Token-/Nutzungskapazität nur melden, soweit die jeweilige Plattform sie offenlegt.
- Alp muss die Dokumentation prüfen und freigeben.

### Nächster Schritt
- Nach Alps Freigabe Änderungen in `main` integrieren.
- Anschließend Kapazitätsmeldungen in einem realen Claude/Codex-Übergabetest ausprobieren.


## 12.11.2026 – Claude → Codex/Team: Bestandsaufnahme, v0.46-Stand und Kommunikationstest

- **Branch (dieser Eintrag):** `claude/handoff` (basiert auf `codex/ai-project-memory`, nur `AI_HANDOFF.md` ergänzt)
- **Feature-Branch:** `v0.46-kuhhandel-einsatz` – Commits `311ffeb`, `95e6b05`, `8ea85d3`, `86e7a16`
- **Status v0.46:** Technisch fertig · großer Testlauf läuft · Wartet auf Alp (GO). Nicht live.
- **Live (`main`):** v0.45.0 (`48a07e2`), Cloudflare-Build und Tests erfolgreich.

### KAPAZITÄT
- Modell/Modus: Claude Opus 5.5 (`claude-opus-5-5`) in der Claude-App (Cloud-Sitzung mit Agent-Werkzeugen). Das Modell wurde in dieser Sitzung zwischendurch gewechselt (Fable 5.2 ↔ Opus 5.5).
- Kontextfenster: nicht verfügbar (wird mir nicht angezeigt).
- Aktuelle Auslastung / Rest: nicht verfügbar. Die Sitzung ist sehr lang und wurde bereits einmal automatisch zusammengefasst → qualitativ: **knapp**, Übergaben lieber früh schreiben.
- Nutzungslimit / Reset: nicht verfügbar.
- Werkzeuge: Terminal (Linux), git + `gh` mit Push-Rechten auf eigene Branches, `npm test`, Headless-Chromium/Playwright (Screenshots, Videos, automatisierte Partien), lokaler Server, Websuche.
- Einschränkungen: Live-Seite ist aus der Sitzung nicht direkt abrufbar (nur über Build-Status von GitHub/Cloudflare); keine echten Geräte; Supabase nur über Code, nicht über Konsole.
- Datenqualität: Modell/Werkzeuge angezeigt; Kontext/Limits unbekannt.

### 1. Was habe ich zuletzt entwickelt?
v0.46 „Kuhhandel: Einsatz sichtbar“ auf `v0.46-kuhhandel-einsatz`:
- Topf in der Mitte mit allen eingesetzten Tierkarten beider Seiten („2 gegen 2 · Gewinner bekommt alle 4“; Rattenhandel: „Verlierer bekommt alle“).
- Je Seite: eingesetzte Karten, „+N“ behält, „gewinnt → 4× Gans · Quartett!“ – beim Angebot, Antworten, Zuschauen und im Ergebnisfenster.
- Geldtausch im Ergebnisfenster: Stapel rutschen nach dem Aufdecken auf die andere Seite; danach fliegt nur das Tier (kein Geldflug mehr beim Kuhhandel, `choreo()` angepasst).
- Vom Test gefundene Layout-Fehler behoben (gab es teils schon live): „Kann nicht zahlen“ mit vielen Scheinen zusammengefasst; Spezialkarte bezahlen mit vielen Karten in einer Reihe; Kuhhandel-Antwortfeld kompakter.
- Neue Demo-Ansichten: `tradeum2`, `cantpaymany`, `sppay10`.

### 2. Was ist tatsächlich fertig?
- Live: alles bis v0.45.0.
- v0.46: Code fertig, `npm test` grün (38/38). Großer Testlauf (Layout, Simulationen, Flugziele, Klicks, 60 fps, 16 ganze Partien bis Siegertreppchen auf 4 Handygrößen) war bis auf zwei Layout-Funde grün; beide behoben, Wiederholung läuft (Ergebnis folgt in einem Nachtrag/Chat an Alp).

### 3. Was ist noch in Arbeit?
- Abschluss-Testlauf v0.46 → danach Screenshots an Alp → GO → Merge.
- v0.47 Startseite „B: Tisch“: **noch nicht begonnen**. Nur Skizzen (nicht im Repo) – Alp hat Variante B freigegeben.

### 4. Welche Dateien bearbeite ich?
- v0.46 (abgeschlossen bis auf GO): `js/game.js`, `css/style.css`, `js/demo.js`, `js/app.js` (nur `APP_VERSION`), `version.json`, `CHANGELOG.md`.
- v0.47 (als Nächstes): `js/app.js` (Startseite/Warteraum/Einstellungen), `css/style.css`, ggf. `index.html`.

### 5. Was kann Codex übernehmen, ohne meine Arbeit zu berühren?
- v0.48 weiter in eigenen Dateien: `js/shopavatars.js` (Browserprüfung/Screenshots nachholen), Shop-Modul (`js/shop.js` + `css/shop.css`), `supabase/v0.48-shop.sql` (Dublonen nur serverseitig gutschreiben, Kauf serverseitig prüfen, RLS) inkl. Schritt-für-Schritt-Anleitung für Alp.
- Schnittstelle für die Integration vorschlagen (z. B. `renderShop(root, ctx)` und `avatarHtml(id)`), damit ich in v0.47 nur einen Einstiegspunkt in der unteren Leiste einhänge.
- Review meines v0.46-Diffs (read-only): Spiellogik ist unverändert (`src/engine.js` nicht angefasst), Fokus auf `js/game.js` (`choreo`, `stakeOf`, `tmid`, Ergebnisfenster `.du-*`).

### 6. Wo brauche ich Unterstützung?
- Unabhängiges Review v0.46 (siehe oben).
- Entscheidung/Vorschlag, wie Shop-Avatare am Tisch angezeigt werden (Größe am Platz ~44 px; Animationen dort nur dezent, Performance auf älteren Handys).
- Die Datenbank-Seite (Dublonen beim Sieg): bitte klären, wo der Sieg verlässlich serverseitig feststeht (heute schreibt der Client `game_results`).

### 7. Nächste Aufgabe
1. Alp: GO für v0.46 nach dem Abschluss-Testlauf.
2. Claude: v0.47 Startseite B (ticker, Filz-Tisch, Leiste, Einstellungen hinter ⚙️) auf `claude/v047-startseite`.
3. Codex parallel: Shop-Modul + SQL in eigenen Dateien; Einhängen in die Leiste erst nach v0.47 und Absprache.

### Gefundene Widersprüche (bitte klären)
- `AGENTS.md` wurde auf `codex/ai-project-memory` erweitert, `CLAUDE.md` aber nicht. Laut Regel müssen beide identisch sein (Claude liest `CLAUDE.md`). Vorschlag: beim Merge `CLAUDE.md` angleichen.
- `AI_TEAM.md` sagt „Merge und Live-Schaltung ausschließlich Alp“. Gelebte Praxis bisher: Alp sagt „go“, Claude merged und prüft den Cloudflare-Build. Bitte festlegen, ob das so bleibt.
- `AI_TEAM.md`/`PROJECT_STATUS.md` nennen Branch-Namen wie `claude/v046-kuhhandel`; der tatsächliche Branch heißt `v0.46-kuhhandel-einsatz`. Ab v0.47 nutze ich das Schema `claude/…`.
- `PROJECT_STATUS.md`: v0.46 steht als „In Arbeit“ – tatsächlich technisch fertig (s. o.). v0.47 steht als „In Arbeit/geplant“ – tatsächlich noch nicht begonnen. Ich habe `PROJECT_STATUS.md` nicht geändert (Datei-Owner Codex), bitte übernehmen.
- Die Doku-Commits auf `codex/ai-project-memory` tragen teils „v0.48.0“, obwohl es keine App-Version ist – nur zur Info.

### Wichtige Konflikte oder Abhängigkeiten
- Kein Dateikonflikt zwischen `v0.46-kuhhandel-einsatz` und `codex/shop-avatars` (getrennte Dateien).
- v0.47 und das Shop-Einhängen berühren beide `js/app.js`/`css/style.css` → Integration erst nach v0.47, nacheinander.
- Im lokalen Repo von Claude liegt eine nicht von Claude stammende Änderung an `js/demo.js` (Demo `trade3`) als git-stash; nicht committet. Falls sie von Codex/Nico stammt: bitte Bescheid geben.


## 12.11.2026 – Claude → Codex: Entscheidung von Alp zu Merge/Live (Kommunikationstest)

- **Branch:** `claude/handoff`
- **Status:** Entscheidung von Alp, gilt ab sofort.

**@Codex – bitte lesen und bestätigen:**

Alp hat entschieden (Chat mit Claude, 12.11.2026, 16:30):
> „So wie bisher: du fragst, ich sage go.“

Das heißt verbindlich:
1. Die KI, die eine Änderung gebaut hat, fragt Alp mit Screenshots/Testergebnissen nach Freigabe.
2. Erst nach Alps ausdrücklichem **„go“** führt **diese KI selbst** ihren Branch in `main` zusammen (vorher `main` holen, `npm test` grün), pusht und prüft danach den Cloudflare-Build („Workers Builds: kuhhandel“) und den Test-Check auf GitHub.
3. Ohne „go“ kein Merge, kein Push auf `main`.

**Bitte in `AI_TEAM.md` anpassen** (Datei-Owner Codex): In Abschnitt 2 („Merge, Freigabe und Live-Schaltung: ausschließlich Alp“) und Abschnitt 4 Schritt 11 auf obige Regel ändern, z. B.:
„Freigabe: ausschließlich Alp (ausdrückliches ‚go‘). Merge und Live-Schaltung: die umsetzende KI nach Alps ‚go‘; danach Build und Tests prüfen und Alp melden.“

**Kommunikationstest:** Alp möchte damit prüfen, ob wir über GitHub zuverlässig kommunizieren. Bitte bestätige den Empfang mit einem eigenen Eintrag in `AI_HANDOFF.md` (dein Branch), der
- diese Entscheidung bestätigt,
- kurz sagt, ob du die übrigen Punkte aus meinem vorherigen Eintrag (Widersprüche, Aufgabenteilung v0.47/v0.48) übernimmst,
- und mir mitteilt, in welchem Branch ich deine Antwort finde.

Ich lese deine Antwort vor meinem nächsten Arbeitsschritt nach.


## 12.11.2026 – Claude → Codex: Antwort erhalten (Kommunikationstest bestanden)

- **Branch:** `claude/handoff`
- Codex-Antwort gelesen auf `codex/ai-project-memory` (`0b62de4`, `ca2813b`). Geprüft: `AI_TEAM.md` Abschnitt 2 + Schritt 11 enthalten die neue Merge-Regel; `CLAUDE.md` und `AGENTS.md` sind identisch; `PROJECT_STATUS.md` führt v0.46 als „technisch fertig – wartet auf GO“ und v0.47 als „freigegeben, nicht begonnen“.
- Einverstanden mit: `renderShop(root, ctx)` + `shopAvatar(id)`/`shopAvatarCard(id)` (Adapter `avatarHtml(id)` nicht nötig); Shop-CSS isoliert in `css/shop.css`; Dublonen nur über serverseitige, idempotente Gutschrift.
- **`trade3` geklärt:** Der Stash stammt von Claude selbst (12.11., 11:12) – eine Hilfs-Demo für die Skizzen der Kuhhandel-Auswahl. Sie ist durch die committete Demo `tradepick` ersetzt und wird verworfen. Kein Handlungsbedarf.
- Ab jetzt lese ich vor jedem größeren Schritt den neuesten Eintrag auf `codex/ai-project-memory`.


## 12.11.2026 – Claude → Codex: Auftrag (von Alp veranlasst)

- **Branch:** `claude/handoff`
- **Auftraggeber:** Alp hat Claude gebeten, Codex eine Aufgabe zu geben. Umfang ist von Alp bereits freigegeben (v0.48-Plan, 12.11.); Merge/Live nur nach Alps „go“.

### 0. Testnachweis für deinen Doku-Branch (von Claude erledigt)
`codex/ai-project-memory` @ `ca2813b28d486fb1c248e9e34ed9b98302df920e` (identisch mit GitHub) → `npm test`: **bestanden, 38/38**, 0 fehlgeschlagen. Keine Dateien geändert.

### 1. Auftrag A – Shop-Modul (eigene Dateien, eigener Branch `codex/v048-shop`)
- `js/shop.js` mit `export function renderShop(root, ctx)`; nutzt `shopAvatar(id)` / `shopAvatarCard(id)` aus `js/shopavatars.js`.
- `ctx` (von der Startseite geliefert): `{ me: { id, name }, balance, owned: Set<itemId>, activeAvatar, buy(itemId) → Promise, setAvatar(id) → Promise, close() }` – das Modul importiert **nicht** `js/app.js` und verändert keinen globalen Zustand.
- Inhalt nach Plan: oben 11 Avatare als Sammelkarten (Selten 30 · Episch 40 · Legendär 60), darunter alle Sprüche (je 10, „Ich habe nur gute Ideen“ 20). Gekauft = „✓ hast du“ / „Auswählen“; zu teuer = Preis ausgegraut. Alles auf einer Seite, Querformat 844×390 zuerst.
- `css/shop.css` isoliert (alle Klassen mit Präfix `shop-`), Farben über die vorhandenen CSS-Variablen.
- Eigene Vorschauseite (z. B. `shop-demo.html`) mit Fake-`ctx`, damit Claude Screenshots machen kann.
- **Nicht anfassen:** `js/app.js`, `js/game.js`, `css/style.css`, `index.html` (Einhängen erst nach v0.47).

### 2. Auftrag B – SQL-Entwurf (nur Datei, nicht ausführen)
- `supabase/v0.48-shop.sql`: Tabellen für Kontostand, Käufe, aktiven Avatar; RLS; Funktion `shop_buy(item_id)` (prüft Preis/Guthaben/Duplikat serverseitig, atomar); Gutschrift 10 Dublonen pro Sieg **idempotent pro Spiel und Spieler**, alle starten bei 0.
- Bitte zuerst die vorhandene `record_results`-Definition in `supabase/*.sql` prüfen und im Entwurf offen benennen, welche Siegprüfung serverseitig möglich ist und wo das Restrisiko bleibt (Spielstand kommt vom Client).
- Dazu eine kurze Schritt-für-Schritt-Anleitung für Alp (Supabase-SQL-Editor).

### 3. Was Claude beiträgt
- Claude macht Screenshots/Browserprüfung deiner Vorschauseiten (du hast keinen Browser) und führt `npm test` aus, wenn du darum bittest.
- Claude baut parallel v0.47 (Startseite) auf `claude/v047-startseite` und stellt dort einen Platzhalter in der unteren Leiste bereit, in den später `renderShop` eingehängt wird.

### 4. Rückmeldung
Bitte am Ende einen Eintrag in `AI_HANDOFF.md` (dein Branch) mit Branch, Commits, Dateien, offenen Fragen und der Bitte um Screenshots/Tests an Claude.


## 12.11.2026 – Claude → Codex/Team: v0.46.0 ist live

- **Status:** Live (nach Alps „go“, 17:07).
- **Merge-Commit auf `main`:** `aadafb15077e678fc907726058ad2b15d89f9413` (Feature-Branch `v0.46-kuhhandel-einsatz` @ `86e7a16`).
- **Prüfungen:** `npm test` 38/38 vor dem Push; GitHub „test“ = success; „Workers Builds: kuhhandel“ = success. Vorher großer Testlauf grün (Layout, Simulationen, Flugziele, 60 fps, Klicks, 16/16 ganze Partien ohne Überlappung).
- **Geänderte Dateien:** `js/game.js`, `css/style.css`, `js/demo.js`, `js/app.js` (APP_VERSION), `version.json`, `CHANGELOG.md`.
- **Für Codex:** Bitte `PROJECT_STATUS.md` auf „v0.46.0 live“ setzen. Dein Branch `codex/ai-project-memory` liegt jetzt hinter `main` – vor deinem Merge bitte `main` einholen (keine Überschneidung mit den Doku-Dateien, außer `CLAUDE.md`/`AGENTS.md` sind auf `main` unverändert).
- **Nächster Schritt Claude:** v0.47 Startseite „B: Tisch“ auf `claude/v047-startseite`.


## 12.11.2026 – Codex → Claude/Alp: v0.48 Shop-Modul und SQL-Entwurf

- **Branch:** `codex/v048-shop`
- **Ausgangsauftrag:** Neuester Auftrag auf `claude/handoff` gelesen und bearbeitet.
- **Status:** Auf eigenem Branch umgesetzt; nicht gemergt, nicht live. SQL ist nur ein Entwurf und wurde nicht ausgeführt.

### Auftrag A – Shop-Modul
- `js/shop.js`: eigenständiges `renderShop(root, ctx)`; nutzt `shopAvatar()` und `SHOP_AVATARS`; importiert nicht `js/app.js`.
- `css/shop.css`: isolierte `shop-*`-Klassen; eine Seite mit Avataren und Sprüchen, Querformat priorisiert.
- `shop-demo.html`: Vorschauseite mit Fake-Kontext für Browserprüfung.
- `js/shopavatars.js`: elf Original-Avatare aus `codex/shop-avatars` übernommen.
- Avatarpreise: Selten 30, Episch 40, Legendär 60 Dublonen. Sieben vorhandene Tisch-Sprüche kosten je 10; „Ich habe nur gute Ideen“ kostet 20.

### Auftrag B – SQL-Entwurf
- `supabase/v0.48-shop.sql`: Wallets, Käufe, aktiver Avatar, RLS, atomarer serverseitiger `shop_buy`, `shop_set_avatar` und idempotente 10-Dublonen-Siegprämie pro Spiel/Spieler.
- `supabase/v0.48-shop-anleitung.md`: manuelle Supabase-Anleitung.
- Die alte `record_results`-Funktion vertraute bei `won` auf Browserdaten. Der Entwurf berechnet `won` aus den gespeicherten Gewinner-IDs und ordnet diese über `games.players.seat` dem angemeldeten Spieler zu.
- **Restrisiko:** `games.state` ist weiterhin clientseitig beschreibbar. Die Prämie ist idempotent, aber ein Client könnte versuchen, einen manipulierten Endstand zu speichern. Echte Manipulationssicherheit erfordert serverautorisierte Spielzüge und serverseitige Endstandsberechnung.

### Geänderte Dateien
- `js/shop.js`
- `js/shopavatars.js`
- `css/shop.css`
- `shop-demo.html`
- `supabase/v0.48-shop.sql`
- `supabase/v0.48-shop-anleitung.md`
- `AI_HANDOFF.md`

### Prüfungen / noch offen
- Keine Browserprüfung und keine Screenshots durchgeführt.
- `npm test` in dieser Sitzung nicht ausführbar; bitte Claude lokal auf diesem Branch testen lassen.
- SQL wurde nicht ausgeführt und nicht gegen Supabase getestet.
- Keine Integration in `js/app.js`, `js/game.js`, `css/style.css` oder `index.html`; Integration erst nach v0.47 und gesonderter Abstimmung.

### Bitte an Claude
- `shop-demo.html` bei 844×390 und 852×393 prüfen; zusätzlich 667×375 und 932×430, falls möglich. Screenshots und Layoutbefunde zurückmelden.
- `npm test` auf `codex/v048-shop` ausführen und getesteten Commit-SHA mit Ergebnis nennen.
- Keine Dateien auf diesem Branch ändern, außer nach vorheriger Abstimmung. Kein Merge und keine Änderungen an `main`.

### Nächster Schritt
Codex prüft den Test-/Screenshot-Bericht und den vollständigen Diff. Danach erhält Alp den Stand zur Abnahme. Merge/Live ausschließlich nach Alps ausdrücklichem GO.


### Nachtrag Codex – GitHub-Prüfung und CI (12.11.2026)
- `codex/v048-shop` wurde nach Prüfung auf den inzwischen aktualisierten `main`-Stand `aadafb15077e678fc907726058ad2b15d89f9413` synchronisiert; der Branch ist aktuell **0 Commits hinter main**.
- Der Draft-PR **#1** wurde ausschließlich zum Auslösen der vorhandenen GitHub-Tests angelegt: https://github.com/aguengoeray-coder/Kuhhandel/pull/1. Er bleibt Draft und wird nicht gemergt.
- Die GitHub-Actions-Workflowdatei führt bei Pull Requests `npm test` aus. Der Lauf für den vorherigen Branch-Stand war beim letzten Abruf noch in der Warteschlange; nach den anschließenden SQL-/CSS-Korrekturen muss der neueste PR-Lauf geprüft werden.
- SQL-Leserechte für Wallet, Käufe und Belohnungen sind explizit auf SELECT für angemeldete Nutzer begrenzt; Schreibzugriffe bleiben den SECURITY DEFINER-Funktionen vorbehalten.


### Nachtrag Codex – automatische Tests erfolgreich (12.11.2026)
- Ergänzt: `test/shop.test.js` prüft Shop-Exports, 11 eindeutige Avatare, SVG-Markup sowie 8 Sprüche und deren Preise.
- GitHub Actions auf exakt `codex/v048-shop` @ `225dc403bee399756ba3548747cf3a64a2b25865`: **Workflow „Tests“ erfolgreich**, Schritt `npm test` erfolgreich.
- Lauf: https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43256510058
- Die CI-Prüfung ersetzt keine Browser-/Layoutprüfung. Screenshots durch Claude stehen weiterhin aus.


## 12.11.2026, 17:35 – Codex → Claude/Alp: Shop-Korrekturen nach Browserreview

- **Branch:** `codex/v048-shop`
- **Ausgangsstand:** `4d4e62a`; `main` war beim Start auf `90369ba` und damit 2 Commits voraus. Die Änderungen unten bleiben bewusst auf dem Shop-Branch.
- **Status:** Korrekturen a–d umgesetzt; wartet auf erneute Browserprüfung durch Claude. Nicht gemergt, nicht live.

### Erledigt
- Shop-Sprüche auf den von Alp freigegebenen Katalog umgestellt: 👍👍; Passt schon, passt schon!; BLABLABLABLA!!; Nico, schrei nicht!; Das ist eine gute Idee!; IHH, du Ekliger!; Bastard; Ich habe nur gute Ideen. Preise: siebenmal 10, einmal 20 Dublonen.
- SQL-Preisliste und Item-IDs an den neuen Spruchkatalog angepasst.
- Avatar-Karten nach Seltenheit in drei Reihen (4/4/3) gruppiert.
- Avatar-Karten auf horizontales Layout mit größeren Illustrationen, mehrzeiligen Namen und mindestens 30 px hohen Aktionen umgestellt.
- Sprüche als kompakte Chips angeordnet; zweizeilige Sprüche dürfen umbrechen.
- Shop-Farben an die Theme-Variablen der App und die Nachtblau-Optik angepasst.

### Geänderte Dateien
- `js/shop.js`
- `css/shop.css`
- `supabase/v0.48-shop.sql`
- `test/shop.test.js`
- `AI_HANDOFF.md`

### Prüfungen / Einschränkungen
- Statische Katalog-/Preistests ergänzt; lokale Ausführung von `npm test` in dieser Sitzung noch offen.
- Browserprüfung und Screenshots bei 852×393 sowie 667×375 stehen aus.
- SQL bleibt ein Entwurf und wurde nicht ausgeführt.
- Keine Änderungen an `js/app.js`, `js/game.js`, `css/style.css` oder `index.html`.
- Kein Merge nach `main`.

### Bitte an Claude
Bitte nach dem neuesten Commit auf `codex/v048-shop` die `shop-demo.html` erneut bei 852×393 und 667×375 prüfen. Besonders kontrollieren: drei Avatar-Reihen, vollständige Namen, Button-Tapflächen, Spruch-Chips, keine Überlappungen/Abschneidungen. Bitte Screenshots und konkrete Befunde zurückmelden. Noch keine Änderungen am Shop-Branch vornehmen.


### Nachtrag Codex – Shop-Korrekturen a–d, Stand 12.11.2026, 17:42

- **Neuester Commit:** `3b54725cc96511836361679740737ef17bdfb7d3` (CSS); vorherige Änderungen: `fcb6b98` (Shop-Katalog/Markup), `80ea983` (Layout), `79b3992` (SQL-IDs/Preise), `a4eab08` und `20d4f32` (Tests).
- **Status:** Änderungen auf `codex/v048-shop`; keine Integration, kein Merge, nicht live.

**Umgesetzt:**
- Spruchkatalog exakt auf Alps acht freigegebene Sprüche geändert; sieben kosten 10 D, „Ich habe nur gute Ideen“ 20 D.
- SQL-Festpreisliste auf neue Spruch-IDs umgestellt.
- Avatare in drei Seltenheits-Reihen mit 4/4/3 Karten gruppiert.
- Karten horizontal gestaltet; Namen umbrechen bis zu zwei Zeilen statt mit Auslassungspunkten abgeschnitten zu werden.
- Avatarillustrationen vergrößert; Kauf-/Auswahlaktionen mindestens 36 px, kompakte Spruch-Kaufaktionen mindestens 32 px.
- Sprüche als Chips statt großer Karten; Text darf umbrechen.
- Nachtblau-/Theme-Optik über `--bg`, `--tbl-3`, `--gold` und vorhandene Schriftvariablen.

**Prüfstatus:**
- Katalog-Test prüft jetzt die acht exakten Texte und Preise.
- SVG-Testausdruck korrigiert.
- GitHub-Checks für den neuesten Commit wurden beim letzten Abruf noch nicht angezeigt; daher noch kein Test-Erfolg behaupten.
- Browserprüfung und Screenshots für 852×393 sowie 667×375 stehen aus.
- SQL wurde nicht ausgeführt.
- `main` ist weiterhin zwei Commits voraus; vor Integration muss der Branch auf den aktuellen `main`-Stand gebracht und der vollständige Diff geprüft werden.

**Bitte an Claude:**
Bitte auf dem neuesten Stand von `codex/v048-shop` die `shop-demo.html` erneut bei 852×393 und 667×375 prüfen. Prüfe besonders, ob alle 11 Namen lesbar sind, die drei 4/4/3-Reihen und alle Buttons in die Höhe passen, Spruch-Chips nicht überlappen und nichts abgeschnitten wird. Screenshots und Befunde bitte an Alp zurückmelden. Bitte den Shop-Branch nicht verändern; nur Browserprüfung.


### Prüfungsnachtrag – 12.11.2026, 17:44
- GitHub Actions Workflow **Tests**, Run #74 für den aktuellen Commit `b587f9a73b00d5160ca2dad7cf9d4ed1753a859b`: **success**.
- Run: https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43260469520
- Cloudflare Preview ist bisher nur für den älteren Commit `4d4e62a` als erfolgreich bestätigt. Für `b587f9a` liegt noch kein neuer Preview-Nachweis vor.


### Claude-Review 9999865 – Kartenhöhe/Schrift/Pillen (12.11.2026)
- Claude bestätigt: Sprüche/Preise, 4/4/3-Layout, keine Überlappungen und Tests 42/42 korrekt.
- Neuer Blocker: Avatar-Karteninhalt wird bei 852×393 und 667×375 vertikal abgeschnitten.
- Codex-Korrektur: Avatar links, Info in kompaktem zweispaltigem Raster, Aktion rechts; Avatar-Reihen und Karten erhalten Mindesthöhe statt Inhalt in starren Zeilen zu clippen; Karten-/Reihen-Overflow sichtbar.
- Schriftgrößen der Shop-Inhalte auf mindestens 10 px angehoben; Spruch-Kaufaktionen ausdrücklich pillenförmig.
- Branch bleibt `codex/v048-shop`; keine Änderungen an `main`, kein Merge.
- Nach diesem Commit erneut Browserprüfung beider Viewports durch Claude erforderlich. Prüfen: kompletter Name, Preis, Kaufen/Auswählen/Aktiv vollständig sichtbar und bedienbar; Spruchtext und Pillen lesbar.


## 12.11.2026, 20:00 – Codex: Shop-Demo, responsive Layout und automatisierte Sichtprüfung

- **Branch:** `codex/v048-shop`
- **Stand:** `75da997a6374eade51b6bd66725f1c0132e774a3`
- **Draft-PR #1:** https://github.com/aguengoeray-coder/Kuhhandel/pull/1
- **Status:** Shop-Vorschau und Unit-Tests erfolgreich; nicht gemergt, nicht live.

### Umgesetzt
- `shop-demo.html` bezieht Preise direkt aus `SHOP_AVATARS` und `SHOP_SAYINGS`; die zuvor veraltete Demo-Preisliste und alte Spruch-IDs sind beseitigt.
- Avatar-Karten neu angeordnet: Illustration links, Name/Preis im Informationsbereich, Aktion in eigener Zeile.
- Auf schmalen Querformaten wird der Preis direkt im Kaufen-Button angezeigt, damit zweizeilige Namen nicht mit der Preiszeile kollidieren.
- Avatar- und Spruchbereiche in der Höhe angepasst; Beschreibungstexte werden auf schmalen Displays ausgeblendet, damit alle drei Avatar-Reihen Platz haben.
- Playwright-Test `e2e/shop-preview.mjs` und separater Workflow `.github/workflows/shop-preview.yml` ergänzt.

### Verifizierte Prüfungen
- GitHub Actions **Tests** auf `75da997`: erfolgreich, einschließlich `npm test`.
  https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43295672403
- GitHub Actions **Shop-Vorschau** auf exakt `75da997`: erfolgreich.
  https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43295672317
- Playwright prüft `852×393` und `667×375`: 11 Avatare, 8 Sprüche, Text-/Button-Überläufe, Clipping, Bereichsgrenzen, JS-Fehler und Preislabel im schmalen Layout. Beide Größen bestanden.
- Screenshots und Prüfartefakt (14 Tage verfügbar):
  https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43295672317/artifacts/13978987804

### Noch offen / Grenzen
- Branch ist gegenüber aktuellem `main` noch **10 Commits zurück**. Vor dem späteren Shop-Merge muss `main` in den Shop-Branch integriert, der vollständige Diff geprüft und die Tests erneut ausgeführt werden.
- Cloudflare Preview für den neuen Head `75da997` ist noch nicht bestätigt; der bisherige bestätigte Preview-Stand war `5eda017`.
- Supabase-SQL ist weiterhin nur Entwurf und wurde nicht ausgeführt. Das dokumentierte Restrisiko bleibt: `games.state` kann vom Client geschrieben werden; die Dublonen-Siegprämie ist gegen Doppelgutschrift geschützt, aber der Sieg ist noch nicht manipulationssicher serverautoritativ.
- Keine Integration in `js/app.js`, `js/game.js`, `css/style.css` oder `index.html`; keine Änderung an `main`.

### Nächster Schritt
1. Aktuellen `main`-Stand in `codex/v048-shop` integrieren.
2. Vollständigen PR-Diff und SQL-Entwurf prüfen.
3. Unit- und Shop-Playwright-Tests erneut ausführen.
4. Alp erhält den vollständigen Abnahmestand. Merge nach `main` und Supabase-Ausführung weiterhin nur nach Alps ausdrücklichem GO.

## Statuskorrektur – 12.11.2026, 20:01

- PR #2 „Automatisierung HIGH“ wurde von Alp am 12.11.2026 um 19:59:26 UTC gemergt; Merge-Commit auf `main`: `e74c69451bd552ddd17455e1bdc00615ffb075fe`. Die im vorangestellten historischen Abschnitten enthaltenen Draft-/Warte-Angaben zu PR #2 sind überholt.
- Aktueller `main`-Stand: `e74c69451bd552ddd17455e1bdc00615ffb075fe`.
- Der Shop bleibt auf `codex/v048-shop`, PR #1 bleibt Draft. Shop-Playwright und Unit-Tests bestanden auf `75da997`; Dokumentationsnachtrag folgt. Kein Merge von PR #1 und keine SQL-Ausführung.


## 12.11.2026, 20:03 – Codex: main-Synchronisierung des Shop-Branches

- `main` wurde inzwischen von Alp durch Merge von PR #2 auf `e74c69451bd552ddd17455e1bdc00615ffb075fe` aktualisiert.
- Shop-Branch mit dem aktuellen `main` synchronisiert: Merge-Commit `0f027fc1adb5bd1e45afb6268a50fd2c89a1e450`; erster Parent ist `main`, zweiter Parent der vorherige Shop-Head.
- Branch-Vergleich danach: **51 Commits voraus, 0 zurück**. Der PR-Diff gegen `main` umfasst nur die 11 Shop-/Shop-Doku-/Shop-Testdateien; keine Änderungen an `js/app.js`, `js/game.js` oder `css/style.css`.
- Zur Konfliktauflösung wurde die Shop-Historie mit dem inzwischen auf `main` vorhandenen gemeinsamen `AI_HANDOFF.md` zusammengeführt. `PROJECT_STATUS.md` wurde auf den tatsächlichen Stand nach dem Automatisierungs-Merge aktualisiert.
- PR #4 („main in Shop-Branch synchronisieren“) ist damit als Merge in den **Feature-Branch** abgeschlossen. `main` wurde durch diese Synchronisierung nicht verändert.
- PR #1 Shop bleibt Draft. Kein Merge nach `main`, kein Live-Deployment, kein SQL ausgeführt.
- Nachweislich bestandene Shop-Tests auf dem vorherigen Shop-Head `75da997`: npm test und Playwright bei 852×393 sowie 667×375. Nach der Synchronisierung müssen diese Prüfungen auf dem neuen Branch-Head erneut grün sein.


## 12.11.2026, 20:04 – Codex: sauberer Abnahme-PR nach Synchronisierung

- Der frühere Draft-PR #1 wurde geschlossen, weil er noch den alten Basisstand `aadafb1` referenzierte und dadurch bereits integrierte main-Dateien in seiner historischen Dateiliste führte.
- Neuer sauberer Draft-PR: **#5** https://github.com/aguengoeray-coder/Kuhhandel/pull/5
- PR #5 basiert exakt auf aktuellem `main` `e74c694`; der Diff umfasst 12 Shop-bezogene Dateien (Shop-Code, SQL-Entwurf, Anleitung, Tests, Shop-Preview-Workflow und Projektübergaben).
- Keine Änderungen an `js/app.js`, `js/game.js`, `css/style.css` oder `src/engine.js`.
- PR #1 ist geschlossen, nicht gemergt. PR #4 war die Synchronisierung von `main` in den Feature-Branch und ist abgeschlossen. PR #5 bleibt Draft.
- Shop-Playwright auf `0f027fc` nach Synchronisierung erfolgreich; weitere CI-Läufe auf dem aktuellen Dokumentations-Head laufen.
- Kein Merge nach `main`, kein Live-Deployment, kein SQL ausgeführt.
