import { useEffect, useState } from 'react'
import { getCountryDataList } from 'countries-list'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CACHE_KEY = 'caudal.location-cities.v1'
const EMPTY_VALUE = '__none__'
const countryNames = new Intl.DisplayNames(['es'], { type: 'region' })
const countries = getCountryDataList()
  .map((country) => ({
    code: country.iso2,
    name: countryNames.of(country.iso2) ?? country.name,
  }))
  .sort((left, right) => left.name.localeCompare(right.name, 'es'))

type CityCache = Record<string, string[]>
type CitiesResponse = { error: boolean; data?: string[] }

function readCache(): CityCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? '{}') as CityCache
  } catch {
    return {}
  }
}

async function fetchCities(countryCode: string): Promise<string[]> {
  const cached = readCache()[countryCode]
  if (cached) return cached

  const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ iso2: countryCode }),
  })
  if (!response.ok) throw new Error('Failed to load cities')
  const payload = (await response.json()) as CitiesResponse
  if (payload.error || !payload.data) throw new Error('Failed to load cities')

  const cities = Array.from(new Set(payload.data)).sort((left, right) =>
    left.localeCompare(right, 'es'),
  )
  localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), [countryCode]: cities }))
  return cities
}

export default function LocationFields({
  countryCode,
  city,
  onCountryChange,
  onCityChange,
}: {
  countryCode: string
  city: string
  onCountryChange: (value: string) => void
  onCityChange: (value: string) => void
}) {
  const [cities, setCities] = useState<string[]>(() =>
    countryCode === '' ? [] : (readCache()[countryCode] ?? []),
  )
  const [isLoading, setIsLoading] = useState(countryCode !== '' && cities.length === 0)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    if (countryCode === '') return
    let active = true
    fetchCities(countryCode)
      .then((items) => { if (active) setCities(items) })
      .catch(() => { if (active) { setCities([]); setLoadFailed(true) } })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [countryCode])

  return (
    <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
      <div className="space-y-2">
        <Label>País <span className="text-muted-foreground font-normal">(opcional)</span></Label>
        <Select
          value={countryCode || EMPTY_VALUE}
          onValueChange={(value) => {
            onCountryChange(value === EMPTY_VALUE ? '' : value)
            onCityChange('')
            setCities([])
            setIsLoading(value !== EMPTY_VALUE)
            setLoadFailed(false)
          }}
        >
          <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Selecciona un país" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_VALUE}>Sin especificar</SelectItem>
            {countries.map((country) => <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs leading-5">Guardamos únicamente su código ISO.</p>
      </div>
      <div className="space-y-2">
        <Label>Ciudad <span className="text-muted-foreground font-normal">(opcional)</span></Label>
        <Select
          value={city || EMPTY_VALUE}
          disabled={countryCode === '' || isLoading || cities.length === 0}
          onValueChange={(value) => onCityChange(value === EMPTY_VALUE ? '' : value)}
        >
          <SelectTrigger className="h-11 w-full"><SelectValue placeholder="Selecciona una ciudad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_VALUE}>Sin especificar</SelectItem>
            {cities.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
        <p className={`text-xs leading-5 ${loadFailed ? 'text-destructive' : 'text-muted-foreground'}`}>
          {isLoading ? 'Cargando ciudades…' : loadFailed ? 'No se pudieron cargar las ciudades.' : countryCode === '' ? 'Selecciona primero un país.' : 'Lista guardada en este navegador para próximos usos.'}
        </p>
      </div>
    </div>
  )
}
