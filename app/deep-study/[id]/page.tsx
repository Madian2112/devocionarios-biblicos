"use client";

import { useState, useEffect, useRef } from "react";
import withAuth from "@/components/auth/with-auth";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Save,
  Trash2,
  Link,
  BookOpen,
  FileText,
  Loader2,
  Book,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BibleSelector } from "@/components/bible/bible-selector";
import { BibleViewer } from "@/components/bible/bible-viewer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDeepStudies } from "@/hooks/use-deep-studies";
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom";
import { useAuthContext } from "@/context/auth-context";
import type {
  DeepStudy,
  StudySubPoint,
  BiblicalReference,
  WebReference,
} from "@/lib/interfaces/deep-study";
import { Timestamp } from "firebase/firestore";
import { GradientCard } from "@/components/ui/gradient-card";
import { Badge } from "@/components/ui/badge";

interface SubPointEditorProps {
  subPoint: StudySubPoint;
  onUpdate: (updatedSubPoint: StudySubPoint) => void;
  onDelete: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SubPointEditor({
  subPoint,
  onUpdate,
  onDelete,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: SubPointEditorProps) {
  const [showBibleSelector, setShowBibleSelector] = useState(false);
  const [newBibleReference, setNewBibleReference] = useState<
    Partial<BiblicalReference>
  >({});
  const [newWebReference, setNewWebReference] = useState<Partial<WebReference>>({
  });
  const [showWebReferenceDialog, setShowWebReferenceDialog] = useState(false);

  const handleAddBibleReference = (reference: string) => {
    const newReference: BiblicalReference = {
      id: Date.now().toString(),
      reference,
      version: "rv1960",
      notes: "",
      subPointId: subPoint.id,
    };
    onUpdate({
      ...subPoint,
      biblicalReferences: [...subPoint.biblicalReferences, newReference],
    });
    setShowBibleSelector(false);
  };

  const handleAddWebReference = () => {
    if (!newWebReference.url || !newWebReference.description) return;

    const reference: WebReference = {
      id: Date.now().toString(),
      url: newWebReference.url,
      description: newWebReference.description,
      subPointId: subPoint.id,
    };
    onUpdate({
      ...subPoint,
      webReferences: [...subPoint.webReferences, reference],
    });
    setNewWebReference({});
    setShowWebReferenceDialog(false);
  };

  return (
    <GradientCard gradient="purple" className="mb-4">
      <CardContent className="p-6 space-y-6">
        {/* Título y contenido del subpunto */}
        <div className="space-y-4">
          <Input
            value={subPoint.title}
            onChange={(e) => onUpdate({ ...subPoint, title: e.target.value })}
            placeholder="Título del subtema"
            className="bg-[#2a2a2a]/50 border-gray-700 text-white"
          />
          <Textarea
            value={subPoint.content}
            onChange={(e) => onUpdate({ ...subPoint, content: e.target.value })}
            placeholder="Desarrolla este subtema..."
            className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[150px]"
          />
        </div>

        {/* Referencias bíblicas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              Referencias Bíblicas
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBibleSelector(true)}
              className="bg-[#2a2a2a]/50 border-gray-700"
            >
              <Book className="h-4 w-4 mr-2" />
              Agregar Referencia
            </Button>
          </div>
          <div className="space-y-3">
            {subPoint.biblicalReferences.map((ref) => (
              <div
                key={ref.id}
                className="flex items-start gap-3 bg-[#2a2a2a]/30 p-3 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-400 font-medium">
                      {ref.reference}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-gray-400"
                    >
                      {ref.version?.toUpperCase()}
                    </Badge>
                    <BibleViewer
                      reference={ref.reference}
                      defaultVersion={ref.version}
                    />
                  </div>
                  <Textarea
                    value={ref.notes}
                    onChange={(e) =>
                      onUpdate({
                        ...subPoint,
                        biblicalReferences: subPoint.biblicalReferences.map(
                          (r) =>
                            r.id === ref.id
                              ? { ...r, notes: e.target.value }
                              : r
                        ),
                      })
                    }
                    placeholder="Notas sobre esta referencia..."
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[100px]"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onUpdate({
                      ...subPoint,
                      biblicalReferences: subPoint.biblicalReferences.filter(
                        (r) => r.id !== ref.id
                      ),
                    })
                  }
                  className="h-8 w-8 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Referencias web */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">
              Referencias Web
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWebReferenceDialog(true)}
              className="bg-[#2a2a2a]/50 border-gray-700"
            >
              <Link className="h-4 w-4 mr-2" />
              Agregar Enlace
            </Button>
          </div>
          <div className="space-y-3">
            {subPoint.webReferences.map((ref) => (
              <div
                key={ref.id}
                className="flex items-start gap-3 bg-[#2a2a2a]/30 p-3 rounded-lg"
              >
                <div className="flex-1">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 break-all"
                  >
                    {ref.url}
                  </a>
                  <p className="text-gray-400 mt-2">{ref.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onUpdate({
                      ...subPoint,
                      webReferences: subPoint.webReferences.filter(
                        (r) => r.id !== ref.id
                      ),
                    })
                  }
                  className="h-8 w-8 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de control */}
        <div className="flex justify-between pt-4 border-t border-gray-700">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveUp()}
              disabled={isFirst}
            >
              Subir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveDown()}
              disabled={isLast}
            >
              Bajar
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(subPoint.id)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Subtema
          </Button>
        </div>
      </CardContent>

      {/* Selector de referencias bíblicas */}
      <BibleSelector
        onSelect={handleAddBibleReference}
        trigger={<div />}
        open={showBibleSelector}
        onOpenChange={setShowBibleSelector}
      />

      {/* Diálogo para agregar referencia web */}
      <Dialog
        open={showWebReferenceDialog}
        onOpenChange={setShowWebReferenceDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Referencia Web</DialogTitle>
            <DialogDescription>
              Ingresa los detalles del enlace de referencia
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">URL</label>
              <Input
                value={newWebReference.url || ""}
                onChange={(e) =>
                  setNewWebReference({
                    ...newWebReference,
                    url: e.target.value,
                  })
                }
                placeholder="https://ejemplo.com"
                className="bg-[#2a2a2a]/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Descripción</label>
              <Textarea
                value={newWebReference.description || ""}
                onChange={(e) =>
                  setNewWebReference({
                    ...newWebReference,
                    description: e.target.value,
                  })
                }
                placeholder="Describe brevemente este recurso..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowWebReferenceDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddWebReference}>Agregar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </GradientCard>
  );
}

function DeepStudyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { studies, saveStudy } = useDeepStudies();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("content");
  const [study, setStudy] = useState<DeepStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useDisableMobileZoom();

  // Cargar estudio
  useEffect(() => {
    const loadStudy = async () => {
      const foundStudy = studies.find((s) => s.id === params.id);
      if (foundStudy) {
        setStudy(foundStudy);
      } else {
        // Crear nuevo estudio si no existe
        const newStudy: DeepStudy = {
          id: params.id as string,
          userId: user?.uid || "",
          title: "",
          description: "",
          subPoints: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          orderIndex: studies.length,
        };
        setStudy(newStudy);
      }
      setLoading(false);
    };

    loadStudy();
  }, [params.id, studies, user]);

  // Auto-guardado
  const triggerAutoSave = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (study) {
        await handleSave();
      }
    }, 2000);
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!study) return;

