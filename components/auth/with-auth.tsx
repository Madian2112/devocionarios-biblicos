"use client";

import { useAuthContext } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function withAuth<P extends object>(Component: React.ComponentType<P>) {
  const AuthComponent = (props: P) => {
    const { user, loading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
      // Si no está cargando y no hay usuario, redirigir al login.
      if (!loading && !user) {
        router.replace('/login');
      }
    }, [user, loading, router]);

    // Si está cargando o no hay usuario (aún no se ha redirigido),
    // muestra un spinner para evitar mostrar contenido protegido.
    if (loading || !user) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // Si hay un usuario, renderiza el componente de la página.
    return <Component {...props} />;
  };

  return AuthComponent;
} 