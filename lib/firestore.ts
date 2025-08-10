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
import { db } from "./firebase";

// --- Sub-colecciones y tipos anidados ---

export interface Versiculo {
  id: string; // ID único para el versículo dentro del devocional
  referencia: string; // Ej: "Juan 3:16"
  texto?: string; // El texto se obtiene de la API, se usa en el estado local pero no se guarda necesariamente
  aprendizaje: string; // Notas personales sobre este versículo
  versionTexto?: string; // Ej: "rv1960"
}

export interface Referencia {
  id: string; // ID único para la referencia
  url: string; // Enlace a un recurso externo
  descripcion: string; // Breve descripción del enlace
  versiculoId?: string; // Opcional, si está ligado a un versículo específico
}

export interface StudyEntry {
  id: string; // ID único para la entrada
  referencia: string; // Cita bíblica, ej: "Romanos 12:1-2"
  learning: string; // Lo que aprendiste de esta cita
  versionTexto?: string; // Versión de la biblia usada
}

// --- Colecciones Principales ---

export interface Devocional {
  id: string; // ID único del documento (ej: YYYY-MM-DD)
  userId: string; // ID del usuario al que pertenece este devocional
  fecha: string; // Formato YYYY-MM-DD para facilitar queries
  citaBiblica: string; // Cita principal del devocional
  versionCitaBiblica?: string;
  textoDevocional: string; // El cuerpo principal de la reflexión
  aprendizajeGeneral: string; // Conclusión o aplicación principal
  versiculos: Versiculo[]; // Array de versículos específicos analizados
  referencias: Referencia[]; // Array de enlaces o recursos externos
  tags?: string[]; // Etiquetas para búsqueda
  completado: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TopicalStudy {
  id: string; // ID único del estudio
  userId: string; // ID del usuario al que pertenece
  name: string; // Nombre del tema (ej: "El Perdón", "La Fe")
  entries: StudyEntry[]; // Array de citas y aprendizajes sobre el tema
  createdAt: Timestamp;
  updatedAt: Timestamp;
  orderIndex: number
}

const DEVOCIONALES_COLLECTION = "devocionales";
const TOPICS_COLLECTION = "estudios_topicos";

export const firestoreService = {

  async   getDevocionarios(userId: string): Promise<Devocional[]> {
    const q = query(
      collection(db, DEVOCIONALES_COLLECTION),
      where("userId", "==", userId),
      orderBy("fecha", "desc"), // ✅ Restaurado - ahora con índice compuesto
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Devocional);
  },

  async getDevocionalByDate(key: string): Promise<Devocional | null> {
    const q = query(
      collection(db, DEVOCIONALES_COLLECTION),
      where("id", "==", key),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    console.log('Este es el doc: ', doc)
    return { id: doc.id, ...doc.data() } as Devocional;
  },

  async deleteDevocional(id: string) {
    await deleteDoc(doc(db, DEVOCIONALES_COLLECTION, id));
  },

  // --- ESTUDIOS POR TEMAS ---
  async saveTopicalStudy(userId: string, topic: Omit<TopicalStudy, "createdAt" | "updatedAt" | "userId">) {
    const docRef = doc(db, TOPICS_COLLECTION, topic.id);
    const now = Timestamp.now();

    const docSnap = await getDoc(docRef);
    const data: TopicalStudy = {
      ...topic,
      userId,
      updatedAt: now,
      createdAt: docSnap.exists() ? docSnap.data().createdAt : now,
    };
    
    await setDoc(docRef, data, { merge: true });
    return data;
  },

  async getTopicalStudies(userId: string): Promise<TopicalStudy[]> {
    const q = query(
      collection(db, TOPICS_COLLECTION),
      where("userId", "==", userId),
      orderBy("name", "asc"), // ✅ Restaurado - ahora con índice compuesto
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TopicalStudy);
  },

  async getTopicalStudyById(userId: string, id: string): Promise<TopicalStudy | null> {
    const docRef = doc(db, TOPICS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || docSnap.data().userId !== userId) {
      return null;
    }

    return { id: docSnap.id, ...docSnap.data() } as TopicalStudy;
  },

  async deleteTopicalStudy(id: string) {
    await deleteDoc(doc(db, TOPICS_COLLECTION, id));
  },
};