import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { BookOpen, Feather, Lock, Mail, Heart } from "lucide-react";
import Image from "next/image";

interface LandingPageProps {
  onLoginClick: () => void;
}

export function LandingPage({ onLoginClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="text-center max-w-4xl mx-auto">
        {/* Header */}
        <div className="inline-flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Heart className="h-8 w-8 text-white" />
            </div>
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Un Corazón que Escucha
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mt-2">
              Tu devocional diario, un encuentro personal con la Palabra.
            </p>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed my-12">
          En la quietud de tu día, encuentra un refugio para meditar. Esta herramienta no es solo un diario; es un puente para profundizar tu relación con Dios, permitiéndote registrar las revelaciones, dudas y aprendizajes que Él deposita en tu corazón a través de Su Palabra.
        </p>

        {/* Botón de Login */}
        <Button
          onClick={onLoginClick}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg text-lg h-14 px-8"
        >
          <Lock className="h-5 w-5 mr-3" />
          Acceder con mi Usuario
        </Button>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24 max-w-4xl mx-auto">
          <GradientCard>
            <div className="p-8">
              <Feather className="h-8 w-8 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Simple y Enfocado</h3>
              <p className="text-gray-400 mt-2">
                Una interfaz limpia y sin distracciones para que te concentres
                en lo más importante: tu relación con Dios.
              </p>
            </div>
          </GradientCard>
          <GradientCard>
            <div className="p-8">
              <BookOpen className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white">Estudio Profundo</h3>
              <p className="text-gray-400 mt-2">
                No solo registres devocionales, sino que también organiza tus
                estudios por temas para un mayor entendimiento.
              </p>
            </div>
          </GradientCard>
        </div>

        {/* Sección de Contacto para Nuevos Usuarios */}
        <div className="mt-24 pt-12 border-t border-gray-800 text-center max-w-3xl mx-auto">
            <div className="inline-block p-3 bg-gradient-to-br from-green-500 to-cyan-500 rounded-2xl mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">¿Te gustaría unirte?</h2>
            <p className="text-gray-400 text-lg mb-6">
                El acceso a esta herramienta es personal y se gestiona de forma individual para mantener un espacio seguro y enfocado. Si deseas crear tu propio usuario y contraseña para comenzar a registrar tus devocionales, por favor, contáctanos.
            </p>
            <a
                href="mailto:devocionales.biblicos.rv@gmail.com"
                className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
                devocionales.biblicos.rv@gmail.com
            </a>
        </div>
      </div>
    </div>
  );
} 