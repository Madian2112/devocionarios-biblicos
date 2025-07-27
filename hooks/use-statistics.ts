import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthContext } from '@/context/auth-context';
import { cachedFirestoreService } from '@/lib/firestore-cached';
import type { Devocional, TopicalStudy } from '@/lib/firestore';

interface UserStatistics {
  completados: number;      // Devocionales completados
  versiculos: number;       // Total de versículos estudiados
  referencias: number;      // Total de referencias agregadas
  racha: number;           // Días consecutivos de estudio
  totalDevocionales: number; // Total de devocionales creados
  totalEstudios: number;    // Total de estudios temáticos
  loading: boolean;
}

// 🚀 Cache de estadísticas para evitar recálculos innecesarios
const statsCache = new Map<string, UserStatistics>();

export function useStatistics(): UserStatistics {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<UserStatistics>({
    completados: 0,
    versiculos: 0,
    referencias: 0,
    racha: 0,
    totalDevocionales: 0,
    totalEstudios: 0,
    loading: true,
  });

  // 🔥 Función optimizada para calcular racha - Memoizada
  const calculateStreak = useCallback((devocionales: Devocional[]): number => {
    if (devocionales.length === 0) return 0;

    // Filtrar y ordenar solo devocionales completados
    const completed = devocionales
      .filter(d => d.completado)
      .map(d => {
        const date = new Date(d.fecha);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .sort((a, b) => b - a); // Más reciente primero

    if (completed.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // Si el último devocional es de más de 1 día, racha = 0
    const daysDifference = Math.floor((todayTime - completed[0]) / (1000 * 60 * 60 * 24));
    if (daysDifference > 1) return 0;

    // Calcular racha consecutiva
    let streak = 0;
    let expectedDate = completed[0];

    for (const dateTime of completed) {
      if (dateTime === expectedDate) {
        streak++;
        expectedDate -= 1000 * 60 * 60 * 24; // Día anterior
      } else {
        break;
      }
    }

    return streak;
  }, []);

  // 📊 Memoizar cálculos pesados
  const calculateStatistics = useCallback(async () => {
    if (!user) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    // 🚀 Verificar cache primero
    const cacheKey = `stats_${user.uid}`;
    const cached = statsCache.get(cacheKey);
    
    // Si hay cache y es reciente (menos de 30 segundos), usarlo
    if (cached && !cached.loading) {
      setStats(cached);
      
      // Actualizar en background después de mostrar cache
      setTimeout(async () => {
        try {
          const [devocionales, estudios] = await Promise.all([
            cachedFirestoreService.getDevocionarios(user.uid),
            cachedFirestoreService.getTopicalStudies(user.uid)
          ]);

          const newStats = computeStats(devocionales, estudios);
          statsCache.set(cacheKey, newStats);
          setStats(newStats);
        } catch (error) {
          console.error('Error actualizando estadísticas:', error);
        }
      }, 100);
      return;
    }

    try {
      // 📊 Obtener datos con Promise.all para paralelismo
      const [devocionales, estudios] = await Promise.all([
        cachedFirestoreService.getDevocionarios(user.uid),
        cachedFirestoreService.getTopicalStudies(user.uid)
      ]);

      const newStats = computeStats(devocionales, estudios);
      
      // 🚀 Guardar en cache
      statsCache.set(cacheKey, newStats);
      setStats(newStats);

    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [user, calculateStreak]);

  // 📊 Función pura para computar estadísticas - Optimizada
  const computeStats = useCallback((devocionales: Devocional[], estudios: TopicalStudy[]): UserStatistics => {
    const completados = devocionales.filter(d => d.completado).length;
    
    // 🚀 Calcular versículos de forma más eficiente
    let versiculos = 0;
    for (const d of devocionales) {
      versiculos += d.versiculos?.length || 0;
    }
    for (const e of estudios) {
      versiculos += e.entries?.length || 0;
    }

    // 🚀 Calcular referencias de forma más eficiente
    let referencias = 0;
    for (const d of devocionales) {
      referencias += d.referencias?.length || 0;
    }

    return {
      completados,
      versiculos,
      referencias,
      racha: calculateStreak(devocionales),
      totalDevocionales: devocionales.length,
      totalEstudios: estudios.length,
      loading: false,
    };
  }, [calculateStreak]);

  useEffect(() => {
    calculateStatistics();
  }, [calculateStatistics]);

  return stats;
} 