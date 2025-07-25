"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Library,
  Plus,
  Pencil,
  Check,
  Trash2,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GradientCard } from "@/components/ui/gradient-card"
import type { TopicalStudy } from "@/lib/firestore"

// Datos de ejemplo
const getSampleTopicalStudies = (): TopicalStudy[] => [
    { id: '1', name: 'Fe', entries: [{ id: 'e1', reference: 'Hebreos 11:1', learning: 'La fe es la certeza...', versionTexto: 'rv1960' }] },
    { id: '2', name: 'Amor', entries: [] },
    { id: '3', name: 'Salvación', entries: [] },
];

export default function TopicalStudiesPage() {
  const router = useRouter();
  const [topicalStudies, setTopicalStudies] = useState<TopicalStudy[]>([]);
  const [newTopicName, setNewTopicName] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");

  useEffect(() => {
    // Cargar datos de ejemplo
    setTopicalStudies(getSampleTopicalStudies());
  }, []);

  const handleCreateNewTopic = () => {
    if (!newTopicName.trim()) return;
    const newTopic: TopicalStudy = {
      id: Date.now().toString(),
      name: newTopicName,
      entries: [],
    };
    setTopicalStudies([...topicalStudies, newTopic]);
    setNewTopicName("");
    router.push(`/topical/${newTopic.id}`); // Navegar al nuevo tema
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopicalStudies(topicalStudies.filter(topic => topic.id !== topicId));
  };

  const handleStartEditingTopic = (topic: TopicalStudy) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.name);
  };

  const handleUpdateTopicName = (topicId: string) => {
    if (!editingTopicName.trim()) return;
    setTopicalStudies(topicalStudies.map(topic =>
      topic.id === topicId ? { ...topic, name: editingTopicName } : topic
    ));
    setEditingTopicId(null);
    setEditingTopicName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <Link href="/">
                <Button
                variant="outline"
                className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm w-full sm:w-auto"
                >
                <Home className="h-4 w-4 mr-2"/>
                <span>Volver al Inicio</span>
                </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white text-center">Estudio por Temas</h1>
            <div className="w-40"></div>
        </div>
        
        {/* Contenido */}
        <div className="space-y-6">
            <GradientCard gradient="green">
            <CardHeader>
                <CardTitle>Crear Nuevo Tema de Estudio</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="Ej: Fe, Amor, Salvación..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white flex-1"
                />
                <Button onClick={handleCreateNewTopic} className="bg-gradient-to-r from-green-600 to-cyan-600">
                <Plus className="h-4 w-4 mr-2"/>
                Crear Tema
                </Button>
            </CardContent>
            </GradientCard>

            <h2 className="text-2xl font-bold text-white pt-8">Temas Existentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicalStudies.map(topic => (
                <GradientCard key={topic.id} className="group flex flex-col justify-between">
                    <Link href={`/topical/${topic.id}`} className="block h-full">
                        <CardContent className="p-6 cursor-pointer flex-1">
                            {editingTopicId === topic.id ? (
                            <div className="flex gap-2">
                                <Input
                                value={editingTopicName}
                                onChange={(e) => setEditingTopicName(e.target.value)}
                                onBlur={() => handleUpdateTopicName(topic.id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTopicName(topic.id)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()} // Evitar que el Link se active
                                className="bg-[#2a2a2a]/80"
                                />
                                <Button size="icon" onClick={(e) => {e.stopPropagation(); handleUpdateTopicName(topic.id)}}><Check className="h-4 w-4"/></Button>
                            </div>
                            ) : (
                            <h3 className="text-xl font-semibold text-white">{topic.name}</h3>
                            )}
                            <p className="text-gray-400 mt-2">{topic.entries.length} {topic.entries.length === 1 ? 'entrada' : 'entradas'}</p>
                        </CardContent>
                    </Link>
                    <CardHeader className="p-2 border-t border-gray-700/50 flex-row justify-around">
                    <Button variant="ghost" size="sm" onClick={() => handleStartEditingTopic(topic)} className="w-full justify-center gap-2 text-gray-400 hover:text-white">
                        <Pencil className="h-3 w-3" />
                        Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTopic(topic.id)} className="w-full justify-center gap-2 text-red-400 hover:text-red-300">
                        <Trash2 className="h-3 w-3" />
                        Eliminar
                    </Button>
                    </CardHeader>
                </GradientCard>
            ))}
            </div>
            {topicalStudies.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                <p>No hay temas de estudio aún. ¡Crea el primero!</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
} 