// 🎯 SISTEMA HÍBRIDO DE NOTIFICACIONES
// 📧 Emails (Brevo) para casos importantes + 📱 Notificaciones nativas para recordatorios

import { BrevoEmailService } from './brevo-email-service';
import { nativeNotificationSystem } from './native-notification-system';

interface WelcomeData {
  userName: string;
  userEmail: string;
}

interface UserStats {
  streak: number;
  completedThisWeek: number;
  totalDevocionales: number;
  totalStudies: number;
}

interface NotificationPreferences {
  emailEnabled: boolean;
  nativeEnabled: boolean;
  dailyReminder: boolean;
  streakReminder: boolean;
  weeklyReport: boolean;
  reminderTime: string;
}

export class HybridNotificationSystem {
  private static instance: HybridNotificationSystem;
  
  static getInstance(): HybridNotificationSystem {
    if (!HybridNotificationSystem.instance) {
      HybridNotificationSystem.instance = new HybridNotificationSystem();
    }
    return HybridNotificationSystem.instance;
  }

  /**
   * 🚀 Inicializar sistema híbrido completo
   */
  async initialize(userName: string, userEmail: string): Promise<{
    emailReady: boolean;
    nativeReady: boolean;
  }> {
    console.log('🚀 Inicializando sistema híbrido de notificaciones...');

    try {
      // Inicializar sistema nativo (paralelo)
      const nativeReady = await nativeNotificationSystem.initialize(userName);
      
      // Email siempre está listo con Brevo (no requiere inicialización)
      const emailReady = true;
      
      console.log('✅ Sistema híbrido inicializado:', { emailReady, nativeReady });
      
      return { emailReady, nativeReady };
      
    } catch (error) {
      console.error('❌ Error inicializando sistema híbrido:', error);
      return { emailReady: false, nativeReady: false };
    }
  }

  /**
   * 🎉 BIENVENIDA COMPLETA (Email + Notificación)
   */
  async sendWelcome(data: WelcomeData): Promise<{
    emailSent: boolean;
    notificationShown: boolean;
  }> {
    console.log('🎉 Enviando bienvenida híbrida...');

    // 📧 Email de bienvenida (Brevo) - IMPORTANTE, debe persistir
    const emailPromise = BrevoEmailService.sendWelcomeEmail(data)
      .catch(error => {
        console.error('❌ Error email bienvenida:', error);
        return false;
      });

    // 📱 Notificación nativa - Para engagement inmediato
    const notificationPromise = nativeNotificationSystem.requestPermission()
      .catch(error => {
        console.error('❌ Error notificación bienvenida:', error);
        return false;
      });

    // Ejecutar en paralelo para máxima velocidad
    const [emailSent, notificationShown] = await Promise.all([
      emailPromise,
      notificationPromise
    ]);

    console.log('🎉 Bienvenida híbrida completada:', { emailSent, notificationShown });
    
    return { emailSent, notificationShown };
  }

  /**
   * 🔑 RESET PASSWORD (Email personalizado complementario)
   */
  async sendPasswordReset(userEmail: string): Promise<boolean> {
    console.log('🔑 Enviando email personalizado de reset password...');
    
    try {
      // Usar nueva función específica de reset password en Brevo
      const emailSent = await BrevoEmailService.sendPasswordResetEmail({
        userEmail: userEmail
      });

      if (emailSent) {
        console.log('✅ Email personalizado de reset password enviado');
      } else {
        console.log('⚠️ Error enviando email personalizado de reset password');
      }

      return emailSent;

    } catch (error) {
      console.error('❌ Error en reset password personalizado:', error);
      return false;
    }
  }

