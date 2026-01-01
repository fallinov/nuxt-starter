<script setup lang="ts">
interface Props {
  modelValue?: string
  showHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Generate months to display (start with current month - 1 to current + 12)
const monthsToShow = ref<Date[]>([])
const containerRef = ref<HTMLElement>()

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

// Parse selected date
const selectedDate = computed(() => {
  if (!props.modelValue) return null
  const parts = props.modelValue.split('-').map(Number)
  return {
    year: parts[0] ?? 0,
    month: parts[1] ?? 1,
    day: parts[2] ?? 1
  }
})

// Initialize months
const initMonths = () => {
  const months: Date[] = []
  const today = new Date()

  // Start from previous month
  for (let i = -1; i <= 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
    months.push(date)
  }

  monthsToShow.value = months
}

// Add more months at the end
const addMoreMonths = () => {
  const lastMonth = monthsToShow.value[monthsToShow.value.length - 1]
  if (!lastMonth) return

  for (let i = 1; i <= 6; i++) {
    const date = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + i, 1)
    monthsToShow.value.push(date)
  }
}

// Add more months at the beginning
const addPreviousMonths = () => {
  const firstMonth = monthsToShow.value[0]
  if (!firstMonth) return

  const newMonths: Date[] = []
  for (let i = 6; i >= 1; i--) {
    const date = new Date(firstMonth.getFullYear(), firstMonth.getMonth() - i, 1)
    newMonths.push(date)
  }

  monthsToShow.value = [...newMonths, ...monthsToShow.value]
}

// Get days for a month
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: Array<{ day: number; date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }> = []

  // Get the day of week (0 = Sunday, we want 0 = Monday)
  let startDayOfWeek = firstDay.getDay() - 1
  if (startDayOfWeek < 0) startDayOfWeek = 6

  // Add days from previous month
  const prevMonth = new Date(year, month, 0)
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i
    days.push({
      day,
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false
    })
  }

  // Add days of current month
  const today = new Date()
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day)
    const isToday =
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()

    const isSelected = selectedDate.value
      ? selectedDate.value.year === year &&
        selectedDate.value.month === month + 1 &&
        selectedDate.value.day === day
      : false

    days.push({
      day,
      date: currentDate,
      isCurrentMonth: true,
      isToday,
      isSelected
    })
  }

  // Add days from next month to complete the grid
  const remainingDays = 7 - (days.length % 7)
  if (remainingDays < 7) {
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      })
    }
  }

  return days
}

// Format month name
const formatMonthName = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

// Handle scroll (only used when showHeader is true)
const onScroll = (event: Event) => {
  const target = event.target as HTMLElement

  // Load more months when near bottom
  if (target.scrollHeight - target.scrollTop - target.clientHeight < 200) {
    addMoreMonths()
  }

  // Load previous months when near top
  if (target.scrollTop < 200) {
    const previousScrollHeight = target.scrollHeight
    addPreviousMonths()
    // Maintain scroll position
    nextTick(() => {
      target.scrollTop = target.scrollHeight - previousScrollHeight + target.scrollTop
    })
  }
}

// Select a date
const selectDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  emit('update:modelValue', `${year}-${month}-${day}`)
}

onMounted(() => {
  initMonths()
})
</script>

<template>
  <!-- With header: full container with own scroll -->
  <div v-if="showHeader" class="calendar-scroll-container h-full flex flex-col overflow-hidden">
    <!-- Weekday headers -->
    <div class="flex-shrink-0 grid grid-cols-7 text-center text-sm text-gray-500 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <span v-for="day in WEEKDAYS" :key="day">{{ day }}</span>
    </div>

    <!-- Scrollable months -->
    <div
      ref="containerRef"
      class="flex-1 overflow-y-auto overscroll-contain"
      style="-webkit-overflow-scrolling: touch;"
      @scroll="onScroll"
    >
      <div v-for="monthDate in monthsToShow" :key="monthDate.toISOString()" class="month-section mb-4">
        <!-- Month header -->
        <div class="text-sm font-medium text-gray-900 dark:text-gray-100 py-2 px-1 capitalize">
          {{ formatMonthName(monthDate) }}
        </div>

        <!-- Days grid -->
        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="(dayInfo, index) in getDaysInMonth(monthDate)"
            :key="index"
            class="day-cell aspect-square flex items-center justify-center text-sm rounded-full transition-colors"
            :class="{
              'text-gray-300 dark:text-gray-600': !dayInfo.isCurrentMonth,
              'text-gray-900 dark:text-gray-100': dayInfo.isCurrentMonth && !dayInfo.isToday && !dayInfo.isSelected,
              'bg-red-500 text-white': dayInfo.isToday && !dayInfo.isSelected,
              'bg-primary text-white': dayInfo.isSelected,
              'hover:bg-gray-100 dark:hover:bg-gray-800': !dayInfo.isToday && !dayInfo.isSelected
            }"
            @click="selectDate(dayInfo.date)"
          >
            {{ dayInfo.day }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Without header: just months, parent handles scroll -->
  <div v-else class="calendar-months">
    <div v-for="monthDate in monthsToShow" :key="monthDate.toISOString()" class="month-section mb-4">
      <!-- Month header -->
      <div class="text-sm font-medium text-gray-900 dark:text-gray-100 py-2 px-1 capitalize">
        {{ formatMonthName(monthDate) }}
      </div>

      <!-- Days grid -->
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(dayInfo, index) in getDaysInMonth(monthDate)"
          :key="index"
          class="day-cell aspect-square flex items-center justify-center text-sm rounded-full transition-colors"
          :class="{
            'text-gray-300 dark:text-gray-600': !dayInfo.isCurrentMonth,
            'text-gray-900 dark:text-gray-100': dayInfo.isCurrentMonth && !dayInfo.isToday && !dayInfo.isSelected,
            'bg-red-500 text-white': dayInfo.isToday && !dayInfo.isSelected,
            'bg-primary text-white': dayInfo.isSelected,
            'hover:bg-gray-100 dark:hover:bg-gray-800': !dayInfo.isToday && !dayInfo.isSelected
          }"
          @click="selectDate(dayInfo.date)"
        >
          {{ dayInfo.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-scroll-container {
  width: 100%;
}

.day-cell {
  min-height: 36px;
  min-width: 36px;
}
</style>
