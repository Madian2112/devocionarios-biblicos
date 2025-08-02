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
  ChevronUp,
  ChevronDown,
  ListOrdered,
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
import { useTopicalStudies } from "@/hooks/use-sincronizar-temas"
import { useToast } from "@/hooks/use-toast"
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom"
import { SmartSyncButton } from "@/components/cache/boton-inteligente"
import { SyncType } from "@/lib/enums/SyncType"
import NProgress from '@/lib/nprogress'

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white focus:outline-none focus:ring-0">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[85vh] bg-[#2a2a2a]/50 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg">{study.name}</DialogTitle>
            <Badge variant="outline" className="text-xs mr-3">
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
            <Button className="w-full bg-gradient-to-r from-blue-800 to-purple-800 focus:outline-none focus:ring-0" onClick={() => setOpen(false)}>
              <Pencil className="h-4 w-4 mr-2" />
              Abrir Tema
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Plantillas móvil-friendly
function StudyTemplates({ onSelectTemplate }: { onSelectTemplate: (template: any) => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 flex-1 sm:flex-none"
        >
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
  const [isOrderingMode, setIsOrderingMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  // Estado local para la visualización y reordenamiento inmediato
  const [displayStudies, setDisplayStudies] = useState<TopicalStudy[]>([])

  useDisableMobileZoom()

  // Hook existente
  const { studies: topicalStudies, loading, saveStudy, deleteStudy } = useTopicalStudies()

  // Sincronizar displayStudies con topicalStudies del hook
useEffect(() => {
  if (topicalStudies && !isReordering) {
    // Solo sincronizar cuando NO estamos reordenando
    if (displayStudies.length === 0) {
      // Primera carga: ordenar por orderIndex si existe
      const sortedStudies = [...topicalStudies].sort((a, b) => {
        const aIndex = a.orderIndex ?? 999999
        const bIndex = b.orderIndex ?? 999999
        return aIndex - bIndex
      })
      setDisplayStudies(sortedStudies)
    } else if (displayStudies.length !== topicalStudies.length) {
      // Cambio en cantidad: sincronizar pero mantener orden si es posible
      const sortedStudies = [...topicalStudies].sort((a, b) => {
        const aIndex = a.orderIndex ?? 999999
        const bIndex = b.orderIndex ?? 999999
        return aIndex - bIndex
      })
      setDisplayStudies(sortedStudies)
    }
    // Si el número es igual y estamos reordenando, NO sincronizar
  }
}, [topicalStudies, isReordering]) 

  // const migrateStudiesWithoutOrderIndex = async () => {
  //   const studiesToMigrate = displayStudies.filter(study => study.orderIndex === 0)
  //   console.log('Este es display studie: ', displayStudies)
  //   console.log('Migrando estudios sin orderIndex:', studiesToMigrate)
    
  //   if (studiesToMigrate.length > 0) {
  //     const savePromises = studiesToMigrate.map((study, index) => {
  //       const updatedStudy = { ...study, orderIndex: index }
  //       const { userId, createdAt, updatedAt, ...studyData } = updatedStudy
  //       console.log('Asi me lleva la studyData: ', studyData)
  //       return saveStudy(studyData)
  //     })
      
  //     await Promise.all(savePromises)
  //   }
  // }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Búsqueda simple
  const filteredStudies = useMemo(() => {
    if (!searchTerm) return displayStudies // Usar displayStudies para filtrar

    return displayStudies.filter(
      (study) =>
        study.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.entries.some(
          (entry) =>
            entry.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.learning?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    )
  }, [displayStudies, searchTerm]) // Depender de displayStudies

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

    const nextOrderIndex = displayStudies.length > 0 
    ? Math.max(...displayStudies.map(s => s.orderIndex || 0)) + 1 
    : 0
    const newTopic: Omit<TopicalStudy, "userId" | "createdAt" | "updatedAt"> = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: newTopicName,
      entries: [],
      orderIndex: nextOrderIndex
    }

    setNewTopicName("")

    try {
      NProgress.start()
      const savedStudy = await saveStudy(newTopic)

      if (savedStudy) {
        toast({
          title: "✅ Tema creado",
          description: `"${newTopic.name}" listo para usar.`,
          duration: 2000,
        })
        router.push(`/topical/${savedStudy.id}`)
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo crear el tema.",
          variant: "destructive",
          duration: 3000,
        })
      }
    } catch (error: any) {
      NProgress.done()
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
    const nextOrderIndex = displayStudies.length > 0 
    ? Math.max(...displayStudies.map(s => s.orderIndex || 0)) + 1 
    : 0
    const newTopic: Omit<TopicalStudy, "userId" | "createdAt" | "updatedAt"> = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name: template.name,
      entries: template.entries.map((entry: any, index: number) => ({
        ...entry,
        id: `${Date.now()}-${index}`, // Asegurar IDs únicos para las entradas
      })),
      orderIndex: nextOrderIndex, // Agregar orderIndex
    }

    try {
      const savedStudy = await saveStudy(newTopic)

      if (savedStudy) {
        toast({
          title: "✅ Plantilla aplicada",
          description: `"${template.name}" creado con ${template.entries.length} versículos.`,
          duration: 2000,
        })
        router.push(`/topical/${savedStudy.id}`)
      } else {
        toast({
          title: "❌ Error",
          description: "No se pudo crear desde plantilla.",
          variant: "destructive",
          duration: 3000,
        })
      }
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
      await deleteStudy(topicToDelete.id) // Usar deleteStudy del hook
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

    const studyToUpdate = displayStudies.find((s) => s.id === topicId) // Usar displayStudies
    if (!studyToUpdate) return

    const updatedStudyData: Omit<TopicalStudy, "createdAt" | "updatedAt" | "userId"> = {
      ...studyToUpdate,
      name: editingTopicName,
    }

    setEditingTopicId(null)
    setEditingTopicName("")

    try {
      await saveStudy(updatedStudyData) // Usar saveStudy del hook
    } catch (error) {
      console.error("Error updating topic name:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el nombre del tema.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

const handleMoveStudy = async (studyId: string, direction: "up" | "down") => {
  const currentIndex = displayStudies.findIndex((study) => study.id === studyId)
  if (currentIndex === -1) return

  let newIndex = currentIndex
  if (direction === "up") {
    newIndex = Math.max(0, currentIndex - 1)
  } else if (direction === "down") {
    newIndex = Math.min(displayStudies.length - 1, currentIndex + 1)
  }

  if (newIndex === currentIndex) return

  // Marcar que estamos reordenando para evitar sincronización
  setIsReordering(true)

  const newDisplayStudies = [...displayStudies]
  const [movedStudy] = newDisplayStudies.splice(currentIndex, 1)
  newDisplayStudies.splice(newIndex, 0, movedStudy)

  // Actualizar inmediatamente la UI
  setDisplayStudies(newDisplayStudies)

  // Recalcular orderIndex para TODOS los elementos
  const reorderedStudies = newDisplayStudies.map((study, index) => ({
    ...study,
    orderIndex: index
  }))

  // Actualizar displayStudies con los nuevos orderIndex
  setDisplayStudies(reorderedStudies)

  try {
    // Guardar todos los estudios con batch o secuencialmente
    const savePromises = reorderedStudies.map(async (study, index) => {
      // Pequeño delay para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, index * 50))
      
      const { userId, createdAt, updatedAt, ...studyDataWithoutTimestamps } = study
      return await saveStudy(studyDataWithoutTimestamps)
    })

    await Promise.all(savePromises)

    // Esperar un poco antes de permitir sincronización
    setTimeout(() => {
      setIsReordering(false)
    }, 2000) // 2 segundos de gracia

    toast({
      title: "✅ Orden actualizado",
      description: "Los temas han sido reordenados",
      duration: 2000,
    })

  } catch (error) {
    console.error("Error saving reordered studies:", error)
    
    // En caso de error, revertir y permitir sincronización
    setIsReordering(false)
    
    // Recargar desde el backend
    setDisplayStudies([])
    
    toast({
      title: "❌ Error",
      description: "No se pudo guardar el nuevo orden. Se recargó la lista.",
      variant: "destructive",
      duration: 3000,
    })
  }
}

  const handleToggleOrderingMode = () => {
    setIsOrderingMode((prev) => !prev)
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
        <SmartSyncButton
          className="shadow-lg"
          showText={false}
          syncType={SyncType.TOPICALS} // 📖 Solo devocionales
        />
        <div className="flex items-center justify-between mb-6 mt-1">
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
                <div className="flex gap-2">
                  {isMobile && (
                    <Button
                      onClick={handleToggleOrderingMode}
                      variant="outline"
                      className={`w-full focus:outline-none focus:ring-0 ${isOrderingMode ? "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 focus:outline-none focus:ring-0" : "bg-gray-700/20 text-gray-300 border-gray-700/30 hover:bg-gray-700/30 focus:outline-none focus:ring-0"}`}
                      tabIndex={-1}
                    >
                      <ListOrdered className="h-4 w-4 mr-2 focus:outline-none focus:ring-0" />
                      {isOrderingMode ? "Terminar Orden" : "Ordenar"}
                    </Button>
                  )}
                  {/* <StudyTemplates onSelectTemplate={handleCreateFromTemplate} /> */}
                </div>
              </div>
            </CardContent>
          </GradientCard>
        </div>

        {/* Búsqueda simple */}
        {displayStudies.length > 0 && (
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
          {filteredStudies.length === 0 && displayStudies.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">¡Comienza tu primer tema!</p>
              <p className="text-sm">Crea un tema o usa una plantilla</p>
            </div>
          )}

          {filteredStudies.length === 0 && displayStudies.length > 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No se encontraron temas con "{searchTerm}"</p>
            </div>
          )}

          {filteredStudies.map((topic, index) => (
            <GradientCard key={topic.id} className="group" gradient="blue">
              <CardContent className="p-0">
                <div className="flex items-center">
                  {/* Botones de reordenamiento */}
                  {(isOrderingMode || !isMobile) && (
                    <div className="flex flex-col gap-1 ml-2 mr-2 sm:mr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveStudy(topic.id, "up")}
                        disabled={index === 0}
                        className="h-6 w-6 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
                        tabIndex={-1}
                      >
                        <ChevronUp className="h-4 w-4 focus:outline-none focus:ring-0" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveStudy(topic.id, "down")}
                        disabled={index === filteredStudies.length - 1}
                        className="h-6 w-6 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
                        tabIndex={-1}
                      >
                        <ChevronDown className="h-4 w-4 focus:outline-none focus:ring-0" />
                      </Button>
                    </div>
                  )}

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
        {displayStudies.length > 0 && (
          <div className="mt-8 text-center text-gray-400 text-sm">
            {filteredStudies.length !== displayStudies.length && (
              <p>
                Mostrando {filteredStudies.length} de {displayStudies.length} temas
              </p>
            )}
            {filteredStudies.length === displayStudies.length && (
              <p>
                Total: {displayStudies.length} {displayStudies.length === 1 ? "tema" : "temas"}
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
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 w-full sm:w-auto focus:outline-none focus:ring-0">
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
