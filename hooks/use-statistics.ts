import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const calculateStatistics = async () => {
      if (!user) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // 📊 Obtener todos los datos del usuario
        const [devocionales, estudios] = await Promise.all([
          cachedFirestoreService.getDevocionarios(user.uid),
          cachedFirestoreService.getTopicalStudies(user.uid)
        ]);

        // 📈 Calcular estadísticas
        const completados = devocionales.filter(d => d.completado).length;
        
        const versiculos = devocionales.reduce((total, d) => {
          return total + (d.versiculos?.length || 0);
        }, 0) + estudios.reduce((total, e) => {
          return total + (e.entries?.length || 0);
        }, 0);

        const referencias = devocionales.reduce((total, d) => {
          return total + (d.referencias?.length || 0);
        }, 0);

        // 🔥 Calcular racha de días consecutivos
        const racha = calculateStreak(devocionales);

        setStats({
          completados,
          versiculos,
          referencias,
          racha,
          totalDevocionales: devocionales.length,
          totalEstudios: estudios.length,
          loading: false,
        });

      } catch (error) {
        console.error('Error calculando estadísticas:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    calculateStatistics();
  }, [user]);

  return stats;
}

// 🔥 Función para calcular racha de días consecutivos
function calculateStreak(devocionales: Devocional[]): number {
  if (devocionales.length === 0) return 0;

  // Ordenar por fecha (más reciente primero)
  const sortedDevocionales = [...devocionales]
    .filter(d => d.completado) // Solo devocionales completados
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  if (sortedDevocionales.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche

  // Verificar si el usuario estudió hoy o ayer
  const latestDate = new Date(sortedDevocionales[0].fecha);
  latestDate.setHours(0, 0, 0, 0);

  const daysDifference = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Si el último devocional es de más de 1 día, la racha se rompió
  if (daysDifference > 1) return 0;

  // Calcular días consecutivos
  let currentDate = latestDate;
  
  for (const devocional of sortedDevocionales) {
    const devocionalDate = new Date(devocional.fecha);
    devocionalDate.setHours(0, 0, 0, 0);

    if (devocionalDate.getTime() === currentDate.getTime()) {
      streak++;
      // Mover al día anterior
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Si hay un salto de días, romper la racha
      break;
    }
  }

  return streak;
} 