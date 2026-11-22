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

## 21.11.2026 15:30 – Claude → Alp/ChatGPT/Codex: v0.72–v0.84 live, Layout-Befund

- Live: v0.84.0 (`main` 88caf99, #59). Gemergt seit dem letzten Eintrag: #48–#59 (siehe `PROJECT_STATUS.md`).
- SQL ausgeführt (Connector): `v0.80-avatar-ablegen.sql`, `v0.84-kasse.sql`; Prüfabfragen + Advisors ohne neue Befunde.
- 21.11. abends: Zu zweit Esel-Bonus + Geld beim Aufteilen sichtbar (engine `receiveCard`/`divideChoose`/`viewFor`, Test angepasst), Aufdeck-Animation mit `--rd` (negative Verzögerung) gegen Neustart beim Neuzeichnen. Tests: npm 80/80, check, e2e views/sizes/duo grün.
- 21.11. 19:30: v0.85 live (#60, Workers-Build ✓), `v0.85-kasse-rechte.sql` ausgeführt (authenticated nur SELECT, Advisors ohne neue Befunde). v0.86 auf `claude/v086-feinschliff` (Alps Go 19:00): Knöpfe groß, Emojis in Überschriften, `cheapWin` „Sehr günstig!“, `wantText` Ratte, `.qemo` Schnell-Emojis (`ctx.quickEmoji`).
- Hinweis: In `game_results` steht noch kein Ergebnis – bei der ersten echten Partie prüfen, ob Ergebnis, Dublonen und Kasse gebucht werden.

## 20.11.2026 00:10 – Claude → Alp/ChatGPT/Codex: v0.68–v0.71
Branch: `claude/v071-feinschliff` (baut auf `claude/v070-choreo` auf)  ·  PR: #44 ✓, #45 ✓ live, #46 (v0.70) in Prüfung  ·  Stufe: 🟢 (Alps Go 19.11.)
Dateien: `js/game.js` (Choreografie: `homeWalk`, Ziele `@cash:`/`@stall:`/`@tpot` in `seatPoint`), `src/engine.js` (Hype/Blase, `applyKurs`), `css/style.css`, `js/demo.js` (`traderesult&pop=1`, `traderespond&pop=1`, `boerse&top=news|money`)
Tests: npm test 68 ✓ · check.mjs ✓ · e2e über GitHub
Offen: echte Partien spielen; danach Balance Börsen-Chaos; Shop-Ideen (Accessoires, Haustiere, Abzeichen) brauchen Preise von Alp.

## 14.11.2026 03:30 – Claude → Alp/ChatGPT/Codex: v0.61.1 + v0.62.0 + v0.63.0 live
Branch: `claude/v063-intros` (enthält `claude/v0611-muskel-esel`, `claude/v062-lebendig`) · PR #34 · Merge `29709f8` · Stufe 🟡 (Alps „Go“ 02:56)
Dateien: `js/game.js` (muscleDonkey, aliveGag, encounterHtml/INTRO_MS, Spitzenreiter/Spotlight, Finale), `css/style.css`, `js/app.js` (Intros aus, eigener Spruch, PUNCH_COOLDOWN 5 s), `js/shop.js`/`css/shop.css` (SHOP_CUSTOM), `src/engine.js` (KURS_PCTS + Gewichte), `js/demo.js`, Tests/e2e, `supabase/v0.63-eigener-spruch.sql`
SQL: v0.63 über Connector ausgeführt; Prüfung ✓ (Preis, 2 Funktionen, RLS an, kein Direktzugriff, anon gesperrt). Rückweg in der Datei.
Tests: npm test 64/64 ✓ · check.mjs ✓ · e2e views + sizes ✓ lokal, fullgame ✓ CI · Workers Build auf `main` ✓ · vor dem Merge 0 laufende Partien
Offen: Alps Antwort zur erweiterten Ampel · Börse nach echten Partien nachjustieren · 2-Spieler-Regelprüfung.

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
- 22.11. vormittags: v0.89+v0.90 live (#65 gemergt, Workers ✓, #64 darin enthalten und geschlossen). v0.91 Kuh-Kiste auf `claude/v091-outfits` (#66): wartet auf Alps „Merge-Go #66“; danach `supabase/v0.91-kuhkiste.sql` über den Connector, Prüfabfrage + Advisors. e2e: Harness bietet als Führender nicht mehr gegen sich selbst.
- 22.11. 10:10: Alps Go → #66 gemergt, Workers ✓, `supabase/v0.91-kuhkiste.sql` per Connector ausgeführt (Migration `v091_kuhkiste`). Prüfung: 28 Teile im Pool, authenticated nur SELECT, anon darf keine Kiste öffnen; Advisors ohne neue Befunde-Art (gleiche Hinweise wie bestehende Shop-Tabellen). Rekordhalter aktuell: Krone Bennetto (34), Rattenschwanz KlaererSil (8), Geldregen noch niemand (Geld wird erst ab v0.91 gespeichert).
