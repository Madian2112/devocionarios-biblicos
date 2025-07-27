import { useEffect } from 'react';

export const useDisableMobileZoom = () => {
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      if (e.target && (e.target as HTMLElement).matches('input, textarea, select')) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (e.target && (e.target as HTMLElement).matches('input, textarea, select')) {
        setTimeout(() => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
          }
        }, 300);
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);
};