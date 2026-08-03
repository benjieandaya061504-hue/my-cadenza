/**
 * Live lesson package data — fetched from the public API endpoint.
 * Replaces the previous hardcoded MOCK_PROGRAMS.
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

function slugify(name) {
  if (!name) return ''
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-')
}

function makePackageGroup(levelName) {
  if (!levelName) return 'General'
  return `${levelName} Packages`
}

/**
 * Fetch all active lesson packages from the public endpoint.
 * Returns a promise that resolves to the hierarchical program structure
 * (same shape the EnrollmentModal Step 1 expects).
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
  return transformPackages(json.data)
}

/**
 * Transform flat API response into hierarchical program structure.
 */
function transformPackages(data) {
  const programMap = new Map()

  data.forEach((pkg) => {
    const lessonName = pkg.lesson_name || 'Uncategorized'
    const programId = slugify(lessonName)
    const packageGroup = makePackageGroup(pkg.level_name)

    if (!programMap.has(programId)) {
      programMap.set(programId, {
        id: programId,
        name: lessonName,
        icon: getIcon(pkg.category),
        category: pkg.category || '',
        packageGroup,
        description: pkg.description || `${lessonName} lessons available.`,
        packages: [],
      })
    }

    const program = programMap.get(programId)
    program.packages.push({
      id: pkg.id,
      name: pkg.package_name,
      packageGroup,
      rate: Number(pkg.fee),
      sessionLimit: pkg.total_session || 4,
      sessionsPerWeek: pkg.sessions_per_week || 1,
      durationMinutes: 45,
      description: pkg.description || '',
      instructors: (pkg.instructors || []).map((inst) => ({
        id: inst.id,
        first_name: inst.first_name,
        last_name: inst.last_name,
        specialization: inst.specialization,
      })),
    })
  })

  return Array.from(programMap.values())
}