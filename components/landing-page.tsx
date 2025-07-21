import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { BookOpen, Feather, Lock } from "lucide-react";
import Image from "next/image";

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-4xl mx-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-4 mb-6">
          {/* <div className="p-2 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Devocionarios Bíblicos Logo"
              width={56}
              height={56}
              className="h-14 w-14"
            />
          </div> */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Devocionarios Bíblicos
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mt-1">
              Tu espacio personal para la reflexión y el estudio profundo.
            </p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed my-12">
          Una herramienta diseñada para ayudarte a registrar, organizar y
          profundizar en tus devocionales diarios y estudios temáticos de la
          Biblia. Guarda tus aprendizajes, conecta ideas y sigue tu progreso
          espiritual en un solo lugar.
        </p>

        {/* Botón de Login */}
        <Button
          onClick={onLoginClick}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg h-14 px-8"
        >
          <Lock className="h-5 w-5 mr-3" />
          Acceder a la Aplicación
        </Button>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 max-w-3xl mx-auto">
          <GradientCard>
            <div className="p-6">
              <Feather className="h-8 w-8 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Simple y Enfocado</h3>
              <p className="text-gray-400 mt-2">
                Una interfaz limpia y sin distracciones para que te concentres
                en lo más importante: tu relación con Dios.
              </p>
            </div>
          </GradientCard>
          <GradientCard>
            <div className="p-6">
              <BookOpen className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Estudio Profundo</h3>
              <p className="text-gray-400 mt-2">
                No solo registres devocionales, sino que también organiza tus
                estudios por temas para un mayor entendimiento.
              </p>
            </div>
          </GradientCard>
        </div>

        {/* Footer con Contacto */}
        <div className="mt-20 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500">
            ¿Preguntas o sugerencias? Contáctame.
          </p>
          <a
            href="mailto:madian.reyes212006@gmail.com"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            correo.prueba@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
} 