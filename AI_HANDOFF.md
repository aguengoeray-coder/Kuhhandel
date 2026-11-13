# AI_HANDOFF.md – offene Übergaben

Nur **offene** Übergaben stehen hier, die neueste oben. Erledigtes wandert nach `AI_HANDOFF_ARCHIV.md`.
Vor jeder Arbeit: `AGENTS.md` (Ampel!), `PROJECT_STATUS.md`, dann diesen Eintrag lesen und `git log origin/main` prüfen.

### Vorlage für neue Einträge
```
## TT.MM.JJJJ HH:MM – <von> → <an>: <Thema>
Branch: …  ·  Commit: …  ·  PR: #…  ·  Stufe: 🟢/🟡/🔴
Dateien: …
Tests: npm test ✓/✗ · check.mjs ✓/✗ · e2e (views/sizes/fullgame) ✓/✗ · CI-Lauf: <Link>
Offen: …
Nächster Schritt / wer: …
```

---

## 13.11.2026 07:00 – Claude → Codex/Alp: Stand nach v0.52.2, Übergabe für morgen

**Live:** `main` = v0.52.2 @ `79f896d` (PRs #12 Ganzkörper-Avatare, #13 Geld über die Mitte, #14 Feinschliff – alle CI grün, gemergt nach Ampel).
**In Arbeit:** `claude/v053-grosse-karten` (🟡, Claude) – Tierreihe neben dem Fächer, größere Mitte.
**Lerneffekt:** Der neue 3-Spieler-e2e-Test fand in CI (932×430) eine 3-px-Überdeckung Stapel × Tierreihe, die lokal nicht auftrat → CI-Ergebnis ist maßgeblich, nicht nur der lokale Lauf.
**Prozess-Branch:** `claude/v0512-prozess` – Ampel in `AGENTS.md`/`CLAUDE.md`, dieses Dokument, Archiv, `PROJECT_STATUS.md` neu, `check.mjs` (+„Was ist neu“, AGENTS=CLAUDE), `tests.yml` mit `concurrency` (keine Doppelläufe bei PR-Pushes).

**Tests (13.11.):** `npm test` 52/52 ✓ · `check.mjs` ✓ · e2e views + sizes + fullgame ✓ (v0.52.1, auch CI grün).

### So mergt eine KI (Ampel 🟢 oder nach Alps Go)
1. PR-Kopf: test, e2e, Workers Build, report grün (`gh api repos/aguengoeray-coder/Kuhhandel/commits/<sha>/check-runs`).
2. `git diff origin/main...<branch>` vollständig lesen.
3. Merge über die GitHub-API (funktioniert auch mit Branch-Schutz):
   `gh api -X PUT repos/aguengoeray-coder/Kuhhandel/pulls/<n>/merge -f merge_method=merge`
4. Danach Screenshots + kurzer Bericht an Alp, `PROJECT_STATUS.md` aktualisieren.

### Aufgaben für Codex (je eigene Branch `codex/…`, Dateien nur wie angegeben)
| # | Aufgabe | Dateien | Stufe |
|---|---|---|---|
| C-1 | Demos 3-spieler-fest machen: `auction`, `cantpay`, `cantpaymany`, `rat`, `ratme`, `batzenshow`, `rps`, `rpsshow` sollen mit `?p=3` laufen (u4/Mo nur nutzen, wenn vorhanden). Danach in `e2e/views.spec.mjs` die 3-Spieler-Liste erweitern. | `js/demo.js`, `e2e/views.spec.mjs` | 🟢 |
| C-2 | Branch-Schutz-Anleitung für Alp prüfen (unten) und nach seiner Einrichtung den Status hier eintragen. | `AI_HANDOFF.md` | 🔴 Alp klickt |
| C-3 | Alte, gemergte Branches auflisten (z. B. `v0.2x-…`, `kartenflug`, `codex/v048-shop`) und Alp eine Lösch-Liste vorlegen. **Nicht selbst löschen.** | – | 🔴 |
| C-4 | Review von Claudes v0.53-PR (größere Karten), sobald er da ist: nur lesen + Kommentar. | – | – |

Claude macht weiter (Owner `js/game.js`, `css/style.css`, `js/app.js`, `src/engine.js`): v0.53 größere Karten → v0.54 Avatare leben + Siegerehrung → v0.55 Dublonen-SQL → v0.56 Börsen-Chaos → v0.57 2 Spieler. **Codex bitte diese Dateien nicht parallel ändern.**

### Branch-Schutz für `main` – Anleitung für Alp (nur erklären, nicht selbst einstellen)
GitHub → Repo **Kuhhandel** → **Settings** → **Branches** (bzw. **Rules → Rulesets**) → **Add branch ruleset**:
1. Name `main schützen`, Enforcement **Active**, Target: **Default branch**.
2. ✅ **Restrict deletions**, ✅ **Block force pushes**.
3. ✅ **Require a pull request before merging** – Required approvals **0** (sonst kann niemand allein mergen).
4. ✅ **Require status checks to pass** → Checks hinzufügen: `test`, `e2e` (und optional `Workers Builds: kuhhandel`). ✅ „Require branches to be up to date“ **aus** lassen (spart Doppelläufe).
5. Bypass-Liste leer lassen. Speichern.
Folge: Niemand (auch keine KI) kann mehr direkt auf `main` pushen; Merges nur über PR mit grünen Prüfungen – passt zur Ampel.

### Offene Punkte
- 3-Spieler-Demos (C-1) sind reine Demo-Grenze, kein Spielfehler.
- Dublonen-Manipulationsschutz (Tagesgrenze) kommt mit v0.55.
- `ai/auftraege` (`AUFTRAEGE.md`) ist durch `PROJECT_STATUS.md` Abschnitt 5 ersetzt; Branch kann nach Alps Okay gelöscht werden.
