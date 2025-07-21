"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Book, Check, ChevronRight } from "lucide-react";

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

interface BibleSelectorProps {
  onSelect: (reference: string) => void;
  trigger?: React.ReactNode;
  defaultBook?: string;
  defaultChapter?: number;
  defaultVerse?: number;
}

export function BibleSelector({
  onSelect,
  trigger,
  defaultBook = "juan",
  defaultChapter = 3,
  defaultVerse = 16,
}: BibleSelectorProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || (
            <Button
              variant="outline"
              className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50"
            >
              <Book className="h-4 w-4 mr-2" />
              Seleccionar Versículo
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-400" />
              Seleccionar Versículo Bíblico
            </DrawerTitle>
            <DrawerDescription className="text-gray-400">
              Elige el libro, capítulo y versículo(s) que deseas agregar.
            </DrawerDescription>
          </DrawerHeader>
          <BibleSelectorForm
            onSelect={onSelect}
            setOpen={setOpen}
            defaultBook={defaultBook}
            defaultChapter={defaultChapter}
            defaultVerse={defaultVerse}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50"
          >
            <Book className="h-4 w-4 mr-2" />
            Seleccionar Versículo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-blue-400" />
            Seleccionar Versículo Bíblico
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Elige el libro, capítulo y versículo(s) que deseas agregar
          </DialogDescription>
        </DialogHeader>

        <BibleSelectorForm
          onSelect={onSelect}
          setOpen={setOpen}
          defaultBook={defaultBook}
          defaultChapter={defaultChapter}
          defaultVerse={defaultVerse}
        />
      </DialogContent>
    </Dialog>
  );
}

interface BibleSelectorFormProps {
  onSelect: (reference: string) => void;
  setOpen: (open: boolean) => void;
  defaultBook?: string;
  defaultChapter?: number;
  defaultVerse?: number;
  className?: string;
}

function BibleSelectorForm({
  onSelect,
  setOpen,
  defaultBook = "juan",
  defaultChapter = 3,
  defaultVerse = 16,
}: BibleSelectorFormProps) {
  const [selectedBook, setSelectedBook] = useState(defaultBook);
  const [selectedChapter, setSelectedChapter] = useState(defaultChapter);
  const [startVerse, setStartVerse] = useState(defaultVerse);
  const [endVerse, setEndVerse] = useState<number | null>(null);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  useEffect(() => {
    setLoadingBooks(true);
    fetchBibleBooks()
      .then((data) => {
        setBooks(data);
        setLoadingBooks(false);
      })
      .catch(() => setLoadingBooks(false));
  }, []);

  const selectedBookData = books.find((book) => book.name === selectedBook);
  const maxChapters = selectedBookData?.chapters || 1;

  const maxVerses =
    selectedBookData?.chapter_verses && selectedChapter
      ? selectedBookData.chapter_verses[selectedChapter.toString()] || 1
      : 1;

  const handleSelect = () => {
    const reference = bibleService.formatReference(
      selectedBook,
      selectedChapter,
      startVerse,
      endVerse || undefined
    );
    onSelect(reference);
    setOpen(false);
  };

  const handleBookChange = (bookName: string) => {
    setSelectedBook(bookName);
    setSelectedChapter(1);
    setStartVerse(1);
    setEndVerse(null);
  }

  return (
    <div className="space-y-6 p-4">
      {/* Selector de libro */}
      <div>
        <Label className="text-gray-300 mb-2 block">Libro</Label>
        <Select value={selectedBook} onValueChange={handleBookChange}>
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

      {/* Selectores en fila */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Capítulo */}
        <div>
          <Label className="text-gray-300 mb-2 block">Capítulo</Label>
          <Select
            value={selectedChapter.toString()}
            onValueChange={(value) =>
              setSelectedChapter(Number.parseInt(value))
            }
            disabled={!selectedBook}
          >
            <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
              <SelectValue placeholder="Seleccione un capítulo" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
              <ScrollArea className="h-60">
                {Array.from({ length: maxChapters }, (_, i) => i + 1).map(
                  (chapter) => (
                    <SelectItem
                      key={chapter}
                      value={chapter.toString()}
                      className="hover:bg-[#2a2a2a]"
                    >
                      {chapter}
                    </SelectItem>
                  )
                )}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Versículo inicial */}
        <div>
          <Label className="text-gray-300 mb-2 block">Versículo</Label>
          <Select
            value={startVerse.toString()}
            onValueChange={(value) => setStartVerse(Number.parseInt(value))}
            disabled={!selectedBook}
          >
            <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
              <SelectValue placeholder="Seleccione un versículo" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
              <ScrollArea className="h-60">
                {Array.from({ length: maxVerses }, (_, i) => i + 1).map(
                  (verse) => (
                    <SelectItem
                      key={verse}
                      value={verse.toString()}
                      className="hover:bg-[#2a2a2a]"
                    >
                      {verse}
                    </SelectItem>
                  )
                )}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>

        {/* Hasta versículo (opcional) */}
        <div>
          <Label className="text-gray-300 mb-2 block">
            Hasta (opcional)
          </Label>
          <Select
            value={endVerse ? endVerse.toString() : "none"}
            onValueChange={(value) =>
              setEndVerse(value === "none" ? null : Number.parseInt(value))
            }
            disabled={!selectedBook}
          >
            <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
              <ScrollArea className="h-60">
                <SelectItem value="none" className="hover:bg-[#2a2a2a]">
                  Solo un versículo
                </SelectItem>
                {Array.from({ length: maxVerses }, (_, i) => i + 1)
                  .filter((verse) => verse > startVerse)
                  .map((verse) => (
                    <SelectItem
                      key={verse}
                      value={verse.toString()}
                      className="hover:bg-[#2a2a2a]"
                    >
                      {verse}
                    </SelectItem>
                  ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botón y vista previa */}
      <div className="flex flex-col sm:flex-row gap-4 items-center pt-4">
          <div className="flex-1 w-full sm:w-auto">
             <p className="text-gray-300 text-sm mb-1">Vista previa:</p>
             <p className="text-white font-medium bg-[#2a2a2a]/30 rounded-lg p-2 border border-gray-700/50 text-center">
              {bibleService.formatReference(
                selectedBook,
                selectedChapter,
                startVerse,
                endVerse || undefined
              )}
            </p>
          </div>
          <Button
            onClick={handleSelect}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Seleccionar
          </Button>
      </div>
    </div>
  );
}
