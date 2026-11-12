# Aufträge – Team Rockets Tier Börse

Zentrale Schnittstelle zwischen **Alp** (Product Owner), **Claude** (Lead Feature Developer) und **Codex** (Technical Coordinator).
Diese Datei liegt nur auf dem Branch **`ai/auftraege`** – nie auf `main`.

## Spielregeln für diese Datei

- Alp spricht nur noch mit Claude. Claude schreibt Aufträge für Codex hier hinein.
- **„Check“** (Alp an Codex): `git fetch`, diese Datei lesen, den **obersten offenen Auftrag „→ Codex“** abarbeiten.
  Programmiert wird auf eigenen Branches; auf `ai/auftraege` wird **nur diese Datei** geändert.
- Ergebnis trägt der Bearbeiter **direkt unter dem Auftrag** im Abschnitt „Ergebnis“ ein:
  Status · Branch · Commit · Testergebnis (`npm test` + Link zum GitHub-Lauf, auch „Browser-Tests“) · offene Fragen.
- Status-Werte: `offen` · `in Arbeit` · `erledigt` · `blockiert` (mit Grund). „Erledigt“ nur, wenn die Abnahmekriterien nachweislich erfüllt sind.
- **Merge nur nach „Merge-Go #PR-NUMMER“ von Alp.** Ein allgemeines „Go“ oder „Check“ ist **keine** Merge-Freigabe.
- Kein Push auf `main` ohne Merge-Go. SQL wird nie selbst ausgeführt (Alp führt es aus). Keine Zugangsdaten/Secrets ins Repo.
- Nie gleichzeitig dieselbe Datei bearbeiten: Die erlaubten Dateien stehen im jeweiligen Auftrag.

## Aktueller Stand (12.11.2026, 21:20 – von Claude geprüft)

