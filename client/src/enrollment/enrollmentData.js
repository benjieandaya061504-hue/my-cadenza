/**
 * Live lesson package data — fetched from the public API endpoint.
 * Replaces the previous flat-package approach with a lesson-grouped structure.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Icon Mapping ──────────────────────────────────────────────
// Matches on specialty_name / category (case-insensitive).
// Unknown specialties fall back to a generic music note.
const ICON_MAP = {
  piano: '🎹',
  keyboard: '🎹',
  guitar: '🎸',
  bass: '🎸',
  voice: '🎤',
  vocal: '🎤',
  strings: '🎻',
  violin: '🎻',
  cello: '🎻',
  viola: '🎻',
  drum: '🥁',
  percussion: '🥁',
  theory: '🎼',
  composition: '🎼',
  ensemble: '🎼',
}

const DEFAULT_ICON = '🎵'

function getIcon(category) {
  if (!category) return DEFAULT_ICON
  const key = category.toLowerCase().trim()
  return ICON_MAP[key] || DEFAULT_ICON
}

/**
 * Fetch all active lessons with their package types and instructors.
 * Returns a promise that resolves to the lesson-grouped structure
 * the EnrollmentModal Step 1 expects.
 *
 * Response shape (per lesson):
 * {
 *   id: number,
 *   lesson_name: string,
 *   specialty: string,
 *   specialty_id: number | null,
 *   icon: string,
 *   instructors: [{ id, first_name, last_name, specialization }],
 *   package_types: [{
 *     package_type_id: number,
 *     package_type_name: string,
 *     session: number,
 *     fee: number,
 *     sessions_per_week: number,
 *     duration_label: string,
 *   }]
 * }
 */
export async function fetchLessonPackages() {
  const res = await fetch(`${API_BASE}/api/public/lesson-packages`)
  if (!res.ok) {
    throw new Error(`Failed to load lesson packages (${res.status})`)
  }
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.message || 'Failed to load lesson packages')
  }
  // Attach icon to each lesson based on specialty
  return (json.data || []).map((lesson) => ({
    ...lesson,
    icon: getIcon(lesson.specialty),
  }))
}