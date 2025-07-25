"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

// Importaciones de íconos y componentes UI
import {
  Book,
  ChevronLeft,
  BookOpen,
  Heart,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { GradientCard } from "@/components/ui/gradient-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BibleSelector } from "@/components/bible/bible-selector"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { exportDevocionalToPDF } from "@/lib/pdf-exporter"
import type { Devocional, Versiculo, Referencia } from "@/lib/firestore"
import { Timestamp } from "firebase/firestore"
import { fetchVerseText } from "@/lib/bible-api"

// Datos de ejemplo
const getSampleDevocional = (id: string): Devocional | null => {
    if (id === 'new') return null;
    return {
        id: id,
        fecha: new Date().toISOString().split("T")[0],
        citaBiblica: "Juan 3:16",
        textoDevocional: "Porque de tal manera amó Dios al mundo...",
        aprendizajeGeneral: "El amor de Dios es incondicional.",
        versiculos: [],
        referencias: [],
        tags: ["Fe", "Amor"],
        completado: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        versionCitaBiblica: "rv1960",
    };
};

const createNewDevocional = (): Devocional => ({
    id: Date.now().toString(),
    fecha: new Date().toISOString().split("T")[0],
    citaBiblica: "",
    textoDevocional: "",
    aprendizajeGeneral: "",
    versiculos: [],
    referencias: [],
    tags: [],
    completado: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    versionCitaBiblica: "rv1960",
});

export default function DevocionalPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [currentDevocional, setCurrentDevocional] = useState<Devocional | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
        const devocionalId = Array.isArray(id) ? id[0] : id;
        if (devocionalId === 'new') {
            setCurrentDevocional(createNewDevocional());
        } else {
            // Aquí iría la lógica para cargar desde la BD
            setCurrentDevocional(getSampleDevocional(devocionalId));
        }
        setLoading(false);
    }
  }, [id]);
  
  const handleSave = () => {
    setSaving(true);
    // Lógica para guardar...
    console.log("Guardando devocional:", currentDevocional);
    setTimeout(() => {
        setSaving(false);
        router.push("/dashboard"); // Redirigir al dashboard después de guardar
    }, 1000);
  }

  const addVersiculo = () => {
    if (!currentDevocional) return
    const newVersiculo: Versiculo = {
      id: Date.now().toString(),
      referencia: "",
      texto: "",
      aprendizaje: "",
      versionTexto: "rv1960",
    }
    setCurrentDevocional({
      ...currentDevocional,
      versiculos: [...currentDevocional.versiculos, newVersiculo],
    })
  }

  const removeVersiculo = (versiculoId: string) => {
    if (!currentDevocional) return
    setCurrentDevocional({
      ...currentDevocional,
      versiculos: currentDevocional.versiculos.filter((v) => v.id !== versiculoId),
    })
  }

  const addReferencia = () => {
    if (!currentDevocional) return
    const newReferencia: Referencia = {
      id: Date.now().toString(),
      url: "",
      descripcion: "",
    }
    setCurrentDevocional({
      ...currentDevocional,
      referencias: [...currentDevocional.referencias, newReferencia],
    })
  }

  const removeReferencia = (referenciaId: string) => {
    if (!currentDevocional) return
    setCurrentDevocional({
      ...currentDevocional,
      referencias: currentDevocional.referencias.filter((r) => r.id !== referenciaId),
    })
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }


  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]"><LoadingSpinner /></div>
  }
  
  if (!currentDevocional) {
      return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] text-white">Devocional no encontrado. <Link href="/dashboard" className="ml-2 underline">Volver</Link></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header mejorado */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <Link href="/dashboard">
                <Button
                    variant="outline"
                    className="bg-[#1a1a1a]/50 border-gray-700 hover:bg-[#2a2a2a]/50 backdrop-blur-sm w-full sm:w-auto"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Volver al Dashboard
                </Button>
            </Link>

          <div className="text-center order-first sm:order-none">
            <h1 className="text-xl sm:text-2xl font-bold text-white capitalize mb-1">
              {formatDate(currentDevocional.fecha)}
            </h1>
            <p className="text-gray-400">Devocional Diario</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => exportDevocionalToPDF(currentDevocional)}
              variant="outline"
              disabled={saving}
              className="flex-1 bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Información Básica mejorada */}
        <GradientCard gradient="blue" className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              Información del Devocional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Cita Bíblica Principal</label>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <Input
                    value={currentDevocional.citaBiblica}
                    onChange={(e) =>
                      setCurrentDevocional({
                        ...currentDevocional,
                        citaBiblica: e.target.value,
                      })
                    }
                    placeholder="Ej: Juan 3:16"
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors"
                  />
                </div>
                 <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                    {currentDevocional.versionCitaBiblica?.toUpperCase() || 'RV1960'}
                 </Badge>
                <BibleSelector
                  currentReference={currentDevocional.citaBiblica}
                  onSelect={async (reference) => {
                    setSaving(true);
                    const verseText = await fetchVerseText(reference, 'rv1960');
                    setCurrentDevocional({
                      ...currentDevocional,
                      citaBiblica: reference,
                      textoDevocional: verseText,
                      versionCitaBiblica: 'rv1960',
                    });
                    setSaving(false);
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                    >
                      <Book className="h-4 w-4 mr-2" />
                      Seleccionar
                    </Button>
                  }
                />
                {currentDevocional.citaBiblica && (
                  <BibleViewer
                    reference={currentDevocional.citaBiblica}
                    defaultVersion={currentDevocional.versionCitaBiblica}
                    onClose={async (selectedVersion) => {
                      if (currentDevocional) { 
                         setSaving(true);
                         const verseText = await fetchVerseText(currentDevocional.citaBiblica, selectedVersion);
                         setCurrentDevocional({ ...currentDevocional, textoDevocional: verseText, versionCitaBiblica: selectedVersion });
                         setSaving(false);
                      }
                    }}
                    trigger={
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Texto del Devocional</label>
              <Textarea
                value={currentDevocional.textoDevocional}
                onChange={(e) =>
                  setCurrentDevocional({
                    ...currentDevocional,
                    textoDevocional: e.target.value,
                  })
                }
                placeholder="Escribe o pega el contenido del devocional aquí..."
                className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[150px] backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                disabled={saving}
              />
            </div>
          </CardContent>
        </GradientCard>

        {/* Tabs mejorados */}
        <Tabs defaultValue="aprendizaje" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a]/50 border border-gray-800/50 backdrop-blur-sm p-1">
              <TabsTrigger
                value="aprendizaje"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white text-gray-400 transition-all"
              >
                <Heart className="h-4 w-4 mr-2" />
                Aprendizaje
              </TabsTrigger>
              <TabsTrigger
                value="versiculos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white text-gray-400 transition-all"
              >
                <Book className="h-4 w-4 mr-2" />
                Versículos
              </TabsTrigger>
              <TabsTrigger
                value="referencias"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-white text-gray-400 transition-all"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Referencias
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aprendizaje">
              <GradientCard gradient="purple">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <Heart className="h-5 w-5 text-red-400" />
                    </div>
                    Aprendizaje General
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Escribe el aprendizaje principal que obtuviste de este devocional
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={currentDevocional.aprendizajeGeneral}
                    onChange={(e) =>
                      setCurrentDevocional({
                        ...currentDevocional,
                        aprendizajeGeneral: e.target.value,
                      })
                    }
                    placeholder="¿Qué aprendiste hoy? ¿Cómo puedes aplicar este mensaje en tu vida diaria? ¿Qué cambios quieres hacer?"
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white min-h-[200px] backdrop-blur-sm focus:border-purple-500 transition-colors resize-none"
                  />
                </CardContent>
              </GradientCard>
            </TabsContent>

            <TabsContent value="versiculos">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Book className="h-5 w-5 text-blue-400" />
                    </div>
                    Versículos Específicos
                  </h3>
                  <Button
                    onClick={addVersiculo}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Versículo
                  </Button>
                </div>

                {currentDevocional.versiculos.map((versiculo, index) => (
                  <GradientCard key={versiculo.id} gradient="blue" className="group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-sm font-medium">
                            #{index + 1}
                          </span>
                          Versículo {index + 1}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeVersiculo(versiculo.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Referencia Bíblica</label>
                        <div className="flex gap-3 items-center">
                          <div className="flex-1">
                            <Input
                              value={versiculo.referencia}
                              onChange={(e) => {
                                const updatedVersiculos = [...currentDevocional.versiculos]
                                updatedVersiculos[index] = { ...versiculo, referencia: e.target.value }
                                setCurrentDevocional({
                                  ...currentDevocional,
                                  versiculos: updatedVersiculos,
                                })
                              }}
                              placeholder="Ej: Salmos 23:1"
                              className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                             {versiculo.versionTexto?.toUpperCase() || 'RV1960'}
                          </Badge>
                          <BibleSelector
                                  onSelect={async (reference) => {
                                    const updatedVersiculos = [...currentDevocional.versiculos];
                                    const verseText = await fetchVerseText(reference, 'rv1960');
                                    updatedVersiculos[index] = { ...versiculo, referencia: reference, texto: verseText, versionTexto: 'rv1960' };
                                    setCurrentDevocional({
                                      ...currentDevocional,
                                      versiculos: updatedVersiculos,
                                    });
                                  }}
                                  currentReference={versiculo.referencia}
                                  trigger={
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                                    >
                                      <Book className="h-4 w-4" />
                                    </Button>
                                  }
                                />
                          {versiculo.referencia && (
                            <BibleViewer
                              reference={versiculo.referencia}
                              defaultVersion={versiculo.versionTexto}
                              onClose={async (selectedVersion) => {
                                 setSaving(true);
                                 const updatedVersiculos = [...currentDevocional.versiculos];
                                 const verseText = await fetchVerseText(versiculo.referencia, selectedVersion);
                                 updatedVersiculos[index] = { ...versiculo, texto: verseText, versionTexto: selectedVersion };
                                 setCurrentDevocional({
                                   ...currentDevocional,
                                   versiculos: updatedVersiculos,
                                 });
                                 setSaving(false);
                              }}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50 shrink-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              }
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Texto del Versículo</label>
                        <Textarea
                          value={versiculo.texto}
                          onChange={(e) => {
                            const updatedVersiculos = [...currentDevocional.versiculos]
                            updatedVersiculos[index] = { ...versiculo, texto: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              versiculos: updatedVersiculos,
                            })
                          }}
                          placeholder="Texto completo del versículo..."
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Aprendizaje del Versículo
                        </label>
                        <Textarea
                          value={versiculo.aprendizaje}
                          onChange={(e) => {
                            const updatedVersiculos = [...currentDevocional.versiculos]
                            updatedVersiculos[index] = { ...versiculo, aprendizaje: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              versiculos: updatedVersiculos,
                            })
                          }}
                          placeholder="¿Qué te enseña este versículo específicamente? ¿Cómo se relaciona con tu vida?"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                        />
                      </div>
                    </CardContent>
                  </GradientCard>
                ))}

                {currentDevocional.versiculos.length === 0 && (
                  <GradientCard>
                    <CardContent className="text-center py-16">
                      <div className="p-4 bg-blue-500/10 rounded-full w-fit mx-auto mb-6">
                        <Book className="h-12 w-12 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No hay versículos agregados</h3>
                      <p className="text-gray-400 mb-6">Agrega versículos específicos para profundizar en tu estudio</p>
                      <Button
                        onClick={addVersiculo}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Versículo
                      </Button>
                    </CardContent>
                  </GradientCard>
                )}
              </div>
            </TabsContent>

            <TabsContent value="referencias">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <LinkIcon className="h-5 w-5 text-green-400" />
                    </div>
                    Referencias y Enlaces
                  </h3>
                  <Button
                    onClick={addReferencia}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Referencia
                  </Button>
                </div>

                {currentDevocional.referencias.map((referencia, index) => (
                  <GradientCard key={referencia.id} gradient="green" className="group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg text-sm font-medium">
                            #{index + 1}
                          </span>
                          Referencia {index + 1}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {referencia.url && (
                            <Link href={referencia.url} target="_blank">
                                <Button
                                variant="outline"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
                                >
                                <LinkIcon className="h-4 w-4 text-blue-400" />
                                </Button>
                            </Link>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeReferencia(referencia.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/20 border-red-500/30 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">URL del Enlace</label>
                        <Input
                          value={referencia.url}
                          onChange={(e) => {
                            const updatedReferencias = [...currentDevocional.referencias]
                            updatedReferencias[index] = { ...referencia, url: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              referencias: updatedReferencias,
                            })
                          }}
                          placeholder="https://ejemplo.com/estudio-biblico"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Descripción</label>
                        <Textarea
                          value={referencia.descripcion}
                          onChange={(e) => {
                            const updatedReferencias = [...currentDevocional.referencias]
                            updatedReferencias[index] = { ...referencia, descripcion: e.target.value }
                            setCurrentDevocional({
                              ...currentDevocional,
                              referencias: updatedReferencias,
                            })
                          }}
                          placeholder="¿Qué información útil encontraste en este enlace? ¿Cómo complementa tu estudio?"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-green-500 transition-colors resize-none"
                        />
                      </div>
                    </CardContent>
                  </GradientCard>
                ))}

                {currentDevocional.referencias.length === 0 && (
                  <GradientCard>
                    <CardContent className="text-center py-16">
                      <div className="p-4 bg-green-500/10 rounded-full w-fit mx-auto mb-6">
                        <LinkIcon className="h-12 w-12 text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">No hay referencias agregadas</h3>
                      <p className="text-gray-400 mb-6">
                        Agrega enlaces y recursos que complementen tu estudio bíblico
                      </p>
                      <Button
                        onClick={addReferencia}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primera Referencia
                      </Button>
                    </CardContent>
                  </GradientCard>
                )}
              </div>
            </TabsContent>
          </Tabs>

        {/* Gestión de Etiquetas */}
        <GradientCard gradient="purple" className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </div>
                Etiquetas Temáticas
              </CardTitle>
              <CardDescription className="text-gray-400">
                Organiza tu devocional con etiquetas para encontrarlo fácilmente. Presiona Enter para agregar una etiqueta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentDevocional.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-sm">
                    {tag}
                    <button
                      onClick={() => {
                        setCurrentDevocional({
                          ...currentDevocional,
                          tags: currentDevocional.tags?.filter((t) => t !== tag),
                        });
                      }}
                      className="ml-2 text-yellow-400 hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Añadir etiqueta (ej: Fe, Gracia, Amor) y presionar Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newTag = e.currentTarget.value.trim();
                    if (newTag && !currentDevocional.tags?.includes(newTag)) {
                      setCurrentDevocional({
                        ...currentDevocional,
                        tags: [...(currentDevocional.tags || []), newTag],
                      });
                      e.currentTarget.value = "";
                    }
                  }
                }}
                className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-yellow-500 transition-colors"
              />
            </CardContent>
          </GradientCard>
      </div>
    </div>
  )
} 