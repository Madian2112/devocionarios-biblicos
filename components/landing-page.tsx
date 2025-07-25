import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Feather, Lock, Mail, Heart, Layers, Code, Search, Menu } from "lucide-react";
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';


interface LandingPageProps {
  onLoginClick: () => void;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-md">
    {children}
  </a>
);

export function LandingPage({ onLoginClick }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinkMobile = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} className="text-gray-300 hover:text-white transition-colors block py-3 text-lg" onClick={() => setIsMenuOpen(false)}>
      {children}
    </a>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      {/* Header y Navegación */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
<div className="flex items-center gap-3">
  {/* <Heart className="h-7 w-7 text-blue-400" /> */}
  <span className="text-lg sm:text-xl font-bold leading-tight text-center">
    Devocionales<br className="block sm:hidden" /> Biblicos
  </span>
</div>
          
          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center">
            <NavLink href="#features">Funcionalidades</NavLink>
            <NavLink href="#contact">Únete</NavLink>
            <NavLink href="#developers">Desarrolladores</NavLink>
          </nav>

          {/* Botones de la Derecha */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onLoginClick}
              variant="outline"
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Acceder</span>
            </Button>

            {/* Menú Hamburguesa para Móvil */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-[#0a0a0a]/80 backdrop-blur-sm border-l-gray-800 text-white w-3/4">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Menú Principal</SheetTitle>
                    <SheetDescription className="sr-only">Navegación principal del sitio y acceso de usuario.</SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    <NavLinkMobile href="#features">Funcionalidades</NavLinkMobile>
                    <NavLinkMobile href="#contact">Únete</NavLinkMobile>
                    <NavLinkMobile href="#developers">Desarrolladores</NavLinkMobile>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28 sm:pt-24">
        {/* Sección Hero */}
        <section id="hero" className="text-center pt-16 pb-24 px-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Tu Devocional Diario
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl mt-4 max-w-3xl mx-auto">
            Un encuentro personal con la Palabra, un refugio para meditar y profundizar tu relación con Dios.
          </p>
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed my-10">
            Esta herramienta no es solo un diario; es un puente para registrar las revelaciones, dudas y aprendizajes que Él deposita en tu corazón a través de Su Palabra.
          </p>
          <Button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg h-14 px-8"
          >
            Acércate más a Dios
          </Button>
        </section>

        {/* Sección de Funcionalidades */}
        <section id="features" className="py-20 bg-[#111111]/50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Un Espacio Diseñado para Ti</h2>
            <p className="text-gray-400 mb-16 max-w-2xl mx-auto">
              Cada funcionalidad ha sido creada para facilitar tu estudio y reflexión, sin distracciones.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
                <Feather className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Registro de Devocionales</h3>
                <p className="text-gray-400 mt-2">
                  Anota tus pensamientos, oraciones y lo que Dios te habla cada día a través de las Escrituras.
                </p>
              </div>
              <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
                <Layers className="h-10 w-10 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Estudios por Temas</h3>
                <p className="text-gray-400 mt-2">
                  ¿Quieres estudiar sobre la Fe, el Amor o el Perdón? Agrupa versículos y apuntes por temas para un estudio profundo y organizado.
                </p>
              </div>
              <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
                <Search className="h-10 w-10 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Búsqueda Inteligente</h3>
                <p className="text-gray-400 mt-2">
                  Encuentra fácilmente cualquier devocional o apunte que hayas escrito en el pasado con una búsqueda rápida y eficiente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Contacto para Nuevos Usuarios */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <Mail className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Te gustaría unirte?</h2>
            <p className="text-gray-400 text-lg mb-6">
              El acceso es personal y se gestiona de forma individual para mantener un espacio seguro y enfocado. Si deseas tu propio usuario y contraseña, contáctanos.
            </p>
            <a
              href="mailto:devocionales.biblicos.rv@gmail.com"
              className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              devocionales.biblicos.rv@gmail.com
            </a>
          </div>
        </section>
        
        {/* Sección para Desarrolladores */}
        <section id="developers" className="py-20 bg-[#111111]/50">
          <div className="container mx-auto px-6 text-center max-w-3xl">
            <Code className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Eres Desarrollador?</h2>
            <p className="text-gray-400 text-lg mb-6">
              Este es un proyecto de código abierto construido con amor. Si tienes ideas para mejorar la aplicación o quieres contribuir con tus habilidades, ¡tu ayuda es bienvenida! Contáctanos para explorar cómo puedes ser parte.
            </p>
            <a
              href="mailto:devocionales.biblicos.rv@gmail.com"
              className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Contactar para Contribuir
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Un Corazón que Escucha. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
} 