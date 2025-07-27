interface NotificationConfig {
  dailyTime: string; // "HH:MM" format
  enabled: boolean;
  streakReminders: boolean;
  weeklyReports: boolean;
}

// Extender NotificationOptions para incluir propiedades PWA
interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: { action: string; title: string; icon?: string }[];
  vibrate?: number[];
}

interface StoredNotification {
  id: string;
  type: 'daily' | 'streak' | 'welcome' | 'weekly';
  scheduledTime: number; // timestamp
  userId: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private config: NotificationConfig | null = null;
  private userId: string | null = null;

  static getInstance(): NotificationService {
    if (!this.instance) {
      this.instance = new NotificationService();
    }
    return this.instance;
  }

  /**
   * 🔔 Inicializar servicio de notificaciones
   */
  async initialize(userId: string): Promise<boolean> {
    this.userId = userId;
    
    // Verificar soporte del navegador
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      
      return false;
    }

    // Verificar si el service worker está registrado
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      
      return false;
    }

    
    return true;
  }

  /**
   * 🙏 Solicitar permisos de notificación
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      
      return false;
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    const isGranted = permission === 'granted';
    
    if (isGranted) {
      
      // Mostrar notificación de bienvenida
      this.showWelcomeNotification();
    } else {
      
    }

    return isGranted;
  }

  /**
   * 🎉 Mostrar notificación de bienvenida
   */
  private showWelcomeNotification(): void {
    this.showNotification({
      title: '🙏 ¡Bienvenido a Devocionarios Bíblicos!',
      body: 'Te ayudaremos a mantener tu constancia en el estudio bíblico diario.',
      icon: '/icons/apple-touch-icon.png',
      badge: '/icons/icon-32x32.png',
      tag: 'welcome',
      requireInteraction: false,
    });
  }

  /**
   * 📖 Notificación de recordatorio diario
   */
  showDailyReminderNotification(): void {
    this.showNotification({
      title: '📖 ¡Hora de tu devocional!',
      body: 'Dedica unos minutos para conectar con Dios hoy.',
      icon: '/icons/apple-touch-icon.png',
      badge: '/icons/icon-32x32.png',
      tag: 'daily',
      requireInteraction: true,
      actions: [
        {
          action: 'open_app',
          title: '📱 Abrir App',
          icon: '/icons/icon-32x32.png'
        },
        {
          action: 'remind_later',
          title: '⏰ Recordar en 1 hora',
          icon: '/icons/icon-32x32.png'
        }
      ]
    });
  }

  /**
   * 🔥 Notificación de racha en peligro
   */
  showStreakReminderNotification(streak: number): void {
    this.showNotification({
      title: `🔥 ¡Tu racha de ${streak} días está en peligro!`,
      body: `No pierdas tu hermosa constancia. ¡Solo te tomará unos minutos!`,
      icon: '/icons/apple-touch-icon.png',
      badge: '/icons/icon-32x32.png',
      tag: 'streak',
      requireInteraction: true,
      actions: [
        {
          action: 'open_app',
          title: '🚀 ¡Vamos!',
          icon: '/icons/icon-32x32.png'
        }
      ]
    });
  }

  /**
   * 📊 Notificación de reporte semanal
   */
  showWeeklyReportNotification(stats: { completed: number, streak: number }): void {
    this.showNotification({
      title: '📊 Tu reporte semanal está listo',
      body: `Esta semana: ${stats.completed} devocionales completados. Racha actual: ${stats.streak} días.`,
      icon: '/icons/apple-touch-icon.png',
      badge: '/icons/icon-32x32.png',
      tag: 'weekly',
      requireInteraction: false,
    });
  }

  /**
   * 🔔 Mostrar notificación genérica
   */
  private async showNotification(options: ExtendedNotificationOptions & { title: string }): Promise<void> {
    if (Notification.permission !== 'granted') {
      
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const notificationOptions: any = {
        ...options,
        vibrate: [200, 100, 200], // Patrón de vibración
        timestamp: Date.now(),
        silent: false,
        data: {
          url: window.location.origin + '/home',
          userId: this.userId,
          timestamp: Date.now(),
        }
      };

      await registration.showNotification(options.title, notificationOptions);
      

    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }

  /**
   * ⏰ Programar notificación diaria
   */
  scheduleDailyNotification(time: string): void {
    if (!this.userId) return;

    // Cancelar notificación anterior
    this.cancelScheduledNotifications('daily');

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Si la hora ya pasó hoy, programar para mañana
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      this.showDailyReminderNotification();
      // Reprogramar para el siguiente día
      this.scheduleDailyNotification(time);
    }, timeUntilNotification);

    // Guardar referencia para poder cancelar
    localStorage.setItem(`notification_daily_${this.userId}`, timeoutId.toString());
    
    
  }

  /**
   * 🔥 Verificar y programar recordatorio de racha
   */
  checkAndScheduleStreakReminder(currentStreak: number): void {
    if (!this.userId || currentStreak === 0) return;

    // Verificar si ya hizo devocional hoy
    const today = new Date().toISOString().split('T')[0];
    const lastDevocionalDate = localStorage.getItem(`last_devocional_${this.userId}`);
    
    if (lastDevocionalDate === today) {
      // Ya hizo devocional hoy, no necesita recordatorio
      return;
    }

    // Programar recordatorio para las 8 PM si no ha hecho devocional
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0); // 8:00 PM

    if (reminderTime <= now) {
      // Si ya pasaron las 8 PM, programar para mañana temprano
      reminderTime.setDate(reminderTime.getDate() + 1);
      reminderTime.setHours(9, 0, 0, 0); // 9:00 AM
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      // Verificar nuevamente si ya hizo devocional
      const latestDevocionalDate = localStorage.getItem(`last_devocional_${this.userId}`);
      if (latestDevocionalDate !== today) {
        this.showStreakReminderNotification(currentStreak);
      }
    }, timeUntilReminder);
  }

  /**
   * ❌ Cancelar notificaciones programadas
   */
  private cancelScheduledNotifications(type: string): void {
    if (!this.userId) return;

    const timeoutId = localStorage.getItem(`notification_${type}_${this.userId}`);
    if (timeoutId) {
      clearTimeout(Number(timeoutId));
      localStorage.removeItem(`notification_${type}_${this.userId}`);
    }
  }

  /**
   * 💾 Guardar configuración de notificaciones
   */
  saveNotificationConfig(config: NotificationConfig): void {
    if (!this.userId) return;

    this.config = config;
    localStorage.setItem(`notification_config_${this.userId}`, JSON.stringify(config));

    if (config.enabled && config.dailyTime) {
      this.scheduleDailyNotification(config.dailyTime);
    } else {
      this.cancelScheduledNotifications('daily');
    }
  }

  /**
   * 📖 Cargar configuración de notificaciones
   */
  loadNotificationConfig(): NotificationConfig | null {
    if (!this.userId) return null;

    const stored = localStorage.getItem(`notification_config_${this.userId}`);
    if (stored) {
      this.config = JSON.parse(stored);
      return this.config;
    }

    // Configuración por defecto
    return {
      dailyTime: '08:00',
      enabled: false,
      streakReminders: true,
      weeklyReports: true,
    };
  }

  /**
   * ✅ Marcar devocional como completado (para controlar rachas)
   */
  markDevocionalCompleted(): void {
    if (!this.userId) return;
    
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`last_devocional_${this.userId}`, today);
  }
}

// 🔔 Exportar instancia singleton
export const notificationService = NotificationService.getInstance(); 