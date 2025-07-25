"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Book,
  Search,
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Eye,
  Link as LinkIcon,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GradientCard } from "@/components/ui/gradient-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Devocional } from "@/lib/firestore"
import { Timestamp } from "firebase/firestore"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { useAuth } from "@/hooks/use-auth"

// Datos de ejemplo para que la página funcione de forma aislada
const getSampleDevocionals = (): Devocional[] => [
    {
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
            versionTexto: "rv1960",
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
        tags: ["Fe", "Gracia", "Amor"],
        completado: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        versionCitaBiblica: "rv1960",
      }
];


export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [devocionarios, setDevocionarios] = useState<Devocional[]>([]);
  const isAuthenticated = useAuth()
  
  useEffect(() => {
    setLoading(true);
    // Simulamos la carga de datos
    setTimeout(() => {
        setDevocionarios(getSampleDevocionals());
        setLoading(false);
    }, 500);
  }, []);

  const filteredDevocionarios = devocionarios.filter(
    (d) =>
      d.citaBiblica.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.textoDevocional.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.aprendizajeGeneral.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]"><LoadingSpinner /></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header mejorado */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard">
            <Button
              variant="outline"
              className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Búsqueda y Historial
            </h1>
            <p className="text-gray-400">Encuentra tus devocionarios anteriores</p>
          </div>

          <div className="w-48"></div> {/* Espaciador para mantener el título centrado */}
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
              <Link href={`/devocional/${devocional.id}`} key={devocional.id}>
                <GradientCard
                  className="group cursor-pointer hover:scale-[1.02] transition-all duration-300"
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
                              <div onClick={(e) => e.stopPropagation()}>
                                <BibleViewer
                                  reference={devocional.citaBiblica}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  }
                                />
                              </div>
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

                      <div className="flex items-center gap-4 pt-2 flex-wrap">
                        {devocional.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                            {tag}
                          </Badge>
                        ))}
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
              </Link>
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
                  <Link href="/devocional/new">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Devocional
                    </Button>
                  </Link>
                )}
              </CardContent>
            </GradientCard>
          )}
        </div>
      </div>
    </div>
  )
}
