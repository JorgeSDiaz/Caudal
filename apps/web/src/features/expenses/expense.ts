/** The expense object and its request/response shapes (the contract with the API). */

import type { components } from '@/api/schema'

export type Expense = components['schemas']['ExpenseResponse']
export type ExpensePage = components['schemas']['ExpensePageResponse']
export type CreateExpenseInput = components['schemas']['CreateExpenseRequest']
export type UpdateExpenseInput = components['schemas']['UpdateExpenseRequest']
