import React, { useEffect, useState } from 'react';
import { useSmartSyncManager } from '@/hooks/use-manejador-smart';
import { Button } from '../ui/button';
import { AlertCircle, Check, RefreshCw } from 'lucide-react';
import { SyncType } from '@/lib/enums/SyncType';

export interface SmartSyncButtonProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  syncType?: SyncType; // 🚀 NUEVA PROP
}

export function SmartSyncButton({
  className = '',
  iconSize = 20,
  showText = false,
  syncType = SyncType.ALL, // 🚀 Valor por defecto 
}: SmartSyncButtonProps): JSX.Element {
  const [showStatusMessage, setShowStatusMessage] = useState(false)
  const { globalSmartSync, syncLoading, lastSyncResults, lastGlobalSync } = useSmartSyncManager();

  const handleSync = async () => {
    try {
      await globalSmartSync(syncType);
    } catch (error) {
      console.error('Error en sincronización:', error);
      // Aquí puedes agregar tu sistema de notificaciones/toast
    }
  };

  useEffect(() => {
    if (showStatusMessage && !syncLoading) {
      const timer = setTimeout(() => {
        setShowStatusMessage(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [showStatusMessage, syncLoading])

    useEffect(() => {
    const handleClickOutside = () => {
      if (showStatusMessage) {
        setShowStatusMessage(false)
      }
    }

    if (showStatusMessage) {
      document.addEventListener("click", handleClickOutside)
      return () => document.removeEventListener("click", handleClickOutside)
    }
  }, [showStatusMessage])

  const getLastSyncText = () => {
    if (!lastGlobalSync) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastGlobalSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Sincronizado ahora';
    if (diffMins < 60) return `Sincronizado hace ${diffMins}min`;
    
    const diffHours = Math.floor(diffMins / 60);
    return `Sincronizado hace ${diffHours}h`;
  };

  const getTotalSyncedFromFirestore = () => {
    const devocionales = lastSyncResults.devocionales?.fromFirestore || 0;
    const topicals = lastSyncResults.topicals?.fromFirestore || 0;
    return devocionales + topicals;
  };

  return (
    <div className="flex justify-end relative">
      {/* Botón principal de sincronización */}
      <div className="group hover:scale-[1.02] transition-transform">
        <Button
          onClick={handleSync}
          disabled={syncLoading}
          className={`
            flex items-center gap-3 p-4 rounded-xl
            bg-[#1a1a1a] hover:bg-[#2a2a2a]
            border border-gray-700 hover:border-gray-600
            disabled:bg-[#0f0f0f] disabled:border-gray-800
            text-gray-300 hover:text-white shadow-lg
            ${showText ? "px-6" : "w-14 h-14 p-0 justify-center"}
            ${className}
          `}
          title={syncLoading ? "Sincronizando..." : "Sincronización inteligente"}
        >
          <div className="p-1 bg-gray-700/30 rounded-lg group-hover:bg-gray-600/40 transition-colors">
            {syncLoading ? (
              <RefreshCw className={`h-5 w-5 text-gray-400 animate-spin`} />
            ) : (
              <RefreshCw className={`h-5 w-5 text-gray-400 group-hover:text-gray-300`} />
            )}
          </div>

          {showText && (
            <span className="text-gray-300 group-hover:text-white font-medium">
              {syncLoading ? "Sincronizando..." : "Sincronizar"}
            </span>
          )}
        </Button>
      </div>

      {/* Indicador de estado de sincronización */}
      {showStatusMessage && lastGlobalSync && !syncLoading && (
        <div className="absolute top-16 right-0 z-50 p-3 rounded-xl bg-[#0f0f0f] border border-gray-800 shadow-lg min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-gray-700/30 rounded-lg">
              <Check className="h-3 w-3 text-gray-500" />
            </div>
            <span className="text-xs text-gray-400 font-medium">{getLastSyncText()}</span>
          </div>

          {getTotalSyncedFromFirestore() > 0 && (
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gray-700/30 rounded-lg">
                <AlertCircle className="h-3 w-3 text-gray-500" />
              </div>
              <span className="text-xs text-gray-500">+{getTotalSyncedFromFirestore()} elementos nuevos</span>
            </div>
          )}
        </div>
      )}

      {/* Indicador de carga */}
      {syncLoading && (
        <div className="absolute top-16 right-0 z-50 p-3 rounded-xl bg-[#0f0f0f] border border-gray-800 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gray-700/30 rounded-lg">
              <RefreshCw className="h-3 w-3 text-gray-500 animate-spin" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Sincronizando datos...</span>
          </div>
        </div>
      )}
    </div>
  );
}

