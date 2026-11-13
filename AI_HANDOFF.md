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

## 13.11.2026 21:25 – Claude → Alp/ChatGPT/Codex: v0.59.1 + v0.60.0 Börsen-Chaos live
Branches: `claude/v0591-groessere-tiere` (#28, 🟢 Alps „Ja mach B“) · `claude/v060-boersen-chaos` (#29, 🟡 Alps „Merge go“ 21:17) · Commit `3153ccf`
Dateien: `src/engine.js` (NEWS_PREFIX, applyNews, kursValue, isBoerse, Hektik, viewFor-Schwärzung), `js/game.js` (newsReveal, kursZettel, KURSE/aval), `js/app.js` (Schalter Warteraum/Testspiel, Debug „news“, Regeltext), `js/bots.js`, `js/debug.js`, `js/demo.js` (`?demo=news&k=…`, `?demo=boerse`), `css/style.css`, Tests/e2e
Regeln (Alp): Steuerprüfung = höchster Schein; Kurse ±50 % je Karte, addieren sich, nie unter 0; nie zusammen mit Turbo.
Tests: npm test 61/61 ✓ · check.mjs ✓ · e2e views + sizes + fullgame (inkl. `boerse4-anfang`) ✓ lokal + CI · Workers Build auf `main` ✓ · vor beiden Merges 0 laufende Partien
Offen: Supabase-Advisors (wartet auf Alp) · 2-Spieler-Regelprüfung · Börsen-Chaos nach ersten echten Partien nachjustieren (Stärke Steuer/Hektik).

## 13.11.2026 19:40 – Claude → Alp/ChatGPT/Codex: v0.59.0 „Dein Platz“ live
Branch: `claude/v059-dein-platz` → `main` · Commit: `7f7ea7a` · PR: #26 · Stufe: 🟡 (Alps „Merge-Go #26“ 19:31)
Dateien: `js/game.js` (Hand mit festen Fächern `SLOTS`, Regal `SHELF_MAX`, `mouthBubbles`), `css/style.css` (Block „v0.59“ am Ende), `e2e/lib/checks.mjs` (Ergebnis-Fenster samt Inhalt obenauf), Version/CHANGELOG/whatsnew
Tests: npm test 55/55 ✓ · check.mjs ✓ · e2e views + sizes + fullgame ✓ (lokal + CI) · Workers Build auf `main` ✓ · vor dem Merge: 0 laufende Partien
Hinweis: Bühnen-Koordinaten im Tisch (`.gtable`) beginnen bei x = 20 (wichtig für absolute Positionen wie `.myglow`).
Offen: Supabase-Advisors (anon von admin_*, Passwort-Leak-Schutz) – wartet auf Alp · Börsen-Chaos-Regelvorschlag · 2-Spieler-Regelprüfung.

## 13.11.2026 16:10 – Claude → Alp/ChatGPT/Codex: Stand nach v0.58.0
Branch: `claude/v058-charaktere` → `main` · Commit: `5f621ad` · PR: #24 (enthält #23) · Stufe: 🟡 (Alps „Go“ 16:00)
Dateien: `js/shopavatars.js`, `js/shop.js`, `css/shop.css`, `js/app.js`, `js/game.js`, `css/style.css`, `supabase/v0.58-neue-charaktere.sql`, `test/shop.test.js`, `e2e/fullgame.spec.mjs`, CHANGELOG/Version/whatsnew
Tests: npm test 55/55 ✓ · check.mjs ✓ · e2e views + sizes + fullgame ✓ (lokal + CI auf PR-Kopf `43f9ace`) · Workers Build auf `main` ✓
SQL: `v0.58-neue-charaktere.sql` von Alp ausgeführt (Connector getrennt), Prüfabfrage ✓ (shop_claim_free da, Preisliste/Avatare neu, `price >= 0`). Rückweg: v0.49 erneut + `drop function public.shop_claim_free(text);`
Lerneffekt: Der „hängende Countdown“ in `spiel3-spaet` war ein langes Bietgefecht der Test-Spieler (jedes Gebot startet die Uhr neu), kein Spielfehler – die Hänger-Erkennung zählt jetzt das Höchstgebot mit.
Offen: Advisors-Vorschlag (wartet auf Alp) · Börsen-Chaos-Regelvorschlag · 2-Spieler-Regelprüfung.
Nächster Schritt / wer: Claude – Regelvorschlag Börsen-Chaos an Alp. Codex-Aufgaben C-1 bis C-4 siehe Archiv-Eintrag 13.11. 09:30 (weiter offen).
