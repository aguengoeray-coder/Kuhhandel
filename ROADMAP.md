# ROADMAP.md – Entwicklungsplanung

Stand: 12.11.2026. Reihenfolge und Zuständigkeiten sind Planungsstand; vor Beginn einer Aufgabe Branches und aktuellen Code prüfen. Alp entscheidet über Änderungen und Freigaben.

## v0.46 – Kuhhandel-Einsatz
**Zuständig: Claude**  
Bekannte Planung:
- In der Mitte den Einsatz mit allen eingesetzten Tierkarten zeigen.
- Klarer Text zur Anzahl: z. B. „2 gegen 2 · Gewinner bekommt alle 4“.
- Pro Seite die eingesetzten Karten und den möglichen Gewinn anzeigen.
- Geldtausch direkt im Ergebnisfenster animieren; danach wechselt nur noch das Tier.

## v0.47 – Startseite „B: Tisch“
**Zuständig: Claude**  
Bekannte Planung:
- Börsenticker über die gesamte Breite.
- Logo links, Dublonen und Profil rechts.
- Offene Spiele groß auf einem Filz-Tisch mit freien Plätzen und „Platz nehmen“.
- Untere App-Leiste: Spielen, Shop, Bestenliste, Statistik, Regeln, Einstellungen.
- Einstellungen: Aussehen, Profilbild, Benachrichtigungen, Als App, Meine Statistik, Admin (nur Admins), Abmelden.

## v0.48 – Shop und Dublonen
**Zuständig: Codex**, zunächst isoliert von den Startseiten-/Spieltisch-Dateien.

### Avatare
- Elf eigenständige, animierte Avatare: vier seltene (30), vier epische (40), drei legendäre (60).
- Eigene Figuren und Grafiken, keine fremden geschützten Figuren oder Logos.
- Animationen und Effekte passend zur Seltenheit; Shop-Darstellung als Sammelkarte.
- Vorschau-Branch: `codex/shop-avatars`; visuelle Abnahme noch offen.

### Dublonen und Käufe
- Nur ein Sieg bringt Dublonen: 10 pro Sieg.
- Alle starten bei 0; keine rückwirkende Vergütung alter Siege.
- Kontostand und Käufe müssen in Supabase gespeichert und serverseitig geprüft/gutgeschrieben werden.
- SQL-Datei vorbereiten; Alp führt sie selbst im Supabase-SQL-Editor aus.

### Shop-Inhalte
- Sprüche: je 10 Dublonen; Konterspruch „Ich habe nur gute Ideen“: 20.
- Avatare: Selten 30, Episch 40, Legendär 60.
- Alle Artikel auf einer Shop-Seite.

## Arbeitsreihenfolge / Abhängigkeiten

1. v0.46/v0.47 und ihre Änderungen an gemeinsamen App-Dateien mit Claude koordinieren.
2. Shop-Avatare in eigenem Branch visuell prüfen und erst nach Alp-Freigabe als abgeschlossen markieren.
3. Shop-Modul und SQL getrennt entwickeln; keine gleichzeitige Bearbeitung gemeinsamer Dateien.
4. Shop erst in die Startseite einhängen, wenn Claude mit v0.47 fertig ist und Alp zustimmt.
5. Vor jeder Veröffentlichung: aktuelles `main` einholen, Tests, Screenshots, Alp-GO.

## Nicht automatisch beauftragt

Neue Funktionen, Änderungen am Spielablauf, Datenbankausführung und Live-Veröffentlichungen benötigen jeweils eine ausdrückliche Entscheidung/Freigabe von Alp.
