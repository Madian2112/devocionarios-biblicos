// 📱 SISTEMA DE NOTIFICACIONES NATIVAS PROFESIONAL
// 🎯 Optimizado específicamente para Devocionarios Bíblicos
// 100% GRATIS - Sin dependencias externas

interface NotificationConfig {
  enabled: boolean;
  dailyReminder: boolean;
  streakReminder: boolean;
  weeklyReport: boolean;
  time: string; // "19:00"
  customVerse: boolean;
}

interface UserStats {
  streak: number;
  completedThisWeek: number;
  totalDevocionales: number;
  totalStudies: number;
}

export class NativeNotificationSystem {
  private static instance: NativeNotificationSystem;
  private config: NotificationConfig = {
    enabled: false,
    dailyReminder: true,
    streakReminder: true,
    weeklyReport: true,
    time: '19:00',
    customVerse: true
  };
  private userName: string = '';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  // 🔒 Singleton pattern
  static getInstance(): NativeNotificationSystem {
    if (!NativeNotificationSystem.instance) {
      NativeNotificationSystem.instance = new NativeNotificationSystem();
    }
    return NativeNotificationSystem.instance;
  }

  /**
   * 🚀 Inicializar el sistema completo
   */
  async initialize(userName: string): Promise<boolean> {
    try {
      
      this.userName = userName;
        
      // Verificar soporte del navegador
      if (!this.checkBrowserSupport()) {
        return false;
      }

      // Registrar Service Worker
      await this.registerServiceWorker();
      
      // Cargar configuración guardada
      this.loadConfig();
      
      // Configurar event listeners
      this.setupEventListeners();
      
      return true;

    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
      return false;
    }
  }

  /**
   * 🔍 Verificar soporte del navegador
   */
  private checkBrowserSupport(): boolean {
    const hasNotificationAPI = 'Notification' in window;
    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
  

    return hasNotificationAPI && hasServiceWorker;
  }

  /**
   * 🔔 Solicitar permisos de notificación
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        return false;
      }

      let permission = Notification.permission;
      
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      const granted = permission === 'granted';
      
      if (granted) {
        await this.showWelcomeNotification();
      } else {
      }

      return granted;

    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * 🔧 Registrar Service Worker
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.serviceWorkerRegistration = registration;
        
        
        // Esperar a que esté listo
        await navigator.serviceWorker.ready;
      }
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  }

  /**
   * 🎉 Notificación de bienvenida
   */
  private async showWelcomeNotification(): Promise<void> {
    try {
      if (!this.serviceWorkerRegistration) return;

      await this.serviceWorkerRegistration.showNotification('🙏 ¡Bienvenido a Devocionarios Bíblicos!', {
        body: `¡Hola ${this.userName}! Las notificaciones están activadas. Te recordaremos tus momentos de estudio diario.`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'welcome',
        requireInteraction: true,
        actions: [
          {
            action: 'open-app',
            title: '📱 Abrir App',
            icon: '/icons/web-app-manifest-192x192.png'
          }
        ],
        data: {
          url: '/home',
          type: 'welcome',
          timestamp: Date.now()
        }
      } as any);

    } catch (error) {
      console.error('❌ Error mostrando notificación de bienvenida:', error);
    }
  }

