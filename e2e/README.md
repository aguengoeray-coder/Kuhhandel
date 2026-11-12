# Browser- und Layouttests (Playwright)

Läuft automatisch bei jedem Pull Request (`.github/workflows/e2e.yml`, Name „Browser-Tests“).
Ergebnis: Zusammenfassung im GitHub-Lauf + Artefakt **e2e-report** (Berichte `*.md`/`*.json`, Screenshots in `shots/`).

## Was geprüft wird

**`views.spec.mjs` – alle Ansichten × 4 Größen** (852×393, 667×375, 932×430, 800×360)
- Startseite (+ Debug, Einstellungen, Bestenliste, Regeln), Warteraum
- jede Spiel-Demo aus `js/demo.js` (neue `case '…'` werden automatisch mitgeprüft)
- Ergebnis-Fenster (Versteigerung, Kuhhandel, Spezialkarte, Ratte, Geschenkt …)
- Shop, sobald `shop-demo.html` im Repo liegt

**`fullgame.spec.mjs` – 4 komplette Partien** mit Test-Spielern (3 und 4 Spieler, fester Zufall).
Alp wird automatisch gespielt (bezahlen über den Fächer, Kuhhandel, Ratte, Spezialkarte, bieten).

## Fehler (Test wird rot)
| Art | Bedeutung |
|---|---|
| `scroll-x` | Seite breiter als der Bildschirm |
| `ausserhalb` | Bedienelement/Text liegt außerhalb des Bildschirms (Mitte nicht erreichbar) |
| `abgeschnitten` / `text-abgeschnitten` | Knopf oder Text wird von einem Rahmen (`overflow: hidden`) abgeschnitten oder passt nicht in sein Feld |
| `verdeckt` | ein normales Element liegt über einem Knopf (Fenster wie Einstellungen/Ergebnis zählen nicht) |
| `ueberlappung` | Bereiche am Tisch überdecken sich (Plätze, Mitte, eigene Reihe, Menü) |
| `js-fehler` | JavaScript-Fehler in der Konsole |
| `haengt` / `kein-ende` | Partie steht 40 s still bzw. endet nicht |

**Hinweise** (nur im Bericht): Schrift unter 10 px, Tippfläche unter 24 px, Element ragt nur am Rand etwas hinaus.

## Bekannte Punkte
`known-issues.json`: bewusst akzeptierte Fehler mit Begründung (Felder `seite`, `art`, `ziel` als RegExp, `grund`).
Nur nach Absprache mit Alp ergänzen – und wieder entfernen, sobald behoben.

## Lokal starten
```
npm install --no-save playwright@1.63.0 && npx playwright install chromium
node --test e2e/                      # alles
E2E_ONLY=start,turn node --test e2e/views.spec.mjs   # nur einzelne Ansichten
```
