"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Bell,
  Clock,
  Smartphone,
  Calendar,
  Save,
  Check,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { GradientCard } from "@/components/ui/gradient-card"
import { useAuthContext } from "@/context/auth-context"
import { notificationSystem } from "@/lib/hybrid-notification-system"
import { nativeNotificationSystem } from "@/lib/native-notification-system"
import { useToast } from "@/hooks/use-toast"
import { CacheSettingsPanel } from "@/components/cache/panel-config-cache"

interface NotificationSettings {
  enabled: boolean;
  dailyTime: string;
  streakReminders: boolean;
  weeklyReports: boolean;
  permissionGranted: boolean;
}

export default function SettingsPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    dailyTime: '19:00',
    streakReminders: true,
    weeklyReports: true,
    permissionGranted: false,
  });
  const [configLoading, setConfigLoading] = useState(true);

  // 🔐 Verificación manual de autenticación
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // 📱 Cargar configuración de notificaciones
  useEffect(() => {
    loadNotificationConfig();
  }, [user]);

  const loadNotificationConfig = async () => {
    if (!user) return;

    try {
      setConfigLoading(true);
      

      // Verificar permisos
      const permissionGranted = 'Notification' in window && Notification.permission === 'granted';
      
      // Obtener estadísticas del sistema nativo
      const stats = nativeNotificationSystem.getStats();
      
      // Configuración por defecto mejorada
      const defaultSettings = {
        enabled: permissionGranted,
        dailyTime: '19:00',
        streakReminders: true,
        weeklyReports: true,
        permissionGranted,
      };
      
      setSettings(defaultSettings);
      
      
      
    } catch (error) {
      console.error('❌ Error cargando configuración:', error);
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
    if (!user) return;

    try {
      // Inicializar sistema nativo
      const nativeReady = await nativeNotificationSystem.initialize(user.displayName || 'Hermano(a)');
      
      if (!nativeReady) {
        toast({
          title: "⚠️ No compatible",
          description: "Tu navegador no soporta notificaciones PWA",
          variant: "destructive",
        });
        return;
      }

      const granted = await nativeNotificationSystem.requestPermission();
      setSettings(prev => ({ ...prev, permissionGranted: granted, enabled: granted }));
      
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
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      toast({
        title: "❌ Error",
        description: "Error solicitando permisos de notificación",
        variant: "destructive",
      });
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user) return;

    try {
      

      // Configurar notificaciones programadas
      if (settings.enabled && settings.permissionGranted) {
        await notificationSystem.configureScheduledNotifications({
          dailyReminderTime: settings.dailyTime,
          enableStreakReminders: settings.streakReminders,
          enableWeeklyReports: settings.weeklyReports,
        });
      }

      toast({
        title: "✅ Configuración guardada",
        description: `Notificaciones ${settings.enabled ? 'activadas' : 'desactivadas'} correctamente.`,
        duration: 3000,
      });
      
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    }
  };

  const testNotification = async () => {
    if (!settings.permissionGranted) {
      toast({
        title: "⚠️ Permisos requeridos",
        description: "Primero otorga permisos de notificación",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await notificationSystem.sendTestNotifications();
      
      if (success) {
        toast({
          title: "🎉 ¡Notificación enviada!",
          description: "Revisa la barra de notificaciones de tu dispositivo",
          duration: 4000,
        });
      } else {
        toast({
          title: "⚠️ No enviada",
          description: "Verifica los permisos de notificación",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo enviar la notificación de prueba",
        variant: "destructive",
      });
    }
  };

  // Mostrar loading si está cargando auth o config
  if (loading || configLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button variant="outline" size="icon" className="bg-[#1a1a1a] border-gray-700">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Configuración</h1>
            <p className="text-gray-400">Personaliza tus notificaciones</p>
          </div>
        </div>

        <div className="space-y-6">
          
          {/* Notificaciones Push */}
          <GradientCard gradient="blue" className="group hover:scale-[1.02] transition-transform">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Smartphone className="h-5 w-5 text-blue-400" />
                </div>
                Notificaciones del Teléfono
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Estado de permisos */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-900/10 border border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Bell className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Permisos de notificación</p>
                    <p className="text-sm text-gray-400">
                      {settings.permissionGranted ? 'Permisos concedidos ✅' : 'Permisos requeridos ❌'}
                    </p>
                  </div>
                </div>
                {!settings.permissionGranted && (
                  <Button 
                    onClick={requestNotificationPermission}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Solicitar Permisos
                  </Button>
                )}
              </div>

              {/* Configuraciones */}
              <div className="space-y-4">
                
                {/* Habilitar notificaciones */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-400" />
                      Notificaciones habilitadas
                    </Label>
                    <p className="text-sm text-gray-400">Recibir notificaciones en tu dispositivo</p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                    disabled={!settings.permissionGranted}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                {/* Hora del recordatorio */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      Hora del recordatorio diario
                    </Label>
                    <p className="text-sm text-gray-400">Cuándo recibir el recordatorio</p>
                  </div>
                  <Input
                    type="time"
                    value={settings.dailyTime}
                    onChange={(e) => handleSettingChange('dailyTime', e.target.value)}
                    className="w-24 bg-[#1a1a1a] border-gray-700 text-white"
                    disabled={!settings.enabled}
                  />
                </div>

                {/* Recordatorios de racha */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-400" />
                      Recordatorios de racha
                    </Label>
                    <p className="text-sm text-gray-400">Avisos para mantener tu racha</p>
                  </div>
                  <Switch
                    checked={settings.streakReminders}
                    onCheckedChange={(checked) => handleSettingChange('streakReminders', checked)}
                    disabled={!settings.enabled}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>

                {/* Reportes semanales */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-white font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      Reportes semanales
                    </Label>
                    <p className="text-sm text-gray-400">Resumen semanal de tu progreso</p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('weeklyReports', checked)}
                    disabled={!settings.enabled}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  onClick={saveSettings}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
                
                <Button
                  onClick={testNotification}
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Probar
                </Button>
              </div>

            </CardContent>
          </GradientCard>
          <CacheSettingsPanel />
        </div>
      </div>
    </div>
  );
} 