  /**
   * 🙏 Recordatorio diario personalizado
   */
  async showDailyReminder(): Promise<boolean> {
    try {
      // if (!this.canShowNotification()) return false;

      const verses = [
        '"Lámpara es a mis pies tu palabra, y lumbrera a mi camino." - Salmos 119:105',
        '"Toda la Escritura es inspirada por Dios y útil para enseñar." - 2 Timoteo 3:16',
        '"La palabra de Dios es viva y eficaz." - Hebreos 4:12',
        '"Bienaventurado el varón que medita en la ley del Señor día y noche." - Salmos 1:2',
        '"Escudriñad las Escrituras, porque a vosotros os parece que tenéis vida eterna." - Juan 5:39',
        '"El corazón del sabio busca la sabiduría." - Proverbios 15:14',
        '"Acerquémonos con confianza al trono de la gracia." - Hebreos 4:16',
        '"Busca primeramente el reino de Dios y su justicia." - Mateo 6:33'
      ];

      const randomVerse = verses[Math.floor(Math.random() * verses.length)];
      const currentHour = new Date().getHours();
      
      let greeting = '🌅 Buenos días';
      if (currentHour >= 12 && currentHour < 18) greeting = '☀️ Buenas tardes';
      if (currentHour >= 18) greeting = '🌙 Buenas noches';

      await this.serviceWorkerRegistration?.showNotification(`${greeting}, ${this.userName}`, {
        body: `Es momento de tu encuentro con Dios. ${randomVerse}`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [300, 200, 300],
        tag: 'daily-reminder',
        requireInteraction: true,
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
      console.error('❌ Error enviando recordatorio diario:', error);
      return false;
    }
  }

  /**
   * 🔥 Recordatorio de racha
   */
  async showStreakReminder(stats: UserStats): Promise<boolean> {
    try {
      // if (!this.canShowNotification()) return false;

      const streakEmojis = stats.streak >= 30 ? '🏆🔥' : stats.streak >= 14 ? '💪🔥' : '🔥';
      
      await this.serviceWorkerRegistration?.showNotification(`${streakEmojis} ¡${stats.streak} días consecutivos!`, {
        body: `${this.userName}, tienes una racha increíble. No la rompas hoy, dedica unos minutos a tu crecimiento espiritual.`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [100, 100, 100, 100, 100],
        tag: 'streak-reminder',
        requireInteraction: true,
        actions: [
          {
            action: 'continue-streak',
            title: '💪 Continuar Racha',
            icon: '/icons/web-app-manifest-192x192.png'
          },
          {
            action: 'view-progress',
            title: '📊 Ver Progreso',
            icon: '/icons/web-app-manifest-192x192.png'
          }
        ],
        data: {
          url: '/dashboard',
          type: 'streak-reminder',
          streak: stats.streak,
          timestamp: Date.now()
        }
      } as any);

      return true;

    } catch (error) {
      console.error('❌ Error enviando recordatorio de racha:', error);
      return false;
    }
  }

  /**
   * 📊 Reporte semanal
   */
  async showWeeklyReport(stats: UserStats): Promise<boolean> {
    try {
      // if (!this.canShowNotification()) return false;

      const completionRate = Math.round((stats.completedThisWeek / 7) * 100);
      
      let encouragement = '💪 ¡Sigue así!';
      if (completionRate >= 80) encouragement = '🏆 ¡Excelente semana!';
      else if (completionRate >= 60) encouragement = '⭐ ¡Muy buena semana!';
      else if (completionRate >= 40) encouragement = '👍 Buen progreso';
      else encouragement = '💪 ¡La próxima será mejor!';

      await this.serviceWorkerRegistration?.showNotification(`📊 Tu semana espiritual - ${encouragement}`, {
        body: `${this.userName}: ${stats.completedThisWeek} devocionales completados, racha de ${stats.streak} días. Total: ${stats.totalDevocionales} devocionales.`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'weekly-report',
        requireInteraction: false,
        actions: [
          {
            action: 'view-stats',
            title: '📈 Ver Estadísticas',
            icon: '/icons/web-app-manifest-192x192.png'
          }
        ],
        data: {
          url: '/home',
          type: 'weekly-report',
          stats: stats,
          timestamp: Date.now()
        }
      } as any);

      return true;

    } catch (error) {
      console.error('❌ Error enviando reporte semanal:', error);
      return false;
    }
  }

  /**
   * ⏰ Programar recordatorios
   */
  scheduleNotifications(): void {
    try {
      // Limpiar timers existentes
      this.clearScheduledNotifications();

      if (!this.config.enabled) {
        return;
      }

      const [hours, minutes] = this.config.time.split(':').map(Number);
      
      // Programar recordatorio diario
      if (this.config.dailyReminder) {
        this.scheduleDailyNotification(hours, minutes);
      }

      // Programar check de racha (30 minutos después del recordatorio diario)
      if (this.config.streakReminder) {
        this.scheduleStreakCheck(hours, minutes + 30);
      }

      // Programar reporte semanal (domingos a las 20:00)
      if (this.config.weeklyReport) {
        this.scheduleWeeklyReport();
      }


    } catch (error) {
      console.error('❌ Error programando notificaciones:', error);
    }
  }

  /**
   * 📅 Programar notificación diaria
   */
  private scheduleDailyNotification(hours: number, minutes: number): void {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // Si ya pasó la hora hoy, programar para mañana
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const msUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showDailyReminder();
      // Reprogramar para el siguiente día
      this.scheduleDailyNotification(hours, minutes);
    }, msUntilNotification);

  }

