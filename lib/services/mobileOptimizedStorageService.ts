// services/mobileOptimizedStorageService.ts - VERSIÓN MEJORADA

import pako from 'pako';

interface CompressedChunk {
  id: string;
  chunkIndex: number;
  totalChunks: number;
  compressedData: Uint8Array;
  originalSize: number;
  compressedSize: number;
  timestamp: number;
}

interface MobileStorageMetadata {
  totalRecords: number;
  totalChunks: number;
  lastSync: number;
  lastUpdate: number; // 🔥 NUEVO: timestamp de última actualización individual
  compressionRatio: number;
  deviceInfo: {
    userAgent: string;
    memoryLimit?: number;
    storageQuota?: number;
  };
}

class MobileOptimizedStorageService {
  private dbName = 'DevocionalMobileDB';
  private version = 2;
  private db: IDBDatabase | null = null;
  private readonly CHUNK_SIZE = 50;
  private readonly MAX_MEMORY_USAGE = 50 * 1024 * 1024;

  // ... métodos anteriores (initDB, getDeviceCapabilities, etc.) siguen igual ...

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('compressedChunks')) {
          const chunkStore = db.createObjectStore('compressedChunks', { keyPath: 'id' });
          chunkStore.createIndex('chunkIndex', 'chunkIndex', { unique: false });
          chunkStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('mobileMetadata')) {
          db.createObjectStore('mobileMetadata', { keyPath: 'key' });
        }

        if (db.objectStoreNames.contains('compressedData')) {
          db.deleteObjectStore('compressedData');
        }
      };
    });
  }

  // 🔥 NUEVO: Actualizar un devocional individual en el almacenamiento comprimido
  async updateDevocionalInCompressedStorage(devocional: any): Promise<void> {
    try {
      
      // 1. Cargar todos los datos actuales
      const allData = await this.loadCompressedDevocionales();
      
      if (allData.length === 0) {
        await this.saveCompressedDevocionales([devocional]);
        return;
      }

      // 2. Actualizar o agregar el devocional
      const existingIndex = allData.findIndex(d => d.id === devocional.id);
      
      if (existingIndex >= 0) {
        // Actualizar existente
        allData[existingIndex] = { ...allData[existingIndex], ...devocional };
      } else {
        // Agregar nuevo
        allData.push(devocional);
        // Mantener ordenado por fecha
        allData.sort((a, b) => b.fecha.localeCompare(a.fecha));
      }

      // 3. Re-comprimir todo con los nuevos datos
      await this.saveCompressedDevocionales(allData, true); // true = es actualización individual
      
    } catch (error) {
      console.error('❌ Error actualizando devocional en cache comprimido:', error);
      // Si falla, no es crítico, se actualizará en la próxima sync completa
    }
  }

  // 🔥 NUEVO: Eliminar un devocional del almacenamiento comprimido
  async removeDevocionalFromCompressedStorage(devocionalId: string): Promise<void> {
    try {
      
      const allData = await this.loadCompressedDevocionales();
      
      if (allData.length === 0) {
        return;
      }

      const filteredData = allData.filter(d => d.id !== devocionalId);
      
      if (filteredData.length < allData.length) {
        await this.saveCompressedDevocionales(filteredData, true);
      } else {
      }
      
    } catch (error) {
      console.error('❌ Error eliminando devocional del cache comprimido:', error);
    }
  }

  // 🔥 MODIFICAR: saveCompressedDevocionales para manejar actualizaciones individuales
