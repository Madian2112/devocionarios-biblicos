"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, BookOpen, Calendar, Edit } from "lucide-react"
import type { TopicalStudy } from "@/lib/firestore"
import Link from "next/link"

interface QuickPreviewProps {
  study: TopicalStudy
  trigger?: React.ReactNode
}

export function QuickPreview({ study, trigger }: QuickPreviewProps) {
  const [open, setOpen] = useState(false)

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Fecha no disponible"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Eye className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-900 border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">{study.name}</DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {study.entries.length} {study.entries.length === 1 ? "entrada" : "entradas"}
              </Badge>
              <Link href={`/topical/${study.id}`}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(false)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Creado: {formatDate(study.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Actualizado: {formatDate(study.updatedAt)}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-96 mt-4">
          <div className="space-y-4">
            {study.entries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Este tema no tiene entradas aún</p>
                <p className="text-sm">¡Añade la primera para comenzar!</p>
              </div>
            ) : (
              study.entries.map((entry, index) => (
                <div key={entry.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-300">{entry.referencia || `Entrada ${index + 1}`}</h4>
                    <Badge variant="outline" className="text-xs">
                      {entry.versionTexto?.toUpperCase() || "RV1960"}
                    </Badge>
                  </div>
                  {entry.learning && (
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {entry.learning.length > 150 ? `${entry.learning.substring(0, 150)}...` : entry.learning}
                    </p>
                  )}
                  {!entry.learning && <p className="text-gray-500 text-sm italic">Sin apuntes añadidos</p>}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {study.entries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>
                Total: {study.entries.length} {study.entries.length === 1 ? "versículo" : "versículos"}
              </span>
              <span>Progreso: {study.entries.filter((e) => e.learning?.trim()).length} con apuntes</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
