// hooks/useSmartSyncDevocionales.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { smartSyncFirestoreService, SyncResult } from '@/lib/services/sincronizacion-inteligente-firestore';
import { useAuthContext } from '@/context/auth-context';
import { Devocional } from '@/lib/firestore';

export function useDevocionales (estadoDevocional: boolean = false) {
  const { user } = useAuthContext();
  const [devocionales, setDevocionales] = useState<Devocional[]>([]);
  const [loadingSincronizado, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDevocionales = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setDevocionales([]);
      setLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const result = await smartSyncFirestoreService.getDevocionarios(user.uid, forceRefresh);
      
      if (!abortControllerRef.current.signal.aborted) {
        setDevocionales(result.data);
        setLastSyncResult({
          fromCache: result.fromCache,
          fromFirestore: result.fromFirestore,
          totalSynced: result.totalSynced,
          missingDates: result.missingDates,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        setError('Error al cargar devocionales');
        console.error('Error fetching devocionales:', err);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [user]);

  // 🚀 NUEVA FUNCIÓN: Smart Sync - Solo sincroniza lo que falta
  const smartSync = useCallback(async () => {
    if (!user || syncLoading) return;

    setSyncLoading(true);
    setError(null);

    try {
      const result = await smartSyncFirestoreService.smartSyncDevocionales(user.uid);
      
      setDevocionales(result.data);
      setLastSyncResult({
        fromCache: result.fromCache,
        fromFirestore: result.fromFirestore,
        totalSynced: result.totalSynced,
        missingDates: result.missingDates,
      });

      // Mostrar mensaje de éxito si se sincronizaron datos
      if (result.fromFirestore > 0) {
        console.log(`✅ Smart Sync completado: ${result.fromFirestore} nuevos documentos sincronizados`);
      } else {
        console.log('✅ Smart Sync: Todos los datos están actualizados');
      }

    } catch (error) {
      console.error('Error in smart sync:', error);
      setError('Error en la sincronización inteligente');
    } finally {
      setSyncLoading(false);
    }
  }, [user, syncLoading]);

  useEffect(() => {
    fetchDevocionales();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDevocionales]);

  const getDevocionalByKey = useCallback(async (key: string): Promise<Devocional | null> => {
    if (!user) return null;

    try {
      const devocional = await smartSyncFirestoreService.getDevocionalByDate(key, user.uid);
      return devocional;
    } catch (error) {
      console.error('Error fetching devocional by key:', error);
      return null;
    }
  }, [user]);

  const saveDevocional = useCallback(async (devocional: Omit<Devocional, "createdAt" | "updatedAt" | "userId">) => {
    if (!user) return null;

    try {
      const savedDevocional = await smartSyncFirestoreService.saveDevocional(user.uid, devocional);
      
      // Actualizar estado local inmediatamente
      setDevocionales(prev => {
        const existing = prev.find(d => d.id === savedDevocional.id);
        if (existing) {
          return prev.map(d => d.id === savedDevocional.id ? savedDevocional : d);
        } else {
          return [savedDevocional, ...prev].sort((a, b) => b.fecha.localeCompare(a.fecha));
        }
      });
      
      return savedDevocional;
    } catch (error) {
      console.error('Error saving devocional:', error);
      setError('Error al guardar devocional');
      return null;
    }
  }, [user]);

  const loadHistoricalData = useCallback(async (startDate: string, endDate: string) => {
    if (!user) return [];

    try {
      setLoading(true);
      const historicalData = await smartSyncFirestoreService.loadHistoricalDevocionales(
        user.uid, 
        startDate, 
        endDate
      );
      
      return historicalData;
    } catch (error) {
      console.error('Error loading historical data:', error);
      setError('Error al cargar datos históricos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    devocionales,
    loadingSincronizado,
    syncLoading,
    error,
    lastSyncResult,
    refetch: fetchDevocionales,
    smartSync, // 🚀 Nueva función de sincronización inteligente
    getDevocionalByKey,
    saveDevocional,
    loadHistoricalData,
    forceRefresh: () => fetchDevocionales(true),
  };
}