  /**
   * 🙏 RECORDATORIO DIARIO (Solo Notificación Nativa)
   */
  async sendDailyReminder(): Promise<boolean> {
    console.log('🙏 Enviando recordatorio diario...');
    
    try {
      // Solo notificación nativa - para engagement inmediato
      const sent = await nativeNotificationSystem.showDailyReminder();
      
      if (sent) {
        console.log('✅ Recordatorio diario enviado');
      } else {
        console.log('⚠️ No se pudo enviar recordatorio diario');
      }

      return sent;

    } catch (error) {
      console.error('❌ Error enviando recordatorio diario:', error);
      return false;
    }
  }

  /**
   * 🔥 RECORDATORIO DE RACHA (Solo Notificación Nativa)
   */
  async sendStreakReminder(stats: UserStats): Promise<boolean> {
    console.log('🔥 Enviando recordatorio de racha...');
    
    try {
      // Solo notificación nativa - para engagement inmediato
      const sent = await nativeNotificationSystem.showStreakReminder(stats);
      
      if (sent) {
        console.log('✅ Recordatorio de racha enviado');
      } else {
        console.log('⚠️ No se pudo enviar recordatorio de racha');
      }

      return sent;

    } catch (error) {
      console.error('❌ Error enviando recordatorio de racha:', error);
      return false;
    }
  }

  /**
   * 📊 REPORTE SEMANAL (Ambos - Email + Notificación)
   */
  async sendWeeklyReport(data: WelcomeData & UserStats): Promise<{
    emailSent: boolean;
    notificationShown: boolean;
  }> {
    console.log('📊 Enviando reporte semanal híbrido...');

    // 📧 Email detallado (persistente, se puede revisar después)
    const emailData = {
      ...data,
      completed: data.completedThisWeek // Mapear correctamente
    };
    
    const emailPromise = BrevoEmailService.sendWelcomeEmail(emailData) // Por ahora usar sendWelcomeEmail
      .catch(error => {
        console.error('❌ Error email reporte:', error);
        return false;
      });

    // 📱 Notificación nativa (engagement inmediato)
    const notificationPromise = nativeNotificationSystem.showWeeklyReport(data)
      .catch(error => {
        console.error('❌ Error notificación reporte:', error);
        return false;
      });

    // Ejecutar en paralelo
    const [emailSent, notificationShown] = await Promise.all([
      emailPromise,
      notificationPromise
    ]);

    console.log('📊 Reporte semanal híbrido completado:', { emailSent, notificationShown });
    
    return { emailSent, notificationShown };
  }

  /**
   * ⚙️ CONFIGURAR PREFERENCIAS
   */
  async configurePreferences(prefs: NotificationPreferences): Promise<boolean> {
    console.log('⚙️ Configurando preferencias híbridas:', prefs);

    try {
      // Configurar sistema nativo
      if (prefs.nativeEnabled) {
        nativeNotificationSystem.saveConfig({
          enabled: prefs.nativeEnabled,
          dailyReminder: prefs.dailyReminder,
          streakReminder: prefs.streakReminder,
          weeklyReport: prefs.weeklyReport,
          time: prefs.reminderTime,
          customVerse: true
        });

        // Programar notificaciones
        nativeNotificationSystem.scheduleNotifications();
      }

      // Guardar preferencias híbridas
      localStorage.setItem('hybrid-notification-prefs', JSON.stringify(prefs));
      
      console.log('✅ Preferencias híbridas configuradas');
      return true;

    } catch (error) {
      console.error('❌ Error configurando preferencias:', error);
      return false;
    }
  }

