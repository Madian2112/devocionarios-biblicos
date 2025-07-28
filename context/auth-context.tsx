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

// 🚀 Constantes para el cache basado en UID
const USER_SESSION_KEY = 'user_session_uid';
const USER_PROFILE_KEY = 'user_profile_cache';

// 📝 Interface para datos del usuario cacheados
interface CachedUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  lastLoginAt: number;
  createdAt: number;
}

// 💾 Funciones de cache simplificadas (sin expiración temporal)
const setCachedUserSession = (user: User | null) => {
  try {
    if (user) {
      // Guardar solo el UID como indicador de sesión activa
      localStorage.setItem(USER_SESSION_KEY, user.uid);
      
      // Guardar perfil completo del usuario
      const userProfile: CachedUserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        lastLoginAt: Date.now(),
        createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : Date.now()
      };
      
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(userProfile));
      
      console.log('✅ Sesión de usuario cacheada:', user.uid);
    } else {
      // Limpiar completamente la sesión
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem(USER_PROFILE_KEY);
      console.log('🧹 Cache de sesión limpiado');
    }
  } catch (error) {
    console.warn('Error manejando cache de sesión:', error);
  }
};

const getCachedUserSession = (): { isAuthenticated: boolean, userProfile: CachedUserProfile | null } => {
  try {
    const sessionUid = localStorage.getItem(USER_SESSION_KEY);
    const profileData = localStorage.getItem(USER_PROFILE_KEY);
    
    if (!sessionUid || !profileData) {
      return { isAuthenticated: false, userProfile: null };
    }

    const userProfile: CachedUserProfile = JSON.parse(profileData);
    
    // Verificar que el UID coincida por seguridad
    if (userProfile.uid !== sessionUid) {
      console.warn('⚠️ Inconsistencia en cache - limpiando');
      cleanUserCache();
      return { isAuthenticated: false, userProfile: null };
    }
    
    return { 
      isAuthenticated: true, 
      userProfile 
    };
  } catch (error) {
    console.warn('Error leyendo cache de sesión:', error);
    cleanUserCache();
    return { isAuthenticated: false, userProfile: null };
  }
};

const cleanUserCache = () => {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
  } catch (error) {
    console.warn('Error limpiando cache:', error);
  }
};

// 🏗️ Crear mock user desde cache para navegación inmediata
const createMockUserFromCache = (profile: CachedUserProfile): User => {
  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    emailVerified: profile.emailVerified,
    metadata: {
      creationTime: new Date(profile.createdAt).toUTCString(),
      lastSignInTime: new Date(profile.lastLoginAt).toUTCString()
    },
    // Métodos que podrían necesitarse
    getIdToken: async (forceRefresh?: boolean) => {
      // Firebase se encarga de esto en background
      if (auth.currentUser) {
        return auth.currentUser.getIdToken(forceRefresh);
      }
      throw new Error('Usuario no autenticado en Firebase');
    },
    getIdTokenResult: async (forceRefresh?: boolean) => {
      if (auth.currentUser) {
        return auth.currentUser.getIdTokenResult(forceRefresh);
      }
      throw new Error('Usuario no autenticado en Firebase');
    },
    reload: async () => {
      if (auth.currentUser) {
        return auth.currentUser.reload();
      }
    },
    delete: async () => {
      if (auth.currentUser) {
        return auth.currentUser.delete();
      }
      throw new Error('Usuario no autenticado en Firebase');
    }
  } as User;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 🚀 VERIFICACIÓN INSTANTÁNEA: Solo revisar si hay UID en cache
    const { isAuthenticated, userProfile } = getCachedUserSession();
    
    if (isAuthenticated && userProfile) {
      // Crear usuario mock para navegación inmediata
      const mockUser = createMockUserFromCache(userProfile);
      setUser(mockUser);
      console.log('⚡ Usuario cargado desde cache UID:', userProfile.uid);
    } else {
      setUser(null);
      console.log('❌ No hay sesión cacheada - mostrando landing');
    }
    
    setIsInitialized(true);

    // 🔄 VALIDACIÓN EN BACKGROUND: Firebase confirma el estado real
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Usuario confirmado por Firebase
        setUser(firebaseUser);
        setCachedUserSession(firebaseUser);
        
        // Inicialización del sistema híbrido solo si es nuevo o cambió
        if (!userProfile || userProfile.uid !== firebaseUser.uid) {
          setTimeout(async () => {
            try {
              const userName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Hermano(a)';
              
              notificationSystem.initialize(userName)
                .then(() => console.log('✅ Sistema híbrido inicializado'))
                .catch((error) => console.warn('⚠️ Error inicializando sistema híbrido:', error));
                
            } catch (error) {
              console.error('❌ Error en inicialización híbrida:', error);
            }
          }, 100);
        }
      } else {
        // No hay usuario en Firebase - limpiar todo
        setUser(null);
        setCachedUserSession(null);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error en auth state:", error);
      // En caso de error, limpiar cache por seguridad
      cleanUserCache();
      setUser(null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚪 SignOut ultra simple - solo limpiar UID
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Limpiar sesión local INMEDIATAMENTE
      cleanUserCache();
      setUser(null);
      
      // 2. Notificar a Firebase (en background)
      await firebaseSignOut(auth);
      
      console.log('✅ Sesión cerrada completamente');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún así limpiar cache local
      cleanUserCache();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    signOut 
  }), [user, loading, signOut]);

  // 🚀 Loading mínimo solo durante inicialización
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 text-sm animate-pulse">Iniciando...</p>
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

// 🎯 Hook para verificación ultra rápida de sesión
export function useQuickAuthCheck() {
  const { isAuthenticated, userProfile } = getCachedUserSession();
  return {
    isAuthenticated,
    userUid: userProfile?.uid || null,
    userEmail: userProfile?.email || null,
    displayName: userProfile?.displayName || null
  };
}

// 🛠️ Utilidades adicionales
export const authUtils = {
  // Verificar si hay sesión activa sin crear contexto
  hasActiveSession: (): boolean => {
    return !!localStorage.getItem(USER_SESSION_KEY);
  },
  
  // Obtener UID rápidamente
  getCurrentUID: (): string | null => {
    return localStorage.getItem(USER_SESSION_KEY);
  },
  
  // Limpiar sesión manualmente (útil para debugging)
  clearSession: () => {
    cleanUserCache();
  }
};