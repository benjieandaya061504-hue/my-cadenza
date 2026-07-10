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

export const MIN_ENROLL_SLOTS = 4
export const TOTAL_SLOT_POOL = 40
