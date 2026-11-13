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

## 13.11.2026 16:10 – Claude → Alp/ChatGPT/Codex: Stand nach v0.58.0
Branch: `claude/v058-charaktere` → `main` · Commit: `5f621ad` · PR: #24 (enthält #23) · Stufe: 🟡 (Alps „Go“ 16:00)
Dateien: `js/shopavatars.js`, `js/shop.js`, `css/shop.css`, `js/app.js`, `js/game.js`, `css/style.css`, `supabase/v0.58-neue-charaktere.sql`, `test/shop.test.js`, `e2e/fullgame.spec.mjs`, CHANGELOG/Version/whatsnew
Tests: npm test 55/55 ✓ · check.mjs ✓ · e2e views + sizes + fullgame ✓ (lokal + CI auf PR-Kopf `43f9ace`) · Workers Build auf `main` ✓
SQL: `v0.58-neue-charaktere.sql` von Alp ausgeführt (Connector getrennt), Prüfabfrage ✓ (shop_claim_free da, Preisliste/Avatare neu, `price >= 0`). Rückweg: v0.49 erneut + `drop function public.shop_claim_free(text);`
Lerneffekt: Der „hängende Countdown“ in `spiel3-spaet` war ein langes Bietgefecht der Test-Spieler (jedes Gebot startet die Uhr neu), kein Spielfehler – die Hänger-Erkennung zählt jetzt das Höchstgebot mit.
Offen: Advisors-Vorschlag (wartet auf Alp) · Börsen-Chaos-Regelvorschlag · 2-Spieler-Regelprüfung.
Nächster Schritt / wer: Claude – Regelvorschlag Börsen-Chaos an Alp. Codex-Aufgaben C-1 bis C-4 siehe Archiv-Eintrag 13.11. 09:30 (weiter offen).
