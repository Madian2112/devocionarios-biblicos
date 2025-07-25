"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AutoPrefetchProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// 🚀 Componente que hace prefetch automático cuando el link es visible
export function AutoPrefetch({ href, children, className, disabled = false }: AutoPrefetchProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (disabled || hasPrefetched.current) return;

    const element = ref.current;
    if (!element) return;

    // 🚀 Intersection Observer optimizado
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasPrefetched.current) {
            hasPrefetched.current = true;
            
            // 🚀 Prefetch la ruta cuando sea visible
            router.prefetch(href);
            
            // Desconectar después del primer prefetch
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Prefetch cuando esté 100px antes de ser visible
        threshold: 0.1, // Trigger cuando 10% sea visible
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [href, router, disabled]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// 🚀 Hook para prefetch manual
export function usePrefetch() {
  const router = useRouter();

  const prefetch = (href: string) => {
    router.prefetch(href);
  };

  return { prefetch };
} 