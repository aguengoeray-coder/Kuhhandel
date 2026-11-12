# PROJECT_STATUS.md – gemeinsamer Projektstand

Stand der Dokumentation: 12.11.2026  
Repository: `aguengoeray-coder/Kuhhandel`  
Hauptbranch: `main`

> Diese Datei ist ein Arbeitsgedächtnis, kein Ersatz für Git. Bei Abweichungen gelten der tatsächliche Code, die Branches und die Deploy-Historie. Statusangaben aus früheren Übergaben müssen vor einer Fortsetzung auf GitHub überprüft werden.

## Veröffentlichter Stand

- Letzter bestätigter Live-Stand: **v0.47.0** (Claude, Merge-Commit `90369ba7801390e560131f0f950f1678c38fb7a9`, 12.11.2026).
- `version.json`/Changelog und GitHub-Stand müssen bei der nächsten Aktualisierung erneut gegengeprüft werden; der erfolgreiche Cloudflare-Build für `90369ba` wurde von Claude gemeldet.
- `CHANGELOG.md` auf `main` dokumentiert v0.45.0 als jüngsten Eintrag.
- Hosting: Cloudflare Worker; Änderungen auf `main` werden automatisch veröffentlicht; die umsetzende KI merged und pusht erst nach Alps ausdrücklichem „go“.
- Datenbank/Echtzeit: Supabase.
- Vor jeder Aussage zum aktuellen Live-Stand erneut `main`, `version.json` und Deployment prüfen.

## Entwicklungsübersicht

| Bereich | Bekannter Stand am 12.11.2026 | Zuständig | Nächster Schritt |
|---|---|---|---|
| v0.46 Kuhhandel-Einsatz | **Live als v0.46.0** | Claude | Keine offenen Arbeiten aus dem letzten Übergabestand |
| v0.47 Startseite „Tisch“ | **Live als v0.47.0** (`main` @ `90369ba`) | Claude | Keine offenen Arbeiten gemeldet; Startseite nach Deployment auf echtem Gerät kontrollieren |
| v0.48 Shop/Avatare | Modul, 11 Avatare, Demo, SQL-Entwurf auf `codex/v048-shop` | Codex | Shop-Korrekturen a–d umgesetzt; Claude soll neueste Vorschau bei 852×393 und 667×375 prüfen |
| v0.48 Shop-Oberfläche | Technisch umgesetzt, visuelle Abnahme offen | Codex | Browserprüfung, `npm test`, danach Integrationsplanung |
| v0.48 Dublonen/Käufe | SQL-Entwurf vorhanden, nicht ausgeführt | Codex | Schema/Funktionsdefinitionen gegen Live-Supabase prüfen; SQL erst nach Alps Freigabe |
| Bestenliste/Statistik | Bestehende Funktionen vorhanden; Erweiterungen nicht spezifiziert | Offen | Nur bei konkretem Auftrag ändern |

## Codex-Arbeit: Shop-Avatare

Branch: `codex/shop-avatars`  
Bekannte Dateien:
- `js/shopavatars.js` – elf eigenständige SVG-Avatare, CSS-Animationen und Hilfsfunktionen.
- `shop-avatar-demo.html` – eigenständige Vorschauseite.

Tatsächlich ausgeführte Prüfungen laut Übergabe:
- JavaScript-Syntax geprüft.
- Elf Avatare erzeugt; elf Vorschaukarten vorhanden.

Noch offen/nicht bestätigt:
- `npm test` für diese Änderung nicht ausgeführt.
- Keine echte Browserprüfung und keine Geräteansichten visuell abgenommen.
- Nicht in `main` integriert, nicht live.
- Kein Shop-Modul und keine Dublonen-/Supabase-Implementierung.

Vorschau: https://github.com/aguengoeray-coder/Kuhhandel/blob/codex/shop-avatars/shop-avatar-demo.html

## Technische Eckdaten

- Reines HTML/CSS/JavaScript mit ES-Modulen; kein Build-Schritt.
- Spiellogik: `src/engine.js`; Tests: `npm test`.
- Startseite/Warteraum/Supabase: `js/app.js`.
- Spieltisch: `js/game.js`.
- Gestaltung: `css/style.css`; Farben über Variablen aus `js/theme.js`.
- Eigene Tiergrafiken: `js/animals.js`.
- SQL-Änderungen ausschließlich als Datei unter `supabase/`; Ausführung durch Alp.

## KI-Team und Kapazitätsplanung

Das verbindliche Rollenmodell, die Aufgabenverteilung und die Meldung von Kontext-/Tokenkapazität sind in `AI_TEAM.md` beschrieben.

- Alp: Product Owner und alleiniger Entscheider.
- Claude: Lead Feature Developer für zugewiesene größere Spielfunktionen und UI-Flows.
- Codex: technische Koordination, Architektur-/Integrationsprüfung, Dokumentation und zugewiesene Features.
- Copilot: vorgesehener In-IDE-Assistent, noch nicht technisch eingerichtet.
- Gemini: vorgesehener unabhängiger Reviewer, noch nicht technisch eingerichtet.
- Größere Aufgaben beginnen mit einer Kapazitätsmeldung. Nicht verfügbare Werte müssen als unbekannt markiert werden; keine KI darf Token- oder Kontextwerte erfinden.
- Pro Aufgabe genau ein schreibender Owner; andere KIs prüfen oder beraten.

## Zuständigkeiten und Konfliktregeln

- Claude: v0.46 (technisch fertig, wartet auf Alps GO; Branch `v0.46-kuhhandel-einsatz`) und v0.47 (von Alp freigegeben, noch nicht begonnen); insbesondere `js/game.js`, `js/app.js`, `css/style.css`.
- Codex: Shop/Avatare und v0.48 zunächst in separaten Dateien/Modulen; Integration in `js/app.js`/`css/style.css` erst nach v0.47 und Abstimmung.
- Keine gleichzeitige Bearbeitung derselben Datei.
- Änderungen an Startseite/Spieltisch erst nach Abstimmung und Freigabe durch Alp.
- Alp entscheidet über Umfang, Prioritäten, SQL-Ausführung und Veröffentlichung.

## Letzte Prüfungen

| Prüfung | Ergebnis | Zeitpunkt/Anmerkung |
|---|---|---|
| JS-Syntax der Shop-Avatare | Bestanden | 12.11.2026, statische Prüfung |
| 11 SVG-Avatare/Karten | Bestanden | 12.11.2026, Funktionsprüfung |
| `npm test` für Shop-Branch | Für älteren Commit 225dc403 erfolgreich (38/38); neueste Korrekturen noch nicht getestet | GitHub-Actions-Lauf für aktuellen Head ausstehend |
| Browser-/Geräteprüfung | Offen | Screenshots erforderlich |
| Merge/Deployment | Shop nicht gemergt; Cloudflare-Preview für Commit 4d4e62a war erfolgreich | Neueste Änderungen brauchen neuen Preview-/Browsercheck |

## Aktualisierungsregel

Nach jeder Arbeitseinheit Branch, Commit, betroffene Dateien, Testergebnisse, offene Punkte und Live-Status aktualisieren. Niemals einen geplanten oder nur branchlokalen Stand als live bezeichnen.
