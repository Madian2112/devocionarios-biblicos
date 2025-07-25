import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from '@/context/auth-context';
// 🚀 Usar el servicio con cache automático
import { cachedFirestoreService } from '@/lib/firestore-cached';
import type { Devocional, TopicalStudy } from '@/lib/firestore';

// 🚀 Detección de dispositivo móvil
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// 🚀 Configuración inteligente de cache basada en dispositivo
const getCacheConfig = () => {
  const mobile = isMobile();
  return {
    duration: mobile ? 2 * 60 * 1000 : 5 * 60 * 1000, // 2min móvil, 5min desktop
    maxItems: mobile ? 20 : 50, // Máximo items cacheados
    maxSize: mobile ? 100 * 1024 : 500 * 1024, // 100KB móvil, 500KB desktop
  };
};

const config = getCacheConfig();

// 🚀 Cache optimizado con límites de memoria
const cache = new Map<string, { data: any; timestamp: number; size: number }>();

function estimateSize(data: any): number {
  // Estimación simple del tamaño en bytes
  return JSON.stringify(data).length * 2; // x2 para UTF-16
}

function isValidCache(key: string): boolean {
  const cached = cache.get(key);
  if (!cached) return false;
  return Date.now() - cached.timestamp < config.duration;
}

function cleanupCache(): void {
  // 🚀 Limpiar cache expirado y por tamaño
  const now = Date.now();
  let totalSize = 0;
  const entries = Array.from(cache.entries());
  
  // Remover expirados
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > config.duration) {
      cache.delete(key);
    } else {
      totalSize += value.size;
    }
  });
  
  // Si excede el tamaño máximo, remover los más antiguos
  if (totalSize > config.maxSize) {
    const sortedEntries = Array.from(cache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp);
    
    for (const [key] of sortedEntries) {
      cache.delete(key);
      totalSize -= cache.get(key)?.size || 0;
      if (totalSize <= config.maxSize * 0.8) break; // Dejar 20% de margen
    }
  }
}

function setCache(key: string, data: any): void {
  const size = estimateSize(data);
  
  // 🚀 No cachear si es demasiado grande para móviles
  if (size > config.maxSize * 0.5) {
    console.warn('Datos muy grandes para cache en móvil, saltando cache');
    return;
  }
  
  // 🚀 Limpiar antes de agregar
  cleanupCache();
  
  // 🚀 Limitar items por tipo de datos
  if (Array.isArray(data) && data.length > config.maxItems) {
    // Solo cachear los más recientes
    data = data.slice(0, config.maxItems);
  }
  
  cache.set(key, { 
    data, 
    timestamp: Date.now(),
    size 
  });
}

function getCache<T>(key: string): T | null {
  const cached = cache.get(key);
  return cached ? cached.data : null;
}

// 🚀 Función para obtener estadísticas del cache
export function getCacheStats() {
  const totalSize = Array.from(cache.values()).reduce((sum, item) => sum + item.size, 0);
  const itemCount = cache.size;
  
  return {
    totalSize: Math.round(totalSize / 1024), // KB
    itemCount,
    maxSize: Math.round(config.maxSize / 1024), // KB
    isMobile: isMobile(),
    config,
  };
}

// 🚀 Hook optimizado para devocionales
export function useDevocionales() {
  const { user } = useAuthContext();
  const [devocionales, setDevocionales] = useState<Devocional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDevocionales = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const cacheKey = `devocionales_${user.uid}`;
    
    // 🚀 Verificar cache primero
    if (isValidCache(cacheKey)) {
      const cached = getCache<Devocional[]>(cacheKey);
      if (cached) {
        setDevocionales(cached);
        setLoading(false);
        return;
      }
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const data = await cachedFirestoreService.getDevocionarios(user.uid);
      setDevocionales(data);
      setCache(cacheKey, data); // 🚀 Guardar en cache
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Error al cargar devocionales');
        console.error('Error fetching devocionales:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDevocionales();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchDevocionales]);

  const invalidateCache = useCallback(() => {
    if (user) {
      cache.delete(`devocionales_${user.uid}`);
    }
  }, [user]);

  return {
    devocionales,
    loading,
    error,
    refetch: fetchDevocionales,
    invalidateCache,
  };
}

// 🚀 Hook optimizado para estudios temáticos
export function useTopicalStudies() {
  const { user } = useAuthContext();
  const [studies, setStudies] = useState<TopicalStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStudies = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const cacheKey = `topical_studies_${user.uid}`;
    
    // 🚀 Verificar cache primero
    if (isValidCache(cacheKey)) {
      const cached = getCache<TopicalStudy[]>(cacheKey);
      if (cached) {
        setStudies(cached);
        setLoading(false);
        return;
      }
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const data = await cachedFirestoreService.getTopicalStudies(user.uid);
      setStudies(data);
      setCache(cacheKey, data); // 🚀 Guardar en cache
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Error al cargar estudios');
        console.error('Error fetching topical studies:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudies();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStudies]);

  const invalidateCache = useCallback(() => {
    if (user) {
      cache.delete(`topical_studies_${user.uid}`);
    }
  }, [user]);

  return {
    studies,
    loading,
    error,
    refetch: fetchStudies,
    invalidateCache,
  };
} 