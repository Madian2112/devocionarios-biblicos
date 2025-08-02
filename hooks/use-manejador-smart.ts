// hooks/useSmartSyncManager.ts
import { useState, useCallback } from 'react';
import { useDevocionales  } from './use-sincronizar-devocionales';
import { useTopicalStudies } from './use-sincronizar-temas';
import { useAuthContext } from '@/context/auth-context';
import { SyncType } from '@/lib/enums/SyncType';
export function useSmartSyncManager() {
  const { user } = useAuthContext();
  const [globalSyncLoading, setGlobalSyncLoading] = useState(false);
  const [lastGlobalSync, setLastGlobalSync] = useState<Date | null>(null);
  
  const devocionalesHook = useDevocionales();
  const topicalStudiesHook = useTopicalStudies();

  // 3. Sincronización condicional según el tipo
  const globalSmartSync = useCallback(
    async (syncType: SyncType = SyncType.ALL) => {
      if (!user || globalSyncLoading) return;

      setGlobalSyncLoading(true);
      try {
        console.log(`🚀 Iniciando sincronización tipo: ${syncType}...`);

        let devocionalesResult = null;
        let topicalResult = null;

        if (syncType === SyncType.ALL || syncType === SyncType.DEVOCIONALES) {
          devocionalesResult = await devocionalesHook.smartSync();
        }

        if (syncType === SyncType.ALL || syncType === SyncType.TOPICALS) {
          topicalResult = await topicalStudiesHook.smartSync();
        }

        setLastGlobalSync(new Date());

        const totalFromFirestore = 
          (devocionalesHook.lastSyncResult?.fromFirestore || 0) + 
          (topicalStudiesHook.lastSyncResult?.fromFirestore || 0);

        if (totalFromFirestore > 0) {
          console.log(`✅ Sincronización completada: ${totalFromFirestore} elementos sincronizados`);
        } else {
          console.log('✅ Sincronización: Todo está actualizado');
        }

      } catch (error) {
        console.error('Error en sincronización:', error);
        throw new Error('Error en la sincronización');
      } finally {
        setGlobalSyncLoading(false);
      }
    },
    [user, globalSyncLoading, devocionalesHook, topicalStudiesHook]
  );

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
    globalSmartSync, // Ahora puede recibir el tipo de sincronización
    devocionales: devocionalesHook,
    topicalStudies: topicalStudiesHook,
  };
}