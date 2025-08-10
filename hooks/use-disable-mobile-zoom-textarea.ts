import { useEffect } from 'react';

export const useDisableTextareaZoom = () => {
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const originalContent = viewport?.getAttribute('content') || 'width=device-width, initial-scale=1.0';
    
    const handleTextareaFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Solo para textareas específicamente
      if (target && target.tagName.toLowerCase() === 'textarea') {
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }
    };

    const handleTextareaBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName.toLowerCase() === 'textarea') {
        setTimeout(() => {
          if (viewport) {
            viewport.setAttribute('content', originalContent);
          }
        }, 300);
      }
    };

    document.addEventListener('focusin', handleTextareaFocus, { capture: true });
    document.addEventListener('focusout', handleTextareaBlur, { capture: true });

    return () => {
      document.removeEventListener('focusin', handleTextareaFocus, { capture: true });
      document.removeEventListener('focusout', handleTextareaBlur, { capture: true });
    };
  }, []);
};