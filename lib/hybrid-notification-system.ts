// 🚀 NATIVE NOTIFICATION SYSTEM - Solo PWA
// 📱 Sistema de notificaciones nativas optimizado
// 🎯 Sin configuración de emails - Solo notificaciones del teléfono

import { NativeNotificationSystem } from './native-notification-system'

export class NotificationSystemWrapper {
  private static instance: NotificationSystemWrapper
  private nativeNotifications: NativeNotificationSystem
  private isInitialized: boolean = false

  constructor() {
    this.nativeNotifications = NativeNotificationSystem.getInstance()
  }

  static getInstance(): NotificationSystemWrapper {
    if (!NotificationSystemWrapper.instance) {
      NotificationSystemWrapper.instance = new NotificationSystemWrapper()
    }
    return NotificationSystemWrapper.instance
  }

  /**
   * 🔧 Inicializar solo notificaciones nativas
   */
  async initialize(userName: string): Promise<boolean> {
    

    try {
      // Inicializar notificaciones nativas
      const nativeReady = await this.nativeNotifications.initialize(userName)
      

      this.isInitialized = true
      
      return true

    } catch (error) {
      console.error('💥 Error inicializando notificaciones PWA:', error)
      this.isInitialized = false
      return false
    }
  }

  /**
   * 🌟 Configurar notificaciones de bienvenida (Solo solicitar permisos)
   */
  async setupWelcomeNotifications(userName: string): Promise<boolean> {
    

    try {
      // 📱 Solicitar permisos para notificaciones
      
      const notificationResult = await this.nativeNotifications.requestPermission()
      
      if (notificationResult) {
        
        // Enviar notificación de prueba como bienvenida
        await this.nativeNotifications.sendTestNotification()
      } else {
        console.warn('⚠️ Permisos de notificación denegados')
      }

      return notificationResult

    } catch (error: any) {
      console.error('💥 Error configurando notificaciones:', error)
      return false
    }
  }

  /**
   * 🔥 Enviar recordatorio de racha (Solo Notificación)
   */
  async sendStreakReminder(userName: string, streak: number): Promise<boolean> {
    

    try {
      const stats = {
        streak: streak,
        completedThisWeek: 0,
        totalDevocionales: 0,
        totalStudies: 0
      }
      
      const notificationResult = await this.nativeNotifications.showStreakReminder(stats)
      
      if (notificationResult) {
        
      } else {
        console.warn('⚠️ No se pudo enviar recordatorio de racha')
      }

      return notificationResult

    } catch (error: any) {
      console.error('💥 Error enviando recordatorio de racha:', error)
      return false
    }
  }

  /**
   * ⏰ Enviar recordatorio diario (Solo Notificación)
   */
  async sendDailyReminder(userName: string): Promise<boolean> {
    

    try {
      const notificationResult = await this.nativeNotifications.showDailyReminder()
      
      if (notificationResult) {
        
      } else {
        console.warn('⚠️ No se pudo enviar recordatorio diario')
      }

      return notificationResult

    } catch (error: any) {
      console.error('💥 Error enviando recordatorio diario:', error)
      return false
    }
  }

  /**
   * 📊 Enviar reporte semanal (Solo Notificación)
   */
  async sendWeeklyReport(userName: string, stats: any): Promise<boolean> {
    

    try {
      const weeklyStats = {
        streak: stats.racha || 0,
        completedThisWeek: stats.completados || 0,
        totalDevocionales: stats.totalDevocionales || 0,
        totalStudies: stats.totalEstudios || 0
      }
      
      const notificationResult = await this.nativeNotifications.showWeeklyReport(weeklyStats)
      
      if (notificationResult) {
        
      } else {
        console.warn('⚠️ No se pudo enviar reporte semanal')
      }

      return notificationResult

    } catch (error: any) {
      console.error('💥 Error enviando reporte semanal:', error)
      return false
    }
  }

  /**
   * 🧪 Enviar notificación de prueba
   */
  async sendTestNotifications(): Promise<boolean> {
    

    try {
      const result = await this.nativeNotifications.sendTestNotification()
      
      if (result) {
        
      } else {
        console.warn('⚠️ No se pudo enviar notificación de prueba')
      }

      return result

    } catch (error: any) {
      console.error('💥 Error enviando notificación de prueba:', error)
      return false
    }
  }

  /**
   * ⚙️ Configurar recordatorios programados
   */
  async configureScheduledNotifications(config: {
    dailyReminderTime: string
    enableStreakReminders: boolean
    enableWeeklyReports: boolean
  }): Promise<boolean> {
    

    try {
      this.nativeNotifications.saveConfig({
        enabled: true,
        dailyReminder: true,
        streakReminder: config.enableStreakReminders,
        weeklyReport: config.enableWeeklyReports,
        time: config.dailyReminderTime,
        customVerse: true
      })

      
      return true

    } catch (error: any) {
      console.error('💥 Error configurando notificaciones programadas:', error)
      return false
    }
  }

  /**
   * 📱 Solicitar permisos de notificación
   */
  async requestPermission(): Promise<boolean> {
    try {
      return await this.nativeNotifications.requestPermission()
    } catch (error: any) {
      console.error('💥 Error solicitando permisos:', error)
      return false
    }
  }

  /**
   * 📋 Obtener estadísticas del sistema
   */
  getStats(): any {
    try {
      return this.nativeNotifications.getStats()
    } catch (error: any) {
      console.error('💥 Error obteniendo estadísticas:', error)
      return { supported: false, permission: 'default' }
    }
  }

  /**
   * 🔄 Verificar si está inicializado
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

// 🚀 Instancia singleton para uso global
export const notificationSystem = NotificationSystemWrapper.getInstance() 