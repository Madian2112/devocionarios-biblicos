// lib/services/smartSyncFirestoreService.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  limit as firestoreLimit,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Tu configuración de Firebase
import { enhancedIndexedDBCache } from '@/lib/cache/indexdDB-avanzado';
import { Devocional, TopicalStudy } from '../firestore';

const DEVOCIONALES_COLLECTION = 'devocionales';
const TOPICS_COLLECTION = 'estudios_topicos';

// Helpers para fechas
const getDateXDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export interface SyncResult {
  fromCache: number;
  fromFirestore: number;
  totalSynced: number;
  missingDates?: string[];
}

class SmartSyncFirestoreService {
  
  // ==================== DEVOCIONALES ====================
  
  async saveDevocional(userId: string, devocional: Omit<Devocional, "createdAt" | "updatedAt" | "userId">) {
    const docRef = doc(db, DEVOCIONALES_COLLECTION, devocional.id);
    const now = Timestamp.now();

    // Verificar si existe en cache primero para evitar lectura de Firestore
    let existingDoc = await enhancedIndexedDBCache.getDevocional(devocional.id);
    
    const data: Devocional = {
      ...devocional,
      userId,
      updatedAt: now,
      createdAt: existingDoc?.createdAt || now, // Usar createdAt del cache si existe
    };
    
    // Guardar en Firestore
    await setDoc(docRef, data, { merge: true });
    
    // Actualizar cache inmediatamente (con auto-cleanup)
    await enhancedIndexedDBCache.saveDevocional(data);
    
    return data;
  }

  async getDevocionarios(userId: string, forceRefresh = false): Promise<SyncResult & { data: Devocional[] }> {
    const cacheKey = `devocionales_${userId}`;
    
    // Si no es refresh forzado, verificar cache
    if (!forceRefresh && await enhancedIndexedDBCache.isCacheValid(cacheKey)) {
      const cached = await enhancedIndexedDBCache.getDevocionalesByUser(userId);
      if (cached.length > 0) {
        return {
          data: cached,
          fromCache: cached.length,
          fromFirestore: 0,
          totalSynced: cached.length,
        };
      }
    }

    // Obtener configuración del usuario para saber cuántos días mantener
    const settings = await enhancedIndexedDBCache.getUserCacheSettings(userId);
    const daysToCache = settings.cacheDaysLimit;
    
    // Obtener datos desde cache lo que tenemos
    const cachedData = await enhancedIndexedDBCache.getDevocionalesByUser(userId);
    const startDate = getDateXDaysAgo(daysToCache - 1); // -1 porque incluye hoy
    
    let firestoreQuery;
    let newData: Devocional[] = [];
    
    if (cachedData.length === 0) {
      // No hay datos en cache, obtener según configuración del usuario
      firestoreQuery = query(
        collection(db, DEVOCIONALES_COLLECTION),
        where("userId", "==", userId),
        where("fecha", ">=", startDate),
        orderBy("fecha", "desc")
      );
      
      const querySnapshot = await getDocs(firestoreQuery);
      newData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }) as Devocional);
      
      // Guardar nuevos datos en cache
      for (const devocional of newData) {
        await enhancedIndexedDBCache.saveDevocional(devocional);
      }
      
      return {
        data: newData,
        fromCache: 0,
        fromFirestore: newData.length,
        totalSynced: newData.length,
      };
    } else {
      // Tenemos datos en cache, obtener solo los que faltan
      const missingDates = await enhancedIndexedDBCache.getMissingDatesInCache(userId, daysToCache);
      
      if (missingDates.length === 0) {
        // No faltan datos
        return {
          data: cachedData,
          fromCache: cachedData.length,
          fromFirestore: 0,
          totalSynced: cachedData.length,
          missingDates: [],
        };
      }
      
      // Obtener solo los datos que faltan
      for (const fecha of missingDates) {
        const q = query(
          collection(db, DEVOCIONALES_COLLECTION),
          where("userId", "==", userId),
          where("fecha", "==", fecha),
          firestoreLimit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const devocional = { id: doc.id, ...doc.data() } as Devocional;
          newData.push(devocional);
          
          // Guardar en cache inmediatamente
          await enhancedIndexedDBCache.saveDevocional(devocional);
        }
      }
      
      // Retornar todos los datos actualizados
      const allData = await enhancedIndexedDBCache.getDevocionalesByUser(userId);
      
      return {
        data: allData,
        fromCache: cachedData.length,
        fromFirestore: newData.length,
        totalSynced: allData.length,
        missingDates: missingDates.filter(date => !newData.find(d => d.fecha === date)),
      };
    }
  }

  // NUEVA FUNCIÓN: Smart Sync - Solo los N documentos más recientes que faltan