  /**
   * 📖 CARGAR PREFERENCIAS
   */
  getPreferences(): NotificationPreferences {
    try {
      const saved = localStorage.getItem('hybrid-notification-prefs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('❌ Error cargando preferencias:', error);
    }

    // Valores por defecto
    return {
      emailEnabled: true,
      nativeEnabled: true,
      dailyReminder: true,
      streakReminder: true,
      weeklyReport: true,
      reminderTime: '19:00'
    };
  }

  /**
   * 🧪 ENVIAR NOTIFICACIONES DE PRUEBA
   */
  async sendTestNotifications(data: WelcomeData): Promise<{
    emailSent: boolean;
    notificationShown: boolean;
  }> {
    console.log('🧪 Enviando notificaciones de prueba...');

    // 📧 Email de prueba
    const emailPromise = BrevoEmailService.sendWelcomeEmail({
      ...data,
      userName: `${data.userName} (Prueba)`
    }).catch(() => false);

    // 📱 Notificación de prueba
    const notificationPromise = nativeNotificationSystem.sendTestNotification()
      .catch(() => false);

    const [emailSent, notificationShown] = await Promise.all([
      emailPromise,
      notificationPromise
    ]);

    console.log('🧪 Pruebas completadas:', { emailSent, notificationShown });
    
    return { emailSent, notificationShown };
  }

  /**
   * 📊 OBTENER ESTADO DEL SISTEMA
   */
  getSystemStatus(): {
    email: {
      service: string;
      available: boolean;
    };
    native: {
      supported: boolean;
      permission: NotificationPermission;
      serviceWorkerReady: boolean;
    };
    preferences: NotificationPreferences;
  } {
    const nativeStats = nativeNotificationSystem.getStats();
    
    return {
      email: {
        service: 'Brevo',
        available: true // Brevo siempre disponible
      },
      native: {
        supported: nativeStats.supported,
        permission: nativeStats.permission,
        serviceWorkerReady: nativeStats.serviceWorkerReady
      },
      preferences: this.getPreferences()
    };
  }

  /**
   * 🔄 INICIALIZAR RECORDATORIOS AUTOMÁTICOS
   */
  startAutomaticReminders(): void {
    console.log('🔄 Iniciando recordatorios automáticos...');
    
    const prefs = this.getPreferences();
    
    if (prefs.nativeEnabled) {
      nativeNotificationSystem.scheduleNotifications();
      console.log('✅ Recordatorios automáticos iniciados');
    } else {
      console.log('📵 Recordatorios automáticos deshabilitados');
    }
  }

  /**
   * 🛑 DETENER RECORDATORIOS AUTOMÁTICOS
   */
  stopAutomaticReminders(): void {
    console.log('🛑 Deteniendo recordatorios automáticos...');
    
    // Deshabilitar notificaciones nativas
    nativeNotificationSystem.saveConfig({
      enabled: false,
      dailyReminder: false,
      streakReminder: false,
      weeklyReport: false,
      time: '19:00',
      customVerse: true
    });
    
    console.log('✅ Recordatorios automáticos detenidos');
  }
}

// 🌟 Exportar instancia singleton
export const hybridNotificationSystem = HybridNotificationSystem.getInstance();

/**
 * 🎯 ESTRATEGIA HÍBRIDA PERFECTA:
 * 
 * 📧 EMAILS (BREVO) PARA:
 * ✅ Bienvenida - Mensaje importante que debe persistir
 * ✅ Reset Password - Crítico, debe ser confiable
 * ✅ Reportes semanales - Información detallada para revisar
 * ✅ Notificaciones especiales - Ocasionales e importantes
 * 
 * 📱 NOTIFICACIONES NATIVAS PARA:
 * ✅ Recordatorios diarios - Engagement inmediato
 * ✅ Recordatorios de racha - Motivación en tiempo real
 * ✅ Alertas de progreso - Feedback instantáneo
 * ✅ Todo lo que requiere acción inmediata
 * 
 * 💡 BENEFICIOS DE ESTA ESTRATEGIA:
 * 
 * 🎯 Máximo engagement con notificaciones nativas
 * 📧 Persistencia con emails importantes
 * 💰 100% gratis para ambos sistemas
 * ⚡ Paralelo = máxima velocidad
 * 🔧 Control total del comportamiento
 * 📊 Estadísticas completas
 * 🚀 Escalable y mantenible
 * 
 * 🔥 EL MEJOR DE AMBOS MUNDOS! 🔥
 */ 