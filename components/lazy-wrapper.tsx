"use client";

import { Suspense, ComponentType, ReactNode } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

// 🚀 Wrapper optimizado para lazy loading
export function LazyWrapper({ children, fallback, className = "" }: LazyWrapperProps) {
  const defaultFallback = (
    <div className={`flex items-center justify-center min-h-[200px] ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <LoadingSpinner size="sm" />
        <p className="text-gray-400 text-xs">Cargando componente...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// 🚀 HOC para crear componentes lazy optimizados
export function withLazy<P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) {
  const LazyComponent = (props: P) => (
    <LazyWrapper fallback={fallback}>
      <Component {...props} />
    </LazyWrapper>
  );
  
  LazyComponent.displayName = `withLazy(${Component.displayName || Component.name})`;
  return LazyComponent;
} 