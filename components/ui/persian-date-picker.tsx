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
import { toJalaali, toGregorian, isValidJalaaliDate } from 'jalaali-js'

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

// Helper function to get max days in a Persian month
function getMaxDaysInMonth(jYear: number, jMonth: number): number {
  if (jMonth <= 6) return 31;
  if (jMonth <= 11) return 30;
  return isLeapJalaaliYear(jYear) ? 30 : 29;
}

// Helper function to check if a Persian year is leap
function isLeapJalaaliYear(jYear: number): boolean {
  return isValidJalaaliDate(jYear, 12, 30);
}

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
  // Parse date from ISO format to Persian date
  const parseDate = (dateStr: string) => {
    if (!dateStr) return { year: '', month: '', day: '' }
    
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return { year: '', month: '', day: '' }
      
      // Convert to Persian date
      const persianDate = toJalaali(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      )
      
      return {
        year: persianDate.jy.toString(),
        month: persianDate.jm.toString(),
        day: persianDate.jd.toString().padStart(2, '0'),
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
      const jYear = parseInt(dateValues.year)
      const jMonth = parseInt(dateValues.month)
      const jDay = parseInt(dateValues.day)
      
      // Validate Persian date
      if (
        jYear > 0 && 
        jMonth >= 1 && jMonth <= 12 && 
        jDay > 0 && jDay <= getMaxDaysInMonth(jYear, jMonth) &&
        isValidJalaaliDate(jYear, jMonth, jDay)
      ) {
        // Convert Persian to Gregorian
        const gregorian = toGregorian(jYear, jMonth, jDay)
        const date = new Date(
          gregorian.gy, 
          gregorian.gm - 1, 
          gregorian.gd
        )
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
  }, [value, dateValues.year, dateValues.month, dateValues.day])
  
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
    const maxDays = dateValues.year && dateValues.month ? 
      getMaxDaysInMonth(parseInt(dateValues.year), parseInt(dateValues.month)) : 31;
      
    if ((parseInt(dayValue) <= maxDays && parseInt(dayValue) > 0) || dayValue === '') {
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