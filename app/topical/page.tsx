"use client"

import { useState } from "react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { TopicalStudy } from "@/lib/firestore"
import { useAuthContext } from "@/context/auth-context"
import { firestoreService } from "@/lib/firestore"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import withAuth from "@/components/auth/with-auth"
import { Timestamp } from "firebase/firestore"
// 🚀 Usar el hook optimizado con cache
import { useTopicalStudies } from "@/hooks/use-firestore"
import { useToast } from "@/hooks/use-toast"

function TopicalStudiesPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [newTopicName, setNewTopicName] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; name: string } | null>(null);

  // 🚀 Usar hook optimizado con cache y mejor manejo de estados
  const { studies: topicalStudies, loading, error, invalidateCache } = useTopicalStudies();

  

  const handleCreateNewTopic = async () => {
    if (!newTopicName.trim()) {
      toast({
        title: "⚠️ Nombre requerido",
        description: "Por favor, ingresa un nombre para el tema.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "❌ Error de autenticación",
        description: "No estás autenticado. Inicia sesión nuevamente.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // 🔄 Mostrar notificación de inicio
    toast({
      title: "🔄 Creando tema...",
      description: `Guardando "${newTopicName}"`,
      duration: 2000,
    });

    const newTopic: Omit<TopicalStudy, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      name: newTopicName,
      entries: [],
    };
    
    // Optimistically create a temporary ID for redirection
    const tempId = Date.now().toString();
    const newStudyForState: TopicalStudy = {
        ...newTopic,
        id: tempId,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    }
    
    setNewTopicName("");

    try {
        console.log("🔍 Intentando guardar tema:", newStudyForState);
        console.log("🔍 Usuario ID:", user.uid);
        console.log("🔍 Usuario completo:", user);
        console.log("🔍 ¿Usuario autenticado?", !!user?.uid);
        
        // 🔧 FIX: Remover userId del objeto antes de enviarlo (la función lo agrega automáticamente)
        const { userId, ...topicDataWithoutUserId } = newStudyForState;
        console.log("🔍 Datos sin userId:", topicDataWithoutUserId);
        console.log("🔍 Datos finales que se enviarán a Firebase:", {
          userId: user.uid,
          ...topicDataWithoutUserId
        });
        
        // 🧪 TEST: Verificar si es operación CREATE o UPDATE
        console.log("🔍 ID del documento:", topicDataWithoutUserId.id);
        console.log("🔍 Esta es una operación CREATE (documento nuevo)");
        
        const savedStudy = await firestoreService.saveTopicalStudy(user.uid, topicDataWithoutUserId);
        
        
        console.log("✅ Tema guardado exitosamente:", savedStudy);
        
        // 🔔 Notificación de éxito
        toast({
          title: "✅ Tema creado",
          description: `"${newTopic.name}" ha sido creado exitosamente.`,
          duration: 3000,
        });
        
        // Replace the temporary object with the real one and redirect
        invalidateCache(); // Invalidate cache to refetch with the new data
        router.push(`/topical/${savedStudy.id}`);
    } catch (error: any) {
        console.error("❌ Error creando tema:", error);
        console.error("❌ Detalles del error:", {
          message: error?.message,
          code: error?.code,
          stack: error?.stack
        });
        
        // 🔔 Notificación de error específica
        toast({
          title: "❌ Error al crear tema",
          description: `No se pudo crear "${newTopic.name}". ${error?.message || 'Error desconocido'}`,
          variant: "destructive",
          duration: 5000,
        });
    }
  };

  const handleDeleteTopic = (topic: TopicalStudy) => {
    setTopicToDelete({ id: topic.id, name: topic.name });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTopic = async () => {
    if (!topicToDelete) return;
    
    try {
        await firestoreService.deleteTopicalStudy(topicToDelete.id);
        invalidateCache(); // Invalidate cache to refetch without the deleted topic
        
        // 🔔 Notificación de éxito
        toast({
          title: "✅ Estudio eliminado",
          description: `"${topicToDelete.name}" ha sido eliminado correctamente.`,
          duration: 3000,
        });
    } catch (error) {
        console.error("Error deleting topic:", error);
        
        // 🔔 Notificación de error
        toast({
          title: "❌ Error al eliminar",
          description: "No se pudo eliminar el estudio temático. Inténtalo de nuevo.",
          variant: "destructive",
          duration: 5000,
        });
    } finally {
        setDeleteDialogOpen(false);
        setTopicToDelete(null);
    }
  };

  const handleStartEditingTopic = (topic: TopicalStudy) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.name);
  };

  const handleUpdateTopicName = async (topicId: string) => {
    if (!editingTopicName.trim() || !user) return;
    
    // const originalStudies = [...topicalStudies]; // This line is removed
    const studyToUpdate = topicalStudies.find(s => s.id === topicId);
    if (!studyToUpdate) return;

    const updatedStudy = { ...studyToUpdate, name: editingTopicName, updatedAt: Timestamp.now() };

    // Optimistic update
    // setTopicalStudies(prev => prev.map(s => s.id === topicId ? updatedStudy : s)); // This line is removed
    setEditingTopicId(null);
    setEditingTopicName("");

    try {
        const { userId, ...studyData } = updatedStudy;
        await firestoreService.saveTopicalStudy(user.uid, studyData);
        invalidateCache(); // Invalidate cache to refetch with the updated data
    } catch(error) {
        console.error("Error updating topic name:", error);
        // setTopicalStudies(originalStudies); // Rollback // This line is removed
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]"><LoadingSpinner size="lg"/></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-center sm:justify-between">
            <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                <Link href="/home">
                <Button
                    variant="outline"
                    className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm w-full sm:w-auto justify-start"
                >
                    <Home className="h-4 " />
                </Button>
                </Link>
                <h1 className="text-2xl font-bold w-full sm:w-auto ml-5 mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Estudio por Temas</h1>
            </div>
            <div className="w-40 hidden sm:block"></div>
        </div>
        
        {/* Contenido */}
        <div className="space-y-6">
            <GradientCard gradient="blue">
            <CardHeader>
                <CardTitle>Crear Nuevo Tema de Estudio</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateNewTopic()}
                placeholder="Ej: Fe, Amor, Salvación..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white flex-1"
                />
                <Button onClick={handleCreateNewTopic} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="h-4 w-4 mr-2"/>
                Crear Tema
                </Button>
            </CardContent>
            </GradientCard>

            <h2 className="text-2xl font-bold text-white pt-8">Temas Existentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicalStudies.map(topic => (
                <GradientCard key={topic.id} className="group flex flex-col justify-between" gradient="blue">
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
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTopic(topic)} className="w-full justify-center gap-2 text-red-400 hover:text-red-300">
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

      {/* ⚠️ Dialog de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar estudio temático?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción no se puede deshacer. Se eliminará permanentemente el estudio 
              <strong className="text-white"> "{topicToDelete?.name}"</strong> y todos sus contenidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteTopic}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withAuth(TopicalStudiesPage); 