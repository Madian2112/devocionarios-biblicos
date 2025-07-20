"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const ZOOM_STORAGE_KEY = "app-zoom-level";

interface ZoomContextType {
  zoom: number;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  resetZoom: () => void;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState<number>(100);

  useEffect(() => {
    const storedZoom = localStorage.getItem(ZOOM_STORAGE_KEY);
    if (storedZoom) {
      setZoom(Number(storedZoom));
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
    localStorage.setItem(ZOOM_STORAGE_KEY, zoom.toString());
  }, [zoom]);

  const increaseZoom = () => {
    setZoom((prev) => Math.min(prev + 10, 150)); // Cap at 150%
  };

  const decreaseZoom = () => {
    setZoom((prev) => Math.max(prev - 10, 50)); // Cap at 50%
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const value = { zoom, increaseZoom, decreaseZoom, resetZoom };

  return <ZoomContext.Provider value={value}>{children}</ZoomContext.Provider>;
}

export function useZoom() {
  const context = useContext(ZoomContext);
  if (context === undefined) {
    throw new Error("useZoom must be used within a ZoomProvider");
  }
  return context;
} 