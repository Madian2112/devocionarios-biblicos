"use client"
import { useState, useEffect, useCallback, useRef, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  Book,
  Clock,
  CheckCircle,
  ListOrdered,
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
import withAuth from "@/components/auth/with-auth"
import { useToast } from "@/hooks/use-toast"
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom"
import { useTopicalStudies } from "@/hooks/use-sincronizar-temas"
import { smartSyncFirestoreService } from "@/lib/services/sincronizacion-inteligente-firestore"

// Componente para cada entrada del estudio
interface StudyEntryItemProps {
  entry: StudyEntry
  onUpdate: (updatedEntry: StudyEntry) => void
  onRemove: (entryId: string) => void
  onMoveUp: (entryId: string) => void
  onMoveDown: (entryId: string) => void
  isFirst: boolean
  isLast: boolean
  isOrderingMode: boolean
}

function StudyEntryItem({
  entry,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isOrderingMode,
}: StudyEntryItemProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <Collapsible
      className="group"
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Trigger auto-save when collapsible closes
          // This is handled by the parent component now, but keeping the structure
        }
      }}
    >
      <GradientCard gradient="blue">
        <div className="flex w-full items-center p-4">
          {/* Botones de reordenamiento */}
          {(isOrderingMode || !isMobile) && (
            <div className="flex flex-col gap-1 mr-2 sm:mr-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMoveUp(entry.id)}
                disabled={isFirst}
                className="h-6 w-6 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
                tabIndex={-1}
              >
                <ChevronUp className="h-4 w-4 focus:outline-none focus:ring-0" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onMoveDown(entry.id)}
                disabled={isLast}
                className="h-6 w-6 text-gray-300 hover:bg-gray-700/50 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-0"
                tabIndex={-1}
              >
                <ChevronDown className="h-4 w-4 focus:outline-none focus:ring-0" />
              </Button>
            </div>
          )}

          <CollapsibleTrigger className="flex flex-1 text-left min-w-0 items-center justify-between focus:outline-none focus:ring-0">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{entry.referencia || "Sin referencia"}</p>
              <p className="text-sm text-gray-400 truncate mt-1">{entry.learning || "Sin aprendizaje"}</p>
            </div>
            <ChevronDown className="h-5 w-5 text-white transition-transform duration-300 group-data-[state=open]:rotate-180 ml-2 flex-shrink-0 focus:outline-none focus:ring-0" />
          </CollapsibleTrigger>
          {entry.referencia && (
            <div className="ml-2 flex-shrink-0">
              <BibleViewer
                reference={entry.referencia}
                defaultVersion={entry.versionTexto}
                onClose={async (selectedVersion) => {
                  // This part might need to be handled by the parent if saving state is critical
                  // For now, it updates the entry directly
                  onUpdate({ ...entry, versionTexto: selectedVersion })
                }}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 focus:outline-none focus:ring-0">
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
              <label htmlFor={`reference-${entry.id}`} className="block text-sm font-medium text-gray-300 mb-3">
                Referencia(s) Bíblica(s)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    id={`reference-${entry.id}`}
                    value={entry.referencia}
                    onChange={(e) => onUpdate({ ...entry, referencia: e.target.value })}
                    placeholder="Ej: Juan 3:16 o 1 Corintios 13:4-7"
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white"
                  />
                </div>
                <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                  {entry.versionTexto?.toUpperCase() || "RV1960"}
                </Badge>
                <BibleSelector
                  onSelect={(ref) => {
                    onUpdate({ ...entry, referencia: ref, versionTexto: "rv1960" })
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
                  onClick={() => onRemove(entry.id)}
                  className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
            <div>
              <label htmlFor={`learning-${entry.id}`} className="block text-sm font-medium text-gray-300 mb-3 mt-6">
                Apuntes y Aprendizaje
              </label>
              <Textarea
                id={`learning-${entry.id}`}
                value={entry.learning}
                onChange={(e) => onUpdate({ ...entry, learning: e.target.value })}
                placeholder="Escribe aquí tus reflexiones sobre este pasaje..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[150px]"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </GradientCard>
    </Collapsible>
  )
}

function TopicalStudyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  const { id } = use(params) // params is directly an object
  const isNew = id === "new"

  const [study, setStudy] = useState<TopicalStudy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasChangesRef = useRef(false)
  const [deleteEntryDialogOpen, setDeleteEntryDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<{ id: string; referencia: string } | null>(null)
  const [isOrderingMode, setIsOrderingMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const { saveStudy } = useTopicalStudies()

  useDisableMobileZoom()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  const handleMoveEntry = (entryId: string, direction: "up" | "down") => {
    if (!study) return

    const currentIndex = study.entries.findIndex((entry) => entry.id === entryId)
    if (currentIndex === -1) return

    let newIndex = currentIndex
    if (direction === "up") {
      newIndex = Math.max(0, currentIndex - 1)
    } else if (direction === "down") {
      newIndex = Math.min(study.entries.length - 1, currentIndex + 1)
    }

    if (newIndex === currentIndex) return // No change needed

    const newEntries = [...study.entries]
    const [movedEntry] = newEntries.splice(currentIndex, 1)
    newEntries.splice(newIndex, 0, movedEntry)

    handleStudyChange("entries", newEntries)
    toast({
      title: "✅ Orden actualizado",
      description: "Las entradas han sido reordenadas",
      duration: 2000,
    })
  }

  const handleToggleOrderingMode = () => {
    setIsOrderingMode((prev) => {
      const newState = !prev
      if (!newState) {
        // If turning off ordering mode, trigger auto-save
        autoSave()
      }
      return newState
    })
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
            {isMobile && (
              <Button
                onClick={handleToggleOrderingMode}
                variant="outline"
                className={`flex-1 sm:flex-none focus:outline-none focus:ring-0 ${isOrderingMode ? "bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30" : "bg-gray-700/20 text-gray-300 border-gray-700/30 hover:bg-gray-700/30"}`}
                tabIndex={-1}
              >
                <ListOrdered className="h-4 w-4 sm:mr-2 focus:outline-none focus:ring-0" />
                {isOrderingMode ? "Terminar" : "Ordenar"}
              </Button>
            )}
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

        {/* Contenido de las entradas */}
        <div className="space-y-4">
          {study.entries.map((entry, index) => (
            <StudyEntryItem
              key={entry.id}
              entry={entry}
              onUpdate={handleUpdateStudyEntry}
              onRemove={handleRemoveStudyEntry}
              onMoveUp={(idToMove) => handleMoveEntry(idToMove, "up")}
              onMoveDown={(idToMove) => handleMoveEntry(idToMove, "down")}
              isFirst={index === 0}
              isLast={index === study.entries.length - 1}
              isOrderingMode={isOrderingMode}
            />
          ))}
        </div>

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
