// 🚀 SERVICIO DE BIBLIA CON CACHE AUTOMÁTICO PARA MÓVILES
import { fetchVerseText } from './bible-api';
import { parseReference } from './bible-utils';
import { mobileCacheManager } from './mobile-cache';

class CachedBibleService {
  
  // 🚀 Obtener texto de versículo con cache automático
  async getVerseText(reference: string, version: string = 'rv1960'): Promise<string> {
    const parsed = parseReference(reference);
    if (!parsed || !parsed.startVerse) {
      return "Referencia inválida.";
    }

    // 📱 Primero intentar obtener del cache móvil
    const cachedText = await mobileCacheManager.getCachedVerse(
      parsed.book, 
      parsed.startChapter, 
      parsed.startVerse, 
      version
    );

    if (cachedText) {
      return cachedText;
    }

    // 🌐 Si no está en cache, obtener de la API
    try {
      const text = await fetchVerseText(reference, version);
      
      // 🚀 Guardar en cache para próxima vez
      if (text && text !== "No se pudo cargar el texto.") {
        await mobileCacheManager.cacheVerse(
          parsed.book, 
          parsed.startChapter, 
          parsed.startVerse, 
          text, 
          version
        );
      }
      
      return text;
    } catch (error) {
      console.error('Error fetching verse:', error);
      return "No se pudo cargar el texto.";
    }
  }

  // 🚀 Obtener múltiples versículos con cache inteligente
  async getMultipleVerses(references: string[], version: string = 'rv1960'): Promise<{[reference: string]: string}> {
    const results: {[reference: string]: string} = {};
    
    // 📱 Procesar en paralelo para mejor rendimiento
    const promises = references.map(async (ref) => {
      const text = await this.getVerseText(ref, version);
      results[ref] = text;
    });

    await Promise.all(promises);
    return results;
  }

  // 🚀 Precargar capítulos completos en background
  async precachePopularChapters(): Promise<void> {
    if (!mobileCacheManager) return;

    // 📖 Capítulos más populares para devocionales
    const popularChapters = [
      { book: 'salmos', chapters: [23, 91, 1, 119] },
      { book: 'juan', chapters: [3, 14, 15] },
      { book: 'romanos', chapters: [8, 12] },
      { book: 'filipenses', chapters: [4] },
      { book: 'efesios', chapters: [2, 6] },
      { book: 'proverbios', chapters: [3, 31] },
      { book: 'genesis', chapters: [1] },
      { book: 'apocalipsis', chapters: [21] }
    ];

    for (const bookData of popularChapters) {
      for (const chapter of bookData.chapters) {
        try {
          await mobileCacheManager.precacheChapter(bookData.book, chapter);
          // Pequeña pausa para no sobrecargar
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error precaching ${bookData.book} ${chapter}:`, error);
        }
      }
    }
  }

  // 🚀 Precargar versículos de un devocional específico
  async precacheDevocionalVerses(devocional: any): Promise<{[referencia: string]: string}> {
    let versiculosTextos: {[referencia: string]: string} = {};
    
    // Obtener todas las referencias del devocional
    const referencias: string[] = [];
    
    // Referencia principal
    if (devocional.citaBiblica) {
      referencias.push(devocional.citaBiblica);
    }
    
    // Referencias de versículos específicos
    if (devocional.versiculos && Array.isArray(devocional.versiculos)) {
      devocional.versiculos.forEach((v: any) => {
        if (v.referencia) {
          referencias.push(v.referencia);
        }
      });
    }

    // 🚀 Cargar todos los textos
    if (referencias.length > 0) {
      versiculosTextos = await this.getMultipleVerses(referencias, devocional.versionCitaBiblica || 'rv1960');
    }

    return versiculosTextos;
  }

  // 🚀 Obtener estadísticas del cache
  async getCacheStats() {
    return await mobileCacheManager.getCacheStats();
  }

  // 🧹 Limpiar cache
  async clearCache() {
    await mobileCacheManager.clearAllCache();
  }
}

// 🚀 Instancia singleton
export const cachedBibleService = new CachedBibleService();

// 🚀 Inicialización automática en móviles
if (typeof window !== 'undefined') {
  // Esperar un poco después del load para no bloquear la UI
  setTimeout(() => {
    cachedBibleService.precachePopularChapters().catch(console.error);
  }, 3000);
} 