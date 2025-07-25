'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from '@/lib/nprogress'
import 'nprogress/nprogress.css'

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // La configuración ya se hace en lib/nprogress.ts
    const handleStop = () => NProgress.done()

    handleStop();
    
    return () => {
      handleStop();
    };
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Nuevo efecto para iniciar la barra de progreso en los clics de navegación
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link) {
        const url = new URL(link.href);
        // Ignorar enlaces que solo navegan a un ancla (#) en la misma página
        if (url.pathname === window.location.pathname && url.hash) {
          return;
        }
        
        // Solo activar para enlaces internos que no abren en una nueva pestaña
        if (url.origin === window.location.origin && link.target !== '_blank') {
          NProgress.start();
        }
      }
    };

    document.addEventListener('click', handleLinkClick);

    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);


  return null; // Este componente no renderiza nada, solo maneja los efectos.
} 