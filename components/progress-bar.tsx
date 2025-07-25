'use client'

import { useEffect, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from '@/lib/nprogress'
import 'nprogress/nprogress.css'

export default function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 🚀 Optimización: usar useCallback para evitar recrear funciones
  const handleStop = useCallback(() => {
    NProgress.done()
  }, [])

  const handleStart = useCallback(() => {
    NProgress.start()
  }, [])

  // 🚀 Efecto optimizado para detener en cambios de ruta
  useEffect(() => {
    // Pequeño delay para suavizar la transición
    const timer = setTimeout(() => {
      handleStop()
    }, 100)

    return () => {
      clearTimeout(timer)
      handleStop()
    }
  }, [pathname, searchParams, handleStop])

  // 🚀 Efecto optimizado para capturar clicks de navegación
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (!link) return

      try {
        const url = new URL(link.href)
        
        // 🚀 Optimización: verificaciones más rápidas
        if (
          url.origin === window.location.origin && 
          link.target !== '_blank' &&
          url.pathname !== window.location.pathname &&
          !url.hash // No iniciar para enlaces de ancla
        ) {
          handleStart()
        }
      } catch {
        // URL inválida, ignorar
      }
    }

    // 🚀 Usar captura para mejor rendimiento
    document.addEventListener('click', handleLinkClick, { capture: true, passive: true })

    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true })
    }
  }, [handleStart])

  return null
} 