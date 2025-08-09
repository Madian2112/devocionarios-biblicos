"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { bibleService, fetchBibleBooks, type BibleBook, getBibleVersions, type BibleVersion } from "@/lib/bible-data"
import { parseReference, normalizeText } from "@/lib/bible-utils"
import { SearchableSelector } from "./searchable-selector" // Importar el nuevo componente

interface BibleSelectorProps {
  onSelect: (reference: string) => void
  trigger?: React.ReactNode
  currentReference?: string
  instanceId?: string
}

const LibroApocalpsis = (libro: string) => {
  return libro === "Revelación" ? "Apocalipsis" : libro
}

export function BibleSelector({
  onSelect,
  trigger,
  currentReference = "Juan 3:16",
  instanceId = "default",
}: BibleSelectorProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        handleClose()
      } else {
        setOpen(newOpen)
      }
    },
    [handleClose],
  )

  const FormContent = (
    <BibleSelectorForm
      onSelect={(reference) => {
        onSelect(reference)
        handleClose()
      }}
      setOpen={setOpen}
      currentReference={currentReference}
      instanceId={instanceId}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange} modal={true}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <DrawerHeader className="text-left">
            <DrawerTitle>Seleccionar Pasaje Bíblico</DrawerTitle>
            <DrawerDescription>Elige el libro, capítulo y versículo(s).</DrawerDescription>
          </DrawerHeader>
          {FormContent}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl"
        onPointerDownOutside={(e) => {
          e.preventDefault()
          handleClose()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
          handleClose()
        }}
      >
        <DialogHeader>
          <DialogTitle>Seleccionar Pasaje Bíblico</DialogTitle>
          <DialogDescription>Elige el libro, capítulo y versículo(s).</DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  )
}

interface BibleSelectorFormProps {
  onSelect: (reference: string) => void
  setOpen: (open: boolean) => void
  currentReference?: string
  instanceId?: string
}

