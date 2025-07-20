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

export interface Versiculo {
  id: string
  referencia: string
  texto: string
  aprendizaje: string
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
  completado: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

const COLLECTION_NAME = "devocionarios"

export const firestoreService = {
  // Crear o actualizar devocional
  async saveDevocional(devocional: Omit<Devocional, "createdAt" | "updatedAt">) {
    const docRef = doc(db, COLLECTION_NAME, devocional.id)
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

  // Obtener todos los devocionarios
  async getDevocionarios(): Promise<Devocional[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy("fecha", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Devocional,
    )
  },

  // Obtener devocional por fecha
  async getDevocionalByDate(fecha: string): Promise<Devocional | null> {
    const q = query(collection(db, COLLECTION_NAME), where("fecha", "==", fecha))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return null

    const doc = querySnapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Devocional
  },

  // Eliminar devocional
  async deleteDevocional(id: string) {
    await deleteDoc(doc(db, COLLECTION_NAME, id))
  },
}
