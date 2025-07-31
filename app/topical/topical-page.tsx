"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Home, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { SearchAndFilter } from "@/app/topical/components/search-and-filter"
import { StudyStats } from "@/app/topical/components/study-stats"
import { StudyTemplates } from "@/app/topical/components/study-templates"
import { QuickPreview } from "@/app/topical/components/quick-preview"

// Mock data - replace with your actual data fetching
const mockStudies = [
  {
    id: "1",
    name: "El Amor de Dios",
    entries: [
      { id: "1", referencia: "Juan 3:16", learning: "Dios amó tanto al mundo...", versionTexto: "rv1960" },
      { id: "2", referencia: "1 Juan 4:8", learning: "Dios es amor", versionTexto: "rv1960" },
    ],
    userId: "user1",
    createdAt: { toDate: () => new Date("2024-01-15") },
    updatedAt: { toDate: () => new Date("2024-01-20") },
  },
  {
    id: "2",
    name: "Fe y Confianza",
    entries: [{ id: "3", referencia: "Hebreos 11:1", learning: "La fe es la certeza...", versionTexto: "rv1960" }],
    userId: "user1",
    createdAt: { toDate: () => new Date("2024-01-10") },
    updatedAt: { toDate: () => new Date("2024-01-18") },
  },
  {
    id: "3",
    name: "Sabiduría Divina",
    entries: [
      { id: "4", referencia: "Proverbios 9:10", learning: "El temor del Señor...", versionTexto: "rv1960" },
      {
        id: "5",
        referencia: "Santiago 1:5",
        learning: "Si alguno tiene falta de sabiduría...",
        versionTexto: "rv1960",
      },
      {
        id: "6",
        referencia: "1 Corintios 1:25",
        learning: "La locura de Dios es más sabia...",
        versionTexto: "rv1960",
      },
    ],
    userId: "user1",
    createdAt: { toDate: () => new Date("2024-01-05") },
    updatedAt: { toDate: () => new Date("2024-01-22") },
  },
]

