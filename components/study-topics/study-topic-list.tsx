"use client";

import { useState, useMemo } from "react";
// import Link from "next/link"
import { StudyTopic } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GradientCard } from "@/components/ui/gradient-card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Link,
  Tag,
  CheckCircle,
  Clock,
  Search,
  Grid,
  List,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyTopicListProps {
  topics: StudyTopic[];
  isLoading?: boolean;
  onTopicClick?: (topic: StudyTopic) => void;
  viewMode?: "grid" | "list";
  showActions?: boolean;
  onDelete?: (topic: StudyTopic) => void;
  onEdit?: (topic: StudyTopic) => void;
}

export function StudyTopicList({
  topics,
  isLoading = false,
  onTopicClick,
  viewMode = "grid",
  showActions = false,
  onDelete,
  onEdit,
}: StudyTopicListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "name" | "createdAt" | "updatedAt" | "progress"
  >("updatedAt");

  // Get all unique tags from topics
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    topics.forEach((topic) => {
      topic.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [topics]);

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = topics.filter((topic) => {
      const matchesSearch =
        searchTerm === "" ||
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => topic.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });

    // Sort topics
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "createdAt":
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        case "updatedAt":
          return b.updatedAt.toMillis() - a.updatedAt.toMillis();
        case "progress":
          const progressA =
            a.subtopics.length > 0
              ? (a.subtopics.filter((s) => s.completed).length /
                  a.subtopics.length) *
                100
              : 0;
          const progressB =
            b.subtopics.length > 0
              ? (b.subtopics.filter((s) => s.completed).length /
                  b.subtopics.length) *
                100
              : 0;
          return progressB - progressA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [topics, searchTerm, selectedTags, sortBy]);

  const calculateProgress = (topic: StudyTopic) => {
    if (topic.subtopics.length === 0) return 0;
    return Math.round(
      (topic.subtopics.filter((s) => s.completed).length /
        topic.subtopics.length) *
        100
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return "";
    return timestamp.toDate().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">
          No hay temas de estudio aún
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Comienza creando tu primer tema de estudio bíblico
        </p>
        <Button asChild>
          <Link href="/study-topics/new">Crear primer tema</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar temas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => {}}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => {}}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Topics Count */}
      <div className="text-sm text-gray-600">
        Mostrando {filteredAndSortedTopics.length} de {topics.length} temas
      </div>

      {/* Topics Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTopics.map((topic) => {
            const progress = calculateProgress(topic);

            return (
              <GradientCard
                key={topic.id}
                className={cn(
                  "group hover:shadow-lg transition-all duration-200",
                  topic.completed && "opacity-75"
                )}
                gradient={progress === 100 ? "green" : "blue"}
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {onTopicClick ? (
                      <button
                        onClick={() => onTopicClick(topic)}
                        className="text-left hover:text-blue-600 transition-colors"
                      >
                        {topic.name}
                      </button>
                    ) : (
                      <Link
                        href={`/study-topics/${topic.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {topic.name}
                      </Link>
                    )}
                  </CardTitle>
                  {topic.completed && (
                    <Badge variant="outline" className="ml-auto">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completado
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {topic.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {topic.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{topic.bibleReferences?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link className="h-4 w-4" />
                      <span>{topic.webLinks?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <span>{topic.subtopics?.length || 0}</span>
                    </div>
                  </div>

                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topic.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {topic.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{topic.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(topic.updatedAt)}</span>
                    </div>
                  </div>

                  {showActions && (
                    <div className="flex gap-2 pt-2 border-t">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(topic)}
                          className="flex-1"
                        >
                          Editar
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(topic)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </GradientCard>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedTopics.map((topic) => {
            const progress = calculateProgress(topic);

            return (
              <Card
                key={topic.id}
                className={cn(
                  "group hover:shadow-md transition-all duration-200",
                  topic.completed && "opacity-75"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg truncate">
                          {onTopicClick ? (
                            <button
                              onClick={() => onTopicClick(topic)}
                              className="text-left hover:text-blue-600 transition-colors"
                            >
                              {topic.name}
                            </button>
                          ) : (
                            <Link
                              href={`/study-topics/${topic.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {topic.name}
                            </Link>
                          )}
                        </h3>
                        {topic.completed && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                        )}
                      </div>

                      {topic.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                          {topic.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{topic.bibleReferences?.length || 0} refs</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link className="h-4 w-4" />
                          <span>{topic.webLinks?.length || 0} links</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          <span>{topic.subtopics?.length || 0} subtemas</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(topic.updatedAt)}</span>
                        </div>
                      </div>

                      {topic.tags && topic.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {topic.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{progress}%</div>
                        <Progress value={progress} className="w-20 h-2" />
                      </div>

                      {showActions && (
                        <div className="flex gap-2">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(topic)}
                            >
                              Editar
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(topic)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredAndSortedTopics.length === 0 && topics.length > 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            No se encontraron temas
          </h3>
          <p className="text-sm text-gray-600">
            Intenta con otros términos de búsqueda o limpia los filtros
          </p>
        </div>
      )}
    </div>
  );
}
