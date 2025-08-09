"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Item {
  value: string
  label: string
}

interface SearchableSelectorProps {
  items: Item[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
}

export function SearchableSelector({
  items,
  value,
  onValueChange,
  placeholder,
  emptyMessage = "No se encontraron resultados.",
  className,
  disabled,
}: SearchableSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const selectedItem = items.find((item) => item.value === value)

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      onValueChange(currentValue === value ? "" : currentValue)
      setOpen(false)
    },
    [value, onValueChange],
  )

  const content = (
    <Command className="bg-[#1a1a1a] text-white">
      <CommandInput placeholder={placeholder} className="border-gray-700 focus:ring-blue-500" />
      <CommandList>
        <CommandEmpty className="py-6 text-center text-sm text-gray-400">{emptyMessage}</CommandEmpty>
        <ScrollArea className="h-60">
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item.value}
                value={item.label} // Usar label para la búsqueda
                onSelect={() => handleSelect(item.value)}
                className="data-[selected=true]:bg-blue-600 data-[selected=true]:text-white hover:bg-[#2a2a2a] cursor-pointer"
              >
                <Check className={cn("mr-2 h-4 w-4", value === item.value ? "opacity-100" : "opacity-0")} />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </Command>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-[#2a2a2a]/50 border-gray-700 text-white hover:bg-[#3a3a3a]/50",
              className,
            )}
            disabled={disabled}
          >
            {selectedItem ? selectedItem.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-[#1a1a1a] border-gray-800 text-white">
          <div className="mt-4 border-t border-gray-800 p-4">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-[#2a2a2a]/50 border-gray-700 text-white hover:bg-[#3a3a3a]/50",
            className,
          )}
          disabled={disabled}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#1a1a1a] border-gray-800 text-white">
        {content}
      </PopoverContent>
    </Popover>
  )
}
