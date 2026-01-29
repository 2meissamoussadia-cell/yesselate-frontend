// Service Worker PWA V5 - Calendrier + Cockpit DG (installable, offline)
const CACHE_NAME = 'pwa-shell-v5';
const DATA_CACHE = 'calendrier-data-v1';
const COCKPIT_API_CACHE = 'cockpit-api-v1';

// Ressources à mettre en cache (shell PWA + pages clés + Cockpit DG + manifest + icône)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/images/log_yessalate.png',
  '/maitre-ouvrage/calendrier',
  '/maitre-ouvrage/dashboard',
  '/maitre-ouvrage/dashboard/cockpit',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installation PWA (shell + calendrier)');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Erreur lors du cache initial:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation PWA');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DATA_CACHE && name !== COCKPIT_API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Stratégie: Network First, puis Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // API Cockpit (briefing, predictions, chantiers) — Network First, cache en fallback offline
  if (
    url.pathname === '/api/ai/briefing' ||
    url.pathname === '/api/ai/predictions' ||
    url.pathname === '/api/cockpit/chantiers'
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(COCKPIT_API_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: 'Hors ligne', cached: false }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Pour les données du calendrier, utiliser Cache First
  if (url.pathname.includes('/calendrier') || url.pathname.includes('/api/calendrier')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Retourner le cache immédiatement
            fetch(request)
              .then((networkResponse) => {
                if (networkResponse.ok) {
                  cache.put(request, networkResponse.clone());
                }
              })
              .catch(() => {
                // Hors ligne, utiliser le cache
              });
            return cachedResponse;
          }

          // Pas de cache, essayer le réseau
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Hors ligne et pas de cache
              return new Response(
                JSON.stringify({ error: 'Hors ligne', cached: false }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
        });
      })
    );
    return;
  }

  // Pour les autres ressources, Network First
  const isNavigation = request.mode === 'navigate' || (request.headers.get('Accept') || '').includes('text/html');
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (isNavigation) {
            const offlineHtml = '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors ligne</title><style>body{font-family:system-ui,sans-serif;background:#0F0F11;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0;padding:1rem;text-align:center}.msg{font-size:1.125rem;margin-bottom:1rem}.btn{display:inline-block;padding:0.5rem 1rem;background:#F97316;color:#fff;border-radius:0.5rem;text-decoration:none;font-weight:600;margin-top:0.5rem}.btn:hover{opacity:0.9}</style></head><body><p class="msg">Vous êtes hors ligne. Réessayez lorsque la connexion sera rétablie.</p><a href="/" class="btn">Réessayer</a></body></html>';
            return new Response(offlineHtml, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
          }
          return new Response('Hors ligne', { status: 503 });
        });
      })
  );
});

// Web Push — afficher la notification reçue
self.addEventListener('push', function (event) {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'Cockpit DG';
    const body = data.body || '';
    const options = {
      body: body,
      icon: '/images/log_yessalate.png',
      badge: '/images/log_yessalate.png',
      tag: 'cockpit-push',
      data: { url: data.url || '/maitre-ouvrage/dashboard' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    const text = event.data.text();
    event.waitUntil(
      self.registration.showNotification('Cockpit DG', { body: text || 'Nouvelle alerte' })
    );
  }
});

// Clic sur la notification — ouvrir l’app
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/maitre-ouvrage/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
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

// Gestion des messages depuis l'application
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CALENDRIER_DATA') {
    const { data } = event.data;
    caches.open(DATA_CACHE).then((cache) => {
      cache.put(
        new Request('/calendrier/data'),
        new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  }

  if (event.data && event.data.type === 'GET_CALENDRIER_DATA') {
    caches.open(DATA_CACHE).then((cache) => {
      cache.match('/calendrier/data').then((response) => {
        if (response) {
          response.json().then((data) => {
            event.ports[0].postMessage({ success: true, data });
          });
        } else {
          event.ports[0].postMessage({ success: false, data: null });
        }
      });
    });
  }
});

