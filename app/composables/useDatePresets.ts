/**
 * Composable for date presets used in date pickers
 * Provides common date options like Today, Tomorrow, Weekend, Next Week
 */
export interface DatePreset {
  label: string
  value: string
  day: string
  icon: string
  color: string
}

export function useDatePresets() {
  const { getDayName } = useDateFormat()

  /**
   * Get all date presets as a computed property
   */
  const datePresets = computed((): DatePreset[] => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find next Saturday for "Ce week-end"
    const nextSaturday = new Date()
    const daysUntilSaturday = (6 - nextSaturday.getDay() + 7) % 7 || 7
    nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday)

    // Find next Monday for "Semaine prochaine"
    const nextMonday = new Date()
    const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday)

    // First day of next month for "Mois prochain"
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    return [
      {
        label: "Aujourd'hui",
        value: today.toISOString().split('T')[0] as string,
        day: getDayName(today),
        icon: 'i-lucide-calendar',
        color: 'text-green-600'
      },
      {
        label: 'Demain',
        value: tomorrow.toISOString().split('T')[0] as string,
        day: getDayName(tomorrow),
        icon: 'i-lucide-sun',
        color: 'text-amber-500'
      },
      {
        label: 'Ce week-end',
        value: nextSaturday.toISOString().split('T')[0] as string,
        day: getDayName(nextSaturday),
        icon: 'i-lucide-sofa',
        color: 'text-blue-500'
      },
      {
        label: 'Semaine prochaine',
        value: nextMonday.toISOString().split('T')[0] as string,
        day: getDayName(nextMonday),
        icon: 'i-lucide-arrow-right',
        color: 'text-purple-500'
      },
      {
        label: 'Mois prochain',
        value: nextMonth.toISOString().split('T')[0] as string,
        day: getDayName(nextMonth),
        icon: 'i-lucide-calendar-range',
        color: 'text-pink-500'
      }
    ]
  })

  /**
   * Get simple date presets (without weekend) for quick add forms
   */
  const simpleDatePresets = computed(() => {
    const today = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    return [
      {
        label: "Aujourd'hui",
        value: today.toISOString().split('T')[0] as string,
        icon: 'i-lucide-calendar'
      },
      {
        label: 'Demain',
        value: tomorrow.toISOString().split('T')[0] as string,
        icon: 'i-lucide-sun'
      },
      {
        label: 'Semaine prochaine',
        value: nextWeek.toISOString().split('T')[0] as string,
        icon: 'i-lucide-calendar-days'
      }
    ]
  })

  return {
    datePresets,
    simpleDatePresets
  }
}
