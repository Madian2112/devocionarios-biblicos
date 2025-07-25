"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronLeft,
  Download,
  Plus,
  ChevronDown,
  Eye,
  Trash2,
  Book,
  Save,
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
import { firestoreService } from "@/lib/firestore"
import { useAuthContext } from "@/context/auth-context"
import { Timestamp } from "firebase/firestore"
import { fetchVerseText } from "@/lib/bible-api"
import withAuth from "@/components/auth/with-auth"
import { useToast } from "@/hooks/use-toast"


function TopicalStudyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { id } = params;
  const isNew = id === 'new';

  const [study, setStudy] = useState<TopicalStudy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    async function fetchOrCreateStudy() {
        if (!user) return;
        setLoading(true);

        if (isNew) {
            setStudy({
                id: Date.now().toString(), // ID temporal
                userId: user.uid,
                name: '',
                entries: [],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        } else {
            const fetchedStudy = await firestoreService.getTopicalStudyById(user.uid, id);
            setStudy(fetchedStudy);
        }
        setLoading(false);
    }
    fetchOrCreateStudy();
  }, [id, user, isNew]);

  const handleStudyChange = (field: keyof TopicalStudy, value: any) => {
    setStudy(prev => prev ? { ...prev, [field]: value, updatedAt: Timestamp.now() } : null);
  };

  const handleAddStudyEntry = () => {
    if (!study) return;
    const newEntry: StudyEntry = { id: Date.now().toString(), referencia: "", learning: "", versionTexto: "rv1960" };
    handleStudyChange('entries', [...study.entries, newEntry]);
  };

  const handleUpdateStudyEntry = (updatedEntry: StudyEntry) => {
    if (!study) return;
    handleStudyChange('entries', study.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  };

  const handleRemoveStudyEntry = (entryId: string) => {
    if (!study) return;
    handleStudyChange('entries', study.entries.filter(e => e.id !== entryId));
  }

  const handleSave = async () => {
    if (!study || !user) return;
    setSaving(true);
    try {
        const { userId, ...studyData } = study;
        const savedStudy = await firestoreService.saveTopicalStudy(user.uid, studyData);
        
        // 🔔 Notificación de éxito
        toast({
          title: "✅ Estudio temático guardado",
          description: `El estudio "${study.name}" ha sido guardado correctamente.`,
          duration: 3000,
        });
        
        if(isNew) {
            // Si era un nuevo estudio, reemplaza la URL para que el ID sea el correcto
            router.replace(`/topical/${savedStudy.id}`);
        }
    } catch (error) {
        console.error("Error guardando estudio:", error);
        
        // 🔔 Notificación de error
        toast({
          title: "❌ Error al guardar",
          description: "No se pudo guardar el estudio temático. Inténtalo de nuevo.",
          variant: "destructive",
          duration: 5000,
        });
    } finally {
        setSaving(false);
    }
  }
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]"><LoadingSpinner size="lg" /></div>
  }

  if (!study) {
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
          <div className="text-xl text-center sm:text-3xl font-bold sm:text-center order-first sm:order-none flex-1">
            {isNew ? (
                <Input 
                    value={study.name} 
                    onChange={(e) => handleStudyChange('name', e.target.value)}
                    placeholder="Nombre del Nuevo Tema"
                    className="bg-transparent text-center border-0 border-b-2 border-gray-700 focus:ring-0 focus:border-blue-500 text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                />
            ) : (
                <h2 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{study.name}</h2>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto order-last">
            <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-green-600 to-emerald-600 flex-1 sm:flex-none"
            >
                {saving ? <LoadingSpinner size="sm" className="mr-2"/> : <Save className="h-4 w-4 sm:mr-2" />}
                <span className="hidden sm:inline">Guardar</span>
            </Button>
            <Button
              onClick={() => exportTopicalStudyToPDF(study)}
              variant="outline"
              className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button
              onClick={handleAddStudyEntry}
              className="bg-gradient-to-r from-blue-600 to-purple-600 flex-1 sm:flex-none"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Añadir Versículo</span>
            </Button>
          </div>
        </div>

        {study.entries.map((entry) => (
          <Collapsible key={entry.id} className="group mb-4">
            <GradientCard gradient="blue" >
                <div className="flex w-full items-center p-4">
                    <CollapsibleTrigger className="flex flex-1 text-left min-w-0 items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">{entry.referencia || "Sin referencia"}</p>
                            <p className="text-sm text-gray-400 truncate mt-1">{entry.learning || "Sin aprendizaje"}</p>
                        </div>
                        <ChevronDown className="h-5 w-5 text-white transition-transform duration-300 group-data-[state=open]:rotate-180 ml-2 flex-shrink-0"/>
                    </CollapsibleTrigger>
                    {entry.referencia && (
                        <div className="ml-2 flex-shrink-0">
                            <BibleViewer
                                reference={entry.referencia}
                                defaultVersion={entry.versionTexto}
                                onClose={async (selectedVersion) => {
                                  setSaving(true);
                                  const verseText = await fetchVerseText(entry.referencia, selectedVersion);
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
                              value={entry.referencia}
                              onChange={(e) => handleUpdateStudyEntry({...entry, referencia: e.target.value})}
                              placeholder="Ej: Juan 3:16 o 1 Corintios 13:4-7"
                              className="bg-[#2a2a2a]/50 border-gray-700 text-white"
                            />
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                            {entry.versionTexto?.toUpperCase() || 'RV1960'}
                          </Badge>
                          <BibleSelector
                            onSelect={(ref) => {
                                handleUpdateStudyEntry({...entry, referencia: ref, versionTexto: 'rv1960'})
                            }}
                            currentReference={entry.referencia}
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
         {study.entries.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p>Este tema no tiene entradas. ¡Añade la primera!</p>
            </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(TopicalStudyPage);
