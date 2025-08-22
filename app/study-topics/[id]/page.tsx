"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Timestamp } from "firebase/firestore";
import { use } from "react";

import { GradientCard } from "@/components/ui/gradient-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
  BookOpen,
  Link,
  Tag,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useAuthContext } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useStudyTopics } from "@/hooks/use-study-topics";
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom";
import { StudyTopic, Subtopic, WebLink } from "@/lib/firestore";
import { smartSyncFirestoreService } from "@/lib/services/sincronizacion-inteligente-firestore";

interface StudyTopicDetailPageProps {
  params: { id: string };
}

function SubtopicItem({
  subtopic,
  onUpdate,
  onRemove,
  isOrderingMode,
}: {
  subtopic: Subtopic;
  onUpdate: (updated: Subtopic) => void;
  onRemove: (id: string) => void;
  isOrderingMode: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <GradientCard className="mb-3">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {isOrderingMode && (
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              )}
              <h4 className="font-medium">
                {subtopic.title || "Subtema sin nombre"}
              </h4>
              {subtopic.completed && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700"
                >
                  Completado
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {subtopic.bibleReferences?.length || 0} refs
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {subtopic.webLinks?.length || 0} links
              </Badge>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <div>
              <Label htmlFor={`subtopic-title-${subtopic.id}`}>
                Título del subtema
              </Label>
              <Input
                id={`subtopic-title-${subtopic.id}`}
                value={subtopic.title}
                onChange={(e) =>
                  onUpdate({ ...subtopic, title: e.target.value })
                }
                placeholder="Título del subtema"
              />
            </div>

            <div>
              <Label htmlFor={`subtopic-content-${subtopic.id}`}>
                Contenido
              </Label>
              <Textarea
                id={`subtopic-content-${subtopic.id}`}
                value={subtopic.content || ""}
                onChange={(e) =>
                  onUpdate({ ...subtopic, content: e.target.value })
                }
                placeholder="Contenido del subtema..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`subtopic-completed-${subtopic.id}`}
                checked={subtopic.completed}
                onCheckedChange={(checked) =>
                  onUpdate({ ...subtopic, completed: !!checked })
                }
              />
              <Label htmlFor={`subtopic-completed-${subtopic.id}`}>
                Marcar como completado
              </Label>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(subtopic.id)}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar subtema
            </Button>
          </div>
        </CollapsibleContent>
      </GradientCard>
    </Collapsible>
  );
}

