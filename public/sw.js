// QBite SVCE Cafe - Service Worker v5 (Web Responsive & Fast Mobile Sync)
const CACHE_NAME = 'qbite-v5-web-responsive';

const CORE_SHELL_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/icons/qbite-icon-192.png',
  '/icons/qbite-icon-512.png',
  '/icons/qbite-maskable-512.png',
  '/icons/qbite-apple-touch-icon.png',
  '/icons/qbite-logo.svg'
];

// 1. Install Event: Cache core shell and activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(CORE_SHELL_ASSETS).catch((err) => {
          console.warn('[SW] Precache notice:', err);
        });
      })
  );
});

// 2. Activate Event: Wipe out all obsolete caches and broadcast update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('[SW] Purging old cache store:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_UPDATED', version: CACHE_NAME });
          });
        });
      })
  );
});

// 3. Fetch Event: Strict Network-First for Navigation, Network-First for Assets with Cache Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // STRICT EXCLUSION: Never intercept or cache Firebase, APIs, or dev modules
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('google.com') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('firestore') ||
    url.pathname.startsWith('/@') ||
    url.pathname.includes('node_modules')
  ) {
    return;
  }

  // A. Navigation / HTML Document requests: ALWAYS NETWORK FIRST
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
          const cached = (await caches.match('/')) || (await caches.match('/index.html'));
          if (cached) return cached;
          return new Response(
            `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>QBite · SVCE Cafe</title>
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
                  <h1>QBite · SVCE Cafe</h1>
                  <p>You are currently offline. Please reconnect to mobile data or SVCE Wi-Fi to load fresh orders.</p>
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

  // B. Same-origin Static Assets: Network-first with cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
});

// 4. Remote Control Messages
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
