# AI_HANDOFF.md – Übergaben zwischen KI-Mitarbeitern

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
