"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export const usePWACleanup = () => {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      // --- Lógica de limpieza ---
      document.body.style.overflow = "unset";

      // Forzar reflow
      window.requestAnimationFrame(() => {
        document.body.offsetHeight;
      });

      prevPath.current = pathname;
    }
  }, [pathname]);
};