export default function ImprovedTopicalPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Estados existentes
  const [studies, setStudies] = useState(mockStudies)
  const [loading, setLoading] = useState(false)
  const [newTopicName, setNewTopicName] = useState("")
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
  const [editingTopicName, setEditingTopicName] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<{ id: string; name: string } | null>(null)

  // Nuevos estados para mejoras
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"name" | "date" | "entries">("date")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filtrado y ordenamiento mejorado
  const filteredAndSortedStudies = useMemo(() => {
    let filtered = studies

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (study) =>
          study.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          study.entries.some(
            (entry) =>
              entry.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              entry.learning?.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    }

    // Filtro por categorías (simulado - en tu app real podrías tener categorías)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((study) =>
        selectedCategories.some((category) => study.name.toLowerCase().includes(category.toLowerCase())),
      )
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "entries":
          return b.entries.length - a.entries.length
        case "date":
        default:
          const dateA = a.updatedAt?.toDate() || new Date(0)
          const dateB = b.updatedAt?.toDate() || new Date(0)
          return dateB.getTime() - dateA.getTime()
      }
    })

    return filtered
  }, [studies, searchTerm, selectedCategories, sortBy])

  // Función para crear tema desde plantilla
  const handleCreateFromTemplate = (template: any) => {
    const newStudy = {
      id: Date.now().toString(),
      name: template.name,
      entries: template.entries.map((entry: any, index: number) => ({
        ...entry,
        id: `${Date.now()}-${index}`,
      })),
      userId: "user1",
      createdAt: { toDate: () => new Date() },
      updatedAt: { toDate: () => new Date() },
    }

    setStudies((prev) => [newStudy, ...prev])

    toast({
      title: "✅ Tema creado desde plantilla",
      description: `"${template.name}" ha sido creado con ${template.entries.length} versículos.`,
      duration: 3000,
    })

    router.push(`/topical/${newStudy.id}`)
  }

  // Funciones existentes (simplificadas para el ejemplo)
  const handleCreateNewTopic = () => {
    if (!newTopicName.trim()) {
      toast({
        title: "⚠️ Nombre requerido",
        description: "Por favor, ingresa un nombre para el tema.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const newStudy = {
      id: Date.now().toString(),
      name: newTopicName,
      entries: [],
      userId: "user1",
      createdAt: { toDate: () => new Date() },
      updatedAt: { toDate: () => new Date() },
    }

    setStudies((prev) => [newStudy, ...prev])
    setNewTopicName("")

    toast({
      title: "✅ Tema creado",
      description: `"${newTopicName}" ha sido creado exitosamente.`,
      duration: 3000,
    })

    router.push(`/topical/${newStudy.id}`)
  }

  const handleDeleteTopic = (study: any) => {
    setTopicToDelete({ id: study.id, name: study.name })
    setDeleteDialogOpen(true)
  }

  const confirmDeleteTopic = () => {
    if (!topicToDelete) return

    setStudies((prev) => prev.filter((s) => s.id !== topicToDelete.id))
    setDeleteDialogOpen(false)
    setTopicToDelete(null)

    toast({
      title: "✅ Estudio eliminado",
      description: `"${topicToDelete.name}" ha sido eliminado correctamente.`,
      duration: 3000,
    })
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header mejorado */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <Button
                variant="outline"
                className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
              >
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Estudio por Temas
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50"
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <StudyStats studies={studies} />

        {/* Crear nuevo tema mejorado */}
        <GradientCard gradient="blue" className="mb-8">
          <CardHeader>
            <CardTitle>Crear Nuevo Tema de Estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNewTopic()}
                placeholder="Ej: Fe, Amor, Salvación..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white flex-1"
              />
              <Button onClick={handleCreateNewTopic} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Crear Tema
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-gray-400 text-sm">o</div>
            </div>

            <div className="flex justify-center">
              <StudyTemplates onSelectTemplate={handleCreateFromTemplate} />
            </div>
          </CardContent>
        </GradientCard>

        {/* Búsqueda y filtros */}
        <div className="mb-8">
          <SearchAndFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
            sortBy={sortBy}
            onSortChange={setSortBy}
            entryCounts={Object.fromEntries(studies.map((s) => [s.id, s.entries.length]))}
          />
        </div>

        {/* Lista de temas mejorada */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Temas Existentes
              {filteredAndSortedStudies.length !== studies.length && (
                <span className="text-lg text-gray-400 ml-2">
                  ({filteredAndSortedStudies.length} de {studies.length})
                </span>
              )}
            </h2>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedStudies.map((study) => (
                <GradientCard key={study.id} className="group flex flex-col justify-between" gradient="blue">
                  <Link href={`/topical/${study.id}`} className="block flex-1">
                    <CardContent className="p-6 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-white pr-2">{study.name}</h3>
                        <QuickPreview study={study} />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-gray-400">
                          {study.entries.length} {study.entries.length === 1 ? "entrada" : "entradas"}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        Actualizado: {study.updatedAt?.toDate().toLocaleDateString("es-ES")}
                      </div>
                    </CardContent>
                  </Link>
                  <CardHeader className="p-2 border-t border-gray-700/50 flex-row justify-around">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTopicId(study.id)
                        setEditingTopicName(study.name)
                      }}
                      className="w-full justify-center gap-2 text-gray-400 hover:text-white"
                    >
                      <Pencil className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTopic(study)}
                      className="w-full justify-center gap-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  </CardHeader>
                </GradientCard>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedStudies.map((study) => (
                <GradientCard key={study.id} className="group" gradient="blue">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <Link href={`/topical/${study.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate">{study.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{study.entries.length} entradas</span>
                              <span>Actualizado: {study.updatedAt?.toDate().toLocaleDateString("es-ES")}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 ml-4">
                        <QuickPreview study={study} />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTopicId(study.id)
                            setEditingTopicName(study.name)
                          }}
                          className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTopic(study)}
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
          )}

          {filteredAndSortedStudies.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              {searchTerm || selectedCategories.length > 0 ? (
                <div>
                  <p className="text-lg mb-2">No se encontraron temas que coincidan con tu búsqueda</p>
                  <p className="text-sm">Intenta con otros términos o limpia los filtros</p>
                </div>
              ) : (
                <p>No hay temas de estudio aún. ¡Crea el primero!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmación para eliminar */}
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
            <AlertDialogAction onClick={confirmDeleteTopic} className="bg-red-600 hov   er:bg-red-700 text-white">
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
