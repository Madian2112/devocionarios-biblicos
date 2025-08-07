// 📁 hooks/useDevocionales.ts (MODIFICAR tu archivo existente)

import { useState, useCallback, useEffect, useRef } from 'react';
import { mobileStorageService } from '@/lib/services/mobileOptimizedStorageService'
import { useAuthContext } from '@/context/auth-context';
import { Devocional } from '@/lib/firestore';
import { smartSyncFirestoreService, SyncResult } from '@/lib/services/sincronizacion-inteligente-firestore';

export function useDevocionales(estadoDevocional: boolean = false) {
  const { user } = useAuthContext();
  const [devocionales, setDevocionales] = useState<Devocional[]>([]);
  const [loadingSincronizado, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [mobileStats, setMobileStats] = useState<any>(null); // 🔥 AGREGAR ESTA LÍNEA
  const [loadingProgress, setLoadingProgress] = useState(0); // 🔥 AGREGAR ESTA LÍNEA
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🔥 AGREGAR ESTA FUNCIÓN NUEVA
const loadFromMobileStorage = useCallback(async () => {
  try {
    
    setLoadingProgress(10);
    
    const startTime = performance.now();
    
    setLoadingProgress(30);
    
    // 🔥 VERIFICAR primero si hay datos
    const stats = await mobileStorageService.getMobileStorageStats();
    
    if (!stats) {
      
      setLoadingProgress(0);
      return false;
    }
    
    
    
    setLoadingProgress(50);
    const compressedData = await mobileStorageService.loadCompressedDevocionales();
    
    setLoadingProgress(90);
    
    const endTime = performance.now();
    
    if (compressedData.length > 0) {
      
      setDevocionales(compressedData);
      setMobileStats(stats);
      setLoadingProgress(100);
      
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 200);
      
      return true;
    }
    
    
    setLoadingProgress(0);
    return false;
    
  } catch (error) {
    console.error('❌ Error cargando cache móvil:', error);
    setLoadingProgress(0);
    // No setear loading a false aquí, dejar que Firestore se encargue
    return false;
  }
}, []);

  // 🔥 MODIFICAR tu función fetchDevocionales existente
    const fetchDevocionales = useCallback(async (forceRefresh = false) => {
    if (!user) {
        setDevocionales([]);
        setLoading(false);
        return;
    }

    

    // Si no es refresh forzado, intentar cargar desde cache móvil primero
    if (!forceRefresh) {
        
        const hasLocalData = await loadFromMobileStorage();
        
        if (hasLocalData) {
        
        return; // Solo salir si realmente se cargaron datos
        }
        
        
    }

    // Cargar desde Firestore
    await fetchFromFirestoreForMobile(forceRefresh);
    }, [user, loadFromMobileStorage]);

  // 🔥 AGREGAR ESTA FUNCIÓN NUEVA
const fetchFromFirestoreForMobile = useCallback(async (forceRefresh = false) => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  abortControllerRef.current = new AbortController();
  setLoading(true);
  setError(null);
  setLoadingProgress(10);

  try {
    setLoadingProgress(30);
    if (!user) {
      setError('Usuario no disponible');
      setLoadingProgress(0);
      setLoading(false);
      return;
    }

    
    const result = await smartSyncFirestoreService.getDevocionarios(user.uid, forceRefresh);
    
    setLoadingProgress(60);
    
    
    if (!abortControllerRef.current.signal.aborted) {
      // Actualizar estado inmediatamente
      setDevocionales(result.data);
      setLastSyncResult({
        fromCache: result.fromCache,
        fromFirestore: result.fromFirestore,
        totalSynced: result.totalSynced,
        missingDates: result.missingDates,
      });
      
      setLoadingProgress(80);
      
      // 🔥 NUEVO: Solo comprimir si tenemos datos y el usuario no ha cancelado
      if (result.data.length > 0 && !abortControllerRef.current.signal.aborted) {
        try {
          
          
          // 🔥 DIAGNÓSTICO para usuarios nuevos
          if (forceRefresh) {
          }
          
          await mobileStorageService.saveCompressedDevocionales(result.data);
          
          // Solo obtener stats si la compresión fue exitosa
          const stats = await mobileStorageService.getMobileStorageStats();
          setMobileStats(stats);
          
          
          
        } catch (compressionError) {
          console.error('❌ Error en compresión (no crítico):', compressionError);
          // No fallar toda la operación, los datos ya están en el estado
          // Los usuarios aún pueden usar la app sin cache comprimido
        }
      }
      
      setLoadingProgress(100);
    }
  } catch (err: any) {
    if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
      setError('Error al cargar devocionales');
      console.error('❌ Error en fetchFromFirestoreForMobile:', err);
    }
  } finally {
    if (!abortControllerRef.current?.signal.aborted) {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 300);
    }
  }
}, [user]);

  // 🔥 AGREGAR ESTA FUNCIÓN NUEVA
  const checkForMobileUpdates = useCallback(async () => {
    try {
      // Aquí puedes agregar tu lógica para verificar si hay updates
      // Por ahora, simplemente verificamos cada cierto tiempo
      
      
      // Si tienes una función para verificar timestamp, úsala aquí
      // const needsUpdate = await smartSyncFirestoreService.checkIfNeedsUpdate(user.uid);
      // if (needsUpdate) {
      //   await fetchFromFirestoreForMobile(true);
      // }
    } catch (error) {
      console.error('Error verificando updates móviles:', error);
    }
  }, [user]);

  // 🔥 MODIFICAR tu función smartSync existente
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

      // 🔥 NUEVO: Solo re-comprimir si hay cambios desde Firestore
      if (result.fromFirestore > 0 || result.data.length > 0) {
        await mobileStorageService.saveCompressedDevocionales(result.data, false); // false = sync completa
        const stats = await mobileStorageService.getMobileStorageStats();
        setMobileStats(stats);
        
      } else {
        
      }

    } catch (error) {
      console.error('Error in smart sync:', error);
      setError('Error en la sincronización inteligente');
    } finally {
      setSyncLoading(false);
    }
  }, [user, syncLoading]);


  // 🔥 AGREGAR ESTA FUNCIÓN NUEVA
  const clearMobileCache = useCallback(async () => {
    try {
      await mobileStorageService.clearAllData();
      setMobileStats(null);
      
    } catch (error) {
      console.error('Error limpiando cache móvil:', error);
    }
  }, []);

  // Tu useEffect existente - NO CAMBIAR
  useEffect(() => {
    fetchDevocionales();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDevocionales]);

  // Tus otras funciones existentes - NO CAMBIAR
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
      // 1. Guardar en Firestore (como siempre)
      const savedDevocional = await smartSyncFirestoreService.saveDevocional(user.uid, devocional);
      
      // 2. Actualizar estado local inmediatamente (como siempre)
      setDevocionales(prev => {
        const existing = prev.find(d => d.id === savedDevocional.id);
        if (existing) {
          return prev.map(d => d.id === savedDevocional.id ? savedDevocional : d);
        } else {
          return [savedDevocional, ...prev].sort((a, b) => b.fecha.localeCompare(a.fecha));
        }
      });
      
      // 🔥 3. NUEVO: Actualizar también el cache comprimido
      try {
        await mobileStorageService.updateDevocionalInCompressedStorage(savedDevocional);
        
      } catch (cacheError) {
        console.warn('⚠️ Error actualizando cache comprimido (no crítico):', cacheError);
        // No es crítico si falla, se actualizará en la próxima sync
      }
      
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


  // 🔥 AGREGAR función para obtener devocional desde cache (súper rápido)
  const getDevocionalFromCache = useCallback(async (devocionalId: string) => {
    try {
      const cachedDevocional = await mobileStorageService.getDevocionalFromCache(devocionalId);
      if (cachedDevocional) {
        
        return cachedDevocional;
      }
      
      // Si no está en cache, usar la función original
      return await getDevocionalByKey(devocionalId);
    } catch (error) {
      console.error('Error obteniendo devocional desde cache:', error);
      return await getDevocionalByKey(devocionalId);
    }
  }, [getDevocionalByKey]);

  // 🔥 MODIFICAR smartSync para manejar mejor las actualizaciones

  // 🔥 MODIFICAR tu return para incluir las nuevas funciones
  return {
    devocionales,
    loadingSincronizado,
    syncLoading,
    error,
    lastSyncResult,
    mobileStats, // 🔥 NUEVO
    loadingProgress, // 🔥 NUEVO
    refetch: fetchDevocionales,
    getDevocionalFromCache,
    smartSync,
    getDevocionalByKey,
    saveDevocional,
    loadHistoricalData,
    forceRefresh: () => fetchDevocionales(true),
    clearMobileCache, // 🔥 NUEVO
    loadFromMobileStorage, // 🔥 NUEVO
  };
}