| | Stand |
|---|---|
| `main` / live | **v0.48.1** (`9e2f046`, Merge PR #8: Shop-Reiter, 💬-Emojis) – davor v0.48.0 Shop (`9549281`, PR #7) · `test` ✅ · `Workers Builds` ✅ · SQL `v0.48-shop.sql` von Alp ausgeführt (12.11. 22:00, „Success“) |
| PR #2 Automatisierung | ✅ gemergt (`e74c694`) |
| PR #3 Browser-/Layouttests | ✅ gemergt (`ca85106`) – Workflow „Browser-Tests“ läuft bei jedem PR |
| Shop v0.48.0 | **PR #5** (Draft, `codex/v048-shop`, 0 Commits hinter `main`) – **nicht** gemergt. PR #1 ist geschlossen (ersetzt durch #5). |
| Cloudflare-Vorschau | auf `claude/*`- und `codex/automation-high`-Branches war „Workers Builds“ rot; auf `codex/v048-shop` grün → ungeklärt |

---

## A-001 → Claude (übernommen von Codex) · Shop v0.48.0: Layout-Fehler beheben

**Status:** in Arbeit · Punkte 1–3 behoben, **neuer Punkt 4 offen** (siehe Zwischenprüfung)

**Aufgabe**
Claudes Layout-Check auf `shop-demo.html` (Stand `5eda017`) fand: 852×393: 17 · 667×375: 10 · 932×430: 1 · 800×360: 2 Fehler.
1. **Avatar-Karten bei 667×375:** „Kaufen · 30 D“ steht neben dem Namen und quetscht ihn auf 1–2 Buchstaben („O p..“, „Sp a..“); „Selten · 30 D“ bricht zeichenweise um; „✓ hast du“/„Aktiv“ überlagern Text.
   → Karte zweizeilig: oben Avatar + Name (max. 2 Zeilen) + Seltenheit · Preis, darunter Knopf über volle Breite („Kaufen“ ohne Preis oder nur „30 D“).
2. **Sprüche bei 852×393:** „Kaufen“-Knöpfe werden vom Rand von `article.shop-saying-item` abgeschnitten (8×). → Pille innerhalb der Karte, keine feste Höhe kleiner als der Knopf.
3. **Lange Namen bei 932×430 / 800×360:** „Gestresstes Business-Huhn“, „Spar-Schwein“ höher als das Namensfeld (46 > 23 px). → 2 Zeilen erlauben, keine feste Höhe (oder kürzer: „Business-Huhn“).
4. **NEU (Claude, 21:30, Stand `d0fbdea`): Spruch-Karten überlappen sich bei 852×393 (7 px) und 800×360 (4 px).** Die zweite Spruch-Reihe rutscht in die erste; die Karten sind niedriger als ihr zweizeiliger Text („Passt schon, passt schon!“, „Das ist eine gute Idee!“, „Ich habe nur gute Ideen“), Fußzeile klebt am Rahmen.
   → Spruch-Karten mit `min-height` statt fester Höhe bzw. Grid-Reihen `auto`; Abstand zwischen den Reihen ≥ 6 px; notfalls Sprüche-Bereich scrollbar statt gestaucht.
   Hinweis: Der automatische Check (`e2e/lib/checks.mjs`) erkennt Überlappung von Geschwister-Karten außerhalb des Spieltischs **noch nicht** – deshalb war „Browser-Tests“ trotzdem grün (wird mit A-005 ergänzt). Bitte bis dahin selbst per Screenshot in allen 4 Größen prüfen.

**Erlaubte Dateien / Branches**
`codex/v048-shop` (PR #5): `js/shop.js`, `css/shop.css`, `js/shopavatars.js`, `shop-demo.html`, `test/shop.test.js`, `e2e/shop-preview.mjs`, `.github/workflows/shop-preview.yml`, `supabase/v0.48-shop*.{sql,md}`, `PROJECT_STATUS.md`, `AI_HANDOFF.md`.

**Nicht erlaubt**
`js/app.js`, `css/style.css`, `js/game.js`, `src/engine.js`, `e2e/lib/**`, `e2e/views.spec.mjs`, `e2e/known-issues.json` (Shop dort **nicht** als bekannt eintragen). Kein Merge, kein SQL ausführen.

**Abnahmekriterien**
- [ ] „Browser-Tests“ (Job `e2e`) im PR #5 **grün** – prüft `shop-demo.html` in **852×393, 667×375, 932×430, 800×360** mit 0 neuen Fehlern.
- [ ] `npm test` grün.
- [ ] Lokal schneller: `npm install --no-save playwright@1.63.0 && npx playwright install chromium` · `E2E_ONLY=shop node --test e2e/views.spec.mjs` → Bericht + Screenshots in `e2e-report/`.
- [ ] Ergebnis hier eingetragen (Commit + Link zum grünen Lauf).
- [ ] Wenig reine Doku-Commits: Code + Doku in einem Commit pro Schritt; `[skip ci]` nicht auf Commits, die abgenommen werden sollen.

**Zwischenprüfung Claude (21:30, Stand `d0fbdea` = Code von `ffa9b90`)**
- „Browser-Tests“ auf `ffa9b90`: ✅ grün – https://github.com/aguengoeray-coder/Kuhhandel/actions/runs/43297050731
- Lokaler Layout-Check `shop-demo.html`: 0 Fehler in allen 4 Größen, keine Schrift < 10 px. Punkte 1–3 ✅ (Namen vollständig, Knöpfe unter dem Namen, nichts abgeschnitten).
- Sichtprüfung: Punkt 4 ❌ (Spruch-Karten überlappen bei 852×393 und 800×360). 667×375 und 932×430 ✅.
- Klein: Knopftext „Kaufen· 30 D“ (667 px) – Leerzeichen vor dem Punkt fehlt.

**Ergebnis**
**Status:** erledigt (Claude, 12.11. 21:55) · Alp: vorerst arbeitet nur Claude, Multi-Agent ab morgen.
Branch `claude/v048-shop` (aufbauend auf `codex/v048-shop` `d0fbdea`; Codex-Branch + PR #5 unverändert) · Commit `37e0049` · Draft-PR #7.
- `main` übernommen (v0.47.2 + Karten-Check). `css/shop.css`: Spruch-Reihen `auto` statt gestaucht, auf flachen Handys (≤ 440 px hoch) Sprüche-Bereich nach Inhalt + Unterzeile aus; „Kaufen · 30 D“ mit Leerzeichen.
- Shop lokal: 0 Fehler in allen 4 Größen (inkl. neuem Karten-Check) · `npm test` 48/48 · `node scripts/check.mjs` ✅.

---

## A-002 → Claude · Shop v0.48.0: Abnahme im Browser

**Status:** erledigt (Claude) – Abnahme in 4 Größen, Screenshots an Alp; ersetzt durch Einbau + Merge PR #7

**Aufgabe**
Neuesten Stand von PR #5 in den 4 Größen im Browser ansehen (Namen, Knöpfe, Spruch-Chips, Kaufen/Auswählen/Aktiv), Screenshots an Alp, Empfehlung für „Merge-Go #5“ oder Rückgabe an Codex mit konkreten Befunden.

**Erlaubt:** nur lesen/prüfen (Branch `codex/v048-shop` nicht verändern). Ergebnis hier eintragen.

**Abnahmekriterien:** Screenshots aller 4 Größen bei Alp · Befunde hier eingetragen.

**Ergebnis**
_(von Claude auszufüllen)_

---

## A-005 → Claude · Layout-Check: Überlappung von Karten überall erkennen

**Status:** erledigt · mit Merge-Go von Alp gemergt (`446540b`)

**Aufgabe**
`e2e/lib/checks.mjs` erkennt Überlappungen bisher nur am Spieltisch. Ergänzen: Geschwister-Elemente mit eigenem Rahmen/Hintergrund (Karten, Listeneinträge, Abschnitte), die sich um > 2 px überdecken, sind ein Fehler – auf allen Seiten (Startseite, Warteraum, Shop, Fenster).
Anlass: Spruch-Karten im Shop überlappten, „Browser-Tests“ war trotzdem grün (A-001 Punkt 4).

**Erlaubte Dateien / Branch:** `claude/e2e-karten`: `e2e/**`. **Nicht erlaubt:** Spiel-/UI-/Shop-Dateien.

**Abnahmekriterien:** Check findet die Spruch-Überlappung auf `d0fbdea` · `main` bleibt grün (keine Fehlalarme) · PR mit grünen Checks · Merge nur nach „Merge-Go #N“.

**Ergebnis**
**Status:** erledigt · Branch `claude/e2e-karten` · Commit `e7bc355` · **PR #6** (Draft)
- Neu in `e2e/lib/checks.mjs`: Karten/Kästen (eigener Hintergrund oder Rahmen, nicht absolut positioniert), die sich im selben Container > 2 px überdecken → Fehler `ueberlappung`. Spieltisch ausgenommen (eigene Prüfung).
- `main` (v0.47.2): 0 neue Fehler in allen 4 Größen → keine Fehlalarme. `npm test` 42/42, `node scripts/check.mjs` ✅.
- Gegenprobe Shop `d0fbdea`: findet genau die 8 Spruch-Überlappungen (852×393: 7 px, 800×360: 4 px).
- Wirkung für A-001: Sobald PR #6 in `main` ist und `codex/v048-shop` darauf gebracht wurde, wird „Browser-Tests“ im Shop-PR rot, bis Punkt 4 behoben ist. Codex kann es schon jetzt lokal prüfen: `e2e/lib/checks.mjs` aus `claude/e2e-karten` übernehmen (nur lesen, nicht committen) + `E2E_ONLY=shop node --test e2e/views.spec.mjs`.

---

## A-006 → Alp · Codex-Schreibzugriff (HTTP 404) wiederherstellen

**Status:** geklärt – GitHub-App „ChatGPT Codex Connector“ hat Lesen+Schreiben auf alle Repositories (Screenshot Alp 21:40). Ursache: Alp nutzt den normalen ChatGPT-Chat, dessen GitHub-Zugang nur lesen kann; Schreiben geht nur in Codex (nicht auf dem Handy verfügbar). Vorerst: ChatGPT nur lesend/prüfend.

**Befund (Claude, 12.11. 21:40)**
Codex bekam beim Ändern von `css/shop.css` auf `codex/v048-shop` und `AUFTRAEGE.md` auf `ai/auftraege` jeweils **HTTP 404**.
Geprüft:
- Repository `aguengoeray-coder/Kuhhandel` ist öffentlich; beide Branches existieren (`codex/v048-shop` = `d0fbdea`, `ai/auftraege` = dieser Commit).
- Kein Branch-Schutz, keine Rulesets – nichts im Repository blockiert Schreiben.
- Schreiben auf `ai/auftraege` funktioniert (Claude: Commits `b244c1b`, `e517c7d` und dieser).
- Codex' letzte erfolgreiche Pushes: `ffa9b90` (20:06 UTC) und `d0fbdea` (20:10 UTC) auf `codex/v048-shop` – eine Stunde vorher ging es also.

**Ursache (sehr wahrscheinlich)**
GitHub antwortet bei einem öffentlichen Repository mit **404 statt 403**, wenn die Anfrage zwar angemeldet ist, die verwendete Verbindung aber **keine Schreibrechte für dieses Repository** hat (oder abgelaufen ist).
Der Fehler liegt also in Codex' GitHub-Verbindung (Berechtigung/Anmeldung), nicht im Repository oder in den Branches.
Typisch: Die genutzte Verbindung darf nur lesen, oder `Kuhhandel` ist in ihrer Repository-Auswahl nicht (mehr) freigegeben, oder eine Berechtigungsänderung wartet auf Bestätigung.

**Was Alp prüfen muss (Schritt für Schritt)**
1. github.com → oben rechts Profilbild → **Settings** → links **Applications** → Reiter **Installed GitHub Apps**.
2. Die App von ChatGPT/Codex suchen (Name enthält „ChatGPT“ oder „Codex“) → **Configure**.
3. Falls oben ein gelber Hinweis „…is requesting updated permissions“ steht → **Review request** → **Accept**.
4. Unter **Repository access**: „All repositories“ **oder** „Only select repositories“ mit **Kuhhandel** in der Liste → **Save**.
5. Unter **Permissions** prüfen: *Contents* = **Read and write**, *Pull requests* = **Read and write**.
6. In ChatGPT/Codex die GitHub-Verbindung einmal **trennen und neu verbinden**, damit eine frische Anmeldung genutzt wird.
7. Danach Codex mit „Check“ starten. Codex soll als Erstes eine Zeile unter „Nachweis“ eintragen und pushen.

**Nachweis (von Codex auszufüllen):** Commit auf `ai/auftraege` + Commit auf `codex/v048-shop` (z. B. der CSS-Fix aus A-001).

---

## A-003 → Codex · Cloudflare-Vorschau für Branches klären

**Status:** offen

**Aufgabe**
„Workers Builds: kuhhandel“ war auf `claude/v0471-start-symmetrie` (`ef8f8cc`), `claude/e2e-layout` und `codex/automation-high` **rot**, auf `codex/v048-shop` grün (dort `"previews": {}` in `wrangler.jsonc`?). Ursache finden und eine Lösung vorschlagen, damit jeder Branch eine funktionierende Vorschau-Adresse bekommt.
Wenn Einstellungen im Cloudflare-Dashboard nötig sind: **Schritt-für-Schritt-Anleitung für Alp** hier eintragen – Alp stellt sie selbst ein.

**Erlaubte Dateien:** eigener Branch `codex/preview-fix`: `wrangler.jsonc`, `.assetsignore`, Doku. **Nicht erlaubt:** Secrets, Änderungen an Spiel-/UI-Dateien, Merge ohne Merge-Go.

**Abnahmekriterien:** Ursache benannt · auf einem Test-Branch „Workers Builds“ grün **und** Vorschau-Adresse geöffnet (Link hier eintragen).

**Ergebnis**
_(von Codex auszufüllen)_

---

## A-004 → Codex · v0.48.0 Integration: Shop in die App einbauen

**Status:** erledigt (Claude, PR #7, live `9549281`) – Shop-Knopf, Dublonen neben dem Namen, Shop-Avatar überall (neue SQL-Funktion `shop_public_avatars`), gekaufte Sprüche im 💬-Menü. PR #5 (Codex) ist damit überholt und kann geschlossen werden.

**Aufgabe (Entwurf, wird vor Start mit Alp abgestimmt)**
Startseite: Dock-Knopf „Shop“ öffnet `renderShop` (statt Hinweis „Shop kommt mit dem nächsten Update“), Dublonen-Anzeige, gekaufter Avatar am Tisch, Sprüche im 💬-Menü. SQL `supabase/v0.48-shop.sql` mit Schritt-für-Schritt-Anleitung für Alp.

**Erlaubte Dateien:** werden beim Start festgelegt. Claude bearbeitet währenddessen **nicht** `js/app.js` / `css/style.css`.

**Abnahmekriterien:** `npm test` + „Browser-Tests“ grün · Screenshots · SQL-Anleitung · CHANGELOG + `APP_VERSION`/`version.json` = 0.48.0 · Merge nur nach „Merge-Go #5“.

**Ergebnis**
_(offen)_

---

## Erledigt (Archiv, kurz)

- 12.11. v0.48.1 Shop-Reiter + große Produktkarten, 💬-Menü mit Emojis, neue Sprechblasen – live (`9e2f046`), Claude

- 12.11. v0.48.0 Shop – live (`9549281`), Claude (aufbauend auf Codex' Shop-Modul + SQL)
- 12.11. PR #6 Layout-Check Karten – gemergt (`446540b`), Claude

- 12.11. v0.47.1 Startseite symmetrisch – live (`0c049e1`), Claude
- 12.11. PR #3 Browser-/Layouttests – gemergt (`ca85106`), Claude
- 12.11. v0.47.2 Warteraum + Kuhhandel-Auswahl auf flachen Handys – live (`7588653`), Claude
- 12.11. PR #2 Automatisierung (Doku, CI, PR-Bericht) – gemergt (`e74c694`), Codex
