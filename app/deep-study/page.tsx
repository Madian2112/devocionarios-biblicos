"use client"

import { useState } from "react"
import withAuth from "@/components/auth/with-auth"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Grid, List, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SmartSyncButton } from "@/components/cache/boton-inteligente"
import { useDeepStudies } from "@/hooks/use-deep-studies"
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom"
import { Badge } from "@/components/ui/badge"
import { GradientCard } from "@/components/ui/gradient-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/use-toast"
import { DeepStudy } from "@/lib/interfaces/deep-study"
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

function DeepStudyPage() {
  const router = useRouter()
  const { studies, loading, saveStudy, deleteStudy, syncStudies } = useDeepStudies()

  // Estados locales
  const [newStudyTitle, setNewStudyTitle] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [studyToDelete, setStudyToDelete] = useState<{ id: string; title: string } | null>(null)

  useDisableMobileZoom()

  // Filtrar estudios por término de búsqueda
  const filteredStudies = studies.filter(study =>
    study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    study.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    study.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Crear nuevo estudio
  const handleCreateNewStudy = async () => {
    if (!newStudyTitle.trim()) {
      toast({
        title: "⚠️ Título requerido",
        description: "Por favor, ingresa un título para el estudio.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const newStudy: Omit<DeepStudy, "createdAt" | "updatedAt" | "userId"> = {
      id: Date.now().toString(),
      title: newStudyTitle.trim(),
      description: "",
      subPoints: [],
      orderIndex: studies.length,
    }

    try {
      const savedStudy = await saveStudy(newStudy)
      if (savedStudy) {
        setNewStudyTitle("")
        toast({
          title: "✅ Estudio creado",
          description: `"${newStudyTitle}" ha sido creado exitosamente.`,
          duration: 3000,
        })
        router.push(`/deep-study/${savedStudy.id}`)
      }
    } catch (error) {
      console.error('Error al crear el estudio:', error)
      toast({
        title: "❌ Error al crear",
        description: "No se pudo crear el estudio. Por favor, intenta de nuevo.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Eliminar estudio
  const handleDeleteStudy = (study: DeepStudy) => {
    setStudyToDelete({ id: study.id, title: study.title })
    setDeleteDialogOpen(true)
  }

  const confirmDeleteStudy = async () => {
    if (!studyToDelete) return

    const success = await deleteStudy(studyToDelete.id)
    if (success) {
      toast({
        title: "✅ Estudio eliminado",
        description: `"${studyToDelete.title}" ha sido eliminado correctamente.`,
        duration: 3000,
      })
    }
    setDeleteDialogOpen(false)
    setStudyToDelete(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-7xl">
      {/* Encabezado con título y botón de sincronización */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">Estudios Profundos</h1>
        <SmartSyncButton className="ml-4" onClick={syncStudies} />
      </div>

      {/* Crear nuevo estudio */}
      <GradientCard gradient="purple" className="mb-8">
        <CardHeader>
          <CardTitle>Crear Nuevo Estudio Profundo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              value={newStudyTitle}
              onChange={(e) => setNewStudyTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateNewStudy()}
              placeholder="Ej: La venida del Señor, El perdón de Pablo..."
              className="bg-[#2a2a2a]/50 border-gray-700 text-white flex-1"
            />
            <Button
              onClick={handleCreateNewStudy}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Estudio
            </Button>
          </div>
        </CardContent>
      </GradientCard>

      {/* Barra de búsqueda y controles */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar estudios..."
            className="pl-10 bg-[#2a2a2a]/50 border-gray-700 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-gray-700" : ""}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-gray-700" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de estudios */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        {filteredStudies.map((study) => (
          <GradientCard
            key={study.id}
            gradient="purple"
            className="group transition-all hover:scale-[1.02] cursor-pointer"
            onClick={() => router.push(`/deep-study/${study.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{study.title}</h3>
                  {study.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{study.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      {study.subPoints?.length || 0} subtemas
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteStudy(study)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </GradientCard>
        ))}
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar estudio?</AlertDialogTitle>
            <AlertDialogDescription>
              {studyToDelete
                ? `¿Estás seguro de que deseas eliminar "${studyToDelete.title}"? Esta acción no se puede deshacer.`
                : "Selecciona un estudio para eliminar."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteStudy}
              className="bg-red-500 hover:bg-red-600"
              disabled={!studyToDelete}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(DeepStudyPage)