"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { BookOpen, Search, ChevronLeft, CheckCircle2, Circle, Eye, CalendarDays, Filter, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { GradientCard } from "@/components/ui/gradient-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { Devocional } from "@/lib/firestore"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { useAuthContext } from "@/context/auth-context"
import withAuth from "@/components/auth/with-auth"
import { useDisableMobileZoom } from "@/hooks/use-disable-mobile-zoom"
import { smartSyncFirestoreService } from "@/lib/services/sincronizacion-inteligente-firestore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useDevocionales } from "@/hooks/use-devocionales"
import { useRouter } from "next/router"

type SortOrder = "asc" | "desc"
type CompletionFilter = "all" | "completed" | "pending"

// Simplified list of common Spanish Bible book prefixes for extraction
const bibleBookPrefixes = [
  "Génesis",
  "Éxodo",
  "Levítico",
  "Números",
  "Deuteronomio",
  "Josué",
  "Jueces",
  "Rut",
  "1 Samuel",
  "2 Samuel",
  "1 Reyes",
  "2 Reyes",
  "1 Crónicas",
  "2 Crónicas",
  "Esdras",
  "Nehemías",
  "Ester",
  "Job",
  "Salmos",
  "Proverbios",
  "Eclesiastés",
  "Cantares",
  "Isaías",
  "Jeremías",
  "Lamentaciones",
  "Ezequiel",
  "Daniel",
  "Oseas",
  "Joel",
  "Amós",
  "Abdías",
  "Jonás",
  "Miqueas",
  "Nahúm",
  "Habacuc",
  "Sofonías",
  "Hageo",
  "Zacarías",
  "Malaquías",
  "Mateo",
  "Marcos",
  "Lucas",
  "Juan",
  "Hechos",
  "Romanos",
  "1 Corintios",
  "2 Corintios",
  "Gálatas",
  "Efesios",
  "Filipenses",
  "Colosenses",
  "1 Tesalonicenses",
  "2 Tesalonicenses",
  "1 Timoteo",
  "2 Timoteo",
  "Tito",
  "Filemón",
  "Hebreos",
  "Santiago",
  "1 Pedro",
  "2 Pedro",
  "1 Juan",
  "2 Juan",
  "3 Juan",
  "Judas",
  "Apocalipsis",
]

function extractBookName(citation: string): string | null {
  if (!citation) return null
  const lowerCaseCitation = citation.toLowerCase()
  for (const book of bibleBookPrefixes) {
    // Check for exact match at the beginning of the citation
    if (lowerCaseCitation.startsWith(book.toLowerCase())) {
      // Ensure it's not just a partial match of a longer book name (e.g., "1 Samuel" vs "Samuel")
      // This simple check assumes book names are distinct enough or ordered correctly
      // For more robust parsing, a regex with word boundaries might be needed.
      return book
    }
  }
  return null
}

const SCROLL_POSITION_KEY = 'devocionales_scroll_position';

