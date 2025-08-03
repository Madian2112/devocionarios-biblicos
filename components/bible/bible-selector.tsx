"use client";

import type React from "react";
import { useState, useEffect, use, useCallback, useRef } from "react";
import { Book } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { bibleService, fetchBibleBooks, BibleBook, getBibleVersions, BibleVersion } from "@/lib/bible-data";
import { parseReference, normalizeText } from "@/lib/bible-utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";

interface BibleSelectorProps {
  onSelect: (reference: string) => void;
  trigger?: React.ReactNode;
  currentReference?: string;
  instanceId?: string;
}

const LibroApocalpsis = (libro: string) =>{
  return libro === "Revelación" ? "Apocalipsis" : libro;
}

// 🔥 SOLUCIÓN: Portal Manager para PWA
const usePortalManager = (instanceId: string, type: 'dialog' | 'drawer') => {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Crear un contenedor único para esta instancia
    const portalId = `${type}-portal-${instanceId}`;
    let portal = document.getElementById(portalId) as HTMLDivElement;
    
    if (!portal) {
      portal = document.createElement('div');
      portal.id = portalId;
      portal.setAttribute('data-portal-type', type);
      portal.setAttribute('data-instance-id', instanceId);
      document.body.appendChild(portal);
    }
    
    portalRef.current = portal;
    mountedRef.current = true;

    return () => {
      // Cleanup: remover el portal cuando el componente se desmonte
      if (portal && portal.parentNode) {
        portal.parentNode.removeChild(portal);
      }
      mountedRef.current = false;
    };
  }, [instanceId, type]);

  return { portalRef: portalRef.current, isMounted: mountedRef.current };
};

