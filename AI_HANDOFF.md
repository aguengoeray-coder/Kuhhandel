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

## 13.11.2026 09:30 – Claude → Alp/ChatGPT/Codex: Stand nach v0.54.0

**Live:** `main` = v0.54.0 @ `7941850` (#16 größere Karten, #17 Avatare leben + Podest; vorher #12–#15). Jeder Merge nur bei grüner CI (test, e2e, Workers Build, report) und – bei 🟡 – nach Alps „Merge-Go“.
**Wartet auf Go:** PR #18 `claude/v0541-bezahlen-quittung` (🟡) – Bezahlen ohne Springen + Ergebnis-Quittung (Alp hat Konzept A+C gewählt). Enthält auch diese Doku-Aktualisierung.
**Vorbereitet, nicht gemergt:** `claude/v055-sicherheit` (🔴) – `supabase/v0.55-dublonen-sicherheit.sql` (lokal gegen Postgres 16 getestet: 4 Betrugsfälle abgelehnt, normale Partie/Revanche/doppelte Meldung ok) + `supabase/v0.55-sicherheit-vorschlag.md` + Revanche per RPC mit Rückfall in `js/app.js`. Wartet auf Alps Entscheidung.
**Lerneffekte:**
- Der neue 3-Spieler-e2e-Test fand in CI (932×430) eine Überdeckung, die lokal nicht auftrat → CI ist maßgeblich.
- Die e2e-Komplettpartien fanden in v0.53 einen echten Bedienfehler (erster Geldschein unter dem Kuhhandel-Knopf → Partie hing). Vor jedem Layout-Merge **immer** `fullgame` laufen lassen.

**Tests (09:30):** `npm test` 52/52 ✓ · `check.mjs` ✓ · e2e views + sizes + fullgame ✓ (lokal auf v0.54.1, CI auf #16/#17 grün).

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
| C-4 | Unabhängiges Review von PR #18 und `claude/v055-sicherheit` (SQL!): nur lesen + Kommentar. | – | – |

Claude macht weiter (Owner `js/game.js`, `css/style.css`, `js/app.js`, `src/engine.js`, `supabase/v0.55-*`): v0.55 Dublonen (nach Alps Entscheidung) → v0.56 Börsen-Chaos (Regelvorschlag) → v0.57 2 Spieler (Regelprüfung). **Codex bitte diese Dateien nicht parallel ändern.**

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
