# Passwort eines Spielers zurücksetzen

Die Konten haben keine echte E-Mail-Adresse, darum gibt es kein „Passwort vergessen“ per Mail.
So setzt Alp ein neues Passwort für einen Freund:

1. Supabase-Dashboard öffnen → links **SQL Editor** → **+ New query** (leeres Feld).
2. Den Befehl unten einfügen und zwei Stellen anpassen:
   - `NEUES-PASSWORT` → das neue Passwort (mindestens 6 Zeichen)
   - `nico@kuhhandel.app` → Name des Spielers in Kleinbuchstaben, ä→ae, ö→oe, ü→ue, ß→ss,
     Leerzeichen und Sonderzeichen werden zu `-` (z. B. „Bennet K.“ → `bennet-k@kuhhandel.app`)
3. **Run** klicken. Unten muss „Success. 1 row affected“ stehen. Steht dort „0 rows“, stimmt der Name nicht.
4. Dem Freund das neue Passwort sagen – er kann es danach im Spiel unter „Spielerbild“ → „Passwort ändern“ selbst ändern.

```sql
update auth.users
   set encrypted_password = extensions.crypt('NEUES-PASSWORT', extensions.gen_salt('bf')),
       updated_at = now()
 where email = 'nico@kuhhandel.app';
```

Alle Konten anzeigen (um den richtigen Namen zu finden):

```sql
select email, raw_user_meta_data->>'name' as name, created_at from auth.users order by created_at;
```
