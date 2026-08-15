/**
 * Enrollment utility functions — pure date/schedule calculation helpers.
 * No API calls, no side effects.
 */

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

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Get the next occurrence of a given weekday from today.
 * If today is the given weekday, returns today.
 * @param {number} weekdayIndex - 0=Sun, 1=Mon, ... 6=Sat
 * @returns {Date}
 */
export function getNextWeekdayDate(weekdayIndex) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDay = today.getDay()
  let diff = weekdayIndex - currentDay
  if (diff < 0) diff += 7
  const result = new Date(today)
  result.setDate(today.getDate() + diff)
  return result
}

/**
 * Format a date as "Month Day, Year" (e.g., "July 27, 2026")
 */
export function formatDateLong(date) {
  return date.toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

/**
 * Format a date as "Mon DD" (e.g., "Jul 27")
 */
export function formatDateShort(date) {
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Calculate the end date for a recurring schedule.
 * @param {Date} startDate - The first session date
 * @param {number} sessionLimit - Total number of sessions in the package
 * @param {number} sessionsPerWeek - How many sessions per week
 * @param {number[]} selectedWeekdays - Sorted array of weekday indices (0-6)
 * @returns {Date} The last session date
 */
export function calculateEndDate(startDate, sessionLimit, sessionsPerWeek, selectedWeekdays) {
  if (!selectedWeekdays || selectedWeekdays.length === 0) return new Date(startDate)
  const sorted = [...selectedWeekdays].sort((a, b) => a - b)
  const numWeeks = Math.ceil(sessionLimit / sessionsPerWeek)
  const gapDays = sorted[sorted.length - 1] - sorted[0]
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + (numWeeks - 1) * 7 + gapDays)
  return endDate
}