import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { enhancedIndexedDBCache } from "../cache/indexdDB-avanzado";
import type { DeepStudy } from "../interfaces/deep-study";

const DEEP_STUDIES_COLLECTION = "estudios_profundos";

export class DeepStudyService {
  // Guardar o actualizar un estudio profundo
  async saveDeepStudy(userId: string, study: Omit<DeepStudy, "createdAt" | "updatedAt" | "userId">) {
    const docRef = doc(db, DEEP_STUDIES_COLLECTION, study.id);
    const now = Timestamp.now();

    // Verificar si existe en cache
    const existingDoc = await enhancedIndexedDBCache.getDeepStudy(study.id);

    const data: DeepStudy = {
      ...study,
      userId,
      updatedAt: now,
      createdAt: existingDoc?.createdAt || now,
    };
    
    // Guardar en Firestore
    await setDoc(docRef, data, { merge: true });
    
    // Actualizar cache
    await enhancedIndexedDBCache.saveDeepStudy(data);
    
    return data;
  }

  // Obtener todos los estudios profundos de un usuario
  async getDeepStudies(userId: string): Promise<DeepStudy[]> {
    const q = query(
      collection(db, DEEP_STUDIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("orderIndex", "asc"),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as DeepStudy);
  }

  // Obtener un estudio profundo específico
  async getDeepStudyById(userId: string, id: string): Promise<DeepStudy | null> {
    const docRef = doc(db, DEEP_STUDIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as DeepStudy;
  }

  // Eliminar un estudio profundo
  async deleteDeepStudy(id: string) {
    await deleteDoc(doc(db, DEEP_STUDIES_COLLECTION, id));
    // Eliminar también del cache
    await enhancedIndexedDBCache.removeDeepStudy(id);
  }

  // Sincronización inteligente de estudios profundos
  async smartSyncDeepStudies(userId: string) {
    const cachedStudies = await enhancedIndexedDBCache.getDeepStudiesByUser(userId);
    
    const q = query(
      collection(db, DEEP_STUDIES_COLLECTION),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const firestoreStudies = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }) as DeepStudy);
    
    // Identificar estudios que necesitan actualización
    const cachedMap = new Map(cachedStudies.map(study => [study.id, study]));
    const newOrUpdated: DeepStudy[] = [];
    
    for (const firestoreStudy of firestoreStudies) {
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
    
    // Actualizar cache con los estudios nuevos o modificados
    for (const study of newOrUpdated) {
      await enhancedIndexedDBCache.saveDeepStudy(study);
    }
    
    return {
      syncedCount: newOrUpdated.length,
      totalCount: firestoreStudies.length,
      data: firestoreStudies
    };
  }
}

export const deepStudyService = new DeepStudyService();