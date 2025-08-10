import { BibleBook } from "../bible-data";

const DB_NAME = 'BibleDB';
const DB_VERSION = 1;
const STORE_NAME = 'books';
const CACHE_KEY = 'bible_books';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

// Interfaz para el objeto almacenado en IndexedDB
interface CachedData {
  key: string;
  data: BibleBook[];
  timestamp: number;
}

// Función para inicializar IndexedDB
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Función para obtener datos de IndexedDB
export async function getFromIndexedDB(): Promise<BibleBook[] | null> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(CACHE_KEY);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedData;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // Verificar si los datos no han expirado
        const now = Date.now();
        if (now - result.timestamp > CACHE_DURATION) {
          // Los datos han expirado, eliminarlos
          deleteFromIndexedDB();
          resolve(null);
          return;
        }
        
        resolve(result.data);
      };
    });
  } catch (error) {
    console.warn('Error al acceder a IndexedDB:', error);
    return null;
  }
}

// Función para guardar datos en IndexedDB
export async function saveToIndexedDB(data: BibleBook[]): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const cachedData: CachedData = {
      key: CACHE_KEY,
      data: data,
      timestamp: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(cachedData);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Error al guardar en IndexedDB:', error);
  }
}

// Función para eliminar datos expirados de IndexedDB
async function deleteFromIndexedDB(): Promise<void> {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(CACHE_KEY);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('Error al eliminar de IndexedDB:', error);
  }
}