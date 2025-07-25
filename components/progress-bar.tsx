'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStart = () => NProgress.start()
    const handleStop = () => NProgress.done()

    // Este es un truco para que funcione con el App Router de Next.js
    // ya que los eventos de ruta tradicionales no se disparan igual.
    handleStop(); // Detener al cargar la primera vez
    
    return () => {
      handleStop(); // Asegurarse de que pare si el componente se desmonta
    };
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null; // Este componente no renderiza nada, solo maneja los efectos.
} 