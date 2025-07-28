// 📱 SERVICE WORKER - DEVOCIONARIOS BÍBLICOS
// 🎯 Optimizado para notificaciones PWA nativas y caché de API
// 🔥 SOLUCIÓN: Mejorado para manejo de DOM en PWA

const CACHE_NAME = 'devocionarios-biblicos-v1.1'; // Incrementar versión
const urlsToCache = [
  '/',
  '/home',
  '/dashboard',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png',
  'https://api.biblesupersearch.com/api/books?language=es',
  'https://bible-api.deno.dev/api/versions' // Agregar caché para versiones
];

// 🚀 Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// ⚡ Activación del Service Worker
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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 🌐 Intercepción de requests (caché offline) - MEJORADO
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 🔥 SOLUCIÓN: Estrategia especial para APIs de Bible
  if (event.request.url.includes('bible-api.deno.dev')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            // Servir desde caché pero intentar actualizar en background
            fetch(event.request).then(networkResponse => {
              if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
              }
            }).catch(() => {
              // Ignorar errores de network en background update
            });
            return cachedResponse;
          }
          
          // No hay caché, intentar network
          return fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(error => {
            console.error('Error fetching Bible API:', error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Estrategia normal para otros recursos
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse.ok) {
            throw new Error('No se pudieron obtener los recursos');
          }
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch((error) => {
          console.error('Error en fetch:', error);
          throw error;
        });
      })
  );
});

// 🔔 MANEJO DE NOTIFICACIONES
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { url, type, action } = event.notification.data || {};

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({
              action: 'notification-click',
              data: { url, type, action }
            });
            if (url) {
              client.navigate(url);
            }
            return;
          }
        }
        if (clients.openWindow) {
          const targetUrl = url || '/home';
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Manejar acciones de notificación
self.addEventListener('notificationclick', (event) => {
  const { action } = event;
  const notificationData = event.notification.data || {};

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const client = clientList.find(c => 
          c.url.includes(self.location.origin) && 'focus' in c
        );

        if (client) {
          client.focus();
          client.postMessage({
            action: 'notification-action',
            data: { action, notificationData }
          });

          switch (action) {
            case 'start-study':
              client.navigate('/dashboard');
              break;
            case 'continue-streak':
              client.navigate('/dashboard');
              break;
            case 'view-progress':
            case 'view-stats':
              client.navigate('/home');
              break;
            case 'open-app':
              client.navigate(notificationData.url || '/home');
              break;
            case 'remind-1hour':
              setTimeout(() => {
                self.registration.showNotification('⏰ Recordatorio de Estudio', {
                  body: 'Es hora de dedicar tiempo a tu crecimiento espiritual.',
                  icon: '/icons/web-app-manifest-192x192.png',
                  badge: '/icons/web-app-manifest-192x192.png',
                  vibrate: [200, 100, 200],
                  tag: 'delayed-reminder',
                  requireInteraction: true,
                  data: {
                    url: '/dashboard',
                    type: 'delayed-reminder',
                    timestamp: Date.now()
                  }
                });
              }, 60 * 60 * 1000); // 1 hora
              break;
          }
        } else if (clients.openWindow) {
          let targetUrl = '/home';
          switch (action) {
            case 'start-study':
            case 'continue-streak':
              targetUrl = '/dashboard';
              break;
            case 'view-progress':
            case 'view-stats':
              targetUrl = '/home';
              break;
            case 'open-app':
              targetUrl = notificationData.url || '/home';
              break;
          }
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// 📱 Push messages
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/web-app-manifest-192x192.png',
    badge: '/icons/web-app-manifest-192x192.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 🔄 Sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-devocionales') {
    event.waitUntil(
      syncDevocionales()
    );
  }
});

// 📊 Función para sincronizar devocionarios (placeholder)
async function syncDevocionales() {
  try {
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
    return Promise.reject(error);
  }
}

// 🎯 Eventos personalizados para estadísticas - MEJORADO
self.addEventListener('message', (event) => {
  const { action, data } = event.data;

  switch (action) {
    case 'skip-waiting':
      self.skipWaiting();
      break;
    case 'claim-clients':
      self.clients.claim();
      break;
    case 'cache-urls':
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(data.urls);
        })
      );
      break;
    // 🔥 SOLUCIÓN: Nuevo evento para limpiar DOM en PWA
    case 'cleanup-dom':
      event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
          .then((clientList) => {
            clientList.forEach(client => {
              client.postMessage({
                action: 'cleanup-portal-elements',
                data: { instanceId: data.instanceId }
              });
            });
          })
      );
      break;
  }
});

// 📈 Logging mejorado para debugging
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[SW ${timestamp}] ${message}`, data);
}

// 🚀 Inicialización
log('Service Worker inicializado para Devocionarios Bíblicos v1.1');