// 🔥 MÉTODO CORREGIDO: saveCompressedDevocionales 
async saveCompressedDevocionales(devocionales: any[], isIndividualUpdate = false): Promise<void> {
  if (!devocionales || devocionales.length === 0) {
    return;
  }

  
  try {
    const db = await this.initDB();
    const deviceInfo = await this.getDeviceCapabilities();
    
    // 🔥 PASO 1: Limpiar datos existentes (sin fallar si no existen)
    await this.clearChunks();
    
    // 🔥 PASO 2: Comprimir datos
    const compressedChunks = await this.compressDataChunks(devocionales);
    
    if (compressedChunks.length === 0) {
      return;
    }

    
    // 🔥 PASO 3: Guardar chunks uno por uno (más confiable)
    let chunksGuardados = 0;
    
    for (let i = 0; i < compressedChunks.length; i++) {
      const chunk = compressedChunks[i];
      
      try {
        await this.saveIndividualChunk(db, chunk);
        chunksGuardados++;
        
        // Log de progreso cada 10 chunks
        if (chunksGuardados % 10 === 0 || chunksGuardados === compressedChunks.length) {
        }
        
        // Pausa pequeña para evitar sobrecargar
        if (i > 0 && i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        
      } catch (error) {
        console.error(`❌ Error guardando chunk ${i}:`, error);
        // Continuar con los demás chunks
      }
    }
    
    // 🔥 PASO 4: Guardar metadata
    await this.saveMetadata(db, devocionales, compressedChunks, isIndividualUpdate, deviceInfo);
    
    
  } catch (error) {
    console.error('❌ Error en saveCompressedDevocionales:', error);
    throw error;
  }
}

private async saveIndividualChunk(db: IDBDatabase, chunk: CompressedChunk): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let timeoutId: NodeJS.Timeout;
    timeoutId = setTimeout(() => {
        reject(new Error(`Timeout guardando chunk ${chunk.chunkIndex}`));
    }, 5000);
    
    try {
      const transaction = db.transaction(['compressedChunks'], 'readwrite');
      const store = transaction.objectStore('compressedChunks');
      
      // Timeout de seguridad

      
      const request = store.put(chunk);
      
      request.onsuccess = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      request.onerror = () => {
        clearTimeout(timeoutId);
        reject(request.error);
      };
      
      transaction.onerror = () => {
        clearTimeout(timeoutId);
        reject(transaction.error);
      };
      
      transaction.onabort = () => {
        clearTimeout(timeoutId);
        reject(new Error('Transaction aborted'));
      };
      
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

private async saveMetadata(
  db: IDBDatabase, 
  devocionales: any[], 
  compressedChunks: CompressedChunk[], 
  isIndividualUpdate: boolean,
  deviceInfo: any
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    let timeoutId: NodeJS.Timeout;
    timeoutId = setTimeout(() => {
        reject(new Error('Timeout guardando metadata'));
    }, 5000);
    try {
      // Obtener metadata existente de forma segura
      let existingMetadata = null;
      try {
        existingMetadata = await this.getMobileStorageStats();
      } catch (error) {
      }
      
      const totalOriginal = compressedChunks.reduce((sum, chunk) => sum + chunk.originalSize, 0);
      const totalCompressed = compressedChunks.reduce((sum, chunk) => sum + chunk.compressedSize, 0);
      
      const metadata: MobileStorageMetadata = {
        totalRecords: devocionales.length,
        totalChunks: compressedChunks.length,
        lastSync: isIndividualUpdate ? (existingMetadata?.lastSync || Date.now()) : Date.now(),
        lastUpdate: Date.now(),
        compressionRatio: totalOriginal > 0 ? Math.round((1 - totalCompressed/totalOriginal) * 100) : 0,
        deviceInfo
      };
      
      const transaction = db.transaction(['mobileMetadata'], 'readwrite');
      const store = transaction.objectStore('mobileMetadata');
      
      // Timeout de seguridad

      
      const request = store.put({ key: 'mobile_devocionales_meta', ...metadata });
      
      request.onsuccess = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      request.onerror = () => {
        clearTimeout(timeoutId);
        reject(request.error);
      };
      
      transaction.onerror = () => {
        clearTimeout(timeoutId);
        reject(transaction.error);
      };
      
      transaction.onabort = () => {
        clearTimeout(timeoutId);
        reject(new Error('Metadata transaction aborted'));
      };
      
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

  // 🔥 NUEVO: Verificar si los datos locales están más actualizados que Firestore
  async isLocalDataNewer(firestoreLastUpdate: number): Promise<boolean> {
    try {
      const metadata = await this.getMobileStorageStats();
      if (!metadata) return false;
      
      return metadata.lastUpdate > firestoreLastUpdate;
    } catch (error) {
      console.error('Error verificando timestamps:', error);
      return false;
    }
  }

  // 🔥 NUEVO: Obtener devocional específico del cache comprimido
  async getDevocionalFromCache(devocionalId: string): Promise<any | null> {
    try {
      const allData = await this.loadCompressedDevocionales();
      return allData.find(d => d.id === devocionalId) || null;
    } catch (error) {
      console.error('Error obteniendo devocional del cache:', error);
      return null;
    }
  }

  // Métodos anteriores siguen igual...
  private async getDeviceCapabilities() {
    const capabilities = {
      userAgent: navigator.userAgent,
      memoryLimit: (navigator as any).deviceMemory ? (navigator as any).deviceMemory * 1024 * 1024 * 1024 : undefined,
      storageQuota: undefined as number | undefined,
    };

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        capabilities.storageQuota = estimate.quota;
      } catch (error) {
        console.warn('No se pudo obtener storage quota:', error);
      }
    }

    return capabilities;
  }

  private createChunks(data: any[]): any[][] {
    const chunks: any[][] = [];
    for (let i = 0; i < data.length; i += this.CHUNK_SIZE) {
      chunks.push(data.slice(i, i + this.CHUNK_SIZE));
    }
    return chunks;
  }

  private async compressDataChunks(data: any[]): Promise<CompressedChunk[]> {
    const chunks = this.createChunks(data);
    const compressedChunks: CompressedChunk[] = [];
    

    for (let i = 0; i < chunks.length; i++) {
      if ('memory' in performance && (performance as any).memory) {
        const memInfo = (performance as any).memory;
        if (memInfo.usedJSHeapSize > this.MAX_MEMORY_USAGE) {
          console.warn('⚠️ Memoria alta, pausando compresión...');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const chunkData = chunks[i];
      const jsonString = JSON.stringify(chunkData);
      const originalSize = new TextEncoder().encode(jsonString).length;
      
      const compressed = pako.gzip(jsonString, { 
        level: 6,
        windowBits: 15,
        memLevel: 8 
      });
      
      compressedChunks.push({
        id: `chunk_${i}`,
        chunkIndex: i,
        totalChunks: chunks.length,
        compressedData: compressed,
        originalSize,
        compressedSize: compressed.length,
        timestamp: Date.now()
      });

      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    const totalOriginal = compressedChunks.reduce((sum, chunk) => sum + chunk.originalSize, 0);
    const totalCompressed = compressedChunks.reduce((sum, chunk) => sum + chunk.compressedSize, 0);
    
    
    return compressedChunks;
  }

  async loadCompressedDevocionales(): Promise<any[]> {
    try {
      const db = await this.initDB();
      const transaction = db.transaction(['compressedChunks'], 'readonly');
      const store = transaction.objectStore('compressedChunks');
      
      const chunks = await new Promise<CompressedChunk[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
      
      if (chunks.length === 0) {
        return [];
      }
      
      chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
      
      const startTime = performance.now();
      
      const allData: any[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          const decompressed = pako.ungzip(chunk.compressedData, { to: 'string' });
          const chunkData = JSON.parse(decompressed);
          allData.push(...chunkData);
          
          if (i % 3 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
          
        } catch (error) {
          console.error(`Error descomprimiendo chunk ${i}:`, error);
        }
      }
      
      const endTime = performance.now();
      
      return allData;
      
    } catch (error) {
      console.error('Error cargando datos comprimidos móviles:', error);
      return [];
    }
  }

private async clearChunks(): Promise<void> {
  try {
    const db = await this.initDB();
    
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['compressedChunks'], 'readwrite');
      const store = transaction.objectStore('compressedChunks');
      
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        console.warn('⚠️ Error limpiando chunks:', request.error);
        // No rechazar, solo loggar y continuar
        resolve();
      };
      
      transaction.onerror = () => {
        console.warn('⚠️ Error en transacción de limpieza:', transaction.error);
        // No rechazar, continuar
        resolve();
      };
      
      transaction.onabort = () => {
        console.warn('⚠️ Transacción de limpieza abortada');
        // No rechazar, continuar
        resolve();
      };
    });
  } catch (error) {
    console.warn('⚠️ Error inicializando DB para limpiar chunks:', error);
    // No rechazar, usuarios nuevos no tienen chunks que limpiar
    return Promise.resolve();
  }
}

async getMobileStorageStats(): Promise<MobileStorageMetadata | null> {
  try {
    const db = await this.initDB();
    
    return new Promise<MobileStorageMetadata | null>((resolve, reject) => {
      let timeoutId: NodeJS.Timeout;
      
      // Timeout de seguridad
      timeoutId = setTimeout(() => {
        console.warn('⏱️ Timeout obteniendo stats, usuario posiblemente nuevo');
        resolve(null);
      }, 3000);
      
      const transaction = db.transaction(['mobileMetadata'], 'readonly');
      const store = transaction.objectStore('mobileMetadata');
      
      const request = store.get('mobile_devocionales_meta');
      
      request.onsuccess = () => {
        clearTimeout(timeoutId);
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        clearTimeout(timeoutId);
        console.warn('⚠️ Error obteniendo stats:', request.error);
        resolve(null);
      };
      
      transaction.onerror = () => {
        clearTimeout(timeoutId);
        console.warn('⚠️ Error en transacción de stats:', transaction.error);
        resolve(null);
      };
    });
  } catch (error) {
    console.warn('⚠️ Error inicializando DB para stats:', error);
    return null;
  }
}

  async clearAllData(): Promise<void> {
    const db = await this.initDB();
    const transaction = db.transaction(['compressedChunks', 'mobileMetadata'], 'readwrite');
    
    await Promise.all([
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('compressedChunks').clear();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
      new Promise((resolve, reject) => {
        const request = transaction.objectStore('mobileMetadata').clear();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
    ]);
    
  }

  async needsUpdate(lastSyncFromFirestore: number): Promise<boolean> {
    const metadata = await this.getMobileStorageStats();
    if (!metadata) return true;
    return lastSyncFromFirestore > metadata.lastSync;
  }
}

export const mobileStorageService = new MobileOptimizedStorageService();