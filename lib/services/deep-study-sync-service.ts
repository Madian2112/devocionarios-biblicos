import { firestoreService } from '../firestore';
import { deepStudyCache } from '../cache/deep-study-cache';
import type { DeepStudy } from '../interfaces/deep-study';

interface DeepStudySyncService {
  saveDeepStudy: (study: DeepStudy) => Promise<DeepStudy>;
  getDeepStudies: (userId: string) => Promise<DeepStudy[]>;
  getDeepStudyById: (id: string) => Promise<DeepStudy | null>;
  deleteDeepStudy: (id: string) => Promise<void>;
  smartSyncDeepStudies: (userId: string) => Promise<void>;
}

export const deepStudySyncService: DeepStudySyncService = {
  async saveDeepStudy(study: DeepStudy): Promise<DeepStudy> {
    try {
      // Guardar en Firestore
      await firestoreService.saveDocument('deep_studies', study.id, study);
      // Actualizar cache local
      await deepStudyCache.saveDeepStudy(study);
      return study;
    } catch (error) {
      console.error('Error al guardar estudio profundo:', error);
      throw error;
    }
  },

  async getDeepStudies(userId: string): Promise<DeepStudy[]> {
    try {
      // Intentar obtener del cache primero
      const cachedStudies = await deepStudyCache.getDeepStudiesByUser(userId);
      if (cachedStudies.length > 0) {
        return cachedStudies;
      }

      // Si no hay en cache, obtener de Firestore
      const studies = await firestoreService.getDocuments<DeepStudy>('deep_studies', 'userId', userId);
      
      // Actualizar cache
      await Promise.all(studies.map(study => deepStudyCache.saveDeepStudy(study)));
      
      return studies;
    } catch (error) {
      console.error('Error al obtener estudios profundos:', error);
      throw error;
    }
  },

  async getDeepStudyById(id: string): Promise<DeepStudy | null> {
    try {
      // Intentar obtener del cache primero
      const cachedStudy = await deepStudyCache.getDeepStudy(id);
      if (cachedStudy) {
        return cachedStudy;
      }

      // Si no está en cache, obtener de Firestore
      const study = await firestoreService.getDocument<DeepStudy>('deep_studies', id);
      if (study) {
        // Actualizar cache
        await deepStudyCache.saveDeepStudy(study);
      }
      
      return study || null;
    } catch (error) {
      console.error('Error al obtener estudio profundo por ID:', error);
      throw error;
    }
  },

  async deleteDeepStudy(id: string): Promise<void> {
    try {
      // Eliminar de Firestore
      await firestoreService.deleteDocument('deep_studies', id);
      // Eliminar del cache
      await deepStudyCache.removeDeepStudy(id);
    } catch (error) {
      console.error('Error al eliminar estudio profundo:', error);
      throw error;
    }
  },

  async smartSyncDeepStudies(userId: string): Promise<void> {
    try {
      // Obtener estudios del cache
      const cachedStudies = await deepStudyCache.getDeepStudiesByUser(userId);
      
      // Obtener estudios de Firestore
      const firestoreStudies = await firestoreService.getDocuments<DeepStudy>('deep_studies', 'userId', userId);
      
      // Crear mapas para comparación rápida
      const firestoreMap = new Map(firestoreStudies.map(study => [study.id, study]));
      const cacheMap = new Map(cachedStudies.map(study => [study.id, study]));
      
      // Sincronizar cambios
      const syncPromises: Promise<void>[] = [];
      
      // Actualizar estudios existentes y agregar nuevos
      firestoreStudies.forEach(firestoreStudy => {
        const cachedStudy = cacheMap.get(firestoreStudy.id);
        if (!cachedStudy || cachedStudy.updatedAt < firestoreStudy.updatedAt) {
          syncPromises.push(deepStudyCache.saveDeepStudy(firestoreStudy));
        }
      });
      
      // Eliminar estudios que ya no existen en Firestore
      cachedStudies.forEach(cachedStudy => {
        if (!firestoreMap.has(cachedStudy.id)) {
          syncPromises.push(deepStudyCache.removeDeepStudy(cachedStudy.id));
        }
      });
      
      await Promise.all(syncPromises);
    } catch (error) {
      console.error('Error en la sincronización inteligente de estudios profundos:', error);
      throw error;
    }
  },
};