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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GradientCard } from "@/components/ui/gradient-card"
import { useAuthContext } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

function HomePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 🛡️ Protección manual: redirigir al login si no hay usuario (pero NO durante logout)
  useEffect(() => {
    // COMPLETAMENTE deshabilitado durante logout para evitar interceptación
    if (!loading && !user && !isLoggingOut) {
      // Solo redirigir al login si NO estamos en proceso de logout
      const isLogoutInProgress = sessionStorage.getItem('logout-in-progress');
      if (!isLogoutInProgress) {
        router.replace('/login');
      }
    }
  }, [user, loading, router, isLoggingOut]);

  // 🧹 Limpiar sessionStorage al desmontar componente
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('logout-in-progress');
    };
  }, []);

  // 🚀 Logout con Firebase y redirección al landing page
  const handleLogout = () => {
    // 🔥 LOGOUT SÚPER AGRESIVO - Redirección inmediata
    
    // Marcar que el logout está en progreso
    sessionStorage.setItem('logout-in-progress', 'true');
    
    // REDIRECCIÓN INMEDIATA - No esperamos a nada
    window.location.href = '/';
    
    // Firebase logout en background (no bloqueante)
    signOut().catch(() => {
      // Si falla, no importa - ya estamos en el landing page
    }).finally(() => {
      sessionStorage.removeItem('logout-in-progress');
    });
  };

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si no hay usuario y no está en proceso de logout, no mostrar nada (se redirigirá)
  if (!user && !isLoggingOut) {
    return null;
  }

  const stats = {
    completados: 5, 
    versiculos: 25,
    referencias: 10,
    racha: 5,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        <div className="absolute top-8 left-4 sm:left-6 lg:left-8 z-10">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm"
          >
            <LogOutIcon className="h-4 w-4 mr-2 rotate-180" />
          </Button>
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
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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

        {/* Navegación Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <Link href="/dashboard">
                <GradientCard gradient="blue" className="group hover:scale-105 transition-transform cursor-pointer h-full">
                    <CardContent className="p-8 text-center">
                    <BookCopy className="h-12 w-12 text-blue-400 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-white">Mis Devocionales</h2>
                    <p className="text-gray-400 mt-2">Registra y revisa tus reflexiones diarias.</p>
                    </CardContent>
                </GradientCard>
            </Link>
            <Link href="/topical">
                <GradientCard gradient="green" className="group hover:scale-105 transition-transform cursor-pointer h-full">
                    <CardContent className="p-8 text-center">
                    <Library className="h-12 w-12 text-green-400 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-white">Estudio por Temas</h2>
                    <p className="text-gray-400 mt-2">Profundiza en conceptos clave de la Biblia.</p>
                    </CardContent>
                </GradientCard>
            </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
