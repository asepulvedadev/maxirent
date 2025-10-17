// Service Worker para MAXIRENT PWA
const CACHE_NAME = 'maxirent-v1.0.0';
const STATIC_CACHE = 'maxirent-static-v1.0.0';
const DYNAMIC_CACHE = 'maxirent-dynamic-v1.0.0';

// Recursos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// Recursos dinámicos comunes
const DYNAMIC_ASSETS = [
  '/api/',
  '/_next/static/',
  '/_next/image'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error durante instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Estrategia de cache: Cache First para recursos estáticos, Network First para dinámicos
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estrategia Cache First para recursos estáticos
  if (STATIC_ASSETS.some(asset => request.url.includes(asset)) ||
      request.url.includes('/_next/static/') ||
      request.url.includes('/favicon')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia Network First para recursos dinámicos
  if (request.url.includes('/api/') ||
      request.url.includes('/_next/image') ||
      request.method === 'POST' ||
      request.method === 'PUT' ||
      request.method === 'DELETE') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estrategia Stale While Revalidate para navegación
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Default: Cache First
  event.respondWith(cacheFirst(request));
});

// Estrategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    // Fallback para recursos críticos
    if (request.url.includes('/manifest.json')) {
      return new Response(JSON.stringify({
        name: "MAXIRENT - Gestión de Taller",
        short_name: "MAXIRENT",
        description: "Sistema de gestión de taller para MAXIRENT",
        start_url: "/",
        display: "standalone",
        background_color: "#171820",
        theme_color: "#df861d"
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
}

// Estrategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network First failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Manejo de mensajes desde el cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Manejo de notificaciones push (para futuras implementaciones)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Limpieza periódica de cache
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  const cacheNames = await caches.keys();
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  await Promise.all(
    cacheNames.map(cacheName => {
      if (!validCaches.includes(cacheName)) {
        return caches.delete(cacheName);
      }
    })
  );
}

// Monitoreo de estado de conexión
self.addEventListener('online', () => {
  console.log('Service Worker: Conexión restaurada');
  // Sincronizar datos pendientes cuando se restaure la conexión
  syncPendingData();
});

self.addEventListener('offline', () => {
  console.log('Service Worker: Sin conexión');
});

async function syncPendingData() {
  // Implementar sincronización de datos pendientes
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('background-sync');
  } catch (error) {
    console.log('Background sync not supported');
  }
}