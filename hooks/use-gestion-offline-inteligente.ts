// hooks/useOfflineSmartSync.ts
import { useState, useEffect, useCallback } from 'react';
import { smartSyncFirestoreService } from '@/lib/services/sincronizacion-inteligente-firestore';
import { useAuthContext } from '@/context/auth-context';

export function useOfflineSmartSync() {
  const { user } = useAuthContext();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [pendingSync, setPendingSync] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user && pendingSync) {
        syncWhenOnline();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setPendingSync(true); // Marcar que necesitamos sync cuando volvamos online
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, pendingSync]);

  const syncWhenOnline = useCallback(async () => {
    if (!user || !isOnline) return;

    setSyncStatus('syncing');
    setPendingSync(false);
    
    try {
      // Usar smart sync en lugar de preload completo
      await Promise.all([
        smartSyncFirestoreService.smartSyncDevocionales(user.uid),
        smartSyncFirestoreService.smartSyncTopicalStudies(user.uid),
      ]);
      
      setSyncStatus('idle');
      console.log('🚀 Smart sync automático completado al volver online');
    } catch (error) {
      console.error('Error syncing data when online:', error);
      setSyncStatus('error');
      setPendingSync(true); // Reintentar más tarde
    }
  }, [user, isOnline]);

  const manualSync = useCallback(async () => {
    if (!user) return;

    setSyncStatus('syncing');
    try {
      await Promise.all([
        smartSyncFirestoreService.smartSyncDevocionales(user.uid),
        smartSyncFirestoreService.smartSyncTopicalStudies(user.uid),
      ]);
      
      setSyncStatus('idle');
      setPendingSync(false);
      console.log('🚀 Smart sync manual completado');
    } catch (error) {
      console.error('Error in manual sync:', error);
      setSyncStatus('error');
    }
  }, [user]);

  return {
    isOnline,
    syncStatus,
    pendingSync,
    manualSync,
  };
}