function BibleSelectorForm({ onSelect, setOpen, currentReference, instanceId = "default" }: BibleSelectorFormProps) {
  const [selectionType, setSelectionType] = useState<"verse" | "chapter">("verse")
  const [selectedBook, setSelectedBook] = useState("Juan")
  const [startChapter, setStartChapter] = useState(3)
  const [endChapter, setEndChapter] = useState<number | null>(null)
  const [startVerse, setStartVerse] = useState(16)
  const [endVerse, setEndVerse] = useState<number | null>(null)

  const [books, setBooks] = useState<BibleBook[]>([])
  const [versions, setVersions] = useState<BibleVersion[]>([])
  const [loadingBooks, setLoadingBooks] = useState(true)

  const initializeState = useCallback(() => {
    const parsed = parseReference(currentReference || "")

    if (parsed) {
      if (parsed.startVerse) {
        setSelectionType("verse")
        setStartVerse(parsed.startVerse)
        setEndVerse(parsed.endVerse || null)
      } else {
        setSelectionType("chapter")
        setStartVerse(1)
        setEndVerse(null)
      }
      setSelectedBook(parsed.book.replace("-", " "))
      setStartChapter(parsed.startChapter ?? 1)
    } else {
      setSelectionType("verse")
      setSelectedBook("Juan")
      setStartChapter(3)
      setStartVerse(16)
      setEndVerse(null)
    }
  }, [currentReference])

  useEffect(() => {
    initializeState()
  }, [initializeState])

  useEffect(() => {
    setLoadingBooks(true)
    fetchBibleBooks()
      .then((data) => {
        setBooks(data)
        setLoadingBooks(false)
      })
      .catch(() => setLoadingBooks(false))

    setVersions(getBibleVersions())
  }, [])

  useEffect(() => {
    if (books.length > 0 && selectedBook) {
      const bookMatch = books.find((b) => normalizeText(b.name) === normalizeText(selectedBook))
      if (bookMatch && bookMatch.name !== selectedBook) {
        setSelectedBook(bookMatch.name)
      }
    }
  }, [books, selectedBook])

  const handleBookChange = useCallback((bookName: string) => {
    setSelectedBook(bookName)
    setStartChapter(1)
    setEndChapter(null)
    setStartVerse(1)
    setEndVerse(null)
  }, [])

  const selectedBookData = books.find((book) => LibroApocalpsis(book.name) === selectedBook)
  const maxChapters = selectedBookData?.chapters || 1
  const maxVerses =
    selectedBookData?.chapter_verses && startChapter ? selectedBookData.chapter_verses[startChapter.toString()] || 1 : 1

  const handleSelect = useCallback(() => {
    let reference = ""

    if (selectionType === "verse") {
      reference = bibleService.formatReference(selectedBook, startChapter, startVerse, endVerse || undefined)
    } else {
      reference = `${selectedBook} ${startChapter}`
    }
    onSelect(reference)
    setOpen(false)
  }, [selectionType, selectedBook, startChapter, startVerse, endVerse, onSelect, setOpen])

  const generatePreviewReference = useCallback(() => {
    if (selectionType === "verse") {
      return bibleService.formatReference(selectedBook, startChapter, startVerse, endVerse || undefined)
    }
    return `${selectedBook} ${startChapter}`
  }, [selectionType, selectedBook, startChapter, startVerse, endVerse])

  return (
    <div className="space-y-6 p-4">
      {/* Switch para tipo de selección */}
      <div className="flex items-center justify-center space-x-2">
        <Label>Versículo</Label>
        <Switch
          checked={selectionType === "chapter"}
          onCheckedChange={(checked) => setSelectionType(checked ? "chapter" : "verse")}
        />
        <Label>Capítulo</Label>
      </div>
      {/* Selector de libro */}
      <div>
        <Label className="text-gray-300 mb-2 block">Libro</Label>
        <SearchableSelector
          items={books.map((book) => ({ value: LibroApocalpsis(book.name), label: LibroApocalpsis(book.name) }))}
          value={selectedBook}
          onValueChange={handleBookChange}
          placeholder="Seleccione un libro"
          emptyMessage="No se encontraron libros."
          disabled={loadingBooks}
        />
      </div>
      {/* Selectores condicionales */}
      {selectionType === "verse" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Capítulo */}
          <div>
            <Label className="text-gray-300 mb-2 block">Capítulo</Label>
            <SearchableSelector
              items={Array.from({ length: maxChapters }, (_, i) => i + 1).map((c) => ({
                value: c.toString(),
                label: c.toString(),
              }))}
              value={startChapter.toString()}
              onValueChange={(v) => setStartChapter(Number.parseInt(v))}
              placeholder="Seleccione un capítulo"
              emptyMessage="No se encontraron capítulos."
              disabled={!selectedBook}
            />
          </div>
          {/* Versículo Inicial */}
          <div>
            <Label className="text-gray-300 mb-2 block">Versículo</Label>
            <SearchableSelector
              items={Array.from({ length: maxVerses }, (_, i) => i + 1).map((v) => ({
                value: v.toString(),
                label: v.toString(),
              }))}
              value={startVerse.toString()}
              onValueChange={(v) => setStartVerse(Number.parseInt(v))}
              placeholder="Seleccione un versículo"
              emptyMessage="No se encontraron versículos."
              disabled={!selectedBook}
            />
          </div>
          {/* Versículo Final */}
          <div>
            <Label className="text-gray-300 mb-2 block">Hasta (opcional)</Label>
            <SearchableSelector
              items={[
                { value: "none", label: "Solo un versículo" },
                ...Array.from({ length: maxVerses }, (_, i) => i + 1)
                  .filter((v) => v > startVerse)
                  .map((v) => ({ value: v.toString(), label: v.toString() })),
              ]}
              value={endVerse?.toString() || "none"}
              onValueChange={(v) => setEndVerse(v === "none" ? null : Number.parseInt(v))}
              placeholder="Seleccionar"
              emptyMessage="No hay más versículos."
              disabled={!selectedBook}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          <div>
            <Label className="text-gray-300 mb-2 block">Capítulo</Label>
            <SearchableSelector
              items={Array.from({ length: maxChapters }, (_, i) => i + 1).map((c) => ({
                value: c.toString(),
                label: c.toString(),
              }))}
              value={startChapter.toString()}
              onValueChange={(v) => setStartChapter(Number.parseInt(v))}
              placeholder="Seleccione un capítulo"
              emptyMessage="No se encontraron capítulos."
              disabled={!selectedBook}
            />
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
  )
}
