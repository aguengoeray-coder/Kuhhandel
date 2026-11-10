-- Kuhhandel v0.14: Admin-Bereich (Alp und Nico)
-- Im Supabase-Dashboard unter "SQL Editor" → "+ New query" komplett einfügen und auf "Run" klicken.
-- Jeder Admin-Befehl prüft zuerst, ob der Aufrufer in der Tabelle admins steht.

-- ===== Admins =====
create table if not exists public.admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security; -- keine Policies: nur über die Befehle unten erreichbar

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

create or replace function public.require_admin()
returns void
language plpgsql stable security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'Nur für Admins';
  end if;
end $$;

-- ===== Spieler =====
create or replace function public.admin_users()
returns table (id uuid, name text, email text, created_at timestamptz, last_sign_in_at timestamptz, games bigint, wins bigint, is_admin boolean)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
    select u.id,
           coalesce(p.name, u.raw_user_meta_data->>'name', u.email)::text,
           u.email::text,
           u.created_at,
           u.last_sign_in_at,
           (select count(*) from public.game_results r where r.player_id = u.id),
           (select count(*) from public.game_results r where r.player_id = u.id and r.won),
           exists (select 1 from public.admins a where a.user_id = u.id)
      from auth.users u
      left join public.profiles p on p.id = u.id
     where u.email is not null and u.email like '%@kuhhandel.app'
     order by u.last_sign_in_at desc nulls last;
end $$;

create or replace function public.admin_set_password(p_user uuid, p_password text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  if length(coalesce(p_password, '')) < 6 then raise exception 'Mindestens 6 Zeichen'; end if;
  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
         updated_at = now()
   where id = p_user;
  if not found then raise exception 'Spieler nicht gefunden'; end if;
end $$;

create or replace function public.admin_delete_user(p_user uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  if p_user = auth.uid() then raise exception 'Du kannst dich nicht selbst löschen'; end if;
  delete from public.admins where user_id = p_user;
  delete from public.profiles where id = p_user;
  delete from auth.users where id = p_user; -- Bestenliste (game_results) bleibt stehen
end $$;

create or replace function public.admin_set_admin(p_user uuid, p_on boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  if p_on then
    insert into public.admins (user_id) values (p_user) on conflict do nothing;
  else
    if (select count(*) from public.admins) <= 1 then raise exception 'Mindestens ein Admin muss bleiben'; end if;
    delete from public.admins where user_id = p_user;
  end if;
end $$;

-- ===== Spiele =====
create or replace function public.admin_games()
returns table (id uuid, code text, status text, phase text, players jsonb, created_at timestamptz, updated_at timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
    select g.id, g.code, g.status, (g.state->>'phase')::text, g.players, g.created_at, g.updated_at
      from public.games g
     order by g.updated_at desc
     limit 50;
end $$;

create or replace function public.admin_delete_game(p_game uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.games where id = p_game;
end $$;

-- ===== Bestenliste =====
create or replace function public.admin_results()
returns table (game_id uuid, created_at timestamptz, rows jsonb)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
    select r.game_id, min(r.created_at),
           jsonb_agg(jsonb_build_object('name', r.name, 'score', r.score, 'won', r.won) order by r.score desc)
      from public.game_results r
     group by r.game_id
     order by min(r.created_at) desc
     limit 100;
end $$;

create or replace function public.admin_delete_result(p_game uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.game_results where game_id = p_game;
end $$;

create or replace function public.admin_reset_results()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.game_results where true;
end $$;

-- ===== Fehlerberichte =====
create or replace function public.admin_errors()
returns table (id bigint, created_at timestamptz, name text, version text, message text, context jsonb)
language plpgsql stable security definer set search_path = public
as $$
begin
  perform public.require_admin();
  return query
    select e.id, e.created_at, coalesce(p.name, '?')::text, e.version, e.message, e.context
      from public.error_reports e
      left join public.profiles p on p.id = e.user_id
     order by e.created_at desc
     limit 50;
end $$;

create or replace function public.admin_clear_errors()
returns void
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_admin();
  delete from public.error_reports where true;
end $$;

-- ===== Rechte =====
revoke all on function public.require_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.require_admin() to authenticated;
grant execute on function public.admin_users() to authenticated;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
grant execute on function public.admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
grant execute on function public.admin_games() to authenticated;
grant execute on function public.admin_delete_game(uuid) to authenticated;
grant execute on function public.admin_results() to authenticated;
grant execute on function public.admin_delete_result(uuid) to authenticated;
grant execute on function public.admin_reset_results() to authenticated;
grant execute on function public.admin_errors() to authenticated;
grant execute on function public.admin_clear_errors() to authenticated;

-- ===== Alp und Nico als Admins eintragen =====
-- (Name in Kleinbuchstaben + @kuhhandel.app. Hat Nico noch kein Konto, später im Admin-Bereich nachholen.)
insert into public.admins (user_id)
select id from auth.users where email in ('alp@kuhhandel.app', 'nico@kuhhandel.app')
on conflict do nothing;

-- Kontrolle: Wer ist Admin?
select u.email from public.admins a join auth.users u on u.id = a.user_id;
