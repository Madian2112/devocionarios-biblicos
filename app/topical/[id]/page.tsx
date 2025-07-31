"use client"

import type React from "react"

import { useState, useEffect, use, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Download,
  Plus,
  ChevronDown,
  Eye,
  Trash2,
  Book,
  GripVertical,
  Clock,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
import { GradientCard } from "@/components/ui/gradient-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { BibleSelector } from "@/components/bible/bible-selector"
import { exportTopicalStudyToPDF } from "@/lib/pdf-exporter"
import type { TopicalStudy, StudyEntry } from "@/lib/firestore"
import { useAuthContext } from "@/context/auth-context"
import { Timestamp } from "firebase/firestore"
import { fetchVerseText } from "@/lib/bible-api"
import withAuth from "@/components/auth/with-auth"
import { toast, useToast } from "@/hooks/use-toast"
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom"
import { useTopicalStudies } from "@/hooks/use-sincronizar-temas"
import { smartSyncFirestoreService } from "@/lib/services/sincronizacion-inteligente-firestore"

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Componente sorteable para drag & drop
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [isDragEnabled, setIsDragEnabled] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Detectar si es dispositivo móvil
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768

  // Prevenir selección de texto y comportamientos por defecto
  const preventDefaults = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handlers mejorados para long press en móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return

    // Prevenir selección de texto y menú contextual
    e.preventDefault()
    document.body.style.userSelect = "none"
    document.body.style.webkitUserSelect = "none"

    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }

    // Agregar listeners para prevenir comportamientos por defecto
    document.addEventListener("selectstart", preventDefaults)
    document.addEventListener("contextmenu", preventDefaults)

    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true)
      setIsDragEnabled(true)

      // Vibración táctil más suave
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }

      toast({
        title: "🔄 Listo para reordenar",
        description: "Arrastra para cambiar la posición",
        duration: 2000,
      })
    }, 600) // Reducido a 600ms para mejor respuesta
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !longPressTimerRef.current) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)

    // Tolerancia más pequeña para mejor precisión
    if (deltaX > 5 || deltaY > 5) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
      cleanupTouchHandlers()
    }
  }

  const handleTouchEnd = () => {
    cleanupTouchHandlers()

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    touchStartRef.current = null

    // Desactivar drag después de un tiempo más corto
    if (isDragEnabled && !isDragging) {
      setTimeout(() => {
        setIsDragEnabled(false)
        setIsLongPressing(false)
      }, 3000) // Reducido a 3 segundos
    }
  }

  const cleanupTouchHandlers = () => {
    // Restaurar selección de texto
    document.body.style.userSelect = ""
    document.body.style.webkitUserSelect = ""

    // Remover listeners
    document.removeEventListener("selectstart", preventDefaults)
    document.removeEventListener("contextmenu", preventDefaults)
  }

  // Limpiar timers y handlers al desmontar
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      cleanupTouchHandlers()
    }
  }, [])

  // Combinar listeners para desktop y móvil
  const dragListeners = isMobile ? (isDragEnabled ? listeners : {}) : listeners

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isMobile ? "touch-none select-none" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* Indicador visual mejorado para móviles */}
      {isMobile && isLongPressing && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/60 rounded-lg pointer-events-none z-20">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-lg" />
          <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            ✋ Arrastra ahora
          </div>
        </div>
      )}

      {/* Icono de drag - SOLO EN DESKTOP */}
      {!isMobile && (
        <div
          {...attributes}
          {...dragListeners}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <div className="p-1 bg-gray-700/80 rounded hover:bg-gray-600/80 transition-colors">
            <GripVertical className="h-4 w-4 text-gray-300" />
          </div>
        </div>
      )}

      {/* Área invisible para drag en móviles con mejor handling */}
      {isMobile && isDragEnabled && (
        <div
          {...attributes}
          {...dragListeners}
          className="absolute inset-0 z-10 touch-none"
          style={{ touchAction: "none" }}
        />
      )}

      {/* Contenido con padding condicional y prevención de selección */}
      <div
        className={`${isMobile ? "px-2" : "pl-8"} ${isMobile ? "select-none touch-none" : ""}`}
        style={isMobile ? { touchAction: "manipulation" } : {}}
      >
        {children}
      </div>

      {/* Hint sutil para móviles cuando no está activo */}
      {isMobile && !isDragEnabled && (
        <div className="absolute top-2 right-2 opacity-30 pointer-events-none">
          <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">Mantén presionado</div>
        </div>
      )}
    </div>
  )
}

function TopicalStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  const { id } = use(params)
  const isNew = id === "new"

  const [study, setStudy] = useState<TopicalStudy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasChangesRef = useRef(false)
  const [deleteEntryDialogOpen, setDeleteEntryDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<{ id: string; referencia: string } | null>(null)

  const { saveStudy } = useTopicalStudies()

  useDisableMobileZoom()

  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Distancia más pequeña para mejor respuesta
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )


