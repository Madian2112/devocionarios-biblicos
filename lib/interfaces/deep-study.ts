import { Timestamp } from "firebase/firestore";

export interface WebReference {
  id: string;
  url: string;
  description: string;
  subPointId?: string; // ID del subpunto al que está asociada la referencia (opcional)
}

export interface BiblicalReference {
  id: string;
  reference: string; // Ej: "Juan 3:16"
  version?: string; // Ej: "rv1960"
  notes: string; // Notas o aprendizajes sobre esta referencia
  subPointId?: string; // ID del subpunto al que está asociada la referencia (opcional)
}

export interface StudySubPoint {
  id: string;
  title: string; // Título del subpunto o subtema
  content: string; // Contenido o notas del subpunto
  orderIndex: number; // Para mantener el orden de los subpuntos
  biblicalReferences: BiblicalReference[];
  webReferences: WebReference[];
}

export interface DeepStudy {
  id: string;
  userId: string;
  title: string; // Nombre o título del tema de estudio
  description: string; // Descripción general del tema
  subPoints: StudySubPoint[]; // Array de subpuntos o subtemas
  tags?: string[]; // Etiquetas para categorización y búsqueda
  createdAt: Timestamp;
  updatedAt: Timestamp;
  orderIndex: number; // Para ordenar los estudios en la lista
}