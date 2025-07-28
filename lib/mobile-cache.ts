// 🚀 SISTEMA DE CACHE AVANZADO PARA MÓVILES
// Usa IndexedDB para almacenar la Biblia completa y devocionales recientes

interface BibleVerseCache {
  id: string; // book_chapter_verse_version
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
  timestamp: number;
}

interface DevocionalCache {
  id: string; // fecha (YYYY-MM-DD)
  devocional: any; // datos completos del devocional
  timestamp: number;
}

class MobileCacheManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'DevocionalApp';
  private readonly dbVersion = 1;
  private readonly isMobile: boolean;

  constructor() {
    this.isMobile = this.detectMobile();
  }

  private detectMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  // 🚀 Inicializar base de datos
  async init(): Promise<void> {
    if (!this.isMobile || !('indexedDB' in window)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 📖 Store para versículos de la Biblia
        if (!db.objectStoreNames.contains('bible_verses')) {
          const bibleStore = db.createObjectStore('bible_verses', { keyPath: 'id' });
          bibleStore.createIndex('book', 'book', { unique: false });
          bibleStore.createIndex('version', 'version', { unique: false });
        }

        // 🗓️ Store para devocionales recientes
        if (!db.objectStoreNames.contains('recent_devocionales')) {
          const devStore = db.createObjectStore('recent_devocionales', { keyPath: 'id' });
          devStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 📚 Store para libros de la Biblia (estructura)
        if (!db.objectStoreNames.contains('bible_books')) {
          db.createObjectStore('bible_books', { keyPath: 'id' });
        }
      };
    });
  }

  // 📖 CACHE DE VERSÍCULOS BÍBLICOS

  async cacheVerse(book: string, chapter: number, verse: number, text: string, version: string = 'rv1960'): Promise<void> {
    if (!this.db) return;

    const verseData: BibleVerseCache = {
      id: `${book}_${chapter}_${verse}_${version}`,
      book,
      chapter,
      verse,
      text,
      version,
      timestamp: Date.now()
    };

    const transaction = this.db.transaction(['bible_verses'], 'readwrite');
    const store = transaction.objectStore('bible_verses');
    await store.put(verseData);
  }

  async getCachedVerse(book: string, chapter: number, verse: number, version: string = 'rv1960'): Promise<string | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['bible_verses'], 'readonly');
    const store = transaction.objectStore('bible_verses');
    const id = `${book}_${chapter}_${verse}_${version}`;
    
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result as BibleVerseCache;
        resolve(result ? result.text : null);
      };
      request.onerror = () => resolve(null);
    });
  }

  // 🚀 Precargar versículos de un capítulo completo
  async precacheChapter(book: string, chapter: number, version: string = 'rv1960'): Promise<void> {
    try {
      // Usar la API existente para obtener el capítulo completo
      const response = await fetch(`https://bible-api.deno.dev/api/read/${version}/${book}/${chapter}`);
      if (!response.ok) return;
      
      const data = await response.json();
      
      // Cachear cada versículo individualmente
      for (const verseData of data.vers) {
        await this.cacheVerse(book, chapter, verseData.number, verseData.verse, version);
      }
      
    } catch (error) {
      console.error('Error precaching chapter:', error);
    }
  }

  // 🗓️ CACHE DE DEVOCIONALES RECIENTES

  async cacheDevocional(devocional: any, versiculosTextos: { [referencia: string]: string }): Promise<void> {
    if (!this.db) return;


    const devData: DevocionalCache = {
      id: devocional.id,
      devocional,
      timestamp: Date.now()
    };

    const transaction = this.db.transaction(['recent_devocionales'], 'readwrite');
    const store = transaction.objectStore('recent_devocionales');
    await store.put(devData);
    
    // 🚀 Limpiar devocionales viejos (más de 3 días)
    await this.cleanOldDevocionales();
  }

  async getCachedDevocional(key: string): Promise<{devocional: any, versiculosTextos: { [referencia: string]: string }} | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction(['recent_devocionales'], 'readonly');
    const store = transaction.objectStore('recent_devocionales');
    
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as DevocionalCache;
        if (result) {
          resolve({
            devocional: result.devocional,
           versiculosTextos: {}
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  // 🚀 Obtener fechas de los últimos 2 días para precarga
  private getRecentDates(): string[] {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) { // Hoy + 2 días anteriores
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  // 🧹 Limpiar devocionales antiguos
  private async cleanOldDevocionales(): Promise<void> {
    if (!this.db) return;

    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    const transaction = this.db.transaction(['recent_devocionales'], 'readwrite');
    const store = transaction.objectStore('recent_devocionales');
    const index = store.index('timestamp');
    
    const request = index.openCursor(IDBKeyRange.upperBound(threeDaysAgo));
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  // 📊 Estadísticas del cache
  async getCacheStats(): Promise<{
    bibleVersesCount: number;
    devocionalesTotalCount: number;
    estimatedSize: string;
    isMobile: boolean;
  }> {
    if (!this.db) {
      return {
        bibleVersesCount: 0,
        devocionalesTotalCount: 0,
        estimatedSize: '0MB',
        isMobile: this.isMobile
      };
    }

    const [bibleCount, devCount] = await Promise.all([
      this.countRecords('bible_verses'),
      this.countRecords('recent_devocionales')
    ]);

    // Estimación: versículo ~200 bytes, devocional ~5KB
    const estimatedBytes = (bibleCount * 200) + (devCount * 5000);
    const estimatedMB = (estimatedBytes / (1024 * 1024)).toFixed(1);

    return {
      bibleVersesCount: bibleCount,
      devocionalesTotalCount: devCount,
      estimatedSize: `${estimatedMB}MB`,
      isMobile: this.isMobile
    };
  }

  private async countRecords(storeName: string): Promise<number> {
    if (!this.db) return 0;
    
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore('store');
    
    return new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  }

  // 🚀 Limpiar todo el cache
  async clearAllCache(): Promise<void> {
    if (!this.db) return;

    const stores = ['bible_verses', 'recent_devocionales', 'bible_books'];
    const transaction = this.db.transaction(stores, 'readwrite');
    
    for (const storeName of stores) {
      const store = transaction.objectStore(storeName);
      store.clear();
    }
    
  }
}

// 🚀 Instancia singleton del cache manager
export const mobileCacheManager = new MobileCacheManager();

// 🚀 Inicializar automáticamente cuando sea posible
if (typeof window !== 'undefined') {
} 