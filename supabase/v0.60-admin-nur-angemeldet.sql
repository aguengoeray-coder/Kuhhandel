-- ============================================================================
-- v0.60 Sicherheit: Admin-Funktionen nur noch für angemeldete Nutzer aufrufbar
-- ============================================================================
-- Supabase-Advisor „Public Can Execute SECURITY DEFINER Function“ (Alps „ja“ 13.11.2026).
-- Bisher durften auch NICHT angemeldete Aufrufer (Rolle anon, nur mit dem öffentlichen Key)
-- die admin_*-Funktionen aufrufen. Jede prüft zwar selbst, ob der Aufrufer Admin ist –
-- ohne Anmeldung gibt es aber keinen Grund, sie überhaupt erreichen zu dürfen.
-- Die App ruft sie nur im Admin-Bereich auf (immer angemeldet) → keine App-Änderung nötig.
-- Idempotent: mehrfaches Ausführen schadet nicht. Löscht/ändert keine Daten.
--
-- Rückweg (falls etwas klemmt): dieselben Zeilen mit „grant execute … to anon;“ ausführen.
-- ============================================================================

revoke execute on function public.admin_clear_errors() from public, anon;
grant execute on function public.admin_clear_errors() to authenticated;
revoke execute on function public.admin_delete_game(uuid) from public, anon;
grant execute on function public.admin_delete_game(uuid) to authenticated;
revoke execute on function public.admin_delete_result(uuid) from public, anon;
grant execute on function public.admin_delete_result(uuid) to authenticated;
revoke execute on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;
revoke execute on function public.admin_errors() from public, anon;
grant execute on function public.admin_errors() to authenticated;
revoke execute on function public.admin_games() from public, anon;
grant execute on function public.admin_games() to authenticated;
revoke execute on function public.admin_reset_results() from public, anon;
grant execute on function public.admin_reset_results() to authenticated;
revoke execute on function public.admin_results() from public, anon;
grant execute on function public.admin_results() to authenticated;
revoke execute on function public.admin_set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
revoke execute on function public.admin_set_password(uuid, text) from public, anon;
grant execute on function public.admin_set_password(uuid, text) to authenticated;
revoke execute on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;

-- Prüfung: muss 0 Zeilen liefern (kein admin_* mehr für anon ausführbar)
-- select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--  where n.nspname = 'public' and p.proname like 'admin\_%' and has_function_privilege('anon', p.oid, 'execute');
