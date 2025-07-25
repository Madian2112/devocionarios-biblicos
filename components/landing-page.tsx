import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, Feather, Lock, Mail, Heart, Layers, Code, Search, Menu, ChevronsRight, Star, Users, Clock } from "lucide-react";
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
    <>
      {/* Enhanced Head Section */}
      <head>
        <title>Devocionales Bíblicos - App Cristiana para Devocionales Diarios</title>
        <meta name="description" content="Plataforma cristiana gratuita para registrar devocionales diarios, organizar estudios bíblicos por temas y profundizar en la Palabra de Dios. Herramienta digital para tu crecimiento espiritual." />
        <meta name="keywords" content="devocionales cristianos, estudio bíblico, diario espiritual, aplicación cristiana, biblia, meditación cristiana, crecimiento espiritual, estudio por temas bíblicos" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="author" content="Devocionales Bíblicos" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="es" />
        <link rel="canonical" href="https://devocionales-biblicos-rv.netlify.app/" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Devocionales Bíblicos - Tu Diario Espiritual Digital" />
        <meta property="og:description" content="Registra tus devocionales diarios, organiza estudios bíblicos por temas y crece espiritualmente con nuestra plataforma cristiana gratuita." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tudominio.com" />
        <meta property="og:image" content="https://tudominio.com/og-image.jpg" />
        <meta property="og:site_name" content="Devocionales Bíblicos" />
        <meta property="og:locale" content="es_ES" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Devocionales Bíblicos - Diario Espiritual Digital" />
        <meta name="twitter:description" content="Plataforma cristiana para devocionales diarios y estudios bíblicos organizados por temas." />
        <meta name="twitter:image" content="https://tudominio.com/twitter-image.jpg" />

        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>

      {/* Enhanced Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Devocionales Bíblicos",
          "alternateName": "Diario Espiritual Digital",
          "description": "Plataforma cristiana gratuita para registro de devocionales diarios, estudios bíblicos organizados por temas y crecimiento espiritual personal",
          "url": "https://devocionales-biblicos-rv.netlify.app/",
          "applicationCategory": "ReligiousApplication",
          "operatingSystem": "Web Browser",
          "inLanguage": "es",
          "creator": {
            "@type": "Organization",
            "name": "Devocionales Bíblicos",
            "email": "devocionales.biblicos.rv@gmail.com"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "featureList": [
            "Registro de devocionales diarios",
            "Estudios bíblicos por temas",
            "Búsqueda inteligente de contenido",
            "Organización de versículos y apuntes"
          ],
          "audience": {
            "@type": "Audience",
            "audienceType": "Cristianos interesados en crecimiento espiritual"
          }
        })}
      </script>

      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
        {/* Header y Navegación */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold leading-tight text-center">
                <span className="hidden sm:inline">Devocionales Bíblicos</span>
                <span className="sm:hidden">Devocionales<br/>Bíblicos</span>
              </h1>
            </div>
            
            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center" aria-label="Navegación principal">
              <NavLink href="#features">Funcionalidades</NavLink>
              <NavLink href="#how-to">Guías</NavLink>
              {/* <NavLink href="#testimonials">Testimonios</NavLink> */}
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
                      {/* <NavLinkMobile href="#testimonials">Testimonios</NavLinkMobile> */}
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
          {/* Sección Hero Mejorada */}
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

          {/* Sección de Funcionalidades Mejorada */}
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

          {/* Nueva Sección de Testimonios */}
          {/* <section id="testimonials" className="py-20">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">Lo que dicen nuestros usuarios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "Esta plataforma ha transformado mi tiempo devocional. Poder organizar mis estudios por temas me ha ayudado a profundizar como nunca antes en la Palabra."
                  </p>
                  <p className="text-blue-400 font-semibold">- María G.</p>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "La función de búsqueda es increíble. Puedo encontrar rápidamente apuntes de hace meses y ver mi crecimiento espiritual a lo largo del tiempo."
                  </p>
                  <p className="text-purple-400 font-semibold">- Carlos R.</p>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">
                    "Simple, elegante y efectiva. Exactamente lo que necesitaba para mantener organizados mis devocionales sin complicaciones innecesarias."
                  </p>
                  <p className="text-green-400 font-semibold">- Ana L.</p>
                </div>
              </div>
            </div>
          </section> */}

          {/* Sección de Guías Mejorada */}
          <section id="how-to" className="py-20 bg-[#111111]/50">
            <div className="container mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cómo Crear tu Hábito de Devocional Diario</h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    Establecer un tiempo diario con Dios es más fácil de lo que piensas. Nuestra plataforma te guía paso a paso para desarrollar este hábito transformador.
                  </p>
                  <Button
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    aria-label="Solicitar acceso gratuito para comenzar devocionales"
                  >
                    Comenzar mi Rutina Espiritual <ChevronsRight className="h-4 w-4 ml-2" aria-hidden="true" />
                  </Button>
                </div>
                <div className="space-y-6">
                  {[
                    "Prepárate en Oración: Comienza pidiendo a Dios que ilumine tu corazón y mente. Selecciona un pasaje usando nuestro selector integrado de versículos.",
                    "Lee con Atención y Medita: Lee el texto bíblico pausadamente. Pregúntate: ¿Qué me quiere enseñar Dios hoy? Anota tus primeras impresiones y pensamientos.",
                    "Profundiza y Reflexiona: Utiliza el área de 'Apuntes y Aprendizaje' para escribir lo que has comprendido, tus preguntas sinceras y reflexiones profundas.",
                    "Aplica a tu Vida Diaria: La clave está en la aplicación práctica. ¿Cómo puedes vivir esta enseñanza hoy? Escribe pasos concretos y alcanzables.",
                    "Guarda y Revisa tu Progreso: Almacena tu devocional en la plataforma. El historial completo te permitirá ver tu crecimiento espiritual y madurez en la fe."
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-300"><strong className="text-white">{step.split(':')[0]}:</strong> {step.split(':')[1]}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 order-last md:order-first">
                  {[
                    "Define tu Tema de Estudio: Elige un concepto bíblico que desees explorar profundamente, como 'La Gracia Divina', 'El Perdón Cristiano', 'La Oración Efectiva' o 'El Amor Ágape'.",
                    "Recolecta Versículos Relevantes: Utiliza nuestro selector bíblico para agregar todas las referencias escriturales relacionadas con tu tema de estudio seleccionado.",
                    "Centraliza tus Reflexiones: En cada entrada temática, documenta tus reflexiones, preguntas y revelaciones. Tendrás todos tus pensamientos organizados en un solo lugar accesible.",
                    "Conecta y Sintetiza Ideas: Al tener todo el contenido junto, podrás identificar patrones, conexiones y verdades que antes pasaban desapercibidas, revelando la riqueza y profundidad de la Palabra de Dios."
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-300"><strong className="text-white">{step.split(':')[0]}:</strong> {step.split(':')[1]}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center md:text-left order-first md:order-last">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Organiza Estudios Bíblicos Temáticos Profundos</h2>
                  <p className="text-gray-400 mb-8 text-lg">
                    Trasciende la lectura diaria casual. Conecta las Escrituras de manera sistemática y profundiza en los grandes temas bíblicos de una forma que transformará tu comprensión espiritual.
                  </p>
                  <Button
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    aria-label="Solicitar acceso para estudios bíblicos temáticos"
                  >
                    Profundizar en la Palabra Hoy <ChevronsRight className="h-4 w-4 ml-2" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Sección de Contacto Mejorada */}
          <section id="contact" className="py-20 bg-[#111111]/50">
            <div className="container mx-auto px-6 text-center max-w-4xl">
              <div className="flex justify-center">
                <Mail className="h-12 w-12 text-purple-400 mb-6" aria-hidden="true" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">¿Listo para Transformar tu Vida Espiritual?</h2>
              <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
                El acceso a nuestra plataforma es completamente gratuito y se gestiona de forma personal para mantener un espacio seguro, privado y enfocado en tu crecimiento espiritual. Si deseas obtener tu usuario y contraseña personalizados, contáctanos hoy mismo.
              </p>
              <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-4">Contáctanos para obtener acceso gratuito:</h3>
                <a
                  href="mailto:devocionales.biblicos.rv@gmail.com?subject=Solicitud de acceso a Devocionales Bíblicos&body=Hola, me interesa obtener acceso gratuito a la plataforma de Devocionales Bíblicos para comenzar mi crecimiento espiritual."
                  className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-colors text-lg"
                  aria-label="Enviar correo para solicitar acceso gratuito"
                >
                  devocionales.biblicos.rv@gmail.com
                </a>
                <p className="text-gray-400 mt-4 text-sm">
                  Respuesta garantizada en menos de 24 horas
                </p>
              </div>
            </div>
          </section>
          
          {/* Sección para Desarrolladores Mejorada */}
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
                  href="mailto:devocionales.biblicos.rv@gmail.com?subject=Contribución como desarrollador - Devocionales Bíblicos&body=Hola, soy desarrollador y me interesa contribuir al proyecto de Devocionales Bíblicos. Mi experiencia incluye..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Devocionales Bíblicos</h3>
                <p className="text-gray-400 text-sm">
                  Tu plataforma digital gratuita para crecimiento espiritual y estudio bíblico organizado.
                </p>
              </div>
              {/* <div>
                <h4 className="text-white font-semibold mb-4">Enlaces Útiles</h4>
                <nav className="flex flex-col gap-2" aria-label="Enlaces del footer">
                  <a href="/privacidad" className="text-gray-400 hover:text-white text-sm">Política de Privacidad</a>
                  <a href="/terminos" className="text-gray-400 hover:text-white text-sm">Términos de Servicio</a>
                  <a href="/faq" className="text-gray-400 hover:text-white text-sm">Preguntas Frecuentes</a>
                </nav>
              </div> */}
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
                &copy; {new Date().getFullYear()} Devocionales Bíblicos. Todos los derechos reservados. 
                <span className="block mt-2 text-xs">
                  Plataforma cristiana gratuita para devocionales diarios y estudios bíblicos temáticos
                </span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}