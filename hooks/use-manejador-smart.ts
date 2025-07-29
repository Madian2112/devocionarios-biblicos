// hooks/useSmartSyncManager.ts
import { useState, useCallback } from 'react';
import { useDevocionales  } from './use-sincronizar-devocionales';
import { useTopicalStudies } from './use-sincronizar-temas';
import { useAuthContext } from '@/context/auth-context';

export function useSmartSyncManager() {
  const { user } = useAuthContext();
  const [globalSyncLoading, setGlobalSyncLoading] = useState(false);
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null);
  
  const devocionalesHook = useDevocionales ();
  const topicalStudiesHook = useTopicalStudies();

  // 🚀 NUEVA FUNCIÓN: Sincronización global inteligente
  const globalSmartSync = useCallback(async () => {
    if (!user || globalSyncLoading) return;

    setGlobalSyncLoading(true);
    
    try {
      console.log('🚀 Iniciando sincronización global inteligente...');
      
      // Ejecutar ambas sincronizaciones en paralelo
      const [devocionalesResult, topicalResult] = await Promise.all([
        devocionalesHook.smartSync(),
        topicalStudiesHook.smartSync(),
      ]);

      setLastGlobalSync(new Date());
      
      const totalFromFirestore = 
        (devocionalesHook.lastSyncResult?.fromFirestore || 0) + 
        (topicalStudiesHook.lastSyncResult?.fromFirestore || 0);

      if (totalFromFirestore > 0) {
        console.log(`✅ Sincronización global completada: ${totalFromFirestore} elementos sincronizados`);
      } else {
        console.log('✅ Sincronización global: Todo está actualizado');
      }

    } catch (error) {
      console.error('Error en sincronización global:', error);
      throw new Error('Error en la sincronización global');
    } finally {
      setGlobalSyncLoading(false);
    }
  }, [user, globalSyncLoading, devocionalesHook, topicalStudiesHook]);

  // Estado combinado para mostrar en UI
  const combinedState = {
    loading: devocionalesHook.loadingSincronizado || topicalStudiesHook.loading,
    syncLoading: globalSyncLoading || devocionalesHook.syncLoading || topicalStudiesHook.syncLoading,
    error: devocionalesHook.error || topicalStudiesHook.error,
    lastSyncResults: {
      devocionales: devocionalesHook.lastSyncResult,
      topicals: topicalStudiesHook.lastSyncResult,
    },
    lastGlobalSync,
  };

  return {
    ...combinedState,
    globalSmartSync, // 🚀 Función principal para el botón de sync
    devocionales: devocionalesHook,
    topicalStudies: topicalStudiesHook,
  };
}