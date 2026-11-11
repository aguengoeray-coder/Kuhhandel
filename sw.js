// Service Worker: zeigt „Du bist dran“-Benachrichtigungen, wenn Kuhhandel zu ist.
// Er speichert nichts zwischen (keine Offline-Kopie), damit Updates sofort ankommen.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  event.waitUntil(self.registration.showNotification(data.title || 'Kuhhandel', {
    body: data.body || 'Du bist dran! 🐮',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: 'kuhhandel-dran',
    renotify: true,
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  })());
});
