# AI_TEAM.md – Teammodell, Aufgabenverteilung und Kapazitätsplanung

Stand: 12.11.2026  
Product Owner und alleiniger Entscheider: **Alp**  
Gemeinsame Quelle der Wahrheit: **GitHub-Repository**. Chatverläufe einzelner KI-Systeme sind kein verlässliches Projektgedächtnis.

## 1. Rollen und Verantwortung

| Mitglied | Rolle | Verantwortet | Grenzen |
|---|---|---|---|
| **Alp** | Product Owner | Ziele, Prioritäten, Umfang, Spielregeln, Abnahme, SQL-Ausführung sowie Freigabe von Merge und Veröffentlichung | Alle Produktentscheidungen bleiben bei Alp |
| **Claude** | Lead Feature Developer | Größere zusammenhängende Spielfunktionen und UI-Flows, sofern zugewiesen; aktuell v0.46/v0.47 | Keine parallelen Änderungen an Codex-Dateien |
| **ChatGPT / Codex** | Technical Coordinator & Feature Developer | Technische Planung, Architektur-/Integrationsprüfung, Projektdokumentation und zugewiesene Features; aktuell v0.48-Shop | Keine Änderungen an Claudes laufenden Dateien ohne Abstimmung |
| **GitHub Copilot** | In-IDE Coding Assistant | Kleine Implementierungshilfen, Boilerplate, Code-Erklärung und gezielte Fehlerbehebung unter Verantwortung des Datei-Owners | Kein eigener Produktauftrag, keine eigenständige Architekturentscheidung oder Freigabe |
| **Gemini** | Unabhängiger Reviewer / QA-Berater | Zweitmeinung zu Architektur, Spiellogik, Testfällen, UI-Konzepten und Sicherheitsrisiken | Standardmäßig read-only; keine parallelen Codeänderungen |

Copilot und Gemini sind hier zunächst **vorgesehene Rollen**, nicht als technisch verbunden bestätigt. Verfügbarkeit, Berechtigungen und Einrichtung müssen separat geprüft werden.

## 2. Aufgabenverteilung

| Aufgabe | Owner | Unterstützung / Review |
|---|---|---|
| Produktziele, Prioritäten, Regeln und Abnahme | Alp | KIs liefern Entscheidungsgrundlagen |
| Größere Spielfunktionen und UI-Flows | Claude, wenn zugewiesen | Codex Architekturprüfung; Gemini unabhängiges Review |
| Shop, Avatare und Dublonen (v0.48) | Codex, wenn von Alp bestätigt | Gemini Review; Claude nur nach Abstimmung |
| Architektur und Integrationsplanung | Codex | Claude und Gemini als Gegenprüfung |
| Kleine lokale Codehilfen | Copilot als Werkzeug des jeweiligen Owners | Owner prüft jede Änderung |
| Unabhängige Code-/Logikprüfung | Gemini | Codex priorisiert und dokumentiert Befunde |
| Tests und reproduzierbare Fehlerberichte | jeweiliger Feature-Owner | Gemini kann Testideen liefern |
| Gemeinsame Projektdokumentation | Codex als Verwalter; jeder Owner dokumentiert eigene Arbeit | Alp entscheidet bei Planänderungen |
| SQL-Migrationen | zuständiger Entwickler erstellt nur SQL-Datei | Codex prüft; Alp führt SQL selbst aus |
| Freigabe von Merge und Live-Schaltung | ausschließlich Alp (ausdrückliches „go“ nach Screenshots/Testergebnissen) | Die umsetzende KI legt Nachweise vor |
| Merge, Push und Live-Prüfung | umsetzende KI, ausschließlich nach Alps ausdrücklichem „go“ | Vorher aktuelles `main` holen, Diff prüfen und `npm test`; danach Cloudflare-Build und GitHub-Tests prüfen und Alp berichten |

**Ein Auftrag = ein schreibender Owner.** Weitere KIs beraten oder prüfen denselben Diff, ändern aber nicht parallel dieselben Dateien.

## 3. Kapazitäts- und Token-Protokoll

Ziel: Aufgaben anhand der tatsächlich verfügbaren Kapazität, Werkzeuge und Stärken verteilen, statt jeder KI pauschal gleich viel Arbeit zu geben.

### 3.1 Was jede KI zu Beginn mitteilt

Vor einer größeren Aufgabe soll jedes KI-System, soweit die jeweilige Oberfläche/Plattform die Information bereitstellt, kurz angeben:

