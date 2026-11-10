-- Kuhhandel v0.13: Fehler automatisch melden
-- Im Supabase-Dashboard unter "SQL Editor" komplett einfügen und auf "Run" klicken.
-- Die Fehler siehst du danach unter "Table Editor" → error_reports (nur du im Dashboard, nicht die Spieler).

create table if not exists public.error_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid default auth.uid(),
  version text,
  message text not null,
  context jsonb
);
alter table public.error_reports enable row level security;

-- Angemeldete Spieler dürfen nur eintragen (nicht lesen), und nur für sich selbst
drop policy if exists "errors_insert" on public.error_reports;
create policy "errors_insert" on public.error_reports
  for insert to authenticated
  with check (user_id = auth.uid() and length(message) <= 500);

-- Alte Fehlerberichte (älter als 30 Tage) beim Aufräumen mit löschen
create or replace function public.cleanup_old_games()
returns void
language sql security definer set search_path = public
as $$
  delete from public.games where updated_at < now() - interval '2 days';
  delete from public.error_reports where created_at < now() - interval '30 days';
$$;
grant execute on function public.cleanup_old_games() to authenticated;
