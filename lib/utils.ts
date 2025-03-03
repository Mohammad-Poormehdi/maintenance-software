import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to Persian (Jalali) format
 */
export function formatPersianDate(date: string | Date): string {
  // Convert to Date object if string
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Format using Intl with Persian locale
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}
