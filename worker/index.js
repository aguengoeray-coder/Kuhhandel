// Cloudflare Worker: liefert die Spieldateien aus (statisch) und hält Supabase wach.
// Kostenlose Supabase-Projekte werden nach ca. 7 Tagen ohne Nutzung angehalten –
// deshalb fragt der Worker einmal am Tag kurz die Datenbank an (Zeitplan in wrangler.jsonc).
import { SUPABASE_URL, SUPABASE_KEY } from '../js/config.js';

export default {
  // Normale Aufrufe: Dateien werden schon vorher direkt ausgeliefert; hier landet nur, was es nicht gibt
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
  // Täglicher Zeitplan: eine kleine Anfrage an Supabase
  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetch(`${SUPABASE_URL}/rest/v1/games?select=id&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    }));
  },
};
