
// hooks/useCacheSettingsManager.ts
import { useState, useEffect, useCallback } from 'react';
import { smartSyncFirestoreService } from '@/lib/services/sincronizacion-inteligente-firestore';
import { enhancedIndexedDBCache, UserCacheSettings } from '@/lib/cache/indexdDB-avanzado';
import { useAuthContext } from '@/context/auth-context';

export function useCacheSettingsManager() {
  const { user } = useAuthContext();
  const [settings, setSettings] = useState<UserCacheSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [userSettings, stats] = await Promise.all([
        smartSyncFirestoreService.getUserCacheSettings(user.uid),
        smartSyncFirestoreService.getCacheStats(user.uid)
      ]);
      
      setSettings(userSettings);
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 🚀 NUEVA FUNCIÓN: Cambiar límite de días de cache
  const updateCacheDaysLimit = useCallback(async (newLimit: number) => {
    if (!user || !settings || updating) return;

    setUpdating(true);
    try {
      await smartSyncFirestoreService.updateUserCacheDaysLimit(user.uid, newLimit);
      
      // Recargar configuración y estadísticas
      await loadSettings();
      
      console.log(`✅ Límite de cache actualizado a ${newLimit} días`);
    } catch (error) {
      console.error('Error updating cache days limit:', error);
      throw new Error('Error al actualizar límite de cache');
    } finally {
      setUpdating(false);
    }
  }, [user, settings, updating, loadSettings]);

  // 🚀 NUEVA FUNCIÓN: Activar/desactivar limpieza automática
  const toggleAutoCleanup = useCallback(async (enabled: boolean) => {
    if (!user || updating) return;

    setUpdating(true);
    try {
      await smartSyncFirestoreService.toggleAutoCleanup(user.uid, enabled);
      await loadSettings();
      
      console.log(`✅ Limpieza automática ${enabled ? 'activada' : 'desactivada'}`);
    } catch (error) {
      console.error('Error toggling auto cleanup:', error);
      throw new Error('Error al cambiar configuración de limpieza automática');
    } finally {
      setUpdating(false);
    }
  }, [user, updating, loadSettings]);

  // 🚀 NUEVA FUNCIÓN: Limpieza manual
  const performManualCleanup = useCallback(async () => {
    if (!user || updating) return { deletedDevocionales: 0, deletedTopicals: 0 };

    setUpdating(true);
    try {
      const result = await smartSyncFirestoreService.performManualCleanup(user.uid);
      await loadSettings(); // Recargar estadísticas
      
      console.log(`✅ Limpieza manual completada: ${result.deletedDevocionales} devocionales, ${result.deletedTopicals} estudios eliminados`);
      return result;
    } catch (error) {
      console.error('Error in manual cleanup:', error);
      throw new Error('Error en limpieza manual');
    } finally {
      setUpdating(false);
    }
  }, [user, updating, loadSettings]);

  // 🚀 NUEVA FUNCIÓN: Limpiar todos los datos del usuario
  const clearAllUserData = useCallback(async () => {
    if (!user || updating) return;

    setUpdating(true);
    try {
      await smartSyncFirestoreService.clearAllUserData(user.uid);
      await loadSettings();
      
      console.log('✅ Todos los datos del usuario eliminados del cache');
    } catch (error) {
      console.error('Error clearing all user data:', error);
      throw new Error('Error al limpiar todos los datos');
    } finally {
      setUpdating(false);
    }
  }, [user, updating, loadSettings]);

  return {
    settings,
    cacheStats,
    loading,
    updating,
    updateCacheDaysLimit, // 🚀 Cambiar límite de días
    toggleAutoCleanup, // 🚀 Activar/desactivar auto-limpieza
    performManualCleanup, // 🚀 Limpieza manual
    clearAllUserData, // 🚀 Limpiar todos los datos
    refreshStats: loadSettings,
  };
}