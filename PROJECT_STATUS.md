# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand: 21.11.2026, 15:30 Uhr · Repository `aguengoeray-coder/Kuhhandel` · Live: https://kuhhandel.a-guengoeray.workers.dev

> Maßgeblich sind GitHub (`main`, PRs, Workflow-Ergebnisse). Diese Datei wird nach jeder Arbeitseinheit aktualisiert.
> Freigaben laufen nach der **Ampel** in `AGENTS.md` (🟢 KI mergt bei grünen Tests · 🟡 Alps Go · 🔴 nur Alp).

## 1. Was ist live?

| | |
|---|---|
| Live-Version (`main`) | **v0.84.0** (#59, Einsatz & Kasse); Cloudflare-Build erfolgreich |
| In Arbeit | v0.86.0: Layout-Abgleich (Großbuchstaben-Knöpfe, Emojis in Überschriften), „Sehr günstig!“, Rattenhandel-Text, Schnell-Emojis rechts. v0.85 live (#60), SQL `v0.85-kasse-rechte.sql` ausgeführt |
| Nächste Versionen | Erste echte Partien spielen (noch kein einziges Spielergebnis in der DB) · Börsen-Chaos danach nachjustieren · Shop-Ideen (Preise = Alp) · Rückblick nach dem Spiel |
| Datenbank | Supabase; ausgeführt bis einschließlich `supabase/v0.84-kasse.sql` (Claude über Connector 20.11., Prüfabfrage + Advisors ✓); davor `v0.80-avatar-ablegen.sql` (20.11.), `v0.67-emotes.sql` (14.11.) |

### Zuletzt live gegangen
| Version | Inhalt | PR |
|---|---|---|
| v0.84.0 | Einsatz (Platz 1 bekommt den Topf) + Kasse/Schuldenbuch | #59 |
| v0.83.0 | Teams 2 gegen 2 mit Team-Wahl im Warteraum | #58 |
| v0.82.0 | Geheimaufträge | #57 |
| v0.81.0 | Börsen-Chaos: Kurse sofort auf den Karten, News Blindmarkt | #56 |
| v0.80.0 | Mein Profil (Figuren wechseln/ablegen), Spielregeln mit Reitern, ⓘ je Spielart | #55 |
| v0.79.0 | „Warte, warte, warte!“, Rattenkönig-Show | #54 |
| v0.78.0 | Tempo (Denkzeiten/Info-Fenster/fest), Modus-Fenster, längere Ergebnisse + Quartett-Show | #53 |
| v0.72–v0.77 | Startbildschirm mit Modus-Kacheln, Choreografie, Zu zweit, Quartett-Show | #48–#52 |
| v0.71.0 | Kein Zwischenstand mehr (merken statt anzeigen), Verlierer-Pose 🌧️ auf dem Podest | – |
| v0.70.0 | Choreografie: Tiere laufen bis auf den Stapel und werden zur Karte, Kuhhandel über die Mitte, Geld/Tiere nie mehr zum Avatar | #46 |
| v0.69.0 | Börsen-News Hype ×2 / Blase ÷2, Kurse multiplikativ (max ×4), Kurssprung-Animation, Rückseiten für News/Geld, keine Krone/💸 | #45 |
| v0.68.0 | Ganze Tiere, Ka-ching, Starter-Figuren, Atmen + Mimik, Debug-Scroll | #44 |
| v0.64–v0.67 | Theater-Emotes (Torte, Baum, Verschwörung …), Zwangsversteigerung + Einspruch, Emote-Shop (nur Alp Admin) | #39–#43 |
| v0.63.0 | Duell-Intros (Kuhhandel/Rattenhandel/SSS/Spielstart), Spitzenreiter-Krone, „Letzte Karte!“, Finale (Ende nicht überspringbar), Shop „Eigener Spruch“, Kursrallye/-sturz zufällig 30–100 % (Sturz meist stärker) | #34 |
| v0.62.0 | Figuren springen aus dem Profilbild (Jubel, Pleite, Prügeln), Ratte, Quartett-Polonaise, Kuhhandel-Koffer | #34 |
| v0.61.x | Emote „Verprügeln“ (Shop, Admin immer, 5 s Pause), Muskel-Esel klettert aus der Karte | #33, #34 |
| v0.60.1 | Esel zerknüllt die Bonus-Scheine und wirft sie jedem zu | #32 |
| v0.60.0 | Börsen-Chaos: neue Spielart mit 8 Börsen-News (Kursrallye/-sturz, Dividende, Steuerprüfung, Marktpanik, Hektik), Kurszettel | #29 |
| v0.59.1 | Mitte −22 %, Tiere im Regal bis 118 % | #28 |
| v0.59.0 | Dein Platz: Tier-Regal über dem Geld, Hand mit festen Fächern + Summe, Figur rechts groß mit Leuchten, Sprechblasen aus dem Mund | #26 |
| v0.58.1 | Figur kleiner, Doku | #25 |
| v0.58.0 | 9 neue Charaktere, 7 Sprüche, 2 Gratis-Sprüche (SQL `shop_claim_free`), 💬 nur Sprüche, symmetrischer Rahmen unten, „Überboten!“ über dem Gebot, Bezahl-Box einreihig | #24 |
| v0.57.1 | Preis in der Ergebnis-Überschrift, Taler-Schein-Zeichen | #23 (in #24) |
| v0.57.0 | Wie am echten Tisch (Figur unten Mitte, Geld links, Tiere rechts) + Debug-Abkürzungen | #22 |
| v0.56.x | Eigene Figur am Tisch, Testspiel mit deinem Avatar | #20, #21 |
| v0.55.0 | Dublonen für alle + Schutz der Spielstände (SQL von Alp ausgeführt) | #19 |
| v0.54.x | Avatare jubeln, Podest; aufgeräumter Tisch, ruhiges Bezahlen | #17, #18 |
| v0.53.0 | Größere Karten | #16 |
| v0.52.x | Ganzkörper-Avatare, Geld über die Mitte, 3-Spieler-Feinschliff | #12–#14 |

## 2. Offene PRs und Branches

| PR / Branch | Owner | Stufe | Status |
|---|---|---|---|
| `claude/doku-v063` | Claude | 🟢 | Diese Doku-Aktualisierung. |
| `ai/auftraege` | Codex/Claude | – | Ersetzt durch Abschnitt 5; löschen nur mit Alps Okay. |
| alte Feature-Branches | – | 🔴 | Alle in `main`. Aufräumen nur mit Alps Okay. |

## 3. Qualitätsprüfungen (alle müssen vor einem Merge grün sein)

| Prüfung | Wo | Was sie findet |
|---|---|---|
| `npm test` (68 Tests) | lokal + Workflow `tests.yml` | Spielregeln (inkl. 100 simulierte Turbo- und klassische Komplettspiele), Shop-Katalog/Preise = SQL-Preise, Ganzkörper-Avatare, Automatisierung |
| `node scripts/check.mjs` | lokal + `tests.yml` | JS-Syntax aller Dateien, `APP_VERSION` = `version.json` = CHANGELOG, „Was ist neu“ kennt die Version, `AGENTS.md` = `CLAUDE.md` |
| e2e Ansichten | `e2e.yml` → `e2e/views.spec.mjs` | alle Demo-Ansichten × 4 Handygrößen + 3-Spieler-Ansichten + Startseite/Shop: JS-Fehler, Überlappungen, abgeschnittener Text, zu kleine Schrift |
| e2e Größen | `e2e/sizes.spec.mjs` | große Karte + Überschrift in allen Phasen gleich groß |
| e2e Partien | `e2e/fullgame.spec.mjs` | 4 komplette Partien mit Test-Spielern im Browser (3 und 4 Spieler) ohne JS-Fehler; „hängt“ = 40 s ohne Änderung an Banner, Stapel, Höchstgebot oder Geld |
| PR-Bericht | `pr-report.yml` | ein Kommentar pro PR: geänderte Dateien, Risiken, Testergebnisse |
| Workers Build | Cloudflare | Vorschau-Build je Branch |

Zusätzlich: e2e prüft Startseite mit Avatar, Shop, Podest mit Avataren (3/4 Spieler) und 3-Spieler-Ansichten.
Bekannte Einschränkung: Einige Demos (`auction`, `cantpay`, `rat`, `rps` …) sind nur für 4 Spieler gebaut und laufen mit `?p=3` nicht – reine Demo-Grenze, kein Spielfehler.

## 4. Offene Fehler / Risiken

- Restrisiko Dublonen: Schummeln innerhalb einer echten Partie (Tagesgrenze 60 begrenzt den Schaden); Stufe 2 = Züge über den Worker (siehe `supabase/v0.55-sicherheit-vorschlag.md`).
- Supabase-Advisors: `admin_*` für anon gesperrt (v0.60-SQL ✓). Noch 9 anon-ausführbare Funktionen (join_game, my_pin, save_push … – teils gewollt, Prüfung angeboten). Schutz vor geleakten Passwörtern = Dashboard-Schalter (Alp).
- Branch-Schutz für `main` noch nicht eingerichtet (🔴, Alp; Anleitung in `AI_HANDOFF_ARCHIV.md`).
- 8 Demos laufen nicht mit `?p=3` (nur Demo-Grenze).

## 5. Roadmap

| Version | Inhalt | Stufe |
|---|---|---|
| v0.52–v0.59 | Avatare, größere Karten, Siegerehrung, Dublonen für alle, Platz am Tisch, neue Charaktere | ✅ live |
| v0.60 | Börsen-Chaos | ✅ live |
| v0.61–v0.63 | Emote Verprügeln, lebendige Figuren + Gags, Duell-Intros, Finale, eigener Spruch | ✅ live |
| v0.64–v0.71 | Theater-Emotes, Pfändung, Emote-Shop, ganze Tiere, Börsen-Hype, Choreografie | ✅ live / im Merge |
| nächste | 2-Spieler-Modus (Originalregeln prüfen, Vorschlag an Alp) | 🟡 |
| später | Erfolge + Saison-Rangliste (SQL), Zuschauen, Zug-Zeitlimit mit Bot-Vertretung, Shop: Tischdesigns/Kartenrücken, Avatar-Accessoires/Haustiere/Abzeichen (Preise = Alp), Einstellung „Animationen kurz“ | – |

## 6. Datei-Owner (pro Aufgabe genau ein schreibender Owner)

| Bereich | Dateien | Owner heute |
|---|---|---|
| Spiel-UI | `js/game.js`, `css/style.css` | Claude |
| Startseite, Shop-Anbindung | `js/app.js`, `js/shop.js`, `js/shopavatars.js`, `css/shop.css` | Claude |
| Regeln | `src/engine.js`, `test/engine.test.js` | Claude (bei Regeländerung 🟡) |
| Browser-Tests | `e2e/**`, `.github/workflows/e2e.yml` | Claude |
| Doku/Prozess | `PROJECT_STATUS.md`, `AI_HANDOFF.md`, `AGENTS.md`/`CLAUDE.md`, `scripts/check.mjs`, `tests.yml`, `pr-report.yml` | Claude (Codex übernimmt nach Absprache, siehe Handoff) |
| SQL | `supabase/*.sql` | Claude führt über den Supabase-Connector aus (Regel 7); ohne Connector führt Alp aus |

## 7. Freigaben, die noch von Alp gebraucht werden

- Restliche 9 anon-Funktionen prüfen lassen? Passwort-Leak-Schutz im Dashboard einschalten.
- 2-Spieler-Regeln absegnen (Vorschlag folgt).
- Branch-Schutz für `main` selbst einrichten.
- Alte, gemergte Branches löschen lassen? (Liste auf Wunsch.)