  /**
   * 🔥 Programar check de racha
   */
  private scheduleStreakCheck(hours: number, minutes: number): void {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const msUntilCheck = scheduledTime.getTime() - now.getTime();

    setTimeout(async () => {
      // Aquí verificarías si el usuario completó su devocional hoy
      // Si no lo hizo, envías el recordatorio de racha
      const hasCompletedToday = await this.checkIfCompletedToday();
      
      if (!hasCompletedToday) {
        const stats = await this.getUserStats();
        this.showStreakReminder(stats);
      }
      
      // Reprogramar para el siguiente día
      this.scheduleStreakCheck(hours, minutes);
    }, msUntilCheck);
  }

  /**
   * 📊 Programar reporte semanal
   */
  private scheduleWeeklyReport(): void {
    const now = new Date();
    const nextSunday = new Date();
    
    // Encontrar el próximo domingo a las 20:00
    const daysUntilSunday = (7 - now.getDay()) % 7;
    if (daysUntilSunday === 0 && now.getHours() >= 20) {
      // Si es domingo y ya pasaron las 20:00, programar para el siguiente domingo
      nextSunday.setDate(now.getDate() + 7);
    } else {
      nextSunday.setDate(now.getDate() + daysUntilSunday);
    }
    
    nextSunday.setHours(20, 0, 0, 0);

    const msUntilSunday = nextSunday.getTime() - now.getTime();

    setTimeout(async () => {
      const stats = await this.getUserStats();
      this.showWeeklyReport(stats);
      // Reprogramar para el siguiente domingo
      this.scheduleWeeklyReport();
    }, msUntilSunday);

  }

