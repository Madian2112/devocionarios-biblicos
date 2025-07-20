"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState } from "react"
import { Book, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BIBLE_BOOKS, bibleService } from "@/lib/bible-data"

interface BibleSelectorProps {
  onSelect: (reference: string) => void
  trigger?: React.ReactNode
  defaultBook?: string
  defaultChapter?: number
  defaultVerse?: number
}

export function BibleSelector({
  onSelect,
  trigger,
  defaultBook = "juan",
  defaultChapter = 3,
  defaultVerse = 16,
}: BibleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState(defaultBook)
  const [selectedChapter, setSelectedChapter] = useState(defaultChapter)
  const [startVerse, setStartVerse] = useState(defaultVerse)
  const [endVerse, setEndVerse] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [maxVerses, setMaxVerses] = useState(50) // Simulado, en producción vendría de la API

  const filteredBooks = BIBLE_BOOKS.filter((book) => book.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const selectedBookData = BIBLE_BOOKS.find((book) => book.id === selectedBook)
  const maxChapters = selectedBookData?.chapters || 1

  const handleSelect = () => {
    const reference = bibleService.formatReference(selectedBook, selectedChapter, startVerse, endVerse || undefined)
    onSelect(reference)
    setOpen(false)
  }

  const generateVerseOptions = (max: number) => {
    return Array.from({ length: max }, (_, i) => i + 1)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50">
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

        <div className="space-y-6">
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
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                <ScrollArea className="h-60">
                  {filteredBooks.map((book) => (
                    <SelectItem key={book.id} value={book.id} className="hover:bg-[#2a2a2a]">
                      {book.name}
                    </SelectItem>
                  ))}
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
                onValueChange={(value) => setSelectedChapter(Number.parseInt(value))}
              >
                <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                  <ScrollArea className="h-60">
                    {Array.from({ length: maxChapters }, (_, i) => i + 1).map((chapter) => (
                      <SelectItem key={chapter} value={chapter.toString()} className="hover:bg-[#2a2a2a]">
                        {chapter}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Versículo inicial */}
            <div>
              <Label className="text-gray-300 mb-2 block">Versículo</Label>
              <Select value={startVerse.toString()} onValueChange={(value) => setStartVerse(Number.parseInt(value))}>
                <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                  <ScrollArea className="h-60">
                    {generateVerseOptions(maxVerses).map((verse) => (
                      <SelectItem key={verse} value={verse.toString()} className="hover:bg-[#2a2a2a]">
                        {verse}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Hasta versículo (opcional) */}
            <div>
              <Label className="text-gray-300 mb-2 block">Hasta (opcional)</Label>
              <Select
                value={endVerse ? endVerse.toString() : "none"}
                onValueChange={(value) => setEndVerse(value === "none" ? null : Number.parseInt(value))}
              >
                <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white max-h-60">
                  <ScrollArea className="h-60">
                    <SelectItem value="none" className="hover:bg-[#2a2a2a]">
                      Solo un versículo
                    </SelectItem>
                    {generateVerseOptions(maxVerses)
                      .filter((verse) => verse > startVerse)
                      .map((verse) => (
                        <SelectItem key={verse} value={verse.toString()} className="hover:bg-[#2a2a2a]">
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
              {bibleService.formatReference(selectedBook, selectedChapter, startVerse, endVerse || undefined)}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
