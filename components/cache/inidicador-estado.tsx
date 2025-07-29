import React from 'react';
import { useOfflineSmartSync } from '@/hooks/use-gestion-offline-inteligente';

export function SyncStatusIndicator() {
  const { isOnline, syncStatus, pendingSync, manualSync } = useOfflineSmartSync();

  if (isOnline && syncStatus === 'idle' && !pendingSync) {
    return null; // No mostrar nada cuando todo está bien
  }

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (syncStatus === 'syncing') return 'bg-blue-500';
    if (syncStatus === 'error') return 'bg-orange-500';
    if (pendingSync) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return '📵 Sin conexión - Datos desde cache';
    if (syncStatus === 'syncing') return '🔄 Sincronizando datos...';
    if (syncStatus === 'error') return '⚠️ Error al sincronizar';
    if (pendingSync) return '⏳ Sincronización pendiente';
    return '✅ Datos sincronizados';
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 p-2 text-white text-center text-sm ${getStatusColor()}`}>
      <div className="flex items-center justify-center gap-2">
        <span>{getStatusText()}</span>
        {(syncStatus === 'error' || pendingSync) && isOnline && (
          <button
            onClick={manualSync}
            className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}