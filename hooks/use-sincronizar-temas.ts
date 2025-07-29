// hooks/useSmartSyncTopicalStudies.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { smartSyncFirestoreService, SyncResult } from '@/lib/services/sincronizacion-inteligente-firestore';
import { useAuthContext } from '@/context/auth-context';
import { TopicalStudy } from '@/lib/firestore';

export function useTopicalStudies() {
  const { user } = useAuthContext();
  const [studies, setStudies] = useState<TopicalStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStudies = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setStudies([]);
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
      const result = await smartSyncFirestoreService.getTopicalStudies(user.uid, forceRefresh);
      
      if (!abortControllerRef.current.signal.aborted) {
        setStudies(result.data);
        setLastSyncResult({
          fromCache: result.fromCache,
          fromFirestore: result.fromFirestore,
          totalSynced: result.totalSynced,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        setError('Error al cargar estudios');
        console.error('Error fetching topical studies:', err);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [user]);

  // 🚀 NUEVA FUNCIÓN: Smart Sync para Topical Studies
  const smartSync = useCallback(async () => {
    if (!user || syncLoading) return;

    setSyncLoading(true);
    setError(null);

    try {
      const result = await smartSyncFirestoreService.smartSyncTopicalStudies(user.uid);
      
      setStudies(result.data);
      setLastSyncResult({
        fromCache: result.fromCache,
        fromFirestore: result.fromFirestore,
        totalSynced: result.totalSynced,
      });

      if (result.fromFirestore > 0) {
        console.log(`✅ Smart Sync completado: ${result.fromFirestore} estudios sincronizados`);
      } else {
        console.log('✅ Smart Sync: Todos los estudios están actualizados');
      }

    } catch (error) {
      console.error('Error in smart sync:', error);
      setError('Error en la sincronización inteligente');
    } finally {
      setSyncLoading(false);
    }
  }, [user, syncLoading]);

  useEffect(() => {
    fetchStudies();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStudies]);

  const deleteStudy = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await smartSyncFirestoreService.deleteTopicalStudy(id, user.uid);
      setStudies(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting study:', error);
      setError('Error al eliminar estudio');
    }
  }, [user]);

  const saveStudy = useCallback(async (topic: Omit<TopicalStudy, "createdAt" | "updatedAt" | "userId">) => {
    if (!user) return null;

    try {
      const savedStudy = await smartSyncFirestoreService.saveTopicalStudy(user.uid, topic);
      
      setStudies(prev => {
        const existing = prev.find(s => s.id === savedStudy.id);
        if (existing) {
          return prev.map(s => s.id === savedStudy.id ? savedStudy : s);
        } else {
          return [...prev, savedStudy].sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      
      return savedStudy;
    } catch (error) {
      console.error('Error saving study:', error);
      setError('Error al guardar estudio');
      return null;
    }
  }, [user]);

  return {
    studies,
    loading,
    syncLoading,
    error,
    lastSyncResult,
    refetch: fetchStudies,
    smartSync, // 🚀 Nueva función de sincronización inteligente
    deleteStudy,
    saveStudy,
    forceRefresh: () => fetchStudies(true),
  };
}