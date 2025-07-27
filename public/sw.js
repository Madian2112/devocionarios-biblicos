// 📱 SERVICE WORKER - DEVOCIONARIOS BÍBLICOS
// 🎯 Optimizado para notificaciones PWA nativas

const CACHE_NAME = 'devocionarios-biblicos-v1';
const urlsToCache = [
  '/',
  '/home',
  '/dashboard',
  '/icons/web-app-manifest-192x192.png',
  '/icons/web-app-manifest-512x512.png'
];

// 🚀 Instalación del Service Worker
self.addEventListener('install', (event) => {
  
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        
        // Forzar activación inmediata
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
      
      // Tomar control inmediato de todas las páginas
      return self.clients.claim();
    })
  );
});

// 🌐 Intercepción de requests (caché offline)
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver desde caché si existe
        if (response) {
          return response;
        }
        
        // Fetch desde la red
        return fetch(event.request);
      }
    )
  );
});

// 🔔 MANEJO DE NOTIFICACIONES

// Mostrar notificación
self.addEventListener('notificationclick', (event) => {
  
  
  // Cerrar la notificación
  event.notification.close();
  
  const { url, type, action } = event.notification.data || {};
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            
            // Enviar mensaje al cliente sobre el clic
            client.postMessage({
              action: 'notification-click',
              data: { url, type, action }
            });
            
            // Navegar a la URL específica si se proporcionó
            if (url) {
              client.navigate(url);
            }
            
            return;
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
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
        // Buscar ventana existente
        const client = clientList.find(c => 
          c.url.includes(self.location.origin) && 'focus' in c
        );
        
        if (client) {
          client.focus();
          
          // Enviar acción al cliente
          client.postMessage({
            action: 'notification-action',
            data: { action, notificationData }
          });
          
          // Manejar acciones específicas
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
              // Programar recordatorio en 1 hora
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
          // Abrir nueva ventana si no existe
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

// 📱 Push messages (para futuras expansiones con servidor)
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

// 🔄 Sincronización en background (para futuras funcionalidades)
self.addEventListener('sync', (event) => {
  
  
  if (event.tag === 'background-sync-devocionales') {
    event.waitUntil(
      // Aquí podrías sincronizar datos cuando haya conexión
      syncDevocionales()
    );
  }
});

// 📊 Función para sincronizar devocionarios (placeholder)
async function syncDevocionales() {
  try {
    
    // Implementar lógica de sincronización
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Error sincronizando:', error);
    return Promise.reject(error);
  }
}

// 🎯 Eventos personalizados para estadísticas
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
  }
});

// 📈 Logging mejorado para debugging
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  
}

// 🚀 Inicialización
log('Service Worker inicializado para Devocionarios Bíblicos');

/**
 * 🔧 CARACTERÍSTICAS DE ESTE SERVICE WORKER:
 * 
 * ✅ Notificaciones ricas con acciones
 * ✅ Navegación inteligente según la acción
 * ✅ Manejo de ventanas existentes vs nuevas
 * ✅ Caché offline para recursos críticos
 * ✅ Comunicación bidireccional con la app
 * ✅ Programación de recordatorios
 * ✅ Soporte para push messages futuras
 * ✅ Background sync preparado
 * ✅ Logging detallado para debugging
 * ✅ Manejo robusto de errores
 * 
 * 📱 FUNCIONALIDAD ESPECÍFICA PARA DEVOCIONARIOS:
 * 
 * 🔔 Recordatorios inteligentes por hora del día
 * 📖 Acciones específicas (estudiar, ver progreso)
 * ⏰ Snooze de 1 hora para recordatorios
 * 🔥 Manejo especial de rachas
 * 📊 Navegación contextual según tipo de notificación
 * 🎯 Optimizado para engagement espiritual
 */ 