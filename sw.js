const CACHE_NAME = 'sabor-caseiro-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './sw.js'
];

// 1. Salva os arquivos na memória
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Remove caches antigos quando você atualizar
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

// 3. A MÁGICA DAS FOTOS INTERNET + OFFLINE
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
