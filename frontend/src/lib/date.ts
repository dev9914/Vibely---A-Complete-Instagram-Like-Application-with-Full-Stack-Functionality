/**
 * Date Utility Functions
 * Uses date-fns for consistent date formatting across the app
 */

import { formatDistanceToNow, format, isToday, isYesterday, differenceInDays } from 'date-fns'

/**
 * Format a date as "X time ago" (e.g., "2 hours ago", "3 days ago")
 */
export function timeAgo(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch (error) {
    console.error('Invalid date:', date)
    return 'Unknown time'
  }
}

/**
 * Format a date for message timestamps
 * - "Just now" for < 1 minute
 * - "12:30 PM" for today
 * - "Yesterday" for yesterday
 * - "Jan 15" for this year
 * - "Jan 15, 2025" for other years
 */
export function formatMessageTime(date: string | Date): string {
  try {
    const dateObj = new Date(date)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / 1000 / 60)
    
    if (diffInMinutes < 1) return 'Just now'
    if (isToday(dateObj)) return format(dateObj, 'h:mm a')
    if (isYesterday(dateObj)) return 'Yesterday'
    if (differenceInDays(now, dateObj) < 7) return format(dateObj, 'EEEE') // Day name
    if (dateObj.getFullYear() === now.getFullYear()) return format(dateObj, 'MMM d')
    return format(dateObj, 'MMM d, yyyy')
  } catch (error) {
    console.error('Invalid date:', date)
    return ''
  }
}

/**
 * Format full date for detailed views
 */
export function formatFullDate(date: string | Date): string {
  try {
    return format(new Date(date), 'MMMM d, yyyy \'at\' h:mm a')
  } catch (error) {
    console.error('Invalid date:', date)
    return ''
  }
}

/**
 * Format date for post timestamps (compact)
 * - "2h" for hours
 * - "3d" for days
 * - "Jan 15" for older
 */
export function formatPostTime(date: string | Date): string {
  try {
    const dateObj = new Date(date)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
    
    const minutes = Math.floor(diffInSeconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 7) {
      if (dateObj.getFullYear() === now.getFullYear()) {
        return format(dateObj, 'MMM d')
      }
      return format(dateObj, 'MMM d, yyyy')
    }
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    if (minutes > 0) return `${minutes}m`
    return 'just now'
  } catch (error) {
    console.error('Invalid date:', date)
    return ''
  }
}

/**
 * Check if date is within the last 24 hours
 */
export function isRecent(date: string | Date): boolean {
  try {
    const dateObj = new Date(date)
    const now = new Date()
    const diffInHours = (now.getTime() - dateObj.getTime()) / 1000 / 60 / 60
    return diffInHours < 24
  } catch (error) {
    return false
  }
}
