const CACHE_NAME = 'celebrate-me-v10';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Important: Do NOT intercept network fetch requests with a broken catch handler.
// Returning undefined from an empty cache causes mobile Chrome on weak/fluctuating
// connections to crash with "This page couldn't load".
// Allowing native browser fetch ensures full network resilience and auto-retries.

self.addEventListener('push', function(event) {
  let title = "CelebrateMe Message";
  let body = "You have a new celebration notification!";
  let icon = undefined;

  if (event.data) {
    try {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      icon = data.icon;
    } catch(e) {
      body = event.data.text();
    }
  }

  const options = {
    body,
    icon,
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
