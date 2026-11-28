-- v1.3 Fehlerliste (Alp 28.11.2026 13:13/13:19): jeder angemeldete Spieler kann Fehler melden, alle sehen die Liste,
-- „👍 auch bei mir“, Admin hakt ab und kopiert alles. Gelöscht wird nichts (das bliebe bei Alp).
-- Rückweg: drop function if exists public.feedback_add(text, jsonb), public.feedback_vote(bigint), public.admin_feedback_done(bigint, boolean); drop table if exists public.feedback;
create table if not exists public.feedback (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  text text not null check (char_length(text) between 1 and 1000),
  context jsonb not null default '{}'::jsonb,
  votes uuid[] not null default '{}',
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists feedback_read on public.feedback;
create policy feedback_read on public.feedback for select to authenticated using (true);
-- Schreiben nur über die Funktionen unten

create or replace function public.feedback_add(p_text text, p_context jsonb)
returns bigint language plpgsql security definer set search_path = public
as $$
declare v_id bigint; v_name text;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  if char_length(trim(coalesce(p_text, ''))) = 0 then raise exception 'Bitte kurz beschreiben, was passiert ist'; end if;
  if (select count(*) from public.feedback where user_id = auth.uid() and created_at > now() - interval '1 minute') >= 5 then raise exception 'Kurz durchatmen – höchstens 5 Meldungen pro Minute'; end if;
  select coalesce(name, 'Spieler') into v_name from public.profiles where id = auth.uid();
  insert into public.feedback (user_id, name, text, context)
    values (auth.uid(), coalesce(v_name, 'Spieler'), left(trim(p_text), 1000), case when jsonb_typeof(p_context) = 'object' and length(p_context::text) <= 2000 then p_context else '{}'::jsonb end)
    returning id into v_id;
  return v_id;
end $$;

create or replace function public.feedback_vote(p_id bigint)
returns void language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  update public.feedback set votes = case when auth.uid() = any(votes) then array_remove(votes, auth.uid()) else votes || auth.uid() end where id = p_id;
end $$;

create or replace function public.admin_feedback_done(p_id bigint, p_done boolean)
returns void language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  update public.feedback set done = coalesce(p_done, true) where id = p_id;
end $$;

revoke all on function public.feedback_add(text, jsonb), public.feedback_vote(bigint), public.admin_feedback_done(bigint, boolean) from public, anon;
grant execute on function public.feedback_add(text, jsonb), public.feedback_vote(bigint), public.admin_feedback_done(bigint, boolean) to authenticated;
