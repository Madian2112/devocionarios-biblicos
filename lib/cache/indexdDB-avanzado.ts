import { Devocional, TopicalStudy, StudyTopic } from "../firestore";

// lib/cache/enhancedIndexedDBService.ts
export interface CacheConfig {
  dbName: string;
  version: number;
  stores: {
    devocionales: string;
    topicalStudies: string;
    studyTopics: string;
    metadata: string;
    settings: string;
  };
}

export interface CacheMetadata {
  key: string;
  lastUpdated: number;
  expiresAt: number;
  userId: string;
}

export interface UserCacheSettings {
  userId: string;
  cacheDaysLimit: number; // Cantidad de días a mantener en cache
  lastCleanup: number; // Timestamp de la última limpieza
  autoCleanupEnabled: boolean;
}

const CACHE_CONFIG: CacheConfig = {
  dbName: 'DevocionalApp',
  version: 3, // Incrementado para agregar store de study topics
  stores: {
    devocionales: 'devocionales',
    topicalStudies: 'topical_studies',
    studyTopics: 'study_topics',
    metadata: 'cache_metadata',
    settings: 'user_settings',
  },
};

// Configuración por defecto: 20 días
const DEFAULT_CACHE_DAYS = 20;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas para metadata

class EnhancedIndexedDBCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initDB();
    return this.initPromise;
  }

  private async _initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_CONFIG.dbName, CACHE_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para devocionales
        if (!db.objectStoreNames.contains(CACHE_CONFIG.stores.devocionales)) {
          const devocionalStore = db.createObjectStore(CACHE_CONFIG.stores.devocionales, {
            keyPath: 'id',
          });
          devocionalStore.createIndex('userId', 'userId', { unique: false });
          devocionalStore.createIndex('fecha', 'fecha', { unique: false });
          devocionalStore.createIndex('userId_fecha', ['userId', 'fecha'], { unique: false });
          devocionalStore.createIndex('completado', 'completado', { unique: false });
          devocionalStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        // Store para topical studies
        if (!db.objectStoreNames.contains(CACHE_CONFIG.stores.topicalStudies)) {
          const topicalStore = db.createObjectStore(CACHE_CONFIG.stores.topicalStudies, {
            keyPath: 'id',
          });
          topicalStore.createIndex('userId', 'userId', { unique: false });
          topicalStore.createIndex('userId_name', ['userId', 'name'], { unique: false });
          topicalStore.createIndex('userId_updatedAt', ['userId', 'updatedAt'], { unique: false });
        }

        // Store para study topics
        if (!db.objectStoreNames.contains(CACHE_CONFIG.stores.studyTopics)) {
          const studyTopicsStore = db.createObjectStore(CACHE_CONFIG.stores.studyTopics, {
            keyPath: 'id',
          });
          studyTopicsStore.createIndex('userId', 'userId', { unique: false });
          studyTopicsStore.createIndex('userId_name', ['userId', 'name'], { unique: false });
          studyTopicsStore.createIndex('userId_updatedAt', ['userId', 'updatedAt'], { unique: false });
        }

        // Store para metadata del cache
        if (!db.objectStoreNames.contains(CACHE_CONFIG.stores.metadata)) {
          db.createObjectStore(CACHE_CONFIG.stores.metadata, {
            keyPath: 'key',
          });
        }

        // Store para configuraciones de usuario
        if (!db.objectStoreNames.contains(CACHE_CONFIG.stores.settings)) {
          db.createObjectStore(CACHE_CONFIG.stores.settings, {
            keyPath: 'userId',
          });
        }
      };
    });
  }

  // ==================== USER SETTINGS ====================

  async getUserCacheSettings(userId: string): Promise<UserCacheSettings> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.settings], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.settings);
      const request = store.get(userId);

      request.onsuccess = () => {
        const settings = request.result;
        if (settings) {
          resolve(settings);
        } else {
          // Configuración por defecto
          const defaultSettings: UserCacheSettings = {
            userId,
            cacheDaysLimit: DEFAULT_CACHE_DAYS,
            lastCleanup: Date.now(),
            autoCleanupEnabled: true,
          };
          resolve(defaultSettings);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveUserCacheSettings(settings: UserCacheSettings): Promise<void> {
    await this.init();
    
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.settings], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.settings);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(settings);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateCacheDaysLimit(userId: string, newLimit: number): Promise<void> {
    const settings = await this.getUserCacheSettings(userId);
    const oldLimit = settings.cacheDaysLimit;
    
    settings.cacheDaysLimit = newLimit;
    settings.lastCleanup = Date.now();
    
    await this.saveUserCacheSettings(settings);
    
    // Si el nuevo límite es menor, limpiar datos antiguos inmediatamente
    if (newLimit < oldLimit) {
      await this._cleanupOldData(userId, newLimit);
    }
  }

  // ==================== DEVOCIONALES ====================

  async saveDevocional(devocional: Devocional): Promise<void> {
    await this.init();
    
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.devocionales], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.devocionales);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(devocional);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Actualizar metadata
    await this._updateMetadata(`devocionales_${devocional.userId}`, devocional.userId);
    
    // Limpieza automática si está habilitada
    const settings = await this.getUserCacheSettings(devocional.userId);
    if (settings.autoCleanupEnabled) {
      await this._cleanupOldDevocionales(devocional.userId, settings.cacheDaysLimit);
    }
  }

  async getDevocional(id: string): Promise<Devocional | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.devocionales], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.devocionales);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getDevocionalesByUser(userId: string, limit?: number): Promise<Devocional[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.devocionales], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.devocionales);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        let results = request.result || [];
        
        // Ordenar por fecha descendente
        results.sort((a, b) => b.fecha.localeCompare(a.fecha));
        
        if (limit) {
          results = results.slice(0, limit);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getDevocionalesInDateRange(userId: string, startDate: string, endDate: string): Promise<Devocional[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.devocionales], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.devocionales);
      const index = store.index('userId_fecha');
      
      const range = IDBKeyRange.bound([userId, startDate], [userId, endDate]);
      const request = index.getAll(range);

      request.onsuccess = () => {
        const results = request.result || [];
        results.sort((a, b) => b.fecha.localeCompare(a.fecha));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private async _cleanupOldDevocionales(userId: string, daysToKeep: number): Promise<void> {
    const cutoffDate = this._getDateXDaysAgo(daysToKeep);
    
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.devocionales], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.stores.devocionales);
      const index = store.index('userId_fecha');
      
      // Obtener documentos antiguos para eliminar
      const range = IDBKeyRange.bound([userId, ''], [userId, cutoffDate], false, true);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== TOPICAL STUDIES ====================

  async saveTopicalStudy(study: TopicalStudy): Promise<void> {
    await this.init();
    
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.topicalStudies], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.topicalStudies);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(study);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Actualizar metadata
    await this._updateMetadata(`topical_studies_${study.userId}`, study.userId);
    
    // Limpieza automática de topical studies si está habilitada
    const settings = await this.getUserCacheSettings(study.userId);
    if (settings.autoCleanupEnabled) {
      await this._cleanupOldTopicalStudies(study.userId, settings.cacheDaysLimit);
    }
  }

  async getTopicalStudy(id: string): Promise<TopicalStudy | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.topicalStudies], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.topicalStudies);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getTopicalStudiesByUser(userId: string): Promise<TopicalStudy[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.topicalStudies], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.topicalStudies);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const results = request.result || [];
        // Ordenar por nombre
        results.sort((a, b) => a.name.localeCompare(b.name));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTopicalStudy(id: string): Promise<void> {
    await this.init();
    
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.topicalStudies], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.topicalStudies);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== STUDY TOPICS ====================

  async saveStudyTopic(topic: StudyTopic): Promise<void> {
    await this.init();
    
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.studyTopics], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.studyTopics);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(topic);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    await this._updateMetadata(`study_topics_${topic.userId}`, topic.userId);
  }

  async getStudyTopic(id: string): Promise<StudyTopic | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.studyTopics], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.studyTopics);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getStudyTopicsByUser(userId: string): Promise<StudyTopic[]> {
    await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.studyTopics], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.studyTopics);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const results = request.result || [];
        results.sort((a, b) => a.name.localeCompare(b.name));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteStudyTopic(id: string): Promise<void> {
    await this.init();
    
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.studyTopics], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.studyTopics);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async _cleanupOldStudyTopics(userId: string, daysToKeep: number): Promise<void> {
    const cutoffTimestamp = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.studyTopics], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.stores.studyTopics);
      const index = store.index('userId_updatedAt');
      
      const range = IDBKeyRange.bound(
        [userId, 0], 
        [userId, cutoffTimestamp], 
        false, 
        true
      );
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  private async _cleanupOldTopicalStudies(userId: string, daysToKeep: number): Promise<void> {
    const cutoffTimestamp = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.topicalStudies], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.stores.topicalStudies);
      const index = store.index('userId_updatedAt');
      
      // Obtener estudios antiguos para eliminar
      const range = IDBKeyRange.bound(
        [userId, 0], 
        [userId, cutoffTimestamp], 
        false, 
        true
      );
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== SYNC HELPERS ====================

  async getMissingDatesInCache(userId: string, totalDays: number): Promise<string[]> {
    const settings = await this.getUserCacheSettings(userId);
    const daysToCheck = Math.min(totalDays, settings.cacheDaysLimit);
    
    const existingDevocionales = await this.getDevocionalesByUser(userId);
    const existingDates = new Set(existingDevocionales.map(d => d.fecha));
    
    const missingDates: string[] = [];
    
    for (let i = 0; i < daysToCheck; i++) {
      const date = this._getDateXDaysAgo(i);
      if (!existingDates.has(date)) {
        missingDates.push(date);
      }
    }
    
    return missingDates.sort().reverse(); // Más recientes primero
  }

  async getTopicalStudiesNeedingSync(userId: string): Promise<TopicalStudy[]> {
    // Para topical studies, simplemente retornamos los que tenemos
    // ya que no tienen fecha específica como los devocionales
    return await this.getTopicalStudiesByUser(userId);
  }

  // ==================== CLEANUP METHODS ====================

  private async _cleanupOldData(userId: string, daysToKeep: number): Promise<void> {
    await Promise.all([
      this._cleanupOldDevocionales(userId, daysToKeep),
      this._cleanupOldTopicalStudies(userId, daysToKeep),
      this._cleanupOldStudyTopics(userId, daysToKeep)
    ]);
  }

  async performManualCleanup(userId: string): Promise<{
    deletedDevocionales: number;
    deletedTopicals: number;
  }> {
    const settings = await this.getUserCacheSettings(userId);
    
    // Contar elementos antes de eliminar
    const devocionales = await this.getDevocionalesByUser(userId);
    const topicals = await this.getTopicalStudiesByUser(userId);
    
    const cutoffDate = this._getDateXDaysAgo(settings.cacheDaysLimit);
    const cutoffTimestamp = Date.now() - (settings.cacheDaysLimit * 24 * 60 * 60 * 1000);
    
    const toDeleteDevocionales = devocionales.filter(d => d.fecha < cutoffDate).length;
    const toDeleteTopicals = topicals.filter(t => {
      const updatedAt = t.updatedAt?.toMillis ? t.updatedAt.toMillis() : 0;
      return updatedAt < cutoffTimestamp;
    }).length;
    
    // Realizar limpieza
    await this._cleanupOldData(userId, settings.cacheDaysLimit);
    
    // Actualizar timestamp de última limpieza
    settings.lastCleanup = Date.now();
    await this.saveUserCacheSettings(settings);
    
    return {
      deletedDevocionales: toDeleteDevocionales,
      deletedTopicals: toDeleteTopicals,
    };
  }

  async clearAllUserData(userId: string): Promise<void> {
    await this.init();
    
    const stores = [CACHE_CONFIG.stores.devocionales, CACHE_CONFIG.stores.topicalStudies];
    const transaction = this.db!.transaction(stores, 'readwrite');
    
    await Promise.all(stores.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const store = transaction.objectStore(storeName);
        const index = store.index('userId');
        const request = index.openCursor(IDBKeyRange.only(userId));
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    }));
    
    // Limpiar metadata y configuraciones del usuario
    await this.invalidateUserCache(userId);
  }

  // ==================== METADATA Y HELPERS ====================

  private async _updateMetadata(key: string, userId: string): Promise<void> {
    const now = Date.now();
    const metadata: CacheMetadata = {
      key,
      lastUpdated: now,
      expiresAt: now + CACHE_DURATION,
      userId,
    };

    const transaction = this.db!.transaction([CACHE_CONFIG.stores.metadata], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.metadata);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(metadata);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCacheMetadata(key: string): Promise<CacheMetadata | null> {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.stores.metadata], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.stores.metadata);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async isCacheValid(key: string): Promise<boolean> {
    const metadata = await this.getCacheMetadata(key);
    if (!metadata) return false;
    
    return Date.now() < metadata.expiresAt;
  }

  async invalidateCache(key: string): Promise<void> {
    await this.init();
    
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.metadata], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.metadata);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.init();
    
    // Invalidar metadata
    await this.invalidateCache(`devocionales_${userId}`);
    await this.invalidateCache(`topical_studies_${userId}`);
  }

  async clearExpiredCache(): Promise<void> {
    await this.init();
    
    const now = Date.now();
    const transaction = this.db!.transaction([CACHE_CONFIG.stores.metadata], 'readwrite');
    const store = transaction.objectStore(CACHE_CONFIG.stores.metadata);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allMetadata = request.result;
        const expiredKeys = allMetadata
          .filter(meta => now >= meta.expiresAt)
          .map(meta => meta.key);
        
        // Eliminar metadata expirada
        expiredKeys.forEach(key => {
          store.delete(key);
        });
        
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Limpiar cache completo (usar con cuidado)
  async clearAllCache(): Promise<void> {
    await this.init();
    
    const stores = [
      CACHE_CONFIG.stores.devocionales,
      CACHE_CONFIG.stores.topicalStudies,
      CACHE_CONFIG.stores.metadata,
      CACHE_CONFIG.stores.settings,
    ];
    
    const transaction = this.db!.transaction(stores, 'readwrite');
    
    await Promise.all(
      stores.map(storeName => {
        return new Promise<void>((resolve, reject) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  private _getDateXDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

export const enhancedIndexedDBCache = new EnhancedIndexedDBCacheService();