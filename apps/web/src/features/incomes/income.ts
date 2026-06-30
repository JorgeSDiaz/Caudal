/** The income object and its request/response shapes (the contract with the API). */

import type { components } from '@/api/schema'

export type Income = components['schemas']['IncomeResponse']
export type IncomePage = components['schemas']['IncomePageResponse']
export type CreateIncomeInput = components['schemas']['CreateIncomeRequest']
export type UpdateIncomeInput = components['schemas']['UpdateIncomeRequest']
