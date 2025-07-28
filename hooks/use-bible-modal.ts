import { useState, useEffect, useCallback, useRef } from 'react';

interface BibleModalState {
  id: string;
  type: 'selector' | 'viewer';
  isOpen: boolean;
  data: any;
}

let globalModalState: BibleModalState | null = null;
let globalStateListeners: Set<(state: BibleModalState | null) => void> = new Set();

export const useBibleModal = (instanceId: string) => {
  const [localState, setLocalState] = useState<BibleModalState | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Listener para cambios globales
  useEffect(() => {
    const updateLocalState = (newState: BibleModalState | null) => {
      if (mountedRef.current) {
        setLocalState(newState);
      }
    };

    globalStateListeners.add(updateLocalState);
    setLocalState(globalModalState);

    return () => {
      globalStateListeners.delete(updateLocalState);
    };
  }, []);

  const updateGlobalState = useCallback((newState: BibleModalState | null) => {
    globalModalState = newState;
    globalStateListeners.forEach(listener => listener(newState));
  }, []);

  const openModal = useCallback((type: 'selector' | 'viewer', data: any) => {
    // Cerrar cualquier modal activo
    if (globalModalState?.isOpen) {
      document.body.style.overflow = 'unset';
    }

    // Pequeño delay para PWA
    setTimeout(() => {
      if (mountedRef.current) {
        updateGlobalState({
          id: instanceId,
          type,
          isOpen: true,
          data
        });
        document.body.style.overflow = 'hidden';
      }
    }, 50);
  }, [instanceId, updateGlobalState]);

  const closeModal = useCallback(() => {
    if (globalModalState?.id === instanceId) {
      updateGlobalState(null);
      document.body.style.overflow = 'unset';
    }
  }, [instanceId, updateGlobalState]);

  const isThisModalOpen = localState?.id === instanceId && localState?.isOpen;

  return {
    isOpen: isThisModalOpen,
    modalData: isThisModalOpen ? localState?.data : null,
    openModal,
    closeModal,
    modalType: localState?.type
  };
};