"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GradientCard } from "@/components/ui/gradient-card";
import {
  Search,
  Plus,
  Folder,
  BookOpen,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Check,
  FolderOpen,
} from "lucide-react";
import { useStudyTopics } from "@/hooks/use-study-topics";
import { StudyTopic } from "@/types/study-topics";
import { toast } from "@/components/ui/use-toast";
import withAuth from "@/components/auth/with-auth";
import { StudyTemplates } from "@/app/topical/components/study-templates";
import { useAuthContext } from "@/context/auth-context";
import { QuickPreview } from "../topical/components/quick-preview";

interface TopicToDelete {
  id: string;
  name: string;
}

function StudyTopicsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    topics,
    loading,
    createTopic,
    deleteTopic,
    refreshTopics,
    refreshingEntries,
  } = useStudyTopics();

  const [searchTerm, setSearchTerm] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<TopicToDelete | null>(
    null
  );

  // Filtrar temas por búsqueda
  const filteredTopics = useMemo(() => {
    if (!searchTerm.trim()) return topics;

    const term = searchTerm.toLowerCase();
    return topics.filter(
      (topic) =>
        topic.name.toLowerCase().includes(term) ||
        topic.description?.toLowerCase().includes(term) ||
        topic.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [topics, searchTerm]);

  const handleCreateNewTopic = async () => {
    if (!newTopicName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para el tema",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTopic: Omit<StudyTopic, "id" | "createdAt" | "updatedAt"> = {
        name: newTopicName.trim(),
        description: "",
        bibleReferences: [],
        webLinks: [],
        subtopics: [],
        tags: [],
        completed: false,
        userId: user?.uid || "",
      };

      const savedTopic = await createTopic(newTopic);

      toast({
        title: "Tema creado",
        description: `"${newTopic.name}" listo para usar.`,
      });

      setNewTopicName("");
      router.push(`/study-topics/${savedTopic.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el tema",
        variant: "destructive",
      });
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    try {
      const newTopic: Omit<StudyTopic, "id" | "createdAt" | "updatedAt"> = {
        name: template.name,
        description: template.description,
        bibleReferences:
          template.entries?.map((entry: any) => entry.referencia) || [],
        webLinks: [],
        subtopics:
          template.entries?.map((entry: any, index: number) => ({
            id: `sub-${Date.now()}-${index}`,
            title: entry.learning || `Versículo ${index + 1}`,
            bibleReferences: [entry.referencia],
            content: "",
            completed: false,
          })) || [],
        tags: [template.category.toLowerCase()],
        completed: false,
        userId: user?.uid || "",
      };

      const savedTopic = await createTopic(newTopic);

      toast({
        title: "Plantilla aplicada",
        description: `"${newTopic.name}" creado desde plantilla.`,
      });

      router.push(`/study-topics/${savedTopic.id}`);
    } catch (error) {
      console.error("Error creating from template:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el tema desde la plantilla",
        variant: "destructive",
      });
    }
  };

  const handleEditTopic = (topicId: string) => {
    router.push(`/study-topics/${topicId}`);
  };

  const handleDeleteTopic = async () => {
    if (!topicToDelete) return;

    try {
      await deleteTopic(topicToDelete.id);

      toast({
        title: "Tema eliminado",
        description: `"${topicToDelete.name}" ha sido eliminado.`,
      });

      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tema",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-white">Temas de Estudio</span>
          </div>
        </div>

        {/* Controles superiores */}
        <div className="mb-6 space-y-4">
          {/* Búsqueda y filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar temas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <div className="flex gap-2">
              <StudyTemplates onSelectTemplate={handleCreateFromTemplate} />
            </div>
          </div>

          {/* Crear nuevo tema */}
          <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Nombre del nuevo tema de estudio..."
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateNewTopic()}
                className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
              />
              <Button
                onClick={handleCreateNewTopic}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Tema
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de temas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => {
            const cardClasses = [
              "group",
              "relative",
              "overflow-hidden",
              "transition-all",
              "duration-300",
              "hover:scale-[1.02]",
              refreshingEntries.has(topic.id) ? "animate-pulse" : "",
            ].join(" ");

            return (
              <GradientCard key={topic.id} className={cardClasses}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {topic.name}
                      </h3>
                      {topic.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {topic.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 ml-3">
                      <QuickPreview topic={topic} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400 focus:outline-none focus:ring-0"
                        onClick={() => {
                          setTopicToDelete({ id: topic.id, name: topic.name });
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Contadores */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Folder className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">
                          {topic.subtopics.length} subtemas
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">
                          {topic.bibleReferences.length} referencias
                        </span>
                      </div>
                      {topic.webLinks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <LinkIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-300">
                            {topic.webLinks.length} enlaces
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {topic.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {topic.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{topic.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Estado */}
                    {topic.completed && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        <Check className="h-3 w-3 mr-1" />
                        Completado
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <Link href={`/study-topics/${topic.id}`} className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Pencil className="h-4 w-4 mr-2" />
                        Estudiar
                      </Button>
                    </Link>
                  </div>
                </div>
              </GradientCard>
            );
          })}
        </div>

        {/* Estado vacío */}
        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              {searchTerm
                ? "No se encontraron temas"
                : "No hay temas de estudio aún"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primer tema de estudio para comenzar"}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => {
                  setNewTopicName("Nuevo tema");
                  setTimeout(() => {
                    const input = document.querySelector(
                      'input[placeholder*="Nombre del nuevo tema"]'
                    ) as HTMLInputElement;
                    input?.focus();
                  }, 100);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Tema
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              ¿Eliminar tema?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esto eliminará permanentemente "{topicToDelete?.name}" y todo su
              contenido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTopic}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withAuth(StudyTopicsPage);
