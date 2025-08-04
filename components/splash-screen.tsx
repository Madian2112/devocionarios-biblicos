'use client';

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Dar tiempo para la animación de salida
      setTimeout(onComplete, 300);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [onComplete, minDuration]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center transition-opacity duration-300 opacity-0">
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full">
          <BookOpen className="h-16 w-16 text-white" />
        </div>
      </div>

      {/* Título */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Devocionales Bíblicos
      </h1>
      
      {/* Subtítulo */}
      <p className="text-gray-400 text-center mb-8 px-4">
        con Notas
      </p>

      {/* Loading Animation */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
      </div>

      {/* Texto de carga */}
      <p className="text-gray-500 text-sm mt-4 animate-pulse">
        Preparando tu espacio espiritual...
      </p>
    </div>
  );
}