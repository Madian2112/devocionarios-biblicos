"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Book, Search, ChevronRight, Check } from "lucide-react";

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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setLoadingBooks(true);
    fetchBibleBooks()
      .then((data) => {
        setBooks(data);
        setLoadingBooks(false);
      })
      .catch(() => setLoadingBooks(false));
  }, []);

  const normalizeText = (text: string) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

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
      {/* Selector de libro */}
      <div>
        <Label className="text-gray-300 mb-2 block">Libro</Label>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={popoverOpen}
              className="w-full justify-between bg-[#2a2a2a]/50 border-gray-700 text-white hover:bg-[#2a2a2a]/50"
            >
              {selectedBook
                ? books.find((book) => book.name === selectedBook)?.name
                : "Seleccione un libro"}
              <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#1a1a1a] border-gray-800 text-white">
            <Command
              filter={(value, search) => {
                const normalizedValue = normalizeText(value);
                const normalizedSearch = normalizeText(search);
                if (normalizedValue.includes(normalizedSearch)) return 1;
                return 0;
              }}
            >
              <CommandInput placeholder="Buscar libro..." className="focus:ring-0 focus:ring-offset-0" />
              <CommandList className="max-h-60">
                <CommandEmpty>No se encontró el libro.</CommandEmpty>
                  {books.map((book) => (
                    <CommandItem
                      key={book.name}
                      value={book.name}
                      onSelect={(currentValue) => {
                        setSelectedBook(currentValue === selectedBook ? "" : currentValue);
                        setPopoverOpen(false);
                        // Reset chapter and verse when book changes
                        setSelectedChapter(1);
                        setStartVerse(1);
                        setEndVerse(null);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${selectedBook === book.name ? "opacity-100" : "opacity-0"}`}
                      />
                      {book.name}
                    </CommandItem>
                  ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
