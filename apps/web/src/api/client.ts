import createClient from 'openapi-fetch'

import type { paths } from '@/api/schema'

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/** Type-safe API client generated from the backend's OpenAPI schema. */
export const api = createClient<paths>({ baseUrl })
