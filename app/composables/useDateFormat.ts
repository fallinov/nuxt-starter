/**
 * Composable for date formatting utilities
 * Centralizes all date formatting logic used across the application
 */
export function useDateFormat() {
  /**
   * Reset time to midnight for date comparison
   */
  const resetTime = (date: Date): Date => {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
  }

  /**
   * Get today's date at midnight
   */
  const getToday = (): Date => resetTime(new Date())

  /**
   * Get tomorrow's date at midnight
   */
  const getTomorrow = (): Date => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return resetTime(tomorrow)
  }

  /**
   * Check if a date string represents today
   */
  const isToday = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false
    const today = getToday()
    const compareDate = resetTime(new Date(dateString))
    return compareDate.getTime() === today.getTime()
  }

  /**
   * Check if a date string represents tomorrow
   */
  const isTomorrow = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false
    const tomorrow = getTomorrow()
    const compareDate = resetTime(new Date(dateString))
    return compareDate.getTime() === tomorrow.getTime()
  }

  /**
   * Check if a date is overdue (before today)
   */
  const isOverdue = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false
    const today = getToday()
    const compareDate = resetTime(new Date(dateString))
    return compareDate < today
  }

  /**
   * Get abbreviated day name (lun, mar, mer, etc.)
   */
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
  }

  /**
   * Format date with default options
   */
  const formatDate = (
    dateString: string | null | undefined,
    options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  ): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  /**
   * Format date with full format (day month year)
   */
  const formatDateFull = (dateString: string | null | undefined): string => {
    return formatDate(dateString, { day: 'numeric', month: 'long', year: 'numeric' })
  }

  /**
   * Format date with short format (day month)
   */
  const formatDateShort = (dateString: string | null | undefined): string => {
    return formatDate(dateString, { day: 'numeric', month: 'short' })
  }

  /**
   * Format date with year (day month year - short)
   */
  const formatDateWithYear = (dateString: string | null | undefined): string => {
    return formatDate(dateString, { day: 'numeric', month: 'short', year: 'numeric' })
  }

  /**
   * Format date as relative text (Aujourd'hui, Demain, or formatted date)
   */
  const formatRelativeDate = (
    dateString: string | null | undefined,
    fallback: string = 'Pas de date'
  ): string => {
    if (!dateString) return fallback

    if (isToday(dateString)) return "Aujourd'hui"
    if (isTomorrow(dateString)) return 'Demain'

    return formatDateShort(dateString)
  }

  /**
   * Extract date part from ISO datetime string (YYYY-MM-DD)
   */
  const extractDatePart = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    return dateString.includes('T')
      ? (dateString.split('T')[0] as string)
      : dateString
  }

  /**
   * Convert date string to ISO datetime
   */
  const toISODateTime = (dateString: string): string => {
    return new Date(dateString).toISOString()
  }

  /**
   * Get date string for tomorrow (YYYY-MM-DD format)
   */
  const getTomorrowDateString = (): string => {
    return getTomorrow().toISOString().split('T')[0] as string
  }

  /**
   * Get date string for today (YYYY-MM-DD format)
   */
  const getTodayDateString = (): string => {
    return getToday().toISOString().split('T')[0] as string
  }

  return {
    // Date checks
    isToday,
    isTomorrow,
    isOverdue,
    // Formatting
    formatDate,
    formatDateFull,
    formatDateShort,
    formatDateWithYear,
    formatRelativeDate,
    getDayName,
    // Utilities
    extractDatePart,
    toISODateTime,
    getTodayDateString,
    getTomorrowDateString,
    getToday,
    getTomorrow,
    resetTime
  }
}
