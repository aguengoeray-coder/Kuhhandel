// Cloudflare Worker: liefert die Spieldateien aus (statisch), hält Supabase wach
// und verschickt Push-Benachrichtigungen („Du bist dran“).
// Kostenlose Supabase-Projekte werden nach ca. 7 Tagen ohne Nutzung angehalten –
// deshalb fragt der Worker einmal am Tag kurz die Datenbank an (Zeitplan in wrangler.jsonc).
import { SUPABASE_URL, SUPABASE_KEY, PUSH_PUBLIC_KEY } from '../js/config.js';

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlText = (s) => b64url(new TextEncoder().encode(s));

// VAPID-Ausweis (JWT, ES256) für den Push-Dienst des Handys
export async function vapidJwt(endpoint, privateJwk, now = Math.floor(Date.now() / 1000)) {
  const key = await crypto.subtle.importKey('jwk', privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const head = b64urlText(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const body = b64urlText(JSON.stringify({ aud: new URL(endpoint).origin, exp: now + 12 * 3600, sub: 'https://kuhhandel.a-guengoeray.workers.dev' }));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

// Leere Push-Nachricht senden – das Handy zeigt dann „Du bist dran!“ (sw.js)
async function sendPush(sub, env) {
  if (!sub?.endpoint) return;
  const jwt = await vapidJwt(sub.endpoint, JSON.parse(env.VAPID_PRIVATE_JWK));
  await fetch(sub.endpoint, {
    method: 'POST',
    headers: { TTL: '600', Urgency: 'high', Authorization: `vapid t=${jwt}, k=${PUSH_PUBLIC_KEY}`, 'Content-Length': '0' },
  });
}

export default {
  // Normale Aufrufe: Dateien werden schon vorher direkt ausgeliefert; hier landet nur, was es nicht gibt
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Supabase meldet: jemand ist dran → an seine Geräte schicken (nur mit Geheimwort)
    if (url.pathname === '/push' && request.method === 'POST') {
      if (!env.PUSH_SECRET || !env.VAPID_PRIVATE_JWK || request.headers.get('x-push-secret') !== env.PUSH_SECRET) {
        return new Response('nicht erlaubt', { status: 403 });
      }
      const data = await request.json().catch(() => ({}));
      ctx.waitUntil(Promise.all((data.subs || []).slice(0, 10).map((s) => sendPush(s, env).catch(() => {}))));
      return new Response('ok');
    }
    return env.ASSETS.fetch(request);
  },
  // Täglicher Zeitplan: eine kleine Anfrage an Supabase
  async scheduled(event, env, ctx) {
    ctx.waitUntil(fetch(`${SUPABASE_URL}/rest/v1/games?select=id&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    }));
  },
};
