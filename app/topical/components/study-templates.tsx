"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, Shield, Lightbulb, Users, Star } from "lucide-react"
import type { StudyEntry } from "@/lib/firestore"

interface StudyTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  entries: Omit<StudyEntry, "id">[]
}

const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: "love",
    name: "El Amor de Dios",
    description: "Explora el amor incondicional de Dios a través de las Escrituras",
    icon: <Heart className="h-5 w-5" />,
    category: "Fundamental",
    entries: [
      {
        referencia: "Juan 3:16",
        learning: "El amor de Dios demostrado en el sacrificio de Jesús",
        versionTexto: "rv1960",
      },
      { referencia: "1 Juan 4:8", learning: "Dios es amor - su naturaleza esencial", versionTexto: "rv1960" },
      { referencia: "Romanos 8:38-39", learning: "Nada puede separarnos del amor de Dios", versionTexto: "rv1960" },
      { referencia: "Efesios 3:17-19", learning: "La amplitud del amor de Cristo", versionTexto: "rv1960" },
    ],
  },
  {
    id: "faith",
    name: "Fundamentos de la Fe",
    description: "Versículos clave sobre la fe cristiana y cómo vivirla",
    icon: <Shield className="h-5 w-5" />,
    category: "Fundamental",
    entries: [
      { referencia: "Hebreos 11:1", learning: "Definición bíblica de la fe", versionTexto: "rv1960" },
      { referencia: "Romanos 10:17", learning: "La fe viene por el oír la Palabra", versionTexto: "rv1960" },
      { referencia: "Efesios 2:8-9", learning: "Salvos por gracia mediante la fe", versionTexto: "rv1960" },
      { referencia: "Santiago 2:17", learning: "La fe sin obras está muerta", versionTexto: "rv1960" },
    ],
  },
  {
    id: "wisdom",
    name: "Sabiduría Divina",
    description: "Cómo obtener y aplicar la sabiduría de Dios",
    icon: <Lightbulb className="h-5 w-5" />,
    category: "Crecimiento",
    entries: [
      {
        referencia: "Proverbios 9:10",
        learning: "El temor del Señor es el principio de la sabiduría",
        versionTexto: "rv1960",
      },
      { referencia: "Santiago 1:5", learning: "Pedir sabiduría a Dios", versionTexto: "rv1960" },
      { referencia: "1 Corintios 1:25", learning: "La sabiduría de Dios vs la del mundo", versionTexto: "rv1960" },
      {
        referencia: "Colosenses 2:3",
        learning: "En Cristo están todos los tesoros de sabiduría",
        versionTexto: "rv1960",
      },
    ],
  },
  {
    id: "community",
    name: "Vida en Comunidad",
    description: "La importancia de la iglesia y la comunión cristiana",
    icon: <Users className="h-5 w-5" />,
    category: "Relaciones",
    entries: [
      { referencia: "Hebreos 10:24-25", learning: "No dejemos de congregarnos", versionTexto: "rv1960" },
      { referencia: "1 Corintios 12:12-27", learning: "Somos un cuerpo con muchos miembros", versionTexto: "rv1960" },
      { referencia: "Gálatas 6:2", learning: "Llevad los unos las cargas de los otros", versionTexto: "rv1960" },
      { referencia: "Efesios 4:11-16", learning: "Creciendo juntos en unidad", versionTexto: "rv1960" },
    ],
  },
]

interface StudyTemplatesProps {
  onSelectTemplate: (template: StudyTemplate) => void
}

export function StudyTemplates({ onSelectTemplate }: StudyTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<StudyTemplate | null>(null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Usar Plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Plantillas de Estudio Temático
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Comienza con plantillas predefinidas para temas comunes de estudio bíblico
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {STUDY_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">{template.icon}</div>
                    <div>
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{template.entries.length} versículos incluidos</span>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectTemplate(template)
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Usar Plantilla
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              {selectedTemplate.icon}
              Vista Previa: {selectedTemplate.name}
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedTemplate.entries.map((entry, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                  <span className="text-blue-300 font-medium">{entry.referencia}</span>
                  <span className="text-gray-400 truncate">{entry.learning}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => onSelectTemplate(selectedTemplate)} className="bg-purple-600 hover:bg-purple-700">
                Crear con esta Plantilla
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
