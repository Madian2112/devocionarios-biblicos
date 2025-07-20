"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Book, Eye, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BIBLE_VERSIONS, bibleService } from "@/lib/bible-data"
import { toast } from "sonner"

interface BibleViewerProps {
  reference: string
  trigger?: React.ReactNode
  defaultVersion?: string
}

export function BibleViewer({ reference, trigger, defaultVersion = "rvr1960" }: BibleViewerProps) {
  const [open, setOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion)
  const [verseText, setVerseText] = useState<string | string[]>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseReference = (ref: string) => {
    // Parsear referencias como "Juan 3:16" o "Juan 3:16-18"
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/)
    if (!match) return null

    const [, bookName, chapter, startVerse, endVerse] = match

    // Encontrar el ID del libro
    const book = bookName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/\d+/g, (num) => num)

    return {
      book,
      chapter: Number.parseInt(chapter),
      startVerse: Number.parseInt(startVerse),
      endVerse: endVerse ? Number.parseInt(endVerse) : null,
    }
  }

  const loadVerse = async () => {
    const parsed = parseReference(reference)
    if (!parsed) {
      setError("Formato de referencia inválido")
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (parsed.endVerse) {
        // Cargar rango de versículos
        const verses = await bibleService.getVerseRange(
          parsed.book,
          parsed.chapter,
          parsed.startVerse,
          parsed.endVerse,
          selectedVersion,
        )
        setVerseText(verses)
      } else {
        // Cargar un solo versículo
        const verse = await bibleService.getVerse(parsed.book, parsed.chapter, parsed.startVerse, selectedVersion)
        setVerseText(verse)
      }
    } catch (err) {
      setError("Error al cargar el versículo")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadVerse()
    }
  }, [open, selectedVersion, reference])

  const copyToClipboard = () => {
    const text = Array.isArray(verseText) ? verseText.join(" ") : verseText
    const fullText = `"${text}" - ${reference} (${BIBLE_VERSIONS.find((v) => v.id === selectedVersion)?.abbreviation})`

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        toast.success("Versículo copiado al portapapeles")
      })
      .catch(() => {
        toast.error("Error al copiar el versículo")
      })
  }

  const openInBibleApp = () => {
    // Abrir en app de la Biblia o sitio web
    const url = `https://www.bible.com/bible/149/${reference.replace(/\s+/g, ".")}`
    window.open(url, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
      <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="h-5 w-5 text-blue-400" />
            {reference}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Visualiza el versículo en diferentes versiones de la Biblia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selector de versión */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-300">Versión:</label>
              <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                  {BIBLE_VERSIONS.map((version) => (
                    <SelectItem key={version.id} value={version.id} className="hover:bg-[#2a2a2a]">
                      <div>
                        <div className="font-medium">{version.abbreviation}</div>
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
              onClick={loadVerse}
              disabled={loading}
              className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>

          {/* Contenido del versículo */}
          <div className="bg-[#2a2a2a]/30 rounded-xl p-6 border border-gray-700/50 min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-400">Cargando versículo...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-2">{error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadVerse}
                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50"
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(verseText) ? (
                  // Múltiples versículos
                  <div className="space-y-3">
                    {verseText.map((verse, index) => {
                      const parsed = parseReference(reference)
                      const verseNumber = parsed ? parsed.startVerse + index : index + 1
                      return (
                        <div key={index} className="flex gap-3">
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400 shrink-0">
                            {verseNumber}
                          </Badge>
                          <p className="text-gray-100 leading-relaxed">{verse}</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  // Un solo versículo
                  <p className="text-gray-100 leading-relaxed text-lg">{verseText}</p>
                )}

                <Separator className="bg-gray-700/50" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {BIBLE_VERSIONS.find((v) => v.id === selectedVersion)?.abbreviation}
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
