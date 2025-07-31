"use client"

import type React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import type { StudyEntry } from "@/lib/firestore"

interface DragDropEntriesProps {
  entries: StudyEntry[]
  onReorder: (entries: StudyEntry[]) => void
  children: (entry: StudyEntry, index: number) => React.ReactNode
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="p-1 bg-gray-700/80 rounded hover:bg-gray-600/80">
          <GripVertical className="h-4 w-4 text-gray-300" />
        </div>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  )
}

export function DragDropEntries({ entries, onReorder, children }: DragDropEntriesProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((entry) => entry.id === active.id)
      const newIndex = entries.findIndex((entry) => entry.id === over.id)

      const reorderedEntries = arrayMove(entries, oldIndex, newIndex)
      onReorder(reorderedEntries)
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={entries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <SortableItem key={entry.id} id={entry.id}>
              {children(entry, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
