# Kuhhandel online

Online-Version des Kartenspiels Kuhhandel, um mit Freunden zu spielen. Querformat, Bedienung nach dem Vorbild der Monopoly-App.

## Regeln (so umgesetzt)

- 3–4 Spieler, 40 Tierkarten (10 Tierarten × 4).
- Quartettwerte: Hahn 10, Gans 40, Katze 90, Hund 160, Schaf 250, Ziege 350, Esel 500, Schwein 650, Kuh 800, Pferd 1000.
- Startgeld je Spieler: 2× 0, 3× 10, 1× 20, 1× 50 = 100 Taler. Fremdes Geld ist verdeckt, nur die Kartenanzahl ist sichtbar.
- **Esel-Bonus:** Wird ein Esel aufgedeckt, bekommen alle Geld von der Bank: 50 / 100 / 200 / 500.
- **Versteigerung:** Wer am Zug ist, deckt ein Tier auf und versteigert es (Gebote in 10er-Schritten). Der Auktionator entscheidet: Zuschlag an den Höchstbietenden oder **Vorkaufsrecht** (er kauft selbst und zahlt das Höchstgebot an den Höchstbietenden). Bietet niemand, bekommt der Auktionator das Tier umsonst.
- **Kein Wechselgeld:** Wer zahlt, wählt selbst Karten aus, die mindestens den Betrag ergeben. Überzahltes ist weg.
- **Zahlungsunfähig:** Kann der Höchstbietende nicht zahlen, muss er alle Geldkarten offen zeigen. Die Versteigerung beginnt neu, er darf höchstens sein altes Gebot minus 10 bieten.
- **Kuhhandel:** Statt zu versteigern kann man einen Spieler herausfordern, der dieselbe Tierart hat. Verdecktes Angebot (Kartenanzahl sichtbar). Haben beide 2 Karten der Art, geht es um 2, sonst um 1.
  - Annehmen: Der Herausgeforderte nimmt das Geld und gibt das Tier ab.
  - Gegenangebot: Beide Gebote werden aufgedeckt und **immer getauscht**. Das höhere Gebot gewinnt die Tiere, **bei Gleichstand gewinnt der Herausforderer**.
- Ist der Stapel leer, gibt es nur noch Kuhhandel, bis alle Quartette vollständig sind.
- **Wertung:** Summe der Quartettwerte × Anzahl der eigenen Quartette.

## Aufbau

- `src/engine.js` – komplette Spiellogik ohne Oberfläche und Netzwerk.
- `test/engine.test.js` – Tests aller Regeln plus 200 zufällige Komplettspiele.

Tests starten: `npm test`

Geplant: Oberfläche (Querformat) im Repo, Hosting über Cloudflare Pages, Lobby und Echtzeit über Supabase.
