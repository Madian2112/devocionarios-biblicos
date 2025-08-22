import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthContext } from '@/context/auth-context';
import { deepStudySyncService } from '@/lib/services/deep-study-sync-service';
import type { DeepStudy } from '@/lib/interfaces/deep-study';
import { toast } from '@/components/ui/use-toast';
import { Timestamp } from 'firebase/firestore';

type UseDeepStudiesReturn = {
  studies: DeepStudy[];
  loading: boolean;
  error: Error | null;
  fetchStudies: () => Promise<void>;
  saveStudy: (study: Omit<DeepStudy, "createdAt" | "updatedAt" | "userId">) => Promise<DeepStudy | null>;
  deleteStudy: (id: string) => Promise<boolean>;
  syncStudies: () => Promise<void>;
};

export function useDeepStudies(): UseDeepStudiesReturn {
  const { user } = useAuthContext();
  const [studies, setStudies] = useState<DeepStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Función para cargar los estudios
  const loadStudies = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const fetchedStudies = await deepStudySyncService.getDeepStudies(user.uid);
      setStudies(fetchedStudies);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar estudios'));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los estudios profundos',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Referencia para cancelar peticiones
  const abortControllerRef = useRef<AbortController | null>(null);

  // Función para sincronizar estudios
  const syncStudies = useCallback(async () => {
    if (!user) return;
    try {
      await deepStudySyncService.smartSyncDeepStudies(user.uid);
      await loadStudies();
      toast({
        title: "✅ Sincronización completada",
        description: "Tus estudios profundos están actualizados",
        duration: 3000,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: "❌ Error de sincronización",
        description: "No se pudieron sincronizar los estudios",
        duration: 5000,
      });
    }
  }, [user, loadStudies]);

  // Cargar estudios al iniciar
  useEffect(() => {
    loadStudies();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadStudies]);

  // Guardar un estudio
  const saveStudy = useCallback(async (study: Omit<DeepStudy, "createdAt" | "updatedAt" | "userId">) => {
    if (!user) return null;

    try {
      const now = Timestamp.now();
      const completeStudy: DeepStudy = {
        ...study,
        userId: user.uid,
        createdAt: now,
        updatedAt: now
      };
      const savedStudy = await deepStudySyncService.saveDeepStudy(completeStudy);
      setStudies(prev => {
        const index = prev.findIndex(s => s.id === study.id);
        if (index >= 0) {
          return [...prev.slice(0, index), savedStudy, ...prev.slice(index + 1)];
        }
        return [savedStudy, ...prev];
      });
      return savedStudy;
    } catch (error) {
      console.error('Error al guardar el estudio:', error);
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar el estudio. Por favor, intenta de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
      return null;
    }
  }, [user]);

  // Eliminar un estudio
  const deleteStudy = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      await deepStudySyncService.deleteDeepStudy(id);
      setStudies(prev => prev.filter(study => study.id !== id));
      return true;
    } catch (error) {
      console.error('Error al eliminar el estudio:', error);
      toast({
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar el estudio. Por favor, intenta de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
  }, [user]);

  return {
    studies,
    loading,
    error,
    fetchStudies: loadStudies,
    saveStudy,
    deleteStudy,
    syncStudies,
  };
}