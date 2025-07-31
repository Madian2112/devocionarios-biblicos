"use client"

import { useState } from "react"
import { Search, Filter, X, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface SearchAndFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
  sortBy: "name" | "date" | "entries"
  onSortChange: (sort: "name" | "date" | "entries") => void
  entryCounts: { [key: string]: number }
}

const CATEGORIES = [
  "Fe",
  "Amor",
  "Salvación",
  "Oración",
  "Perdón",
  "Esperanza",
  "Sabiduría",
  "Paz",
  "Gratitud",
  "Servicio",
]

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  selectedCategories,
  onCategoryChange,
  sortBy,
  onSortChange,
  entryCounts,
}: SearchAndFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]
    onCategoryChange(updated)
  }

  const clearFilters = () => {
    onSearchChange("")
    onCategoryChange([])
    onSortChange("date")
  }

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || sortBy !== "date"

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar temas de estudio..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-[#2a2a2a]/50 border-gray-700 text-white"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtros y ordenamiento */}
      <div className="flex flex-wrap gap-2 items-center">
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-[#2a2a2a]/50 border-gray-700 hover:bg-[#3a3a3a]/50">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-900 border-gray-700">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-3">Categorías</h4>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label htmlFor={category} className="text-sm text-gray-300 cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-white mb-3">Ordenar por</h4>
                <div className="space-y-2">
                  {[
                    { value: "date", label: "Fecha de creación" },
                    { value: "name", label: "Nombre (A-Z)" },
                    { value: "entries", label: "Número de entradas" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={sortBy === option.value}
                        onCheckedChange={() => onSortChange(option.value as any)}
                      />
                      <label htmlFor={option.value} className="text-sm text-gray-300 cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Categorías seleccionadas */}
        {selectedCategories.map((category) => (
          <Badge key={category} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            <Tag className="h-3 w-3 mr-1" />
            {category}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 ml-1 hover:bg-blue-500/30"
              onClick={() => handleCategoryToggle(category)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white">
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
