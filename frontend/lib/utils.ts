// AiMedico - Utility Functions
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

/** Merge Tailwind classes safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a date as relative (e.g. "3 minutes ago"). */
export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

/** Format a date as readable string (e.g. "May 10, 2026"). */
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'PPP')
}

/** Format bytes to human-readable size. */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/** Get badge color class for emergency level. */
export function emergencyColor(level: string): string {
  const map: Record<string, string> = {
    none:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    low:      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    medium:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    high:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    critical: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300 font-bold animate-pulse',
  }
  return map[level] ?? map.none
}

/** Get status badge color class for prescription status. */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    uploaded:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ocr_done:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ai_done:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    failed:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    pending:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    processing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    completed:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  }
  return map[status] ?? map.pending
}

/** Get human-readable label for status. */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    uploaded:   'Uploaded',
    ocr_done:   'Text Extracted',
    ai_done:    'Analysis Complete',
    failed:     'Failed',
    pending:    'Pending',
    processing: 'Processing…',
    completed:  'Complete',
  }
  return map[status] ?? status
}

/** Copy text to clipboard. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Extract axios error message. */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axErr = error as { response?: { data?: { message?: string; detail?: string } } }
    return axErr.response?.data?.message || axErr.response?.data?.detail || 'An error occurred.'
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred.'
}
