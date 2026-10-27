const CACHE_NAME = 'celebrate-me-v5';

self.addEventListener('install', (event) => {
  // Force activate new SW immediately
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

// Notice: We deliberately do NOT intercept 'fetch' with a dummy/empty cache.
// An empty fetch event handler that catches errors and returns undefined
// causes mobile browsers (especially Chrome Android on unstable networks)
// to throw a fatal network error: "This page couldn't load".
// Letting the browser natively handle fetch ensures rock-solid network resilience.

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
