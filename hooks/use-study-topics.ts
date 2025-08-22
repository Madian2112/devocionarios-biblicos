import { useState, useEffect, useCallback, useRef } from 'react';
import { smartSyncFirestoreService, SyncResult } from '@/lib/services/sincronizacion-inteligente-firestore';
import { useAuthContext } from '@/context/auth-context';
import { StudyTopic } from '@/lib/firestore';

export function useStudyTopics() {
  const { user } = useAuthContext();
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTopics = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setTopics([]);
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
      const result = await smartSyncFirestoreService.getStudyTopics(user.uid, forceRefresh);
      
      if (!abortControllerRef.current.signal.aborted) {
        setTopics(result.data);
        setLastSyncResult({
          fromCache: result.fromCache,
          fromFirestore: result.fromFirestore,
          totalSynced: result.totalSynced,
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        setError('Error al cargar temas de estudio');
        console.error('Error fetching study topics:', err);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [user]);

  const smartSync = useCallback(async () => {
    if (!user || syncLoading) return;

    setSyncLoading(true);
    setError(null);

    try {
      const result = await smartSyncFirestoreService.smartSyncStudyTopics(user.uid);
      
      setTopics(result.data);
      setLastSyncResult({
        fromCache: result.fromCache,
        fromFirestore: result.fromFirestore,
        totalSynced: result.totalSynced,
      });

      if (result.fromFirestore > 0) {
        console.log(`✅ Smart Sync completado: ${result.fromFirestore} temas de estudio sincronizados`);
      } else {
        console.log('✅ Smart Sync: Todos los temas de estudio están actualizados');
      }

    } catch (error) {
      console.error('Error in smart sync:', error);
      setError('Error en la sincronización inteligente');
    } finally {
      setSyncLoading(false);
    }
  }, [user, syncLoading]);

  useEffect(() => {
    fetchTopics();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTopics]);

  const deleteTopic = useCallback(async (id: string) => {
    if (!user) return;

    try {
      await smartSyncFirestoreService.deleteStudyTopic(id, user.uid);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting study topic:', error);
      setError('Error al eliminar tema de estudio');
    }
  }, [user]);

  const saveTopic = useCallback(async (topic: Omit<StudyTopic, "createdAt" | "updatedAt" | "userId">) => {
    if (!user) return null;

    try {
      const savedTopic = await smartSyncFirestoreService.saveStudyTopic(user.uid, topic);
      
      setTopics(prev => {
        const existing = prev.find(t => t.id === savedTopic.id);
        if (existing) {
          return prev.map(t => t.id === savedTopic.id ? savedTopic : t);
        } else {
          return [...prev, savedTopic].sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      
      return savedTopic;
    } catch (error) {
      console.error('Error saving study topic:', error);
      setError('Error al guardar tema de estudio');
      return null;
    }
  }, [user]);

  return {
    topics,
    loading,
    syncLoading,
    error,
    lastSyncResult,
    refetch: fetchTopics,
    smartSync,
    deleteTopic,
    saveTopic,
    forceRefresh: () => fetchTopics(true),
  };
}