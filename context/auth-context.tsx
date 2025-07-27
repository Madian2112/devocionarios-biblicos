"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { notificationSystem } from '@/lib/hybrid-notification-system';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 🚀 onAuthStateChanged optimizado
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // 🎯 Inicializar sistema híbrido cuando el usuario se autentica
      if (currentUser) {
        try {
          console.log('🚀 Inicializando sistema híbrido para usuario autenticado...');
          const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Hermano(a)';
          const userEmail = currentUser.email || '';
          
          // Inicializar en background sin bloquear la UI
          notificationSystem.initialize(userName)
            .then((result) => {
              console.log('✅ Sistema híbrido inicializado:', result);
              
              // Iniciar recordatorios automáticos si están habilitados
              // notificationSystem.startAutomaticReminders();
            })
            .catch((error) => {
              console.warn('⚠️ Error inicializando sistema híbrido:', error);
            });
            
        } catch (error) {
          console.error('❌ Error en inicialización híbrida:', error);
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error en auth state:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚀 Memoizar signOut para evitar recreaciones
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, []);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    signOut 
  }), [user, loading, signOut]);

  // 🚀 Loading optimizado
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">Inicializando...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider');
  }
  return context;
}