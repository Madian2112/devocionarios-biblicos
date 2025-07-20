"use client";

import React, { useEffect, useState } from "react";
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
import { BIBLE_VERSIONS, bibleService } from "@/lib/bible-data";
import { toast } from "sonner";
import { BibleVersion } from "@/lib/bible-data";

// El API de deno devuelve un campo 'version'
interface ApiBibleVersion extends BibleVersion {
  version: string;
}

interface BibleViewerProps {
  reference: string;
  trigger?: React.ReactNode;
  defaultVersion?: string;
}

export function BibleViewer({
  reference,
  trigger,
  defaultVersion = "rv1960",
}: BibleViewerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
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
          <BibleViewerContent
            reference={reference}
            open={open}
            defaultVersion={defaultVersion}
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

        <BibleViewerContent
          reference={reference}
          open={open}
          defaultVersion={defaultVersion}
        />
      </DialogContent>
    </Dialog>
  );
}

interface BibleViewerContentProps {
  reference: string;
  open: boolean;
  defaultVersion?: string;
}

function BibleViewerContent({
  reference,
  open,
  defaultVersion = "rv1960",
}: BibleViewerContentProps) {
  const [versions, setVersions] = useState<ApiBibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);
  const [verseText, setVerseText] = useState<string | string[]>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dinámico de versiones
  useEffect(() => {
    fetch("https://bible-api.deno.dev/api/versions")
      .then((res) => res.json())
      .then((data) => {
        setVersions(data);
        if (data.length > 0 && !selectedVersion)
          setSelectedVersion(data[0].version);
      })
      .catch(() =>
        setError("No se pudieron cargar las versiones disponibles.")
      );
    // eslint-disable-next-line
  }, []);

  const eliminarTildes = (texto: string) => {
    const tildes = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U' };
    return texto.replace(/[áéíóúÁÉÍÓÚ]/g, letra => tildes[letra]);
  };

  // Parsear referencias como "Juan 3:16" o "Juan 3:16-18"
  const parseReference = (ref: string) => {
    const match = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (!match) return null;
    const [, bookName, chapter, startVerse, endVerse] = match;
    return {
      book: eliminarTildes(bookName),
      chapter: Number.parseInt(chapter),
      startVerse: Number.parseInt(startVerse),
      endVerse: endVerse ? Number.parseInt(endVerse) : null,
    };
  };

  // Fetch de versículo(s) usando la nueva API
  const loadVerse = async () => {
    const parsed = parseReference(reference);
    if (!parsed) {
      setError("Formato de referencia inválido");
      setVerseText("");
      return;
    }
    console.log("Asi me lleva el parsed: ", parsed);
    setLoading(true);
    setError(null);
    try {
      if (parsed.endVerse && parsed.endVerse !== parsed.startVerse) {
        // Rango de versículos
        const verses: string[] = [];
        for (let v = parsed.startVerse; v <= parsed.endVerse; v++) {
          console.log("Asi me lleva el libro: ", parsed.book);
          const res = await fetch(
            `https://bible-api.deno.dev/api/read/${selectedVersion}/${parsed.book}/${parsed.chapter}/${v}`
          );
          const data = await res.json();
          console.log("Asi es la data del versiculo que me trae: ", data);
          verses.push(data.verse || "No encontrado");
        }
        setVerseText(verses);
      } else {
        // Un solo versículo
        const res = await fetch(
          `https://bible-api.deno.dev/api/read/${selectedVersion}/${parsed.book}/${parsed.chapter}/${parsed.startVerse}`
        );
        const data = await res.json();
        setVerseText(data.verse || "No encontrado");
      }
    } catch {
      setError("Error al cargar el versículo");
      setVerseText("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadVerse();
    }
    // eslint-disable-next-line
  }, [open, selectedVersion, reference]);

  const copyToClipboard = () => {
    const text = Array.isArray(verseText) ? verseText.join(" ") : verseText;
    const fullText = `"${text}" - ${reference} (${selectedVersion})`;
    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        toast.success("Versículo copiado al portapapeles");
      })
      .catch(() => {
        toast.error("Error al copiar el versículo");
      });
  };

  const openInBibleApp = () => {
    // Abrir en app de la Biblia o sitio web
    const url = `https://www.bible.com/bible/149/${reference.replace(
      /\s+/g,
      "."
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 p-4">
      {/* Selector de versión */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-300">
            Versión:
          </label>
          <Select
            value={selectedVersion}
            onValueChange={setSelectedVersion}
          >
            <SelectTrigger className="bg-[#2a2a2a]/50 border-gray-700 text-white w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
              {versions.map((version) => (
                <SelectItem
                  key={version.version || version.id}
                  value={version.version || version.id}
                  className="hover:bg-[#2a2a2a]"
                >
                  <div>
                    <div className="font-medium">
                      {version.abbreviation ||
                        version.version.toLocaleUpperCase() ||
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
          onClick={loadVerse}
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
            <ScrollArea className="h-60">
              <div className="pr-4">
                {Array.isArray(verseText) ? (
                  // Múltiples versículos
                  <div className="space-y-3">
                    {verseText.map((verse, index) => (
                      <div key={index} className="flex gap-3">
                        <Badge
                          variant="outline"
                          className="border-blue-500/30 text-blue-400 shrink-0"
                        >
                          {(parseReference(reference)?.startVerse ?? 0) + index}
                        </Badge>
                        <p className="text-gray-100 leading-relaxed">{verse}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Un solo versículo
                  <p className="text-gray-100 leading-relaxed text-lg">
                    {verseText}
                  </p>
                )}
              </div>
            </ScrollArea>

            <Separator className="bg-gray-700/50" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {selectedVersion}
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
  );
}
