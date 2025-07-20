"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Book, Search } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
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

  const filteredBooks = books.filter((book) =>
    book.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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

  const generateVerseOptions = (max: number) => {
    return Array.from({ length: max }, (_, i) => i + 1);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Buscador de libros */}
      <div>
        <Label className="text-gray-300 mb-2 block">Buscar Libro</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar libro bíblico..."
            className="bg-[#2a2a2a]/50 border-gray-700 text-white pl-10"
          />
        </div>
      </div>

      {/* Selector de libro */}
      <div>
        <Label className="text-gray-300 mb-2 block">Libro</Label>
        <Select
          value={selectedBook}
          onValueChange={setSelectedBook}
          defaultValue="Select Libro"
        >
          <SelectTrigger
            className="bg-[#2a2a2a]/50 border-gray-700 text-white"
            aria-placeholder="Seleccionar libro"
          >
            <SelectValue placeholder="Seleccionar libro" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60" defaultValue="Seleccione un libro">
            <ScrollArea className="h-60">
              {loadingBooks ? (
                <div className="text-center text-gray-400 py-4">
                  Cargando libros...
                </div>
              ) : (
                filteredBooks.map((book) => (
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Capítulo */}
        <div>
          <Label className="text-gray-300 mb-2 block">Capítulo</Label>
          <Select
            value={selectedChapter.toString()}
            onValueChange={(value) =>
              setSelectedChapter(Number.parseInt(value))
            }
          >
            <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
              <SelectValue placeholder="Seleccionar capítulo" />
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
          >
            <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
              <SelectValue placeholder="Seleccionar versículo" />
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

        {/* Botón de selección */}
        <div className="flex items-end">
          <Button
            onClick={handleSelect}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Seleccionar
          </Button>
        </div>
      </div>

      {/* Vista previa */}
      <div className="bg-[#2a2a2a]/30 rounded-lg p-4 border border-gray-700/50">
        <Label className="text-gray-300 text-sm">Vista previa:</Label>
        <p className="text-white font-medium mt-1">
          {bibleService.formatReference(
            selectedBook,
            selectedChapter,
            startVerse,
            endVerse || undefined
          )}
        </p>
      </div>
    </div>
  );
}