    try {
      await saveStudy({
        ...study,
        updatedAt: Timestamp.now(),
      });
      toast({
        title: "✅ Guardado",
        description: "Los cambios han sido guardados.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      toast({
        title: "❌ Error al guardar",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Agregar nuevo subtema
  const handleAddSubPoint = () => {
    if (!study) return;

    const newSubPoint: StudySubPoint = {
      id: Date.now().toString(),
      title: "",
      content: "",
      orderIndex: study.subPoints.length,
      biblicalReferences: [],
      webReferences: [],
    };

    setStudy({
      ...study,
      subPoints: [...study.subPoints, newSubPoint],
    });
    triggerAutoSave();
  };

  // Actualizar subtema
  const handleUpdateSubPoint = (updatedSubPoint: StudySubPoint) => {
    if (!study) return;

    setStudy({
      ...study,
      subPoints: study.subPoints.map((sp) =>
        sp.id === updatedSubPoint.id ? updatedSubPoint : sp
      ),
    });
    triggerAutoSave();
  };

  // Eliminar subtema
  const handleDeleteSubPoint = (id: string) => {
    if (!study) return;

    setStudy({
      ...study,
      subPoints: study.subPoints.filter((sp) => sp.id !== id),
    });
    triggerAutoSave();
  };

  // Mover subtema
  const handleMoveSubPoint = (id: string, direction: "up" | "down") => {
    if (!study) return;

    const currentIndex = study.subPoints.findIndex((sp) => sp.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= study.subPoints.length) return;

    const newSubPoints = [...study.subPoints];
    const temp = newSubPoints[currentIndex];
    newSubPoints[currentIndex] = newSubPoints[newIndex];
    newSubPoints[newIndex] = temp;

    // Actualizar orderIndex
    newSubPoints.forEach((sp, index) => {
      sp.orderIndex = index;
    });

    setStudy({
      ...study,
      subPoints: newSubPoints,
    });
    triggerAutoSave();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="container py-8">
        <div className="text-center text-gray-400">
          <p className="text-lg">Estudio no encontrado</p>
          <Button
            variant="link"
            onClick={() => router.push("/deep-study")}
            className="mt-4"
          >
            Volver a Estudios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.push("/deep-study")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button variant="outline" onClick={handleSave} className="ml-auto">
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      </div>

      {/* Título y descripción */}
      <div className="space-y-4 mb-8">
        <Input
          value={study.title}
          onChange={(e) => {
            setStudy({ ...study, title: e.target.value });
            triggerAutoSave();
          }}
          placeholder="Título del estudio"
          className="text-2xl font-bold bg-transparent border-none text-white placeholder:text-gray-500 focus-visible:ring-0"
        />
        <Textarea
          value={study.description}
          onChange={(e) => {
            setStudy({ ...study, description: e.target.value });
            triggerAutoSave();
          }}
          placeholder="Descripción general del tema..."
          className="bg-[#2a2a2a]/50 border-gray-700 text-white resize-none"
        />
      </div>

      {/* Lista de subtemas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Subtemas</h2>
          <Button onClick={handleAddSubPoint}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Subtema
          </Button>
        </div>

        {study.subPoints.map((subPoint, index) => (
          <SubPointEditor
            key={subPoint.id}
            subPoint={subPoint}
            onUpdate={handleUpdateSubPoint}
            onDelete={handleDeleteSubPoint}
            isFirst={index === 0}
            isLast={index === study.subPoints.length - 1}
            onMoveUp={() => handleMoveSubPoint(subPoint.id, "up")}
            onMoveDown={() => handleMoveSubPoint(subPoint.id, "down")}
          />
        ))}

        {study.subPoints.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No hay subtemas creados</p>
            <p className="text-sm">
              Comienza agregando un subtema para organizar tu estudio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const Page = withAuth(DeepStudyDetailPage);
export default Page;
