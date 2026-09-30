// qBite SVCE Cafe - Service Worker v3 (Production Standalone PWA Safe)
const CACHE_NAME = 'qbite-v3-runtime';

const CORE_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/qbite-192.png',
  '/icons/qbite-512.png',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// 1. Install Event: Precache core shell assets and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CORE_SHELL_ASSETS).catch((err) => {
          console.warn('[SW] Core precache notice:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Wipe out all obsolete caches (including old v1/v2 caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Deleting obsolete cache store:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Safe Network-First for Navigation, Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore non-http(s) schemes (e.g., chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // STRICT EXCLUSION: Never intercept or cache Firebase Auth, Firestore, or external APIs
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('firestore')
  ) {
    return;
  }

  // A. Navigation / Document requests: NETWORK-FIRST with offline cache fallback
  // This guarantees that whenever online, the user always receives the fresh index.html
  // referencing the latest JavaScript chunk hashes, permanently avoiding white screens!
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', clone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cached = (await caches.match('/')) || (await caches.match('/index.html'));
          if (cached) return cached;
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>qBite · Offline</title>
                <style>
                  body { background: #080808; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
                  .card { max-width: 320px; padding: 24px; border-radius: 20px; background: #141414; border: 1px solid rgba(255,255,255,0.1); }
                  h1 { color: #FF6A00; font-size: 18px; margin-bottom: 8px; }
                  p { color: #A1A1A1; font-size: 13px; line-height: 1.5; }
                  button { margin-top: 16px; background: #FF6A00; color: #000; border: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>qBite · SVCE Cafe</h1>
                  <p>You are currently offline. Please reconnect to the SVCE campus Wi-Fi or mobile network to continue.</p>
                  <button onclick="window.location.reload()">Retry Connection</button>
                </div>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // B. Same-origin Static Assets (JS, CSS, images, fonts): Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});

// 4. Message Event: Remote control for instant updates and manual cache clearing
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    if (event.data.type === 'CLEAR_CACHE') {
      caches.keys().then((keys) => {
        return Promise.all(keys.map((k) => caches.delete(k)));
      });
    }
  }
});