export function BibleSelector({
  onSelect,
  trigger,
  currentReference = "Juan 3:16",
  instanceId = "default",
}: BibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { portalRef } = usePortalManager(instanceId, isMobile ? 'drawer' : 'dialog');
  
  // 🔥 SOLUCIÓN: Reset state when instanceId changes
  const [localKey, setLocalKey] = useState(0);
  useEffect(() => {
    setLocalKey(prev => prev + 1);
    setOpen(false); // Force close when instanceId changes
  }, [instanceId]);
  
  // 🔥 SOLUCIÓN: Cleanup function for PWA
  const handleClose = useCallback(() => {
    setOpen(false);
    // Small delay to ensure proper cleanup in PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setTimeout(() => {
        // Force garbage collection hint for PWA
        if (window.gc) window.gc();
      }, 100);
    }
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      handleClose();
    } else {
      setOpen(newOpen);
    }
  }, [handleClose]);
  
  const FormContent = (
    <BibleSelectorForm
      key={`form-${instanceId}-${localKey}`}
      onSelect={(reference) => {
        onSelect(reference);
        handleClose();
      }}
      setOpen={setOpen}
      currentReference={currentReference}
      instanceId={`${instanceId}-${localKey}`}
    />
  );
  
  if (isMobile) {
    return (
      <Drawer 
        key={`drawer-${instanceId}-${localKey}`} 
        open={open} 
        onOpenChange={handleOpenChange}
        // 🔥 SOLUCIÓN: Portal específico para PWA
        modal={true}
        container={portalRef}
      >
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <DrawerHeader className="text-left">
            <DrawerTitle>Seleccionar Pasaje Bíblico</DrawerTitle>
            <DrawerDescription>Elige el libro, capítulo y versículo(s).</DrawerDescription>
          </DrawerHeader>
          {FormContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog 
      key={`dialog-${instanceId}-${localKey}`} 
      open={open} 
      onOpenChange={handleOpenChange}
      // 🔥 SOLUCIÓN: Portal específico para PWA
      modal={true}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent 
        className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl"
        // 🔥 SOLUCIÓN: Prevent event bubbling in PWA
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
          <DialogTitle>Seleccionar Pasaje Bíblico</DialogTitle>
          <DialogDescription>Elige el libro, capítulo y versículo(s).</DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
}

interface BibleSelectorFormProps {
  onSelect: (reference: string) => void;
  setOpen: (open: boolean) => void;
  currentReference?: string;
  instanceId?: string;
}

function BibleSelectorForm({
  onSelect,
  setOpen,
  currentReference,
  instanceId = "default",
}: BibleSelectorFormProps) {
    const [selectionType, setSelectionType] = useState<'verse' | 'chapter'>('verse');
    const [selectedBook, setSelectedBook] = useState('Juan');
    const [startChapter, setStartChapter] = useState(3);
    const [endChapter, setEndChapter] = useState<number | null>(null);
    const [startVerse, setStartVerse] = useState(16);
    const [endVerse, setEndVerse] = useState<number | null>(null);

    const [books, setBooks] = useState<BibleBook[]>([]);
    const [versions, setVersions] = useState<BibleVersion[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);

    // 🔥 SOLUCIÓN: Memoized initialization to prevent re-renders
    const initializeState = useCallback(() => {
        const parsed = parseReference(currentReference || "");
        
        if (parsed) {
            if (parsed.startVerse) {
                setSelectionType('verse');
                setStartVerse(parsed.startVerse);
                setEndVerse(parsed.endVerse || null);
            } else {
                setSelectionType('chapter');
                setStartVerse(1);
                setEndVerse(null);
            }
            setSelectedBook(parsed.book.replace('-', ' '));
            setStartChapter(parsed.startVerse ?? 1);
            setEndChapter(parsed.endVerse || null);
        }
    }, [currentReference]);

    // Efecto #1: Inicialización del estado
    useEffect(() => {
        initializeState();
    }, [initializeState, instanceId]);

    // Efecto #2: Carga de datos
    useEffect(() => {
      setLoadingBooks(true);
      fetchBibleBooks().then(data => {
        setBooks(data);
        setLoadingBooks(false);
      }).catch(() => setLoadingBooks(false));

      setVersions(getBibleVersions());
    }, [instanceId]);

    // Efecto #3: Sincronización de libro
    useEffect(() => {
      if (books.length > 0 && selectedBook) {
        const bookMatch = books.find(b => normalizeText(b.name) === normalizeText(selectedBook));
        if (bookMatch && bookMatch.name !== selectedBook) {
          setSelectedBook(bookMatch.name);
        }
      }
    }, [books, selectedBook, instanceId]); 

    const handleBookChange = useCallback((bookName: string) => {
        setSelectedBook(bookName);
        setStartChapter(1);
        setEndChapter(null);
        setStartVerse(1);
        setEndVerse(null);
    }, []);

    const selectedBookData = books.find(book => LibroApocalpsis(book.name) === selectedBook);
    const maxChapters = selectedBookData?.chapters || 1;
    const maxVerses = selectedBookData?.chapter_verses && startChapter
        ? selectedBookData.chapter_verses[startChapter.toString()] || 1
        : 1;

    const handleSelect = useCallback(() => {
        let reference = '';
        
        if (selectionType === 'verse') {
            reference = bibleService.formatReference(selectedBook, startChapter, startVerse, endVerse || undefined);
        } else {
            reference = `${selectedBook} ${startChapter}`;
        }
        console.log('Asi esta la referencia seleccionada: ', reference);
        onSelect(reference);
        setOpen(false);
    }, [selectionType, selectedBook, startChapter, startVerse, endVerse, onSelect, setOpen]);
    
    const generatePreviewReference = useCallback(() => {
        if (selectionType === 'verse') {
             return bibleService.formatReference(selectedBook, startChapter, startVerse, endVerse || undefined);
        }
        return `${selectedBook} ${startChapter}`;
    }, [selectionType, selectedBook, startChapter, startVerse, endVerse]);

  return (
    <div className="space-y-6 p-4" key={`form-content-${instanceId}`}>
        {/* Switch para tipo de selección */}
        <div className="flex items-center justify-center space-x-2">
            <Label>Versículo</Label>
            <Switch
                checked={selectionType === 'chapter'}
                onCheckedChange={(checked) => setSelectionType(checked ? 'chapter' : 'verse')}
            />
            <Label>Capítulo</Label>
        </div>

      {/* Selector de libro */}
      <div>
        <Label className="text-gray-300 mb-2 block">Libro</Label>
        <Select 
          key={`book-select-${instanceId}`} 
          value={selectedBook} 
          onValueChange={handleBookChange} 
          disabled={loadingBooks}
        >
          <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
            <SelectValue placeholder="Seleccione un libro" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
             <ScrollArea className="h-60">
                {loadingBooks ? (
                  <div className="text-center text-gray-400 py-4">Cargando libros...</div>
                ) : (
                  books.map((book) => (
                    <SelectItem
                      key={`${instanceId}-book-${LibroApocalpsis(book.name)}`}
                      value={LibroApocalpsis(book.name)}
                      className="hover:bg-[#2a2a2a]"
                    >
                      {LibroApocalpsis(book.name)}
                    </SelectItem>
                  ))
                )}
              </ScrollArea>
          </SelectContent>
        </Select>
      </div>

      {/* Selectores condicionales */}
      {selectionType === 'verse' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Capítulo */}
          <div>
            <Label className="text-gray-300 mb-2 block">Capítulo</Label>
            <Select 
              key={`chapter-select-${instanceId}`} 
              value={startChapter.toString()} 
              onValueChange={(v) => setStartChapter(parseInt(v))} 
              disabled={!selectedBook}
            >
              <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                <SelectValue placeholder="Seleccione un capítulo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                <ScrollArea className="h-60">
                  {Array.from({ length: maxChapters }, (_, i) => i + 1).map(c => 
                    <SelectItem key={`${instanceId}-chapter-${c}`} value={c.toString()} className="hover:bg-[#2a2a2a]">
                      {c}
                    </SelectItem>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          {/* Versículo Inicial */}
          <div>
            <Label className="text-gray-300 mb-2 block">Versículo</Label>
            <Select 
              key={`verse-select-${instanceId}`} 
              value={startVerse.toString()} 
              onValueChange={(v) => setStartVerse(parseInt(v))} 
              disabled={!selectedBook}
            >
               <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                 <SelectValue placeholder="Seleccione un versículo" />
               </SelectTrigger>
               <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                 <ScrollArea className="h-60">
                   {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => 
                     <SelectItem key={`${instanceId}-verse-${v}`} value={v.toString()} className="hover:bg-[#2a2a2a]">
                       {v}
                     </SelectItem>
                   )}
                 </ScrollArea>
               </SelectContent>
            </Select>
          </div>
          {/* Versículo Final */}
          <div>
            <Label className="text-gray-300 mb-2 block">Hasta (opcional)</Label>
            <Select 
              key={`end-verse-select-${instanceId}`} 
              value={endVerse?.toString() || 'none'} 
              onValueChange={(v) => setEndVerse(v === 'none' ? null : parseInt(v))} 
              disabled={!selectedBook}
            >
              <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                <ScrollArea className="h-60">
                    <SelectItem key={`${instanceId}-none`} value="none" className="hover:bg-[#2a2a2a]">
                      Solo un versículo
                    </SelectItem>
                    {Array.from({ length: maxVerses }, (_, i) => i + 1).filter(v => v > startVerse).map(v => 
                      <SelectItem key={`${instanceId}-end-verse-${v}`} value={v.toString()} className="hover:bg-[#2a2a2a]">
                        {v}
                      </SelectItem>
                    )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Capítulo</Label>
              <Select 
                key={`chapter-only-select-${instanceId}`} 
                value={startChapter.toString()} 
                onValueChange={(v) => setStartChapter(parseInt(v))} 
                disabled={!selectedBook}
              >
                <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                  <SelectValue placeholder="Seleccione un capítulo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                  <ScrollArea className="h-60">
                    {Array.from({ length: maxChapters }, (_, i) => i + 1).map(c => 
                      <SelectItem key={`${instanceId}-chapter-only-${c}`} value={c.toString()} className="hover:bg-[#2a2a2a]">
                        {c}
                      </SelectItem>
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
        </div>
      )}
      
      {/* Botón y vista previa */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 items-center pt-4">
          <div className="flex-1 w-full sm:w-auto">
             <p className="text-gray-300 text-sm mb-1 text-center sm:text-left">Vista previa:</p>
             <div className="text-white font-medium bg-[#2a2a2a]/30 rounded-lg p-3 border border-gray-700/50 text-center text-base">
              {generatePreviewReference()}
            </div>
          </div>
          <Button
            onClick={handleSelect}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-shrink-0"
          >
            Seleccionar
          </Button>
      </div>
    </div>
  );
}