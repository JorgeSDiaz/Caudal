/** The recurrence object and its request/response shapes (the contract with the API). */

import type { components } from '@/api/schema'

export type Recurrence = components['schemas']['RecurrenceResponse']
export type CreateRecurrenceInput = components['schemas']['CreateRecurrenceRequest']
export type UpdateRecurrenceInput = components['schemas']['UpdateRecurrenceRequest']
export type RecurrenceKind = Recurrence['kind']
export type Frequency = Recurrence['frequency']
