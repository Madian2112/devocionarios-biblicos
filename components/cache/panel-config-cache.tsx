import React, { useState } from 'react';
import { useCacheSettingsManager } from '@/hooks/use-manejador-ajuste-cache';
import { AlertCircle, Book, Calendar, Check, Clock, Database, FileText, Info, RefreshCw, Trash2, X } from 'lucide-react';
import { Switch } from '@radix-ui/react-switch';
import { Button } from '../ui/button';
import { GradientCard } from '../ui/gradient-card';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from "@/hooks/use-toast"

export function CacheSettingsPanel() {
  const {
    settings,
    cacheStats,
    loading,
    updating,
    updateCacheDaysLimit,
    toggleAutoCleanup,
    performManualCleanup,
    clearAllUserData,
    refreshStats,
  } = useCacheSettingsManager();

  const [newDaysLimit, setNewDaysLimit] = useState<string>('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!settings || !cacheStats) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Error al cargar configuración de cache</p>
      </div>
    );
  }

  const handleUpdateDaysLimit = async () => {
    const days = parseInt(newDaysLimit);
    if (isNaN(days) || days < 1 || days > 365) {
      toast({
        title: "⚠️ Advertencia",
        description: "Por favor ingresa un número válido entre 1 y 365 días",
        duration: 3000,
      });
      return;
    }

    try {
      await updateCacheDaysLimit(days);
      setNewDaysLimit('');
      toast({
        title: "✅ Actualización exitosa",
        description: `Límite actualizado a ${days} días`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error al actualizar límite de días",
        duration: 3000,
      });
    }
  };

  const handleManualCleanup = async () => {
    try {
      const result = await performManualCleanup();
      toast({
        title: "✅ Limpieza completada",
        description: `${result.deletedDevocionales} devocionales eliminados, ${result.deletedTopicals} estudios eliminados`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error en la limpieza manual",
        duration: 3000,
      });
    }
  };

  const handleClearAllData = async () => {
    if (!showConfirmClear) {
      setShowConfirmClear(true);
      return;
    }

    try {
      await clearAllUserData();
      setShowConfirmClear(false);
      toast({
        title: "✅ Limpieza completada",
        description: "Todos los datos han sido eliminados del cache",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Error al limpiar todos los datos",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas de Cache */}
      <GradientCard gradient="blue" className="group hover:scale-[1.02] transition-transform">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Database className="h-5 w-5 text-blue-400" />
            </div>
            Estadísticas de Cache
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado actual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-900/10 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Devocionales</p>
                  <p className="text-sm text-gray-400">{cacheStats.totalDevocionales} elementos</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{cacheStats.totalDevocionales}</div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-900/10 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Database className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Estudios Temáticos</p>
                  <p className="text-sm text-gray-400">En cache local</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{cacheStats.totalTopicalStudies}</div>
            </div>
          </div>

          {/* Rango de fechas */}
          {cacheStats.oldestDevocionalDate && cacheStats.newestDevocionalDate && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-900/10 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Rango de fechas</p>
                  <p className="text-sm text-gray-400">
                    {cacheStats.oldestDevocionalDate} - {cacheStats.newestDevocionalDate}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </GradientCard>

      {/* Configuración de Días */}
      <GradientCard gradient="blue" className="group hover:scale-[1.02] transition-transform">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            Configuración de Retención
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Días a mantener */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-900/10 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Días en cache</p>
                <p className="text-sm text-gray-400">Actualmente: {settings.cacheDaysLimit} días</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="365"
                value={newDaysLimit}
                onChange={(e) => setNewDaysLimit(e.target.value)}
                placeholder={`${settings.cacheDaysLimit}`}
                className="w-20 bg-[#1a1a1a] border-gray-700 text-white"
              />
              <Button
                onClick={handleUpdateDaysLimit}
                disabled={updating || !newDaysLimit}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Actualizar
              </Button>
            </div>
          </div>

          {/* Limpieza automática */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-blue-400" />
                Limpieza automática
              </Label>
              <p className="text-sm text-gray-400">Elimina datos antiguos automáticamente</p>
            </div>
            <Switch
              checked={settings.autoCleanupEnabled}
              onCheckedChange={(checked) => toggleAutoCleanup(checked)}
              disabled={updating}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Alertas */}
          {cacheStats.missingSyncDates.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-900/10 border border-yellow-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Sincronización pendiente</p>
                  <p className="text-sm text-gray-400">
                    Faltan {cacheStats.missingSyncDates.length} días por sincronizar
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              onClick={handleManualCleanup}
              disabled={updating}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {updating ? "Procesando..." : "Limpieza Manual"}
            </Button>

            <Button
              onClick={refreshStats}
              disabled={updating}
              variant="outline"
              className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          {/* Botón de eliminar todo */}
          <div className="space-y-2">
            <Button
              onClick={handleClearAllData}
              disabled={updating}
              className={`w-full ${
                showConfirmClear
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              }`}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {updating
                ? "Procesando..."
                : showConfirmClear
                  ? "⚠️ Confirmar: Eliminar Todo"
                  : "Eliminar Todos los Datos"}
            </Button>

            {showConfirmClear && (
              <Button
                onClick={() => setShowConfirmClear(false)}
                variant="outline"
                className="w-full bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </GradientCard>

      {/* Info sobre Cache */}
      <div className="p-4 rounded-xl bg-green-900/10 border border-green-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Check className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-green-300 font-medium">💾 Cache Local Optimizado</p>
            <p className="text-xs text-green-200/80 mt-1">
              Última limpieza: {new Date(settings.lastCleanup).toLocaleString()}
            </p>
            <p className="text-xs text-green-200/60 mt-1">
              Almacenamiento eficiente • Acceso offline • Sincronización inteligente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}