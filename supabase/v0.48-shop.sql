-- v0.48 Shop & Dublonen
-- NUR ALS ENTWURF: nicht automatisch ausführen.
--
-- SICHERHEITSGRENZE:
-- Die bestehende record_results-Definition (supabase/v0.8-konten.sql und
-- supabase/v0.28-statistik-push.sql) prüft Spielende und Mitspieler, vertraut
-- aber bei score/quartets/won auf p_rows aus dem Browser. Außerdem kann der
-- Client games.state aktualisieren. Dieser Entwurf leitet won und Prämien
-- aus games.state->'winner' ab, nicht aus p_rows.won. Das verhindert, dass
-- p_rows.won allein eine Prämie auslöst, ist aber KEIN manipulationssicherer
-- Siegnachweis, solange games.state clientseitig beschreibbar bleibt.
-- Dafür müsste die Spielzug-/Endstandsberechnung serverautoritativ werden.

-- 1. Wallet: bestehende und neue Accounts beginnen mit 0 Dublonen.
create table if not exists public.shop_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  active_avatar text,
  updated_at timestamptz not null default now()
);
alter table public.shop_wallets enable row level security;
drop policy if exists "shop_wallets_select_own" on public.shop_wallets;
create policy "shop_wallets_select_own" on public.shop_wallets
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.shop_wallets from anon, authenticated;

insert into public.shop_wallets (user_id, balance)
select id, 0 from auth.users
on conflict (user_id) do nothing;

create or replace function public.shop_create_wallet()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.shop_wallets (user_id, balance)
  values (new.id, 0) on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists shop_wallet_after_signup on auth.users;
create trigger shop_wallet_after_signup after insert on auth.users
for each row execute function public.shop_create_wallet();
revoke all on function public.shop_create_wallet() from public, anon, authenticated;

