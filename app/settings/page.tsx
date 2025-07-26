"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Bell,
  Clock,
  Mail,
  Smartphone,
  Calendar,
  Save,
  Check,
  AlertCircle,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { GradientCard } from "@/components/ui/gradient-card"
import { useAuthContext } from "@/context/auth-context"
import { notificationService } from "@/lib/notification-service"
import { EmailService } from "@/lib/email-service"
import { useToast } from "@/hooks/use-toast"
interface NotificationSettings {
  enabled: boolean;
  dailyTime: string;
  streakReminders: boolean;
  weeklyReports: boolean;
  emailNotifications: boolean;
  permissionGranted: boolean;
}

function SettingsPage() {
  const { user, loading } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    dailyTime: '08:00',
    streakReminders: true,
    weeklyReports: true,
    emailNotifications: true,
    permissionGranted: false,
  });
  
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Verificar autenticación manualmente
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    
    if (user) {
      loadSettings();
    }
  }, [user, loading, router]);

  const loadSettings = async () => {
    if (!user) {
      setConfigLoading(false);
      return;
    }

    try {
      console.log('🔄 Cargando configuración para usuario:', user.uid);
      
      // Verificar permisos actuales (sin bloquear)
      const permissionGranted = 'Notification' in window && Notification.permission === 'granted';
      console.log('🔔 Permisos de notificación:', permissionGranted);
      
      // Intentar inicializar servicio (con timeout)
      let config = null;
      try {
        const initTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const initPromise = notificationService.initialize(user.uid);
        await Promise.race([initPromise, initTimeout]);
        
        // Cargar configuración guardada
        config = notificationService.loadNotificationConfig();
        console.log('⚙️ Configuración cargada:', config);
        
      } catch (initError) {
        console.warn('⚠️ No se pudo inicializar servicio de notificaciones:', initError);
        // Continuar sin el servicio de notificaciones
      }
      
      if (config) {
        setSettings({
          enabled: config.enabled,
          dailyTime: config.dailyTime,
          streakReminders: config.streakReminders,
          weeklyReports: config.weeklyReports,
          emailNotifications: true,
          permissionGranted,
        });
      } else {
        // Configuración por defecto
        setSettings({
          enabled: false,
          dailyTime: '08:00',
          streakReminders: true,
          weeklyReports: true,
          emailNotifications: true,
          permissionGranted,
        });
      }
      
      console.log('✅ Configuración cargada exitosamente');
      
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
      
      // Cargar configuración por defecto en caso de error
      setSettings({
        enabled: false,
        dailyTime: '08:00',
        streakReminders: true,
        weeklyReports: true,
        emailNotifications: true,
        permissionGranted: 'Notification' in window && Notification.permission === 'granted',
      });
      
      toast({
        title: "⚠️ Advertencia",
        description: "Se cargó configuración por defecto.",
        duration: 3000,
      });
    } finally {
      setConfigLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission();
    setSettings(prev => ({ ...prev, permissionGranted: granted }));
    
    if (granted) {
      toast({
        title: "✅ Permisos concedidos",
        description: "¡Perfecto! Ya puedes recibir notificaciones.",
        duration: 3000,
      });
    } else {
      toast({
        title: "❌ Permisos denegados",
        description: "No podrás recibir notificaciones push.",
        variant: "destructive",
      });
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Guardar configuración de notificaciones
      notificationService.saveNotificationConfig({
        enabled: settings.enabled,
        dailyTime: settings.dailyTime,
        streakReminders: settings.streakReminders,
        weeklyReports: settings.weeklyReports,
      });

      // Si está habilitado pero no tiene permisos, solicitarlos
      if (settings.enabled && !settings.permissionGranted) {
        await requestNotificationPermission();
      }

      toast({
        title: "✅ Configuración guardada",
        description: "Tus preferencias se han actualizado correctamente.",
        duration: 3000,
      });

    } catch (error) {
      console.error('Error guardando configuración:', error);
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async () => {
    if (!settings.permissionGranted) {
      await requestNotificationPermission();
      return;
    }

    notificationService.showDailyReminderNotification();
    toast({
      title: "🔔 Notificación de prueba",
      description: "¡Revisa tu dispositivo!",
      duration: 2000,
    });
  };

  const sendTestEmail = async () => {
    if (!user?.email) return;

    try {
      const success = await EmailService.sendWelcomeEmail({
        userName: user.displayName || 'Hermano(a)',
        userEmail: user.email,
      });

      if (success) {
        toast({
          title: "📧 Email de prueba enviado",
          description: "Revisa tu bandeja de entrada.",
          duration: 3000,
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      toast({
        title: "❌ Error enviando email",
        description: "No se pudo enviar el email de prueba.",
        variant: "destructive",
      });
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
          <div className="text-white">Verificando acceso...</div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Mostrar loading mientras se carga la configuración
  if (configLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
          <div className="text-white">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="outline" size="sm" className="bg-[#1a1a1a]/50 border-gray-600 hover:bg-[#2a2a2a]/50 hover:border-gray-500 transition-all">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ⚙️ Configuración
            </h1>
            <p className="text-gray-400">Personaliza tus notificaciones y recordatorios</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 📱 Notificaciones Push */}
          <GradientCard gradient="blue" className="group hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                </div>
                Notificaciones Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Estado de permisos */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.permissionGranted ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                    {settings.permissionGranted ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">Estado de Permisos</p>
                    <p className="text-sm text-gray-400">
                      {settings.permissionGranted ? 'Notificaciones habilitadas' : 'Se requieren permisos para continuar'}
                    </p>
                  </div>
                </div>
                {!settings.permissionGranted && (
                  <Button 
                    onClick={requestNotificationPermission} 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                  >
                    Permitir
                  </Button>
                )}
              </div>

              {/* Habilitar notificaciones */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-400" />
                    Habilitar notificaciones
                  </Label>
                  <p className="text-sm text-gray-400">Recibir recordatorios diarios automáticos</p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                  disabled={!settings.permissionGranted}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              {/* Hora de recordatorio */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Hora del recordatorio diario
                </Label>
                <Input
                  type="time"
                  value={settings.dailyTime}
                  onChange={(e) => handleSettingChange('dailyTime', e.target.value)}
                  disabled={!settings.enabled}
                  className="bg-[#1a1a1a]/80 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500">Tu recordatorio diario llegará a esta hora</p>
              </div>

              <Separator className="bg-gray-600/50" />

              {/* Recordatorios de racha */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-white font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                    Recordatorios de racha
                  </Label>
                  <p className="text-sm text-gray-400">Si no has hecho tu devocional del día</p>
                </div>
                <Switch
                  checked={settings.streakReminders}
                  onCheckedChange={(checked) => handleSettingChange('streakReminders', checked)}
                  disabled={!settings.enabled}
                  className="data-[state=checked]:bg-orange-600"
                />
              </div>

              {/* Reportes semanales */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-400" />
                    Reportes semanales
                  </Label>
                  <p className="text-sm text-gray-400">Resumen semanal de tu progreso espiritual</p>
                </div>
                <Switch
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                  disabled={!settings.enabled}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Botón de prueba */}
              <Button
                onClick={testNotification}
                variant="outline"
                className="w-full bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:border-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!settings.permissionGranted}
              >
                <Bell className="h-4 w-4 mr-2" />
                {settings.permissionGranted ? 'Probar notificación' : 'Permisos requeridos'}
              </Button>

            </CardContent>
          </GradientCard>

          {/* 📧 Notificaciones por Email */}
          <GradientCard gradient="purple" className="group hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Mail className="h-5 w-5 text-purple-400" />
                </div>
                Notificaciones por Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Email actual */}
              <div className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Mail className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Correo registrado</p>
                    <p className="font-medium text-white">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Habilitar emails */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="text-white font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-400" />
                    Emails de bienvenida
                  </Label>
                  <p className="text-sm text-gray-400">Envío automático a nuevos usuarios</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>

              {/* Botón de prueba email */}
              <Button
                onClick={sendTestEmail}
                variant="outline"
                className="w-full bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 transition-all"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar email de prueba
              </Button>

              {/* Info sobre configuración de EmailJS */}
              <div className="p-4 rounded-xl bg-orange-900/10 border border-orange-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-300 font-medium">Configuración adicional</p>
                    <p className="text-xs text-orange-200/80 mt-1">
                      Para habilitar emails automáticos, configura las variables de entorno de EmailJS en tu servidor.
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </GradientCard>

        </div>

        {/* Botón guardar configuración */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={saveSettings}
            disabled={saving}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl px-8 py-3 text-white font-medium transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando configuración...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage; 