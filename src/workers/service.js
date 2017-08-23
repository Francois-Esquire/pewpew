const { assets, CACHE_NAME } = global.serviceWorkerOption;

// filter icons in assets based on platform;

function shouldCache(url) {
  if (url.endsWith('__hmr')) return false;
  else if (url.endsWith('.js')) {
    if (url.indexOf('hot') >= 0) return false;
  } else if (url.endsWith('.json')) {
    if (url.indexOf('hot-update') >= 0) return false;
  }
  return true;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assets))
      .catch(error => console.log(error)));
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = new Set([CACHE_NAME]);

  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(cacheName =>
        cacheWhitelist.has(cacheName) || caches.delete(cacheName)))));
});

self.addEventListener('fetch', (event) => {
  if (shouldCache(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then((match) => {
          if (match) return match;

          const fetchRequest = event.request.clone();

          // eslint-disable-next-line compat/compat
          return fetch(fetchRequest).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') return response;

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));

            return response;
          });
        }));
  }

  // self.clients.matchAll({
  //   includeUncontrolled: true,
  // }).then(c => console.log(c));
});

self.addEventListener('push', (event) => {
  if (self.Notification && self.notification.permission === 'granted') {
    let data = {};

    if (event.data) data = event.data.json();

    const title = data.title || 'Something Has Happened';
    const body = data.message || 'Here\'s something you might want to check out.';
    const icon = data.icon || 'images/new-notification.png';
    const tag = data.tag || 'simple-push-demo-notification';
    const action = data.action || 'open';
    const url = data.url;

    const notification = new Notification(title, {
      body,
      tag,
      icon,
    });

    notification.addEventListener('click', () => {
      const openWindow = self.clients.openWindow || function () { return undefined; };
      switch (action) {
        default: openWindow(url);
      }
    });
  }
});
