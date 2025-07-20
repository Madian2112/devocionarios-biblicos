"use client"

import { useState, useEffect } from "react"
import {
  Calendar,
  Book,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Heart,
  LinkIcon,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  ExternalLink,
  Quote,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GradientCard } from "@/components/ui/gradient-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Devocional, Versiculo, Referencia } from "@/lib/firestore"
import { Timestamp } from "firebase/firestore"
import { BibleSelector } from "@/components/bible/bible-selector"
import { BibleViewer } from "@/components/bible/bible-viewer"

export default function DevocionariosApp() {
  const [currentView, setCurrentView] = useState<"dashboard" | "devocional" | "busqueda">("dashboard")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [devocionarios, setDevocionarios] = useState<Devocional[]>([])
  const [currentDevocional, setCurrentDevocional] = useState<Devocional | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Cargar devocionarios desde Firebase
  useEffect(() => {
    loadDevocionarios()
  }, [])

  const loadDevocionarios = async () => {
    setLoading(true)
    try {
      // Simulamos datos para el ejemplo ya que Firebase requiere configuración
      const ejemploDevocional: Devocional = {
        id: "1",
        fecha: new Date().toISOString().split("T")[0],
        citaBiblica: "Juan 3:16",
        textoDevocional:
          "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna. Este versículo nos muestra el amor incondicional de Dios hacia la humanidad.",
        aprendizajeGeneral:
          "El amor de Dios es incondicional y eterno. Su sacrificio nos muestra la profundidad de su amor por la humanidad. Debemos responder a este amor con gratitud y obediencia.",
        versiculos: [
          {
            id: "v1",
            referencia: "Juan 3:16",
            texto:
              "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
            aprendizaje:
              "El amor de Dios trasciende todo entendimiento humano y se manifiesta en el sacrificio de Cristo.",
          },
        ],
        referencias: [
          {
            id: "r1",
            url: "https://example.com/estudio-juan-3-16",
            descripcion: "Comentario bíblico profundo sobre el amor de Dios y el significado del sacrificio de Cristo",
            versiculoId: "v1",
          },
        ],
        completado: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }
      setDevocionarios([ejemploDevocional])
    } catch (error) {
      console.error("Error loading devocionarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate)
    if (direction === "prev") {
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    setSelectedDate(currentDate.toISOString().split("T")[0])
  }

  const createNewDevocional = () => {
    const newDevocional: Devocional = {
      id: Date.now().toString(),
      fecha: selectedDate,
      citaBiblica: "",
      textoDevocional: "",
      aprendizajeGeneral: "",
      versiculos: [],
      referencias: [],
      completado: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    setCurrentDevocional(newDevocional)
    setCurrentView("devocional")
  }

  const saveDevocional = async (devocional: Devocional) => {
    setSaving(true)
    try {
      // En producción usarías: await firestoreService.saveDevocional(devocional)
      setDevocionarios((prev) => {
        const existing = prev.findIndex((d) => d.id === devocional.id)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { ...devocional, updatedAt: Timestamp.now() }
          return updated
        }
        return [...prev, { ...devocional, createdAt: Timestamp.now(), updatedAt: Timestamp.now() }]
      })
    } catch (error) {
      console.error("Error saving devocional:", error)
    } finally {
      setSaving(false)
    }
  }

  const addVersiculo = () => {
    if (!currentDevocional) return
    const newVersiculo: Versiculo = {
      id: Date.now().toString(),
      referencia: "",
      texto: "",
      aprendizaje: "",
    }
    setCurrentDevocional({
      ...currentDevocional,
      versiculos: [...currentDevocional.versiculos, newVersiculo],
    })
  }

  const removeVersiculo = (id: string) => {
    if (!currentDevocional) return
    setCurrentDevocional({
      ...currentDevocional,
      versiculos: currentDevocional.versiculos.filter((v) => v.id !== id),
    })
  }

  const addReferencia = () => {
    if (!currentDevocional) return
    const newReferencia: Referencia = {
      id: Date.now().toString(),
      url: "",
      descripcion: "",
    }
    setCurrentDevocional({
      ...currentDevocional,
      referencias: [...currentDevocional.referencias, newReferencia],
    })
  }

  const removeReferencia = (id: string) => {
    if (!currentDevocional) return
    setCurrentDevocional({
      ...currentDevocional,
      referencias: currentDevocional.referencias.filter((r) => r.id !== id),
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const filteredDevocionarios = devocionarios.filter(
    (d) =>
      d.citaBiblica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.textoDevocional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.aprendizajeGeneral.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    completados: devocionarios.filter((d) => d.completado).length,
    versiculos: devocionarios.reduce((acc, d) => acc + d.versiculos.length, 0),
    referencias: devocionarios.reduce((acc, d) => acc + d.referencias.length, 0),
    racha: 5, // Calcular racha real
  }

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header mejorado */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Devocionarios Bíblicos
                </h1>
                <p className="text-gray-400 text-base sm:text-lg">Registra tus reflexiones y crece espiritualmente</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentView("busqueda")}
                variant="outline"
                className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button
                onClick={createNewDevocional}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Devocional
              </Button>
            </div>
          </div>

          {/* Estadísticas mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <GradientCard gradient="blue" className="group hover:scale-105 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Días Completados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.completados}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                    <CheckCircle2 className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </GradientCard>

            <GradientCard gradient="purple" className="group hover:scale-105 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Versículos Estudiados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.versiculos}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                    <Book className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </GradientCard>

            <GradientCard gradient="green" className="group hover:scale-105 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Referencias</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.referencias}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                    <LinkIcon className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </GradientCard>

            <GradientCard gradient="orange" className="group hover:scale-105 transition-transform">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Racha Actual</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.racha}</p>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </GradientCard>
          </div>

          {/* Selector de Fecha mejorado */}
          <GradientCard className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                Seleccionar Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange("prev")}
                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="text-center flex-1 mx-6">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white text-center backdrop-blur-sm max-w-xs mx-auto"
                  />
                  <p className="text-sm text-gray-400 mt-2 capitalize font-medium">{formatDate(selectedDate)}</p>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange("next")}
                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 backdrop-blur-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </GradientCard>

          {/* Devocional del Día mejorado */}
          <GradientCard gradient="blue">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                  </div>
                  <span>Devocional del Día</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {devocionarios.find((d) => d.fecha === selectedDate) ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completado
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const devocional = devocionarios.find((d) => d.fecha === selectedDate)
                        if (devocional) {
                          setCurrentDevocional(devocional)
                          setCurrentView("devocional")
                        }
                      }}
                      className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 backdrop-blur-sm"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Ver Devocional
                    </Button>
                  </div>

                  <div className="bg-[#1a1a1a]/50 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <Quote className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-lg">
                            {devocionarios.find((d) => d.fecha === selectedDate)?.citaBiblica}
                          </h3>
                          {devocionarios.find((d) => d.fecha === selectedDate)?.citaBiblica && (
                            <BibleViewer
                              reference={devocionarios.find((d) => d.fecha === selectedDate)?.citaBiblica || ""}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {devocionarios.find((d) => d.fecha === selectedDate)?.aprendizajeGeneral}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-500/10 rounded-full w-fit mx-auto mb-6">
                    <Book className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No hay devocional para esta fecha</h3>
                  <p className="text-gray-400 mb-6">Comienza tu reflexión diaria creando un nuevo devocional</p>
                  <Button
                    onClick={createNewDevocional}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Devocional
                  </Button>
                </div>
              )}
            </CardContent>
          </GradientCard>

          {/* Historial Reciente mejorado */}
          {devocionarios.length > 0 && (
            <GradientCard className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-400" />
                  </div>
                  Historial Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devocionarios.slice(0, 5).map((devocional) => (
                    <div
                      key={devocional.id}
                      className="group flex items-center justify-between p-4 bg-[#1a1a1a]/30 rounded-xl cursor-pointer hover:bg-[#2a2a2a]/50 transition-all duration-300 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50"
                      onClick={() => {
                        setCurrentDevocional(devocional)
                        setCurrentView("devocional")
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                          <BookOpen className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                            {devocional.citaBiblica}
                          </p>
                          <p className="text-sm text-gray-400 capitalize">{formatDate(devocional.fecha)}</p>
                        </div>
                      </div>
                      <Badge
                        variant={devocional.completado ? "secondary" : "outline"}
                        className={
                          devocional.completado
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "border-gray-600 text-gray-400"
                        }
                      >
                        {devocional.completado ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completado
                          </>
                        ) : (
                          <>
                            <Circle className="h-3 w-3 mr-1" />
                            Pendiente
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </GradientCard>
          )}
        </div>
      </div>
    )
  }

  if (currentView === "devocional" && currentDevocional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Header mejorado */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentView("dashboard")}
              className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {/* Volver al Dashboard */}
            </Button>

            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white capitalize mb-1">{formatDate(currentDevocional.fecha)}</h1>
              <p className="text-gray-400">Devocional Diario</p>
            </div>

            <Button
              onClick={() => {
                saveDevocional({ ...currentDevocional, completado: true })
                setCurrentView("dashboard")
              }}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>

          {/* Información Básica mejorada */}
          <GradientCard gradient="blue" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                Información del Devocional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Cita Bíblica Principal</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      value={currentDevocional.citaBiblica}
                      onChange={(e) =>
                        setCurrentDevocional({
                          ...currentDevocional,
                          citaBiblica: e.target.value,
                        })
                      }
                      placeholder="Ej: Juan 3:16"
                      className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <BibleSelector
                    onSelect={(reference) =>
                      setCurrentDevocional({
                        ...currentDevocional,
                        citaBiblica: reference,
                      })
                    }
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
                  {currentDevocional.citaBiblica && (
                    <BibleViewer
                      reference={currentDevocional.citaBiblica}
                      trigger={
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Texto del Devocional</label>
                <Textarea
                  value={currentDevocional.textoDevocional}
                  onChange={(e) =>
                    setCurrentDevocional({
                      ...currentDevocional,
                      textoDevocional: e.target.value,
                    })
                  }
                  placeholder="Escribe o pega el contenido del devocional aquí..."
                  className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[150px] backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </CardContent>
          </GradientCard>

          {/* Tabs mejorados */}
          <Tabs defaultValue="aprendizaje" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a]/50 border border-gray-800/50 backdrop-blur-sm p-1">
              <TabsTrigger
                value="aprendizaje"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white text-gray-400 transition-all"
              >
                <Heart className="h-4 w-4 mr-2" />
                Aprendizaje
              </TabsTrigger>
              <TabsTrigger
                value="versiculos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white text-gray-400 transition-all"
              >
                <Book className="h-4 w-4 mr-2" />
                Versículos
              </TabsTrigger>
              <TabsTrigger
                value="referencias"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-white text-gray-400 transition-all"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Referencias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aprendizaje">
              <GradientCard gradient="purple">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Heart className="h-5 w-5 text-red-400" />
                    </div>
                    Aprendizaje General
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Escribe el aprendizaje principal que obtuviste de este devocional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={currentDevocional.aprendizajeGeneral}
                    onChange={(e) =>
                      setCurrentDevocional({
                        ...currentDevocional,
                        aprendizajeGeneral: e.target.value,
                      })
                    }
                    placeholder="¿Qué aprendiste hoy? ¿Cómo puedes aplicar este mensaje en tu vida diaria? ¿Qué cambios quieres hacer?"
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[200px] backdrop-blur-sm focus:border-purple-500 transition-colors resize-none"
                  />
                </CardContent>
              </GradientCard>
            </TabsContent>

            <TabsContent value="versiculos">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Book className="h-5 w-5 text-blue-400" />
                    </div>
                    Versículos Específicos
                  </h3>
                  <Button
                    onClick={addVersiculo}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Versículo
                  </Button>
                </div>

                {currentDevocional.versiculos.map((versiculo, index) => (
                  <GradientCard key={versiculo.id} gradient="blue" className="group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-sm font-medium">
                            #{index + 1}
                          </span>
                          Versículo {index + 1}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeVersiculo(versiculo.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Referencia Bíblica</label>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Input
                              value={versiculo.referencia}
                              onChange={(e) => {
                                const updatedVersiculos = [...currentDevocional.versiculos]
                                updatedVersiculos[index] = { ...versiculo, referencia: e.target.value }
                                setCurrentDevocional({
                                  ...currentDevocional,
                                  versiculos: updatedVersiculos,
                                })
                              }}
                              placeholder="Ej: Salmos 23:1"
                              className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <BibleSelector
                            onSelect={(reference) => {
                              const updatedVersiculos = [...currentDevocional.versiculos]
                              updatedVersiculos[index] = { ...versiculo, referencia: reference }
                              setCurrentDevocional({
                                ...currentDevocional,
                                versiculos: updatedVersiculos,
                              })
                            }}
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                              >
                                <Book className="h-4 w-4" />
                              </Button>
                            }
                          />
                          {versiculo.referencia && (
                            <BibleViewer
                              reference={versiculo.referencia}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Texto del Versículo</label>
                        <Textarea
                          value={versiculo.texto}
                          onChange={(e) => {
                            const updatedVersiculos = [...currentDevocional.versiculos]
                            updatedVersiculos[index] = { ...versiculo, texto: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              versiculos: updatedVersiculos,
                            })
                          }}
                          placeholder="Texto completo del versículo..."
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Aprendizaje del Versículo
                        </label>
                        <Textarea
                          value={versiculo.aprendizaje}
                          onChange={(e) => {
                            const updatedVersiculos = [...currentDevocional.versiculos]
                            updatedVersiculos[index] = { ...versiculo, aprendizaje: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              versiculos: updatedVersiculos,
                            })
                          }}
                          placeholder="¿Qué te enseña este versículo específicamente? ¿Cómo se relaciona con tu vida?"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                    </CardContent>
                  </GradientCard>
                ))}

                {currentDevocional.versiculos.length === 0 && (
                  <GradientCard>
                    <CardContent className="text-center py-16">
                      <div className="p-4 bg-blue-500/10 rounded-full w-fit mx-auto mb-6">
                        <Book className="h-12 w-12 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No hay versículos agregados</h3>
                      <p className="text-gray-400 mb-6">Agrega versículos específicos para profundizar en tu estudio</p>
                      <Button
                        onClick={addVersiculo}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Versículo
                      </Button>
                    </CardContent>
                  </GradientCard>
                )}
              </div>
            </TabsContent>

            <TabsContent value="referencias">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <LinkIcon className="h-5 w-5 text-green-400" />
                    </div>
                    Referencias y Enlaces
                  </h3>
                  <Button
                    onClick={addReferencia}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Referencia
                  </Button>
                </div>

                {currentDevocional.referencias.map((referencia, index) => (
                  <GradientCard key={referencia.id} gradient="green" className="group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-sm font-medium">
                            #{index + 1}
                          </span>
                          Referencia {index + 1}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {referencia.url && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => window.open(referencia.url, "_blank")}
                              className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
                            >
                              <ExternalLink className="h-4 w-4 text-blue-400" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeReferencia(referencia.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">URL del Enlace</label>
                        <Input
                          value={referencia.url}
                          onChange={(e) => {
                            const updatedReferencias = [...currentDevocional.referencias]
                            updatedReferencias[index] = { ...referencia, url: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              referencias: updatedReferencias,
                            })
                          }}
                          placeholder="https://ejemplo.com/estudio-biblico"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Descripción</label>
                        <Textarea
                          value={referencia.descripcion}
                          onChange={(e) => {
                            const updatedReferencias = [...currentDevocional.referencias]
                            updatedReferencias[index] = { ...referencia, descripcion: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              referencias: updatedReferencias,
                            })
                          }}
                          placeholder="¿Qué información útil encontraste en este enlace? ¿Cómo complementa tu estudio?"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-green-500 transition-colors resize-none"
                        />
                      </div>
                    </CardContent>
                  </GradientCard>
                ))}

                {currentDevocional.referencias.length === 0 && (
                  <GradientCard>
                    <CardContent className="text-center py-16">
                      <div className="p-4 bg-green-500/10 rounded-full w-fit mx-auto mb-6">
                        <LinkIcon className="h-12 w-12 text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No hay referencias agregadas</h3>
                      <p className="text-gray-400 mb-6">
                        Agrega enlaces y recursos que complementen tu estudio bíblico
                      </p>
                      <Button
                        onClick={addReferencia}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primera Referencia
                      </Button>
                    </CardContent>
                  </GradientCard>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  if (currentView === "busqueda") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Header mejorado */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentView("dashboard")}
              className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {/* Volver al Dashboard */}
            </Button>

            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Búsqueda y Historial
              </h1>
              <p className="text-gray-400">Encuentra tus devocionarios anteriores</p>
            </div>

            <div className="w-32"></div>
          </div>

          {/* Buscador mejorado */}
          <GradientCard gradient="blue" className="mb-8">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por cita bíblica, contenido o aprendizaje..."
                  className="bg-[#2a2a2a]/50 border-gray-700 text-white pl-12 h-12 backdrop-blur-sm focus:border-blue-500 transition-colors text-lg"
                />
              </div>
            </CardContent>
          </GradientCard>

          {/* Resultados mejorados */}
          <div className="space-y-6">
            {loading ? (
              <GradientCard>
                <CardContent className="text-center py-16">
                  <LoadingSpinner size="lg" className="mx-auto mb-4" />
                  <p className="text-gray-400">Cargando devocionarios...</p>
                </CardContent>
              </GradientCard>
            ) : filteredDevocionarios.length > 0 ? (
              filteredDevocionarios.map((devocional) => (
                <GradientCard
                  key={devocional.id}
                  className="group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                  onClick={() => {
                    setCurrentDevocional(devocional)
                    setCurrentView("devocional")
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                          <BookOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                              {devocional.citaBiblica}
                            </CardTitle>
                            {devocional.citaBiblica && (
                              <BibleViewer
                                reference={devocional.citaBiblica}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                }
                              />
                            )}
                          </div>
                          <CardDescription className="text-gray-400 capitalize">
                            {formatDate(devocional.fecha)}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={devocional.completado ? "secondary" : "outline"}
                        className={
                          devocional.completado
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "border-gray-600 text-gray-400"
                        }
                      >
                        {devocional.completado ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completado
                          </>
                        ) : (
                          <>
                            <Circle className="h-3 w-3 mr-1" />
                            Pendiente
                          </>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-[#1a1a1a]/30 rounded-lg p-4 mb-4">
                      <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">{devocional.textoDevocional}</p>
                    </div>

                    <Separator className="my-4 bg-gray-700/50" />

                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aprendizaje:</span>
                        <p className="text-gray-400 text-sm line-clamp-2 mt-1 leading-relaxed">
                          {devocional.aprendizajeGeneral}
                        </p>
                      </div>

                      {(devocional.versiculos.length > 0 || devocional.referencias.length > 0) && (
                        <div className="flex items-center gap-4 pt-2">
                          {devocional.versiculos.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Book className="h-3 w-3" />
                              <span>
                                {devocional.versiculos.length} versículo{devocional.versiculos.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                          {devocional.referencias.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <LinkIcon className="h-3 w-3" />
                              <span>
                                {devocional.referencias.length} referencia
                                {devocional.referencias.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </GradientCard>
              ))
            ) : (
              <GradientCard>
                <CardContent className="text-center py-16">
                  <div className="p-4 bg-gray-500/10 rounded-full w-fit mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchTerm ? "No se encontraron resultados" : "No hay devocionarios guardados"}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {searchTerm
                      ? "Intenta con otros términos de búsqueda o revisa la ortografía"
                      : "Crea tu primer devocional para comenzar tu jornada espiritual"}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() => setCurrentView("dashboard")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Devocional
                    </Button>
                  )}
                </CardContent>
              </GradientCard>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
