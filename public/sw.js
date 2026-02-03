// Service Worker PWA Phase 7 — YESSALATE Centrale DG (installable, offline, push)
// Phase 2 #2: NetworkFirst API étendu (dashboard, alerts, cockpit, chantiers, gouvernance)
const CACHE_NAME = 'yessalate-dg-v3';
const API_CACHE_NAME = 'yessalate-dg-api-v2';

/** Préfixes API à mettre en cache (NetworkFirst : réseau d'abord, cache en fallback offline) */
const API_CACHE_PREFIXES = [
  '/api/dashboard/',
  '/api/alerts/',
  '/api/cockpit/',
  '/api/chantiers/',
  '/api/governance/',
  '/api/gouvernance/',
  '/api/bureaux/',
  '/api/health/',
];

function shouldCacheApi(pathname) {
  return API_CACHE_PREFIXES.some(function (p) { return pathname.startsWith(p); });
}

const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/log_yessalate.png',
  '/maitre-ouvrage/dashboard',
  '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default',
  '/maitre-ouvrage/dashboard/r/pilotage/gouvernance/default',
  '/maitre-ouvrage/calendrier',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache).catch(function (err) {
        console.warn('[SW] Cache initial partiel:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (name) { return name !== CACHE_NAME && name !== API_CACHE_NAME; }).map(function (name) { return caches.delete(name); })
      );
    })
  );
  return self.clients.claim();
});

// Push Notifications Critiques (Phase 7)
self.addEventListener('push', function (event) {
  if (!event.data) return;
  try {
    var data = event.data.json();
    var options = {
      body: data.message || data.body || 'Nouvelle alerte',
      icon: '/icon-192.png',
      badge: '/images/log_yessalate.png',
      vibrate: [200, 100, 200],
      data: { chantierId: data.chantierId, url: data.url || (data.chantierId ? '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default?chantier=' + data.chantierId : '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default') },
      actions: [
        { action: 'VIEW', title: 'Voir Chantier' },
        { action: 'HUISSIER', title: 'Huissier' }
      ]
    };
    event.waitUntil(self.registration.showNotification('YESSALATE', options));
  } catch (e) {
    var text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('YESSALATE', { body: text || 'Alerte critique', icon: '/images/log_yessalate.png' })
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var data = event.notification.data || {};
  var url = data.url || '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default';
  if (event.action === 'VIEW' && data.chantierId) {
    url = '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default?chantier=' + data.chantierId;
  }
  if (event.action === 'HUISSIER') {
    url = '/maitre-ouvrage/dashboard/r/pilotage/dashboard/default?action=huissier&chantier=' + (data.chantierId || '');
  }
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(self.location.origin + (url.startsWith('/') ? url : '/' + url));
      }
    })
  );
});

// Offline: Network First, fallback cache. API dashboard: Network First + cache court (Phase 2 #2)
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/chantiers/health') || url.pathname === '/api/chantiers/health') {
    event.respondWith(
      fetch(event.request).catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || new Response(JSON.stringify({ error: 'Hors ligne' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
        });
      })
    );
    return;
  }
  if (shouldCacheApi(url.pathname)) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(API_CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return res;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || new Response(JSON.stringify({ error: 'Hors ligne', offline: true }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }
  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
      }
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return new Response(
            '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne - YESSALATE</title><style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0;padding:1rem;text-align:center}.msg{font-size:1.125rem;margin-bottom:1rem}.btn{display:inline-block;padding:0.5rem 1rem;background:#3b82f6;color:#fff;border-radius:0.5rem;text-decoration:none;font-weight:600;margin-top:0.5rem}.btn:hover{opacity:0.9}</style></head><body><p class="msg">Vous êtes hors ligne. Réessayez lorsque la connexion sera rétablie.</p><a href="/" class="btn">Réessayer</a></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
        return new Response('Hors ligne', { status: 503 });
      });
    })
  );
});
