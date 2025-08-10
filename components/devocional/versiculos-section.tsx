"use client"

import { useState } from "react"
import {
  Book,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { GradientCard } from "@/components/ui/gradient-card"
import { BibleSelector } from "@/components/bible/bible-selector"
import { BibleViewer } from "@/components/bible/bible-viewer"
import { fetchVerseText } from "@/lib/bible-api"
import type { Versiculo } from "@/lib/firestore"

interface VersiculosSectionProps {
  versiculos: Versiculo[]
  fecha: string
  userId?: string
  onVersiculosChange: (versiculos: Versiculo[]) => void
  onSavingChange?: (saving: boolean) => void
}

export function VersiculosSection({ 
  versiculos, 
  fecha, 
  userId, 
  onVersiculosChange,
  onSavingChange 
}: VersiculosSectionProps) {
  const [saving, setSaving] = useState(false)

  // Generar IDs únicos para instancias de componentes
  const getVersiculoId = (versiculoId: string) => `versiculo-${versiculoId}-${fecha}`
  const getVersiculoViewerId = (versiculoId: string) => `versiculo-viewer-${versiculoId}-${fecha}`

  const addVersiculo = () => {
    const newVersiculo: Versiculo = {
      id: Date.now().toString(),
      referencia: "",
      texto: "",
      aprendizaje: "",
      versionTexto: "rv1960",
    }
    
    const updatedVersiculos = [...versiculos, newVersiculo]
    onVersiculosChange(updatedVersiculos)
  }

  const removeVersiculo = (versiculoId: string) => {
    const updatedVersiculos = versiculos.filter((v) => v.id !== versiculoId)
    onVersiculosChange(updatedVersiculos)
  }
  
  const handleVersiculoChange = (index: number, updates: Partial<Versiculo>) => {
    const updatedVersiculos = [...versiculos]

    if (index < 0 || index >= updatedVersiculos.length || !updatedVersiculos[index]) {
      console.error(`❌ Versículo en índice ${index} no existe. Array length: ${updatedVersiculos.length}`)
      console.error('Versículos disponibles:', updatedVersiculos.map((v, i) => ({ index: i, id: v.id, referencia: v.referencia })))
      return
    }

    updatedVersiculos[index] = { ...updatedVersiculos[index], ...updates }
    onVersiculosChange(updatedVersiculos)
  }

  const handleBibleSelection = async (index: number, reference: string) => {
    try {
      if (!versiculos[index]) {
        console.error(`❌ No se puede actualizar versículo en índice ${index} - no existe`)
        return
      }
      
      setSaving(true)
      onSavingChange?.(true)
      
      const verseText = await fetchVerseText(reference, 'rv1960')
      
      handleVersiculoChange(index, {
        referencia: reference,
        texto: verseText,
        versionTexto: 'rv1960'
      })
      
    } catch (error) {
      console.error('❌ Error al obtener el texto del versículo:', error)
    } finally {
      setSaving(false)
      onSavingChange?.(false)
    }
  }

  const openInBrowser = (url: string) => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any)?.standalone === true
    
    if (isPWA) {
      window.location.href = url
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    openInBrowser(`https://devocionales-biblicos.com/devocional/${fecha}/dashboard`)
  }

  return (
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
          <Plus className="h-4 w-4 mr-1 ml-2" />
          Agregar Versículo
        </Button>
      </div>

      {versiculos && versiculos.length > 0 ? (
        versiculos.map((versiculo, index) => (
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
                        handleVersiculoChange(index, {referencia: e.target.value})
                      }}
                      placeholder="Ej: Salmos 23:1"
                      className="bg-[#2a2a2a]/50 border-gray-700 text-white backdrop-blur-sm focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <Badge variant="outline" className="border-gray-600 text-gray-400 shrink-0">
                    {versiculo?.versionTexto?.toUpperCase() || 'RV1960'}
                  </Badge>
                  <BibleSelector
                    key={getVersiculoId(versiculo.id)}
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
                      instanceId={getVersiculoViewerId(versiculo.id)}
                      reference={versiculo.referencia}
                      defaultVersion={versiculo?.versionTexto}
                      onClose={async (selectedVersion) => {
                        try {
                          setSaving(true)
                          onSavingChange?.(true)
                          
                          const verseText = await fetchVerseText(versiculo.referencia, selectedVersion)
                          handleVersiculoChange(index, {
                            texto: verseText,
                            versionTexto: selectedVersion,
                          })
                        } catch (error) {
                          console.error('Error al cambiar versión:', error)
                        } finally {
                          setSaving(false)
                          onSavingChange?.(false)
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
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Aprendizaje del Versículo
                </label>
                <Textarea
                  value={versiculo?.aprendizaje || ''}
                  onChange={(e) => handleVersiculoChange(index, {aprendizaje: e.target.value})}
                  placeholder="¿Qué te enseña este versículo específicamente? ¿Cómo se relaciona con tu vida?"
                  className="bg-[#2a2a2a]/50 border-gray-700 min-h-[180px] text-white backdrop-blur-sm focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </CardContent>
          </GradientCard>
        ))
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
  )
}