-- 2. Käufe: nur der jeweilige Spieler kann seine Käufe lesen.
create table if not exists public.shop_purchases (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  price integer not null check (price > 0),
  purchased_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.shop_purchases enable row level security;
drop policy if exists "shop_purchases_select_own" on public.shop_purchases;
create policy "shop_purchases_select_own" on public.shop_purchases
  for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.shop_purchases from anon, authenticated;

-- 3. Serverseitiger Festpreis, Sperre des Wallets und atomarer Kauf.
create or replace function public.shop_buy(p_item_id text)
returns table (new_balance integer, item_id text)
language plpgsql security definer set search_path = public
as $$
declare v_price integer; v_balance integer;
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  v_price := case p_item_id
    when 'noergler' then 30 when 'opa-ratte' then 30
    when 'business-huhn' then 30 when 'spar-schwein' then 30
    when 'boersen-gauner' then 40 when 'disco-kuh' then 40
    when 'raketen-esel' then 40 when 'piraten-papagei' then 40
    when 'daemonenritter' then 60 when 'cyborg-hahn' then 60
    when 'kuh-kaiser' then 60
    when 'spruch-ehrlich' then 10 when 'spruch-unehrlich' then 10
    when 'spruch-mehr' then 10 when 'spruch-bluff' then 10
    when 'spruch-niemals' then 10 when 'spruch-gutgespielt' then 10
    when 'spruch-verteuert' then 10 when 'spruch-gute-ideen' then 20
    else null end;
  if v_price is null then raise exception 'Unbekannter Shop-Artikel'; end if;

  insert into public.shop_wallets (user_id, balance)
  values (auth.uid(), 0) on conflict (user_id) do nothing;
  select w.balance into v_balance from public.shop_wallets w
   where w.user_id = auth.uid() for update;
  if exists (select 1 from public.shop_purchases p
             where p.user_id = auth.uid() and p.item_id = p_item_id) then
    raise exception 'Diesen Artikel hast du bereits';
  end if;
  if v_balance < v_price then raise exception 'Nicht genügend Dublonen'; end if;

  insert into public.shop_purchases (user_id, item_id, price)
  values (auth.uid(), p_item_id, v_price);
  update public.shop_wallets
     set balance = balance - v_price, updated_at = now()
   where user_id = auth.uid() returning balance into v_balance;
  return query select v_balance, p_item_id;
end $$;
revoke all on function public.shop_buy(text) from public, anon;
grant execute on function public.shop_buy(text) to authenticated;

-- 4. Nur gekaufte Avatare aktivieren.
create or replace function public.shop_set_avatar(p_avatar_id text)
returns text language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Bitte anmelden'; end if;
  if p_avatar_id not in ('noergler','opa-ratte','business-huhn','spar-schwein',
    'boersen-gauner','disco-kuh','raketen-esel','piraten-papagei',
    'daemonenritter','cyborg-hahn','kuh-kaiser') then
    raise exception 'Ungültiger Avatar';
  end if;
  if not exists (select 1 from public.shop_purchases
    where user_id = auth.uid() and item_id = p_avatar_id) then
    raise exception 'Diesen Avatar hast du nicht gekauft';
  end if;
  update public.shop_wallets set active_avatar = p_avatar_id, updated_at = now()
   where user_id = auth.uid();
  return p_avatar_id;
end $$;
revoke all on function public.shop_set_avatar(text) from public, anon;
grant execute on function public.shop_set_avatar(text) to authenticated;

-- 5. Eindeutige Siegprämie je Spiel und Spieler.
create table if not exists public.shop_win_rewards (
  game_id uuid not null,
  player_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null default 10 check (amount = 10),
  created_at timestamptz not null default now(),
  primary key (game_id, player_id)
);
alter table public.shop_win_rewards enable row level security;
drop policy if exists "shop_win_rewards_select_own" on public.shop_win_rewards;
create policy "shop_win_rewards_select_own" on public.shop_win_rewards
  for select to authenticated using (player_id = auth.uid());
revoke insert, update, delete on public.shop_win_rewards from anon, authenticated;

-- Interne Funktion; kein direkter RPC-Zugriff durch Clients.
create or replace function public.shop_credit_game_winners(p_game uuid)
returns void language plpgsql security definer set search_path = public
as $$
declare g public.games; v_player uuid;
begin
  select * into g from public.games where id = p_game;
  if g.id is null or g.status <> 'ended' then raise exception 'Spiel ist nicht beendet'; end if;

  for v_player in
    select distinct (pl.player->>'id')::uuid
      from jsonb_array_elements(g.players) as pl(player)
      join jsonb_array_elements_text(coalesce(g.state->'winner','[]'::jsonb)) as w(seat_id)
        on w.seat_id = coalesce(pl.player->>'seat', pl.player->>'id')
  loop
    with inserted as (
      insert into public.shop_win_rewards (game_id, player_id, amount)
      values (p_game, v_player, 10)
      on conflict (game_id, player_id) do nothing
      returning player_id
    )
    insert into public.shop_wallets (user_id, balance)
    select player_id, 10 from inserted
    on conflict (user_id) do update
      set balance = public.shop_wallets.balance + 10, updated_at = now();
  end loop;
end $$;
revoke all on function public.shop_credit_game_winners(uuid) from public, anon, authenticated;

-- 6. Aktuelle record_results-Funktion aus v0.28, erweitert um Prämie.
-- won wird aus gespeicherten Gewinner-IDs berechnet, nicht aus p_rows.won.
create or replace function public.record_results(p_game uuid, p_rows jsonb)
returns void language plpgsql security definer set search_path = public
as $$
declare g public.games;
begin
  select * into g from public.games where id = p_game;
  if g.id is null or g.status <> 'ended' then raise exception 'Spiel ist nicht beendet'; end if;
  if auth.uid() is null or not
    (g.players @> jsonb_build_array(jsonb_build_object('id', auth.uid()::text))) then
    raise exception 'Du sitzt nicht in diesem Spiel';
  end if;

  insert into public.game_results
    (game_id, player_id, name, score, quartets, won, players, extras)
  select p_game, (r->>'player_id')::uuid, left(r->>'name',16),
         (r->>'score')::int, (r->>'quartets')::int,
         exists (
           select 1
             from jsonb_array_elements(g.players) as pl(player)
             join jsonb_array_elements_text(coalesce(g.state->'winner','[]'::jsonb)) as w(seat_id)
               on w.seat_id = coalesce(pl.player->>'seat', pl.player->>'id')
            where pl.player->>'id' = r->>'player_id'
         ),
         jsonb_array_length(g.players),
         case when jsonb_typeof(r->'extras')='object' then r->'extras' else null end
    from jsonb_array_elements(p_rows) r
   where g.players @> jsonb_build_array(jsonb_build_object('id',r->>'player_id'))
  on conflict do nothing;

  perform public.shop_credit_game_winners(p_game);
end $$;
grant execute on function public.record_results(uuid, jsonb) to authenticated;

-- Ende v0.48 Shop SQL.