async smartSyncDevocionales(userId: string): Promise<SyncResult & { data: Devocional[] }> {
  const settings = await enhancedIndexedDBCache.getUserCacheSettings(userId);
  const cachedData = await enhancedIndexedDBCache.getDevocionalesByUser(userId);
  
  try {
    // SIEMPRE hacer petición a Firebase para obtener TODOS los devocionales del usuario
    const q = query(
      collection(db, DEVOCIONALES_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc") // Ordenar por fecha de creación descendente (más recientes primero)
    );
    
    const querySnapshot = await getDocs(q);
    const firebaseData: Devocional[] = [];
    
    querySnapshot.forEach((doc) => {
      firebaseData.push({ id: doc.id, ...doc.data() } as Devocional);
    });
    
    // Determinar cuántos días de datos deberíamos mantener en caché
    const cacheDaysLimit = settings.cacheDaysLimit;
    
    // Si Firebase tiene datos, actualizar el caché con los últimos N días
    if (firebaseData.length > 0) {
      // Tomar solo los últimos registros según cacheDaysLimit
      const dataToCache = firebaseData.slice(0, cacheDaysLimit);
      
      // Actualizar/guardar en caché los registros (saveDevocional debería hacer upsert)
      for (const devocional of dataToCache) {
        await enhancedIndexedDBCache.saveDevocional(devocional);
      }
    }
    
    return {
      data: firebaseData, // Retornar TODOS los datos de Firebase
      fromCache: cachedData.length, // Cuántos había en caché antes
      fromFirestore: firebaseData.length, // Cuántos vinieron de Firebase
      totalSynced: firebaseData.length, // Total sincronizado (todos los de Firebase)
      missingDates: [], // Ya no aplica este concepto
    };
    
  } catch (error) {
    console.error('Error en smartSyncDevocionales:', error);
    
    // En caso de error, retornar datos del caché
    return {
      data: cachedData,
      fromCache: cachedData.length,
      fromFirestore: 0,
      totalSynced: cachedData.length,
      missingDates: [],
    };
  }
}
  async getDevocionalByDate(key: string, userId: string): Promise<Devocional | null> {
    // Verificar cache primero
    const cached = await enhancedIndexedDBCache.getDevocional(key);
    if (cached && cached.userId === userId) {
      return cached;
    }

    // Si no está en cache, obtener de Firestore
    const q = query(
      collection(db, DEVOCIONALES_COLLECTION),
      where("id", "==", key),
      where("userId", "==", userId) // Agregar filtro de usuario por seguridad
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    const devocional = { id: doc.id, ...doc.data() } as Devocional;
    
    // Guardar en cache
    await enhancedIndexedDBCache.saveDevocional(devocional);
    
    return devocional;
  }

  // Método para cargar devocionales históricos (más allá del límite configurado)
  async loadHistoricalDevocionales(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<Devocional[]> {
    // Verificar qué tenemos en cache para este rango
    const cachedData = await enhancedIndexedDBCache.getDevocionalesInDateRange(userId, startDate, endDate);
    
    // Si tenemos datos completos en cache, retornarlos
    if (cachedData.length > 0) {
      return cachedData;
    }

    // Obtener de Firestore
    const q = query(
      collection(db, DEVOCIONALES_COLLECTION),
      where("userId", "==", userId),
      where("fecha", ">=", startDate),
      where("fecha", "<=", endDate),
      orderBy("fecha", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as Devocional);
    
    // IMPORTANTE: No guardar datos históricos en cache automáticamente
    // ya que podrían exceder el límite configurado por el usuario
    // Solo los retornamos para uso inmediato
    
    return data;
  }

  // ==================== TOPICAL STUDIES ====================

  async saveTopicalStudy(userId: string, topic: Omit<TopicalStudy, "createdAt" | "updatedAt" | "userId">) {
    const docRef = doc(db, TOPICS_COLLECTION, topic.id);
    const now = Timestamp.now();

    // Verificar si existe en cache
    const existingDoc = await enhancedIndexedDBCache.getTopicalStudy(topic.id);

    const data: TopicalStudy = {
      ...topic,
      userId,
      updatedAt: now,
      createdAt: existingDoc?.createdAt || now,
    };
    
    // Guardar en Firestore
    await setDoc(docRef, data, { merge: true });
    
    // Actualizar cache (con auto-cleanup)
    await enhancedIndexedDBCache.saveTopicalStudy(data);
    
    return data;
  }

  async getTopicalStudies(userId: string, forceRefresh = false): Promise<SyncResult & { data: TopicalStudy[] }> {
    const cacheKey = `topical_studies_${userId}`;
    
    // Verificar cache si no es refresh forzado
    if (!forceRefresh && await enhancedIndexedDBCache.isCacheValid(cacheKey)) {
      const cached = await enhancedIndexedDBCache.getTopicalStudiesByUser(userId);
      if (cached.length > 0) {
        return {
          data: cached,
          fromCache: cached.length,
          fromFirestore: 0,
          totalSynced: cached.length,
        };
      }
    }
    console.log('Este es el id de usuario que me lleva: ', userId);

    // Obtener de Firestore
    const q = query(
        collection(db, TOPICS_COLLECTION),
        where("userId", "==", userId),
        orderBy("name", "asc"), // ✅ Restaurado - ahora con índice compuesto
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TopicalStudy);
    
    // Actualizar cache
    for (const study of data) {
      await enhancedIndexedDBCache.saveTopicalStudy(study);
    }
    
    return {
      data,
      fromCache: 0,
      fromFirestore: data.length,
      totalSynced: data.length,
    };
  }

  // NUEVA FUNCIÓN: Smart Sync para Topical Studies
  async smartSyncTopicalStudies(userId: string): Promise<SyncResult & { data: TopicalStudy[] }> {
    const cachedData = await enhancedIndexedDBCache.getTopicalStudiesByUser(userId);
    
    // Para topical studies, comparamos con Firestore para ver si hay nuevos o actualizados
    const q = query(
      collection(db, TOPICS_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const firestoreData = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as TopicalStudy);
    
    // Identificar qué estudios necesitan actualización
    const cachedMap = new Map(cachedData.map(study => [study.id, study]));
    const newOrUpdated: TopicalStudy[] = [];
    
    for (const firestoreStudy of firestoreData) {
      const cachedStudy = cachedMap.get(firestoreStudy.id);
      
      if (!cachedStudy) {
        // Estudio nuevo
        newOrUpdated.push(firestoreStudy);
      } else {
        // Verificar si fue actualizado
        const firestoreUpdated = firestoreStudy.updatedAt?.toMillis ? 
          firestoreStudy.updatedAt.toMillis() : 0;
        const cachedUpdated = cachedStudy.updatedAt?.toMillis ? 
          cachedStudy.updatedAt.toMillis() : 0;
        
        if (firestoreUpdated > cachedUpdated) {
          newOrUpdated.push(firestoreStudy);
        }
      }
    }
    
    // Actualizar cache con estudios nuevos/actualizados
    for (const study of newOrUpdated) {
      await enhancedIndexedDBCache.saveTopicalStudy(study);
    }
    
    // Retornar datos actualizados
    const updatedData = await enhancedIndexedDBCache.getTopicalStudiesByUser(userId);
    
    return {
      data: updatedData,
      fromCache: cachedData.length - newOrUpdated.length,
      fromFirestore: newOrUpdated.length,
      totalSynced: updatedData.length,
    };
  }

  async getTopicalStudyById(userId: string, id: string): Promise<TopicalStudy | null> {
    // Verificar cache primero
    const cached = await enhancedIndexedDBCache.getTopicalStudy(id);
    if (cached && cached.userId === userId) {
      return cached;
    }

    // Obtener de Firestore
    const docRef = doc(db, TOPICS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      return null;
    }

    const study = { id: docSnap.id, ...docSnap.data() } as TopicalStudy;
    
    // Guardar en cache
    await enhancedIndexedDBCache.saveTopicalStudy(study);
    
    return study;
  }

  async deleteTopicalStudy(id: string, userId: string) {
    // Eliminar de Firestore
    await deleteDoc(doc(db, TOPICS_COLLECTION, id));
    
    // Eliminar de cache
    await enhancedIndexedDBCache.deleteTopicalStudy(id);
    
    // Invalidar cache de la lista para forzar refresh
    await enhancedIndexedDBCache.invalidateCache(`topical_studies_${userId}`);
  }

  // ==================== CONFIGURACIÓN DE CACHE ====================

  async updateUserCacheDaysLimit(userId: string, newLimit: number): Promise<void> {
    await enhancedIndexedDBCache.updateCacheDaysLimit(userId, newLimit);
  }

  async getUserCacheSettings(userId: string) {
    return await enhancedIndexedDBCache.getUserCacheSettings(userId);
  }

  async toggleAutoCleanup(userId: string, enabled: boolean): Promise<void> {
    const settings = await enhancedIndexedDBCache.getUserCacheSettings(userId);
    settings.autoCleanupEnabled = enabled;
    await enhancedIndexedDBCache.saveUserCacheSettings(settings);
  }

  // ==================== UTILIDADES DE CACHE ====================

  async invalidateUserCache(userId: string): Promise<void> {
    await enhancedIndexedDBCache.invalidateUserCache(userId);
  }

  async clearExpiredCache(): Promise<void> {
    await enhancedIndexedDBCache.clearExpiredCache();
  }

  async performManualCleanup(userId: string) {
    return await enhancedIndexedDBCache.performManualCleanup(userId);
  }

  async clearAllUserData(userId: string): Promise<void> {
    await enhancedIndexedDBCache.clearAllUserData(userId);
  }

  async forceCacheRefresh(userId: string): Promise<void> {
    await this.invalidateUserCache(userId);
    // Recargar datos inmediatamente
    await Promise.all([
      this.getDevocionarios(userId, true),
      this.getTopicalStudies(userId, true)
    ]);
  }

  // Método para precargar datos en segundo plano
  async preloadUserData(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.getDevocionarios(userId),
        this.getTopicalStudies(userId)
      ]);
    } catch (error) {
      console.error('Error preloading user data:', error);
    }
  }

  // Verificar estado del cache
  async getCacheStatus(userId: string): Promise<{
    devocionalCacheValid: boolean;
    topicalCacheValid: boolean;
    devocionalCount: number;
    topicalCount: number;
    settings: any;
  }> {
    const [devocionalCacheValid, topicalCacheValid, devocionales, topicals, settings] = await Promise.all([
      enhancedIndexedDBCache.isCacheValid(`devocionales_${userId}`),
      enhancedIndexedDBCache.isCacheValid(`topical_studies_${userId}`),
      enhancedIndexedDBCache.getDevocionalesByUser(userId),
      enhancedIndexedDBCache.getTopicalStudiesByUser(userId),
      enhancedIndexedDBCache.getUserCacheSettings(userId)
    ]);

    return {
      devocionalCacheValid,
      topicalCacheValid,
      devocionalCount: devocionales.length,
      topicalCount: topicals.length,
      settings,
    };
  }

  // NUEVA FUNCIÓN: Obtener estadísticas detalladas para debugging
  async getCacheStats(userId: string): Promise<{
    totalDevocionales: number;
    oldestDevocionalDate: string | null;
    newestDevocionalDate: string | null;
    totalTopicalStudies: number;
    cacheSettings: any;
    missingSyncDates: string[];
  }> {
    const [devocionales, topicals, settings] = await Promise.all([
      enhancedIndexedDBCache.getDevocionalesByUser(userId),
      enhancedIndexedDBCache.getTopicalStudiesByUser(userId),
      enhancedIndexedDBCache.getUserCacheSettings(userId)
    ]);

    const missingDates = await enhancedIndexedDBCache.getMissingDatesInCache(userId, settings.cacheDaysLimit);

    return {
      totalDevocionales: devocionales.length,
      oldestDevocionalDate: devocionales.length > 0 ? 
        devocionales[devocionales.length - 1].fecha : null,
      newestDevocionalDate: devocionales.length > 0 ? 
        devocionales[0].fecha : null,
      totalTopicalStudies: topicals.length,
      cacheSettings: settings,
      missingSyncDates: missingDates,
    };
  }
}

export const smartSyncFirestoreService = new SmartSyncFirestoreService();