- **Modell / Modus:** genaue Bezeichnung, soweit sichtbar.
- **Kontextfenster:** bekannte maximale Kontextgröße; andernfalls „nicht offengelegt“.
- **Aktuelle Kontextauslastung:** exakter Wert oder grobe Schätzung, sofern sichtbar/zuverlässig.
- **Verbleibender Kontext:** exakter Wert oder Schätzung; andernfalls „nicht verfügbar“.
- **Nutzungs-/Rate-Limit:** nur wenn in der Plattform tatsächlich sichtbar; z. B. verbleibende Nachrichten oder Reset-Zeit.
- **Werkzeuge:** Zugriff auf GitHub, Terminal, Browser, Tests und Dateien, die in dieser Sitzung wirklich verfügbar sind.
- **Einschränkungen:** z. B. kein Terminal, kein direkter Repo-Schreibzugriff oder keine Möglichkeit, Browseransichten zu prüfen.
- **Kapazitätsvertrauen:** gemessen / von Plattform angezeigt / grob geschätzt / unbekannt.

Keine KI darf Tokenzahlen, Restkontingente, Kontextauslastung oder Reset-Zeiten erfinden. Kontextfenster, aktuell belegter Kontext, verbleibende Kontextkapazität und monatliches/zeitliches Nutzungslimit sind unterschiedliche Größen und dürfen nicht vermischt werden.

### 3.2 Kurzmeldung vor Arbeitsbeginn

Jede KI verwendet bei größeren Aufgaben dieses kompakte Format:

```text
KAPAZITÄT
Modell/Modus:
Kontextfenster:
Aktuelle Auslastung / Rest:
Nutzungslimit / Reset:
Werkzeuge:
Einschränkungen:
Datenqualität: angezeigt / gemessen / geschätzt / unbekannt

AUFTRAG
Vorgeschlagene Rolle: Owner / Reviewer / Beratung
Aufwand: klein / mittel / groß
Geschätzte Arbeitsschritte:
Voraussichtlicher Übergabepunkt:
```

Wenn Kapazitätsdaten nicht zugänglich sind, meldet die KI ausdrücklich „nicht verfügbar“ und gibt stattdessen eine qualitative Einschätzung ab.

### 3.3 Kapazitätsmeldung während und nach der Arbeit

- Bei langen Aufgaben meldet der Owner rechtzeitig, wenn der verfügbare Kontext knapp wird oder ein sauberer Abschluss im aktuellen Lauf unsicher ist.
- Vor einem Kontextwechsel aktualisiert er zuerst den Branch, den Commit-Stand und die Übergabedokumentation.
- Am Ende nennt er verbrauchte/übrige Kapazität nur, wenn die Plattform diese Information verlässlich angezeigt hat.
- Sonst reicht eine qualitative Angabe: „ausreichend“, „knapp“ oder „neue Sitzung/Übergabe empfohlen“.
- Zugangsdaten, private Kontoinformationen und interne Abrechnungsdaten werden nicht in GitHub dokumentiert.

### 3.4 Wie Aufgaben verteilt werden

Die Koordination richtet sich nach fünf Faktoren:

1. **Kompetenz:** Welche KI eignet sich für Implementierung, Architektur, Recherche, Review oder UI-Prüfung?
2. **Werkzeuge:** Wer kann die nötigen Dateien lesen, Tests ausführen, Browser prüfen oder einen PR bearbeiten?
3. **Kontext:** Wer hat bereits den relevanten Code und die Entscheidungen im Kontext?
4. **Kapazität:** Wer hat ausreichend verlässlich verfügbare Kontext- und Nutzungskapazität?
5. **Risiko und Abhängigkeiten:** Welche Aufgabe muss seriell erfolgen, welche Prüfung kann unabhängig parallel laufen?

Standardmuster:
- **Eine KI implementiert, eine andere prüft.**
- Unabhängige Recherche/Testideen können parallel laufen.
- Änderungen an gemeinsamen Dateien, Datenbank und Spielzuständen werden nicht parallel implementiert.
- Große Aufgaben werden in kleine, einzeln überprüfbare Arbeitspakete zerlegt.
- Eine KI mit knappem Kontext erhält einen klar abgegrenzten Teilauftrag oder erstellt eine Übergabe, statt den Kontext durch unnötiges erneutes Lesen zu verbrauchen.

### 3.5 Keine künstliche Token-Optimierung

Nicht jede Kleinigkeit braucht ein Review durch alle KIs. Gemini wird gezielt für risikoreiche oder architektonisch relevante Änderungen eingesetzt. Copilot hilft innerhalb der Arbeit des Owners. Die Dokumentation bleibt knapp und verweist auf zentrale Dateien, statt Inhalte zu duplizieren.

## 4. Verbindlicher Ablauf pro Aufgabe

