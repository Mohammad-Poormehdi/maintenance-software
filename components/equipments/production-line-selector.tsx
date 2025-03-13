'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

// Interface for production line data
interface ProductionLine {
  id: string
  name: string
  status: 'OPERATIONAL' | 'REDUCED_CAPACITY' | 'MAINTENANCE' | 'OFFLINE'
}

interface ProductionLineSelectorProps {
  value: string | null | undefined
  onChange: (value: string | null) => void
  placeholder?: string
}

export function ProductionLineSelector({
  value,
  onChange,
  placeholder = 'انتخاب خط تولید',
}: ProductionLineSelectorProps) {
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProductionLines() {
      try {
        const response = await fetch('/api/production-lines')
        const data = await response.json()
        setProductionLines(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching production lines:', error)
        setIsLoading(false)
      }
    }

    fetchProductionLines()
  }, [])

  // Function to get the status label for filtering
  function getStatusLabel(status: ProductionLine['status']) {
    const statusLabels = {
      'OPERATIONAL': 'فعال',
      'REDUCED_CAPACITY': 'ظرفیت کاهش یافته',
      'MAINTENANCE': 'در حال تعمیر',
      'OFFLINE': 'غیرفعال'
    }
    return statusLabels[status]
  }

  return (
    <Select
      value={value || ''}
      dir='rtl'
      onValueChange={(newValue) => onChange(newValue === 'none' ? null : newValue)}
      disabled={isLoading}
    >
      <SelectTrigger>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>در حال بارگذاری...</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">بدون خط تولید</SelectItem>
        {productionLines.map((line) => (
          <SelectItem key={line.id} value={line.id}>
            {line.name} {line.status !== 'OPERATIONAL' && `(${getStatusLabel(line.status)})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 