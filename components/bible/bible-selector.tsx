"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { bibleService, fetchBibleBooks, BibleBook } from "@/lib/bible-data";
import { parseReference, normalizeText } from "@/lib/bible-utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";


interface BibleSelectorProps {
  onSelect: (reference: string) => void;
  trigger?: React.ReactNode;
  currentReference?: string;
}

export function BibleSelector({
  onSelect,
  trigger,
  currentReference = "Juan 3:16",
}: BibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const FormContent = (
    <BibleSelectorForm
      onSelect={onSelect}
      setOpen={setOpen}
      currentReference={currentReference}
    />
  );
  
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl">
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
}

function BibleSelectorForm({
  onSelect,
  setOpen,
  currentReference,
}: BibleSelectorFormProps) {
    const [selectionType, setSelectionType] = useState<'verse' | 'chapter'>('verse');
    const [selectedBook, setSelectedBook] = useState('Juan');
    const [startChapter, setStartChapter] = useState(3);
    const [endChapter, setEndChapter] = useState<number | null>(null); // Todavía necesario para parsear referencias existentes
    const [startVerse, setStartVerse] = useState(16);
    const [endVerse, setEndVerse] = useState<number | null>(null);

    const [books, setBooks] = useState<BibleBook[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);

    useEffect(() => {
        const parsed = parseReference(currentReference || "");
        if (parsed && books.length > 0) { // Asegurarse de que los libros estén cargados
            const bookMatch = books.find(b => normalizeText(b.name) === normalizeText(parsed.book));
            setSelectedBook(bookMatch ? bookMatch.name : parsed.book);
            
            setStartChapter(parsed.startChapter);

            // AQUÍ ESTÁ LA LÓGICA CLAVE
            if (parsed.startVerse) {
                // Si la referencia tiene un versículo, mostramos el selector de versículos
                setSelectionType('verse');
                setStartVerse(parsed.startVerse);
                setEndVerse(parsed.endVerse || null);
                setEndChapter(null);
            } else {
                // Si no tiene versículo, es una referencia de capítulo
                setSelectionType('chapter');
                setEndChapter(parsed.endChapter || null);
                // Reseteamos los valores de versículos para evitar inconsistencias
                setStartVerse(1);
                setEndVerse(null);
            }
        }
    }, [currentReference, books]); // Depender de `books` es crucial

    useEffect(() => {
      setLoadingBooks(true);
      fetchBibleBooks().then(data => {
        setBooks(data);
        setLoadingBooks(false);
      }).catch(() => setLoadingBooks(false));
    }, []);

    const handleBookChange = (bookName: string) => {
        setSelectedBook(bookName);
        setStartChapter(1);
        setEndChapter(null);
        setStartVerse(1);
        setEndVerse(null);
    }

    const selectedBookData = books.find(book => book.name === selectedBook);
    const maxChapters = selectedBookData?.chapters || 1;
    const maxVerses = selectedBookData?.chapter_verses && startChapter
        ? selectedBookData.chapter_verses[startChapter.toString()] || 1
        : 1;

    const handleSelect = () => {
        let reference = '';
        if (selectionType === 'verse') {
            reference = bibleService.formatReference(selectedBook, startChapter, startVerse, endVerse || undefined);
        } else {
            // Para selección de capítulo, solo usamos el capítulo inicial.
            reference = `${selectedBook} ${startChapter}`;
        }
        onSelect(reference);
        setOpen(false);
    };
    
    const generatePreviewReference = () => {
        if (selectionType === 'verse') {
             return bibleService.formatReference(selectedBook, startChapter, startVerse, endVerse || undefined);
        }
        // Para capítulo, solo libro y capítulo inicial.
        return `${selectedBook} ${startChapter}`;
    }

  return (
    <div className="space-y-6 p-4">
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
        <Select value={selectedBook} onValueChange={handleBookChange} disabled={loadingBooks}>
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
                      key={book.name}
                      value={book.name}
                      className="hover:bg-[#2a2a2a]"
                    >
                      {book.name}
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
            <Select value={startChapter.toString()} onValueChange={(v) => setStartChapter(parseInt(v))} disabled={!selectedBook}>
              <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                <SelectValue placeholder="Seleccione un capítulo" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                <ScrollArea className="h-60">{Array.from({ length: maxChapters }, (_, i) => i + 1).map(c => <SelectItem key={c} value={c.toString()} className="hover:bg-[#2a2a2a]">{c}</SelectItem>)}</ScrollArea>
              </SelectContent>
            </Select>
          </div>
          {/* Versículo Inicial */}
          <div>
            <Label className="text-gray-300 mb-2 block">Versículo</Label>
            <Select value={startVerse.toString()} onValueChange={(v) => setStartVerse(parseInt(v))} disabled={!selectedBook}>
               <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                 <SelectValue placeholder="Seleccione un versículo" />
               </SelectTrigger>
               <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                 <ScrollArea className="h-60">{Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => <SelectItem key={v} value={v.toString()} className="hover:bg-[#2a2a2a]">{v}</SelectItem>)}</ScrollArea>
               </SelectContent>
            </Select>
          </div>
          {/* Versículo Final */}
          <div>
            <Label className="text-gray-300 mb-2 block">Hasta (opcional)</Label>
            <Select value={endVerse?.toString() || 'none'} onValueChange={(v) => setEndVerse(v === 'none' ? null : parseInt(v))} disabled={!selectedBook}>
              <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                <ScrollArea className="h-60">
                    <SelectItem value="none" className="hover:bg-[#2a2a2a]">Solo un versículo</SelectItem>
                    {Array.from({ length: maxVerses }, (_, i) => i + 1).filter(v => v > startVerse).map(v => <SelectItem key={v} value={v.toString()} className="hover:bg-[#2a2a2a]">{v}</SelectItem>)}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            {/* Capítulo Inicial */}
            <div>
              <Label className="text-gray-300 mb-2 block">Capítulo</Label>
              <Select value={startChapter.toString()} onValueChange={(v) => setStartChapter(parseInt(v))} disabled={!selectedBook}>
                <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                  <SelectValue placeholder="Seleccione un capítulo" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                  <ScrollArea className="h-60">{Array.from({ length: maxChapters }, (_, i) => i + 1).map(c => <SelectItem key={c} value={c.toString()} className="hover:bg-[#2a2a2a]">{c}</SelectItem>)}</ScrollArea>
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
