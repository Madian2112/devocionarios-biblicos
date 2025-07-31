"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Pencil,
  Check,
  Trash2,
  Home,
  Search,
  X,
  Eye,
  Sparkles,
  BookOpen,
  Heart,
  Shield,
  Lightbulb,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { GradientCard } from "@/components/ui/gradient-card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import withAuth from "@/components/auth/with-auth"
import { Timestamp } from "firebase/firestore"
import { useTopicalStudies } from "@/hooks/use-sincronizar-temas"
import { useToast } from "@/hooks/use-toast"
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom"

// Plantillas básicas
const STUDY_TEMPLATES = [
  {
    id: "love",
    name: "El Amor de Dios",
    description: "Versículos sobre el amor divino",
    icon: <Heart className="h-5 w-5" />,
    entries: [
      { referencia: "Juan 3:16", learning: "El amor de Dios demostrado en el sacrificio", versionTexto: "rv1960" },
      { referencia: "1 Juan 4:8", learning: "Dios es amor - su naturaleza esencial", versionTexto: "rv1960" },
      { referencia: "Romanos 8:38-39", learning: "Nada puede separarnos del amor de Dios", versionTexto: "rv1960" },
    ],
  },
  {
    id: "faith",
    name: "Fundamentos de la Fe",
    description: "Versículos clave sobre la fe",
    icon: <Shield className="h-5 w-5" />,
    entries: [
      { referencia: "Hebreos 11:1", learning: "Definición bíblica de la fe", versionTexto: "rv1960" },
      { referencia: "Romanos 10:17", learning: "La fe viene por el oír la Palabra", versionTexto: "rv1960" },
      { referencia: "Efesios 2:8-9", learning: "Salvos por gracia mediante la fe", versionTexto: "rv1960" },
    ],
  },
  {
    id: "wisdom",
    name: "Sabiduría Divina",
    description: "Cómo obtener sabiduría de Dios",
    icon: <Lightbulb className="h-5 w-5" />,
    entries: [
      {
        referencia: "Proverbios 9:10",
        learning: "El temor del Señor es principio de sabiduría",
        versionTexto: "rv1960",
      },
      { referencia: "Santiago 1:5", learning: "Pedir sabiduría a Dios", versionTexto: "rv1960" },
    ],
  },
]

