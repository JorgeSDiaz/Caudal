import { lazy, Suspense, type FormEvent, useState } from 'react'
import {
  Braces,
  Building2,
  CircleUserRound,
  Flag,
  HeartHandshake,
  Info,
  Landmark,
  Lightbulb,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Users,
  WalletCards,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Profile, UpdateProfileInput } from '@/features/profile/profile'
import { formatMinorUnits } from '@/shared/money'

type GoalDraft = { name: string; amount: string; date: string }

const LocationFields = lazy(() => import('@/features/profile/components/location-fields'))

function optionalNumber(value: string): number | null {
  if (value === '') return null
  const number = Number(value)
  return Number.isSafeInteger(number) && number >= 0 ? number : null
}

function amountDisplay(value: string): string {
  return value === '' ? '' : formatMinorUnits(Number(value))
}

function parseMetadata(value: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export function ProfileForm({
  profile,
  save,
}: {
  profile: Profile
  save: (input: UpdateProfileInput) => Promise<Profile>
}) {
  const [alias, setAlias] = useState(profile.alias ?? '')
  const [birthYear, setBirthYear] = useState(profile.birth_year?.toString() ?? '')
  const [city, setCity] = useState(profile.city ?? '')
  const [countryCode, setCountryCode] = useState(profile.country_code ?? '')
  const [income, setIncome] = useState(profile.estimated_monthly_income?.toString() ?? '')
  const [expenses, setExpenses] = useState(profile.estimated_monthly_expenses?.toString() ?? '')
  const [incomeType, setIncomeType] = useState<NonNullable<Profile['income_type']> | ''>(profile.income_type ?? '')
  const [dependents, setDependents] = useState(profile.dependents_count?.toString() ?? '')
  const [housing, setHousing] = useState<NonNullable<Profile['housing']> | ''>(profile.housing ?? '')
  const [riskTolerance, setRiskTolerance] = useState<NonNullable<Profile['risk_tolerance']> | ''>(profile.risk_tolerance ?? '')
  const [concerns, setConcerns] = useState(profile.concerns.join(', '))
  const [goals, setGoals] = useState<GoalDraft[]>(() =>
    profile.goals.map((goal) => ({
      name: goal.name,
      amount: goal.target_amount?.toString() ?? '',
      date: goal.target_date ?? '',
    })),
  )
  const [metadata, setMetadata] = useState(() => JSON.stringify(profile.metadata, null, 2))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parsedMetadata = parseMetadata(metadata)
  const parsedBirthYear = optionalNumber(birthYear)
  const parsedDependents = optionalNumber(dependents)
  const invalidGoal = goals.some(
    (goal) => goal.name.trim() === '' || (goal.amount !== '' && optionalNumber(goal.amount) === null),
  )
  const invalidYear =
    birthYear !== '' &&
    (parsedBirthYear === null || parsedBirthYear < 1900 || parsedBirthYear > 2100)
  const canSubmit = !isSubmitting

  function updateGoal(index: number, changes: Partial<GoalDraft>) {
    setGoals((current) =>
      current.map((goal, goalIndex) => (goalIndex === index ? { ...goal, ...changes } : goal)),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (invalidYear) {
      toast.error('Revisa el año de nacimiento', {
        description: 'Debe estar entre 1900 y 2100.',
      })
      return
    }
    if (invalidGoal) {
      toast.error('Revisa tus objetivos', {
        description: 'Cada meta necesita un nombre y un monto válido si lo especificas.',
      })
      return
    }
    if (parsedMetadata === null) {
      toast.error('Revisa la metadata avanzada', {
        description: 'Debe ser un objeto JSON válido.',
      })
      return
    }
    setIsSubmitting(true)
    try {
      await save({
        alias: alias.trim() || null,
        birth_year: parsedBirthYear,
        city: city.trim() || null,
        country_code: countryCode || null,
        estimated_monthly_income: optionalNumber(income),
        estimated_monthly_expenses: optionalNumber(expenses),
        income_type: incomeType === '' ? null : incomeType,
        dependents_count: parsedDependents,
        housing: housing === '' ? null : housing,
        risk_tolerance: riskTolerance === '' ? null : riskTolerance,
        concerns: concerns.split(',').map((value) => value.trim()).filter(Boolean),
        goals: goals.map((goal) => ({
          name: goal.name.trim(),
          target_amount: optionalNumber(goal.amount),
          target_date: goal.date || null,
        })),
        metadata: parsedMetadata,
      })
      toast.success('Perfil guardado')
    } catch {
      toast.error('No se pudo guardar el perfil')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      <section className="relative overflow-hidden rounded-3xl border border-teal-200/60 bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-800 px-6 py-7 text-white shadow-lg shadow-teal-950/10 sm:px-8 sm:py-9">
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 right-24 size-52 rounded-full bg-emerald-300/10 blur-2xl" />
        <div className="relative grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/20"><Sparkles className="size-5 text-emerald-200" /></div>
            <p className="mb-2 text-sm font-medium text-emerald-200">Tu contexto financiero</p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Una foto de quién eres y hacia dónde vas</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-teal-100/80">Completa solo lo que te resulte útil. Esta información ayuda a que los futuros insights hablen de tu realidad, no de promedios genéricos.</p>
          </div>
          <div className="hidden items-center gap-3 rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/15 lg:flex"><ShieldCheck className="size-5 text-emerald-200" /><p className="max-w-44 text-xs leading-5 text-teal-50/80">Todo es opcional y puedes cambiarlo cuando quieras.</p></div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        <div className="space-y-5">
          <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70">
            <SectionHeader icon={CircleUserRound} eyebrow="Sobre ti" title="Identidad" description="Solo el contexto que quieras compartir." tone="teal" />
            <CardContent className="grid gap-4 px-6 pb-5 md:grid-cols-2">
              <Field label="¿Cómo te llamamos?" id="alias"><Input id="alias" className="h-11" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Tu nombre o alias preferido" /></Field>
              <Field label="Año de nacimiento" id="birth-year" hint="Nos ayuda a entender el horizonte de tus metas."><Input id="birth-year" className="h-11" inputMode="numeric" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ''))} placeholder="Ej. 1992" /></Field>
              <Suspense fallback={<div className="bg-muted/40 h-24 animate-pulse rounded-xl md:col-span-2" />}><LocationFields countryCode={countryCode} city={city} onCountryChange={setCountryCode} onCityChange={setCity} /></Suspense>
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70">
            <SectionHeader icon={Landmark} eyebrow="Tu punto de partida" title="Línea base mensual" description="Una estimación está bien; podrás ajustarla en cualquier momento." tone="amber" />
            <CardContent className="space-y-5 px-6 pb-5">
              <div className="grid gap-4 md:grid-cols-2">
                <MoneyField icon={WalletCards} label="Ingresos estimados" id="income" value={income} onChange={setIncome} placeholder="Lo que esperas recibir al mes" />
                <MoneyField icon={Building2} label="Egresos estimados" id="expenses" value={expenses} onChange={setExpenses} placeholder="Lo que esperas gastar al mes" />
              </div>
              <div className="space-y-3"><div className="flex items-center gap-1.5"><Label>¿Cómo recibes tus ingresos? <Optional /></Label><InfoHint label="¿Qué significa el tipo de ingreso?">Fijo: recibes una cantidad predecible. Variable: el monto cambia cada mes. Mixto: combinas una base estable con ingresos variables.</InfoHint></div><ChoicePills value={incomeType} onChange={setIncomeType} options={[['fixed', 'Fijo'], ['variable', 'Variable'], ['mixed', 'Mixto']]} /></div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Personas a cargo" id="dependents"><div className="relative"><Users className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" /><Input id="dependents" className="h-11 pl-9" inputMode="numeric" value={dependents} onChange={(e) => setDependents(e.target.value.replace(/\D/g, ''))} placeholder="Ej. 2" /></div></Field>
                <div className="space-y-3"><Label>Situación de vivienda <Optional /></Label><ChoicePills value={housing} onChange={setHousing} options={[['rent', 'Arriendo'], ['owned', 'Propia'], ['family', 'Familiar']]} /></div>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70">
            <SectionHeader icon={Target} eyebrow="Lo que quieres construir" title="Objetivos" description="Ponle nombre a tus próximas metas; monto y mes objetivo son opcionales." tone="violet" action={goals.length > 0 ? <Button type="button" className="bg-violet-600 text-white shadow-sm hover:bg-violet-700" onClick={() => setGoals((current) => [...current, { name: '', amount: '', date: '' }])}><Plus />Agregar meta</Button> : undefined} />
            <CardContent className="space-y-3 px-6 pb-5">
              {goals.length === 0 && <button type="button" onClick={() => setGoals([{ name: '', amount: '', date: '' }])} className="group flex w-full flex-col items-center rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-100 via-violet-50 to-fuchsia-50 px-6 py-10 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"><span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/20 transition-transform group-hover:scale-105"><Flag className="size-5" /></span><span className="font-semibold text-violet-950">Agrega tu primera meta</span><span className="mt-1 max-w-sm text-sm text-violet-900/65">Un fondo de emergencia, un viaje, salir de deudas o cualquier objetivo que sea importante para ti.</span></button>}
              {goals.map((goal, index) => <div key={index} className="grid gap-3 rounded-2xl border bg-muted/20 p-4 md:grid-cols-2"><div className="md:col-span-2"><div className="mb-2 flex items-center justify-between gap-3"><Label>¿Qué quieres lograr?</Label><Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mr-2 size-8 shrink-0" aria-label={`Quitar objetivo ${index + 1}`} onClick={() => setGoals((current) => current.filter((_, goalIndex) => goalIndex !== index))}><Trash2 /></Button></div><Input className="h-11 bg-background" aria-label={`Nombre del objetivo ${index + 1}`} value={goal.name} onChange={(e) => updateGoal(index, { name: e.target.value })} placeholder="Ej. Crear un fondo de emergencia" /></div><div className="space-y-2"><Label htmlFor={`goal-amount-${index}`}>Monto objetivo <Optional /></Label><Input id={`goal-amount-${index}`} className="h-11 bg-background" aria-label={`Monto del objetivo ${index + 1}`} inputMode="numeric" value={amountDisplay(goal.amount)} onChange={(e) => updateGoal(index, { amount: e.target.value.replace(/\D/g, '') })} placeholder="Ej. $ 5.000.000" /></div><div className="space-y-2"><Label htmlFor={`goal-month-${index}`}>Mes objetivo <Optional /></Label><Input id={`goal-month-${index}`} className="h-11 bg-background" aria-label={`Mes objetivo ${index + 1}`} type="month" value={goal.date} onChange={(e) => updateGoal(index, { date: e.target.value })} /></div></div>)}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="gap-0 overflow-hidden border-0 py-0 shadow-sm ring-1 ring-border/70 xl:sticky xl:top-6">
            <SectionHeader icon={HeartHandshake} eyebrow="Cómo decides" title="Prioridades" description="Lo que hoy ocupa espacio en tu cabeza." tone="rose" />
            <CardContent className="space-y-5 px-6 pb-5">
              <Field label="¿Qué te preocupa?" id="concerns" hint="Separa cada tema con una coma."><Input id="concerns" className="h-11" value={concerns} onChange={(e) => setConcerns(e.target.value)} placeholder="Deudas, ahorro, estabilidad…" /></Field>
              <div className="space-y-3"><div className="flex items-center gap-1.5"><Label>Tolerancia al riesgo <Optional /></Label><InfoHint label="¿Qué es la tolerancia al riesgo?">Indica qué tan cómodo te sientes ante posibles pérdidas o variaciones a cambio de buscar un mayor rendimiento.</InfoHint></div><ChoicePills value={riskTolerance} onChange={setRiskTolerance} options={[['low', 'Baja'], ['medium', 'Media'], ['high', 'Alta']]} /></div>
              <div className="rounded-2xl bg-rose-50 p-4 text-rose-950"><div className="flex gap-3"><Lightbulb className="mt-0.5 size-5 shrink-0 text-rose-500" /><p className="text-xs leading-5 text-rose-900/70">No hay respuestas correctas. Esto solo permite interpretar recomendaciones desde tu comodidad y tus prioridades.</p></div></div>
            </CardContent>
          </Card>

          <details className="group overflow-hidden rounded-2xl border bg-card shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4"><span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Braces className="size-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium">Metadata avanzada</span><span className="text-muted-foreground block truncate text-xs">Contexto JSON para integraciones futuras</span></span><span className="text-muted-foreground text-xs group-open:hidden">Mostrar</span><span className="text-muted-foreground hidden text-xs group-open:inline">Ocultar</span></summary>
            <div className="border-t px-5 py-4"><Label htmlFor="metadata">Objeto JSON</Label><textarea id="metadata" value={metadata} onChange={(e) => setMetadata(e.target.value)} spellCheck={false} className="border-input bg-muted/30 mt-2 min-h-40 w-full rounded-xl border p-3 font-mono text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]" />{parsedMetadata === null && <p className="text-destructive mt-2 text-sm">Ingresa un objeto JSON válido; no se permiten listas ni valores escalares.</p>}</div>
          </details>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/90 px-4 py-3 shadow-[0_-8px_30px_rgb(0_0_0/0.06)] backdrop-blur md:left-[4.5rem]"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4"><p className="text-muted-foreground hidden text-sm sm:block">Tu perfil es privado, opcional y siempre editable.</p><Button type="submit" size="lg" className="ml-auto min-w-40 shadow-sm" disabled={!canSubmit}>{isSubmitting ? 'Guardando…' : 'Guardar cambios'}</Button></div></div>
    </form>
  )
}

function Optional() { return <span className="text-muted-foreground font-normal">(opcional)</span> }

function InfoHint({ label, children }: { label: string; children: React.ReactNode }) {
  return <span className="group relative inline-flex"><button type="button" aria-label={label} className="text-muted-foreground hover:text-foreground focus-visible:text-foreground rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"><Info className="size-4" /></button><span role="tooltip" className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-72 -translate-x-1/2 rounded-xl border px-3 py-2.5 text-xs leading-5 shadow-lg group-hover:block group-focus-within:block">{children}</span></span>
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label} <Optional /></Label>{children}{hint && <p className="text-muted-foreground text-xs leading-5">{hint}</p>}</div>
}

function SectionHeader({ icon: Icon, eyebrow, title, description, tone, action }: { icon: React.ComponentType<{ className?: string }>; eyebrow: string; title: string; description: string; tone: 'teal' | 'amber' | 'violet' | 'rose'; action?: React.ReactNode }) {
  const colors = { teal: 'bg-teal-50 text-teal-700', amber: 'bg-amber-50 text-amber-700', violet: 'bg-violet-50 text-violet-700', rose: 'bg-rose-50 text-rose-700' }
  return <CardHeader className="flex-row flex-wrap items-start gap-3 px-6 py-5"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="size-5" /></span><div className="min-w-52 flex-1"><p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wider">{eyebrow}</p><CardTitle className="text-lg">{title}</CardTitle><CardDescription className="mt-1 leading-5">{description}</CardDescription></div>{action}</CardHeader>
}

function ChoicePills<T extends string>({ value, onChange, options }: { value: T | ''; onChange: (value: T | '') => void; options: [T, string][] }) {
  return <div className="flex flex-wrap gap-2"><button type="button" onClick={() => onChange('')} className={`rounded-full border px-3.5 py-2 text-sm transition-all ${value === '' ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>Sin especificar</button>{options.map(([option, label]) => <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-full border px-3.5 py-2 text-sm transition-all ${value === option ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>{label}</button>)}</div>
}

function MoneyField({ icon: Icon, label, id, value, onChange, placeholder }: { icon: React.ComponentType<{ className?: string }>; label: string; id: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="rounded-2xl border bg-gradient-to-br from-amber-50/70 to-background p-4"><div className="mb-3 flex items-center gap-2 text-sm font-medium"><span className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Icon className="size-4" /></span>{label} <Optional /></div><Input id={id} aria-label={label} className="h-12 bg-background text-base font-semibold tabular-nums" inputMode="numeric" value={amountDisplay(value)} onChange={(event) => onChange(event.target.value.replace(/\D/g, ''))} placeholder={placeholder} /></div>
}
