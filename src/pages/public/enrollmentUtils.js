export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function toDateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function addMonths(d, delta) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

export function seeded01(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 2 ** 32
}

export function buildEnrollmentWeeks(monthCursor) {
  const first = startOfMonth(monthCursor)
  const startWeekday = first.getDay()
  const gridStart = new Date(first)
  gridStart.setDate(1 - startWeekday)
  const weeks = []
  let cursor = new Date(gridStart)
  for (let w = 0; w < 6; w += 1) {
    const week = []
    for (let d = 0; d < 7; d += 1) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

/**
 * Get all dates in the month (continuous across boundaries) that fall on a given weekday.
 * @param {Date} monthCursor - Any date in the target month
 * @param {number} weekdayIndex - 0=Sun, 1=Mon, ... 6=Sat
 * @returns {Date[]} Array of dates sorted ascending
 */
export function getWeekdayDatesInMonth(monthCursor, weekdayIndex) {
  const first = startOfMonth(monthCursor)
  const startWeekday = first.getDay()
  // Calculate offset from grid start (Sunday) to first day of month
  const gridStart = new Date(first)
  gridStart.setDate(1 - startWeekday)

  // Find the first occurrence of the target weekday from grid start
  const diff = (weekdayIndex - gridStart.getDay() + 7) % 7
  const firstOccurrence = new Date(gridStart)
  firstOccurrence.setDate(gridStart.getDate() + diff)

  // Collect all occurrences across 6 weeks (covers full month + boundaries)
  const result = []
  const cursor = new Date(firstOccurrence)
  for (let w = 0; w < 6; w += 1) {
    result.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 7)
  }
  return result
}

/**
 * Get a human-readable frequency label like "Once a week", "Twice a week", etc.
 */
export function getFrequencyLabel(sessionsPerWeek) {
  const labels = {
    1: 'Once a week',
    2: 'Twice a week',
    3: 'Three times a week',
    4: 'Four times a week',
    5: 'Five times a week',
    6: 'Six times a week',
    7: 'Daily',
  }
  return labels[sessionsPerWeek] || `${sessionsPerWeek}x a week`
}

export const MIN_ENROLL_SLOTS = 4
export const TOTAL_SLOT_POOL = 40

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']