export default function StudyTopicDetailPage({
  params,
}: StudyTopicDetailPageProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { id } = use(params);
  const isNew = id === "new";

  const [studyTopic, setStudyTopic] = useState<StudyTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChangesRef = useRef(false);
  const [deleteSubtopicDialogOpen, setDeleteSubtopicDialogOpen] =
    useState(false);
  const [subtopicToDelete, setSubtopicToDelete] = useState<string | null>(null);
  const [isOrderingMode, setIsOrderingMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("subtopics");

  const { saveStudyTopic } = useStudyTopics();

  useDisableMobileZoom();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchOrCreateStudyTopic() {
      if (!user) return;
      setLoading(true);

      if (isNew) {
        setStudyTopic({
          id: Date.now().toString(),
          userId: user.uid,
          name: "",
          description: "",
          bibleReferences: [],
          webLinks: [],
          subtopics: [],
          tags: [],
          completed: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          order: 0,
        });
      } else {
        const fetchedTopic = await smartSyncFirestoreService.getStudyTopicById(
          user.uid,
          id
        );
        setStudyTopic(fetchedTopic);
      }
      setLoading(false);
    }
    fetchOrCreateStudyTopic();
  }, [id, user, isNew]);

  useEffect(() => {
    return () => {
      if (hasChangesRef.current) {
        sessionStorage.setItem("study-topic-return-flag", "true");
      }
    };
  }, []);

  const handleStudyTopicChange = (field: keyof StudyTopic, value: any) => {
    setStudyTopic((prev) =>
      prev ? { ...prev, [field]: value, updatedAt: Timestamp.now() } : null
    );
    hasChangesRef.current = true;
    triggerAutoSave();
  };

  const handleAddSubtopic = () => {
    if (!studyTopic) return;

    const newSubtopic: Subtopic = {
      id: Date.now().toString(),
      title: "Nuevo subtema",
      content: "",
      bibleReferences: [],
      webLinks: [],
      completed: false,
      order: studyTopic.subtopics.length,
    };
    handleStudyTopicChange("subtopics", [...studyTopic.subtopics, newSubtopic]);
    hasChangesRef.current = true;
  };

  const handleUpdateSubtopic = (updatedSubtopic: Subtopic) => {
    if (!studyTopic) return;

    handleStudyTopicChange(
      "subtopics",
      studyTopic.subtopics.map((s) =>
        s.id === updatedSubtopic.id ? updatedSubtopic : s
      )
    );
    hasChangesRef.current = true;
  };

  const handleRemoveSubtopic = (subtopicId: string) => {
    if (!studyTopic) return;

    setSubtopicToDelete(subtopicId);
    setDeleteSubtopicDialogOpen(true);
  };

  const confirmDeleteSubtopic = () => {
    if (!studyTopic || !subtopicToDelete) return;

    handleStudyTopicChange(
      "subtopics",
      studyTopic.subtopics.filter((s) => s.id !== subtopicToDelete)
    );
    hasChangesRef.current = true;

    toast({
      title: "✅ Subtema eliminado",
      description: "El subtema ha sido eliminado exitosamente",
      duration: 3000,
    });

    setDeleteSubtopicDialogOpen(false);
    setSubtopicToDelete(null);
  };

  const handleMoveSubtopic = (subtopicId: string, direction: "up" | "down") => {
    if (!studyTopic) return;

    const currentIndex = studyTopic.subtopics.findIndex(
      (subtopic) => subtopic.id === subtopicId
    );
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    if (direction === "up") {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (direction === "down") {
      newIndex = Math.min(studyTopic.subtopics.length - 1, currentIndex + 1);
    }

    if (newIndex === currentIndex) return;

    const newSubtopics = [...studyTopic.subtopics];
    const [movedSubtopic] = newSubtopics.splice(currentIndex, 1);
    newSubtopics.splice(newIndex, 0, movedSubtopic);

    handleStudyTopicChange("subtopics", newSubtopics);
    toast({
      title: "✅ Orden actualizado",
      description: "Los subtemas han sido reordenados",
      duration: 2000,
    });
  };

  const handleToggleOrderingMode = () => {
    setIsOrderingMode((prev) => {
      const newState = !prev;
      if (!newState) {
        autoSave();
      }
      return newState;
    });
  };

  const autoSave = useCallback(async () => {
    if (!studyTopic || !user || !hasChangesRef.current || saving) return;

    try {
      setSaving(true);
      const { userId, ...studyData } = studyTopic;
      await saveStudyTopic(studyData);

      hasChangesRef.current = false;

      toast({
        title: "💾 Guardado automático",
        description: "Tus cambios se guardaron automáticamente",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("❌ Error en auto-guardado:", error);
    } finally {
      setSaving(false);
    }
  }, [studyTopic, user, saving, toast, saveStudyTopic]);

  const triggerAutoSave = useCallback(() => {
    hasChangesRef.current = true;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 3000);
  }, [autoSave]);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!studyTopic) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">
            Tema de estudio no encontrado
          </h2>
          <Button onClick={() => router.push("/study-topics")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a temas de estudio
          </Button>
        </div>
      </div>
    );
  }

  const progress =
    studyTopic.subtopics.length > 0
      ? (studyTopic.subtopics.filter((s) => s.completed).length /
          studyTopic.subtopics.length) *
        100
      : 0;

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/study-topics")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex items-center gap-2">
          {saving && (
            <Badge variant="secondary" className="text-xs">
              <Save className="h-3 w-3 mr-1 animate-spin" />
              Guardando...
            </Badge>
          )}
          <Button
            variant={isOrderingMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleOrderingMode}
          >
            <GripVertical className="h-4 w-4 mr-2" />
            {isOrderingMode ? "Guardar orden" : "Ordenar subtemas"}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            <Input
              value={studyTopic.name}
              onChange={(e) => handleStudyTopicChange("name", e.target.value)}
              placeholder="Nombre del tema de estudio"
              className="text-2xl font-bold border-none p-0 focus:outline-none focus:ring-0"
            />
          </CardTitle>
          <Textarea
            value={studyTopic.description || ""}
            onChange={(e) =>
              handleStudyTopicChange("description", e.target.value)
            }
            placeholder="Descripción del tema de estudio..."
            className="text-sm text-muted-foreground border-none p-0 focus:outline-none focus:ring-0 resize-none"
            rows={2}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="completed"
                checked={studyTopic.completed}
                onCheckedChange={(checked) =>
                  handleStudyTopicChange("completed", checked)
                }
              />
              <Label htmlFor="completed">Tema completado</Label>
            </div>
            <div className="text-sm text-muted-foreground">
              {studyTopic.subtopics.length} subtemas • {Math.round(progress)}%
              completado
            </div>
          </div>

          {studyTopic.subtopics.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subtopics">Subtemas</TabsTrigger>
          <TabsTrigger value="details">Detalles generales</TabsTrigger>
        </TabsList>

        <TabsContent value="subtopics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Subtemas</h3>
            <Button onClick={handleAddSubtopic} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar subtema
            </Button>
          </div>

          {studyTopic.subtopics.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay subtemas aún
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comienza agregando subtemas para organizar tu estudio
                </p>
                <Button onClick={handleAddSubtopic}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar primer subtema
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {studyTopic.subtopics.map((subtopic, index) => (
                <div key={subtopic.id} className="relative">
                  {isOrderingMode && (
                    <div className="absolute -left-8 top-4 flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveSubtopic(subtopic.id, "up")}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveSubtopic(subtopic.id, "down")}
                        disabled={index === studyTopic.subtopics.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <SubtopicItem
                    subtopic={subtopic}
                    onUpdate={handleUpdateSubtopic}
                    onRemove={handleRemoveSubtopic}
                    isOrderingMode={isOrderingMode}
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Referencias bíblicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {studyTopic.bibleReferences?.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {ref.book} {ref.chapter}:{ref.verse}
                    </span>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    No hay referencias bíblicas aún
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enlaces web</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {studyTopic.webLinks?.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {link.title || link.url}
                    </a>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    No hay enlaces web aún
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Etiquetas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {studyTopic.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                )) || (
                  <p className="text-sm text-muted-foreground">
                    No hay etiquetas aún
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={deleteSubtopicDialogOpen}
        onOpenChange={setDeleteSubtopicDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar subtema?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El subtema y todo su contenido
              serán eliminados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteSubtopicDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSubtopic}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
