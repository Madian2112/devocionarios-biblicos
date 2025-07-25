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
  reference: string;
  trigger?: React.ReactNode;
  defaultVersion?: string;
  onClose?: (selectedVersion: string) => void;
}

export function BibleViewer({
  reference,
  trigger,
  defaultVersion = "rv1960",
  onClose,
}: BibleViewerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen && onClose) {
      onClose(selectedVersion);
    }
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
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
            defaultVersion={selectedVersion}
            onVersionChange={setSelectedVersion}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          defaultVersion={selectedVersion}
          onVersionChange={setSelectedVersion}
        />
      </DialogContent>
    </Dialog>
  );
}

interface BibleViewerContentProps {
  reference: string;
  open: boolean;
  defaultVersion?: string;
  onVersionChange: (version: string) => void;
}

export function BibleViewerContent({
  reference,
  open,
  defaultVersion = "rv1960",
  onVersionChange,
}: BibleViewerContentProps) {
  const [versions, setVersions] = useState<ApiBibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState(defaultVersion);
  const [verseData, setVerseData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedVersion(defaultVersion);
  }, [defaultVersion]);

  useEffect(() => {
    onVersionChange(selectedVersion);
  }, [selectedVersion, onVersionChange]);


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
    const tildes: { [key: string]: string } = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U' };
    return texto.replace(/[áéíóúÁÉÍÓÚ]/g, letra => tildes[letra]);
  };

  // Parsear referencias como "Juan 3:16" o "Juan 3:16-18" o "Génesis 1"
const parseReference = (ref: string) => {
    // Intenta hacer match con formato Libro Capitulo:Versiculo-Versiculo
    let match = ref.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
    if (match) {
  const [, bookName, chapter, startVerse, endVerse] = match;
  return {
        book: eliminarTildes(bookName.trim()),
    chapter: Number.parseInt(chapter),
        startVerse: Number.parseInt(startVerse),
    endVerse: endVerse ? Number.parseInt(endVerse) : null,
  };
    }
    
    // Intenta hacer match con formato Libro Capitulo
    match = ref.match(/^(.+?)\s+(\d+)$/);
    if (match) {
        const [, bookName, chapter] = match;
        return {
            book: eliminarTildes(bookName.trim()),
            chapter: Number.parseInt(chapter),
            startVerse: null, // Indicador para capítulo completo
            endVerse: null,
        };
    }

    return null;
};

  // Fetch de capítulo(s) o versículo(s)
  const loadContent = async () => {
    const parsed = parseReference(reference);
    if (!parsed) {
      setError("Formato de referencia inválido");
      setVerseData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try { 
      const apiUrl = `https://bible-api.deno.dev/api/read/${selectedVersion}/${parsed.book}/${parsed.chapter}`;
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo obtener la información.`);
        }
      const data: ChapterData = await res.json();
      
      // Filtrar versículos si es necesario
      if (parsed.startVerse) {
        const endVerse = parsed.endVerse || parsed.startVerse;
        data.vers = data.vers.filter(v => v.number >= parsed.startVerse! && v.number <= endVerse);
      }
      
      setVerseData(data);

    } catch(err) {
      setError(err instanceof Error ? err.message : "Error al cargar el contenido de la Biblia.");
      setVerseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadContent();
    }
    // eslint-disable-next-line
  }, [open, selectedVersion, reference]);

  const copyToClipboard = () => {
    if (!verseData) return;

    const textToCopy = verseData.vers.map(v => `${v.number}. ${v.verse}`).join("\n");
    const fullReference = `${reference} (${selectedVersion.toUpperCase()})`;
    
    navigator.clipboard.writeText(`${fullReference}\n${textToCopy}`)
      .then(() => toast.success("Contenido copiado al portapapeles"))
      .catch(() => toast.error("Error al copiar"));
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
                  <div key={verse.id} className="flex gap-3 items-start">
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
