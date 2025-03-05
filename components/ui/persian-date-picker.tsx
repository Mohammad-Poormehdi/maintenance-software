'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const PERSIAN_MONTHS = [
  { value: '1', label: 'فروردین' },
  { value: '2', label: 'اردیبهشت' },
  { value: '3', label: 'خرداد' },
  { value: '4', label: 'تیر' },
  { value: '5', label: 'مرداد' },
  { value: '6', label: 'شهریور' },
  { value: '7', label: 'مهر' },
  { value: '8', label: 'آبان' },
  { value: '9', label: 'آذر' },
  { value: '10', label: 'دی' },
  { value: '11', label: 'بهمن' },
  { value: '12', label: 'اسفند' },
]

interface PersianDatePickerProps {
  value?: string // ISO date string YYYY-MM-DD
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function PersianDatePicker({
  value = '',
  onChange,
  label,
  placeholder = 'انتخاب تاریخ',
  error,
  disabled = false,
}: PersianDatePickerProps) {
  // Parse date from ISO format
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { year: '', month: '', day: '' }
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return { year: '', month: '', day: '' }
      
      // For simplicity, we're using Gregorian dates and just displaying Persian month names
      // In a real app, you'd use a proper Persian calendar conversion
      return {
        year: date.getFullYear().toString(),
        month: (date.getMonth() + 1).toString(),
        day: date.getDate().toString().padStart(2, '0'),
      }
    } catch {
      return { year: '', month: '', day: '' }
    }
  }
  
  const [dateValues, setDateValues] = useState(parseDate(value))
  const isInternalChange = useRef(false)
  
  // Update the external value when internal state changes
  useEffect(() => {
    // Skip if this is triggered by the external value change
    if (!isInternalChange.current) return
    
    if (dateValues.year && dateValues.month && dateValues.day) {
      const year = parseInt(dateValues.year)
      const month = parseInt(dateValues.month) - 1 // JS months are 0-indexed
      const day = parseInt(dateValues.day)
      
      // Validate date
      if (year > 0 && month >= 0 && month < 12 && day > 0 && day <= 31) {
        const date = new Date(year, month, day)
        const isoDate = date.toISOString().split('T')[0]
        
        // Only update if date actually changed
        if (isoDate !== value) {
          onChange(isoDate)
        }
      }
    } else if (value) {
      // Clear the date if any part is empty but we had a value before
      onChange('')
    }
    
    isInternalChange.current = false
  }, [dateValues, onChange, value])
  
  // Update internal state when external value changes
  useEffect(() => {
    const parsedDate = parseDate(value)
    const currentYear = dateValues.year
    const currentMonth = dateValues.month
    const currentDay = dateValues.day
    
    // Only update if the date actually changed
    if (
      parsedDate.year !== currentYear || 
      parsedDate.month !== currentMonth || 
      parsedDate.day !== currentDay
    ) {
      setDateValues(parsedDate)
    }
  }, [value])
  
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = e.target.value.replace(/\D/g, '')
    isInternalChange.current = true
    setDateValues(prev => ({ ...prev, year: yearValue }))
  }
  
  const handleMonthChange = (monthValue: string) => {
    isInternalChange.current = true
    setDateValues(prev => ({ ...prev, month: monthValue }))
  }
  
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dayValue = e.target.value.replace(/\D/g, '')
    if (parseInt(dayValue) <= 31 || dayValue === '') {
      isInternalChange.current = true
      setDateValues(prev => ({ ...prev, day: dayValue }))
    }
  }
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Input
            type="text"
            placeholder="سال"
            value={dateValues.year}
            onChange={handleYearChange}
            maxLength={4}
            disabled={disabled}
            className="text-center"
            aria-label="سال"
          />
        </div>
        
        <div className="w-full">
          <Select
            value={dateValues.month}
            onValueChange={handleMonthChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full text-right" dir="rtl" aria-label="ماه">
              <SelectValue placeholder="ماه" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {PERSIAN_MONTHS.map(month => (
                <SelectItem key={month.value} value={month.value} className="text-right">
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Input
            type="text"
            placeholder="روز"
            value={dateValues.day}
            onChange={handleDayChange}
            maxLength={2}
            disabled={disabled}
            className="text-center"
            aria-label="روز"
          />
        </div>
      </div>
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
} 