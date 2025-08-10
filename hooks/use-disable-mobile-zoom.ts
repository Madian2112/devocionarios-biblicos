  import { useEffect } from 'react';

  export const useDisableMobileZoom = () => {
    useEffect(() => {
      // Guardar el viewport original
      const viewport = document.querySelector('meta[name="viewport"]');
      const originalContent = viewport?.getAttribute('content') || 'width=device-width, initial-scale=1.0';
      
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.matches('input, textarea, select')) {
          // Prevenir el zoom inmediatamente
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          }
        }
      };

      const handleFocusOut = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.matches('input, textarea, select')) {
          // Restaurar el viewport original después de un delay más largo
          setTimeout(() => {
            if (viewport) {
              viewport.setAttribute('content', originalContent);
            }
          }, 500); // Aumenté el delay a 500ms
        }
      };

      // Usar capture: true para interceptar antes
      document.addEventListener('focusin', handleFocusIn, { capture: true });
      document.addEventListener('focusout', handleFocusOut, { capture: true });

      return () => {
        document.removeEventListener('focusin', handleFocusIn, { capture: true });
        document.removeEventListener('focusout', handleFocusOut, { capture: true });
        // Restaurar viewport original al desmontar
        if (viewport) {
          viewport.setAttribute('content', originalContent);
        }
      };
    }, []);
  };