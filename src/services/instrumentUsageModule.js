/**
 * Instrument Usage Module (data surface).
 *
 * This module is the source-of-truth for instrument usage reporting data.
 * The Reports Module consumes this via the centralized DB selectors.
 */
const instrumentUsageRows = [
  {
    instrumentId: 'i1',
    instrumentName: 'Yamaha F310',
    availability: 'Available',
    usedInLessons: 12,
    usedInStudioBookings: 2,
    usedInRentals: 3,
    condition: 'Good',
    maintenanceActivities: 1,
    repairStatus: 'None',
    disposalStatus: 'Active',
  },
  {
    instrumentId: 'i2',
    instrumentName: 'Casio CT-X800',
    availability: 'Limited',
    usedInLessons: 8,
    usedInStudioBookings: 1,
    usedInRentals: 2,
    condition: 'Fair',
    maintenanceActivities: 2,
    repairStatus: 'In progress',
    disposalStatus: 'Active',
  },
  {
    instrumentId: 'i3',
    instrumentName: 'Yamaha Stage Custom',
    availability: 'Unavailable',
    usedInLessons: 3,
    usedInStudioBookings: 4,
    usedInRentals: 0,
    condition: 'Needs service',
    maintenanceActivities: 3,
    repairStatus: 'Queued',
    disposalStatus: 'Active',
  },
]

export function fetchInstrumentUsageModuleRows() {
  return [...instrumentUsageRows]
}

