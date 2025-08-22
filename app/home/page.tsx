"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  BookCopy,
  Library,
  TrendingUp,
  CheckCircle2,
  Book,
  Link as LinkIcon,
  LogOut,
  LogOutIcon,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GradientCard } from "@/components/ui/gradient-card"
import { useAuthContext } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useStatistics } from "@/hooks/use-statistics"
import { preloadBibleBooks } from "@/lib/bible/bible-indexdb"

function HomePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const stats = useStatistics(); // 📊 Estadísticas reales del usuario

  // 🛡️ Protección manual: redirigir al login si no hay usuario
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      // Solo redirigir al login si NO estamos en proceso de logout
      const isLogoutInProgress = sessionStorage.getItem('logout-in-progress');
      if (!isLogoutInProgress) {
        router.replace('/login');
      }
    }
  }, [user, loading, router, isLoggingOut]);

  // useEffect(() => {
  //   if (user) {
  //     console.log('🚀 Precargando libros bíblicos...');
  //     preloadBibleBooks();
  //   }
  // }, [user]);

  // 🧹 Limpiar sessionStorage al desmontar componente
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('logout-in-progress');
    };
  }, []);

  // 🚀 Logout optimizado - Redirección inmediata
const handleLogout = () => {
  // 1. Marcar logout en progreso INMEDIATAMENTE
  sessionStorage.setItem('logout-in-progress', 'true');
  setIsLoggingOut(true);
  
  // 2. REDIRECCIÓN INMEDIATA - antes de que Firebase elimine el user
  router.replace('/');
  
  // 3. Firebase logout en background (no bloquea la navegación)
  signOut().catch(console.error).finally(() => {
    // Limpiar después de un tiempo para evitar loops
    setTimeout(() => {
      sessionStorage.removeItem('logout-in-progress');
    }, 1000);
  });
};

  // ⚡ RENDER INMEDIATO - Sin esperar estadísticas
  // Mostrar UI básica inmediatamente, estadísticas se cargan después
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay usuario y no está en proceso de logout, no mostrar nada (se redirigirá)
  if (!user && !isLoggingOut) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Logout button - Izquierda */}
        <div className="absolute top-8 left-4 sm:left-6 lg:left-8 z-10">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
          >
        <LogOutIcon className="h-4 w-4 mr-2 rotate-180" />
          </Button>
        </div>

        {/* Settings button - Derecha */}
        <div className="absolute top-8 right-4 sm:right-6 lg:right-8 z-10">
          <Link href="/settings">
            <Button
              variant="outline"
              className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Config</span>
            </Button>
          </Link>
        </div>

        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Devocionarios Bíblicos
              </h1>
              <p className="text-gray-400 text-base sm:text-lg">
                Tu centro de estudio y reflexión personal
              </p>
            </div>
          </div>
        </div>
        
        {/* 🚀 NAVEGACIÓN PRINCIPAL - ACCESO RÁPIDO EN MÓVILES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Link href="/dashboard">
                <GradientCard gradient="blue" className="group hover:scale-105 transition-transform cursor-pointer h-full">
                    <CardContent className="p-6 sm:p-8 text-center">
                    <BookCopy className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-4"/>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Mis Devocionales</h2>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base">Registra y revisa tus reflexiones diarias.</p>
                    </CardContent>
                </GradientCard>
            </Link>
            <Link href="/topical">
                <GradientCard gradient="green" className="group hover:scale-105 transition-transform cursor-pointer h-full">
                    <CardContent className="p-6 sm:p-8 text-center">
                    <Library className="h-10 w-10 sm:h-12 sm:w-12 text-green-400 mx-auto mb-4"/>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Estudio por Temas</h2>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base">Profundiza en conceptos clave de la Biblia.</p>
                    </CardContent>
                </GradientCard>
            </Link>
            <Link href="/deep-study">
                <GradientCard gradient="purple" className="group hover:scale-105 transition-transform cursor-pointer h-full">
                    <CardContent className="p-6 sm:p-8 text-center">
                    <Book className="h-10 w-10 sm:h-12 sm:w-12 text-purple-400 mx-auto mb-4"/>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Estudios Profundos</h2>
                    <p className="text-gray-400 mt-2 text-sm sm:text-base">Realiza estudios detallados con referencias y subtemas.</p>
                    </CardContent>
                </GradientCard>
            </Link>
        </div>
        
        {/* 📊 ESTADÍSTICAS DE PROGRESO - Con loading optimizado */}
        <div className="mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-6 text-center">📊 Tu Progreso Espiritual</h2>
          
          {/* ⚡ Mostrar estadísticas inmediatamente si están disponibles, skeleton si no */}
          {stats.loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-900/50 rounded-xl border border-gray-800 p-3 sm:p-4 lg:p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                      <div className="h-3 bg-gray-700 rounded w-16 mb-2"></div>
                      <div className="h-6 bg-gray-700 rounded w-8"></div>
                  </div>
                    <div className="w-8 h-8 bg-gray-700 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <GradientCard gradient="blue" className="group hover:scale-105 transition-transform">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Completados</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.completados}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </GradientCard>

            <GradientCard gradient="purple" className="group hover:scale-105 transition-transform">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Versículos</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.versiculos}</p>
                  </div>
                    <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                      <Book className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </GradientCard>

            <GradientCard gradient="green" className="group hover:scale-105 transition-transform">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Referencias</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.referencias}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-500/20 rounded-xl group-hover:bg-green-500/30 transition-colors">
                      <LinkIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </GradientCard>

              <GradientCard gradient="orange" className="group hover:scale-105 transition-transform">
                <CardContent className="p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Racha</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stats.racha}</p>
                      <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                        {stats.racha === 0 ? "¡Comienza hoy!" : 
                         stats.racha === 1 ? "día" : "días consecutivos"}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-500/20 rounded-xl group-hover:bg-orange-500/30 transition-colors">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </GradientCard>
            </div>
          )}

          {/* 📊 Estadísticas adicionales - Solo mostrar cuando no están cargando */}
          {!stats.loading && (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-4 lg:hidden">
              <GradientCard gradient="purple" className="group hover:scale-105 transition-transform">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Total Devoc.</p>
                      <p className="text-lg sm:text-xl font-bold text-white">{stats.totalDevocionales}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </GradientCard>

              <GradientCard gradient="blue" className="group hover:scale-105 transition-transform">
                <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">Estudios</p>
                      <p className="text-lg sm:text-xl font-bold text-white">{stats.totalEstudios}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl group-hover:bg-blue-500/30 transition-colors">
                      <BookCopy className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </GradientCard>
            </div>
          )}
        </div>

        {/* 📈 Barra de progreso de completados - Solo mostrar cuando hay datos */}
        {!stats.loading && stats.totalDevocionales > 0 && (
          <div className="mt-8">
            <GradientCard gradient="purple">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Progreso de Devocionales</h3>
                  <span className="text-sm text-gray-400">
                    {stats.completados} de {stats.totalDevocionales} completados
                  </span>
                  </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.round((stats.completados / stats.totalDevocionales) * 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-center text-sm text-gray-400 mt-2">
                  {Math.round((stats.completados / stats.totalDevocionales) * 100)}% completado
                </p>
              </CardContent>
            </GradientCard>
        </div>
        )}

      </div>
    </div>
  );
}

export default HomePage;