// Vista previa rápida
function QuickPreview({ study }: { study: TopicalStudy }) {
  const [open, setOpen] = useState(false)

  return (
    <GradientCard className="group" gradient="blue">
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[85vh] bg-[#2a2a2a]/50 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg">{study.name}</DialogTitle>
            <Badge variant="outline" className="text-xs">
              {study.entries.length} {study.entries.length === 1 ? "entrada" : "entradas"}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3">
            {study.entries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Este tema no tiene entradas aún</p>
              </div>
            ) : (
              study.entries.map((entry, index) => (
                <div key={entry.id} className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-300 text-sm">{entry.referencia || `Entrada ${index + 1}`}</h4>
                    <Badge variant="outline" className="text-xs">
                      {entry.versionTexto?.toUpperCase() || "RV1960"}
                    </Badge>
                  </div>
                  {entry.learning && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {entry.learning.length > 120 ? `${entry.learning.substring(0, 120)}...` : entry.learning}
                    </p>
                  )}
                  {!entry.learning && <p className="text-gray-500 text-sm italic">Sin apuntes</p>}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4">
          <Link href={`/topical/${study.id}`} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-blue-800 to-purple-800" onClick={() => setOpen(false)}>
              <Pencil className="h-4 w-4 mr-2" />
              Abrir Tema
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
    </GradientCard>
  )
}

// Plantillas móvil-friendly
function StudyTemplates({ onSelectTemplate }: { onSelectTemplate: (template: any) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 flex-1 sm:flex-none">
          <Sparkles className="h-4 w-4 mr-2" />
          Usar Plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[85vh] bg-[#2a2a2a]/50 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500/50 drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]" />

            Plantillas
          </DialogTitle>
          <DialogDescription className="text-gray-400">Comienza con plantillas predefinidas</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3">
            {STUDY_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2rounded-lg text-blue-500/50">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{template.name}</h3>
                      <p className="text-gray-400 text-sm">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{template.entries.length} versículos</span>
                    <Button size="sm" className="bg-gradient-to-r from-blue-800 to-purple-800">
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function TopicalStudiesPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()

  // Estados básicos
  const [newTopicName, setNewTopicName] = useState("")
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingTopicName, setEditingTopicName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; name: string } | null>(null)
  const [refreshingEntries, setRefreshingEntries] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")

  useDisableMobileZoom()

  // Hook existente
  const { studies: topicalStudies, loading, saveStudy, deleteStudy } = useTopicalStudies()

  // Búsqueda simple
  const filteredStudies = useMemo(() => {
    if (!searchTerm) return topicalStudies

    return topicalStudies.filter(
      (study) =>
        study.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.entries.some(
          (entry) =>
            entry.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.learning?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    )
  }, [topicalStudies, searchTerm])

  // Efecto para refrescar
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const currentPath = window.location.pathname
        const referrer = document.referrer

        if (currentPath === "/topical" && referrer.includes("/topical/")) {
          setTimeout(() => {
            if (topicalStudies.length > 0) {
              const allIds = new Set(topicalStudies.map((t) => t.id))
              setRefreshingEntries(allIds)
              setTimeout(() => setRefreshingEntries(new Set()), 1000)
            }
          }, 200)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [topicalStudies])

  // Crear tema normal
  const handleCreateNewTopic = async () => {
    if (!newTopicName.trim()) {
      toast({
        title: "⚠️ Nombre requerido",
        description: "Ingresa un nombre para el tema.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    if (!user) {
      toast({
        title: "❌ Error de autenticación",
        description: "No estás autenticado.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const newTopic: Omit<TopicalStudy, "id" | "userId" | "createdAt" | "updatedAt"> = {
      name: newTopicName,
      entries: [],
    }

    const newStudyForState: TopicalStudy = {
      ...newTopic,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    setNewTopicName("")

    try {
      const { userId, ...topicDataWithoutUserId } = newStudyForState
      const savedStudy = await saveStudy(topicDataWithoutUserId)

      toast({
        title: "✅ Tema creado",
        description: `"${newTopic.name}" listo para usar.`,
        duration: 2000,
      })

      router.push(`/topical/${savedStudy?.id}`)
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "No se pudo crear el tema.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Crear desde plantilla
  const handleCreateFromTemplate = async (template: any) => {
    if (!user) {
      toast({
        title: "❌ Error de autenticación",
        description: "No estás autenticado.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const newTopic: Omit<TopicalStudy, "id" | "userId" | "createdAt" | "updatedAt"> = {
      name: template.name,
      entries: template.entries.map((entry: any, index: number) => ({
        ...entry,
        id: `${Date.now()}-${index}`,
      })),
    }

    const newStudyForState: TopicalStudy = {
      ...newTopic,
      id: Date.now().toString(),
      userId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    try {
      const { userId, ...topicDataWithoutUserId } = newStudyForState
      const savedStudy = await saveStudy(topicDataWithoutUserId)

      toast({
        title: "✅ Plantilla aplicada",
        description: `"${template.name}" creado con ${template.entries.length} versículos.`,
        duration: 2000,
      })

      router.push(`/topical/${savedStudy?.id}`)
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "No se pudo crear desde plantilla.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Funciones existentes
  const handleDeleteTopic = (topic: TopicalStudy) => {
    setTopicToDelete({ id: topic.id, name: topic.name })
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTopic = async () => {
    if (!topicToDelete || !user) return

    setDeleteDialogOpen(false)
    setRefreshingEntries(new Set([topicToDelete.id]))

    try {
      await deleteStudy(topicToDelete.id)
      toast({
        title: "✅ Eliminado",
        description: `"${topicToDelete.name}" eliminado.`,
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setRefreshingEntries(new Set())
      setTopicToDelete(null)
    }
  }

  const handleStartEditingTopic = (topic: TopicalStudy) => {
    setEditingTopicId(topic.id)
    setEditingTopicName(topic.name)
  }

  const handleUpdateTopicName = async (topicId: string) => {
    if (!editingTopicName.trim() || !user) return

    const studyToUpdate = topicalStudies.find((s) => s.id === topicId)
    if (!studyToUpdate) return

    const updatedStudy = { ...studyToUpdate, name: editingTopicName, updatedAt: Timestamp.now() }

    setEditingTopicId(null)
    setEditingTopicName("")

    try {
      const { userId, ...studyData } = updatedStudy
      await saveStudy(studyData)
    } catch (error) {
      console.error("Error updating topic name:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header móvil-friendly */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <Button variant="outline" size="icon" className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Temas de Estudio
            </h1>
          </div>
          <Badge variant="outline" className="text-xs">
            {topicalStudies.length} temas
          </Badge>
        </div>

        {/* Crear nuevo tema - PRIORIDAD MÓVIL */}
        <div className="mb-6">
          <GradientCard gradient="blue">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateNewTopic()}
                    placeholder="Nombre del tema (ej: Fe, Amor...)"
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white flex-1"
                  />
                  <Button onClick={handleCreateNewTopic} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <StudyTemplates onSelectTemplate={handleCreateFromTemplate} />
              </div>
            </CardContent>
          </GradientCard>
        </div>

        {/* Búsqueda simple */}
        {topicalStudies.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar temas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#2a2a2a]/50 border-gray-700 text-white"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Lista de temas - OPTIMIZADA PARA MÓVIL */}
        <div className="space-y-3">
          {filteredStudies.length === 0 && topicalStudies.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">¡Comienza tu primer tema!</p>
              <p className="text-sm">Crea un tema o usa una plantilla</p>
            </div>
          )}

          {filteredStudies.length === 0 && topicalStudies.length > 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No se encontraron temas con "{searchTerm}"</p>
            </div>
          )}

          {filteredStudies.map((topic) => (
            <GradientCard key={topic.id} className="group" gradient="blue">
              <CardContent className="p-0">
                <div className="flex items-center">
                  {/* Contenido principal - CLICKEABLE */}
                  <Link href={`/topical/${topic.id}`} className="flex-1 min-w-0 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {editingTopicId === topic.id ? (
                          <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                            <Input
                              value={editingTopicName}
                              onChange={(e) => setEditingTopicName(e.target.value)}
                              onBlur={() => handleUpdateTopicName(topic.id)}
                              onKeyDown={(e) => e.key === "Enter" && handleUpdateTopicName(topic.id)}
                              autoFocus
                              className="bg-[#2a2a2a]/80 text-sm"
                            />
                            <Button
                              size="icon"
                              onClick={(e) => {
                                e.preventDefault()
                                handleUpdateTopicName(topic.id)
                              }}
                              className="h-8 w-8"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-white truncate text-lg">{topic.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {refreshingEntries.has(topic.id) ? (
                                <>
                                  <div className="animate-spin h-3 w-3 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                                  <span className="text-gray-400 text-sm">Actualizando...</span>
                                </>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  {topic.entries.length} {topic.entries.length === 1 ? "versículo" : "versículos"}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  </Link>

                  {/* Acciones rápidas */}
                  <div className="flex items-center gap-1 p-2 border-l border-gray-700/50">
                    <QuickPreview study={topic} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEditingTopic(topic)}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTopic(topic)}
                      className="h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </GradientCard>
          ))}
        </div>

        {/* Resumen al final */}
        {topicalStudies.length > 0 && (
          <div className="mt-8 text-center text-gray-400 text-sm">
            {filteredStudies.length !== topicalStudies.length && (
              <p>
                Mostrando {filteredStudies.length} de {topicalStudies.length} temas
              </p>
            )}
            {filteredStudies.length === topicalStudies.length && (
              <p>
                Total: {topicalStudies.length} {topicalStudies.length === 1 ? "tema" : "temas"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Dialog de confirmación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar tema?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Se eliminará <strong className="text-white">"{topicToDelete?.name}"</strong> y todo su contenido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTopic}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(TopicalStudiesPage)
