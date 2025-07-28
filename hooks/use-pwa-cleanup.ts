// hooks/use-pwa-cleanup.ts
"use client";

import { useEffect, useRef } from 'react';

/**
 * Hook para manejar la limpieza de elementos DOM en PWA
 * Soluciona problemas de duplicación de componentes Dialog/Drawer
 */
export function usePWACleanup(instanceId: string) {
  const cleanupTriggeredRef = useRef(false);

  useEffect(() => {
    // 🔥 SOLUCIÓN: Limpiar elementos DOM órfanos en PWA
    const cleanupOrphanedElements = () => {
      if (cleanupTriggeredRef.current) return;
      cleanupTriggeredRef.current = true;

      // Limpiar portales específicos de esta instancia
      const portalsToClean = [
        `dialog-portal-${instanceId}`,
        `drawer-portal-${instanceId}`,
        `dialog-portal-viewer-${instanceId}`,
        `drawer-portal-viewer-${instanceId}`
      ];

      portalsToClean.forEach(portalId => {
        const existingPortal = document.getElementById(portalId);
        if (existingPortal && existingPortal.parentNode) {
          existingPortal.parentNode.removeChild(existingPortal);
        }
      });

      // Limpiar elementos de Radix UI que puedan quedar órfanos
      const radixElements = document.querySelectorAll('[data-radix-portal]');
      radixElements.forEach(element => {
        const instanceAttr = element.getAttribute('data-instance-id');
        if (instanceAttr === instanceId) {
          element.remove();
        }
      });

      // Reset el flag después de un delay
      setTimeout(() => {
        cleanupTriggeredRef.current = false;
      }, 1000);
    };

    // Ejecutar limpieza en diferentes momentos críticos de PWA
    const timeouts = [
      setTimeout(cleanupOrphanedElements, 100),  // Limpieza inmediata
      setTimeout(cleanupOrphanedElements, 500),  // Limpieza post-render
      setTimeout(cleanupOrphanedElements, 1500)  // Limpieza tardía
    ];

    // Listener para mensajes del Service Worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data.action === 'cleanup-portal-elements' && 
          event.data.data?.instanceId === instanceId) {
        cleanupOrphanedElements();
      }
    };

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Cleanup al desmontar
    return () => {
      timeouts.forEach(clearTimeout);
      
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      
      // Limpieza final
      cleanupOrphanedElements();
    };
  }, [instanceId]);

  // Función para limpiar manualmente desde el componente
  const triggerCleanup = () => {
    cleanupTriggeredRef.current = false;
    
    const portalsToClean = [
      `dialog-portal-${instanceId}`,
      `drawer-portal-${instanceId}`,
      `dialog-portal-viewer-${instanceId}`, 
      `drawer-portal-viewer-${instanceId}`
    ];

    portalsToClean.forEach(portalId => {
      const existingPortal = document.getElementById(portalId);
      if (existingPortal && existingPortal.parentNode) {
        existingPortal.parentNode.removeChild(existingPortal);
      }
    });
  };

  return { triggerCleanup };
}

/**
 * Hook específico para detectar y manejar entorno PWA
 */
export function usePWADetection() {
  const isPWA = useRef(false);

  useEffect(() => {
    // Detectar si estamos en PWA
    const detectPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSPWA = isIOS && (navigator as any).standalone;
      
      isPWA.current = isStandalone || isIOSPWA || 
                     document.referrer.includes('android-app://') ||
                     window.location.search.includes('source=pwa');
      
      return isPWA.current;
    };

    detectPWA();

    // Listener para cambios en display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      isPWA.current = e.matches;
    };

    mediaQuery.addListener(handleDisplayModeChange);

    return () => {
      mediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  return isPWA.current;
}