1. **Auftrag klären:** Ziel, Umfang und Abnahmekriterien mit Alp abstimmen. Bei einer Frage zunächst untersuchen und berichten, nicht ungefragt umbauen.
2. **Kapazität melden:** Bei größeren Aufgaben das Kapazitätsformat aus Abschnitt 3 verwenden. Unbekannte Werte als unbekannt kennzeichnen.
3. **Kontext laden:** `AGENTS.md`, `AI_TEAM.md`, `PROJECT_STATUS.md`, `ROADMAP.md` und den letzten Eintrag in `AI_HANDOFF.md` lesen.
4. **Repository prüfen:** `main`, eigenen Branch, relevante Feature-Branches, offene PRs und tatsächliche Dateien prüfen.
5. **Konflikte ausschließen:** Einen Owner, Scope, Branch und Reviewer bestimmen. Keine parallelen Schreibzugriffe auf dieselbe Datei.
6. **Implementieren:** Klein und isoliert auf eigenem Branch. Copilot nur als Werkzeug des Owners einsetzen.
7. **Selbst prüfen:** Passende Tests ausführen, insbesondere `npm test`; nicht ausgeführte Prüfungen ausdrücklich nennen.
8. **Unabhängig reviewen:** Bei relevanten Änderungen Gemini oder eine nicht am Code beteiligte KI um Diff-Review bitten. Reviewer ändern den Code nicht.
9. **Befunde abarbeiten:** Owner bewertet jeden Befund, korrigiert bestätigte Fehler oder dokumentiert eine begründete Nichtübernahme.
10. **Dokumentieren:** Status, Commits, Dateien, Tests, Screenshots, offene Punkte und nächste Zuständigkeit in `PROJECT_STATUS.md` und `AI_HANDOFF.md` aktualisieren.
11. **Alp-Abnahme und Veröffentlichung:** Die umsetzende KI legt Alp Screenshots und Testergebnisse vor. Erst nach Alps ausdrücklichem „go“ führt genau diese KI ihren eigenen Branch selbst in `main` zusammen: vorher aktuelles `main` holen, vollständigen Diff prüfen und `npm test` erfolgreich ausführen. Anschließend pusht sie `main`, prüft den Cloudflare-Build sowie die GitHub-Tests und meldet das Ergebnis an Alp. Ohne ausdrückliches „go“ kein Merge und kein Push auf `main`.

## 5. Branch- und Datei-Regeln

- Jede KI bzw. jeder Owner arbeitet auf einem eigenen, klar benannten Branch, z. B. `claude/v046-kuhhandel`, `codex/v048-shop`.
- Niemals direkt auf `main` schreiben. `main` ist produktiv und löst die Veröffentlichung aus.
- Vor Integration aktuellen `main` einholen und den vollständigen Diff prüfen.
- Pro Datei gibt es zu einem Zeitpunkt nur einen schreibenden Owner.
- Copilot-Vorschläge zählen als Änderung des Owners und müssen von diesem geprüft werden.
- Gemini-Review ist standardmäßig read-only. Eigene Implementierungen benötigen einen separaten Auftrag und Branch.
- Keine KI überschreibt, rebased oder merged den Branch einer anderen KI ohne ausdrückliche Abstimmung.
- Commits beginnen mit der Versionsnummer und verwenden deutsche Kurzbeschreibungen, z. B. `v0.48.0: Shop-Avatare`.

## 6. Review-Standard

Prüfreihenfolge:
1. Fehler in Spielregeln, Spielzuständen und Mehrspieler-Synchronisation.
2. Sicherheitsprobleme, insbesondere Berechtigungen, Supabase-RLS, serverseitige Dublonen-/Kaufprüfung und Geheimnisse.
3. Datenverlust, Race Conditions und fehlerhafte Zustandsübergänge.
4. Regressionen in bestehenden Spielfunktionen.
5. Darstellung, Bedienbarkeit und responsive Layouts.
6. Wartbarkeit und unnötige Komplexität.

Befunde einstufen:
- **Blocker:** Sicherheitslücke, Datenverlust oder Spiel unbenutzbar.
- **Hoch:** zentrale Funktion oder Spielablauf fehlerhaft.
- **Mittel:** deutliche Einschränkung mit Workaround.
- **Niedrig:** kosmetisch oder geringfügig.

Ein Review garantiert keine Fehlerfreiheit. Tests, Browserprüfung und Alps Abnahme bleiben erforderlich.

## 7. Aktuelle Zuordnung

Arbeitsstand 12.11.2026; vor jeder Fortsetzung mit GitHub und Alp abgleichen:

- **Claude:** v0.46 Kuhhandel-Einsatz und v0.47 Startseite; laufende Branches/Dateien vor Änderungen prüfen.
- **Codex:** v0.48 Shop/Avatare/Dublonen sowie gemeinsame Projektdokumentation; getrennte Dateien und Branches.
- **Copilot:** noch nicht eingerichtet; später als lokaler Coding-Assistent unter Kontrolle des jeweiligen Owners.
- **Gemini:** noch nicht eingerichtet; später unabhängiger Reviewer ohne Schreibrechte.
- **Alp:** entscheidet Aufgabenvergabe, Prioritäten, SQL-Ausführung, Abnahme, Merge und Live-Veröffentlichung.
