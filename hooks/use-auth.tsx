"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Usamos un try-catch porque el localStorage no existe en el servidor.
    try {
      const authStatus = localStorage.getItem('isAuthenticated')
      if (authStatus === 'true') {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push('/') // Redirigir si no está autenticado
      }
    } catch (error) {
      // Si hay un error (ej. en el servidor), asumimos que no está autenticado.
      setIsAuthenticated(false)
      router.push('/')
    }
  }, [router])

  return isAuthenticated
} 