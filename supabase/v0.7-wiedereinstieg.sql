-- Kuhhandel v0.7: Wiedereinstieg per Code + PIN und automatisches Aufräumen
-- Im Supabase-Dashboard unter "SQL Editor" komplett einfügen und auf "Run" klicken.

-- PINs liegen in einer eigenen Tabelle, die niemand direkt lesen kann (nur über die Funktionen unten)
create table if not exists public.seat_pins (
  game_id uuid not null references public.games(id) on delete cascade,
  seat text not null,
  pin text not null,
  primary key (game_id, seat)
);
alter table public.seat_pins enable row level security;

-- Eigene PIN für ein Spiel holen (wird beim ersten Mal erzeugt)
create or replace function public.my_pin(p_game uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare g public.games; v_seat text; v_pin text;
begin
  select * into g from public.games where id = p_game;
  if g.id is null then raise exception 'Spiel nicht gefunden'; end if;
  select coalesce(p->>'seat', p->>'id') into v_seat
    from jsonb_array_elements(g.players) p where p->>'id' = auth.uid()::text;
  if v_seat is null then raise exception 'Du sitzt nicht in diesem Spiel'; end if;
  select pin into v_pin from public.seat_pins where game_id = p_game and seat = v_seat;
  if v_pin is null then
    loop
      v_pin := lpad((floor(random() * 10000))::int::text, 4, '0');
      exit when not exists (select 1 from public.seat_pins where game_id = p_game and pin = v_pin);
    end loop;
    insert into public.seat_pins (game_id, seat, pin) values (p_game, v_seat, v_pin);
  end if;
  return v_pin;
end $$;

-- Platz auf einem neuen Gerät übernehmen
create or replace function public.claim_seat(p_code text, p_pin text)
returns public.games
language plpgsql security definer set search_path = public
as $$
declare g public.games; v_seat text; v_old text;
begin
  select gm.* into g
    from public.games gm join public.seat_pins sp on sp.game_id = gm.id
   where upper(gm.code) = upper(trim(p_code)) and sp.pin = trim(p_pin) and gm.status in ('lobby', 'playing')
   order by gm.updated_at desc limit 1;
  if g.id is null then raise exception 'Code oder PIN stimmt nicht'; end if;
  select sp.seat into v_seat from public.seat_pins sp where sp.game_id = g.id and sp.pin = trim(p_pin);
  select p->>'id' into v_old from jsonb_array_elements(g.players) p where coalesce(p->>'seat', p->>'id') = v_seat;
  update public.games
     set players = (
           select jsonb_agg(
                    case when coalesce(p->>'seat', p->>'id') = v_seat
                         then jsonb_build_object('id', auth.uid()::text, 'name', p->>'name', 'seat', v_seat)
                         else p end
                    order by ord)
             from jsonb_array_elements(g.players) with ordinality as t(p, ord)),
         host = case when host::text = v_old then auth.uid() else host end,
         version = version + 1,
         updated_at = now()
   where id = g.id
   returning * into g;
  return g;
end $$;

-- Spiele, die seit 2 Tagen nicht mehr bewegt wurden, löschen
create or replace function public.cleanup_old_games()
returns void
language sql security definer set search_path = public
as $$ delete from public.games where updated_at < now() - interval '2 days'; $$;

grant execute on function public.my_pin(uuid) to authenticated;
grant execute on function public.claim_seat(text, text) to authenticated;
grant execute on function public.cleanup_old_games() to authenticated;
