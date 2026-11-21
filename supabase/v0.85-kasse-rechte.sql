-- v0.85 Aufräumen: angemeldete Spieler dürfen die Kasse nur lesen (Schreiben nur über kasse_settle / kasse_paid_pair).
-- RLS hat Schreiben schon vorher komplett blockiert (keine Insert/Update/Delete-Regel) – das hier entzieht die Rechte auch formal.
-- Rückweg: grant insert, update, delete on public.kasse to authenticated;
revoke insert, update, delete, truncate, references, trigger on public.kasse from authenticated;
revoke all on public.kasse from anon;
grant select on public.kasse to authenticated;
revoke all on sequence public.kasse_id_seq from anon, authenticated;
