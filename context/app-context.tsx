"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Devocional, TopicalStudy, Versiculo, Referencia, StudyEntry } from '@/lib/firestore';
import { firestoreService } from '@/lib/firestore'; // Suponiendo que el servicio existe

interface AppState {
  devocionarios: Devocional[];
  topicalStudies: TopicalStudy[];
  loading: boolean;
  saving: boolean;
  // Añade más estados globales si es necesario
}

interface AppContextProps extends AppState {
  // Funciones para manipular el estado
  loadDevocionarios: () => Promise<void>;
  saveDevocional: (devocional: Devocional) => Promise<void>;
  createNewDevocional: (selectedDate: string) => Devocional;
  addVersiculo: (devocional: Devocional) => Devocional;
  removeVersiculo: (devocional: Devocional, id: string) => Devocional;
  addReferencia: (devocional: Devocional) => Devocional;
  removeReferencia: (devocional: Devocional, id: string) => Devocional;
  
  // Funciones para Estudio por Temas
  handleCreateNewTopic: (name: string) => Promise<TopicalStudy | null>;
  handleAddStudyEntry: (topicId: string) => void;
  handleUpdateStudyEntry: (topicId: string, updatedEntry: StudyEntry) => void;
  handleRemoveStudyEntry: (topicId: string, entryId: string) => void;
  handleDeleteTopic: (topicId: string) => void;
  handleUpdateTopicName: (topicId: string, newName: string) => void;

  setDevocionarios: React.Dispatch<React.SetStateAction<Devocional[]>>;
  setTopicalStudies: React.Dispatch<React.SetStateAction<TopicalStudy[]>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    devocionarios: [],
    topicalStudies: [],
    loading: true,
    saving: false,
  });

  const loadAllData = async () => {
    setState(s => ({ ...s, loading: true }));
    try {
      const [devos, topics] = await Promise.all([
        firestoreService.getDevocionarios(),
        firestoreService.getTopicalStudies(),
      ]);
      setState(s => ({ ...s, devocionarios: devos, topicalStudies: topics, loading: false }));
    } catch (error) {
      console.error("Error loading data:", error);
      setState(s => ({ ...s, loading: false }));
    }
  };

  const saveDevocional = async (devocional: Devocional) => {
    setState(s => ({ ...s, saving: true }));
    try {
      await firestoreService.saveDevocional(devocional);
      // Actualizamos el estado local para reflejar el cambio inmediatamente
      const devos = await firestoreService.getDevocionarios();
      setState(s => ({ ...s, devocionarios: devos, saving: false }));
    } catch (error) {
      console.error("Error saving devocional:", error);
      setState(s => ({ ...s, saving: false }));
    }
  };

  const createNewDevocional = (selectedDate: string): Devocional => {
    return {
      id: Date.now().toString(),
      fecha: selectedDate,
      citaBiblica: "",
      textoDevocional: "",
      aprendizajeGeneral: "",
      versiculos: [],
      referencias: [],
      tags: [],
      completado: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      versionCitaBiblica: "rv1960",
    };
  };

  const addVersiculo = (devocional: Devocional): Devocional => {
    const newVersiculo: Versiculo = {
      id: Date.now().toString(),
      referencia: "",
      texto: "",
      aprendizaje: "",
      versionTexto: "rv1960",
    };
    return { ...devocional, versiculos: [...devocional.versiculos, newVersiculo] };
  };

  const removeVersiculo = (devocional: Devocional, id: string): Devocional => {
    return { ...devocional, versiculos: devocional.versiculos.filter(v => v.id !== id) };
  };

  const addReferencia = (devocional: Devocional): Devocional => {
    const newReferencia: Referencia = { id: Date.now().toString(), url: "", descripcion: "" };
    return { ...devocional, referencias: [...devocional.referencias, newReferencia] };
  };

  const removeReferencia = (devocional: Devocional, id: string): Devocional => {
    return { ...devocional, referencias: devocional.referencias.filter(r => r.id !== id) };
  };
  
  const handleCreateNewTopic = async (name: string): Promise<TopicalStudy | null> => {
    if (!name.trim()) return null;
    setState(s => ({ ...s, saving: true }));
    const newTopic: TopicalStudy = {
      id: Date.now().toString(),
      name,
      entries: [],
    };
    try {
      await firestoreService.saveTopicalStudy(newTopic);
      setState(s => ({ ...s, topicalStudies: [...s.topicalStudies, newTopic], saving: false }));
      return newTopic;
    } catch (error) {
      console.error("Error creating topic:", error);
      setState(s => ({ ...s, saving: false }));
      return null;
    }
  };
  
  const handleUpdateTopic = async (topic: TopicalStudy) => {
    setState(s => ({ ...s, saving: true }));
    try {
      await firestoreService.saveTopicalStudy(topic);
      setState(s => ({
        ...s,
        topicalStudies: s.topicalStudies.map(t => t.id === topic.id ? topic : t),
        saving: false
      }));
    } catch (error) {
      console.error("Error updating topic:", error);
      setState(s => ({ ...s, saving: false }));
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    setState(s => ({ ...s, saving: true }));
    try {
      await firestoreService.deleteTopicalStudy(topicId);
      setState(s => ({ ...s, topicalStudies: s.topicalStudies.filter(t => t.id !== topicId), saving: false }));
    } catch (error) {
      console.error("Error deleting topic:", error);
      setState(s => ({ ...s, saving: false }));
    }
  };

  // Las funciones de manipulación de 'entries' ahora necesitarán llamar a handleUpdateTopic
  const handleAddStudyEntry = (topicId: string) => {
    const topic = state.topicalStudies.find(t => t.id === topicId);
    if (!topic) return;
    const newEntry: StudyEntry = { id: Date.now().toString(), reference: "", learning: "", versionTexto: "rv1960" };
    const updatedTopic = { ...topic, entries: [...topic.entries, newEntry] };
    handleUpdateTopic(updatedTopic);
  };

  const handleUpdateStudyEntry = (topicId: string, updatedEntry: StudyEntry) => {
    const topic = state.topicalStudies.find(t => t.id === topicId);
    if (!topic) return;
    const updatedTopic = { ...topic, entries: topic.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e) };
    handleUpdateTopic(updatedTopic);
  };

  const handleRemoveStudyEntry = (topicId: string, entryId: string) => {
    const topic = state.topicalStudies.find(t => t.id === topicId);
    if (!topic) return;
    const updatedTopic = { ...topic, entries: topic.entries.filter(e => e.id !== entryId) };
    handleUpdateTopic(updatedTopic);
  };
  
  const handleUpdateTopicName = (topicId: string, newName: string) => {
     if (!newName.trim()) return;
     const topic = state.topicalStudies.find(t => t.id === topicId);
     if (!topic) return;
     const updatedTopic = { ...topic, name: newName };
     handleUpdateTopic(updatedTopic);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const contextValue = {
    ...state,
    loadDevocionarios: loadAllData,
    saveDevocional,
    createNewDevocional,
    addVersiculo,
    removeVersiculo,
    addReferencia,
    removeReferencia,
    handleCreateNewTopic,
    handleAddStudyEntry,
    handleUpdateStudyEntry,
    handleRemoveStudyEntry,
    handleDeleteTopic,
    handleUpdateTopicName,
    setDevocionarios: (value: React.SetStateAction<Devocional[]>) => setState(s => ({ ...s, devocionarios: typeof value === 'function' ? value(s.devocionarios) : value })),
    setTopicalStudies: (value: React.SetStateAction<TopicalStudy[]>) => setState(s => ({ ...s, topicalStudies: typeof value === 'function' ? value(s.topicalStudies) : value })),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 