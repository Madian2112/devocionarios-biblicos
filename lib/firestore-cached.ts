// 🚀 SERVICIO DE FIRESTORE CON CACHE INTELIGENTE PARA DEVOCIONALES
import { firestoreService } from './firestore';
import { cachedBibleService } from './bible-service-cached';
import { mobileCacheManager } from './mobile-cache';
import type { Devocional, TopicalStudy } from './firestore';

class CachedFirestoreService {
  
  // 🚀 Obtener devocional con textos bíblicos cacheados
  async getDevocionalByDate(key: string): Promise<Devocional | null> {
    
    // 📱 Primero intentar obtener del cache móvil
    const cached = await mobileCacheManager.getCachedDevocional(key);
    console.log('Este es el cache de los devocionales: ', cached, '\n', ' key: ', key)
    if (cached) {
      // Agregar textos cacheados al devocional
      if (cached.devocional.versiculos) {
        for (const versiculo of cached.devocional.versiculos) {
          versiculo.texto = cached.versiculosTextos[versiculo.referencia] || versiculo.texto;
        }
      }
      return cached.devocional;
    }

    // 🌐 Si no está en cache, obtener de Firestore
    const devocional = await firestoreService.getDevocionalByDate(key);
    
    if (devocional) {
      // 🚀 Precargar versículos y cachear todo
      const versiculosTextos = await cachedBibleService.precacheDevocionalVerses(devocional);
      
      // Guardar en cache móvil
      await mobileCacheManager.cacheDevocional(devocional, versiculosTextos);
      
      // Agregar textos al devocional antes de retornar
      if (devocional.versiculos) {
        for (const versiculo of devocional.versiculos) {
          versiculo.texto = versiculosTextos[versiculo.referencia] || '';
        }
      }
    }
    
    return devocional;
  }

  // 🚀 Obtener devocionales con precarga inteligente
  async getDevocionarios(userId: string): Promise<Devocional[]> {
    const devocionales = await firestoreService.getDevocionarios(userId);
    
    // 🚀 Precargar automáticamente los últimos 3 devocionales en background
    this.precacheRecentDevocionales(userId, devocionales).catch(console.error);
    
    return devocionales;
  }

  // 🚀 Precargar devocionales recientes en background
  private async precacheRecentDevocionales(userId: string, devocionales: Devocional[]): Promise<void> {
    const recentDates = this.getRecentDates(1);
    
    for (const fecha of recentDates) {
      try {
        // Verificar si ya está en cache
        const cached = await mobileCacheManager.getCachedDevocional(fecha);
        if (cached) continue;
        
        // Buscar el devocional en la lista
        const devocional = devocionales.find(d => d.fecha === fecha);
        if (!devocional) continue;
        
        // Precargar versículos
        const versiculosTextos = await cachedBibleService.precacheDevocionalVerses(devocional);
        
        // Guardar en cache
        await mobileCacheManager.cacheDevocional(devocional, versiculosTextos);
        
      } catch (error) {
        console.error(`Error precaching devocional ${fecha}:`, error);
      }
    }
    
  }

  // 🚀 Guardar devocional y actualizar cache
  async saveDevocional(userId: string, devocional: Omit<Devocional, "createdAt" | "updatedAt" | "userId">): Promise<Devocional> {
    const savedDevocional = await firestoreService.saveDevocional(userId, devocional);
    
    // 🚀 Precargar versículos y actualizar cache
    const versiculosTextos = await cachedBibleService.precacheDevocionalVerses(savedDevocional);
    await mobileCacheManager.cacheDevocional(savedDevocional, versiculosTextos);
    
    return savedDevocional;
  }

  // 🚀 Obtener texto de versículo con cache
  async getVerseText(reference: string, version: string = 'rv1960'): Promise<string> {
    return await cachedBibleService.getVerseText(reference, version);
  }

  // 🚀 Obtener fechas recientes
  private getRecentDates(days: number): string[] {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  // 📊 Obtener estadísticas combinadas de cache
  async getCacheStats() {
    const [bibleStats, mobileCacheStats] = await Promise.all([
      cachedBibleService.getCacheStats(),
      mobileCacheManager.getCacheStats()
    ]);

    return {
      ...bibleStats,
      ...mobileCacheStats,
      totalCached: `${bibleStats.bibleVersesCount} versículos + ${mobileCacheStats.devocionalesTotalCount} devocionales`
    };
  }

  // 🧹 Limpiar todo el cache
  async clearAllCache() {
    await Promise.all([
      cachedBibleService.clearCache(),
      mobileCacheManager.clearAllCache()
    ]);
  }

  // 🚀 Usar todos los métodos originales de firestoreService
  async getTopicalStudies(userId: string): Promise<TopicalStudy[]> {
    return await firestoreService.getTopicalStudies(userId);
  }

  async saveTopicalStudy(userId: string, topic: Omit<TopicalStudy, "createdAt" | "updatedAt" | "userId">): Promise<TopicalStudy> {
    return await firestoreService.saveTopicalStudy(userId, topic);
  }

  async getTopicalStudyById(userId: string, id: string): Promise<TopicalStudy | null> {
    return await firestoreService.getTopicalStudyById(userId, id);
  }

  async deleteDevocional(id: string): Promise<void> {
    return await firestoreService.deleteDevocional(id);
  }

  async deleteTopicalStudy(id: string): Promise<void> {
    return await firestoreService.deleteTopicalStudy(id);
  }
}

// 🚀 Instancia singleton
export const cachedFirestoreService = new CachedFirestoreService(); 