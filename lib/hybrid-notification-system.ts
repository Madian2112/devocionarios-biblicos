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
    console.log('🚀 Inicializando notificaciones nativas PWA...')

    try {
      // Inicializar notificaciones nativas
      const nativeReady = await this.nativeNotifications.initialize(userName)
      console.log('📱 Notificaciones nativas:', nativeReady ? 'Listas ✅' : 'No disponibles ⚠️')

      this.isInitialized = true
      console.log('✅ Sistema de notificaciones PWA inicializado')
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
    console.log('🌟 Configurando notificaciones de bienvenida para:', userName)

    try {
      // 📱 Solicitar permisos para notificaciones
      console.log('📱 Solicitando permisos para notificaciones...')
      const notificationResult = await this.nativeNotifications.requestPermission()
      
      if (notificationResult) {
        console.log('✅ Permisos de notificación otorgados')
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
    console.log('🔥 Enviando recordatorio de racha para:', userName, 'Racha:', streak)

    try {
      const stats = {
        streak: streak,
        completedThisWeek: 0,
        totalDevocionales: 0,
        totalStudies: 0
      }
      
      const notificationResult = await this.nativeNotifications.showStreakReminder(stats)
      
      if (notificationResult) {
        console.log('✅ Recordatorio de racha enviado via PWA')
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
    console.log('⏰ Enviando recordatorio diario para:', userName)

    try {
      const notificationResult = await this.nativeNotifications.showDailyReminder()
      
      if (notificationResult) {
        console.log('✅ Recordatorio diario enviado via PWA')
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
    console.log('📊 Enviando reporte semanal para:', userName)

    try {
      const weeklyStats = {
        streak: stats.racha || 0,
        completedThisWeek: stats.completados || 0,
        totalDevocionales: stats.totalDevocionales || 0,
        totalStudies: stats.totalEstudios || 0
      }
      
      const notificationResult = await this.nativeNotifications.showWeeklyReport(weeklyStats)
      
      if (notificationResult) {
        console.log('✅ Reporte semanal enviado via PWA')
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
    console.log('🧪 Enviando notificaciones de prueba...')

    try {
      const result = await this.nativeNotifications.sendTestNotification()
      
      if (result) {
        console.log('✅ Notificación de prueba enviada')
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
    console.log('⚙️ Configurando notificaciones programadas:', config)

    try {
      this.nativeNotifications.saveConfig({
        enabled: true,
        dailyReminder: true,
        streakReminder: config.enableStreakReminders,
        weeklyReport: config.enableWeeklyReports,
        time: config.dailyReminderTime,
        customVerse: true
      })

      console.log('✅ Notificaciones programadas configuradas')
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