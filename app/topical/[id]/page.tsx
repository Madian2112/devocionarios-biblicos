"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Download,
  Plus,
  ChevronDown,
  Eye,
  Trash2,
  Book,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { GradientCard } from "@/components/ui/gradient-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { BibleSelector } from "@/components/bible/bible-selector"
import { exportTopicalStudyToPDF } from "@/lib/pdf-exporter"
import type { TopicalStudy, StudyEntry } from "@/lib/firestore"
import { fetchVerseText } from "@/lib/bible-api"

// Datos de ejemplo
const getSampleTopicalStudy = (id: string): TopicalStudy | null => ({
    id: id,
    name: 'Fe',
    entries: [{ id: 'e1', reference: 'Hebreos 11:1', learning: 'La fe es la certeza de lo que se espera, la convicción de lo que no se ve.', versionTexto: 'rv1960' }]
});


export default function TopicalStudyPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [currentTopic, setCurrentTopic] = useState<TopicalStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (id) {
        const topicId = Array.isArray(id) ? id[0] : id;
        setCurrentTopic(getSampleTopicalStudy(topicId));
        setLoading(false);
    }
  }, [id]);

  const handleAddStudyEntry = () => {
    if (!currentTopic) return;
    const newEntry: StudyEntry = { id: Date.now().toString(), reference: "", learning: "", versionTexto: "rv1960" };
    setCurrentTopic({ ...currentTopic, entries: [...currentTopic.entries, newEntry] });
  };

  const handleUpdateStudyEntry = (updatedEntry: StudyEntry) => {
    if (!currentTopic) return;
    setCurrentTopic({
        ...currentTopic,
        entries: currentTopic.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
    });
  };

  const handleRemoveStudyEntry = (entryId: string) => {
    if (!currentTopic) return;
    setCurrentTopic({
        ...currentTopic,
        entries: currentTopic.entries.filter(e => e.id !== entryId)
    });
  }
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]"><LoadingSpinner /></div>
  }

  if (!currentTopic) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] text-white">Tema no encontrado. <Link href="/topical" className="ml-2 underline">Volver</Link></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">                
          <Link href="/topical">
            <Button
                variant="outline"
                className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm w-full sm:w-auto"
            >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Volver a Temas</span>
            </Button>
          </Link>
          <h2 className="text-xl text-center sm:text-3xl font-bold text-white sm:text-center order-first sm:order-none flex-1">
            {currentTopic.name}
          </h2>
          <div className="flex gap-2 w-full sm:w-auto order-2">
            <Button
              onClick={() => exportTopicalStudyToPDF(currentTopic)}
              variant="outline"
              className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              onClick={handleAddStudyEntry}
              className="bg-gradient-to-r from-blue-600 to-purple-600 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              Añadir Versículo
            </Button>
          </div>
        </div>

        {currentTopic.entries.map((entry) => (
          <Collapsible key={entry.id} className="group mb-4">
            <GradientCard gradient="blue" >
                <div className="flex w-full items-center p-4">
                    <CollapsibleTrigger className="flex flex-1 text-left min-w-0 items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{entry.reference || "Sin referencia"}</p>
                            <p className="text-sm text-gray-400 truncate mt-1">{entry.learning || "Sin aprendizaje"}</p>
                        </div>
                        <ChevronDown className="h-5 w-5 text-white transition-transform duration-300 group-data-[state=open]:rotate-180 ml-2 flex-shrink-0"/>
                    </CollapsibleTrigger>
                    {entry.reference && (
                        <div className="ml-2 flex-shrink-0">
                            <BibleViewer
                                reference={entry.reference}
                                defaultVersion={entry.versionTexto}
                                onClose={async (selectedVersion) => {
                                  setSaving(true);
                                  const verseText = await fetchVerseText(entry.reference, selectedVersion);
                                  handleUpdateStudyEntry({...entry, learning: verseText, versionTexto: selectedVersion})
                                  setSaving(false);
                                }}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>
                <CollapsibleContent>
                  <CardContent className="pt-4 space-y-6 border-t border-blue-500/20">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Referencia(s) Bíblica(s)</label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <Input
                              value={entry.reference}
                              onChange={(e) => handleUpdateStudyEntry({...entry, reference: e.target.value})}
                              placeholder="Ej: Juan 3:16 o 1 Corintios 13:4-7"
                              className="bg-[#2a2a2a]/50 border-gray-700 text-white"
                            />
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                            {entry.versionTexto?.toUpperCase() || 'RV1960'}
                          </Badge>
                          <BibleSelector
                            onSelect={async (ref) => {
                                setSaving(true);
                                const verseText = await fetchVerseText(ref, 'rv1960');
                                handleUpdateStudyEntry({...entry, reference: ref, learning: verseText, versionTexto: 'rv1960'})
                                setSaving(false);
                            }}
                            currentReference={entry.reference}
                            trigger={
                              <Button variant="outline" className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0">
                                <Book className="h-4 w-4 mr-2" />
                                Seleccionar
                              </Button>
                            }
                          />
                           <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRemoveStudyEntry(entry.id)}
                              className="bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3 mt-6">
                          Apuntes y Aprendizaje
                        </label>
                        <Textarea
                          value={entry.learning}
                          onChange={(e) => handleUpdateStudyEntry({...entry, learning: e.target.value})}
                          placeholder="Escribe aquí tus reflexiones sobre este pasaje..."
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[150px]"
                          disabled={saving}
                        />
                      </div>
                  </CardContent>
                </CollapsibleContent>
            </GradientCard>
          </Collapsible>
        ))}
         {currentTopic.entries.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>Este tema no tiene entradas. ¡Añade la primera!</p>
            </div>
        )}
      </div>
    </div>
  );
}
