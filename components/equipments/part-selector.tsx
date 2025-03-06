'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getParts } from '@/app/actions/parts'

// Define Part interface to match what's returned from the server action
interface Part {
  id: string
  name: string
  currentStock: number
}

interface PartSelectorProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  placeholder?: string
  error?: string
}

export function PartSelector({
  value,
  onChange,
  label = 'قطعه',
  placeholder = 'انتخاب قطعه',
  error,
}: PartSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch parts on component mount
  useEffect(() => {
    async function fetchParts() {
      try {
        setIsLoading(true)
        const fetchedParts = await getParts()
        setParts(fetchedParts)
      } catch (error) {
        console.error('Error fetching parts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchParts()
  }, [])

  useEffect(() => {
    if (value && parts.length > 0) {
      const part = parts.find((p: Part) => p.id === value)
      if (part) {
        setSelectedPart(part)
      }
    }
  }, [value, parts])

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={isLoading}
            >
              {selectedPart ? selectedPart.name : isLoading ? 'در حال بارگذاری...' : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="جستجوی قطعه..." />
              <CommandList>
                <CommandEmpty>قطعه‌ای یافت نشد</CommandEmpty>
                <CommandGroup>
                  {parts.map((part: Part) => (
                    <CommandItem
                      key={part.id}
                      value={part.name}
                      onSelect={() => {
                        onChange(part.id === selectedPart?.id ? null : part.id)
                        setSelectedPart(part.id === selectedPart?.id ? null : part)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedPart?.id === part.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{part.name}</span>
                      <span className="mr-auto text-sm text-muted-foreground">
                        موجودی: {part.currentStock}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  )
} 