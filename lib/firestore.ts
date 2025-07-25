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
} from "firebase/firestore"
import { db } from "./firebase"

export interface StudyEntry {
  id: string;
  reference: string;
  learning: string;
  versionTexto?: string;
}

export interface TopicalStudy {
  id: string;
  name: string;
  entries: StudyEntry[];
}

export interface Versiculo {
  id: string
  referencia: string
  texto: string
  aprendizaje: string
  versionTexto?: string
}

export interface Referencia {
  id: string
  url: string
  descripcion: string
  versiculoId?: string
}

export interface Devocional {
  id: string
  fecha: string
  citaBiblica: string
  textoDevocional: string
  aprendizajeGeneral: string
  versiculos: Versiculo[]
  referencias: Referencia[]
  tags?: string[]
  completado: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  versionCitaBiblica?: string
}

const DEVOCIONALES_COLLECTION = "devocionarios"
const TOPICS_COLLECTION = "topical_studies"


export const firestoreService = {
  // --- DEVOCIONALES ---
  async saveDevocional(devocional: Omit<Devocional, "createdAt" | "updatedAt">) {
    const docRef = doc(db, DEVOCIONALES_COLLECTION, devocional.id)
    const now = Timestamp.now()

    const docSnap = await getDoc(docRef)
    const data = {
      ...devocional,
      updatedAt: now,
      ...(docSnap.exists() ? {} : { createdAt: now }),
    }

    await setDoc(docRef, data, { merge: true })
    return data
  },

  async getDevocionarios(): Promise<Devocional[]> {
    const q = query(collection(db, DEVOCIONALES_COLLECTION), orderBy("fecha", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Devocional,
    )
  },

  async getDevocionalByDate(fecha: string): Promise<Devocional | null> {
    const q = query(collection(db, DEVOCIONALES_COLLECTION), where("fecha", "==", fecha))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Devocional
  },

  async deleteDevocional(id: string) {
    await deleteDoc(doc(db, DEVOCIONALES_COLLECTION, id))
  },

  // --- ESTUDIOS POR TEMAS ---
  async saveTopicalStudy(topic: TopicalStudy) {
    const docRef = doc(db, TOPICS_COLLECTION, topic.id);
    await setDoc(docRef, topic, { merge: true });
    return topic;
  },

  async getTopicalStudies(): Promise<TopicalStudy[]> {
    const q = query(collection(db, TOPICS_COLLECTION), orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as TopicalStudy);
  },

  async deleteTopicalStudy(id: string) {
    await deleteDoc(doc(db, TOPICS_COLLECTION, id));
  },
}
