"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Book,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Circle,
  Edit3,
  Eye,
  Home,
  Calendar as CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GradientCard } from "@/components/ui/gradient-card"
import type { Devocional } from "@/lib/firestore"
import { useAuthContext } from "@/context/auth-context"
// 🚀 Usar el servicio con cache móvil automático
import { cachedFirestoreService } from "@/lib/firestore-cached"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import withAuth from "@/components/auth/with-auth"

function DashboardPage() {
  const { user } = useAuthContext();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [devocionales, setDevocionales] = useState<Devocional[]>([])
  const [loading, setLoading] = useState(true);
  const [devocionalDelDia, setDevocionalDelDia] = useState<Devocional | null>(null);

  // 🚀 Efecto para cargar devocionales con cache automático
  useEffect(() => {
    const fetchDevocionales = async () => {
      if (user) {
        setLoading(true);
        try {
          const userDevocionarios = await cachedFirestoreService.getDevocionarios(user.uid);
          setDevocionales(userDevocionarios);
        } catch (error) {
          console.error("Error al cargar devocionales:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchDevocionales();
  }, [user]);

  // 🚀 Efecto para cargar devocional del día con cache móvil
  useEffect(() => {
    const fetchDevocionalDelDia = async () => {
      if (user && selectedDate) {
        try {
          const devocional = await cachedFirestoreService.getDevocionalByDate(user.uid, selectedDate);
          setDevocionalDelDia(devocional);
        } catch (error) {
          console.error("Error al cargar devocional del día:", error);
          setDevocionalDelDia(null);
        }
      }
    };
    fetchDevocionalDelDia();
  }, [user, selectedDate]);

  const handleDateChange = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate)
    if (direction === "prev") {
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    setSelectedDate(currentDate.toISOString().split("T")[0])
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Asegurarse de que la fecha se interpreta en UTC para evitar problemas de zona horaria
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: 'UTC'
    })
  }
  
  // const devocionalDelDia = devocionales.find((d) => d.fecha === selectedDate); // This line is no longer needed

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]"><LoadingSpinner size="lg" /></div>
  }

  return (
     <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
         {/* Header del Dashboard */}
        <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Botón Home */}
                <Link href="/home" className="order-first">
                <Button variant="outline" className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm">
                    <Home className="h-4 w-4"/>
                </Button>
                </Link>

                {/* Botones derecha */}
                <div className="flex gap-4">
                    <Link href="/search">
                        <Button variant="outline" className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50">
                        <Search className="h-4 w-4 mr-2"/> Buscar
                        </Button>
                    </Link>
                    {/* El enlace ahora lleva a la fecha seleccionada */}
                    <Link href={`/devocional/${selectedDate}`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="h-4 w-4 mr-2"/> Nuevo Devocional
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
          
          {/* Selector de Fecha */}
          <GradientCard className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
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
                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex flex-col items-center gap-2 flex-1">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white text-center w-full max-w-[200px]"
                  />
                  <Button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} variant="link" size="sm" className="text-gray-400 hover:text-white">
                    Hoy: {formatDate(new Date().toISOString())}
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDateChange("next")}
                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </GradientCard>

          {/* Devocional del Día */}
          <GradientCard gradient="blue" className="mb-8">
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
              {devocionalDelDia ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge className={devocionalDelDia.completado ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                      {devocionalDelDia.completado ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Circle className="h-3 w-3 mr-1" />}
                      {devocionalDelDia.completado ? "Completado" : "Pendiente"}
                    </Badge>
                    <Link href={`/devocional/${devocionalDelDia.id}`}>
                        <Button
                            variant="outline"
                            className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 backdrop-blur-sm"
                        >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Ver Devocional
                        </Button>
                    </Link>
                  </div>

                  <div className="bg-[#1a1a1a]/50 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-lg">
                            {devocionalDelDia.citaBiblica}
                          </h3>
                          {devocionalDelDia.citaBiblica && (
                            <BibleViewer
                              reference={devocionalDelDia.citaBiblica || ""}
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
                      {devocionalDelDia.aprendizajeGeneral}
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
                  <Link href={`/devocional/${selectedDate}`}>
                    <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Devocional
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </GradientCard>

          {/* Historial Reciente */}
          {devocionales.length > 0 && (
            <GradientCard className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-400" />
                  </div>
                  Historial Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devocionales.slice(0, 5).map((devocional) => (
                    <Link href={`/devocional/${devocional.id}`} key={devocional.id}>
                        <div
                            className="group flex items-center justify-between p-4 bg-[#1a1a1a]/30 rounded-xl cursor-pointer hover:bg-[#2a2a2a]/50 transition-all duration-300 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700/50"
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
                    </Link>
                  ))}
                </div>
              </CardContent>
            </GradientCard>
          )}
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
