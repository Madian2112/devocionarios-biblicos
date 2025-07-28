"use client"

import { useState, useEffect, useMemo } from "react"
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
import type { Devocional, TopicalStudy } from "@/lib/firestore"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { useAuthContext } from "@/context/auth-context"
import { firestoreService } from "@/lib/firestore"
import withAuth from "@/components/auth/with-auth"
import { useDisableMobileZoom } from '@/hooks/use-disable-mobile-zoom';

function SearchPage() {
  const { user } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [devocionales, setDevocionarios] = useState<Devocional[]>([]);
  const [topicalStudies, setTopicalStudies] = useState<TopicalStudy[]>([]);
  
  useDisableMobileZoom()

  useEffect(() => {
    async function loadAllData() {
        if (user) {
            setLoading(true);
            try {
                const [devos, topics] = await Promise.all([
                    firestoreService.getDevocionarios(user.uid),
                    firestoreService.getTopicalStudies(user.uid)
                ]);
                setDevocionarios(devos);
                setTopicalStudies(topics);
            } catch (error) {
                console.error("Error al cargar los datos para búsqueda:", error);
            } finally {
                setLoading(false);
            }
        }
    }
    loadAllData();
  }, [user]);

  const filteredDevocionarios = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();
    return devocionales.filter(
        (d) =>
        d.citaBiblica.toLowerCase().includes(lowerCaseSearch) ||
        d.textoDevocional.toLowerCase().includes(lowerCaseSearch) ||
        d.aprendizajeGeneral.toLowerCase().includes(lowerCaseSearch) ||
        d.tags?.some(tag => tag.toLowerCase().includes(lowerCaseSearch)),
    )
  }, [searchTerm, devocionales]);

  const filteredTopicalStudies = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();
    return topicalStudies.filter(t => t.name.toLowerCase().includes(lowerCaseSearch));
  }, [searchTerm, topicalStudies]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: 'UTC'
    })
  }

  const showResults = searchTerm.trim().length > 0;

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
            <p className="text-gray-400">Encuentra tus devocionales y estudios</p>
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
                placeholder="Buscar por cita, contenido, etiqueta o tema..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white pl-12 h-12 backdrop-blur-sm focus:border-blue-500 transition-colors text-lg"
              />
            </div>
          </CardContent>
        </GradientCard>

        {/* Resultados */}
        <div className="space-y-8">
          {loading ? (
            <GradientCard>
              <CardContent className="text-center py-16">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-400">Cargando datos...</p>
              </CardContent>
            </GradientCard>
          ) : showResults ? (
            <>
              {/* Resultados en Devocionales */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Resultados en Devocionales ({filteredDevocionarios.length})</h2>
                {filteredDevocionarios.length > 0 ? (
                  filteredDevocionarios.map((devocional) => (
                    <div key={devocional.id} className="mb-6">
                      <Link href={`/devocional/${devocional.fecha}`}>
                        <GradientCard className="group cursor-pointer hover:scale-[1.02] transition-all duration-300">
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
                            </div>
                          </CardContent>
                        </GradientCard>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No se encontraron resultados en tus devocionales.</p>
                )}
              </div>

              {/* Resultados en Estudios por Tema */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Resultados en Estudios por Tema ({filteredTopicalStudies.length})</h2>
                {filteredTopicalStudies.length > 0 ? (
                  filteredTopicalStudies.map((study) => (
                    <div key={study.id} className="mb-6">
                      <Link href={`/topical/${study.id}`}>
                        <GradientCard className="group cursor-pointer hover:scale-[1.02] transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="text-white group-hover:text-blue-400 transition-colors">{study.name}</CardTitle>
                            <CardDescription className="text-gray-400">{study.entries.length} entradas</CardDescription>
                          </CardHeader>
                        </GradientCard>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No se encontraron resultados en tus estudios por tema.</p>
                )}
              </div>
            </>
          ) : (
            <GradientCard>
              <CardContent className="text-center py-16">
                <div className="p-4 bg-gray-500/10 rounded-full w-fit mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Busca en todo tu historial
                </h3>
                <p className="text-gray-400 mb-6">
                  Escribe en la barra de arriba para encontrar lo que buscas.
                </p>
              </CardContent>
            </GradientCard>
          )}
        </div>
      </div>
    </div>
  )
}

export default withAuth(SearchPage);
