"use client";

import { useState } from "react";
import { StudyTopic, BibleReference, WebLink, Subtopic } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, BookOpen, Link, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyTopicFormProps {
  initialData?: Partial<StudyTopic>;
  onSubmit: (
    data: Omit<StudyTopic, "id" | "userId" | "createdAt" | "updatedAt">
  ) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function StudyTopicForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: StudyTopicFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    bibleReferences: initialData?.bibleReferences || ([] as BibleReference[]),
    webLinks: initialData?.webLinks || ([] as WebLink[]),
    subtopics: initialData?.subtopics || ([] as Subtopic[]),
    tags: initialData?.tags || ([] as string[]),
    completed: initialData?.completed || false,
    order: initialData?.order || 0,
  });

  const [newTag, setNewTag] = useState("");
  const [newReference, setNewReference] = useState({
    book: "",
    chapter: "",
    verse: "",
  });
  const [newWebLink, setNewWebLink] = useState({ title: "", url: "" });
  const [newSubtopic, setNewSubtopic] = useState({ title: "", content: "" });
  const [activeTab, setActiveTab] = useState("basic");

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddReference = () => {
    if (newReference.book && newReference.chapter && newReference.verse) {
      const reference: BibleReference = {
        book: newReference.book,
        chapter: newReference.chapter,
        verse: newReference.verse,
      };
      setFormData((prev) => ({
        ...prev,
        bibleReferences: [...prev.bibleReferences, reference],
      }));
      setNewReference({ book: "", chapter: "", verse: "" });
    }
  };

  const handleRemoveReference = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bibleReferences: prev.bibleReferences.filter((_, i) => i !== index),
    }));
  };

  const handleAddWebLink = () => {
    if (newWebLink.url.trim()) {
      const webLink: WebLink = {
        title: newWebLink.title || newWebLink.url,
        url: newWebLink.url.trim(),
      };
      setFormData((prev) => ({
        ...prev,
        webLinks: [...prev.webLinks, webLink],
      }));
      setNewWebLink({ title: "", url: "" });
    }
  };

  const handleRemoveWebLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      webLinks: prev.webLinks.filter((_, i) => i !== index),
    }));
  };

  const handleAddSubtopic = () => {
    if (newSubtopic.title.trim()) {
      const subtopic: Subtopic = {
        id: Date.now().toString(),
        title: newSubtopic.title.trim(),
        content: newSubtopic.content.trim(),
        bibleReferences: [],
        webLinks: [],
        completed: false,
        order: formData.subtopics.length,
      };
      setFormData((prev) => ({
        ...prev,
        subtopics: [...prev.subtopics, subtopic],
      }));
      setNewSubtopic({ name: "", description: "" });
    }
  };

  const handleRemoveSubtopic = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subtopics: prev.subtopics.filter((subtopic) => subtopic.id !== id),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const bookOptions = [
    "Génesis",
    "Éxodo",
    "Levítico",
    "Números",
    "Deuteronomio",
    "Josué",
    "Jueces",
    "Rut",
    "1 Samuel",
    "2 Samuel",
    "1 Reyes",
    "2 Reyes",
    "1 Crónicas",
    "2 Crónicas",
    "Esdras",
    "Nehemías",
    "Ester",
    "Job",
    "Salmos",
    "Proverbios",
    "Eclesiastés",
    "Cantares",
    "Isaías",
    "Jeremías",
    "Lamentaciones",
    "Ezequiel",
    "Daniel",
    "Oseas",
    "Joel",
    "Amós",
    "Abdías",
    "Jonás",
    "Miqueas",
    "Nahúm",
    "Habacuc",
    "Sofonías",
    "Hageo",
    "Zacarías",
    "Malaquías",
    "Mateo",
    "Marcos",
    "Lucas",
    "Juan",
    "Hechos",
    "Romanos",
    "1 Corintios",
    "2 Corintios",
    "Gálatas",
    "Efesios",
    "Filipenses",
    "Colosenses",
    "1 Tesalonicenses",
    "2 Tesalonicenses",
    "1 Timoteo",
    "2 Timoteo",
    "Tito",
    "Filemón",
    "Hebreos",
    "Santiago",
    "1 Pedro",
    "2 Pedro",
    "1 Juan",
    "2 Juan",
    "3 Juan",
    "Judas",
    "Apocalipsis",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Básico</TabsTrigger>
          <TabsTrigger value="references">Referencias</TabsTrigger>
          <TabsTrigger value="links">Enlaces</TabsTrigger>
          <TabsTrigger value="subtopics">Subtemas</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del tema *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ej: La Oración, Fe en Acción, etc."
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe brevemente el propósito de este tema de estudio..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="tags">Etiquetas</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), handleAddTag())
                    }
                    placeholder="Agregar etiqueta..."
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referencias bíblicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="book">Libro</Label>
                  <select
                    id="book"
                    value={newReference.book}
                    onChange={(e) =>
                      setNewReference((prev) => ({
                        ...prev,
                        book: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccionar...</option>
                    {bookOptions.map((book) => (
                      <option key={book} value={book}>
                        {book}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="chapter">Capítulo</Label>
                  <Input
                    id="chapter"
                    type="number"
                    min="1"
                    value={newReference.chapter}
                    onChange={(e) =>
                      setNewReference((prev) => ({
                        ...prev,
                        chapter: e.target.value,
                      }))
                    }
                    placeholder="Cap"
                  />
                </div>
                <div>
                  <Label htmlFor="verse">Versículo</Label>
                  <Input
                    id="verse"
                    type="number"
                    min="1"
                    value={newReference.verse}
                    onChange={(e) =>
                      setNewReference((prev) => ({
                        ...prev,
                        verse: e.target.value,
                      }))
                    }
                    placeholder="Vers"
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAddReference} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar referencia
              </Button>

              <div className="space-y-2">
                {formData.bibleReferences.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">
                      <BookOpen className="h-4 w-4 inline mr-2" />
                      {ref.book} {ref.chapter}:{ref.verse}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveReference(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enlaces web</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="linkTitle">Título</Label>
                  <Input
                    id="linkTitle"
                    value={newWebLink.title}
                    onChange={(e) =>
                      setNewWebLink((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Título del enlace"
                  />
                </div>
                <div>
                  <Label htmlFor="linkUrl">URL</Label>
                  <Input
                    id="linkUrl"
                    type="url"
                    value={newWebLink.url}
                    onChange={(e) =>
                      setNewWebLink((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    placeholder="https://ejemplo.com"
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAddWebLink} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar enlace
              </Button>

              <div className="space-y-2">
                {formData.webLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <Link className="h-4 w-4 mr-2" />
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {link.title}
                      </a>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveWebLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subtopics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subtemas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="subtopicTitle">Título</Label>
                  <Input
                    id="subtopicTitle"
                    value={newSubtopic.title}
                    onChange={(e) =>
                      setNewSubtopic((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Título del subtema"
                  />
                </div>
                <div>
                  <Label htmlFor="subtopicContent">Contenido</Label>
                  <Input
                    id="subtopicContent"
                    value={newSubtopic.content}
                    onChange={(e) =>
                      setNewSubtopic((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Contenido breve"
                  />
                </div>
              </div>
              <Button type="button" onClick={handleAddSubtopic} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar subtema
              </Button>

              <div className="space-y-2">
                {formData.subtopics.map((subtopic) => (
                  <div
                    key={subtopic.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <span className="font-medium text-sm">
                        {subtopic.name}
                      </span>
                      {subtopic.description && (
                        <p className="text-xs text-gray-600">
                          {subtopic.description}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubtopic(subtopic.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {isLoading
            ? "Guardando..."
            : initialData
            ? "Actualizar"
            : "Crear tema"}
        </Button>
      </div>
    </form>
  );
}