// Hook personalizado para manejo inteligente de scroll
const useIntelligentScroll = () => {
  const scrollToElement = (elementId: string, options: {
    behavior?: ScrollBehavior
    block?: ScrollLogicalPosition
    hideScrollBars?: boolean
    showLoadingState?: boolean
  } = {}) => {
    const {
      behavior = 'auto',
      block = 'center',
      hideScrollBars = true,
      showLoadingState = false
    } = options;
    
    return new Promise<void>((resolve) => {
      // Ocultar scroll bars temporalmente si se requiere
      if (hideScrollBars) {
        document.documentElement.style.scrollBehavior = 'auto';
        document.body.style.overflow = 'hidden';
      }
      
      requestAnimationFrame(() => {
        const element = document.getElementById(elementId);
        
        if (element) {
          // Verificar si el elemento ya está visible
          const rect = element.getBoundingClientRect();
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
          
          if (!isVisible) {
            element.scrollIntoView({ behavior, block });
          }
        }
        
        // Restaurar scroll bars después del siguiente frame
        if (hideScrollBars) {
          requestAnimationFrame(() => {
            document.body.style.overflow = '';
            document.documentElement.style.scrollBehavior = '';
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  };
  
  return { scrollToElement };
};

// Componente de Loading mejorado
const RestorePositionOverlay = ({ isRestoring }: { isRestoring: boolean }) => {
  if (!isRestoring) return null;
  
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1a1a1a] rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-sm">Restaurando posición...</span>
        </div>
      </div>
    </div>
  );
};

function HistoryPage() {
  const { user } = useAuthContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [devocionalSortOrder, setDevocionalSortOrder] = useState<SortOrder>("desc") // Newest first
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>("all")
  const [selectedBookFilter, setSelectedBookFilter] = useState<string | "all">("all")
  const [isRestoring, setIsRestoring] = useState(false)
  const [contentReady, setContentReady] = useState(false)
  const {loadFromMobileStorage, devocionales} = useDevocionales()
  const containerRef = useRef(null);
  const { scrollToElement } = useIntelligentScroll();

  useDisableMobileZoom()

  // Efecto para controlar cuando mostrar el contenido
  useEffect(() => {
    if (!loading && !isRestoring) {
      // Pequeño delay para asegurar que todo esté renderizado
      setTimeout(() => setContentReady(true), 50);
    } else {
      setContentReady(false);
    }
  }, [loading, isRestoring]);

  // Efecto mejorado para restaurar la posición del scroll
  useEffect(() => {
    if (!loading && devocionales.length > 0) {
      const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
      if (savedPosition) {
        setIsRestoring(true);
        
        try {
          const { elementId, scrollTop } = JSON.parse(savedPosition);
          
          // Usar timeout mínimo para asegurar renderizado completo
          setTimeout(async () => {
            const element = document.getElementById(elementId);
            
            if (element) {
              // Scroll instantáneo y silencioso al elemento específico
              await scrollToElement(elementId, {
                behavior: 'auto',
                block: 'center',
                hideScrollBars: true
              });
            } else {
              // Fallback: scroll instantáneo a la posición guardada
              window.scrollTo({ 
                top: scrollTop, 
                behavior: 'auto',
                left: 0
              });
            }
            
            sessionStorage.removeItem(SCROLL_POSITION_KEY);
            setIsRestoring(false);
          }, 16); // Un frame (16ms) es suficiente
          
        } catch (error) {
          console.error('Error al restaurar posición:', error);
          sessionStorage.removeItem(SCROLL_POSITION_KEY);
          setIsRestoring(false);
        }
      }
    }
  }, [loading, devocionales, scrollToElement]);

  // Función para limpiar la posición guardada (solo para el botón de dashboard)
  const clearScrollPosition = () => {
    sessionStorage.removeItem(SCROLL_POSITION_KEY);
  };

  // Función mejorada para manejar clicks en devocionales
  const handleDevocionalClick = (devocionalId: any) => {
    try {
      // Guardar posición actual con más precisión
      const element = document.getElementById(`devocional-${devocionalId}`);
      const scrollPosition = {
        elementId: `devocional-${devocionalId}`,
        scrollTop: window.pageYOffset || document.documentElement.scrollTop,
        // Información adicional para mejor restauración
        timestamp: Date.now(),
        viewportHeight: window.innerHeight
      };
      
      sessionStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(scrollPosition));
    } catch (error) {
      console.error('Error al guardar posición:', error);
    }
  };

  // Función utilitaria para scroll manual (para botones o acciones específicas)
  const scrollToDevocionalSmooth = async (index: number) => {
    if (index >= 0 && index < filteredAndSortedDevocionarios.length) {
      const targetDevocional = filteredAndSortedDevocionarios[index];
      const targetId = `devocional-${targetDevocional.id}`;
      
      // Para acciones del usuario, usar scroll suave
      await scrollToElement(targetId, {
        behavior: 'smooth',
        block: 'center',
        hideScrollBars: false
      });
    }
  };

  // Efecto para limpiar la posición cuando se cierra la aplicación
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(SCROLL_POSITION_KEY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    async function loadAllData() {
      console.log('Se ejecuto el effect del usuario')
      if (user) {
        setLoading(true)
        try {
          await loadFromMobileStorage()
          console.log('Devocionales cargados:', devocionales.length)
        } catch (error) {
          console.error("Error al cargar los datos para historial:", error)
        } finally {
          setLoading(false)
        }
      }
    }
    loadAllData()
  }, [user, loadFromMobileStorage])

  const uniqueBooks = useMemo(() => {
    const books = new Set<string>()
    devocionales.forEach((d) => {
      const book = extractBookName(d.citaBiblica)
      if (book) {
        books.add(book)
      }
    })
    return Array.from(books).sort((a, b) => a.localeCompare(b))
  }, [devocionales])

  const filteredAndSortedDevocionarios = useMemo(() => {
    let currentDevocionales = devocionales

    // Apply search filter if searchTerm is present
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase()
      currentDevocionales = currentDevocionales.filter((d) => {
        const fechaParts = d.fecha.split("-")
        const fechaObj = new Date(
          Number.parseInt(fechaParts[0]),
          Number.parseInt(fechaParts[1]) - 1,
          Number.parseInt(fechaParts[2]),
        )
        const nombreDia = fechaObj.toLocaleDateString("es-ES", { weekday: "long" }).toLowerCase()

        return (
          d.citaBiblica.toLowerCase().includes(lowerCaseSearch) ||
          d.textoDevocional.toLowerCase().includes(lowerCaseSearch) ||
          d.aprendizajeGeneral.toLowerCase().includes(lowerCaseSearch) ||
          nombreDia.includes(lowerCaseSearch) ||
          d.tags?.some((tag) => tag.toLowerCase().includes(lowerCaseSearch))
        )
      })
    }

    // Apply completion filter
    if (completionFilter !== "all") {
      currentDevocionales = currentDevocionales.filter((d) =>
        completionFilter === "completed" ? d.completado : !d.completado,
      )
    }

    // Apply book filter
    if (selectedBookFilter !== "all") {
      currentDevocionales = currentDevocionales.filter((d) => extractBookName(d.citaBiblica) === selectedBookFilter)
    }

    // Apply sorting
    return [...currentDevocionales].sort((a, b) => {
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return devocionalSortOrder === "asc" ? dateA - dateB : dateB - dateA
    })
  }, [searchTerm, devocionales, devocionalSortOrder, completionFilter, selectedBookFilter])

  const groupedDevocionales = useMemo(() => {
    const groups: { [key: string]: Devocional[] } = {}
    filteredAndSortedDevocionarios.forEach((devocional) => {
      const date = new Date(devocional.fecha)
      const monthYear = date.toLocaleDateString("es-ES", { year: "numeric", month: "long", timeZone: "UTC" })
      if (!groups[monthYear]) {
        groups[monthYear] = []
      }
      groups[monthYear].push(devocional)
    })
    return groups
  }, [filteredAndSortedDevocionarios])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    return utcDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      {/* Overlay de restauración */}
      <RestorePositionOverlay isRestoring={isRestoring} />
      
      {/* Contenido principal */}
      <div 
        className={`container mx-auto px-4 py-6 max-w-5xl transition-opacity duration-200 ${
          contentReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div ref={containerRef}>
            <Link href="/dashboard">
                <Button
                    variant="outline"
                    className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm w-full sm:w-auto"
                    onClick={clearScrollPosition} // Solo limpia cuando va al dashboard
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                </Button>
            </Link>
          </div>
          <div className="text-center order-first sm:order-none">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Historial Completo
            </h1>
            <p className="text-gray-400">Todos tus devocionales</p>
          </div>
          <div className="hidden sm:block w-10"></div> {/* Small spacer for visual balance on right, flexible */}
        </div>

        {/* Search Bar */}
        <GradientCard gradient="blue" className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cita, contenido, etiqueta o día..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white pl-12 h-12 backdrop-blur-sm focus:border-blue-500 transition-colors text-base"
              />
            </div>
          </CardContent>
        </GradientCard>

        {/* Consolidated Filters and Sort */}
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm text-white w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros y Ordenar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-64 bg-[#1a1a1a] border-gray-700 text-white p-2">
              {/* Sort Devocionales */}
              <DropdownMenuLabel>Ordenar Devocionales</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={() => setDevocionalSortOrder("desc")}
                className="hover:bg-[#2a2a2a] focus:bg-[#2a2a2a]"
              >
                <CalendarDays className="h-4 w-4 mr-2" /> Más Recientes
                {devocionalSortOrder === "desc" && <CheckCircle2 className="ml-auto h-4 w-4 text-blue-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDevocionalSortOrder("asc")}
                className="hover:bg-[#2a2a2a] focus:bg-[#2a2a2a]"
              >
                <CalendarDays className="h-4 w-4 mr-2" /> Más Antiguos
                {devocionalSortOrder === "asc" && <CheckCircle2 className="ml-auto h-4 w-4 text-blue-400" />}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-700 my-2" />

              {/* Completion Filter */}
              <DropdownMenuLabel>Filtrar Completado</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <RadioGroup
                value={completionFilter}
                onValueChange={(value: CompletionFilter) => setCompletionFilter(value)}
                className="p-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="filter-all" className="text-blue-400" />
                  <Label htmlFor="filter-all" className="text-white">
                    Todos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="filter-completed" className="text-blue-400" />
                  <Label htmlFor="filter-completed" className="text-white">
                    Completados
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pending" id="filter-pending" className="text-blue-400" />
                  <Label htmlFor="filter-pending" className="text-white">
                    Pendientes
                  </Label>
                </div>
              </RadioGroup>

              <DropdownMenuSeparator className="bg-gray-700 my-2" />

              {/* Book Filter */}
              <DropdownMenuLabel>Filtrar por Libro</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <div className="max-h-60 overflow-y-auto p-2">
                <RadioGroup
                  value={selectedBookFilter}
                  onValueChange={(value: string | "all") => setSelectedBookFilter(value)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="all" id="book-filter-all" className="text-blue-400" />
                    <Label htmlFor="book-filter-all" className="text-white">
                      Todos los libros
                    </Label>
                  </div>
                  {uniqueBooks.map((book) => (
                    <div key={book} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={book} id={`book-filter-${book}`} className="text-blue-400" />
                      <Label htmlFor={`book-filter-${book}`} className="text-white">
                        {book}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Results */}
        <div className="space-y-8 mt-[-2]">
          {loading ? (
            <GradientCard>
              <CardContent className="text-center py-16">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-gray-400">Cargando historial...</p>
              </CardContent>
            </GradientCard>
          ) : (
            <>
              {/* Devocionales Section */}
              <div>
                <Badge variant="outline" className="text-xs mb-3">
                {filteredAndSortedDevocionarios.length} Devocionales
                </Badge>
                {Object.keys(groupedDevocionales).length > 0 ? (
                  Object.keys(groupedDevocionales).map((monthYear) => (
                    <div key={monthYear} className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4 sticky top-0 bg-[#2a2a2a]/50 border-gray-700 py-2 z-10 text-center">
                        {monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}
                        </h3>
                      <div className="grid gap-6">
                        {groupedDevocionales[monthYear].map((devocional) => (
                          <div key={devocional.id} id={`devocional-${devocional.id}`}>
                            <Link href={`/devocional/${devocional.fecha}/historial`}>
                              <GradientCard 
                                    className="group cursor-pointer hover:scale-[1.02] transition-all duration-300"
                                    onClick={() => handleDevocionalClick(devocional.id)}>
                                <CardHeader>
                                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors flex-shrink-0">
                                        <BookOpen className="h-5 w-5 text-blue-400" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <CardTitle className="text-white group-hover:text-blue-400 transition-colors flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {devocional.citaBiblica}
                                          </CardTitle>
                                        </div>
                                        <CardDescription className="text-gray-400 capitalize min-w-0">
                                          {formatDate(devocional.fecha)}
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <Badge
                                      variant={devocional.completado ? "secondary" : "outline"}
                                      className={
                                        devocional.completado
                                          ? "bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0"
                                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
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
                                    <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
                                      {devocional.textoDevocional}
                                    </p>
                                  </div>
                                  <Separator className="my-4 bg-gray-700/50" />
                                  <div className="space-y-3">
                                    <div>
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Aprendizaje:
                                      </span>
                                      <p className="text-gray-400 text-sm line-clamp-2 mt-1 leading-relaxed">
                                        {devocional.aprendizajeGeneral}
                                      </p>
                                    </div>
                                    {devocional.tags && devocional.tags.length > 0 && (
                                      <div>
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                          Etiquetas:
                                        </span>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {devocional.tags.map((tag, index) => (
                                            <Badge
                                              key={index}
                                              variant="secondary"
                                              className="bg-amber-700/20 text-amber-300 border-amber-700/30 text-xs hover:bg-amber-700/30 transition-colors"
                                            >
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </GradientCard>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <GradientCard>
                    <CardContent className="text-center py-16">
                      <div className="p-4 bg-gray-500/10 rounded-full w-fit mx-auto mb-6">
                        <BookOpen className="h-12 w-12 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {searchTerm.trim() || completionFilter !== "all" || selectedBookFilter !== "all"
                          ? "No se encontraron devocionales con los filtros aplicados."
                          : "Aún no tienes devocionales."}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {searchTerm.trim() || completionFilter !== "all" || selectedBookFilter !== "all"
                          ? "Intenta ajustar tu búsqueda o filtros."
                          : "Empieza a registrar tus devocionales para verlos aquí."}
                      </p>
                      {!searchTerm.trim() && completionFilter === "all" && selectedBookFilter === "all" && (
                        <Link href="/dashboard">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear Nuevo Devocional
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </GradientCard>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default withAuth(HistoryPage)