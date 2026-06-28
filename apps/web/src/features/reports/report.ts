/** The monthly report object and its parts as returned by the API. */

import type { components } from '@/api/schema'

export type MonthlyReport = components['schemas']['MonthlyReportResponse']
export type CategoryBreakdown = components['schemas']['CategoryBreakdownResponse']
export type SourceBreakdown = components['schemas']['SourceBreakdownResponse']
