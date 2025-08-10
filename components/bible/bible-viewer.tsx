"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Book, Eye, Copy, ExternalLink, RefreshCw } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { parseReference } from "@/lib/bible-utils";
import { version } from "os";
import { BibleVersionDeno, fetchVersions } from "@/lib/bible/bible-data";


interface Verse {
  verse: string;
  number: number;
  study?: string;
  id: number;
}

interface ChapterData {
  testament: string;
  name: string;
  num_chapters: number;
  chapter: number;
  vers: Verse[];
}

interface BibleViewerProps {
  instanceId?: string;
  reference: string;
  trigger?: React.ReactNode;
  defaultVersion?: string;
  onClose?: (selectedVersion: string) => void;
}

// 🔥 SOLUCIÓN: Portal Manager para PWA (igual que en BibleSelector)
const usePortalManager = (instanceId: string, type: 'dialog' | 'drawer') => {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const portalId = `${type}-portal-viewer-${instanceId}`;
    let portal = document.getElementById(portalId) as HTMLDivElement;
    
    if (!portal) {
      portal = document.createElement('div');
      portal.id = portalId;
      portal.setAttribute('data-portal-type', type);
      portal.setAttribute('data-instance-id', instanceId);
      portal.setAttribute('data-component', 'bible-viewer');
      document.body.appendChild(portal);
    }
    
    portalRef.current = portal;
    mountedRef.current = true;

    return () => {
      if (portal && portal.parentNode) {
        portal.parentNode.removeChild(portal);
      }
      mountedRef.current = false;
    };
  }, [instanceId, type]);

  return { portalRef: portalRef.current, isMounted: mountedRef.current };
};

export function BibleViewer({
  instanceId = "default",
  reference,
  trigger,
  defaultVersion = "rv1960",
  onClose,
}: BibleViewerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);
  const { portalRef } = usePortalManager(instanceId, isMobile ? 'drawer' : 'dialog');
  
  // 🔥 SOLUCIÓN: Local key para forzar re-render cuando cambie instanceId
  const [localKey, setLocalKey] = useState(0);
  useEffect(() => {
    setLocalKey(prev => prev + 1);
    setOpen(false);
  }, [instanceId]);

  // 🔥 SOLUCIÓN: Cleanup mejorado para PWA
  const handleClose = useCallback(() => {
    const finalVersion = selectedVersion;
    setOpen(false);
    
    // Llamar onClose después de cerrar
    if (onClose) {
      // Small delay to ensure proper state cleanup in PWA
      setTimeout(() => {
        onClose(finalVersion);
      }, 50);
    }
    
    // PWA cleanup
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setTimeout(() => {
        if (window.gc) window.gc();
      }, 100);
    }
  }, [selectedVersion, onClose]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      handleClose();
    } else {
      setOpen(isOpen);
    }
  }, [handleClose]);

  // 🔥 SOLUCIÓN: Memoized content component
  const ContentComponent = useCallback(() => (
    <BibleViewerContent
      key={`content-${instanceId}-${localKey}`}
      instanceId={`${instanceId}-${localKey}`}
      reference={reference}
      open={open}
      defaultVersion={selectedVersion}
      onVersionChange={setSelectedVersion}
    />
  ), [instanceId, localKey, reference, open, selectedVersion]);

  if (isMobile) {
    return (
      <Drawer 
        key={`drawer-viewer-${instanceId}-${localKey}`}
        open={open} 
        onOpenChange={handleOpenChange}
        modal={true}
        container={portalRef}
      >
        <DrawerTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-400" />
              {reference}
            </DrawerTitle>
            <DrawerDescription className="text-gray-400">
              Visualiza el versículo en diferentes versiones de la Biblia.
            </DrawerDescription>
          </DrawerHeader>
          <ContentComponent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog 
      key={`dialog-viewer-${instanceId}-${localKey}`}
      open={open} 
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1 h-auto"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
        )}
      </DialogTrigger>
      <DialogContent 
        className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl"
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleClose();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-blue-400" />
            {reference}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Visualiza el versículo en diferentes versiones de la Biblia
          </DialogDescription>
        </DialogHeader>

        <ContentComponent />
      </DialogContent>
    </Dialog>
  );
}

interface BibleViewerContentProps {
  instanceId?: string;
  reference: string;
  open: boolean;
  defaultVersion?: string;
  onVersionChange: (version: string) => void;
}

