import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Inter } from "next/font/google";
import { BookOpen, Feather, Lock, Mail, Heart, Layers, Code, Search, Menu, ChevronsRight, Star, Users, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import type { Metadata } from "next";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "Devocionales Bíblicos con Notas",
  description: "Tu espacio personal para la reflexión y el estudio profundo de la Biblia. Registra devocionales, organiza estudios temáticos y conecta con la Palabra de Dios.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://devocionales-biblicos.netlify.app/"), 
  openGraph: {
    title: "Devocionales Bíblicos con Notas",
    description: "Explora devocionales diarios y estudios bíblicos para tu crecimiento espiritual.",
    type: "website",
    url: "https://devocionales-biblicos.netlify.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Devocionales Bíblicos con Notas",
    description: "Conecta con la Palabra de Dios cada día",
  },
};

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick?: () => void;
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-md">
    {children}
  </a>
);

export function LandingPage({ onLoginClick, onSignupClick }: LandingPageProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinkMobile = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} className="text-gray-300 hover:text-white transition-colors block py-3 text-lg" onClick={() => setIsMenuOpen(false)}>
      {children}
    </a>
  );

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/_next/static/css/app/layout.css" as="style" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Devocionales" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"/>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      {/* Header y Navegación */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold leading-tight text-center">
              <span className="hidden sm:inline">Devocionales Bíblicos con Notas</span>
              <span className="sm:hidden">Devocionales<br/>Bíblicos</span>
            </h1>
          </div>
          
          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center" aria-label="Navegación principal">
            <NavLink href="#features">Funcionalidades</NavLink>
            <NavLink href="#how-to">Guías</NavLink>
            <NavLink href="#contact">Únete</NavLink>
            <NavLink href="#developers">Desarrolladores</NavLink>
          </nav>

          {/* Botones de la Derecha */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onLoginClick}
              variant="outline"
              className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
              aria-label="Acceder a la aplicación de devocionales bíblicos"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline ml-2">Acceder</span>
            </Button>

            {/* Menú Hamburguesa para Móvil */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Abrir menú de navegación">
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-[#0a0a0a]/80 backdrop-blur-sm border-l-gray-800 text-white w-3/4">
                  <SheetHeader>
                    <SheetTitle className="text-white">Menú Principal</SheetTitle>
                    <SheetDescription className="text-gray-400">Navegación principal del sitio</SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8">
                    <NavLinkMobile href="#features">Funcionalidades</NavLinkMobile>
                    <NavLinkMobile href="#how-to">Guías de Uso</NavLinkMobile>
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
        {/* Sección Hero Optimizada */}
        <section id="hero" className="text-center pt-16 pb-24 px-6">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Tu Devocional Diario Digital
          </h2>
          <p className="text-gray-300 text-xl sm:text-2xl mt-4 max-w-4xl mx-auto font-medium">
            La plataforma cristiana gratuita para registrar devocionales, organizar estudios bíblicos por temas y profundizar tu relación con Dios
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed my-8">
            Más que un simple diario espiritual: es tu compañero digital para registrar revelaciones, reflexiones y aprendizajes que Dios deposita en tu corazón a través de Su Palabra.
          </p>
          
          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 my-12">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-sm sm:text-base">Gratuito para siempre</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Lock className="h-5 w-5 text-green-400" />
              <span className="text-sm sm:text-base">Datos seguros y privados</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-5 w-5 text-purple-400" />
              <span className="text-sm sm:text-base">Acceso 24/7</span>
            </div>
          </div>

          <Button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg h-14 px-8"
            aria-label="Solicitar acceso gratuito a devocionales bíblicos"
          >
             Acércate más a Dios
          </Button>
        </section>

        {/* Sección de Funcionalidades Optimizada */}
        <section id="features" className="py-20 bg-[#111111]/50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Herramientas Diseñadas para tu Crecimiento Espiritual</h2>
            <p className="text-gray-400 mb-16 max-w-3xl mx-auto text-lg">
              Cada funcionalidad ha sido creada pensando en facilitar tu estudio bíblico diario y reflexión espiritual, sin distracciones innecesarias.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-colors">
                <div className="flex flex-col items-center">
                  <Feather className="h-12 w-12 text-blue-400 mb-6" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-4">Registro de Devocionales Diarios</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Documenta tus pensamientos, oraciones y las revelaciones que Dios te habla cada día a través de las Escrituras. Mantén un registro completo de tu caminata espiritual.
                </p>
              </article>
              
              <article className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-colors">
                <div className="flex flex-col items-center">
                  <Layers className="h-12 w-12 text-purple-400 mb-6" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-4">Estudios Bíblicos por Temas</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Organiza estudios profundos sobre Fe, Amor, Perdón, Oración y más. Agrupa versículos relacionados y tus apuntes para un estudio sistemático y organizado de la Biblia.
                </p>
              </article>
              
              <article className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 hover:border-green-500/50 transition-colors">
                <div className="flex flex-col items-center">
                  <Search className="h-12 w-12 text-green-400 mb-6" aria-hidden="true" />
                  <h3 className="text-xl font-bold text-white mb-4">Búsqueda Inteligente de Contenido</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Encuentra instantáneamente cualquier devocional, apunte o reflexión que hayas escrito anteriormente. Búsqueda rápida y eficiente en todo tu contenido espiritual.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Sección de Guías Simplificada */}
        <section id="how-to" className="py-20 bg-[#111111]/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cómo Crear tu Hábito de Devocional Diario</h2>
              <p className="text-gray-400 mb-8 text-lg max-w-3xl mx-auto">
                Establecer un tiempo diario con Dios es más fácil de lo que piensas. Nuestra plataforma te guía paso a paso para desarrollar este hábito transformador.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">📖 Devocionales Diarios</h3>
                {[
                  "Prepárate en Oración y selecciona un pasaje",
                  "Lee con Atención y medita en la Palabra",
                  "Profundiza y reflexiona sobre el mensaje",
                  "Aplica a tu vida diaria de forma práctica",
                  "Guarda y revisa tu progreso espiritual"
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{step}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">📚 Estudios Temáticos</h3>
                {[
                  "Define tu tema de estudio bíblico",
                  "Recolecta versículos relevantes",
                  "Centraliza tus reflexiones",
                  "Conecta y sintetiza ideas divinas"
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Contacto Optimizada */}
        <section id="contact" className="py-20 bg-[#111111]/50">
          <div className="container mx-auto px-6 text-center max-w-6xl">
            <div className="flex justify-center">
              <BookOpen className="h-12 w-12 text-blue-400 mb-6" aria-hidden="true" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">¿Listo para Transformar tu Vida Espiritual?</h2>
            <p className="text-gray-300 text-lg mb-12 max-w-3xl mx-auto">
              El acceso a nuestra plataforma es completamente gratuito. Tenemos dos formas fáciles para que comiences tu crecimiento espiritual hoy mismo.
            </p>

            {/* Dos opciones lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Opción 1: Registrarse Directamente */}
              <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-8 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-colors">
                <div className="flex justify-center mb-4">
                  <Lock className="h-10 w-10 text-blue-400" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">⚡ Acceso Inmediato</h3>
                <p className="text-gray-300 mb-6 text-base">
                  Crea tu cuenta ahora mismo y comienza tu devocional inmediatamente. Proceso rápido y sin esperas.
                </p>
                <Button
                  onClick={onSignupClick || onLoginClick}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg text-lg h-12 mb-4"
                  aria-label="Ir a página de registro para crear cuenta"
                >
                  Registrarme Ahora
                </Button>
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Disponible las 24 horas</span>
                </div>
              </div>

              {/* Opción 2: Contactar por Correo */}
              <div className="bg-gradient-to-br from-slate-900/50 to-gray-900/50 p-8 rounded-xl border border-slate-500/30 hover:border-slate-400/50 transition-colors">
                <div className="flex justify-center mb-4">
                  <Mail className="h-10 w-10 text-slate-400" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">📧 Atención Personalizada</h3>
                <p className="text-gray-300 mb-6 text-base">
                  ¿Prefieres que te ayudemos personalmente? Escríbenos y te guiaremos paso a paso en tu registro.
                </p>
                <a
                  href="mailto:devocionales.biblicos.rv@gmail.com?subject=Solicitud de acceso a Devocionales Bíblicos con Notas&body=Hola, me interesa obtener acceso gratuito a la plataforma de Devocionales Bíblicos con Notas para comenzar mi crecimiento espiritual."
                  className="inline-block w-full bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg mb-2"
                  aria-label="Enviar correo para solicitar acceso personalizado"
                >
                  Escribir Correo
                </a>
                <p className="text-gray-300 text-sm mb-4">
                  📧 devocionales.biblicos.rv@gmail.com
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>Respuesta en menos de 24 horas</span>
                </div>
              </div>
            </div>

            {/* Mensaje adicional */}
            <div className="mt-12 bg-gray-900/30 p-6 rounded-xl border border-gray-700 max-w-3xl mx-auto">
              <p className="text-gray-300 text-base">
                <strong className="text-white">¿Dudas sobre cuál elegir?</strong><br/>
                Ambas opciones son completamente gratuitas y te dan acceso total a la plataforma. 
                Si quieres comenzar ya, regístrate directamente. Si prefieres ayuda personalizada, escríbenos.
              </p>
            </div>
          </div>
        </section>
        
        {/* Sección para Desarrolladores Simplificada */}
        <section id="developers" className="py-20">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <div className="flex justify-center">
              <Code className="h-12 w-12 text-green-400 mb-6" aria-hidden="true" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Desarrolladores: Únete a Nuestro Ministerio Digital</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
              Este es un proyecto de código abierto construido con pasión y propósito eterno. Si tienes habilidades en desarrollo web, ideas innovadoras para mejorar la experiencia espiritual de otros creyentes, o quieres contribuir con tu talento para el Reino, ¡tu participación es muy bienvenida y valorada!
            </p>
            <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Tecnologías que utilizamos:</h3>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">React</span>
                <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">Node.js</span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">TypeScript</span>
                <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">Next.js</span>
              </div>
              <a
                href="mailto:devocionales.biblicos.rv@gmail.com?subject=Contribución como desarrollador - Devocionales Bíblicos con Notas&body=Hola, soy desarrollador y me interesa contribuir al proyecto de Devocionales Bíblicos con Notas. Mi experiencia incluye..."
                className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-colors text-lg"
                aria-label="Contactar para contribuir como desarrollador"
              >
                Quiero Contribuir al Proyecto
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-800 mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Devocionales Bíblicos con Notas</h3>
              <p className="text-gray-400 text-sm">
                Tu plataforma digital gratuita para crecimiento espiritual y estudio bíblico organizado.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400 text-sm mb-2">
                Email: devocionales.biblicos.rv@gmail.com
              </p>
              <p className="text-gray-400 text-sm">
                Acceso gratuito disponible
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Devocionales Bíblicos con Notas. Todos los derechos reservados. 
              <span className="block mt-2 text-xs">
                Plataforma cristiana gratuita para devocionales diarios y estudios bíblicos temáticos
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
      </body>
    </html>
  );
}