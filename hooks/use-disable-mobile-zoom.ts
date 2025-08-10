import { useEffect } from 'react';

export const useDisableMobileZoom = () => {
  useEffect(() => {
    // Método más agresivo: cambiar viewport globalmente
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (viewport) {
      // Establecer viewport restrictivo desde el inicio
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }

    // Prevenir gestos de zoom
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventDoubleTabZoom = (e: TouchEvent) => {
      let clickTime = new Date().getTime();
      if (clickTime - (window as any).lastClickTime < 300) {
        e.preventDefault();
      }
      (window as any).lastClickTime = clickTime;
    };

    // Agregar event listeners
    document.addEventListener('touchstart', preventZoom, { passive: false });
    document.addEventListener('touchend', preventDoubleTabZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventZoom);
      document.removeEventListener('touchend', preventDoubleTabZoom);
      
      // Restaurar viewport al desmontar (opcional)
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
      }
    };
  }, []);
};