  /**
   * ⚙️ Configurar event listeners
   */
  private setupEventListeners(): void {
    // Listener para clics en notificaciones
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { action, data } = event.data;
        
        switch (action) {
          case 'notification-click':
            this.handleNotificationClick(data);
            break;
          case 'notification-action':
            this.handleNotificationAction(data);
            break;
        }
      });
    }

    // Listener para visibilidad de la página
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        // La página se volvió visible, verificar si hay notificaciones pendientes
        this.checkPendingNotifications();
      }
    });
  }

  /**
   * 🖱️ Manejar clic en notificación
   */
  private handleNotificationClick(data: any): void {
    
    // Redirigir según el tipo de notificación
    if (data.url) {
      window.focus();
      window.location.href = data.url;
    }
  }

  /**
   * ⚡ Manejar acciones de notificación
   */
  private handleNotificationAction(data: any): void {
    
    switch (data.action) {
      case 'start-study':
        window.location.href = '/dashboard';
        break;
      case 'remind-1hour':
        // Programar recordatorio en 1 hora
        setTimeout(() => {
          this.showDailyReminder();
        }, 60 * 60 * 1000);
        break;
      case 'continue-streak':
        window.location.href = '/dashboard';
        break;
      case 'view-progress':
      case 'view-stats':
        window.location.href = '/home';
        break;
    }
  }

  /**
   * 💾 Guardar configuración
   */
  saveConfig(config: NotificationConfig): void {
    this.config = { ...config };
    localStorage.setItem('notification-config', JSON.stringify(config));
    
    // Reprogramar notificaciones con la nueva configuración
    this.scheduleNotifications();
  }

  /**
   * 📖 Cargar configuración
   */
  private loadConfig(): void {
    try {
      const saved = localStorage.getItem('notification-config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
    }
  }

  /**
   * 🧹 Limpiar notificaciones programadas
   */
  private clearScheduledNotifications(): void {
    // Aquí almacenarías los IDs de los timeouts para poder cancelarlos
  }

  /**
   * ✅ Verificar si se puede mostrar notificación
   */
  private canShowNotification(): boolean {
    return this.config.enabled && 
           Notification.permission === 'granted' && 
           this.serviceWorkerRegistration !== null;
  }

  /**
   * 📊 Obtener estadísticas del usuario (mock - conectar con tu data)
   */
  private async getUserStats(): Promise<UserStats> {
    // Aquí conectarías con tu sistema de estadísticas real
    return {
      streak: 7,
      completedThisWeek: 5,
      totalDevocionales: 45,
      totalStudies: 12
    };
  }

  /**
   * ✅ Verificar si completó devocional hoy (mock - conectar con tu data)
   */
  private async checkIfCompletedToday(): Promise<boolean> {
    // Aquí verificarías en tu base de datos si completó el devocional hoy
    return false;
  }

  /**
   * 🔍 Verificar notificaciones pendientes
   */
  private checkPendingNotifications(): void {
    // Aquí podrías verificar si hay notificaciones que se perdieron
  }

  /**
   * 📊 Obtener estadísticas del sistema
   */
  getStats(): {
    supported: boolean;
    permission: NotificationPermission;
    serviceWorkerReady: boolean;
    config: NotificationConfig;
  } {
    return {
      supported: this.checkBrowserSupport(),
      permission: 'Notification' in window ? Notification.permission : 'denied',
      serviceWorkerReady: this.serviceWorkerRegistration !== null,
      config: this.config
    };
  }

  /**
   * 🧪 Enviar notificación de prueba
   */
  async sendTestNotification(): Promise<boolean> {
    try {
      // if (!this.canShowNotification()) {
      //   return false;
      // }


      await this.serviceWorkerRegistration?.showNotification('🧪 Notificación de Prueba', {
        body: `¡Perfecto ${this.userName}! Las notificaciones funcionan correctamente.`,
        icon: '/icons/web-app-manifest-192x192.png',
        badge: '/icons/web-app-manifest-192x192.png',
        vibrate: [100, 50, 100],
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          type: 'test',
          timestamp: Date.now()
        }
      } as any);

      return true;

    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
      return false;
    }
  }
}

// 🌟 Exportar instancia singleton
export const nativeNotificationSystem = NativeNotificationSystem.getInstance();

/**
 * 🔧 INSTRUCCIONES DE IMPLEMENTACIÓN:
 * 
 * 1. Crear Service Worker (public/sw.js)
 * 2. Integrar en tu AuthContext
 * 3. Usar en la página de Settings
 * 4. Conectar con tus datos reales
 * 
 * 📱 VENTAJAS DE ESTA IMPLEMENTACIÓN:
 * 
 * ✅ 100% GRATIS para siempre
 * ✅ Zero dependencias externas
 * ✅ Notificaciones ricas con acciones
 * ✅ Programación inteligente
 * ✅ Persistencia de configuración
 * ✅ Manejo de errores robusto
 * ✅ Soporte multi-plataforma
 * ✅ Versos bíblicos aleatorios
 * ✅ Saludos contextuales por hora
 * ✅ Estadísticas de racha
 * ✅ Reportes semanales automáticos
 * ✅ Recordatorios personalizables
 * ✅ Control total del comportamiento
 */ 