// 📱 OPCIÓN SOLO NOTIFICACIONES: 100% GRATIS SIN EMAILS
// 🎯 Usa únicamente notificaciones PWA nativas del teléfono

interface WelcomeNotificationData {
  userName: string;
  userEmail: string;
}

// Interfaz extendida para notificaciones PWA
interface ExtendedNotificationOptions extends NotificationOptions {
  image?: string;
  vibrate?: number[];
  actions?: { action: string; title: string; icon?: string }[];
}

export class NotificationOnlyService {
  /**
   * 🎉 Notificación de bienvenida (sin email)
   */
  static async showWelcomeNotification(data: WelcomeNotificationData): Promise<boolean> {
    try {
      

      // Verificar soporte de notificaciones
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        
        return false;
      }

      // Solicitar permisos si no los tiene
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        
        return false;
      }

      // Obtener service worker
      const registration = await navigator.serviceWorker.ready;

      // Mostrar notificación rica
      await registration.showNotification('🙏 ¡Bienvenido a Devocionarios Bíblicos!', {
        body: `¡Hola ${data.userName}! Tu viaje espiritual comienza aquí. Toca para continuar.`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        image: '/placeholder-logo.png', // Banner image
        vibrate: [200, 100, 200, 100, 200],
        tag: 'welcome-notification',
        renotify: true,
        requireInteraction: true, // No se cierra automáticamente
        actions: [
          {
            action: 'open-app',
            title: '📱 Abrir App',
            icon: '/icons/web-app-manifest-192x192.png'
          },
          {
            action: 'dismiss',
            title: '❌ Cerrar',
            icon: '/icons/web-app-manifest-192x192.png'
          }
        ],
        data: {
          url: '/home',
          type: 'welcome',
          userName: data.userName,
          timestamp: Date.now()
        }
      } as any);

      
      return true;

    } catch (error) {
      console.error('❌ Error mostrando notificación de bienvenida:', error);
      return false;
    }
  }

  /**
   * 🔥 Notificación de recordatorio de racha
   */
  static async showStreakReminder(userName: string, streak: number): Promise<boolean> {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification('🔥 ¡No pierdas tu racha!', {
        body: `${userName}, tienes ${streak} días consecutivos. ¡Sigue así! Dedica unos minutos hoy a tu estudio bíblico.`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [300, 200, 300],
        tag: 'streak-reminder',
        renotify: true,
        requireInteraction: true,
        actions: [
          {
            action: 'continue-streak',
            title: '🚀 Continuar Racha',
            icon: '/icons/web-app-manifest-192x192.png'
          },
          {
            action: 'remind-later',
            title: '⏰ Recordar más tarde',
            icon: '/icons/web-app-manifest-192x192.png'
          }
        ],
        data: {
          url: '/dashboard',
          type: 'streak',
          streak: streak,
          timestamp: Date.now()
        }
      } as any);

      
      return true;

    } catch (error) {
      console.error('❌ Error mostrando recordatorio:', error);
      return false;
    }
  }

  /**
   * 📊 Notificación de reporte semanal
   */
  static async showWeeklyReport(data: {
    userName: string;
    completed: number;
    streak: number;
    totalDevocionales: number;
  }): Promise<boolean> {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification('📊 Tu progreso semanal', {
        body: `${data.userName}, completaste ${data.completed} devocionales esta semana. Racha actual: ${data.streak} días. ¡Excelente trabajo!`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [100, 50, 100],
        tag: 'weekly-report',
        renotify: true,
        actions: [
          {
            action: 'view-progress',
            title: '📈 Ver Progreso',
            icon: '/icons/web-app-manifest-192x192.png'
          }
        ],
        data: {
          url: '/home',
          type: 'weekly-report',
          stats: data,
          timestamp: Date.now()
        }
      } as any);

      
      return true;

    } catch (error) {
      console.error('❌ Error mostrando reporte:', error);
      return false;
    }
  }

  /**
   * 🙏 Notificación de recordatorio diario
   */
  static async showDailyReminder(userName: string): Promise<boolean> {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;

      const verses = [
        '"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105',
        '"Toda la Escritura es inspirada por Dios y útil para enseñar." - 2 Timoteo 3:16',
        '"La palabra de Dios es viva y eficaz." - Hebreos 4:12',
        '"Bienaventurado el varón que medita en la ley del Señor." - Salmos 1:2',
        '"Escudriñad las Escrituras." - Juan 5:39'
      ];

      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      await registration.showNotification('🙏 Tiempo de oración y estudio', {
        body: `${userName}, dedica unos minutos a Dios hoy. ${randomVerse}`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'daily-reminder',
        renotify: true,
        actions: [
          {
            action: 'start-study',
            title: '📖 Iniciar Estudio',
            icon: '/icons/web-app-manifest-192x192.png'
          },
          {
            action: 'remind-1hour',
            title: '⏰ En 1 hora',
            icon: '/icons/web-app-manifest-192x192.png'
          }
        ],
        data: {
          url: '/dashboard',
          type: 'daily-reminder',
          verse: randomVerse,
          timestamp: Date.now()
        }
      } as any);

      
      return true;

    } catch (error) {
      console.error('❌ Error mostrando recordatorio diario:', error);
      return false;
    }
  }

  /**
   * 🔔 Verificar y solicitar permisos
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        
        return false;
      }

      if (!('serviceWorker' in navigator)) {
        
        return false;
      }

      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        
        return true;
      } else {
        
        return false;
      }

    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * 📅 Programar notificaciones recurrentes
   */
  static async scheduleRecurringNotifications(settings: {
    daily: boolean;
    streak: boolean;
    weekly: boolean;
    time: string; // "19:00"
    userName: string;
  }): Promise<void> {
    try {
      // Guardar configuración en localStorage
      localStorage.setItem('notification-settings', JSON.stringify(settings));

      

      // Mostrar notificación de confirmación
      if (await this.requestPermissions()) {
        const registration = await navigator.serviceWorker.ready;
        
        await registration.showNotification('⚙️ Configuración guardada', {
          body: `${settings.userName}, tus notificaciones están configuradas para las ${settings.time}`,
          icon: '/icons/web-app-manifest-192x192.png',
          tag: 'settings-saved',
          vibrate: [100],
          data: { type: 'settings-confirmation', timestamp: Date.now() }
        } as any);
      }

    } catch (error) {
      console.error('❌ Error programando notificaciones:', error);
    }
  }

  /**
   * 📈 Estadísticas de notificaciones
   */
  static getNotificationStats(): {
    supported: boolean;
    permission: NotificationPermission;
    serviceWorkerSupported: boolean;
  } {
    return {
      supported: 'Notification' in window,
      permission: 'Notification' in window ? Notification.permission : 'denied',
      serviceWorkerSupported: 'serviceWorker' in navigator,
    };
  }
}

/**
 * 🔧 VENTAJAS DE SOLO NOTIFICACIONES:
 * 
 * ✅ 100% GRATIS para siempre
 * ✅ No necesita configuración externa
 * ✅ Funciona offline
 * ✅ Nativo del sistema operativo
 * ✅ No depende de servicios de terceros
 * ✅ Mejor engagement en móviles
 * ✅ Personalizable con acciones
 * ✅ Soporte para vibración
 * ✅ Imágenes y iconos custom
 * 
 * ⚠️ LIMITACIONES:
 * - Requiere permisos del usuario
 * - Solo funciona si la app está instalada (PWA)
 * - No mantiene historial como emails
 * - Dependiente del navegador/OS
 * 
 * 📱 IDEAL PARA:
 * - Recordatorios diarios
 * - Alertas de racha
 * - Notificaciones inmediatas
 * - Apps que priorizan la experiencia móvil
 */ 