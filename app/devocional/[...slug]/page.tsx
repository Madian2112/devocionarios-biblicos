"use client"

import { useState, useEffect, use, useMemo } from "react"
import { useRouter } from "next/navigation"
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
  Info,
  ExternalLink,
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
import { useAuthContext } from "@/context/auth-context"
import { Timestamp } from "firebase/firestore"
import { fetchVerseText } from "@/lib/bible-api"
import withAuth from "@/components/auth/with-auth"
import { useToast } from "@/hooks/use-toast"
import { notificationService } from "@/lib/notification-service"
import { useDisableMobileZoom } from '@/hooks/use-disable-mobile-zoom';
import { usePWACleanup, usePWADetection } from "@/hooks/use-pwa-cleanup"
import {useDevocionales} from '@/hooks/use-devocionales'


function DevocionalPage({ params }: { 
  params: Promise<{  slug: string[] }> 
}) {
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const { slug } = use(params);
  const [ fecha, tipo ] = slug; // El id de la ruta es la fecha
  const isPWA = usePWADetection();
  const { triggerCleanup } = usePWACleanup(`devocional-${fecha}`);
  const [devocional, setDevocional] = useState<Devocional | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { saveDevocional, getDevocionalByKey } = useDevocionales();

  useDisableMobileZoom()


  useEffect(() =>{
    console.log('As es el valor del tipo que me lleva: ', tipo)
  }, [tipo])

  useEffect(() => {
    if (isPWA) {
      // Limpiar elementos DOM al montar en PWA
      triggerCleanup();
    }
    
    return () => {
      if (isPWA) {
        // Limpiar al desmontar
        setTimeout(() => triggerCleanup(), 100);
      }
    };
  }, [isPWA, triggerCleanup]);

  // 🔥 SOLUCIÓN: Memoized instance IDs para evitar re-renders
  const instanceIds = useMemo(() => ({
    mainDevocional: `main-devocional-${fecha}-${user?.uid || 'anonymous'}`,
    mainBibleViewer: `main-bible-viewer-${fecha}-${user?.uid || 'anonymous'}`,
    getVersiculoId: (versiculoId: string) => `versiculo-${versiculoId}-${fecha}`,
    getVersiculoViewerId: (versiculoId: string) => `versiculo-viewer-${versiculoId}-${fecha}`
  }), [fecha, user?.uid]);

  useEffect(() => {
    async function fetchOrCreateDevocional() {
      if (user && fecha) {
        setLoading(true);
        const key = `${fecha}-${user.email}`;
        const existingDevocional = await getDevocionalByKey(key);
        
        if (existingDevocional) {
          setDevocional(existingDevocional);
        } else {
          // Si no existe, creamos uno nuevo en el estado local
          const newDevocional: Devocional = {
            id: key,
            userId: user.uid,
            fecha: fecha,
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
          };
          setDevocional(newDevocional);
        }
        setLoading(false);
      }
    }
    fetchOrCreateDevocional();
  }, [user, fecha]);

  const handleDevocionalChange = (field: keyof Devocional, value: any) => {
    if (devocional) {
        setDevocional(prev => prev ? { ...prev, [field]: value, updatedAt: Timestamp.now() } : null);
    }
  };

  useEffect(() => {
    console.log('🔍 Estado actual del devocional:', {
      devocional: devocional ? 'existe' : 'null',
      versiculos: devocional?.versiculos?.length || 0,
      versiculosData: devocional?.versiculos?.map((v, i) => ({ 
        index: i, 
        id: v.id, 
        referencia: v.referencia 
      })) || []
    });
  }, [devocional?.versiculos]);
  
  // 💾 FUNCIÓN DE GUARDADO PRINCIPAL
  const handleSave = async () => {
    if (!user || !devocional) return;
    setSaving(true);
    try {
      // El 'userId' ya está en el objeto devocional, pero el servicio espera que se pase por separado.
      // Creamos una copia sin el userId para pasarla como segundo argumento.
      const { userId, ...devocionalData } = devocional;
      devocionalData.completado = devocional.aprendizajeGeneral.trim() !== "" ? true: false;
      console.log('Este es mi usuarios:', user);
      await saveDevocional(devocionalData);
      
      // 🔔 Notificación de éxito
      toast({
        title: "✅ Devocional guardado",
        description: "Tu reflexión espiritual ha sido guardada correctamente.",
        duration: 3000,
      });
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Error guardando el devocional:", error);
      
      // 🔔 Notificación de error
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar el devocional. Inténtalo de nuevo.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBibleSelection = async (index: number, reference: string) => {
  try {
    
    
    if (!devocional || !devocional.versiculos[index]) {
      console.error(`❌ No se puede actualizar versículo en índice ${index} - no existe`);
      return;
    }
    
    setSaving(true);
    const verseText = await fetchVerseText(reference, 'rv1960');
    
    // 🔥 BATCH UPDATE - Más eficiente
    setDevocional(prev => {
      if (!prev) return prev;
      
      const updatedVersiculos = [...prev.versiculos];
      updatedVersiculos[index] = {
        ...updatedVersiculos[index],
        referencia: reference,
        texto: verseText,
        versionTexto: 'rv1960'
      };
      
      return {
        ...prev,
        versiculos: updatedVersiculos,
        updatedAt: Timestamp.now()
      };
    });
    
  } catch (error) {
    console.error('❌ Error al obtener el texto del versículo:', error);
  } finally {
    setSaving(false);
  }
};



const addVersiculo = () => {
  if (!devocional) return;
  
  const newVersiculo: Versiculo = {
    id: Date.now().toString(),
    referencia: "",
    texto: "",
    aprendizaje: "",
    versionTexto: "rv1960",
  };
  
  const updatedVersiculos = [...devocional.versiculos, newVersiculo];
  
  
  
  handleDevocionalChange('versiculos', updatedVersiculos);
};

  const removeVersiculo = (versiculoId: string) => {
    if (!devocional) return
    handleDevocionalChange('versiculos', devocional.versiculos.filter((v) => v.id !== versiculoId));
  }
  
const handleVersiculoChange = (index: number, updates: Partial<Versiculo>) => {
  if (!devocional) return;

  const updatedVersiculos = [...devocional.versiculos];

  if (index < 0 || index >= updatedVersiculos.length || !updatedVersiculos[index]) {
    console.error(`❌ Versículo en índice ${index} no existe. Array length: ${updatedVersiculos.length}`);
    console.error('Versículos disponibles:', updatedVersiculos.map((v, i) => ({ index: i, id: v.id, referencia: v.referencia })));
    return;
  }

  updatedVersiculos[index] = { ...updatedVersiculos[index], ...updates };

  handleDevocionalChange('versiculos', updatedVersiculos);
};


  const addReferencia = () => {
    if (!devocional) return
    const newReferencia: Referencia = {
      id: Date.now().toString(),
      url: "",
      descripcion: "",
    }
    handleDevocionalChange('referencias', [...devocional.referencias, newReferencia]);
  }

  const removeReferencia = (referenciaId: string) => {
    if (!devocional) return
    handleDevocionalChange('referencias', devocional.referencias.filter((r) => r.id !== referenciaId));
  }

  const handleReferenciaChange = (index: number, field: keyof Referencia, value: any) => {
    if (!devocional) return;
    const updatedReferencias = [...devocional.referencias];
    updatedReferencias[index] = { ...updatedReferencias[index], [field]: value };
    handleDevocionalChange('referencias', updatedReferencias);
  }

  const handleTagsChange = (newTags: string[]) => {
    handleDevocionalChange('tags', newTags);
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return utcDate.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: 'UTC'
    })
  }


  const openInBrowser = (url: string) => {
    // Detectar si está en PWA
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any)?.standalone === true;
    
    if (isPWA) {
      // En PWA, esto debería abrir en el navegador
      window.location.href = url;
    } else {
      // En navegador normal
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openInBrowser(`https://devocionales-biblicos-rv.netlify.app/devocional/${fecha}`);
  };

  const getTextoValue = () => {
    const versionesBiblicas = ['rv1960', 'rv1995', 'nvi', 'dhh', 'pdt', 'kjv'];
    const contieneVersion = versionesBiblicas.some(v => 
      devocional?.textoDevocional?.includes(v.toUpperCase())
    );
    
    return contieneVersion
      ? devocional?.textoDevocional
      : `${devocional?.versionCitaBiblica?.toUpperCase()} - ${devocional?.citaBiblica}\n\n${devocional?.textoDevocional}`;
  };

  if (loading) {
      return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f]"><LoadingSpinner size="lg" /></div>
  }
  
  if (!devocional) {
      return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#0f0f0f] text-white">Cargando devocional... <Link href="/dashboard" className="ml-2 underline">Volver</Link></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header mejorado */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <Link href={tipo === 'dashboard' ? '/dashboard' : '/devocional/historial'}>
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
              {formatDate(devocional.fecha)}
            </h1>
            <p className="text-gray-400">Devocional Diario</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => exportDevocionalToPDF(devocional)}
              variant="outline"
              className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !devocional}
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 shadow-lg px-8"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> 
                  Guardando...
                </>
              ) : (
                <>
                  💾 Guardar Devocional
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
                    value={devocional.citaBiblica}
                    onChange={(e) => handleDevocionalChange('citaBiblica', e.target.value)}
                    placeholder="Ej: Juan 3:16"
                    className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors"
                  />
                </div>
                 <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                    {devocional.versionCitaBiblica?.toUpperCase() || 'RV1960'}
                 </Badge>
                <BibleSelector
                  instanceId={instanceIds.mainDevocional} 
                  currentReference={devocional.citaBiblica}
                  onSelect={async (reference) => {
                    setSaving(true);
                    const verseText = await fetchVerseText(reference, 'rv1960');
                    setDevocional(prev => prev ? { ...prev, citaBiblica: reference, textoDevocional: verseText, versionCitaBiblica: 'rv1960' } : null);
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
                {devocional.citaBiblica && (
                  <BibleViewer
                    instanceId={instanceIds.mainBibleViewer}
                    reference={devocional.citaBiblica}
                    defaultVersion={devocional.versionCitaBiblica}
                    onClose={async (selectedVersion) => {
                      if (devocional) { 
                         setSaving(true);
                         const verseText = await fetchVerseText(devocional.citaBiblica, selectedVersion);
                         handleDevocionalChange('textoDevocional', verseText);
                         handleDevocionalChange('versionCitaBiblica', selectedVersion);
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
                value={getTextoValue()}
                onChange={(e) => handleDevocionalChange('textoDevocional', e.target.value)}
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
                    value={devocional.aprendizajeGeneral}
                    onChange={(e) => handleDevocionalChange('aprendizajeGeneral', e.target.value)}
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
                <div className="relative group mr-4 sm:mr-12">
                  <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-blue-200 cursor-help">
                    NOTA
                    <ExternalLink className="h-3 w-3 text-blue-600" />
                  </span>

                  <div className="absolute hidden group-hover:block z-10 w-[90vw] max-w-xs sm:w-72 bg-gray-800 text-white text-sm p-3 rounded-md shadow-lg 
                                  left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 mt-1">
                    <p>Si presenta problemas para agregar versículos, abra la app en la web:</p>
                    <a 
                      onClick={handleClick}
                      className="mt-1 text-blue-400 hover:text-blue-300 underline break-words block text-[0.75rem]"
                    >
                      https://devocionales-biblicos-rv.netlify.app/devocional/{fecha}
                    </a>
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  </div>
                </div>

                </h3>
              <Button
                onClick={addVersiculo}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-1 ml-2" />
                Agregar Versículo
              </Button>
            </div>


                    {devocional?.versiculos && devocional.versiculos.length > 0 ? (
                      devocional.versiculos.map((versiculo, index) => {
                        
                        
                        return (
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
                                      value={versiculo?.referencia || ''}
                                      onChange={(e) => {
                                        
                                        handleVersiculoChange(index, {referencia: e.target.value});
                                      }}
                                      placeholder="Ej: Salmos 23:1"
                                      className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors"
                                    />
                                  </div>
                                  <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                                    {versiculo?.versionTexto?.toUpperCase() || 'RV1960'}
                                  </Badge>
                                      <BibleSelector
                                        key={instanceIds.getVersiculoId(versiculo.id)}
                                        instanceId={`versiculo-${versiculo.id}`}
                                        onSelect={(reference) => handleBibleSelection(index, reference)}
                                        currentReference={versiculo?.referencia || ''}
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
                                  {versiculo?.referencia && (
                                    <BibleViewer
                                      instanceId={instanceIds.getVersiculoViewerId(versiculo.id)}
                                      reference={versiculo.referencia}
                                      defaultVersion={versiculo?.versionTexto}
                                      onClose={async (selectedVersion) => {
                                        try {
                                          setSaving(true);
                                          const verseText = await fetchVerseText(versiculo.referencia, selectedVersion);
                                          handleVersiculoChange(index, {
                                            texto: verseText,
                                            versionTexto: selectedVersion,
                                          });
                                          setSaving(false);
                                        } catch (error) {
                                          console.error('Error al cambiar versión:', error);
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
                                <label className="block text-sm font-medium text-gray-300 mb-3">Texto del Versículo</label>
                                <Textarea
                                  value={`${versiculo.versionTexto?.toUpperCase()} - ${versiculo.referencia} \n\n${versiculo?.texto}` }
                                  onChange={(e) => handleVersiculoChange(index, {texto: e.target.value})}
                                  placeholder="Texto completo del versículo..."
                                  className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                  Aprendizaje del Versículo
                                </label>
                                <Textarea
                                  value={versiculo?.aprendizaje || ''}
                                  onChange={(e) => handleVersiculoChange(index, {aprendizaje:e.target.value})}
                                  placeholder="¿Qué te enseña este versículo específicamente? ¿Cómo se relaciona con tu vida?"
                                  className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                                />
                              </div>
                            </CardContent>
                          </GradientCard>
                        );
                      })
                    ) : (
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

                {devocional.referencias.map((referencia, index) => (
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
                          onChange={(e) => handleReferenciaChange(index, 'url', e.target.value)}
                          placeholder="https://ejemplo.com/estudio-biblico"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Descripción</label>
                        <Textarea
                          value={referencia.descripcion}
                          onChange={(e) => handleReferenciaChange(index, 'descripcion', e.target.value)}
                          placeholder="¿Qué información útil encontraste en este enlace? ¿Cómo complementa tu estudio?"
                          className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-green-500 transition-colors resize-none"
                        />
                      </div>
                    </CardContent>
                  </GradientCard>
                ))}

                {devocional.referencias.length === 0 && (
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
                {devocional.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-sm">
                    {tag}
                    <button
                      onClick={() => {
                        handleTagsChange(devocional.tags?.filter((t) => t !== tag) || []);
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
                    if (newTag && !devocional.tags?.includes(newTag)) {
                      handleTagsChange([...(devocional.tags || []), newTag]);
                      e.currentTarget.value = "";
                    }
                  }
                }}
                className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-yellow-500 transition-colors"
              />
            </CardContent>
          </GradientCard>

          {/* 💾 BOTÓN DE GUARDADO */}
          <div className="flex justify-center mt-8">
            {/* 💾 BOTÓN PRINCIPAL DE GUARDADO */}
            <Button 
              onClick={handleSave} 
              disabled={saving || !devocional}
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 shadow-lg px-8"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> 
                  Guardando...
                </>
              ) : (
                <>
                  💾 Guardar Devocional
                </>
              )}
            </Button>
          </div>
      </div>
    </div>
  )
}

export default withAuth(DevocionalPage); 