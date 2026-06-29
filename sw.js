const CACHE_NAME = 'sabor-caseiro-v2';
const ASSETS = [
  './',
  './index.html' // O seu arquivo principal
];

// 1. Salva o HTML estrutural na memória
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Remove caches antigos quando você atualizar o cardápio
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// 3. A MÁGICA DAS FOTOS INTERNET + OFFLINE
self.addEventListener('fetch', event => {
  // Ignora requisições de outras extensões (como ferramentas de desenvolvimento)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Se a foto ou página já estiver na memória, devolve ela imediatamente (Super Rápido!)
      if (cachedResponse) {
        // Devolve o salvo, mas tenta buscar na internet em segundo plano para atualizar se houver mudança
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignora erro se estiver offline */});
        
        return cachedResponse;
      }

      // Se não estava na memória, busca na internet normalmente
      return fetch(event.request).then(networkResponse => {
        // Se for uma resposta válida e for uma imagem ou página, guarda uma cópia na memória para a próxima vez
        if (networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se der erro de rede (totalmente offline) e não achou a foto específica, você pode colocar uma imagem padrão de erro aqui se quiser
      });
    })
  );
});