//   const sensors = useSensors(
//   useSensor(PointerSensor, {
//     activationConstraint: {
//       distance: 8, // Requiere mover 8px antes de activar
//     },
//   }),
//   useSensor(KeyboardSensor, {
//     coordinateGetter: sortableKeyboardCoordinates,
//   }),
// )

  useEffect(() => {
    async function fetchOrCreateStudy() {
      if (!user) return
      setLoading(true)

      if (isNew) {
        setStudy({
          id: Date.now().toString(),
          userId: user.uid,
          name: "",
          entries: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })
      } else {
        const fetchedStudy = await smartSyncFirestoreService.getTopicalStudyById(user.uid, id)
        setStudy(fetchedStudy)
      }
      setLoading(false)
    }
    fetchOrCreateStudy()
  }, [id, user, isNew])

  useEffect(() => {
    return () => {
      if (hasChangesRef.current) {
        sessionStorage.setItem("topical-return-flag", "true")
      }
    }
  }, [])

  const handleStudyChange = (field: keyof TopicalStudy, value: any) => {
    setStudy((prev) => (prev ? { ...prev, [field]: value, updatedAt: Timestamp.now() } : null))
    hasChangesRef.current = true
    triggerAutoSave()
  }

  const handleAddStudyEntry = () => {
    if (!study) return

    const newEntry: StudyEntry = {
      id: Date.now().toString(),
      referencia: "",
      learning: "",
      versionTexto: "rv1960",
    }
    handleStudyChange("entries", [...study.entries, newEntry])
    hasChangesRef.current = true
  }

  const handleUpdateStudyEntry = (updatedEntry: StudyEntry) => {
    if (!study) return

    handleStudyChange(
      "entries",
      study.entries.map((e) => (e.id === updatedEntry.id ? updatedEntry : e)),
    )
    hasChangesRef.current = true
  }

  const handleRemoveStudyEntry = (entryId: string) => {
    if (!study) return

    const entry = study.entries.find((e) => e.id === entryId)
    if (!entry) return

    setEntryToDelete({
      id: entryId,
      referencia: entry.referencia || "Entrada sin referencia",
    })
    setDeleteEntryDialogOpen(true)
  }

  const confirmDeleteEntry = () => {
    if (!study || !entryToDelete) return

    handleStudyChange(
      "entries",
      study.entries.filter((e) => e.id !== entryToDelete.id),
    )
    hasChangesRef.current = true

    toast({
      title: "✅ Versículo eliminado",
      description: `Se eliminó "${entryToDelete.referencia}" del estudio`,
      duration: 3000,
    })

    setDeleteEntryDialogOpen(false)
    setEntryToDelete(null)
  }

  // Función para reordenar entradas con drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && study) {
      const oldIndex = study.entries.findIndex((entry) => entry.id === active.id)
      const newIndex = study.entries.findIndex((entry) => entry.id === over.id)

      const reorderedEntries = arrayMove(study.entries, oldIndex, newIndex)
      handleStudyChange("entries", reorderedEntries)

      toast({
        title: "✅ Orden actualizado",
        description: "Las entradas han sido reordenadas",
        duration: 2000,
      })
    }
  }

  const autoSave = useCallback(async () => {
    if (!study || !user || !hasChangesRef.current || saving) return

    try {
      setSaving(true)
      const { userId, ...studyData } = study
      await saveStudy(studyData)

      hasChangesRef.current = false

      toast({
        title: "💾 Guardado automático",
        description: "Tus cambios se guardaron automáticamente",
        duration: 2000,
      })
    } catch (error: any) {
      console.error("❌ Error en auto-guardado:", error)
    } finally {
      setSaving(false)
    }
  }, [study, user, saving, toast, saveStudy])

  const triggerAutoSave = useCallback(() => {
    hasChangesRef.current = true

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 3000)
  }, [autoSave])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasChangesRef.current && study && user) {
        const { userId, ...studyData } = study
        saveStudy(studyData)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (hasChangesRef.current && study && user) {
        const { userId, ...studyData } = study
        saveStudy(studyData)
      }
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [study, user, saveStudy])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!study) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] text-white">
        Tema no encontrado.{" "}
        <Link href="/topical" className="ml-2 underline">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Header mejorado */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Link href="/topical">
            <Button
              variant="outline"
              className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Volver a Temas</span>
            </Button>
          </Link>

          <div className="text-xl text-center sm:text-3xl font-bold sm:text-center order-first sm:order-none flex-1">
            {isNew ? (
              <Input
                value={study.name}
                onChange={(e) => handleStudyChange("name", e.target.value)}
                placeholder="Nombre del Nuevo Tema"
                className="bg-transparent text-center border-0 border-b-2 border-gray-700 focus:ring-0 focus:border-blue-500 text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              />
            ) : (
              <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {study.name}
              </h2>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto order-last">

            <Button
              onClick={() => exportTopicalStudyToPDF(study)}
              variant="outline"
              className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              onClick={handleAddStudyEntry}
              className="bg-gradient-to-r from-blue-600 to-purple-600 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Añadir Versículo</span>
            </Button>
          </div>
        </div>

        {/* Contenido con drag & drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={study.entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {study.entries.map((entry) => (
                <SortableItem key={entry.id} id={entry.id}>
                  <Collapsible
                    className="group"
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        triggerAutoSave()
                      }
                    }}
                  >
                    <GradientCard gradient="blue">
                      <div className="flex w-full items-center p-4">
                        <CollapsibleTrigger className="flex flex-1 text-left min-w-0 items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{entry.referencia || "Sin referencia"}</p>
                            <p className="text-sm text-gray-400 truncate mt-1">{entry.learning || "Sin aprendizaje"}</p>
                          </div>
                          <ChevronDown className="h-5 w-5 text-white transition-transform duration-300 group-data-[state=open]:rotate-180 ml-2 flex-shrink-0" />
                        </CollapsibleTrigger>
                        {entry.referencia && (
                          <div className="ml-2 flex-shrink-0">
                            <BibleViewer
                              reference={entry.referencia}
                              defaultVersion={entry.versionTexto}
                              onClose={async (selectedVersion) => {
                                setSaving(true)
                                const verseText = await fetchVerseText(entry.referencia, selectedVersion)
                                handleUpdateStudyEntry({ ...entry, versionTexto: selectedVersion })
                                setSaving(false)
                              }}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-400 hover:text-blue-300"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </div>
                        )}
                      </div>
                      <CollapsibleContent>
                        <CardContent className="pt-4 space-y-6 border-t border-blue-500/20">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Referencia(s) Bíblica(s)
                            </label>
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="flex-1">
                                <Input
                                  value={entry.referencia}
                                  onChange={(e) => handleUpdateStudyEntry({ ...entry, referencia: e.target.value })}
                                  placeholder="Ej: Juan 3:16 o 1 Corintios 13:4-7"
                                  className="bg-[#2a2a2a]/50 border-gray-700 text-white"
                                />
                              </div>
                              <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                                {entry.versionTexto?.toUpperCase() || "RV1960"}
                              </Badge>
                              <BibleSelector
                                onSelect={(ref) => {
                                  handleUpdateStudyEntry({ ...entry, referencia: ref, versionTexto: "rv1960" })
                                }}
                                currentReference={entry.referencia}
                                trigger={
                                  <Button
                                    variant="outline"
                                    className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                                  >
                                    <Book className="h-4 w-4 mr-2" />
                                    Seleccionar
                                  </Button>
                                }
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleRemoveStudyEntry(entry.id)}
                                className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                              >
                                <Trash2 className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3 mt-6">
                              Apuntes y Aprendizaje
                            </label>
                            <Textarea
                              value={entry.learning}
                              onChange={(e) => handleUpdateStudyEntry({ ...entry, learning: e.target.value })}
                              placeholder="Escribe aquí tus reflexiones sobre este pasaje..."
                              className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[150px]"
                              disabled={saving}
                            />
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </GradientCard>
                  </Collapsible>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {study.entries.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>Este tema no tiene entradas. ¡Añade la primera!</p>
          </div>
        )}

        {/* Indicador de estado mejorado en el footer */}
        <div className="flex justify-center mt-8">
          {saving && (
            <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-500/30">
              <LoadingSpinner size="sm" />
              <span>Guardando automáticamente...</span>
            </div>
          )}
          {!saving && hasChangesRef.current && (
            <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-500/30">
              <Clock className="w-4 h-4" />
              <span>Cambios pendientes...</span>
            </div>
          )}
          {!saving && !hasChangesRef.current && study.entries.length > 0 && (
            <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 px-4 py-2 rounded-lg border border-green-500/30">
              <CheckCircle className="w-4 h-4" />
              <span>Todo guardado ✓</span>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar versículo */}
      <AlertDialog open={deleteEntryDialogOpen} onOpenChange={setDeleteEntryDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">¿Eliminar versículo?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Esta acción no se puede deshacer. Se eliminará permanentemente el versículo
              <strong className="text-white"> "{entryToDelete?.referencia}"</strong> de este estudio temático.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry} className="bg-red-600 hover:bg-red-700 text-white">
              Eliminar versículo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(TopicalStudyPage)