export function BibleViewerContent({
  instanceId,
  reference,
  open,
  defaultVersion = "rv1960",
  onVersionChange,
}: BibleViewerContentProps) {
  const [versions, setVersions] = useState<BibleVersionDeno[]>([]);
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);
  const [verseData, setVerseData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 SOLUCIÓN: Usar refs para evitar re-renders innecesarios
  const loadingRef = useRef(false);
  const currentRequestRef = useRef<string>('');

  useEffect(() => {
    setSelectedVersion(defaultVersion);
  }, [defaultVersion]);

  useEffect(() => {
    onVersionChange(selectedVersion);
  }, [selectedVersion, onVersionChange]);

  // 🔥 SOLUCIÓN: Memoized version fetching
useEffect(() => {
  if (versions.length <= 0) {
    fetchVersions().then(versiones => {
      setVersions(versiones);
      if (versiones.length > 0 && !selectedVersion) {
        setSelectedVersion(versiones[0].version);
      }
    });
  }
}, [selectedVersion]);

  // 🔥 SOLUCIÓN: Improved content loading with request cancellation
  const loadContent = useCallback(async () => {
    const parsed = parseReference(reference);
    // if (parsed?.book) {
    //   parsed.book = parsed?.book.replace(' ', "-");
    // }

    console.log('Asi me lleva el parse de viewer: ', parsed);
    if (!parsed) {
      setError("Formato de referencia inválido");
      setVerseData(null);
      return;
    }

    // 🔥 SOLUCIÓN: Prevent concurrent requests
    const requestId = `${selectedVersion}-${reference}-${Date.now()}`;
    currentRequestRef.current = requestId;

    if (loadingRef.current) return; // Prevent multiple simultaneous loads
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try { 
      const apiUrl = `https://bible-api.deno.dev/api/read/${selectedVersion}/${parsed.book}/${parsed.startChapter}`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo obtener la información.`);
      }
      
      const data: ChapterData = await res.json();
      
      // Filter verses if necessary
      if (parsed.startVerse) {
        const endVerse = parsed.endVerse || parsed.startVerse;
        data.vers = data.vers.filter(v => v.number >= parsed.startVerse! && v.number <= endVerse);
      }
      
        setVerseData(data);

    } catch(err) {
      if (currentRequestRef.current === requestId) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError("Solicitud cancelada por timeout.");
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar el contenido de la Biblia.");
        }
        setVerseData(null);
      }
    } finally {
      if (currentRequestRef.current === requestId) {
        loadingRef.current = false;
        setLoading(false);
      }
        setLoading(false);

    }
  }, []);

  useEffect(() => {
    if (open) {
      loadContent();
    }
    return () => {
      // Cleanup: cancel any pending request when component unmounts or deps change
      currentRequestRef.current = '';
    };
  }, [open, selectedVersion, reference]);

  const copyToClipboard = useCallback(() => {
    if (!verseData) return;

    const textToCopy = verseData.vers.map(v => `${v.number}. ${v.verse}`).join("\n");
    const fullReference = `${reference} (${selectedVersion.toUpperCase()})`;
    
    navigator.clipboard.writeText(`${fullReference}\n${textToCopy}`)
      .then(() => toast.success("Contenido copiado al portapapeles"))
      .catch(() => toast.error("Error al copiar"));
  }, [verseData, reference, selectedVersion]);

  const openInBibleApp = useCallback(() => {
    const url = `https://www.bible.com/bible/149/${reference.replace(/\s+/g, ".")}`;
    window.open(url, "_blank");
  }, [reference]);

  // 🔥 SOLUCIÓN: Memoized version change handler
  const handleVersionChange = useCallback((version: string) => {
    if (version !== selectedVersion) {
      setSelectedVersion(version);
    }
  }, [selectedVersion]);

  return (
    <div className="space-y-6 p-4" key={`viewer-content-${instanceId}`}>
      {/* Selector de versión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-300">
            Versión:
          </label>
          <Select
            key={`version-select-${instanceId}`}
            value={selectedVersion}
            onValueChange={handleVersionChange}
          >
            <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
              {versions.map((version) => (
                <SelectItem
                  key={`${instanceId}-version-${version.version || version.id}`}
                  value={version.version || version.id}
                  className="hover:bg-[#2a2a2a]"
                >
                  <div>
                    <div className="font-medium">
                      {version.abbreviation ||
                        version.version?.toLocaleUpperCase() ||
                        version.id}
                    </div>
                    <div className="text-xs text-gray-400">{version.name}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadContent}
          disabled={loading}
          className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Contenido del versículo */}
      <div className="bg-[#2a2a2a]/30 rounded-xl p-6 border border-gray-700/50 min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-400">Cargando...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-2">{error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadContent}
              className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
            >
              Reintentar
            </Button>
          </div>
        ) : verseData && verseData.vers.length > 0 ? (
          <div className="space-y-4">
            <ScrollArea className="h-60">
              <div className="pr-4 space-y-3">
                {verseData.vers.map((verse) => (
                  <div key={`${instanceId}-verse-${verse.id}`} className="flex gap-3 items-start">
                    <Badge
                      variant="outline"
                      className="border-blue-500/30 text-blue-400 shrink-0 mt-1"
                    >
                      {verse.number}
                    </Badge>
                    <p className="text-gray-100 leading-relaxed">{verse.verse}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="bg-gray-700/50" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {selectedVersion.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-400">{reference}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInBibleApp}
                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No se encontró contenido para la referencia seleccionada.
          </div>
        )}
      </div>
    </div>
  );
}